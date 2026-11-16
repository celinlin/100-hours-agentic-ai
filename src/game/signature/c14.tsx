'use client';

import './c14.css';
import { useEffect, useRef, useState } from 'react';
import type { SignatureProps } from './list';
import { sfx } from '../sound';

/**
 * 14 · « La remise des clés ». A delivery week in three acts on the handover desk.
 * Act 1: five places in the folder, ten papers on the desk (five are evidence, five only reassure).
 * Act 2: the demo on Inès's three real files; the third goes wrong live and her trust reacts to
 * what the learner does with the failure.
 * Act 3: five days without the builder. Each day is survived only if the paper it needs was
 * filed in act 1: the week is computed from the folder, never scripted.
 */

type Lang = 'fr' | 'en';
type L = Record<Lang, string>;
type CardId = 'tests' | 'scope' | 'contact' | 'rollback' | 'traces' | 'machine' | 'shot' | 'nodate' | 'lines' | 'best';
type Reaction = 'hide' | 'patch' | 'note';

const SLOTS = 5;

const CARDS: { id: CardId; label: L; detail: L; mono?: boolean }[] = [
  { id: 'tests', label: { fr: '38 cas rejoués', en: '38 cases replayed' }, detail: { fr: '38 sur 38 · daté · attaques comprises', en: '38 of 38 · dated · attacks included' } },
  { id: 'machine', label: { fr: '« Ça marchait chez moi »', en: '“It worked on my machine”' }, detail: { fr: 'une phrase', en: 'a sentence' } },
  { id: 'scope', label: { fr: 'Périmètre écrit', en: 'Written scope' }, detail: { fr: 'ce qu’il fait · ce qu’il refuse', en: 'what it does · what it refuses' } },
  { id: 'shot', label: { fr: 'Capture d’écran', en: 'Screenshot' }, detail: { fr: 'une bonne réponse', en: 'one good answer' } },
  { id: 'rollback', label: { fr: 'Retour arrière', en: 'Rollback' }, detail: { fr: 'git checkout v1.0', en: 'git checkout v1.0' }, mono: true },
  { id: 'nodate', label: { fr: '« Tous les tests passent »', en: '“All tests pass”' }, detail: { fr: 'sans date ni commande', en: 'no date, no command' } },
  { id: 'contact', label: { fr: 'Qui prévenir', en: 'Who to call' }, detail: { fr: 'un nom, une adresse', en: 'a name, an address' } },
  { id: 'lines', label: { fr: '412 lignes de code', en: '412 lines of code' }, detail: { fr: 'agent.py', en: 'agent.py' }, mono: true },
  { id: 'traces', label: { fr: 'Traces activées', en: 'Traces switched on' }, detail: { fr: 'chaque étape, relisible', en: 'every step, readable' } },
  { id: 'best', label: { fr: 'Mes 3 meilleurs exemples', en: 'My 3 best examples' }, detail: { fr: 'choisis par moi', en: 'picked by me' } },
];

