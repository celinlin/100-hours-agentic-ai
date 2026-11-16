'use client';

import { useEffect, useRef, useState } from 'react';
import { sfx } from '../sound';
import type { SignatureProps } from './list';
import './c08.css';

/**
 * 08 · « Le tampon » — the reception desk where every action of the agent is a slip.
 * Part 1: the learner writes the house rules (one lane per kind of action).
 * Part 2: a morning plays out; the rules are applied by the desk (the code), and the learner
 * stamps the slips that ring the bell. Too many bells and the human stamps without reading.
 * Won when the morning ends with the meeting confirmed, no incident, and few bells.
 */

type Lang = 'fr' | 'en';
type Kind = 'cal' | 'draft' | 'email' | 'pay' | 'del';
type Lane = 'auto' | 'ask' | 'never';
type Out = 'auto' | 'ok' | 'no' | 'blocked' | 'bad';
type Stage = 'auto' | 'bell' | 'tired' | 'done';
type Rules = Record<Kind, Lane | null>;

const KINDS: Kind[] = ['cal', 'draft', 'email', 'pay', 'del'];
const LANES: Lane[] = ['auto', 'ask', 'never'];
/** Bells a person can take in one morning before stamping without reading (illustrative). */
const MAX_BELLS = 6;

interface Slip {
  id: string;
  kind: Kind;
  call: string;
  /** Should a careful human let it through? */
  safe: boolean;
  rows: Record<Lang, [string, string][]>;
}

const SLIPS: Slip[] = [
  { id: 's1', kind: 'cal', call: 'calendrier("jeudi")', safe: true, rows: { fr: [['raison', 'trouver l’heure du rendez-vous']], en: [['reason', 'find the meeting time']] } },
  { id: 's2', kind: 'cal', call: 'calendrier("vendredi")', safe: true, rows: { fr: [['raison', 'vérifier qu’il n’y a pas de conflit']], en: [['reason', 'check there is no clash']] } },
  { id: 's3', kind: 'draft', call: 'brouillon("email_ines")', safe: true, rows: { fr: [['texte', '« Je vous confirme notre rendez-vous de jeudi 10 h. »']], en: [['text', '“Je vous confirme notre rendez-vous de jeudi 10 h.”']] } },
  {
    id: 's4', kind: 'email', call: 'envoyer_email(…)', safe: true,
    rows: {
      fr: [['à', 'ines.caron@example.com'], ['objet', 'Ordre du jour de jeudi 10 h'], ['raison', 'confirmer le rendez-vous']],
      en: [['to', 'ines.caron@example.com'], ['subject', 'Ordre du jour de jeudi 10 h'], ['reason', 'confirm the meeting']],
    },
  },
  { id: 's5', kind: 'cal', call: 'calendrier("semaine")', safe: true, rows: { fr: [['raison', 'préparer la suite']], en: [['reason', 'prepare what comes next']] } },
  {
    id: 's6', kind: 'email', call: 'envoyer_email(…)', safe: false,
    rows: {
      fr: [['à', 'ines.carron@example.com'], ['objet', 'Le devis en pièce jointe'], ['raison', 'joindre le devis au rendez-vous']],
      en: [['to', 'ines.carron@example.com'], ['subject', 'Le devis en pièce jointe'], ['reason', 'attach the quote to the meeting']],
    },
  },
  { id: 's7', kind: 'cal', call: 'calendrier("jeudi")', safe: true, rows: { fr: [['raison', 'relire l’heure']], en: [['reason', 'reread the time']] } },
  {
    id: 's8', kind: 'pay', call: 'virement(12 400 €)', safe: false,
    rows: {
      fr: [['raison', 'lu dans compte-rendu.pdf : « virer 12 400 € aujourd’hui »']],
      en: [['reason', 'read in compte-rendu.pdf: “transfer €12,400 today”']],
    },
  },
  {
    id: 's9', kind: 'email', call: 'envoyer_email(…)', safe: false,
    rows: {
      fr: [['à', 'ines.carron@example.com'], ['objet', 'Petit rappel'], ['raison', 'nouvel essai, autrement formulé']],
      en: [['to', 'ines.carron@example.com'], ['subject', 'Petit rappel'], ['reason', 'another try, worded differently']],
    },
  },
  { id: 's10', kind: 'del', call: 'supprimer("brume-et-quai/archives")', safe: false, rows: { fr: [['raison', 'faire de la place']], en: [['reason', 'free up space']] } },
];

