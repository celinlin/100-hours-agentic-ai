'use client';

import { useEffect, useRef, useState } from 'react';
import type { SignatureProps } from './list';
import { sfx } from '../sound';
import './c06.css';

/**
 * 06 · L'enquête à la bibliothèque.
 * A documentary investigation: pull a book, pin passages on the evidence board (two pins),
 * then hand in an answer. The verdict is computed from the board and the citation only:
 * no source, a look-alike passage, an ignored contradiction and an invented answer each
 * produce their own stamp. All figures come from the programme's Brume & Quai file.
 */

type L = { fr: string; en: string };
type Stance = 'answer' | 'gap' | 'none';
type Verdict = 'ok' | 'nosource' | 'offtopic' | 'ignored' | 'nogap' | 'gaveup';

interface Passage {
  id: string;
  book: string;
  section: string;
  text: L;
  /** The short fact, used when the gap is written out. */
  fact: L;
}

const BOOKS = [
  { id: 'cr', file: 'compte-rendu.md' },
  { id: 'gr', file: 'grille-tarifs.md' },
  { id: 'pl', file: 'plaquette.md' },
  { id: 'co', file: 'courriel.md' },
] as const;

const PASSAGES: Passage[] = [
  { id: 'cr_budget', book: 'cr', section: 'Budget', text: { fr: 'Budget vidéo validé : 18 000 € HT.', en: 'Video budget approved: €18,000 excl. VAT.' }, fact: { fr: '18 000 € HT', en: '€18,000 excl. VAT' } },
  { id: 'cr_besoin', book: 'cr', section: 'Besoin', text: { fr: 'Trois films pour la saison d’été.', en: 'Three films for the summer season.' }, fact: { fr: 'trois films', en: 'three films' } },
  { id: 'cr_cal', book: 'cr', section: 'Calendrier', text: { fr: 'Livraison souhaitée avant mars.', en: 'Delivery wanted before March.' }, fact: { fr: 'avant mars', en: 'before March' } },
  { id: 'gr_formats', book: 'gr', section: 'Formats', text: { fr: 'Film de 60 s : 4 500 € HT.', en: '60 s film: €4,500 excl. VAT.' }, fact: { fr: '4 500 € HT', en: '€4,500 excl. VAT' } },
  { id: 'gr_options', book: 'gr', section: 'Options', text: { fr: 'Sous-titres : 300 € HT par film.', en: 'Subtitles: €300 excl. VAT per film.' }, fact: { fr: '300 € HT', en: '€300 excl. VAT' } },
  { id: 'gr_env', book: 'gr', section: 'Enveloppe', text: { fr: 'Budget vidéo prévu : 15 000 € HT.', en: 'Planned video budget: €15,000 excl. VAT.' }, fact: { fr: '15 000 € HT', en: '€15,000 excl. VAT' } },
  { id: 'pl_equipe', book: 'pl', section: 'Équipe', text: { fr: 'L’agence compte douze personnes.', en: 'The agency has twelve people.' }, fact: { fr: 'douze personnes', en: 'twelve people' } },
  { id: 'pl_clients', book: 'pl', section: 'Clients', text: { fr: 'Nos clients : des hôtels indépendants.', en: 'Our clients: independent hotels.' }, fact: { fr: 'hôtels indépendants', en: 'independent hotels' } },
  { id: 'co_rdv', book: 'co', section: 'Rendez-vous', text: { fr: 'Visio jeudi à 10 h avec Inès Caron.', en: 'Video call Thursday at 10 am with Inès Caron.' }, fact: { fr: 'jeudi 10 h', en: 'Thursday 10 am' } },
  { id: 'co_sign', book: 'co', section: 'Signature', text: { fr: 'Inès Caron, directrice, Brume & Quai.', en: 'Inès Caron, director, Brume & Quai.' }, fact: { fr: 'directrice', en: 'director' } },
];

interface Question {
  kind: 'single' | 'conflict' | 'absent';
  q: L;
  /** Passages that really answer (two for a conflict, none when the file is silent). */
  truth: string[];
  /** What the model writes when it leans on a given passage. */
  say: Record<string, L>;
  /** Why a look-alike passage fails. */
  lure: Record<string, L>;
  /** What the model writes with nothing to lean on (illustrative). */
  guess: L;
}

