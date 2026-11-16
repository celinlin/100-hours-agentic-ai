'use client';

import { useEffect, useRef, useState } from 'react';
import type { SignatureProps } from './list';
import { sfx } from '../sound';
import './c07.css';

/**
 * 07 · Le carnet de suite.
 * Three evenings at the desk with the Brume & Quai file. Each evening the learner decides
 * what is written in a four-line notebook and which old lines are struck out. At night the
 * model forgets everything; in the morning every answer is computed from the notebook alone:
 * a missing step is redone, a missing decision is invented, a stale line contradicts the
 * dated source, personal or secret data raises a privacy incident.
 */

type L = { fr: string; en: string };
type Phase = 'evening' | 'night' | 'morning';
type Kind = 'fact' | 'sensitive' | 'noise';

interface Note {
  id: string;
  day: number;
  kind: Kind;
  text: L;
}

const LINES = 4;

const NOTES: Note[] = [
  { id: 'step1', day: 0, kind: 'fact', text: { fr: 'Étape : brief envoyé à Inès Caron', en: 'Step: brief sent to Inès Caron' } },
  { id: 'b15', day: 0, kind: 'fact', text: { fr: 'Décidé : budget 15 000 € HT', en: 'Decided: budget €15,000 excl. VAT' } },
  { id: 'phone', day: 0, kind: 'sensitive', text: { fr: 'Portable perso d’Inès : 06 •• •• •• ••', en: 'Inès’s personal mobile: 06 •• •• •• ••' } },
  { id: 'open', day: 0, kind: 'fact', text: { fr: 'Ouvert : format des vidéos', en: 'Open: video format' } },
  { id: 'rain', day: 0, kind: 'noise', text: { fr: 'Il pleuvait à Lille aujourd’hui', en: 'It was raining in Lille today' } },
  { id: 'visio', day: 1, kind: 'fact', text: { fr: 'Décidé : visio jeudi 10 h', en: 'Decided: video call Thursday 10 am' } },
  { id: 'pwd', day: 1, kind: 'sensitive', text: { fr: 'Mot de passe du compte de l’agence', en: 'The agency account password' } },
  { id: 'b18', day: 1, kind: 'fact', text: { fr: 'Compte rendu corrigé : budget 18 000 € HT', en: 'Meeting notes corrected: budget €18,000 excl. VAT' } },
  { id: 'chat', day: 1, kind: 'noise', text: { fr: 'Les trente échanges, mot pour mot', en: 'The thirty exchanges, word for word' } },
  { id: 'fmt', day: 2, kind: 'fact', text: { fr: 'Décidé : trois films de 60 s', en: 'Decided: three 60 s films' } },
  { id: 'health', day: 2, kind: 'sensitive', text: { fr: 'Confidence d’Inès : un souci de santé', en: 'Inès confided a health worry' } },
  { id: 'step2', day: 2, kind: 'fact', text: { fr: 'Étape : devis envoyé à Inès Caron', en: 'Step: quote sent to Inès Caron' } },
];

const DAYS = {
  fr: ['lun. 12 oct.', 'mar. 13 oct.', 'mer. 14 oct.', 'jeu. 15 oct.'],
  en: ['Mon 12 Oct', 'Tue 13 Oct', 'Wed 14 Oct', 'Thu 15 Oct'],
};
const STAMP = ['12/10', '13/10', '14/10'];

interface Outcome {
  ok: boolean;
  say: L;
  /** Short label of what went wrong in the world. */
  flag?: L;
  why?: L;
}
interface Ask {
  q: L;
  answer: (has: (id: string) => boolean) => Outcome;
}

const F = {
  redo: { fr: 'Action refaite', en: 'Action redone' },
  invent: { fr: 'Inventé', en: 'Invented' },
  reopen: { fr: 'Rediscuté', en: 'Reopened' },
  stale: { fr: 'Périmé', en: 'Stale' },
  lost: { fr: 'Perdu', en: 'Lost' },
};

