'use client';

import { useEffect, useRef, useState } from 'react';
import { sfx } from '../sound';
import type { SignatureProps } from './list';
import './c09.css';

/**
 * 09 · « Le passe » — the kitchen pass of the lead agent.
 * Four courses: (1) write one helper's ticket (task, context, format, limit) and see what comes
 * back; (2) run the big order with three helpers on a timeline, against the solo baseline;
 * (3) taste the returns and flag the two lines that disagree; (4) a small order, where the right
 * brigade is no brigade. Every outcome is computed from what the learner set on the pass.
 * All durations and token counts are illustrative.
 */

type Lang = 'fr' | 'en';
type Lamp = 'off' | 'cook' | 'ok' | 'bad';
type Phase = 'idle' | 'run' | 'done';
type Part = 'task' | 'ctx' | 'fmt' | 'lim';
type Job = 'rest' | 'budget' | 'delai' | 'brief';

const PARTS: Part[] = ['task', 'ctx', 'fmt', 'lim'];
const GOOD: Record<Part, number> = { task: 1, ctx: 2, fmt: 1, lim: 1 };
const JOBS: Job[] = ['rest', 'budget', 'delai', 'brief'];
const TOKEN_CAP = 6000;

const T = {
  fr: {
    steps: ['Le bon', 'Le service', 'Le goût', 'La petite commande'],
    illus: 'durées et tokens illustratifs',
    order: 'Commande',
    orders: [
      'Trouver le budget validé par Inès Caron (Brume & Quai).',
      'Le brief de jeudi pour Inès : budget, délai, puis le texte.',
      'Deux retours sont sur le passe. Goûte avant d’envoyer.',
      'Reformuler l’objet de l’e-mail à Inès, en trois lignes.',
    ],
    hint1: 'Écris le bon de l’aidant : touche une ligne pour changer sa valeur.',
    hint2: 'Donne une tâche à chaque aidant, et dis qui attend les notes.',
    hint3: 'Touche les deux lignes qui se contredisent, puis décide.',
    hint4: 'Choisis la brigade pour cette commande.',
    parts: { task: 'Tâche', ctx: 'Contexte', fmt: 'Retour', lim: 'Limite' } as Record<Part, string>,
    pick: 'à choisir',
    opts: {
      task: ['occupe-toi de la recherche', 'trouver le budget validé par Inès', 'tout savoir sur Brume & Quai'],
      ctx: ['rien', 'toute la conversation du chef (40 échanges)', 'dossier brume-et-quai'],
      fmt: ['texte libre', '{"reponse": …, "source": …}'],
      lim: ['aucune', '5 appels d’outils'],
    } as Record<Part, string[]>,
    change: 'changer',
    ticket: (n: number) => `Bon nº ${n}`,
    helper: (n: number) => `Aidant ${n}`,
    lead: 'Chef',
    solo: 'Seul',
    jobs: { rest: 'au repos', budget: 'chercher le budget', delai: 'chercher le délai', brief: 'rédiger le brief' } as Record<Job, string>,
    now: 'part tout de suite',
    wait: 'attend les notes',
    template: 'Contexte, retour, limite : comme le bon nº 1.',
    service: 'Service !',
    next: 'Commande suivante',
    back: 'Retour',
    calls: 'appels',
    tokens: 'tokens',
    bill: 'Addition',
    cap: 'plafond',
    sec: 's',
    serve: 'Servir le brief',
    flag: 'Signaler l’écart',
    retA: 'Retour · budget',
    retB: 'Retour · délai',
    brigade: 'Brigade',
    less: 'Un aidant de moins',
    more: 'Un aidant de plus',
    crew: (n: number) => (n === 0 ? 'Le chef seul' : n === 1 ? 'Chef + 1 aidant' : `Chef + ${n} aidants`),
    r1: {
      vague: 'Deux pages sur Brume & Quai. Aucun chiffre.',
      otherJson: '{"reponse": "22 000 €", "source": "devis-autre-client.pdf"}',
      otherText: '« Le budget serait de 22 000 €, d’après un devis… »',
      text: '« Après lecture du dossier, il semble que le budget validé soit… » (deux pages)',
      good: '{"reponse": "15 000 €", "source": "devis-brume-et-quai.pdf"}',
    },
    n1: {
      task: 'Tâche floue : l’aidant a cherché « tout », pas le budget.',
      ctxNone: 'Sans contexte, il a fouillé tout l’index : c’est le budget d’un autre client.',
      ctxAll: 'Contexte noyé : 40 échanges relus à chaque appel. L’addition explose.',
      fmt: 'Texte libre : où est le chiffre, d’où vient-il ? Le chef ne peut rien vérifier.',
      lim: 'Sans limite, il revérifie sans fin : 14 appels pour un chiffre.',
      ok: 'Retour court, sourcé, vérifiable. Le bon est complet.',
    },
    r2: {
      budget: '15 000 € · devis-brume-et-quai.pdf',
      delai: '30 juin · e-mail du 3 juin',
      brief: (b: string, d: string) => `Brief : budget ${b}, livraison ${d}`,
      dup: 'même retour, payé une seconde fois',
      stuck: 'attend des notes…',
      full: ['15 000 €', '30 juin'],
    },
    n2: {
      deadlock: 'Tout le monde attend des notes que personne ne cherche.',
      dup: 'Deux aidants, même tâche : le même retour, payé deux fois.',
      nowriter: 'Personne ne rédige : la commande demandait un brief.',
      early: 'La rédaction est partie en même temps que la recherche : elle n’avait pas les notes.',
      missing: 'Il manque une note à la rédaction : le brief a un trou.',
      ok: (t: number, k: string) => `${t} s contre 60 s seul : plus vite, mais ${k} tokens au lieu de 12 000.`,
    },
    n3: {
      none: 'Touche d’abord deux lignes.',
      wrong: 'Ces deux lignes ne se contredisent pas. Compare les montants.',
      served: 'Servi : le chef a choisi un chiffre en silence. Un écart de 3 000 € part chez Inès.',
      ok: 'Écart signalé : 15 000 € (devis) contre 18 000 € (e-mail du 3 juin). L’humain tranche.',
    },
    n4: {
      many: (n: number, t: number, k: string) => `${n} aidant${n > 1 ? 's' : ''} pour trois lignes : ${t} s et ${k} tokens, contre 6 s et 1 000 seul.`,
      ok: 'Un seul agent suffit : 6 s, 1 000 tokens. Cette tâche ne se découpe pas.',
    },
    done: 'Service terminé.',
    cooking: 'En cuisine…',
  },
  en: {
    steps: ['The ticket', 'The service', 'The tasting', 'The small order'],
    illus: 'durations and tokens are illustrative',
    order: 'Order',
    orders: [
      'Find the budget Inès Caron approved (Brume & Quai).',
      'Thursday’s brief for Inès: budget, deadline, then the text.',
      'Two returns are on the pass. Taste before sending.',
      'Rephrase the subject of the email to Inès, in three lines.',
    ],
    hint1: 'Write the helper’s ticket: tap a line to change its value.',
    hint2: 'Give each helper a task, and say who waits for the notes.',
    hint3: 'Tap the two lines that disagree, then decide.',
    hint4: 'Choose the brigade for this order.',
    parts: { task: 'Task', ctx: 'Context', fmt: 'Return', lim: 'Limit' } as Record<Part, string>,
    pick: 'to choose',
    opts: {
      task: ['take care of the research', 'find the budget Inès approved', 'everything about Brume & Quai'],
      ctx: ['nothing', 'the lead’s whole conversation (40 exchanges)', 'the brume-et-quai folder'],
      fmt: ['free text', '{"reponse": …, "source": …}'],
      lim: ['none', '5 tool calls'],
    } as Record<Part, string[]>,
    change: 'change',
    ticket: (n: number) => `Ticket no. ${n}`,
    helper: (n: number) => `Helper ${n}`,
    lead: 'Lead',
    solo: 'Solo',
    jobs: { rest: 'resting', budget: 'find the budget', delai: 'find the deadline', brief: 'write the brief' } as Record<Job, string>,
    now: 'starts right away',
    wait: 'waits for the notes',
    template: 'Context, return, limit: as on ticket no. 1.',
    service: 'Service!',
    next: 'Next order',
    back: 'Back',
    calls: 'calls',
    tokens: 'tokens',
    bill: 'Bill',
    cap: 'cap',
    sec: 's',
    serve: 'Serve the brief',
    flag: 'Flag the gap',
    retA: 'Return · budget',
    retB: 'Return · deadline',
    brigade: 'Brigade',
    less: 'One helper fewer',
    more: 'One more helper',
    crew: (n: number) => (n === 0 ? 'The lead alone' : n === 1 ? 'Lead + 1 helper' : `Lead + ${n} helpers`),
    r1: {
      vague: 'Two pages about Brume & Quai. No figure.',
      otherJson: '{"reponse": "22 000 €", "source": "devis-autre-client.pdf"}',
      otherText: '“The budget seems to be €22,000, according to a quote…”',
      text: '“Having read the folder, it seems the approved budget is…” (two pages)',
      good: '{"reponse": "15 000 €", "source": "devis-brume-et-quai.pdf"}',
    },
    n1: {
      task: 'Vague task: the helper looked for “everything”, not the budget.',
      ctxNone: 'With no context, it searched the whole index: that is another client’s budget.',
      ctxAll: 'Drowned context: 40 exchanges reread at every call. The bill explodes.',
      fmt: 'Free text: where is the figure, where does it come from? The lead cannot check.',
      lim: 'With no limit, it rechecks forever: 14 calls for one figure.',
      ok: 'A short, sourced, checkable return. The ticket is complete.',
    },
    r2: {
      budget: '15 000 € · devis-brume-et-quai.pdf',
      delai: '30 June · e-mail du 3 juin',
      brief: (b: string, d: string) => `Brief: budget ${b}, delivery ${d}`,
      dup: 'same return, paid a second time',
      stuck: 'waiting for notes…',
      full: ['15 000 €', '30 June'],
    },
    n2: {
      deadlock: 'Everyone waits for notes nobody is looking for.',
      dup: 'Two helpers, same task: the same return, paid twice.',
      nowriter: 'Nobody writes: the order asked for a brief.',
      early: 'The writing started at the same time as the research: it did not have the notes.',
      missing: 'The writing is missing a note: the brief has a hole.',
      ok: (t: number, k: string) => `${t} s against 60 s solo: faster, but ${k} tokens instead of 12,000.`,
    },
    n3: {
      none: 'Tap two lines first.',
      wrong: 'These two lines do not disagree. Compare the amounts.',
      served: 'Served: the lead picked a figure silently. A €3,000 gap goes out to Inès.',
      ok: 'Gap flagged: €15,000 (quote) against €18,000 (email of 3 June). The human decides.',
    },
    n4: {
      many: (n: number, t: number, k: string) => `${n} helper${n > 1 ? 's' : ''} for three lines: ${t} s and ${k} tokens, against 6 s and 1,000 solo.`,
      ok: 'One agent is enough: 6 s, 1,000 tokens. This task does not split.',
    },
    done: 'Service over.',
    cooking: 'In the kitchen…',
  },
};