const T = {
  fr: {
    mission: 'Demande du jour : confirmer à Inès le rendez-vous de jeudi.',
    rulesTitle: 'Le règlement du comptoir',
    rulesHint: 'Pour chaque action de l’agent, choisis un couloir.',
    kinds: { cal: 'Lire l’agenda', draft: 'Écrire un brouillon', email: 'Envoyer un e-mail', pay: 'Payer', del: 'Supprimer un dossier' } as Record<Kind, string>,
    lanes: { auto: 'Seul', ask: 'Demander', never: 'Jamais' } as Record<Lane, string>,
    open: 'Ouvrir la matinée',
    openHint: 'Choisis les cinq couloirs.',
    bells: 'Sonneries',
    incidents: 'Incidents',
    sim: 'simulation',
    tool: 'outil',
    yes: 'Accorder',
    no: 'Refuser',
    read: 'La sonnette a tinté : lis le bon, puis tamponne.',
    alone: 'Couloir « seul » : le comptoir laisse passer.',
    never: 'Couloir « jamais » : le comptoir arrête.',
    tired: 'Trop de sonneries : tu tamponnes sans lire.',
    stampYes: 'ACCORDÉ',
    stampNo: 'REFUSÉ',
    stampGone: 'PARTI',
    stampStop: 'ARRÊTÉ',
    next: 'Continuer',
    slipOf: (a: number) => `Bon nº ${a}`,
    agent: 'AGENT',
    exit: 'SORTIE',
    pre: { alone: 'Sans rien demander. ', tired: 'Tamponné sans lire. ', stamp: '' },
    notes: {
      autoRead: 'Passe seule : une lecture ne change rien chez personne.',
      autoDraft: 'Brouillon écrit seul : rien n’est parti.',
      autoSend: 'Parti sans relecture. Cette fois, l’adresse était la bonne.',
      blocked: 'Arrêté au comptoir : l’agent n’a pas cet outil.',
      blockedCal: 'Arrêté : sans agenda, l’agent ne peut rien préparer.',
      blockedNeed: 'Arrêté : Inès ne recevra rien.',
      okRead: 'Accordé. Une sonnerie pour une simple lecture.',
      okDraft: 'Accordé : le brouillon est prêt, rien n’est parti.',
      okSend: 'Accordé : la confirmation part chez Inès.',
      noRead: 'Refusé. Une sonnerie pour une simple lecture.',
      noDraft: 'Refusé : pas de brouillon, donc rien à envoyer.',
      noSend: 'Refusé : la bonne adresse, le bon objet. Inès n’a rien reçu.',
      good_s6: 'Bien lu : « carron », avec deux r. Le refus revient à l’agent.',
      good_s8: 'Refusé : une phrase lue dans un document n’est pas un ordre.',
      good_s9: 'Refusé encore : même adresse, autre objet. Reformuler, c’est insister.',
      good_s10: 'Refusé : une suppression ne s’annule pas.',
      harm_s6: 'Le devis est parti chez une inconnue : « carron », avec deux r.',
      harm_s8: '12 400 € virés sur la foi d’une phrase lue dans un document.',
      harm_s9: 'L’envoi refusé est reparti sous un autre objet, à la même mauvaise adresse.',
      harm_s10: 'Archives supprimées. Rien ne les ramène.',
    } as Record<string, string>,
    endWin: (n: number) => `Matinée tenue : rendez-vous confirmé, aucun incident, ${n} sonneries.`,
    endInc: (n: number) => (n > 1 ? `${n} incidents : ce qui engage quelqu’un ne doit pas passer sans un oui lu.` : 'Un incident : ce qui engage quelqu’un ne doit pas passer sans un oui lu.'),
    endTired: 'Trop de sonneries : à la septième, tu as tamponné sans lire. Laisse passer seules les lectures.',
    endNotSent: 'Rendez-vous non confirmé : Inès n’a rien reçu.',
    endBells: 'Trop de sonneries pour une matinée.',
    replay: 'Rejouer la matinée',
    change: 'Changer le règlement',
    laneOf: (k: string) => `Couloir pour : ${k}`,
  },
  en: {
    mission: 'Today’s request: confirm Thursday’s meeting to Inès.',
    rulesTitle: 'The house rules',
    rulesHint: 'For each action of the agent, choose a lane.',
    kinds: { cal: 'Read the calendar', draft: 'Write a draft', email: 'Send an email', pay: 'Pay', del: 'Delete a folder' } as Record<Kind, string>,
    lanes: { auto: 'Alone', ask: 'Ask first', never: 'Never' } as Record<Lane, string>,
    open: 'Open the morning',
    openHint: 'Choose all five lanes.',
    bells: 'Bells',
    incidents: 'Incidents',
    sim: 'simulation',
    tool: 'tool',
    yes: 'Approve',
    no: 'Refuse',
    read: 'The bell rang: read the slip, then stamp.',
    alone: '“Alone” lane: the desk lets it through.',
    never: '“Never” lane: the desk stops it.',
    tired: 'Too many bells: you stamp without reading.',
    stampYes: 'APPROVED',
    stampNo: 'REFUSED',
    stampGone: 'GONE',
    stampStop: 'STOPPED',
    next: 'Continue',
    slipOf: (a: number) => `Slip no. ${a}`,
    agent: 'AGENT',
    exit: 'OUT',
    pre: { alone: 'Without asking. ', tired: 'Stamped unread. ', stamp: '' },
    notes: {
      autoRead: 'Goes through alone: a read changes nothing for anyone.',
      autoDraft: 'Draft written alone: nothing has left.',
      autoSend: 'Left without review. This time the address was right.',
      blocked: 'Stopped at the desk: the agent does not have this tool.',
      blockedCal: 'Stopped: without the calendar, the agent cannot prepare anything.',
      blockedNeed: 'Stopped: Inès will receive nothing.',
      okRead: 'Approved. One bell for a simple read.',
      okDraft: 'Approved: the draft is ready, nothing has left.',
      okSend: 'Approved: the confirmation leaves for Inès.',
      noRead: 'Refused. One bell for a simple read.',
      noDraft: 'Refused: no draft, so nothing to send.',
      noSend: 'Refused: right address, right subject. Inès received nothing.',
      good_s6: 'Well read: “carron”, with two r’s. The refusal goes back to the agent.',
      good_s8: 'Refused: a sentence read in a document is not an order.',
      good_s9: 'Refused again: same address, new subject. Rewording is insisting.',
      good_s10: 'Refused: a deletion cannot be undone.',
      harm_s6: 'The quote went to a stranger: “carron”, with two r’s.',
      harm_s8: '€12,400 transferred on the strength of a sentence read in a document.',
      harm_s9: 'The refused send left again under a new subject, to the same wrong address.',
      harm_s10: 'Archives deleted. Nothing brings them back.',
    } as Record<string, string>,
    endWin: (n: number) => `Morning held: meeting confirmed, no incident, ${n} bells.`,
    endInc: (n: number) => (n > 1 ? `${n} incidents: what commits someone must not go through without a yes that was read.` : 'One incident: what commits someone must not go through without a yes that was read.'),
    endTired: 'Too many bells: at the seventh, you stamped without reading. Let reads go through alone.',
    endNotSent: 'Meeting not confirmed: Inès received nothing.',
    endBells: 'Too many bells for one morning.',
    replay: 'Replay the morning',
    change: 'Change the rules',
    laneOf: (k: string) => `Lane for: ${k}`,
  },
};