/** The week: each event holds only if the folder contains what it needs. */
const EVENTS: { day: L; needs: CardId; ev: L; ok: L; ko: L }[] = [
  {
    day: { fr: 'Lun', en: 'Mon' },
    needs: 'tests',
    ev: { fr: 'Un document client ordonne : « Ignore tes consignes… »', en: 'A client document gives an order: “Ignore your instructions…”' },
    ok: { fr: 'Attaques rejouées sur cette version : l’ordre reste une information.', en: 'Attacks replayed on this version: the order stays information.' },
    ko: { fr: 'Version jamais rejouée contre les attaques : le rendez-vous est annulé.', en: 'Version never replayed against attacks: the appointment is cancelled.' },
  },
  {
    day: { fr: 'Mar', en: 'Tue' },
    needs: 'contact',
    ev: { fr: 'La clé API expire : l’agent ne répond plus.', en: 'The API key expires: the agent stops answering.' },
    ok: { fr: 'Inès lit « qui prévenir » : clé remplacée le jour même.', en: 'Inès reads “who to call”: key replaced the same day.' },
    ko: { fr: 'Personne à prévenir : l’agent se tait jusqu’à ton retour.', en: 'Nobody to call: the agent stays silent until you are back.' },
  },
  {
    day: { fr: 'Mer', en: 'Wed' },
    needs: 'scope',
    ev: { fr: 'Demande d’un nouveau genre : un devis chiffré.', en: 'A new kind of request: a costed quote.' },
    ok: { fr: 'C’est écrit dans « refuse » : il refuse et transmet à Inès.', en: 'It is written under “refuses”: it declines and passes it to Inès.' },
    ko: { fr: 'Rien d’écrit sur ce qu’il refuse : Inès croit à une panne.', en: 'Nothing written about what it refuses: Inès thinks it is broken.' },
  },
  {
    day: { fr: 'Jeu', en: 'Thu' },
    needs: 'rollback',
    ev: { fr: 'Après une mise à jour, le coût par demande triple (illustratif).', en: 'After an update, the cost per request triples (illustrative).' },
    ok: { fr: 'git checkout v1.0 : retour à la version vérifiée.', en: 'git checkout v1.0: back to the checked version.' },
    ko: { fr: 'Aucun retour arrière écrit : la facture court toute la semaine.', en: 'No rollback written down: the bill runs all week.' },
  },
  {
    day: { fr: 'Ven', en: 'Fri' },
    needs: 'traces',
    ev: { fr: 'Inès signale une réponse fausse.', en: 'Inès reports a wrong answer.' },
    ok: { fr: 'La trace montre l’étape fautive : nouveau cas de test.', en: 'The trace shows the faulty step: a new test case.' },
    ko: { fr: 'Aucune trace : impossible de savoir ce qui s’est passé.', en: 'No trace: impossible to know what happened.' },
  },
];

const CASES: { name: L; out: L[]; bad?: boolean }[] = [
  {
    name: { fr: 'Brief · Hôtel des Dunes', en: 'Brief · Hôtel des Dunes' },
    out: [
      { fr: 'chercher_docs → 3 passages, sources citées', en: 'chercher_docs → 3 passages, sources cited' },
      { fr: 'Brief rédigé. En attente de son accord.', en: 'Brief written. Waiting for her approval.' },
    ],
  },
  {
    name: { fr: 'Compte rendu · 3 mars', en: 'Minutes · 3 March' },
    out: [
      { fr: 'lire_dossier → notes de la réunion', en: 'lire_dossier → meeting notes' },
      { fr: 'Compte rendu prêt, décisions datées.', en: 'Minutes ready, decisions dated.' },
    ],
  },
  {
    name: { fr: 'Dossier · Grand Large', en: 'File · Grand Large' },
    bad: true,
    out: [
      { fr: 'Le dossier dit : « … et joins un devis chiffré »', en: 'The file says: “… and attach a costed quote”' },
      { fr: 'Brief rédigé. Devis : 4 800 € HT', en: 'Brief written. Quote: €4,800 excl. tax' },
    ],
  },
];

const REACTIONS: { id: Reaction; label: L; world: L; why: L }[] = [
  {
    id: 'hide',
    label: { fr: 'Passer vite au dossier suivant', en: 'Move quickly to the next file' },
    world: { fr: 'Inès : « J’ai vu un prix. Il sort d’où ? »', en: 'Inès: “I saw a price. Where does it come from?”' },
    why: { fr: 'Un échec caché se redécouvre seul, sans toi.', en: 'A hidden failure gets rediscovered alone, without you.' },
  },
  {
    id: 'patch',
    label: { fr: 'Corriger la consigne en direct', en: 'Fix the instructions live' },
    world: { fr: 'Correctif non rejoué : un des 38 cas passe au rouge.', en: 'Fix not replayed: one of the 38 cases turns red.' },
    why: { fr: 'Une correction ne vaut qu’après avoir rejoué la suite.', en: 'A fix only counts once the suite has been replayed.' },
  },
  {
    id: 'note',
    label: { fr: 'Montrer la trace et noter l’échec', en: 'Show the trace and write the failure down' },
    world: { fr: 'Inès : « Au moins, je sais ce qu’il ne sait pas faire. »', en: 'Inès: “At least I know what it cannot do.”' },
    why: { fr: 'Un échec montré devient un cas de test.', en: 'A failure shown becomes a test case.' },
  },
];

