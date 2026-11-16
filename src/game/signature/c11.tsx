'use client';

import './c11.css';
import { useEffect, useRef, useState } from 'react';
import type { SignatureProps } from './list';
import { sfx } from '../sound';

/**
 * 11 · "La salle de contrôle" — a trace viewer as an instrument panel. One failed request
 * (case 12) is a timeline of five spans. Four readings, each computed from SPANS:
 *  1. scrub backwards from the wrong answer and mark the first span where it went wrong;
 *  2. mark the slow span; 3. mark the span that costs most tokens, then the block that is
 *  billed again at every turn; 4. black out what must never be written, keep what debugs.
 */

type L = { fr: string; en: string };
type Lens = 'content' | 'ms' | 'tok';
type Block = 'sys' | 'ask' | 'tools' | 'prev';

interface Span {
  turn: number;
  kind: 'model' | 'tool';
  name: string;
  ms: number;
  error?: boolean;
  /** Input tokens by block (model calls only): what is sent again at this turn. */
  input?: Partial<Record<Block, number>>;
  out?: number;
  got: L;
  made: L;
}

// Illustrative figures for case 12 of the programme (brief for Inès Caron, Brume & Quai).
const SPANS: Span[] = [
  { turn: 1, kind: 'model', name: 'modele', ms: 310, input: { sys: 2000, ask: 100 }, out: 60,
    got: { fr: 'consigne + demande : brief Brume & Quai, jeudi 10 h', en: 'instructions + request: brief on Brume & Quai, jeudi 10 h' },
    made: { fr: 'demande deux outils : chercher, lire_devis', en: 'asks for two tools: chercher, lire_devis' } },
  { turn: 2, kind: 'tool', name: 'chercher', ms: 4020,
    got: { fr: 'arguments : « Brume & Quai »', en: 'arguments: “Brume & Quai”' },
    made: { fr: '3 mails d’Inès Caron trouvés', en: '3 emails from Inès Caron found' } },
  { turn: 3, kind: 'tool', name: 'lire_devis', ms: 300, error: true,
    got: { fr: 'arguments : devis Brume & Quai', en: 'arguments: Brume & Quai quote' },
    made: { fr: 'erreur : délai dépassé. Aucun résultat.', en: 'error: timeout. No result.' } },
  { turn: 4, kind: 'model', name: 'modele', ms: 330, input: { sys: 2000, ask: 100, tools: 740, prev: 60 }, out: 80,
    got: { fr: '3 mails ; devis : (vide)', en: '3 emails; quote: (empty)' },
    made: { fr: 'prépare le brief, sans signaler le devis manquant', en: 'drafts the brief, without flagging the missing quote' } },
  { turn: 5, kind: 'model', name: 'final', ms: 290, input: { sys: 2000, ask: 100, tools: 740, prev: 140 }, out: 220,
    got: { fr: 'tout l’historique des tours 1 à 4', en: 'the whole history of turns 1 to 4' },
    made: { fr: '« Brief : jeudi 10 h. Budget : à confirmer. »', en: '“Brief: jeudi 10 h. Budget: to be confirmed.”' } },
];
const BLOCKS: Block[] = ['sys', 'ask', 'tools', 'prev'];
const inTok = (s: Span) => BLOCKS.reduce((a, b) => a + (s.input?.[b] ?? 0), 0);
const tok = (s: Span) => inTok(s) + (s.out ?? 0);
const TOTAL_MS = SPANS.reduce((a, s) => a + s.ms, 0);
const MAX_MS = Math.max(...SPANS.map((s) => s.ms));
const MAX_TOK = Math.max(...SPANS.map(tok));
const MODEL_CALLS = SPANS.filter((s) => s.kind === 'model');
const TOTAL_IN = MODEL_CALLS.reduce((a, s) => a + inTok(s), 0);
/** Tokens billed for a block over the whole case, and how many times it was sent. */
const billed = (b: Block) => MODEL_CALLS.reduce((a, s) => a + (s.input?.[b] ?? 0), 0);
const sends = (b: Block) => MODEL_CALLS.filter((s) => s.input?.[b]).length;

// Answers, derived from the trace rather than written down.
const FIRST_FAULT = SPANS.findIndex((s) => s.error);
const SLOWEST = SPANS.findIndex((s) => s.ms === MAX_MS);
const COSTLIEST = SPANS.findIndex((s) => tok(s) === MAX_TOK);
const HEAVIEST_RESENT = BLOCKS.filter((b) => sends(b) === MODEL_CALLS.length).sort((a, b) => billed(b) - billed(a))[0];