/** Each morning's questions. The answers read the notebook and nothing else. */
const MORNINGS: Ask[][] = [
  [
    {
      q: { fr: 'Où en étions-nous ?', en: 'Where were we?' },
      answer: (has) =>
        has('step1')
          ? { ok: true, say: { fr: 'Le brief est envoyé à Inès Caron.', en: 'The brief has been sent to Inès Caron.' } }
          : { ok: false, say: { fr: 'Je renvoie le brief à Inès Caron.', en: 'I am sending Inès Caron the brief again.' }, flag: F.redo, why: { fr: 'Rien ne disait « envoyé » : l’étape n’était pas notée.', en: 'Nothing said “sent”: the step was not noted.' } },
    },
    {
      q: { fr: 'Quel budget avions-nous noté ?', en: 'What budget had we noted?' },
      answer: (has) =>
        has('b15')
          ? { ok: true, say: { fr: '15 000 € HT, noté le 12/10.', en: '€15,000 excl. VAT, noted on 12/10.' } }
          : { ok: false, say: { fr: 'Autour de 20 000 €, je crois.', en: 'Around €20,000, I believe.' }, flag: F.invent, why: { fr: 'Une décision non notée sera inventée ou redemandée.', en: 'A decision that is not noted gets invented or asked again.' } },
    },
    {
      q: { fr: 'Que reste-t-il à trancher ?', en: 'What is left to decide?' },
      answer: (has) =>
        has('open')
          ? { ok: true, say: { fr: 'Le format des vidéos.', en: 'The video format.' } }
          : { ok: false, say: { fr: 'Rien, tout est réglé.', en: 'Nothing, all settled.' }, flag: F.lost, why: { fr: 'Question ouverte non notée : plus personne ne la posera.', en: 'Open question not noted: nobody will raise it again.' } },
    },
  ],
  [
    {
      q: { fr: 'La visio, c’est quand ?', en: 'When is the video call?' },
      answer: (has) =>
        has('visio')
          ? { ok: true, say: { fr: 'Jeudi à 10 h : c’est décidé.', en: 'Thursday at 10 am: it is decided.' } }
          : { ok: false, say: { fr: 'Quel jour vous arrangerait ?', en: 'Which day would suit you?' }, flag: F.reopen, why: { fr: 'La décision d’hier n’était pas notée.', en: 'Yesterday’s decision was not noted.' } },
    },
    {
      q: { fr: 'Le budget, c’est combien ?', en: 'How much is the budget?' },
      answer: (has) => {
        if (has('b18') && !has('b15')) return { ok: true, say: { fr: '18 000 € HT, noté le 13/10.', en: '€18,000 excl. VAT, noted on 13/10.' } };
        if (has('b18')) return { ok: false, say: { fr: '15 000 €… ou 18 000 € ?', en: '€15,000… or €18,000?' }, flag: F.stale, why: { fr: 'Deux chiffres dans le carnet : la ligne du 12/10 n’a pas été rayée.', en: 'Two figures in the notebook: the 12/10 line was not struck out.' } };
        if (has('b15')) return { ok: false, say: { fr: '15 000 € HT.', en: '€15,000 excl. VAT.' }, flag: F.stale, why: { fr: 'Le compte rendu du 13/10 dit 18 000 € : le souvenir est plus vieux que la source.', en: 'The 13/10 meeting notes say €18,000: the memory is older than the source.' } };
        return { ok: false, say: { fr: 'Autour de 20 000 €, je crois.', en: 'Around €20,000, I believe.' }, flag: F.invent, why: { fr: 'Aucun budget dans le carnet.', en: 'No budget in the notebook.' } };
      },
    },
    {
      q: { fr: 'Que reste-t-il à trancher ?', en: 'What is left to decide?' },
      answer: (has) =>
        has('open')
          ? { ok: true, say: { fr: 'Le format des vidéos.', en: 'The video format.' } }
          : { ok: false, say: { fr: 'Rien, tout est réglé.', en: 'Nothing, all settled.' }, flag: F.lost, why: { fr: 'La question était encore ouverte : il fallait la garder.', en: 'The question was still open: it had to be kept.' } },
    },
  ],
  [
    {
      q: { fr: 'Où en est-on ?', en: 'Where do we stand?' },
      answer: (has) =>
        has('step2')
          ? { ok: true, say: { fr: 'Le devis est envoyé à Inès Caron.', en: 'The quote has been sent to Inès Caron.' } }
          : { ok: false, say: { fr: 'Je renvoie le devis à Inès Caron.', en: 'I am sending Inès Caron the quote again.' }, flag: F.redo, why: { fr: 'L’étape du 14/10 n’est pas dans le carnet.', en: 'The 14/10 step is not in the notebook.' } },
    },
    {
      q: { fr: 'Quel format a-t-on choisi ?', en: 'Which format did we choose?' },
      answer: (has) => {
        if (has('fmt') && !has('open')) return { ok: true, say: { fr: 'Trois films de 60 s, décidé le 14/10.', en: 'Three 60 s films, decided on 14/10.' } };
        if (has('fmt')) return { ok: false, say: { fr: 'Trois films… mais le format reste à trancher ?', en: 'Three films… but the format is still open?' }, flag: F.stale, why: { fr: 'La question est réglée : la ligne « Ouvert » devait être rayée.', en: 'The question is settled: the “Open” line had to be struck out.' } };
        return { ok: false, say: { fr: 'Quel format souhaitez-vous ?', en: 'Which format would you like?' }, flag: F.reopen, why: { fr: 'La décision du 14/10 n’est pas dans le carnet.', en: 'The 14/10 decision is not in the notebook.' } };
      },
    },
    {
      q: { fr: 'Budget et visio, toujours bons ?', en: 'Budget and call, still right?' },
      answer: (has) =>
        has('b18') && has('visio')
          ? { ok: true, say: { fr: '18 000 € HT ; visio ce jeudi à 10 h.', en: '€18,000 excl. VAT; video call this Thursday at 10 am.' } }
          : { ok: false, say: { fr: 'Je n’ai plus cela sous les yeux.', en: 'I no longer have that in front of me.' }, flag: F.lost, why: { fr: 'Ligne rayée trop tôt : la décision valait encore.', en: 'Line struck out too soon: the decision still held.' } },
    },
  ],
];