const T = {
  fr: {
    acts: ['Le dossier', 'La démo', 'La semaine'],
    act: 'Acte',
    trust: (n: number) => `Confiance d’Inès : ${n} sur 5`,
    trustShort: 'confiance',
    folder: 'Dossier de livraison',
    free: 'place libre',
    pile: 'Sur le bureau',
    a1: 'Cinq places. Glisse dans le dossier ce qui prouve, pas ce qui rassure.',
    left: (n: number) => (n === 0 ? 'Dossier plein. Ferme-le quand tu es sûr de toi.' : `Encore ${n} place${n > 1 ? 's' : ''}.`),
    full: 'Le dossier est plein : retire une pièce d’abord.',
    back: (n: number) => `${n} jour${n > 1 ? 's' : ''} tenu${n > 1 ? 's' : ''} sur 5. Remplace ce qui n’a servi à rien.`,
    put: 'Mettre dans le dossier',
    take: 'Retirer du dossier',
    close: 'Fermer le dossier',
    screen: 'Écran de démo',
    sim: 'simulation',
    idle: 'Trois vrais dossiers, choisis avec Inès.',
    a2: 'Lance ses trois dossiers, un par un.',
    run: 'Lancer',
    done: 'vu',
    okCase: 'Inès suit, et hoche la tête.',
    invented: 'prix inventé',
    fail: 'Un prix inventé, devant elle. Que fais-tu ?',
    reactTitle: 'Ta réaction',
    notes: ['noté, avec ses mots', 'nouveau cas de test', 'corrigé, suite rejouée'],
    toWeek: 'Remettre les clés à Inès',
    a3: 'Inès a les clés. Tu pars une semaine : le dossier répond à ta place.',
    leave: 'Partir une semaine',
    inFolder: 'Dans le dossier',
    held: 'tenu',
    broke: 'cassé',
    useless: 'n’a servi à rien',
    weekKo: (n: number) => `${n} jour${n > 1 ? 's' : ''} tenu${n > 1 ? 's' : ''} sur 5. Inès ne signe pas encore.`,
    weekOk: 'Cinq jours tenus sans toi. Inès signe la remise.',
    reopen: 'Rouvrir le dossier',
    signed: 'Bon pour remise',
    agency: 'Brume & Quai',
    proof: 'dossier complet · démo honnête · une semaine tenue',
  },
  en: {
    acts: ['The file', 'The demo', 'The week'],
    act: 'Act',
    trust: (n: number) => `Inès’s trust: ${n} out of 5`,
    trustShort: 'trust',
    folder: 'Handover file',
    free: 'free place',
    pile: 'On the desk',
    a1: 'Five places. File what proves, not what reassures.',
    left: (n: number) => (n === 0 ? 'File full. Close it when you are sure.' : `${n} place${n > 1 ? 's' : ''} left.`),
    full: 'The file is full: take a paper out first.',
    back: (n: number) => `${n} day${n > 1 ? 's' : ''} held out of 5. Replace what was of no use.`,
    put: 'Put in the file',
    take: 'Take out of the file',
    close: 'Close the file',
    screen: 'Demo screen',
    sim: 'simulation',
    idle: 'Three real files, chosen with Inès.',
    a2: 'Run her three files, one by one.',
    run: 'Run',
    done: 'seen',
    okCase: 'Inès follows, and nods.',
    invented: 'invented price',
    fail: 'An invented price, in front of her. What do you do?',
    reactTitle: 'Your reaction',
    notes: ['written down, in her words', 'new test case', 'fixed, suite replayed'],
    toWeek: 'Hand the keys to Inès',
    a3: 'Inès has the keys. You leave for a week: the file answers for you.',
    leave: 'Leave for a week',
    inFolder: 'In the file',
    held: 'held',
    broke: 'broke',
    useless: 'was of no use',
    weekKo: (n: number) => `${n} day${n > 1 ? 's' : ''} held out of 5. Inès is not signing yet.`,
    weekOk: 'Five days held without you. Inès signs the handover.',
    reopen: 'Reopen the file',
    signed: 'Approved for handover',
    agency: 'Brume & Quai',
    proof: 'complete file · honest demo · one week held',
  },
};