const QUESTIONS: Question[] = [
  {
    kind: 'single',
    q: { fr: 'Combien coûte un film de 60 secondes ?', en: 'How much is a 60-second film?' },
    truth: ['gr_formats'],
    say: {
      gr_formats: { fr: 'Un film de 60 s coûte 4 500 € HT.', en: 'A 60 s film costs €4,500 excl. VAT.' },
      gr_options: { fr: 'Un film coûte 300 € HT.', en: 'A film costs €300 excl. VAT.' },
      cr_besoin: { fr: 'Trois films de 60 s sont prévus.', en: 'Three 60 s films are planned.' },
    },
    lure: {
      gr_options: { fr: 'Mêmes mots (« film », « € HT »), autre sujet : c’est le prix des sous-titres.', en: 'Same words (“film”, “excl. VAT”), another subject: that is the subtitle price.' },
      cr_besoin: { fr: 'Le passage parle de films, pas de leur prix.', en: 'The passage is about films, not their price.' },
    },
    guess: { fr: 'Autour de 5 000 €, il me semble.', en: 'Around €5,000, I believe.' },
  },
  {
    kind: 'conflict',
    q: { fr: 'Quel est le budget vidéo ?', en: 'What is the video budget?' },
    truth: ['cr_budget', 'gr_env'],
    say: {
      cr_budget: { fr: 'Le budget vidéo est de 18 000 € HT.', en: 'The video budget is €18,000 excl. VAT.' },
      gr_env: { fr: 'Le budget vidéo est de 15 000 € HT.', en: 'The video budget is €15,000 excl. VAT.' },
      gr_formats: { fr: 'Le budget vidéo est de 4 500 € HT.', en: 'The video budget is €4,500 excl. VAT.' },
    },
    lure: {
      gr_formats: { fr: 'C’est le prix d’un film, pas le budget.', en: 'That is the price of one film, not the budget.' },
    },
    guess: { fr: 'Sans doute 20 000 €.', en: 'Probably €20,000.' },
  },
  {
    kind: 'absent',
    q: { fr: 'Comment s’appelle le chien d’Inès Caron ?', en: 'What is Inès Caron’s dog called?' },
    truth: [],
    say: {
      co_sign: { fr: 'Le chien d’Inès Caron s’appelle Brume.', en: 'Inès Caron’s dog is called Brume.' },
      co_rdv: { fr: 'Son chien sera à la visio de jeudi.', en: 'Her dog will be on Thursday’s call.' },
    },
    lure: {
      co_sign: { fr: 'Le passage nomme Inès Caron, pas son chien : le nom est inventé.', en: 'The passage names Inès Caron, not her dog: the name is made up.' },
      co_rdv: { fr: 'Le passage nomme Inès Caron, pas son chien : la phrase est inventée.', en: 'The passage names Inès Caron, not her dog: the sentence is made up.' },
    },
    guess: { fr: 'Il s’appelle Quai, sans doute.', en: 'It is called Quai, no doubt.' },
  },
];

const PINS = 2;