const INCIDENT: Record<string, L> = {
  phone: { fr: 'Le numéro personnel d’Inès repart vers le modèle à chaque reprise.', en: 'Inès’s personal number goes back to the model at every resume.' },
  pwd: { fr: 'Le mot de passe est relu, en clair, à chaque reprise.', en: 'The password is reread, in clear, at every resume.' },
  health: { fr: 'Une confidence de santé est stockée et relue à chaque reprise.', en: 'A health confidence is stored and reread at every resume.' },
  chat: { fr: 'Trente échanges relus à chaque reprise : les décisions s’y noient.', en: 'Thirty exchanges reread at every resume: the decisions drown in them.' },
};

const T = {
  fr: {
    day: (n: number) => `Jour ${n} / 3`,
    evening: 'soir',
    night: 'nuit',
    morning: 'matin',
    today: 'Notes du jour',
    todayHint: 'Touche une note pour l’écrire dans le carnet.',
    write: 'Noter',
    written: 'Noté',
    unwrite: 'Retirer du carnet',
    book: 'Le carnet de suite',
    lines: (n: number) => `${n} / ${LINES} lignes`,
    strike: 'Rayer',
    restore: 'Rétablir',
    struck: 'rayé',
    blank: 'ligne libre',
    full: 'Carnet plein : raye une ligne avant d’en écrire une autre.',
    lampOff: 'Éteindre la lampe',
    forgetting: 'La nuit tombe : le modèle oublie tout. Seul le carnet reste.',
    morningTitle: 'Le modèle repart de zéro et relit le carnet',
    client: 'Inès Caron',
    agent: 'L’agent',
    fromBook: 'lu dans le carnet',
    incident: 'Incident de confidentialité',
    flood: 'Carnet noyé',
    useless: 'Ligne gâchée : la pluie ne sert à aucune reprise.',
    retry: 'Reprendre la veille au soir',
    next: 'Journée suivante',
    fail: (n: number) => `${n} problème(s) ce matin. Corrige le carnet d’hier soir.`,
    pass: 'Tout tient avec le carnet seul.',
    done: 'Jeudi, 9 h 50 : la visio peut commencer. Trois reprises, rien de refait, rien d’inventé, aucun incident.',
  },
  en: {
    day: (n: number) => `Day ${n} / 3`,
    evening: 'evening',
    night: 'night',
    morning: 'morning',
    today: 'Today’s notes',
    todayHint: 'Tap a note to write it in the notebook.',
    write: 'Note it',
    written: 'Noted',
    unwrite: 'Remove from the notebook',
    book: 'The handover notebook',
    lines: (n: number) => `${n} / ${LINES} lines`,
    strike: 'Strike out',
    restore: 'Restore',
    struck: 'struck',
    blank: 'free line',
    full: 'Notebook full: strike a line out before writing another.',
    lampOff: 'Switch off the lamp',
    forgetting: 'Night falls: the model forgets everything. Only the notebook stays.',
    morningTitle: 'The model starts from scratch and rereads the notebook',
    client: 'Inès Caron',
    agent: 'The agent',
    fromBook: 'read in the notebook',
    incident: 'Privacy incident',
    flood: 'Notebook flooded',
    useless: 'Wasted line: the rain helps no resume.',
    retry: 'Go back to last evening',
    next: 'Next day',
    fail: (n: number) => `${n} problem(s) this morning. Fix last evening’s notebook.`,
    pass: 'Everything holds with the notebook alone.',
    done: 'Thursday, 9:50 am: the call can start. Three resumes, nothing redone, nothing invented, no incident.',
  },
};