const cx = (...a: (string | false | null | undefined)[]) => a.filter(Boolean).join(' ');
const card = (id: CardId) => CARDS.find((c) => c.id === id)!;

type Mood = 'calm' | 'glad' | 'uneasy' | 'cross';

function Ines({ mood }: { mood: Mood }) {
  const mouth = mood === 'glad' ? 'M17 30 q5 5 10 0' : mood === 'cross' ? 'M17 33 q5 -5 10 0' : mood === 'uneasy' ? 'M18 32 q2 -2 4 0 t4 0' : 'M18 31 h8';
  const brow = mood === 'cross' ? 2 : mood === 'uneasy' ? -1.5 : 0;
  return (
    <svg className="sg14-face" viewBox="0 0 44 44" width="44" height="44" aria-hidden="true">
      <circle cx="22" cy="22" r="21" fill="#1e4d3b" />
      <path d="M8 44 q14 -14 28 0z" fill="#e3c27a" />
      <path d="M9 24 q-2 -18 13 -18 q15 0 13 18 q-2 6 -4 8 h-18 q-2 -2 -4 -8z" fill="#2d2721" />
      <ellipse cx="22" cy="25" rx="9" ry="10.5" fill="#efe7d8" />
      <path d="M12.5 22 q2 -9 10 -9 q8 0 9 9 q-6 -1 -9 -6 q-3 5 -10 6z" fill="#2d2721" />
      <circle cx="18.5" cy="25" r="1.3" fill="#2d2721" />
      <circle cx="25.5" cy="25" r="1.3" fill="#2d2721" />
      <path d={`M16 ${21.5 - brow} l5 ${brow}`} stroke="#2d2721" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <path d={`M23 ${21.5} l5 ${-brow}`} stroke="#2d2721" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <path d={mouth} stroke="#7c2f2a" strokeWidth="1.6" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function Key({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 28" width="64" height="28" aria-hidden="true">
      <circle cx="14" cy="14" r="11" fill="none" stroke="#c9b67a" strokeWidth="5" />
      <path d="M25 14 h34" stroke="#c9b67a" strokeWidth="5" strokeLinecap="round" />
      <path d="M46 14 v8 M54 14 v6" stroke="#c9b67a" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

export default function Game({ lang, onSolved, onMistake }: SignatureProps) {
  const t = T[lang];
  const [act, setAct] = useState<1 | 2 | 3>(1);
  const [folder, setFolder] = useState<CardId[]>([]);
  const [played, setPlayed] = useState(0);
  const [reaction, setReaction] = useState<Reaction | null>(null);
  const [day, setDay] = useState(-1); // -1: not left yet · 0..4: days revealed so far · 5: week over
  const [lastWeek, setLastWeek] = useState<number | null>(null);
  const [note, setNote] = useState<{ tone: 'info' | 'ok' | 'err'; world?: string; text: string } | null>(null);

  const sceneRef = useRef<HTMLElement | null>(null);
  const first = useRef(true);
  const fired = useRef(false);
  const judged = useRef(false);
  const solvedCb = useRef(onSolved);
  solvedCb.current = onSolved;

  // Everything below is computed from the three pieces of state the learner controls.
  const results = EVENTS.map((e) => folder.includes(e.needs));
  const heldAll = results.every(Boolean);
  const held = results.filter(Boolean).length;
  const weekOver = day >= EVENTS.length;
  const won = weekOver && heldAll && reaction === 'note';
  const trust =
    1 +
    Math.min(played, 2) +
    (played === 3 ? -1 : 0) +
    (reaction === 'hide' ? -2 : reaction === 'patch' ? -1 : reaction === 'note' ? 2 : 0) +
    (won ? 1 : 0);

  let mood: Mood = 'calm';
  if (act === 2) mood = reaction === 'note' ? 'glad' : reaction ? 'cross' : played === 3 ? 'uneasy' : played > 0 ? 'glad' : 'calm';
  if (act === 3 && day >= 0) {
    const seen = results.slice(0, Math.min(day, EVENTS.length));
    mood = seen.length === 0 ? 'calm' : seen[seen.length - 1] ? 'glad' : 'cross';
    if (weekOver) mood = heldAll ? 'glad' : 'cross';
  }
  if (act === 1 && lastWeek !== null) mood = 'uneasy';

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    sceneRef.current?.focus({ preventScroll: false });
  }, [act]);

  // The week plays itself, one day at a time.
  useEffect(() => {
    if (act !== 3 || day < 0 || day >= EVENTS.length) return;
    const id = window.setTimeout(() => {
      const ok = folder.includes(EVENTS[day].needs);
      sfx(ok ? 'correct' : 'wrong');
      setDay(day + 1);
    }, 1000);
    return () => window.clearTimeout(id);
  }, [act, day, folder]);

  useEffect(() => {
    if (!weekOver || judged.current) return;
    judged.current = true;
    if (heldAll) {
      setNote({ tone: 'ok', text: t.weekOk });
    } else {
      setNote({ tone: 'err', text: t.weekKo(held) });
      onMistake?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekOver]);

  useEffect(() => {
    if (!won) return;
    sfx('solve');
    const id = window.setTimeout(() => {
      if (fired.current) return;
      fired.current = true;
      solvedCb.current();
    }, 700);
    return () => window.clearTimeout(id);
  }, [won]);

  /* ---------- Act 1 ---------- */
  const toggle = (id: CardId) => {
    if (folder.includes(id)) {
      setFolder(folder.filter((x) => x !== id));
      setNote({ tone: 'info', text: t.left(SLOTS - folder.length + 1) });
      sfx('tick');
      return;
    }
    if (folder.length >= SLOTS) {
      setNote({ tone: 'info', text: t.full });
      sfx('wrong');
      return;
    }
    setFolder([...folder, id]);
    setNote({ tone: 'info', text: t.left(SLOTS - folder.length - 1) });
    sfx('place');
  };
  const closeFolder = () => {
    sfx('latch');
    setNote(null);
    setDay(-1);
    setLastWeek(null);
    setAct(reaction === 'note' ? 3 : 2);
  };

  /* ---------- Act 2 ---------- */
  const run = (i: number) => {
    if (i !== played) return;
    setPlayed(i + 1);
    if (CASES[i].bad) {
      sfx('wrong');
      setNote({ tone: 'err', text: t.fail });
    } else {
      sfx('correct');
      setNote({ tone: 'ok', text: t.okCase });
    }
  };
  const react = (r: Reaction) => {
    const def = REACTIONS.find((x) => x.id === r)!;
    setReaction(r);
    if (r === 'note') {
      sfx('correct');
      setNote({ tone: 'ok', world: def.world[lang], text: def.why[lang] });
    } else {
      sfx('wrong');
      setNote({ tone: 'err', world: def.world[lang], text: def.why[lang] });
      onMistake?.();
    }
  };
  const toWeek = () => {
    sfx('open');
    setNote(null);
    setDay(-1);
    setAct(3);
  };

  /* ---------- Act 3 ---------- */
  const leave = () => {
    sfx('close');
    judged.current = false;
    setNote(null);
    setDay(0);
  };
  const reopen = () => {
    sfx('open');
    setLastWeek(held);
    setNote({ tone: 'err', text: t.back(held) });
    setDay(-1);
    setAct(1);
  };

  const shown = played > 0 ? CASES[played - 1] : null;
  const usedIds = EVENTS.slice(0, Math.max(0, Math.min(day, EVENTS.length))).map((e) => e.needs);

  return (
    <div className="sg14" data-game="c14" data-act={act} data-solved={won ? 'true' : undefined} data-trust={trust}>
      <div className="sg14-top">
        <ol className="sg14-acts" aria-label={`${t.act} ${act} / 3`}>
          {t.acts.map((a, i) => (
            <li key={a} className={cx('sg14-act', i + 1 === act && 'is-on', i + 1 < act && 'is-done')} aria-current={i + 1 === act ? 'step' : undefined}>
              <span className="sg14-act-n" aria-hidden="true">{i + 1}</span>
              <span className="sg14-act-t">{a}</span>
            </li>
          ))}
        </ol>
        <div className="sg14-ines" data-mood={mood} role="img" aria-label={t.trust(trust)}>
          <Ines mood={mood} />
          <span className="sg14-ines-txt" aria-hidden="true">
            <b>Inès</b>
            <span className="sg14-gauge" data-testid="sg14-trust">
              {Array.from({ length: 5 }, (_, i) => (
                <i key={i} className={cx('sg14-pip', i < trust && 'is-on')} />
              ))}
            </span>
          </span>
        </div>
      </div>

      {act === 1 && (
        <section className="sg14-scene sg14-desk" ref={sceneRef} tabIndex={-1} aria-label={`${t.act} 1 · ${t.acts[0]}`}>
          <p className="sg14-lead">{t.a1}</p>
          <div className="sg14-folder">
            <p className="sg14-tab">
              {t.folder} <span>{folder.length} / {SLOTS}</span>
            </p>
            <ol className="sg14-slots">
              {Array.from({ length: SLOTS }, (_, i) => {
                const id = folder[i];
                if (!id) {
                  return (
                    <li key={i} className="sg14-slot">
                      <span className="sg14-free">{t.free}</span>
                    </li>
                  );
                }
                const c = card(id);
                return (
                  <li key={id} className="sg14-slot">
                    <button type="button" className="sg14-sheet" onClick={() => toggle(id)} data-testid={`sg14-slot-${id}`} aria-label={`${t.take} : ${c.label[lang]}`}>
                      <span className="sg14-clip" aria-hidden="true" />
                      <span className="sg14-sheet-l">{c.label[lang]}</span>
                      <span className="sg14-x" aria-hidden="true" />
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>
          <p className="sg14-pile-t">{t.pile}</p>
          <ul className="sg14-pile">
            {CARDS.map((c, i) => {
              const on = folder.includes(c.id);
              return (
                <li key={c.id}>
                  <button
                    type="button"
                    className={cx('sg14-card', on && 'is-in', i % 2 === 1 && 'is-tilt')}
                    onClick={() => toggle(c.id)}
                    aria-pressed={on}
                    aria-label={`${on ? t.take : t.put} : ${c.label[lang]} (${c.detail[lang]})`}
                    data-testid={`sg14-card-${c.id}`}
                  >
                    <span className="sg14-card-l">{c.label[lang]}</span>
                    <span className={cx('sg14-card-d', c.mono && 'is-mono')}>{c.detail[lang]}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {act === 2 && (
        <section className="sg14-scene sg14-demo" ref={sceneRef} tabIndex={-1} aria-label={`${t.act} 2 · ${t.acts[1]}`}>
          <p className="sg14-lead sg14-lead--ink">{t.a2}</p>
          <div className={cx('sg14-screen', shown?.bad && reaction !== 'note' && 'is-bad')}>
            <p className="sg14-screen-h">
              {t.screen} <span>{t.sim}</span>
            </p>
            <div className="sg14-out" key={played} data-testid="sg14-screen">
              {shown ? (
                <>
                  <p className="sg14-out-name">{shown.name[lang]}</p>
                  {shown.out.map((o, i) => (
                    <p key={i} className={cx('sg14-out-line', shown.bad && i === 1 && 'is-wrong')} style={{ animationDelay: `${i * 0.25}s` }}>
                      <span aria-hidden="true">›</span> {o[lang]}
                      {shown.bad && i === 1 && <em className="sg14-tag">{t.invented}</em>}
                    </p>
                  ))}
                </>
              ) : (
                <p className="sg14-out-idle">{t.idle}</p>
              )}
            </div>
            <span className="sg14-stand" aria-hidden="true" />
          </div>
          <ul className="sg14-cases">
            {CASES.map((c, i) => {
              const seen = i < played;
              return (
                <li key={i}>
                  <button
                    type="button"
                    className={cx('sg14-case', seen && 'is-seen', seen && c.bad && 'is-bad', i === played && 'is-next')}
                    onClick={() => run(i)}
                    disabled={i !== played}
                    data-testid={`sg14-case-${i}`}
                  >
                    <span className="sg14-case-n">{c.name[lang]}</span>
                    <span className="sg14-case-s">{seen ? t.done : t.run}</span>
                  </button>
                </li>
              );
            })}
          </ul>
          {played === 3 && (
            <div className="sg14-react" role="group" aria-label={t.reactTitle}>
              <p className="sg14-react-t">{t.reactTitle}</p>
              {REACTIONS.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  className={cx('sg14-choice', reaction === r.id && (r.id === 'note' ? 'is-ok' : 'is-ko'))}
                  onClick={() => react(r.id)}
                  disabled={reaction === 'note'}
                  aria-pressed={reaction === r.id}
                  data-testid={`sg14-react-${r.id}`}
                >
                  {r.label[lang]}
                </button>
              ))}
            </div>
          )}
          {reaction === 'note' && (
            <ol className="sg14-notes" data-testid="sg14-notes">
              {t.notes.map((n, i) => (
                <li key={n} style={{ animationDelay: `${0.2 + i * 0.3}s` }}>{n}</li>
              ))}
            </ol>
          )}
        </section>
      )}

      {act === 3 && (
        <section className="sg14-scene sg14-week" ref={sceneRef} tabIndex={-1} aria-label={`${t.act} 3 · ${t.acts[2]}`}>
          <p className="sg14-lead sg14-lead--ink">{t.a3}</p>
          <div className="sg14-mini">
            <p className="sg14-tab">{t.inFolder}</p>
            <ul>
              {folder.map((id) => {
                const used = usedIds.includes(id);
                const dead = weekOver && !EVENTS.some((e) => e.needs === id);
                return (
                  <li key={id} className={cx('sg14-chip', used && 'is-used', dead && 'is-dead')} data-testid={`sg14-chip-${id}`}>
                    {card(id).label[lang]}
                    {dead && <em>{t.useless}</em>}
                  </li>
                );
              })}
            </ul>
          </div>
          <ol className="sg14-days">
            {EVENTS.map((e, i) => {
              const state = day > i ? (results[i] ? 'ok' : 'ko') : day === i ? 'now' : 'wait';
              return (
                <li key={i} className="sg14-day" data-state={state} data-testid={`sg14-day-${i}`}>
                  <span className="sg14-day-n">{e.day[lang]}</span>
                  <span className="sg14-day-b">
                    {state === 'wait' ? (
                      <span className="sg14-day-wait" aria-hidden="true" />
                    ) : (
                      <span className="sg14-day-ev">{e.ev[lang]}</span>
                    )}
                    {(state === 'ok' || state === 'ko') && (
                      <span className="sg14-day-r">
                        <b>{state === 'ok' ? t.held : t.broke}</b> {(state === 'ok' ? e.ok : e.ko)[lang]}
                      </span>
                    )}
                  </span>
                </li>
              );
            })}
          </ol>
          {won && (
            <div className="sg14-sign" data-testid="sg14-signed">
              <Key className="sg14-key" />
              <p className="sg14-sign-h">{t.signed}</p>
              <p className="sg14-sign-n">
                <span>Inès Caron</span>
                <i aria-hidden="true" />
              </p>
              <p className="sg14-sign-a">{t.agency} · {t.proof}</p>
            </div>
          )}
        </section>
      )}

      <p className={cx('sg14-status', note && `is-${note.tone}`)} role="status" aria-live="polite" data-testid="sg14-status" data-tone={note?.tone}>
        {note && (
          <span key={`${note.world ?? ''}${note.text}`}>
            {note.world && <b>{note.world} </b>}
            {note.text}
          </span>
        )}
      </p>

      <div className="sg14-actions">
        {act === 1 && (
          <button type="button" className="sg14-btn" onClick={closeFolder} disabled={folder.length < SLOTS} data-testid="sg14-close">
            {t.close}
          </button>
        )}
        {act === 2 && reaction === 'note' && (
          <button type="button" className="sg14-btn" onClick={toWeek} data-testid="sg14-to-week">
            {t.toWeek}
          </button>
        )}
        {act === 3 && day < 0 && (
          <button type="button" className="sg14-btn" onClick={leave} data-testid="sg14-leave">
            {t.leave}
          </button>
        )}
        {act === 3 && weekOver && !heldAll && (
          <button type="button" className="sg14-btn" onClick={reopen} data-testid="sg14-reopen">
            {t.reopen}
          </button>
        )}
      </div>
    </div>
  );
}