const T = {
  fr: {
    step: (n: number) => `Enquête ${n} / 3`,
    asks: 'Inès Caron demande',
    shelf: 'La bibliothèque du dossier',
    pull: 'Tirer le livre',
    close: 'Refermer le livre',
    board: 'Tableau des preuves',
    pinsLeft: (n: number) => `${n} / ${PINS} épingles`,
    empty: 'épingle libre',
    pin: 'Épingler',
    unpin: 'Retirer du tableau',
    pinned: 'épinglé',
    full: 'Deux épingles seulement : retire un passage du tableau.',
    sheet: 'La réponse',
    stance: { answer: 'Répondre', gap: 'Signaler un écart', none: 'Je ne trouve pas' },
    source: 'Source de la phrase',
    noPin: 'aucun passage épinglé',
    noCite: 'sans source',
    gapNeeds: 'Un écart se montre avec deux passages épinglés.',
    gapLead: 'Écart :',
    gapEnd: 'À trancher par un humain.',
    gapTodo: 'Écart : … (épingle deux passages)',
    none: 'Je ne trouve pas : aucun document du dossier n’en parle.',
    submit: 'Remettre la réponse',
    next: 'Enquête suivante',
    hintOpen: 'Tire un livre pour lire ses passages.',
    hintPin: 'Épingle ce qui prouve la réponse, puis choisis comment répondre.',
    stamp: { ok: 'Sourcé', okGap: 'Écart signalé', okNone: 'Rien inventé', nosource: 'Sans source', offtopic: 'Hors sujet', ignored: 'Écart ignoré', nogap: 'Pas d’écart', gaveup: 'À chercher' },
    why: {
      ok: 'Chaque mot de la phrase est dans le passage cité : la cliente peut vérifier.',
      okGap: 'Deux documents, deux chiffres, une source par chiffre : c’est à un humain de trancher.',
      okNone: 'Aucun livre n’en parle : le dire vaut mieux qu’un nom inventé.',
      nosource: 'Réponse sans passage cité : rien ne permet de la vérifier (chiffre illustratif, inventé par le modèle).',
      nosourceAbsent: 'Sans passage, le modèle invente : ici, il fallait dire qu’on ne trouve pas.',
      offtopic: 'Ce passage ne répond pas à la question : la phrase ne tient pas.',
      ignored: (other: string) => `${other} donne un autre chiffre : tu as tranché à la place de la cliente.`,
      nogap: 'Ces deux passages ne se contredisent pas : il n’y a pas d’écart à signaler ici.',
      gaveup: 'La cliente repart sans réponse, alors qu’un livre du dossier la contient.',
    },
    done: 'Trois enquêtes, trois réponses que l’on peut vérifier.',
  },
  en: {
    step: (n: number) => `Case ${n} / 3`,
    asks: 'Inès Caron asks',
    shelf: 'The file’s bookcase',
    pull: 'Pull the book',
    close: 'Close the book',
    board: 'Evidence board',
    pinsLeft: (n: number) => `${n} / ${PINS} pins`,
    empty: 'free pin',
    pin: 'Pin',
    unpin: 'Remove from the board',
    pinned: 'pinned',
    full: 'Two pins only: take a passage off the board.',
    sheet: 'The answer',
    stance: { answer: 'Answer', gap: 'Flag a gap', none: 'I can’t find it' },
    source: 'Source of the sentence',
    noPin: 'no passage pinned',
    noCite: 'no source',
    gapNeeds: 'A gap is shown with two pinned passages.',
    gapLead: 'Gap:',
    gapEnd: 'For a human to decide.',
    gapTodo: 'Gap: … (pin two passages)',
    none: 'I can’t find it: no document in the file mentions it.',
    submit: 'Hand in the answer',
    next: 'Next case',
    hintOpen: 'Pull a book to read its passages.',
    hintPin: 'Pin what proves the answer, then choose how to answer.',
    stamp: { ok: 'Sourced', okGap: 'Gap flagged', okNone: 'Nothing invented', nosource: 'No source', offtopic: 'Off-topic', ignored: 'Gap ignored', nogap: 'No gap', gaveup: 'Keep looking' },
    why: {
      ok: 'Every word of the sentence is in the cited passage: the client can check.',
      okGap: 'Two documents, two figures, one source per figure: a human decides.',
      okNone: 'No book mentions it: saying so beats an invented name.',
      nosource: 'An answer with no cited passage: nothing lets anyone check it (illustrative figure, made up by the model).',
      nosourceAbsent: 'With no passage, the model invents: here the right move was to say you can’t find it.',
      offtopic: 'This passage does not answer the question: the sentence does not hold.',
      ignored: (other: string) => `${other} gives another figure: you decided in the client’s place.`,
      nogap: 'These two passages do not contradict each other: there is no gap to flag here.',
      gaveup: 'The client leaves without an answer, though a book in the file holds it.',
    },
    done: 'Three cases, three answers anyone can check.',
  },
};

const byId = (id: string) => PASSAGES.find((p) => p.id === id)!;
const fileOf = (p: Passage) => BOOKS.find((b) => b.id === p.book)!.file;
const ref = (p: Passage) => `${fileOf(p)} · ${p.section}`;