interface Field { id: string; key: string; value: string; secret?: boolean }
// The line about to be written for turn 3. Key, IBAN and phone number are fictitious.
const FIELDS: Field[] = [
  { id: 'cas', key: 'cas', value: '12' },
  { id: 'tour', key: 'tour', value: '3' },
  { id: 'outil', key: 'outil', value: 'lire_devis' },
  { id: 'key', key: 'en_tete', value: 'x-api-key: CLE-FICTIVE-4F9A', secret: true },
  { id: 'iban', key: 'iban_client', value: 'FR76 1234 5678 9012 3456', secret: true },
  { id: 'tel', key: 'tel_prive', value: '06 39 98 12 34', secret: true },
  { id: 'ms', key: 'duree_ms', value: '300' },
  { id: 'err', key: 'erreur', value: 'délai dépassé' },
];

const num = (n: number, lang: 'fr' | 'en') => n.toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US').replace(/[  ]/g, ' ');
const sec = (ms: number, lang: 'fr' | 'en') => (ms / 1000).toFixed(1).replace('.', lang === 'fr' ? ',' : '.');

const T = {
  fr: {
    title: 'Trace · cas 12', sim: 'chiffres illustratifs',
    stages: ['Cause', 'Lenteur', 'Coût', 'Journal'],
    lens: { content: 'Contenu', ms: 'Durées', tok: 'Tokens' } as Record<Lens, string>,
    lensLabel: 'Affichage du tableau',
    turn: 'tour', model: 'modèle', tool: 'outil', got: 'reçu', made: 'produit', hidden: 'pas encore lu',
    back: 'Remonter', fwd: 'Avancer', backAria: 'Remonter d’un tour', fwdAria: 'Avancer d’un tour',
    spanAria: (n: number, name: string) => `Tour ${n}, ${name}`,
    g: [
      'Le brief sort sans budget. Remonte tour par tour depuis la fin, et marque le premier tour où tout bascule.',
      `La réponse a mis ${sec(TOTAL_MS, 'fr')} s. Passe sur « Durées » et marque le tour qui prend ce temps.`,
      'Passe sur « Tokens » et marque le tour qui en coûte le plus.',
      'Trois appels au modèle. Quel bloc est refacturé à chaque tour et pèse le plus lourd ?',
      'Avant d’écrire la ligne : noircis ce qui ne doit jamais figurer dans une trace. Garde ce qui sert à déboguer.',
      'Cause trouvée, lenteur localisée, coût expliqué, ligne écrite sans secret. La trace peut être partagée.',
    ],
    mark: ['Marquer : tout bascule ici', 'Marquer : le tour lent', 'Marquer : le plus coûteux'],
    s0: {
      ok: 'Tour 3 : lire_devis, délai dépassé. Le budget n’est jamais arrivé ; les tours 4 et 5 ont fait sans.',
      symptom: 'C’est le symptôme, pas la cause. Remonte.',
      paper: 'Le modèle a continué avec un devis vide, sans le dire. Mais d’où vient le vide ? Remonte encore.',
      fine: 'Ici tout va bien : le tour a rendu ce qu’on attendait. La bascule est plus bas.',
    },
    s1: {
      ok: (ms: number) => `chercher : ${sec(ms, 'fr')} s sur ${sec(TOTAL_MS, 'fr')}. La lenteur vient d’un outil, pas du modèle.`,
      timeout: '« Délai dépassé », mais en 300 ms. Lis la durée, pas le mot.',
      model: (ms: number) => `Les trois appels au modèle font ${sec(ms, 'fr')} s en tout. L’accuser serait une erreur.`,
    },
    s2: {
      ok: (n: number) => `Le dernier appel : ${num(n, 'fr')} tokens. Il relit tout ce qui précède.`,
      tool: 'Un outil coûte du temps, pas des tokens : 0 ici.',
      less: (n: number, max: number) => `${num(n, 'fr')} tokens : moins que les ${num(max, 'fr')} d’un autre tour.`,
    },
    bill: 'Entrée de chaque appel au modèle',
    blocks: { sys: 'Consigne fixe', ask: 'Demande', tools: 'Résultats d’outils', prev: 'Réponses précédentes' } as Record<Block, string>,
    s3: {
      ok: (n: number, k: number, total: number) => `Consigne : ${num(n / k, 'fr')} × ${k} = ${num(n, 'fr')} tokens sur ${num(total, 'fr')} d’entrée. Tout l’historique repart à chaque tour ; un début identique peut être lu en cache à prix réduit.`,
      notAll: (k: number) => `Ce bloc n’est envoyé que ${k} fois sur 3 : il n’existe pas encore au premier tour.`,
      light: (n: number) => `Renvoyé à chaque tour, oui, mais ${num(n, 'fr')} tokens en tout : ce n’est pas le poids lourd.`,
    },
    desk: 'Ligne à écrire dans traces.jsonl', write: 'Écrire la ligne', fake: 'Clé, IBAN et numéro fictifs.',
    next: 'Passer au journal', copies: ['tableau partagé', 'ticket', 'sauvegarde'],
    fieldAria: (k: string, on: boolean) => `${k} : ${on ? 'masqué, toucher pour démasquer' : 'toucher pour masquer'}`,
    s4: {
      ok: 'Ligne écrite : ni clé, ni IBAN, ni numéro privé. Tour, outil, durée et erreur restent lisibles.',
      leak: {
        key: 'La trace part dans le tableau partagé : la clé d’API y est lisible par tous. Il faut la révoquer.',
        iban: 'La trace est copiée dans chaque sauvegarde : l’IBAN du client y reste, en clair.',
        tel: 'La trace est lue par toute l’équipe : le numéro privé d’Inès Caron aussi.',
      } as Record<string, string>,
      mute: (k: string) => `Trace écrite, mais muette : sans « ${k} », tu ne retrouves plus le tour 3.`,
    },
    log: 'traces.jsonl',
  },
  en: {
    title: 'Trace · case 12', sim: 'illustrative figures',
    stages: ['Cause', 'Slowness', 'Cost', 'Log'],
    lens: { content: 'Content', ms: 'Durations', tok: 'Tokens' } as Record<Lens, string>,
    lensLabel: 'Board display',
    turn: 'turn', model: 'model', tool: 'tool', got: 'received', made: 'produced', hidden: 'not read yet',
    back: 'Go back', fwd: 'Forward', backAria: 'Go back one turn', fwdAria: 'Go forward one turn',
    spanAria: (n: number, name: string) => `Turn ${n}, ${name}`,
    g: [
      'The brief comes out with no budget. Go back turn by turn from the end, and mark the first turn where it tips over.',
      `The answer took ${sec(TOTAL_MS, 'en')} s. Switch to “Durations” and mark the turn that takes that time.`,
      'Switch to “Tokens” and mark the turn that costs the most.',
      'Three model calls. Which block is billed again at every turn and weighs the most?',
      'Before writing the line: black out what must never appear in a trace. Keep what helps debugging.',
      'Cause found, slowness located, cost explained, line written with no secret. The trace can be shared.',
    ],
    mark: ['Mark: it tips over here', 'Mark: the slow turn', 'Mark: the costliest'],
    s0: {
      ok: 'Turn 3: lire_devis, timeout. The budget never arrived; turns 4 and 5 did without it.',
      symptom: 'This is the symptom, not the cause. Go back.',
      paper: 'The model carried on with an empty quote, without saying so. But where does the gap come from? Go further back.',
      fine: 'All is well here: the turn returned what was expected. The tipping point is further down.',
    },
    s1: {
      ok: (ms: number) => `chercher: ${sec(ms, 'en')} s out of ${sec(TOTAL_MS, 'en')}. The slowness comes from a tool, not the model.`,
      timeout: '“Timeout”, but in 300 ms. Read the duration, not the word.',
      model: (ms: number) => `The three model calls take ${sec(ms, 'en')} s in all. Blaming the model would be a mistake.`,
    },
    s2: {
      ok: (n: number) => `The last call: ${num(n, 'en')} tokens. It rereads everything before it.`,
      tool: 'A tool costs time, not tokens: 0 here.',
      less: (n: number, max: number) => `${num(n, 'en')} tokens: fewer than the ${num(max, 'en')} of another turn.`,
    },
    bill: 'Input of each model call',
    blocks: { sys: 'Fixed instructions', ask: 'Request', tools: 'Tool results', prev: 'Earlier answers' } as Record<Block, string>,
    s3: {
      ok: (n: number, k: number, total: number) => `Instructions: ${num(n / k, 'en')} × ${k} = ${num(n, 'en')} tokens out of ${num(total, 'en')} of input. The whole history is sent again at every turn; an identical start can be read from cache at a reduced price.`,
      notAll: (k: number) => `This block is only sent ${k} times out of 3: it does not exist yet at the first turn.`,
      light: (n: number) => `Sent again at every turn, yes, but ${num(n, 'en')} tokens in all: not the heavyweight.`,
    },
    desk: 'Line to write to traces.jsonl', write: 'Write the line', fake: 'Key, IBAN and number are fictitious.',
    next: 'On to the log', copies: ['shared dashboard', 'ticket', 'backup'],
    fieldAria: (k: string, on: boolean) => `${k}: ${on ? 'redacted, tap to reveal' : 'tap to redact'}`,
    s4: {
      ok: 'Line written: no key, no IBAN, no private number. Turn, tool, duration and error stay readable.',
      leak: {
        key: 'The trace goes to the shared dashboard: the API key is readable by everyone. It must be revoked.',
        iban: 'The trace is copied into every backup: the client’s IBAN stays there, in clear.',
        tel: 'The trace is read by the whole team: so is Inès Caron’s private number.',
      } as Record<string, string>,
      mute: (k: string) => `Trace written, but silent: without “${k}”, you can no longer find turn 3.`,
    },
    log: 'traces.jsonl',
  },
};