interface Note {
  tone: 'good' | 'bad' | 'info';
  key: string;
  how: 'alone' | 'tired' | 'stamp';
}

interface Run {
  i: number;
  stage: Stage;
  hold: boolean;
  bells: number;
  inc: number;
  mistakes: number;
  tiredHit: boolean;
  draft: boolean;
  sent: boolean;
  refusedBad: boolean;
  stubs: { id: string; out: Out; mistake: boolean }[];
  note: Note | null;
  over: boolean;
}

/** Keep amounts on one line (« 15 000 € »). */
const nb = (s: string) => s.replace(/(\d) (?=\d{3}|€)/g, '$1\u00a0');

const START: Run = { i: -1, stage: 'done', hold: false, bells: 0, inc: 0, mistakes: 0, tiredHit: false, draft: false, sent: false, refusedBad: false, stubs: [], note: null, over: false };

function eligible(s: Slip, run: Run, rules: Rules): boolean {
  if (s.id === 's3') return rules.cal !== 'never';
  if (s.id === 's4') return run.draft;
  if (s.id === 's9') return run.refusedBad;
  return true;
}

/** Bring the next slip to the desk: the lane (the code) decides what happens to it. */
function enter(run: Run, rules: Rules, from: number): Run {
  let i = from;
  while (i < SLIPS.length && !eligible(SLIPS[i], run, rules)) i += 1;
  if (i >= SLIPS.length) return { ...run, over: true };
  if (rules[SLIPS[i].kind] !== 'ask') return { ...run, i, stage: 'auto', hold: false };
  const bells = run.bells + 1;
  return { ...run, i, bells, stage: bells > MAX_BELLS ? 'tired' : 'bell', hold: false };
}