/** Keep amounts on one line (« 15 000 € »). */
const nb = (s: string) => s.replace(/(\d) (?=\d{3}|€)/g, '$1\u00a0');
const fmtK = (n: number, lang: Lang) => n.toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-GB').replace(/\u202f/g, '\u00a0');

/* ---------- course 1: one ticket ---------- */
type Ticket = Record<Part, number | null>;
interface R1 { ok: boolean; why: keyof (typeof T)['fr']['n1']; ret: keyof (typeof T)['fr']['r1']; calls: number; tokens: number; bad: Part | null }

function cook1(tk: Ticket): R1 {
  const good = (p: Part) => tk[p] === GOOD[p];
  const calls = tk.lim === 1 ? (good('task') ? 3 : 5) : 14;
  const ctxSize = tk.ctx === 0 ? 100 : tk.ctx === 1 ? 4000 : 500;
  const tokens = calls * (500 + ctxSize);
  if (!good('task')) return { ok: false, why: 'task', ret: 'vague', calls, tokens, bad: 'task' };
  if (tk.ctx === 0) return { ok: false, why: 'ctxNone', ret: tk.fmt === 1 ? 'otherJson' : 'otherText', calls, tokens, bad: 'ctx' };
  const ret = tk.fmt === 1 ? 'good' : 'text';
  if (tk.ctx === 1) return { ok: false, why: 'ctxAll', ret, calls, tokens, bad: 'ctx' };
  if (!good('fmt')) return { ok: false, why: 'fmt', ret, calls, tokens, bad: 'fmt' };
  if (!good('lim')) return { ok: false, why: 'lim', ret, calls, tokens, bad: 'lim' };
  return { ok: true, why: 'ok', ret, calls, tokens, bad: null };
}