/** The whole judgement: nothing but the question, the board and the citation. */
function judge(q: Question, stance: Stance, pins: string[], cite: string | null): Verdict {
  if (stance === 'none') return q.kind === 'absent' ? 'ok' : 'gaveup';
  if (stance === 'gap') {
    const both = q.kind === 'conflict' && pins.length === 2 && q.truth.every((id) => pins.includes(id));
    return both ? 'ok' : 'nogap';
  }
  if (!cite || !pins.includes(cite)) return 'nosource';
  if (q.kind === 'single') return q.truth.includes(cite) ? 'ok' : 'offtopic';
  if (q.kind === 'conflict') return q.truth.includes(cite) ? 'ignored' : 'offtopic';
  return 'offtopic';
}

function Spine({ i }: { i: number }) {
  // Four hand-drawn spine ornaments, one per book.
  return (
    <svg viewBox="0 0 40 44" className="sg06-spine-art" aria-hidden="true" preserveAspectRatio="none">
      <rect x="0" y="8" width="40" height="3" fill={i === 2 ? '#2d2721' : '#e3c27a'} />
      <rect x="0" y="38" width="40" height="1.5" fill={i === 2 ? '#2d2721' : '#e3c27a'} />
      {i === 0 && <path d="M20 16 l7 8 l-7 8 l-7 -8 z" fill="none" stroke="#e3c27a" strokeWidth="1.5" />}
      {i === 1 && <path d="M10 30 a10 10 0 0 1 20 0 M14 30 a6 6 0 0 1 12 0" fill="none" stroke="#e3c27a" strokeWidth="1.5" />}
      {i === 2 && <path d="M12 19 h16 M12 24 h16 M12 29 h16" stroke="#2d2721" strokeWidth="1.5" />}
      {i === 3 && <circle cx="20" cy="24" r="6" fill="none" stroke="#e3c27a" strokeWidth="1.5" />}
    </svg>
  );
}