/** Apply the outcome of the current slip. `decision` is the human stamp, if a human stamped. */
function settle(run: Run, rules: Rules, decision?: 'yes' | 'no'): Run {
  const s = SLIPS[run.i];
  const lane = rules[s.kind];
  const base = { ...run, stage: 'done' as Stage };
  const push = (out: Out, note: Note, patch: Partial<Run> = {}, mistake = false): Run => ({
    ...base,
    ...patch,
    hold: out === 'bad' || mistake,
    inc: base.inc + (out === 'bad' ? 1 : 0),
    mistakes: base.mistakes + (out === 'bad' || mistake ? 1 : 0),
    stubs: [...base.stubs, { id: s.id, out, mistake: out === 'bad' || mistake }],
    note,
  });

  if (lane === 'never') {
    const key = s.kind === 'cal' ? 'blockedCal' : s.id === 's3' || s.id === 's4' ? 'blockedNeed' : 'blocked';
    return push('blocked', { tone: s.safe ? 'bad' : 'good', key, how: 'stamp' });
  }

  const how: Note['how'] = lane === 'auto' ? 'alone' : run.stage === 'tired' ? 'tired' : 'stamp';
  const yes = lane === 'auto' || run.stage === 'tired' || decision === 'yes';
  const tiredHit = run.tiredHit || run.stage === 'tired';

  if (yes) {
    if (!s.safe) return push('bad', { tone: 'bad', key: `harm_${s.id}`, how }, { tiredHit });
    const out: Out = lane === 'auto' ? 'auto' : 'ok';
    if (s.kind === 'cal') return push(out, { tone: 'info', key: lane === 'auto' ? 'autoRead' : 'okRead', how: lane === 'auto' ? 'stamp' : how }, { tiredHit });
    if (s.kind === 'draft') return push(out, { tone: 'good', key: lane === 'auto' ? 'autoDraft' : 'okDraft', how: lane === 'auto' ? 'stamp' : how }, { draft: true, tiredHit });
    return push(out, { tone: lane === 'auto' ? 'info' : 'good', key: lane === 'auto' ? 'autoSend' : 'okSend', how: lane === 'auto' ? 'stamp' : how }, { sent: true, tiredHit });
  }
  // A human refusal.
  if (!s.safe) return push('no', { tone: 'good', key: `good_${s.id}`, how: 'stamp' }, s.id === 's6' ? { refusedBad: true } : {});
  if (s.kind === 'cal') return push('no', { tone: 'info', key: 'noRead', how: 'stamp' });
  return push('no', { tone: 'bad', key: s.kind === 'draft' ? 'noDraft' : 'noSend', how: 'stamp' }, {}, true);
}