const note = (id: string) => NOTES.find((n) => n.id === id)!;

function Scene({ phase, sheets, lines, mood }: { phase: Phase; sheets: number; lines: number; mood: 'happy' | 'doubt' }) {
  return (
    <svg viewBox="0 0 360 132" className={`sg07-scene sg07-scene--${phase}`} aria-hidden="true">
      <defs>
        <clipPath id="sg07-pane">
          <rect x="18" y="14" width="68" height="64" />
        </clipPath>
      </defs>
      <rect width="360" height="132" fill="#1e4d3b" />
      <g opacity="0.3" stroke="#0f2a20" strokeWidth="1.2" fill="none">
        {Array.from({ length: 10 }, (_, i) => (
          <path key={i} d={`M${i * 40 - 20} 98 L${i * 40} 86 L${i * 40 + 20} 98`} />
        ))}
      </g>
      <rect className="sg07-dark" width="360" height="132" fill="#0f2a20" />
      {/* the window: sun by day, moon by night */}
      <rect x="18" y="14" width="68" height="64" fill="#0f2a20" />
      <g clipPath="url(#sg07-pane)">
        <rect className="sg07-sky" x="18" y="14" width="68" height="64" fill="#efe7d8" />
        <circle className="sg07-sun" cx="52" cy="46" r="13" fill="#e3c27a" />
        <g className="sg07-moon">
          <circle cx="56" cy="40" r="11" fill="#efe7d8" />
          <circle cx="61" cy="36" r="10" fill="#0f2a20" />
        </g>
      </g>
      <rect x="18" y="14" width="68" height="64" fill="none" stroke="#c9b67a" strokeWidth="3" />
      <path d="M52 14 V78 M18 46 H86" stroke="#c9b67a" strokeWidth="2" />
      {/* the lamp and its light */}
      <path className="sg07-cone" d="M282 44 L236 100 H328 Z" fill="#e3c27a" />
      <rect x="280" y="50" width="4" height="46" fill="#c9b67a" />
      <path d="M266 52 L274 32 H290 L298 52 Z" fill="#c9b67a" />
      <rect x="270" y="94" width="24" height="5" fill="#c9b67a" />
      {/* the desk */}
      <rect y="98" width="360" height="34" fill="#6b4a2f" />
      <rect y="98" width="360" height="4" fill="#2d2721" />
      {/* loose sheets: today's notes, gone by morning */}
      <g className="sg07-sheets">
        {Array.from({ length: sheets }, (_, i) => (
          <g key={i} transform={`translate(${104 + i * 21} ${82 - (i % 2) * 3}) rotate(${i % 2 ? 5 : -6})`}>
            <rect width="17" height="21" fill="#efe7d8" />
            <path d="M3 5 h11 M3 9 h11 M3 13 h7" stroke="#6b4a2f" strokeWidth="1" />
          </g>
        ))}
      </g>
      {/* the notebook stays */}
      <g transform="translate(212 78)">
        <rect className="sg07-ring" x="-4" y="-4" width="52" height="29" fill="none" stroke="#e3c27a" strokeWidth="2" />
        <rect width="44" height="21" fill="#2d2721" />
        <rect x="2" y="2" width="40" height="17" fill="#efe7d8" />
        <rect x="21" y="2" width="2" height="17" fill="#c9b67a" />
        {Array.from({ length: LINES }, (_, i) => (
          <rect key={i} x={i < 2 ? 4 : 25} y={6 + (i % 2) * 6} width="14" height="2" fill={i < lines ? '#0f2a20' : '#d9d4c7'} />
        ))}
      </g>
      {/* the client comes back in the morning */}
      <g className="sg07-client">
        <g transform="translate(332 50) scale(0.5)">
          <path d="M-40 130 L-30 46 Q0 30 30 46 L40 130 Z" fill="#7c2f2a" />
          <circle cx="0" cy="16" r="22" fill="#c99b78" />
          <path d="M-24 10 Q-20 -14 0 -12 Q22 -12 24 10 Q14 -2 0 -2 Q-14 -2 -24 10 Z" fill="#2d2721" />
          <circle cx="-7" cy="16" r="2.2" fill="#2d2721" />
          <circle cx="7" cy="16" r="2.2" fill="#2d2721" />
          <path d={mood === 'happy' ? 'M-7 26 Q0 32 7 26' : 'M-7 29 Q0 24 7 29'} fill="none" stroke="#2d2721" strokeWidth="2" strokeLinecap="round" />
        </g>
      </g>
    </svg>
  );
}