export default function Game({ lang, onSolved, onMistake }: SignatureProps) {
  const t = T[lang];
  const [step, setStep] = useState(0);
  const [open, setOpen] = useState<string | null>(null);
  const [pins, setPins] = useState<string[]>([]);
  const [stance, setStance] = useState<Stance>('answer');
  const [cite, setCite] = useState<string | null>(null);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [solved, setSolved] = useState(false);
  const fired = useRef(false);
  const cb = useRef(onSolved);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => {
    cb.current = onSolved;
  }, [onSolved]);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const q = QUESTIONS[step];
  const locked = verdict === 'ok';

  const touch = () => {
    setVerdict(null);
    setNote(null);
  };

  const pull = (id: string) => {
    sfx(open === id ? 'close' : 'open');
    setOpen(open === id ? null : id);
  };

  const togglePin = (id: string) => {
    if (locked) return;
    if (pins.includes(id)) {
      touch();
      setPins(pins.filter((x) => x !== id));
      if (cite === id) setCite(null);
      sfx('tick');
      return;
    }
    if (pins.length >= PINS) {
      setNote(t.full);
      sfx('wrong');
      return;
    }
    touch();
    setPins([...pins, id]);
    sfx('place');
  };

  const pickStance = (s: Stance) => {
    if (locked) return;
    touch();
    setStance(s);
    sfx('select');
  };

  const pickCite = (id: string) => {
    if (locked) return;
    touch();
    setCite(cite === id ? null : id);
    sfx('latch');
  };

  const submit = () => {
    if (locked) return;
    if (stance === 'gap' && pins.length < 2) {
      setNote(t.gapNeeds);
      sfx('tick');
      return;
    }
    const v = judge(q, stance, pins, cite);
    setNote(null);
    setVerdict(v);
    if (v !== 'ok') {
      sfx('wrong');
      onMistake?.();
      return;
    }
    if (step < QUESTIONS.length - 1) {
      sfx('correct');
      return;
    }
    if (fired.current) return;
    fired.current = true;
    setSolved(true);
    sfx('solve');
    timer.current = window.setTimeout(() => cb.current(), 700);
  };

  const next = () => {
    setStep(step + 1);
    setOpen(null);
    setPins([]);
    setStance('answer');
    setCite(null);
    setVerdict(null);
    setNote(null);
    sfx('open');
  };

  /* What the model writes, computed from the same state as the verdict. */
  const cited = cite && pins.includes(cite) ? byId(cite) : null;
  let sentence: string;
  let sources: Passage[] = [];
  if (stance === 'none') sentence = t.none;
  else if (stance === 'gap') {
    if (pins.length < 2) sentence = t.gapTodo;
    else {
      sentence = `${t.gapLead} ${pins.map(byId).map((p) => `${p.fact[lang]} [${ref(p)}]`).join(' ; ')}. ${t.gapEnd}`;
    }
  } else if (cited) {
    sentence = q.say[cited.id]?.[lang] ?? `« ${cited.text[lang]} »`;
    sources = [cited];
  } else sentence = q.guess[lang];

  const stampKey = verdict === 'ok' ? (stance === 'gap' ? 'okGap' : stance === 'none' ? 'okNone' : 'ok') : verdict;
  let why = '';
  if (verdict === 'ok') why = t.why[stampKey as 'ok' | 'okGap' | 'okNone'];
  else if (verdict === 'nosource') why = q.kind === 'absent' ? t.why.nosourceAbsent : t.why.nosource;
  else if (verdict === 'offtopic') why = (cited && q.lure[cited.id]?.[lang]) || t.why.offtopic;
  else if (verdict === 'ignored') why = t.why.ignored(ref(byId(q.truth.find((id) => id !== cite)!)));
  else if (verdict === 'nogap') why = t.why.nogap;
  else if (verdict === 'gaveup') why = t.why.gaveup;

  const hint = pins.length === 0 && !open ? t.hintOpen : pins.length === 0 ? t.hintPin : null;

  return (
    <div className="sg06" data-game="c06" data-solved={solved ? 'true' : undefined} data-step={step + 1}>
      <header className="sg06-case">
        <p className="sg06-k">
          {t.step(step + 1)}
          <span className="sg06-seals" aria-hidden="true">
            {QUESTIONS.map((_, i) => (
              <i key={i} className={i < step || (i === step && locked) ? 'is-done' : i === step ? 'is-now' : ''} />
            ))}
          </span>
        </p>
        <p className="sg06-q" key={step}>
          <span>{t.asks}</span>« {q.q[lang]} »
        </p>
      </header>

      <section className="sg06-case-shelf" aria-label={t.shelf}>
        <div className="sg06-arch" aria-hidden="true">
          <svg viewBox="0 0 320 26" preserveAspectRatio="none">
            <rect width="320" height="26" fill="#2d2721" />
            {Array.from({ length: 9 }, (_, i) => (
              <path key={i} d={`M${i * 40 - 20} 26 L${i * 40} 6 L${i * 40 + 20} 26`} fill="none" stroke="#c9b67a" strokeWidth="1.2" />
            ))}
            <rect y="23" width="320" height="3" fill="#c9b67a" />
          </svg>
        </div>
        <div className="sg06-shelf">
          {BOOKS.map((b, i) => {
            const n = pins.filter((id) => byId(id).book === b.id).length;
            return (
              <button
                key={b.id}
                type="button"
                className={`sg06-book sg06-book--${b.id}${open === b.id ? ' is-open' : ''}`}
                aria-expanded={open === b.id}
                aria-label={`${open === b.id ? t.close : t.pull} : ${b.file}`}
                data-testid={`book-${b.id}`}
                onClick={() => pull(b.id)}
              >
                <Spine i={i} />
                <span className="sg06-book-title">{b.file}</span>
                {n > 0 && <span className="sg06-book-mark" aria-hidden="true" />}
              </button>
            );
          })}
          <span className="sg06-bookend" aria-hidden="true" />
        </div>
        <div className="sg06-plank" aria-hidden="true" />
        {open && (
          <div className={`sg06-open sg06-open--${open}`} key={open}>
            <p className="sg06-open-title">{BOOKS.find((b) => b.id === open)!.file}</p>
            <ul>
              {PASSAGES.filter((p) => p.book === open).map((p) => {
                const on = pins.includes(p.id);
                return (
                  <li key={p.id}>
                    <button
                      type="button"
                      className={`sg06-slip${on ? ' is-pinned' : ''}`}
                      aria-pressed={on}
                      aria-label={`${on ? t.unpin : t.pin} : ${p.section}, « ${p.text[lang]} »`}
                      data-testid={`passage-${p.id}`}
                      onClick={() => togglePin(p.id)}
                    >
                      <span className="sg06-slip-sec">{p.section}</span>
                      <span className="sg06-slip-text">« {p.text[lang]} »</span>
                      <span className="sg06-slip-pin" aria-hidden="true">
                        {on ? t.pinned : t.pin}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
        {hint && <p className="sg06-hint">{hint}</p>}
      </section>

      <section className="sg06-board" aria-label={t.board}>
        <p className="sg06-board-title">
          {t.board} <span>{t.pinsLeft(pins.length)}</span>
        </p>
        <ul>
          {Array.from({ length: PINS }, (_, i) => {
            const p = pins[i] ? byId(pins[i]) : null;
            return (
              <li key={i}>
                {p ? (
                  <button
                    type="button"
                    className={`sg06-card sg06-card--${p.book}${cite === p.id && stance === 'answer' ? ' is-cited' : ''}`}
                    onClick={() => togglePin(p.id)}
                    aria-label={`${t.unpin} : ${ref(p)}`}
                    data-testid={`pinned-${p.id}`}
                    disabled={locked}
                  >
                    <span className="sg06-card-pin" aria-hidden="true" />
                    <span className="sg06-card-ref">{ref(p)}</span>
                    <span className="sg06-card-text">« {p.text[lang]} »</span>
                  </button>
                ) : (
                  <span className="sg06-card-empty">
                    <span className="sg06-card-pin" aria-hidden="true" />
                    {t.empty}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
        <p className="sg06-board-note" aria-live="polite">{note === t.full ? note : ''}</p>
      </section>

      <section className={`sg06-sheet${verdict ? ` is-${verdict}` : ''}`} aria-label={t.sheet}>
        <p className="sg06-sheet-title">{t.sheet}</p>
        <div className="sg06-stances" role="group" aria-label={t.sheet}>
          {(['answer', 'gap', 'none'] as Stance[]).map((s) => (
            <button key={s} type="button" className="sg06-stance" aria-pressed={stance === s} data-testid={`stance-${s}`} onClick={() => pickStance(s)} disabled={locked}>
              {t.stance[s]}
            </button>
          ))}
        </div>
        {stance === 'answer' && (
          <div className="sg06-cite" role="group" aria-label={t.source}>
            <span className="sg06-cite-k">{t.source}</span>
            {pins.length === 0 && <span className="sg06-cite-none">{t.noPin}</span>}
            {pins.map((id) => (
              <button key={id} type="button" className="sg06-chip" aria-pressed={cite === id} data-testid={`cite-${id}`} onClick={() => pickCite(id)} disabled={locked}>
                {ref(byId(id))}
              </button>
            ))}
          </div>
        )}
        <div className="sg06-paper">
          <p className="sg06-sentence">
            {sentence}{' '}
            {stance === 'answer' && (sources.length ? <b className="sg06-src">[{ref(sources[0])}]</b> : <b className="sg06-src sg06-src--none">[{t.noCite}]</b>)}
          </p>
          {verdict && stampKey && (
            <span className={`sg06-stamp${verdict === 'ok' ? ' sg06-stamp--ok' : ''}`} key={`${verdict}-${stance}-${cite}`} aria-hidden="true">
              {t.stamp[stampKey as keyof typeof t.stamp]}
            </span>
          )}
        </div>
        <div className="sg06-result" aria-live="polite" data-testid="verdict" data-verdict={verdict ?? ''}>
          {verdict && (
            <p className={verdict === 'ok' ? 'is-ok' : 'is-err'}>
              <b>{t.stamp[stampKey as keyof typeof t.stamp]}.</b> {solved ? t.done : why}
            </p>
          )}
          {!verdict && note && note !== t.full && <p className="is-note">{note}</p>}
        </div>
        <div className="sg06-actions">
          {!locked && (
            <button type="button" className="sg06-btn" data-testid="submit" onClick={submit}>
              {t.submit}
            </button>
          )}
          {locked && step < QUESTIONS.length - 1 && (
            <button type="button" className="sg06-btn" data-testid="next" onClick={next}>
              {t.next}
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