/* ---------- course 2: the brigade ---------- */
interface Seat { job: Job; wait: boolean }
interface Bar { start: number; dur: number; tone: 'help' | 'lead' | 'solo' | 'bad' }
interface R2 {
  ok: boolean;
  why: 'deadlock' | 'dup' | 'nowriter' | 'early' | 'missing' | 'ok';
  time: number;
  tokens: number;
  lamps: Lamp[];
  bars: Bar[][];
  leadBars: Bar[];
  /** per seat: what comes back */
  rets: ({ kind: 'budget' | 'delai' | 'dup' | 'stuck' } | { kind: 'brief'; b: boolean; d: boolean } | null)[];
}

function cook2(seats: Seat[]): R2 {
  const active = seats.map((s, i) => ({ ...s, i })).filter((s) => s.job !== 'rest');
  const w1 = active.filter((s) => !s.wait);
  const w2 = active.filter((s) => s.wait);
  const tokens = 4000 + 6000 * active.length;
  const lamps: Lamp[] = seats.map(() => 'off');
  const bars: Bar[][] = seats.map(() => []);
  const rets: R2['rets'] = seats.map(() => null);
  if (w1.length === 0) {
    active.forEach((s) => {
      lamps[s.i] = 'bad';
      rets[s.i] = { kind: 'stuck' };
    });
    return { ok: false, why: 'deadlock', time: 0, tokens: 4000, lamps, bars, leadBars: [{ start: 0, dur: 3, tone: 'lead' }], rets };
  }
  const t1 = 3;
  const t2 = t1 + 20;
  const end = w2.length ? t2 + 20 : t2;
  const notes = new Set(w1.filter((s) => s.job !== 'brief').map((s) => s.job));
  const seen = new Set<Job>();
  let dup = false;
  let hole = false;
  let early = false;
  for (const s of active) {
    const start = s.wait ? t2 : t1;
    if (seen.has(s.job)) {
      dup = true;
      lamps[s.i] = 'bad';
      bars[s.i] = [{ start, dur: 20, tone: 'bad' }];
      rets[s.i] = { kind: 'dup' };
      continue;
    }
    seen.add(s.job);
    if (s.job === 'brief') {
      const b = s.wait && notes.has('budget');
      const d = s.wait && notes.has('delai');
      if (!s.wait) early = true;
      if (!b || !d) hole = true;
      lamps[s.i] = b && d ? 'ok' : 'bad';
      bars[s.i] = [{ start, dur: 20, tone: b && d ? 'help' : 'bad' }];
      rets[s.i] = { kind: 'brief', b, d };
    } else {
      lamps[s.i] = 'ok';
      bars[s.i] = [{ start, dur: 20, tone: 'help' }];
      rets[s.i] = { kind: s.job as 'budget' | 'delai' };
    }
  }
  const time = end + 3;
  const leadBars: Bar[] = [{ start: 0, dur: 3, tone: 'lead' }, { start: end, dur: 3, tone: 'lead' }];
  const why: R2['why'] = dup ? 'dup' : !seen.has('brief') ? 'nowriter' : early ? 'early' : hole ? 'missing' : 'ok';
  return { ok: why === 'ok' && time < 60, why, time, tokens, lamps, bars, leadBars, rets };
}