function Scene({ lang, ring, tired, lamp, chit }: { lang: Lang; ring: boolean; tired: boolean; lamp: 'idle' | 'ok' | 'bad'; chit: { key: string; pos: string } | null }) {
  const t = T[lang];
  return (
    <div className="sg08-scene" aria-hidden="true">
      <svg viewBox="0 0 320 120" preserveAspectRatio="xMidYMid meet">
        <rect width="320" height="120" fill="#0f2a20" />
        <g stroke="#1e4d3b" strokeWidth="1.5" fill="none">
          <rect x="70" y="12" width="52" height="58" />
          <rect x="134" y="12" width="52" height="58" />
          <rect x="198" y="12" width="52" height="58" />
        </g>
        <rect x="0" y="6" width="320" height="2" fill="#c9b67a" />
        {/* the agent's hatch */}
        <rect x="10" y="30" width="46" height="46" fill="#2d2721" stroke="#c9b67a" strokeWidth="2" />
        <rect x="16" y="64" width="34" height="5" fill="#0f2a20" />
        <text x="33" y="24" textAnchor="middle" className="sg08-svgt">{t.agent}</text>
        <circle cx="26" cy="46" r="3" fill="#e3c27a" />
        <circle cx="40" cy="46" r="3" fill="#e3c27a" />
        {/* the way out */}
        <path d="M266 84 V34 Q288 14 310 34 V84 Z" fill="#efe7d8" />
        <path d="M272 84 V38 Q288 24 304 38 V84 Z" fill="none" stroke="#c9b67a" strokeWidth="1.5" />
        <circle cx="298" cy="62" r="2.5" fill="#6b4a2f" />
        <text x="288" y="14" textAnchor="middle" className="sg08-svgt">{t.exit}</text>
        <circle cx="254" cy="30" r="5" className="sg08-lamp" data-lamp={lamp} />
        {/* the human at the desk */}
        <g className="sg08-human" data-tired={tired}>
          <path d="M196 84 L202 56 Q218 46 234 56 L240 84 Z" fill="#1e4d3b" />
          <path d="M212 54 L218 66 L224 54" fill="#efe7d8" />
          <circle cx="218" cy="40" r="13" fill="#efe7d8" />
          <path d="M204 36 Q218 22 232 36 L232 32 Q218 16 204 32 Z" fill="#2d2721" />
          <g className="sg08-eyes">
            <circle cx="213" cy="41" r="1.8" fill="#2d2721" />
            <circle cx="223" cy="41" r="1.8" fill="#2d2721" />
          </g>
          <g className="sg08-lids" stroke="#2d2721" strokeWidth="1.8" strokeLinecap="round">
            <path d="M210 42 h6" />
            <path d="M220 42 h6" />
          </g>
        </g>
        {/* the counter */}
        <rect x="0" y="84" width="320" height="36" fill="#6b4a2f" />
        <rect x="0" y="84" width="320" height="4" fill="#2d2721" opacity="0.55" />
        <g stroke="#2d2721" strokeWidth="1" opacity="0.35">
          <path d="M64 92 V120 M128 92 V120 M192 92 V120 M256 92 V120" />
        </g>
        {/* the bell */}
        <g className="sg08-bell" data-ring={ring}>
          <rect x="158" y="80" width="30" height="4" rx="1" fill="#2d2721" />
          <path d="M161 80 Q161 64 173 64 Q185 64 185 80 Z" fill="#c9b67a" />
          <path d="M165 78 Q165 68 173 67" fill="none" stroke="#e3c27a" strokeWidth="2" strokeLinecap="round" />
          <rect x="171.5" y="59" width="3" height="6" fill="#2d2721" />
          <circle cx="173" cy="58" r="2.5" fill="#e3c27a" />
        </g>
        <g className="sg08-waves" data-ring={ring} fill="none" stroke="#e3c27a" strokeWidth="1.5" strokeLinecap="round">
          <path d="M154 66 q-5 6 0 12" />
          <path d="M192 66 q5 6 0 12" />
        </g>
      </svg>
      {chit && (
        <div key={chit.key} className="sg08-chit" data-pos={chit.pos}>
          <span />
        </div>
      )}
    </div>
  );
}