/** 0 cause · 1 slowness · 2 costliest span · 3 why (blocks) · 4 redaction · 5 won */
type Stage = 0 | 1 | 2 | 3 | 4 | 5;

export default function Game({ lang, onSolved, onMistake }: SignatureProps) {
  const t = T[lang];
  const last = SPANS.length - 1;
  const [stage, setStage] = useState<Stage>(0);
  const [cur, setCur] = useState(last);
  const [seen, setSeen] = useState(last); // lowest index read so far (stage 0 reveals backwards)
  const [lens, setLens] = useState<Lens>('content');
  const [masked, setMasked] = useState<string[]>([]);
  const [picked, setPicked] = useState<Block | null>(null);
  const [leak, setLeak] = useState<string | null>(null);
  const [fb, setFb] = useState<{ tone: 'ok' | 'err'; text: string; k: number } | null>(null);
  const timers = useRef<number[]>([]);
  const done = useRef(false);
  useEffect(() => () => timers.current.forEach((x) => window.clearTimeout(x)), []);

  const say = (tone: 'ok' | 'err', text: string) => {
    setFb((f) => ({ tone, text, k: (f?.k ?? 0) + 1 }));
    if (tone === 'err') {
      sfx('wrong');
      onMistake?.();
    } else sfx('correct');
  };
  const go = (i: number) => {
    if (i < 0 || i > last || stage > 2) return;
    setCur(i);
    setSeen((s) => Math.min(s, i));
    sfx('tick');
  };

  const mark = () => {
    const s = SPANS[cur];
    if (stage === 0) {
      if (cur === FIRST_FAULT) {
        say('ok', t.s0.ok);
        setStage(1);
      } else if (cur === last) say('err', t.s0.symptom);
      else if (cur > FIRST_FAULT) say('err', t.s0.paper);
      else say('err', t.s0.fine);
    } else if (stage === 1) {
      if (cur === SLOWEST) {
        say('ok', t.s1.ok(s.ms));
        setStage(2);
      } else if (s.error) say('err', t.s1.timeout);
      else say('err', t.s1.model(MODEL_CALLS.reduce((a, x) => a + x.ms, 0)));
    } else if (stage === 2) {
      if (cur === COSTLIEST) {
        say('ok', t.s2.ok(tok(s)));
        setStage(3);
        setLens('tok');
      } else if (s.kind === 'tool') say('err', t.s2.tool);
      else say('err', t.s2.less(tok(s), MAX_TOK));
    }
  };

  const pickBlock = (b: Block) => {
    if (stage !== 3 || picked === HEAVIEST_RESENT) return;
    setPicked(b);
    if (b === HEAVIEST_RESENT) {
      say('ok', t.s3.ok(billed(b), sends(b), TOTAL_IN));
    } else if (sends(b) < MODEL_CALLS.length) say('err', t.s3.notAll(sends(b)));
    else say('err', t.s3.light(billed(b)));
  };

  const toggle = (id: string) => {
    if (stage !== 4) return;
    setLeak(null);
    setMasked((m) => (m.includes(id) ? m.filter((x) => x !== id) : [...m, id]));
    sfx('select');
  };
  const write = () => {
    if (stage !== 4) return;
    const leaked = FIELDS.find((f) => f.secret && !masked.includes(f.id));
    const lost = FIELDS.find((f) => !f.secret && masked.includes(f.id));
    if (leaked) {
      setLeak(leaked.id);
      say('err', t.s4.leak[leaked.id]);
    } else if (lost) {
      setLeak(lost.id);
      say('err', t.s4.mute(lost.key));
    } else {
      setLeak(null);
      setFb((f) => ({ tone: 'ok', text: t.s4.ok, k: (f?.k ?? 0) + 1 }));
      setStage(5);
      sfx('solve');
      if (!done.current) {
        done.current = true;
        timers.current.push(window.setTimeout(onSolved, 700));
      }
    }
  };

  const guide = t.g[stage];
  const lamp = stage <= 1 ? stage : stage <= 3 ? 2 : 3; // which of the four pilot lights is active
  const showBoard = stage <= 3;
  const billDone = picked === HEAVIEST_RESENT;
  const leakedSecret = FIELDS.find((f) => f.id === leak && f.secret);
  const s = SPANS[cur];

  return (
    <div className="sg11" data-game="c11" data-stage={stage} data-solved={stage === 5 ? 'true' : undefined}>
      <p className="sg11-guide" aria-live="polite" data-testid="guide">{guide}</p>
      <div className="sg11-panel">
        <div className="sg11-bar">
          <p className="sg11-title">{t.title} <span>{t.sim}</span></p>
          <ol className="sg11-pilots">
            {t.stages.map((name, i) => (
              <li key={name} data-state={stage === 5 || i < lamp ? 'done' : i === lamp ? 'on' : 'off'} aria-current={i === lamp && stage < 5 ? 'step' : undefined}>
                <i aria-hidden="true" />{name}
              </li>
            ))}
          </ol>
        </div>

        {showBoard && (
          <>
            <div className="sg11-lens" role="group" aria-label={t.lensLabel}>
              {(['content', 'ms', 'tok'] as Lens[]).map((l) => (
                <button key={l} type="button" aria-pressed={lens === l} onClick={() => { setLens(l); sfx('select'); }} data-testid={`lens-${l}`}>{t.lens[l]}</button>
              ))}
            </div>

            <ol className="sg11-rail">
              {SPANS.map((sp, i) => {
                const read = stage > 0 || i >= seen;
                const tainted = stage > 0 && i >= FIRST_FAULT;
                const w = lens === 'ms' ? sp.ms / MAX_MS : lens === 'tok' ? tok(sp) / MAX_TOK : 0;
                const figure = lens === 'ms' ? `${num(sp.ms, lang)} ms` : lens === 'tok' ? `${num(tok(sp), lang)} tok` : '';
                const flagged = (stage > 0 && i === FIRST_FAULT) || (stage > 1 && i === SLOWEST) || (stage > 2 && i === COSTLIEST);
                return (
                  <li key={sp.turn}>
                    <button
                      type="button"
                      className={`sg11-span${i === cur ? ' is-cur' : ''}${read ? '' : ' is-unread'}${tainted ? ' is-tainted' : ''}${flagged ? ' is-flag' : ''}`}
                      data-kind={sp.kind}
                      data-error={read && sp.error ? 'true' : undefined}
                      onClick={() => go(i)}
                      disabled={stage > 2}
                      aria-current={i === cur ? 'true' : undefined}
                      aria-label={t.spanAria(sp.turn, read ? sp.name : t.hidden)}
                      data-testid={`span-${sp.turn}`}
                    >
                      <span className="sg11-turn">{sp.turn}</span>
                      <span className="sg11-glyph" aria-hidden="true" />
                      <span className="sg11-name">{read ? sp.name : '· · ·'}</span>
                      {read && lens !== 'content' && (
                        <span className="sg11-meter">
                          <span className="sg11-fill" style={{ transform: `scaleX(${Math.max(w, 0.012)})` }} />
                          <span className="sg11-fig">{figure}</span>
                        </span>
                      )}
                      {read && lens === 'content' && sp.error && <span className="sg11-err">{lang === 'fr' ? 'erreur' : 'error'}</span>}
                    </button>
                  </li>
                );
              })}
            </ol>

            {stage <= 2 && (
              <div className="sg11-scope" data-testid="scope">
                <p className="sg11-scope-head">
                  <b>{t.turn} {s.turn}</b> · {s.kind === 'model' ? t.model : `${t.tool} ${s.name}`}
                </p>
                <p><i>{t.got}</i>{s.got[lang]}</p>
                <p data-error={s.error ? 'true' : undefined}><i>{t.made}</i>{s.made[lang]}</p>
                <p className="sg11-scope-nums">{num(s.ms, lang)} ms · {s.kind === 'model' ? `${num(inTok(s), lang)} in + ${num(s.out ?? 0, lang)} out` : '0 tok'}</p>
              </div>
            )}

            {stage <= 2 && (
              <div className="sg11-ctrl">
                <button type="button" className="sg11-key" onClick={() => go(cur - 1)} disabled={cur === 0} aria-label={t.backAria} data-testid="back">
                  <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 3 3 9h10z" fill="currentColor" /></svg>{t.back}
                </button>
                <button type="button" className="sg11-key" onClick={() => go(cur + 1)} disabled={cur === last} aria-label={t.fwdAria} data-testid="fwd">
                  <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 13 3 7h10z" fill="currentColor" /></svg>{t.fwd}
                </button>
                <button type="button" className="sg11-key sg11-key--mark" onClick={mark} data-testid="mark">{t.mark[stage]}</button>
              </div>
            )}

            {stage === 3 && (
              <div className="sg11-bill">
                <p className="sg11-bill-title">{t.bill}</p>
                {MODEL_CALLS.map((m) => (
                  <div key={m.turn} className="sg11-stack">
                    <span className="sg11-stack-turn">{t.turn} {m.turn}</span>
                    <span className="sg11-stack-bar" style={{ transform: `scaleX(${inTok(m) / Math.max(...MODEL_CALLS.map(inTok))})` }}>
                      {BLOCKS.filter((b) => m.input?.[b]).map((b) => (
                        <span key={b} data-block={b} data-picked={picked === b ? 'true' : undefined} style={{ flexGrow: m.input![b] }} />
                      ))}
                    </span>
                    <span className="sg11-stack-n">{num(inTok(m), lang)}</span>
                  </div>
                ))}
                <div className="sg11-legend">
                  {BLOCKS.map((b) => (
                    <button key={b} type="button" onClick={() => pickBlock(b)} aria-pressed={picked === b} disabled={billDone && picked !== b} data-testid={`block-${b}`}>
                      <i data-block={b} aria-hidden="true" />{t.blocks[b]}
                    </button>
                  ))}
                </div>
                {billDone && (
                  <button type="button" className="sg11-key sg11-key--mark sg11-write" onClick={() => { setStage(4); setFb(null); sfx('open'); }} data-testid="next">{t.next}</button>
                )}
              </div>
            )}
          </>
        )}

        {!showBoard && (
          <div className="sg11-desk">
            <p className="sg11-desk-title">{t.desk}</p>
            <div className={`sg11-strip${stage === 5 ? ' is-written' : ''}`}>
              {FIELDS.map((f) => {
                const on = masked.includes(f.id);
                return (
                  <button
                    key={f.id}
                    type="button"
                    className={`sg11-field${on ? ' is-masked' : ''}${leak === f.id ? ' is-leak' : ''}`}
                    onClick={() => toggle(f.id)}
                    disabled={stage === 5}
                    aria-pressed={on}
                    aria-label={t.fieldAria(f.key, on)}
                    data-testid={`field-${f.id}`}
                  >
                    <span className="sg11-k">{f.key}</span>
                    <span className="sg11-v">
                      <span className="sg11-v-text">{f.value}</span>
                      <span className="sg11-ink" aria-hidden="true" />
                    </span>
                  </button>
                );
              })}
            </div>
            {leakedSecret && (
              <ul className="sg11-copies" aria-hidden="true">
                {t.copies.map((c) => (
                  <li key={c}><b>{c}</b><span>{leakedSecret.value}</span></li>
                ))}
              </ul>
            )}
            <p className="sg11-fake">{t.fake}</p>
            {stage === 4 ? (
              <button type="button" className="sg11-key sg11-key--mark sg11-write" onClick={write} data-testid="write">{t.write}</button>
            ) : (
              <p className="sg11-logged"><span aria-hidden="true" />{t.log}</p>
            )}
          </div>
        )}
      </div>

      <p className="sg11-fb" role="status" aria-live="polite" data-tone={fb?.tone} data-testid="feedback"><span key={fb?.k}>{fb?.text}</span></p>
    </div>
  );
}