/* ---------- course 4: the small order ---------- */
function cook4(n: number) {
  if (n === 0) return { ok: true, time: 6, tokens: 1000, bars: [] as Bar[][], leadBars: [{ start: 0, dur: 6, tone: 'lead' as const }] };
  const start = 2 * n;
  const bars: Bar[][] = Array.from({ length: n }, () => [{ start, dur: 6, tone: 'bad' as const }]);
  return { ok: false, time: start + 9, tokens: 1000 + 2500 * n, bars, leadBars: [{ start: 0, dur: start, tone: 'lead' as const }, { start: start + 6, dur: 3, tone: 'lead' as const }] };
}

/** Count up to `target` while the service runs (the bill adding up). */
function useBill(target: number, phase: Phase, runId: number) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (phase !== 'run') {
      setV(phase === 'done' ? target : 0);
      return undefined;
    }
    let n = 0;
    setV(0);
    const id = setInterval(() => {
      n += 1;
      setV(Math.round((target * Math.min(n, 12)) / 12 / 100) * 100);
      if (n >= 12) clearInterval(id);
    }, 110);
    return () => clearInterval(id);
  }, [target, phase, runId]);
  return v;
}

function Cyc() {
  return (
    <svg className="sg09-cyc" viewBox="0 0 16 16" aria-hidden="true">
        <path d="M3 8a5 5 0 0 1 8.5-3.5M13 8a5 5 0 0 1-8.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M11.5 1.5v3.2H8.3M4.5 14.5v-3.2h3.2" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
  );
}