export default function Game({ lang, onSolved, onMistake }: SignatureProps) {
  const t = T[lang];
  const [day, setDay] = useState(0);
  const [phase, setPhase] = useState<Phase>('evening');
  /** The notebook as it was this morning (lines carried over). */
  const [book, setBook] = useState<string[]>([]);
  /** Everything that will be in the notebook tonight. */
  const [kept, setKept] = useState<string[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [solved, setSolved] = useState(false);
  const fired = useRef(false);
  const cb = useRef(onSolved);
  const timers = useRef<number[]>([]);
  useEffect(() => {
    cb.current = onSolved;
  }, [onSolved]);
  useEffect(() => () => timers.current.forEach((x) => window.clearTimeout(x)), []);

  const today = NOTES.filter((n) => n.day === day);
  const has = (id: string) => kept.includes(id);
  const struck = book.filter((id) => !has(id));

  const toggle = (id: string) => {
    if (phase !== 'evening') return;
    if (has(id)) {
      setKept(kept.filter((x) => x !== id));
      setMsg(null);
      sfx('tick');
      return;
    }
    if (kept.length >= LINES) {
      setMsg(t.full);
      sfx('wrong');
      return;
    }
    // carried-over lines keep their place at the top of the page
    const next = [...book.filter((x) => has(x) || x === id), ...kept.filter((x) => !book.includes(x)), ...(book.includes(id) ? [] : [id])];
    setKept(next);
    setMsg(null);
    sfx('place');
  };

  /* The morning, computed from the notebook alone. */
  const outcomes = MORNINGS[day].map((a) => ({ q: a.q, ...a.answer(has) }));
  const incidents = kept.filter((id) => INCIDENT[id]);
  const problems = outcomes.filter((o) => !o.ok).length + incidents.length;
  const pass = problems === 0;

  const lampOff = () => {
    if (phase !== 'evening') return;
    setMsg(null);
    setPhase('night');
    sfx('close');
    const reduce = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    timers.current.push(
      window.setTimeout(() => {
        setPhase('morning');
        if (!pass) {
          sfx('wrong');
          onMistake?.();
          return;
        }
        if (day < 2) {
          sfx('correct');
          return;
        }
        if (fired.current) return;
        fired.current = true;
        setSolved(true);
        sfx('solve');
        timers.current.push(window.setTimeout(() => cb.current(), 700));
      }, reduce ? 200 : 1500),
    );
  };

  const retry = () => {
    setPhase('evening');
    sfx('open');
  };

  const nextDay = () => {
    setBook(kept);
    setDay(day + 1);
    setPhase('evening');
    setMsg(null);
    sfx('open');
  };

  const when = phase === 'morning' ? `${DAYS[lang][day + 1]} · ${t.morning}` : `${DAYS[lang][day]} · ${phase === 'night' ? t.night : t.evening}`;
  const stampOf = (id: string) => STAMP[note(id).day];

  return (
    <div className="sg07" data-game="c07" data-solved={solved ? 'true' : undefined} data-phase={phase} data-day={day + 1}>
      <header className="sg07-head">
        <p className="sg07-k">
          {t.day(day + 1)}
          <span className="sg07-pips" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <i key={i} className={i < day || (i === day && phase === 'morning' && pass) ? 'is-done' : i === day ? 'is-now' : ''} />
            ))}
          </span>
        </p>
        <p className="sg07-when">{when}</p>
      </header>

      <div className="sg07-stage">
        <Scene phase={phase} sheets={today.length} lines={kept.length} mood={pass ? 'happy' : 'doubt'} />
        <p className="sg07-night" role="status">{phase === 'night' ? t.forgetting : ''}</p>
      </div>

      {phase !== 'morning' && (
        <>
          <section className="sg07-today" aria-label={t.today}>
            <p className="sg07-title">
              {t.today} <span>{t.todayHint}</span>
            </p>
            <ul>
              {today.map((n, i) => {
                const on = has(n.id);
                return (
                  <li key={n.id}>
                    <button
                      type="button"
                      className={`sg07-note sg07-note--${i % 2 ? 'b' : 'a'}${on ? ' is-on' : ''}`}
                      aria-pressed={on}
                      aria-label={`${on ? t.unwrite : t.write} : ${n.text[lang]}`}
                      data-testid={`note-${n.id}`}
                      onClick={() => toggle(n.id)}
                      disabled={phase !== 'evening'}
                    >
                      <span className="sg07-note-text">{n.text[lang]}</span>
                      <span className="sg07-note-act" aria-hidden="true">
                        {on ? t.written : t.write}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="sg07-book" aria-label={t.book}>
            <p className="sg07-title sg07-title--book">
              {t.book} <span data-testid="count">{t.lines(kept.length)}</span>
            </p>
            <ul className="sg07-lines">
              {kept.map((id) => (
                <li key={id}>
                  <button
                    type="button"
                    className={`sg07-line${book.includes(id) ? '' : ' is-new'}`}
                    aria-label={`${book.includes(id) ? t.strike : t.unwrite} : ${note(id).text[lang]}`}
                    data-testid={`line-${id}`}
                    onClick={() => toggle(id)}
                    disabled={phase !== 'evening'}
                  >
                    <span className="sg07-line-date">{stampOf(id)}</span>
                    <span className="sg07-line-text">{note(id).text[lang]}</span>
                    <span className="sg07-line-act" aria-hidden="true">
                      {book.includes(id) ? t.strike : '×'}
                    </span>
                  </button>
                </li>
              ))}
              {Array.from({ length: LINES - kept.length }, (_, i) => (
                <li key={`blank-${i}`} className="sg07-blank">
                  {t.blank}
                </li>
              ))}
              {struck.map((id) => (
                <li key={id}>
                  <button
                    type="button"
                    className="sg07-line is-struck"
                    aria-label={`${t.restore} : ${note(id).text[lang]}`}
                    data-testid={`struck-${id}`}
                    onClick={() => toggle(id)}
                    disabled={phase !== 'evening'}
                  >
                    <span className="sg07-line-date">{stampOf(id)}</span>
                    <span className="sg07-line-text">{note(id).text[lang]}</span>
                    <span className="sg07-line-act" aria-hidden="true">
                      {t.restore}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            <p className="sg07-msg" aria-live="polite">
              {msg}
            </p>
            <div className="sg07-actions">
              <button type="button" className="sg07-btn" data-testid="night" onClick={lampOff} disabled={phase !== 'evening'}>
                <span className="sg07-btn-lamp" aria-hidden="true" />
                {t.lampOff}
              </button>
            </div>
          </section>
        </>
      )}

      {phase === 'morning' && (
        <section className="sg07-morning" data-testid="morning" data-pass={pass ? 'true' : 'false'} aria-live="polite">
          <p className="sg07-title">{t.morningTitle}</p>
          <ol className="sg07-qa">
            {outcomes.map((o, i) => (
              <li key={i} className={o.ok ? 'is-ok' : 'is-err'} style={{ animationDelay: `${i * 0.18}s` }}>
                <p className="sg07-qa-q">
                  <span>{t.client}</span>« {o.q[lang]} »
                </p>
                <p className="sg07-qa-a">
                  <span>{t.agent}</span>
                  {o.say[lang]}
                </p>
                {o.ok ? (
                  <p className="sg07-qa-tag">{t.fromBook}</p>
                ) : (
                  <p className="sg07-qa-why">
                    <b>{o.flag![lang]}.</b> {o.why![lang]}
                  </p>
                )}
              </li>
            ))}
          </ol>
          {incidents.map((id) => (
            <p key={id} className="sg07-incident" data-testid="incident">
              <span className="sg07-flag" aria-hidden="true" />
              <b>{id === 'chat' ? t.flood : t.incident}.</b> {INCIDENT[id][lang]}
            </p>
          ))}
          {pass && has('rain') && <p className="sg07-remark">{t.useless}</p>}
          <p className={`sg07-sum ${pass ? 'is-ok' : 'is-err'}`}>{solved ? t.done : pass ? t.pass : t.fail(problems)}</p>
          <div className="sg07-actions">
            {!pass && (
              <button type="button" className="sg07-btn" data-testid="retry" onClick={retry}>
                {t.retry}
              </button>
            )}
            {pass && day < 2 && (
              <button type="button" className="sg07-btn" data-testid="next" onClick={nextDay}>
                {t.next}
              </button>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