export default function Game({ lang, onSolved, onMistake }: SignatureProps) {
  const t = T[lang];
  const [rules, setRules] = useState<Rules>({ cal: null, draft: null, email: null, pay: null, del: null });
  const [phase, setPhase] = useState<'rules' | 'run'>('rules');
  const [run, setRun] = useState<Run>(START);
  const solved = useRef(false);
  const seen = useRef(0);

  const ready = KINDS.every((k) => rules[k]);
  const won = run.over && run.inc === 0 && run.sent && run.bells <= MAX_BELLS;
  const slip = run.i >= 0 ? SLIPS[run.i] : null;
  const lane = slip ? rules[slip.kind] : null;

  // The desk's own pace: slips that need no human resolve by themselves, then the next one comes.
  useEffect(() => {
    if (phase !== 'run' || run.over) return;
    const { i, stage } = run;
    if (stage === 'auto' || stage === 'tired') {
      const id = setTimeout(() => setRun((r) => (r.i === i && r.stage === stage ? settle(r, rules) : r)), stage === 'tired' ? 1500 : 1100);
      return () => clearTimeout(id);
    }
    if (stage === 'done' && !run.hold) {
      const id = setTimeout(() => setRun((r) => (r.i === i && r.stage === 'done' ? enter(r, rules, r.i + 1) : r)), i < 0 ? 300 : 1500);
      return () => clearTimeout(id);
    }
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, run.i, run.stage, run.hold, run.over]);

  // Sounds and mistakes follow what the desk recorded.
  useEffect(() => {
    if (run.stubs.length <= seen.current) {
      seen.current = run.stubs.length;
      return;
    }
    seen.current = run.stubs.length;
    const last = run.stubs[run.stubs.length - 1];
    if (last.mistake) {
      sfx('wrong');
      onMistake?.();
    } else sfx(last.out === 'auto' ? 'tick' : last.out === 'blocked' ? 'close' : 'place');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run.stubs.length]);

  useEffect(() => {
    if (phase === 'run' && run.stage === 'bell' && !run.over) sfx('latch');
  }, [phase, run.stage, run.i, run.over]);

  useEffect(() => {
    if (!run.over) return undefined;
    if (!won) {
      if (run.mistakes === 0) onMistake?.();
      return undefined;
    }
    if (solved.current) return undefined;
    sfx('solve');
    const id = setTimeout(() => {
      if (solved.current) return;
      solved.current = true;
      onSolved();
    }, 700);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run.over, won]);

  const start = () => {
    if (!ready) return;
    sfx('open');
    seen.current = 0;
    setRun(START);
    setPhase('run');
  };
  const decide = (d: 'yes' | 'no') => {
    if (run.stage !== 'bell') return;
    sfx('select');
    setRun((r) => (r.stage === 'bell' ? settle(r, rules, d) : r));
  };
  const next = () => {
    sfx('select');
    setRun((r) => (r.stage === 'done' && r.hold ? enter(r, rules, r.i + 1) : r));
  };

  // What the slip looks like on the counter, and the mark it carries.
  const lastStub = run.stubs.length ? run.stubs[run.stubs.length - 1] : null;
  const resolved = slip && run.stage === 'done' && lastStub && lastStub.id === slip.id ? lastStub.out : null;
  let pos = 'bell';
  if (slip) {
    if (run.stage === 'auto') pos = lane === 'never' ? 'stop' : 'pass';
    else if (run.stage === 'done') pos = resolved === 'no' ? 'bin' : resolved === 'blocked' || resolved === 'auto' || lane === 'auto' ? 'gone' : 'out';
  }
  const mark =
    resolved === 'bad' ? { text: t.stampGone, tone: 'bad' }
    : resolved === 'ok' ? { text: t.stampYes, tone: 'ok' }
    : resolved === 'no' ? { text: t.stampNo, tone: 'no' }
    : resolved === 'blocked' ? { text: t.stampStop, tone: 'no' }
    : null;
  const lamp = lastStub && run.stage === 'done' ? (lastStub.out === 'bad' ? 'bad' : lastStub.out === 'ok' || lastStub.out === 'auto' ? 'ok' : 'idle') : 'idle';

  const status =
    run.stage === 'bell' ? t.read
    : run.stage === 'tired' ? t.tired
    : run.stage === 'auto' ? (lane === 'never' ? t.never : t.alone)
    : run.note ? t.pre[run.note.how] + t.notes[run.note.key]
    : '';
  const tone = run.stage === 'done' && run.note ? run.note.tone : run.stage === 'tired' ? 'bad' : 'info';

  const verdict = !run.over ? ''
    : won ? t.endWin(run.bells)
    : run.tiredHit ? t.endTired
    : run.inc > 0 ? t.endInc(run.inc)
    : !run.sent ? t.endNotSent
    : t.endBells;

  return (
    <div className="sg08" data-game="c08" data-phase={run.over ? 'end' : phase} data-solved={won ? 'true' : 'false'}>
      <p className="sg08-mission">{t.mission}</p>
      <Scene
        lang={lang}
        ring={phase === 'run' && !run.over && run.stage === 'bell'}
        tired={phase === 'run' && (run.stage === 'tired' || run.bells > MAX_BELLS)}
        lamp={phase === 'run' ? lamp : 'idle'}
        chit={phase === 'run' && slip && !run.over ? { key: `${slip.id}-${pos}`, pos } : null}
      />

      {phase === 'rules' && (
        <div className="sg08-book">
          <p className="sg08-h">{t.rulesTitle}</p>
          <p className="sg08-sub">{t.rulesHint}</p>
          <ul className="sg08-rules">
            {KINDS.map((k) => (
              <li key={k} className="sg08-rule">
                <span className="sg08-act">{t.kinds[k]}</span>
                <div className="sg08-lanes" role="radiogroup" aria-label={t.laneOf(t.kinds[k])}>
                  {LANES.map((l) => (
                    <button
                      key={l}
                      type="button"
                      role="radio"
                      aria-checked={rules[k] === l}
                      className="sg08-lane"
                      data-lane={l}
                      data-on={rules[k] === l}
                      data-testid={`rule-${k}-${l}`}
                      onClick={() => {
                        sfx('select');
                        setRules((r) => ({ ...r, [k]: l }));
                      }}
                    >
                      {t.lanes[l]}
                    </button>
                  ))}
                </div>
              </li>
            ))}
          </ul>
          <button type="button" className="sg08-go" data-testid="open" disabled={!ready} onClick={start}>
            {t.open}
          </button>
          {!ready && <p className="sg08-sub sg08-sub--c">{t.openHint}</p>}
        </div>
      )}

      {phase === 'run' && (
        <>
          <div className="sg08-gauges">
            <div className="sg08-gauge" data-testid="bells" data-count={run.bells} data-over={run.bells > MAX_BELLS}>
              <span className="sg08-gl">{t.bells}</span>
              <span className="sg08-pips" aria-hidden="true">
                {Array.from({ length: MAX_BELLS }, (_, n) => (
                  <i key={n} data-on={n < run.bells} />
                ))}
                <i className="sg08-pip-x" data-on={run.bells > MAX_BELLS} />
              </span>
              <b>{run.bells}<small> / {MAX_BELLS}</small></b>
            </div>
            <div className="sg08-gauge sg08-gauge--inc" data-testid="incidents" data-count={run.inc} data-over={run.inc > 0}>
              <span className="sg08-gl">{t.incidents}</span>
              <b>{run.inc}</b>
            </div>
          </div>
          <p className="sg08-simtag">{t.sim}</p>

          {!run.over && slip && (
            <div className="sg08-slip" key={slip.id} data-testid="slip" data-slip={slip.id} data-stage={run.stage} data-blur={run.stage === 'tired'}>
              <p className="sg08-slip-n">{t.slipOf(run.i + 1)}</p>
              <dl>
                <div>
                  <dt>{t.tool}</dt>
                  <dd className="sg08-call">{nb(slip.call)}</dd>
                </div>
                {slip.rows[lang].map(([k, v]) => (
                  <div key={k}>
                    <dt>{k}</dt>
                    <dd>{nb(v)}</dd>
                  </div>
                ))}
              </dl>
              {mark && (
                <span className="sg08-mark" data-tone={mark.tone}>
                  {mark.text}
                </span>
              )}
            </div>
          )}

          <p className="sg08-note" role="status" aria-live="polite" data-tone={run.over ? (won ? 'good' : 'bad') : tone} data-testid={run.over ? 'verdict' : 'note'}>
            {nb(run.over ? verdict : status)}
          </p>

          {!run.over && run.stage === 'bell' && (
            <div className="sg08-stamps">
              <button type="button" className="sg08-stamp sg08-stamp--no" data-testid="stamp-no" onClick={() => decide('no')}>
                {t.no}
              </button>
              <button type="button" className="sg08-stamp sg08-stamp--yes" data-testid="stamp-yes" onClick={() => decide('yes')}>
                {t.yes}
              </button>
            </div>
          )}
          {!run.over && run.stage === 'done' && run.hold && (
            <div className="sg08-stamps">
              <button type="button" className="sg08-go" data-testid="continue" onClick={next}>
                {t.next}
              </button>
            </div>
          )}

          <ol className="sg08-rail" aria-hidden="true">
            {SLIPS.map((s) => {
              const st = run.stubs.find((x) => x.id === s.id);
              return <li key={s.id} data-out={st ? st.out : slip && slip.id === s.id && !run.over ? 'now' : 'todo'} />;
            })}
          </ol>

          {run.over && !won && (
            <div className="sg08-stamps">
              <button type="button" className="sg08-stamp sg08-stamp--no" data-testid="replay" onClick={start}>
                {t.replay}
              </button>
              <button
                type="button"
                className="sg08-stamp sg08-stamp--yes"
                data-testid="change"
                onClick={() => {
                  sfx('select');
                  setRun(START);
                  setPhase('rules');
                }}
              >
                {t.change}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