function Pass({ lamps, tickets }: { lamps: Lamp[]; tickets: number }) {
  const xs = [70, 160, 250];
  return (
    <div className="sg09-scene" aria-hidden="true">
      <svg viewBox="0 0 320 112" preserveAspectRatio="xMidYMid meet">
        <rect width="320" height="112" fill="#0f2a20" />
        <g stroke="#1e4d3b" strokeWidth="1">
          <path d="M0 28 H320 M0 50 H320 M0 72 H320" />
          <path d="M40 6 V28 M120 6 V28 M200 6 V28 M280 6 V28 M80 28 V50 M160 28 V50 M240 28 V50 M40 50 V72 M120 50 V72 M200 50 V72 M280 50 V72" />
        </g>
        {/* ticket rail */}
        <rect x="0" y="4" width="320" height="4" fill="#c9b67a" />
        {[0, 1, 2].map((i) => (
          <g key={i} className="sg09-tk" data-on={i < tickets}>
            <rect x={xs[i] - 34} y="6" width="16" height="22" fill="#efe7d8" />
            <rect x={xs[i] - 31} y="12" width="10" height="1.5" fill="#6b4a2f" />
            <rect x={xs[i] - 31} y="16" width="7" height="1.5" fill="#6b4a2f" />
            <rect x={xs[i] - 31} y="20" width="9" height="1.5" fill="#6b4a2f" />
            <rect x={xs[i] - 29} y="3" width="6" height="6" fill="#2d2721" />
          </g>
        ))}
        {/* heat lamps */}
        {xs.map((x, i) => (
          <g key={x} className="sg09-lamp" data-state={lamps[i] || 'off'}>
            <rect x={x - 1} y="8" width="2" height="18" fill="#c9b67a" />
            <path className="sg09-cone" d={`M${x - 12} 40 L${x - 30} 84 H${x + 30} L${x + 12} 40 Z`} fill="#e3c27a" />
            <path d={`M${x - 14} 40 Q${x} 16 ${x + 14} 40 Z`} fill="#c9b67a" />
            <rect x={x - 16} y="39" width="32" height="3" fill="#2d2721" />
            {/* the plate that comes back */}
            <g className="sg09-plate">
              <ellipse cx={x} cy="82" rx="22" ry="5" fill="#efe7d8" />
              <ellipse cx={x} cy="81" rx="13" ry="3" fill="#c9b67a" opacity="0.5" />
              <path className="sg09-food" d={`M${x - 8} 80 Q${x} 68 ${x + 8} 80 Z`} fill="#1e4d3b" />
              <g className="sg09-cross" stroke="#7c2f2a" strokeWidth="3" strokeLinecap="round">
                <path d={`M${x - 6} 70 L${x + 6} 80 M${x + 6} 70 L${x - 6} 80`} />
              </g>
            </g>
            <g className="sg09-steam" fill="none" stroke="#efe7d8" strokeWidth="1.5" strokeLinecap="round">
              <path d={`M${x - 6} 74 q-3 -5 0 -9 q3 -4 0 -8`} />
              <path d={`M${x + 6} 74 q3 -5 0 -9 q-3 -4 0 -8`} />
            </g>
          </g>
        ))}
        {/* the pass */}
        <rect x="0" y="86" width="320" height="26" fill="#6b4a2f" />
        <rect x="0" y="86" width="320" height="5" fill="#c9b67a" />
        <rect x="0" y="91" width="320" height="2" fill="#2d2721" opacity="0.5" />
      </svg>
    </div>
  );
}

function Timeline({ lang, lanes, scale, soloTime, total, phase, runId }: { lang: Lang; lanes: { label: string; bars: Bar[] }[]; scale: number; soloTime: number; total: number; phase: Phase; runId: number }) {
  const t = T[lang];
  const all = [...lanes, { label: t.solo, bars: [{ start: 0, dur: soloTime, tone: 'solo' as const }] }];
  return (
    <div className="sg09-tl" data-phase={phase} aria-hidden="true">
      {all.map((l, i) => (
        <div className="sg09-row" key={`${l.label}-${i}`}>
          <span className="sg09-rowl">{l.label}</span>
          <span className="sg09-track">
            {(phase !== 'idle' || i === all.length - 1) &&
              l.bars.map((b, j) => (
                <i
                  key={`${runId}-${j}`}
                  className="sg09-bar"
                  data-tone={b.tone}
                  style={{ left: `${(b.start / scale) * 100}%`, width: `${(b.dur / scale) * 100}%`, animationDelay: b.tone === 'solo' ? '0s' : `${(b.start / scale) * 1.4}s`, animationDuration: b.tone === 'solo' ? '0s' : `${Math.max(0.2, (b.dur / scale) * 1.4)}s` }}
                />
              ))}
          </span>
          <span className="sg09-rowt">{i === all.length - 1 ? `${soloTime} ${t.sec}` : i === all.length - 2 && phase === 'done' && total > 0 ? `${total} ${t.sec}` : ''}</span>
        </div>
      ))}
    </div>
  );
}

export default function Game({ lang, onSolved, onMistake }: SignatureProps) {
  const t = T[lang];
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState<Phase>('idle');
  const [runId, setRunId] = useState(0);
  const [won, setWon] = useState(false);
  const solved = useRef(false);

  const [ticket, setTicket] = useState<Ticket>({ task: null, ctx: null, fmt: null, lim: null });
  const [seats, setSeats] = useState<Seat[]>([{ job: 'rest', wait: false }, { job: 'rest', wait: false }, { job: 'rest', wait: false }]);
  const [picked, setPicked] = useState<string[]>([]);
  const [taste, setTaste] = useState<'none' | 'wrong' | 'served' | 'ok' | null>(null);
  const [crew, setCrew] = useState(3);

  const r1 = cook1(ticket);
  const r2 = cook2(seats);
  const r4 = cook4(crew);
  const ok = step === 0 ? r1.ok : step === 1 ? r2.ok : step === 2 ? taste === 'ok' : r4.ok;

  // A service runs for a moment, then the plates come back.
  useEffect(() => {
    if (phase !== 'run') return undefined;
    const id = setTimeout(() => {
      setPhase('done');
      if (ok) {
        sfx(step === 3 ? 'solve' : 'correct');
        if (step === 3) setWon(true);
      } else {
        sfx('wrong');
        onMistake?.();
      }
    }, 1700);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, runId]);

  useEffect(() => {
    if (!won || solved.current) return undefined;
    const id = setTimeout(() => {
      if (solved.current) return;
      solved.current = true;
      onSolved();
    }, 700);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [won]);

  const billTarget = step === 0 ? r1.tokens : step === 1 ? r2.tokens : step === 3 ? r4.tokens : 0;
  const bill = useBill(billTarget, phase, runId);

  const edit = () => {
    if (phase !== 'idle') setPhase('idle');
  };
  const service = () => {
    sfx('latch');
    setRunId((n) => n + 1);
    setPhase('run');
  };
  const nextStep = () => {
    sfx('open');
    setPhase('idle');
    setStep((s) => Math.min(3, s + 1));
  };

  const busy = phase === 'run';
  const ticketReady = PARTS.every((p) => ticket[p] !== null);
  const activeSeats = seats.filter((s) => s.job !== 'rest').length;

  // What the scene shows.
  let lamps: Lamp[] = ['off', 'off', 'off'];
  let rail = 0;
  if (step === 0) {
    rail = ticketReady ? 1 : 0;
    lamps = [phase === 'run' ? 'cook' : phase === 'done' ? (r1.ok ? 'ok' : 'bad') : 'off', 'off', 'off'];
  } else if (step === 1) {
    rail = activeSeats;
    lamps = seats.map((s, i) => (phase === 'run' ? (r2.why === 'deadlock' || s.job === 'rest' ? 'off' : 'cook') : phase === 'done' ? r2.lamps[i] : 'off'));
  } else if (step === 2) {
    rail = 2;
    lamps = ['ok', 'ok', 'off'];
  } else {
    rail = crew;
    lamps = [0, 1, 2].map((i) => (i >= crew ? 'off' : phase === 'run' ? 'cook' : phase === 'done' ? 'bad' : 'off')) as Lamp[];
  }

  // The one-line verdict.
  let note = '';
  let tone: 'good' | 'bad' | 'info' = 'info';
  if (step === 0 && phase === 'done') {
    note = t.n1[r1.why];
    tone = r1.ok ? 'good' : 'bad';
  } else if (step === 1 && phase === 'done') {
    note = r2.why === 'ok' ? t.n2.ok(r2.time, fmtK(r2.tokens, lang)) : t.n2[r2.why];
    tone = r2.ok ? 'good' : 'bad';
  } else if (step === 2 && taste) {
    note = t.n3[taste];
    tone = taste === 'ok' ? 'good' : 'bad';
  } else if (step === 3 && phase === 'done') {
    note = r4.ok ? t.n4.ok : t.n4.many(crew, r4.time, fmtK(r4.tokens, lang));
    tone = r4.ok ? 'good' : 'bad';
  } else if (!busy) {
    note = [t.hint1, t.hint2, t.hint3, t.hint4][step];
  } else note = t.cooking;

  const cycle = (p: Part) => {
    sfx('tick');
    edit();
    setTicket((k) => ({ ...k, [p]: k[p] === null ? 0 : (k[p]! + 1) % T.fr.opts[p].length }));
  };
  const cycleJob = (i: number) => {
    sfx('tick');
    edit();
    setSeats((ss) => ss.map((s, j) => (j === i ? { ...s, job: JOBS[(JOBS.indexOf(s.job) + 1) % JOBS.length] } : s)));
  };
  const toggleWait = (i: number) => {
    sfx('tick');
    edit();
    setSeats((ss) => ss.map((s, j) => (j === i ? { ...s, wait: !s.wait } : s)));
  };
  const pick = (id: string) => {
    if (taste === 'ok') return;
    sfx('select');
    setTaste(null);
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id].slice(-2)));
  };
  const decide = (how: 'serve' | 'flag') => {
    if (taste === 'ok') return;
    let res: 'none' | 'wrong' | 'served' | 'ok' = 'ok';
    if (how === 'serve') res = 'served';
    else if (picked.length < 2) res = 'none';
    else if (!(picked.includes('a1') && picked.includes('b3'))) res = 'wrong';
    setTaste(res);
    if (res === 'ok') sfx('correct');
    else {
      sfx('wrong');
      if (res !== 'none') onMistake?.();
    }
  };

  const LINES_A: [string, string][] = [['a1', '"reponse": "15 000 €"'], ['a2', '"source": "devis-brume-et-quai.pdf"']];
  const LINES_B: [string, string][] = [['b1', `"reponse": "${t.r2.full[1]}"`], ['b2', '"source": "e-mail du 3 juin"'], ['b3', lang === 'fr' ? '"note": "budget cité : 18 000 €"' : '"note": "budget quoted: 18 000 €"']];

  const showNext = !won && ((step !== 2 && phase === 'done' && ok) || (step === 2 && taste === 'ok'));

  return (
    <div className="sg09" data-game="c09" data-step={step + 1} data-phase={phase} data-solved={won ? 'true' : 'false'}>
      <ol className="sg09-steps" aria-label={t.steps.join(', ')}>
        {t.steps.map((s, i) => (
          <li key={s} data-state={i < step || won ? 'done' : i === step ? 'now' : 'todo'} aria-current={i === step ? 'step' : undefined}>
            <b>{i + 1}</b>
            <span>{s}</span>
          </li>
        ))}
      </ol>

      <Pass lamps={lamps} tickets={rail} />

      <p className="sg09-order">
        <span>{t.order}</span>
        {t.orders[step]}
      </p>

      {step === 0 && (
        <div className="sg09-ticket" data-testid="ticket">
          <p className="sg09-tkh">{t.ticket(1)} · {t.helper(1)}</p>
          {PARTS.map((p) => (
            <button
              key={p}
              type="button"
              className="sg09-line"
              data-testid={`part-${p}`}
              data-value={ticket[p] === null ? '' : ticket[p]!}
              data-bad={phase === 'done' && r1.bad === p}
              disabled={busy || (phase === 'done' && r1.ok)}
              aria-label={`${t.parts[p]} : ${ticket[p] === null ? t.pick : t.opts[p][ticket[p]!]}. ${t.change}`}
              onClick={() => cycle(p)}
            >
              <span className="sg09-lk">{t.parts[p]}</span>
              <span className="sg09-lv" data-empty={ticket[p] === null}>{ticket[p] === null ? t.pick : t.opts[p][ticket[p]!]}</span>
              <Cyc />
            </button>
          ))}
        </div>
      )}

      {step === 1 && (
        <div className="sg09-seats">
          {seats.map((s, i) => (
            <div className="sg09-seat" key={i} data-rest={s.job === 'rest'}>
              <p className="sg09-tkh">{t.helper(i + 1)}</p>
              <button
                type="button"
                className="sg09-line"
                data-testid={`job-${i}`}
                data-value={s.job}
                disabled={busy || (phase === 'done' && r2.ok)}
                aria-label={`${t.helper(i + 1)}, ${t.parts.task} : ${t.jobs[s.job]}. ${t.change}`}
                onClick={() => cycleJob(i)}
              >
                <span className="sg09-lv" data-empty={s.job === 'rest'}>{t.jobs[s.job]}</span>
                <Cyc />
              </button>
              <button
                type="button"
                className="sg09-wait"
                data-testid={`wait-${i}`}
                data-on={s.wait}
                aria-pressed={s.wait}
                disabled={busy || s.job === 'rest' || (phase === 'done' && r2.ok)}
                onClick={() => toggleWait(i)}
              >
                {s.wait ? t.wait : t.now}
              </button>
            </div>
          ))}
          <p className="sg09-small">{t.template}</p>
        </div>
      )}

      {step === 2 && (
        <div className="sg09-rets">
          {([[t.retA, LINES_A], [t.retB, LINES_B]] as [string, [string, string][]][]).map(([title, lines]) => (
            <div className="sg09-ret" key={title}>
              <p className="sg09-tkh">{title}</p>
              {lines.map(([id, text]) => (
                <button key={id} type="button" className="sg09-rl" data-testid={`line-${id}`} data-on={picked.includes(id)} aria-pressed={picked.includes(id)} disabled={taste === 'ok'} onClick={() => pick(id)}>
                  {nb(text)}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}

      {step === 3 && (
        <div className="sg09-crew">
          <button type="button" className="sg09-pm" data-testid="crew-less" aria-label={t.less} disabled={busy || won || crew === 0} onClick={() => { sfx('tick'); edit(); setCrew((n) => Math.max(0, n - 1)); }}>
            −
          </button>
          <p className="sg09-crewv" data-testid="crew" data-count={crew} aria-live="polite">
            <span>{t.brigade}</span>
            {t.crew(crew)}
          </p>
          <button type="button" className="sg09-pm" data-testid="crew-more" aria-label={t.more} disabled={busy || won || crew === 3} onClick={() => { sfx('tick'); edit(); setCrew((n) => Math.min(3, n + 1)); }}>
            +
          </button>
        </div>
      )}

      {/* what the service measured */}
      {step === 0 && phase !== 'idle' && (
        <div className="sg09-out">
          <div className="sg09-bill" data-over={phase === 'done' && r1.tokens > TOKEN_CAP}>
            <span className="sg09-billl">{t.bill}</span>
            <span className="sg09-meter">
              <i key={runId} style={{ transform: `scaleX(${Math.min(1, r1.tokens / 15000)})` }} />
              <em style={{ left: `${(TOKEN_CAP / 15000) * 100}%` }} />
            </span>
            <b>{phase === 'done' ? `${r1.calls} ${t.calls} · ` : ''}{fmtK(bill, lang)} {t.tokens}</b>
          </div>
          {phase === 'done' && <p className="sg09-plateline" data-tone={r1.ret === 'good' ? 'ok' : 'bad'} data-testid="return">{nb(t.r1[r1.ret])}</p>}
        </div>
      )}
      {step === 1 && (
        <div className="sg09-out">
          <Timeline
            lang={lang}
            lanes={[...seats.map((_, i) => ({ label: t.helper(i + 1), bars: r2.bars[i] })), { label: t.lead, bars: r2.leadBars }]}
            scale={60}
            soloTime={60}
            total={r2.time}
            phase={phase}
            runId={runId}
          />
          <p className="sg09-sum">
            <span>{t.solo} : 60 {t.sec} · {fmtK(12000, lang)} {t.tokens}</span>
            {phase !== 'idle' && <b data-testid="sum">{phase === 'done' && r2.time > 0 ? `${r2.time} ${t.sec} · ` : ''}{fmtK(bill, lang)} {t.tokens}</b>}
          </p>
          {phase === 'done' && (
            <ul className="sg09-plates">
              {r2.rets.map((r, i) =>
                r ? (
                  <li key={i} data-tone={r.kind === 'dup' || r.kind === 'stuck' || (r.kind === 'brief' && !(r.b && r.d)) ? 'bad' : 'ok'}>
                    <span>{t.helper(i + 1)}</span>
                    {nb(r.kind === 'brief' ? t.r2.brief(r.b ? t.r2.full[0] : '[ ? ]', r.d ? t.r2.full[1] : '[ ? ]') : t.r2[r.kind])}
                  </li>
                ) : null,
              )}
            </ul>
          )}
        </div>
      )}
      {step === 3 && (
        <div className="sg09-out">
          <Timeline
            lang={lang}
            lanes={[...r4.bars.map((b, i) => ({ label: t.helper(i + 1), bars: b })), { label: t.lead, bars: r4.leadBars }]}
            scale={16}
            soloTime={6}
            total={r4.time}
            phase={phase}
            runId={runId}
          />
          <p className="sg09-sum">
            <span>{t.solo} : 6 {t.sec} · {fmtK(1000, lang)} {t.tokens}</span>
            {phase !== 'idle' && <b data-testid="sum">{phase === 'done' ? `${r4.time} ${t.sec} · ` : ''}{fmtK(bill, lang)} {t.tokens}</b>}
          </p>
        </div>
      )}

      <p className="sg09-note" role="status" aria-live="polite" data-tone={tone} data-testid="note">
        {nb(won ? `${note} ${t.done}` : note)}
      </p>

      <div className="sg09-actions">
        {step === 2 && taste !== 'ok' && (
          <>
            <button type="button" className="sg09-btn sg09-btn--ghost" data-testid="serve" onClick={() => decide('serve')}>
              {t.serve}
            </button>
            <button type="button" className="sg09-btn" data-testid="flag" onClick={() => decide('flag')}>
              {t.flag}
            </button>
          </>
        )}
        {step !== 2 && !showNext && !won && (
          <button
            type="button"
            className="sg09-btn sg09-btn--bell"
            data-testid="service"
            disabled={busy || (step === 0 && !ticketReady) || (step === 1 && activeSeats === 0)}
            onClick={service}
          >
            {t.service}
          </button>
        )}
        {showNext && (
          <button type="button" className="sg09-btn" data-testid="next" onClick={nextStep}>
            {t.next}
          </button>
        )}
      </div>
      <p className="sg09-illus">{t.illus}</p>
    </div>
  );
}
