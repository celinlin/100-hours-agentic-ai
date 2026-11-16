'use client';

import './c02.css';
import { useEffect, useRef, useState } from 'react';
import { sfx } from '../sound';
import type { SignatureProps } from './list';

/**
 * 02 · "La presse à consignes" — the instruction press.
 * The learner sets instruction blocks (type sorts) in the bed of a printing press and pulls the
 * lever. The printed brief is COMPUTED from what is in the bed: no format → prose, no notes → an
 * invented time, yesterday's notes → the wrong time, the whole archive → the format line is buried.
 * Won when the print passes the three checks of the checking machine.
 */

type BlockId = 'role' | 'notes' | 'old' | 'example' | 'format' | 'archive';
type Shape = 'json' | 'wrapped' | 'prose';
type Source = 'fresh' | 'old' | 'conflict' | 'archive' | 'invented';

const BLOCKS: BlockId[] = ['role', 'archive', 'format', 'old', 'example', 'notes'];

const T = {
  fr: {
    case: 'La casse : les plombs disponibles',
    bed: 'Le marbre de la presse',
    bedCount: (n: number) => `${n} plomb${n > 1 ? 's' : ''} en place`,
    fixed: 'fixé',
    put: 'Poser sur le marbre',
    remove: 'Retirer du marbre',
    pull: 'Tirer le levier',
    pressing: 'Impression…',
    hintStart: 'Tire le levier : regarde ce qui sort avec la tâche seule.',
    hintDirty: 'Marbre modifié : tire le levier pour un nouveau tirage.',
    sheet: 'Le tirage',
    stale: 'tirage précédent',
    checker: 'La contrôleuse',
    sim: 'Simulation : le tirage est calculé d’après les plombs en place.',
    pass: 'passe',
    fail: 'rejeté',
    wait: 'en attente',
    checks: ['Format valide', 'Rien d’inventé', 'Bon rendez-vous'],
    kind: { task: 'Tâche', role: 'Rôle', notes: 'Notes · ce matin', old: 'Notes · hier', example: 'Exemple', format: 'Format', archive: 'Archives' },
    text: {
      task: 'Le brief de jeudi avec Inès Caron',
      role: 'Tu prépares mes rendez-vous',
      notes: 'Jeudi 10 h, visio, Brume & Quai',
      old: 'Jeudi 17 h, visio, Brume & Quai',
      example: 'Un brief complet, déjà rempli',
      format: 'JSON seul, champs exacts',
      archive: '40 pages de comptes rendus',
    },
    tag: { buried: 'enfouie', stale: 'périmées', heavy: '40 pages' },
    stamp: { invented: 'inventé', stale: 'périmé', other: 'autre rendez-vous', around: 'texte en trop' },
    day: { thu: 'jeudi', tue: 'mardi' },
    proseA: (d: string, h: string) => `Alors, pour ${d}… tu vois Inès Caron vers ${h}, il me semble.`,
    proseB: 'Pense à relire tes notes avant, et bon rendez-vous !',
    wrapA: 'Bien sûr ! Voici le brief demandé :',
    wrapB: 'N’hésite pas si tu veux une autre version.',
    why: {
      buried: 'Consigne de format enfouie sous 40 pages : elle pèse moins, elle est ignorée.',
      noform: 'Aucune forme demandée : il sort de la prose, illisible pour du code.',
      wrapped: 'L’exemple fixe les champs, pas la règle « rien autour » : du texte entoure le JSON.',
      invented: 'Sans notes, le modèle devine : l’heure et l’entreprise sont inventées.',
      guessed: 'Une heure devinée n’est pas le rendez-vous.',
      old: 'Notes périmées : 17 h, imprimé avec assurance.',
      conflict: 'Deux versions des notes : contradiction, l’ancienne heure sort ici.',
      archive: 'Faute de notes, une vieille page des archives a répondu : mardi 9 h.',
    },
    win: (n: number) => (n <= 3 ? `Bon à tirer avec ${n} plombs : le minimum utile.` : `Bon à tirer avec ${n} plombs. Rien de périmé, rien de trop long.`),
    lose: (n: number) => `${n} contrôle${n > 1 ? 's' : ''} sur 3. Change les plombs, puis tire à nouveau le levier.`,
  },
  en: {
    case: 'The type case: available blocks',
    bed: 'The press bed',
    bedCount: (n: number) => `${n} block${n > 1 ? 's' : ''} set`,
    fixed: 'fixed',
    put: 'Set on the bed',
    remove: 'Take off the bed',
    pull: 'Pull the lever',
    pressing: 'Printing…',
    hintStart: 'Pull the lever: see what comes out with the task alone.',
    hintDirty: 'Bed changed: pull the lever for a new print.',
    sheet: 'The print',
    stale: 'previous print',
    checker: 'The checking machine',
    sim: 'Simulation: the print is computed from the blocks on the bed.',
    pass: 'pass',
    fail: 'rejected',
    wait: 'waiting',
    checks: ['Valid format', 'Nothing invented', 'Right meeting'],
    kind: { task: 'Task', role: 'Role', notes: 'Notes · this morning', old: 'Notes · yesterday', example: 'Example', format: 'Format', archive: 'Archive' },
    text: {
      task: 'The brief for Thursday with Inès Caron',
      role: 'You prepare my meetings',
      notes: 'Thursday 10 am, video call, Brume & Quai',
      old: 'Thursday 5 pm, video call, Brume & Quai',
      example: 'A complete brief, already filled in',
      format: 'JSON only, exact fields',
      archive: '40 pages of meeting reports',
    },
    tag: { buried: 'buried', stale: 'outdated', heavy: '40 pages' },
    stamp: { invented: 'invented', stale: 'outdated', other: 'another meeting', around: 'extra text' },
    day: { thu: 'jeudi', tue: 'mardi' },
    proseA: (d: string, h: string) => `So, for ${d === 'mardi' ? 'Tuesday' : 'Thursday'}… you are seeing Inès Caron around ${h}, I believe.`,
    proseB: 'Remember to reread your notes first, and have a good meeting!',
    wrapA: 'Of course! Here is the brief you asked for:',
    wrapB: 'Let me know if you would like another version.',
    why: {
      buried: 'Format instruction buried under 40 pages: it weighs less, it is ignored.',
      noform: 'No form requested: prose comes out, unreadable for code.',
      wrapped: 'The example pins the fields, not the “nothing around” rule: text surrounds the JSON.',
      invented: 'Without notes, the model guesses: the time and the company are invented.',
      guessed: 'A guessed time is not the meeting.',
      old: 'Outdated notes: 5 pm, printed with confidence.',
      conflict: 'Two versions of the notes: a contradiction, the old time comes out here.',
      archive: 'With no notes, an old archive page answered: Tuesday 9 am.',
    },
    win: (n: number) => (n <= 3 ? `Ready to print with ${n} blocks: the useful minimum.` : `Ready to print with ${n} blocks. Nothing outdated, nothing too long.`),
    lose: (n: number) => `${n} check${n > 1 ? 's' : ''} out of 3. Change the blocks, then pull the lever again.`,
  },
};

interface Print {
  shape: Shape;
  source: Source;
  buried: boolean;
  day: 'thu' | 'tue';
  time: string;
  company: string;
  checks: [boolean, boolean, boolean];
  count: number;
}

/** The whole rule of the game: what the press prints for a given bed. */
function compute(bed: BlockId[]): Print {
  const has = (b: BlockId) => bed.includes(b);
  const buried = has('archive') && (has('format') || has('example'));
  const shape: Shape = has('archive') ? 'prose' : has('format') ? 'json' : has('example') ? 'wrapped' : 'prose';
  const source: Source = has('old') ? (has('notes') ? 'conflict' : 'old') : has('notes') ? 'fresh' : has('archive') ? 'archive' : 'invented';
  const time = source === 'fresh' ? '10:00' : source === 'old' || source === 'conflict' ? '17:00' : source === 'archive' ? '09:00' : '14:30';
  return {
    shape,
    source,
    buried,
    day: source === 'archive' ? 'tue' : 'thu',
    time,
    company: source === 'invented' ? 'Caron Conseil' : 'Brume & Quai',
    checks: [shape === 'json', source !== 'invented', source === 'fresh'],
    count: bed.length + 1,
  };
}

function reducedMotion() {
  return typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export default function Game({ lang, onSolved, onMistake }: SignatureProps) {
  const t = T[lang];
  const [bed, setBed] = useState<BlockId[]>([]);
  const [phase, setPhase] = useState<'idle' | 'pressing' | 'printed'>('idle');
  const [print, setPrint] = useState<Print | null>(null);
  const [dirty, setDirty] = useState(false);
  const [pulls, setPulls] = useState(0);
  const [solved, setSolved] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const done = useRef(false);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const toggle = (id: BlockId) => {
    if (solved || phase === 'pressing') return;
    const on = bed.includes(id);
    setBed(on ? bed.filter((b) => b !== id) : [...bed, id]);
    sfx(on ? 'tick' : 'place');
    if (print) setDirty(true);
  };

  const pull = () => {
    if (solved || phase === 'pressing') return;
    sfx('latch');
    setPhase('pressing');
    const snapshot = [...bed];
    timers.current.push(
      setTimeout(() => {
        const p = compute(snapshot);
        setPrint(p);
        setDirty(false);
        setPulls((n) => n + 1);
        setPhase('printed');
        if (p.checks.every(Boolean)) {
          setSolved(true);
          sfx('correct');
          if (!done.current) {
            done.current = true;
            timers.current.push(setTimeout(onSolved, 700));
          }
        } else {
          sfx('wrong');
          onMistake?.();
        }
      }, reducedMotion() ? 60 : 620),
    );
  };

  const live = print && !dirty ? print : null;
  const tagOf = (id: BlockId): string | null => {
    if (!live) return null;
    if ((id === 'format' || id === 'example') && live.buried) return t.tag.buried;
    if (id === 'old') return t.tag.stale;
    if (id === 'archive') return t.tag.heavy;
    return null;
  };

  const whys: (string | null)[] = print
    ? [
        print.checks[0] ? null : print.buried ? t.why.buried : print.shape === 'wrapped' ? t.why.wrapped : t.why.noform,
        print.checks[1] ? null : t.why.invented,
        print.checks[2] ? null : print.source === 'invented' ? t.why.guessed : t.why[print.source as 'old' | 'conflict' | 'archive'],
      ]
    : [null, null, null];
  const okCount = print ? print.checks.filter(Boolean).length : 0;

  const timeStamp = print && (print.source === 'invented' ? t.stamp.invented : print.source === 'archive' ? t.stamp.other : print.source === 'fresh' ? null : t.stamp.stale);
  const proseTime = print ? (lang === 'fr' ? print.time.replace(':', ' h ').replace(' h 00', ' h') : print.time) : '';

  const json = print && (
    <pre className="sg02-json">
      <span>{'{'}</span>
      <span>{`  "date": "${t.day[print.day]}",`}{print.source === 'archive' && <i className="sg02-stamp">{t.stamp.other}</i>}</span>
      <span className={timeStamp ? 'is-bad' : undefined}>{`  "heure": "${print.time}",`}{timeStamp && print.source !== 'archive' && <i className="sg02-stamp">{timeStamp}</i>}</span>
      <span>{'  "contact": "Inès Caron",'}</span>
      <span className={print.source === 'invented' ? 'is-bad' : undefined}>{`  "entreprise": "${print.company}"`}{print.source === 'invented' && <i className="sg02-stamp">{t.stamp.invented}</i>}</span>
      <span>{'}'}</span>
    </pre>
  );

  return (
    <div className="sg02" data-game="c02" data-solved={solved ? 'true' : 'false'} data-phase={phase} data-pulls={pulls}>
      <section className="sg02-case" aria-label={t.case}>
        <p className="sg02-cap">{t.case}</p>
        <ul className="sg02-case-grid">
          {BLOCKS.map((id) => {
            const on = bed.includes(id);
            return (
              <li key={id}>
                <button
                  type="button"
                  className={`sg02-block sg02-block--${id}${on ? ' is-used' : ''}`}
                  onClick={() => toggle(id)}
                  disabled={solved || phase === 'pressing'}
                  aria-pressed={on}
                  aria-label={`${on ? t.remove : t.put} : ${t.kind[id]}, ${t.text[id]}`}
                  data-testid={`sg02-block-${id}`}
                >
                  <b>{t.kind[id]}</b>
                  <span>{t.text[id]}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="sg02-press" aria-label={t.bed}>
        <svg className="sg02-head" viewBox="0 0 320 70" aria-hidden="true" focusable="false">
          <rect x="0" y="6" width="320" height="26" rx="3" fill="#6b4a2f" />
          <rect x="0" y="26" width="320" height="6" fill="#57391f" />
          <rect x="132" y="0" width="56" height="38" rx="4" fill="#c9b67a" />
          <rect x="132" y="30" width="56" height="8" fill="#a8965f" />
          <circle cx="24" cy="19" r="4" fill="#c9b67a" />
          <circle cx="296" cy="19" r="4" fill="#c9b67a" />
          <g className="sg02-lever">
            <rect x="158" y="14" width="128" height="8" rx="4" fill="#2d2721" />
            <circle cx="290" cy="18" r="11" fill="#7c2f2a" />
            <circle cx="160" cy="18" r="9" fill="#2d2721" />
            <circle cx="160" cy="18" r="3.5" fill="#e3c27a" />
          </g>
        </svg>
        <div className="sg02-ram" aria-hidden="true">
          <span className="sg02-screw" />
          <span className="sg02-platen" />
        </div>
        <div className="sg02-bed">
          <p className="sg02-cap sg02-cap--bed">
            {t.bed} <span>{t.bedCount(bed.length + 1)}</span>
          </p>
          <ol className="sg02-bed-list">
            <li>
              <div className="sg02-block sg02-block--task is-fixed">
                <b>{t.kind.task} <em>{t.fixed}</em></b>
                <span>{t.text.task}</span>
              </div>
            </li>
            {bed.map((id) => {
              const tag = tagOf(id);
              return (
                <li key={id}>
                  <button
                    type="button"
                    className={`sg02-block sg02-block--${id} is-set${tag ? ' has-tag' : ''}${tag === t.tag.buried ? ' is-buried' : ''}`}
                    onClick={() => toggle(id)}
                    disabled={solved || phase === 'pressing'}
                    aria-label={`${t.remove} : ${t.kind[id]}, ${t.text[id]}${tag ? ` (${tag})` : ''}`}
                    data-testid={`sg02-bed-${id}`}
                  >
                    <b>{t.kind[id]}</b>
                    <span>{t.text[id]}</span>
                    {tag && <i className="sg02-tag">{tag}</i>}
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
        <div className="sg02-base" aria-hidden="true" />
      </section>

      <div className="sg02-action">
        <button type="button" className="sg02-pull" onClick={pull} disabled={solved || phase === 'pressing'} data-testid="sg02-pull">
          <span className="sg02-pull-knob" aria-hidden="true" />
          {phase === 'pressing' ? t.pressing : t.pull}
        </button>
        {!solved && (!print || dirty) && <p className="sg02-hint">{print ? t.hintDirty : t.hintStart}</p>}
      </div>

      <section className={`sg02-out${print ? ' has-print' : ''}${dirty ? ' is-stale' : ''}`} aria-label={t.sheet}>
        {print && (
          <div className={`sg02-sheet sg02-sheet--${print.shape}`} key={pulls} data-testid="sg02-sheet" data-shape={print.shape} data-source={print.source}>
            <p className="sg02-cap sg02-cap--sheet">
              {t.sheet} {dirty && <span>{t.stale}</span>}
            </p>
            {print.shape === 'prose' && (
              <p className="sg02-prose">
                {t.proseA(t.day[print.day], proseTime)}
                {timeStamp && <i className="sg02-stamp">{timeStamp}</i>} {t.proseB}
              </p>
            )}
            {print.shape === 'wrapped' && (
              <>
                <p className="sg02-prose sg02-prose--around">{t.wrapA}<i className="sg02-stamp">{t.stamp.around}</i></p>
                {json}
                <p className="sg02-prose sg02-prose--around">{t.wrapB}</p>
              </>
            )}
            {print.shape === 'json' && json}
          </div>
        )}
        <div className="sg02-checker" key={`c${pulls}`}>
          <p className="sg02-cap sg02-cap--checker">{t.checker}</p>
          <ul>
            {t.checks.map((label, i) => {
              const state = !print ? 'wait' : print.checks[i] ? 'ok' : 'ko';
              return (
                <li key={label} className={`sg02-check is-${state}`} data-testid={`sg02-check-${i}`} data-state={state} style={{ animationDelay: `${i * 140}ms` }}>
                  <span className="sg02-lamp" aria-hidden="true" />
                  <span className="sg02-check-label">{label}</span>
                  <span className="sg02-check-state">{state === 'wait' ? t.wait : state === 'ok' ? t.pass : t.fail}</span>
                  {whys[i] && <span className="sg02-why">{whys[i]}</span>}
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <p className="sg02-verdict" role="status" aria-live="polite" data-testid="sg02-verdict">
        {print && !dirty && (solved ? t.win(print.count) : <>{t.lose(okCount)} <span className="sg02-vh">{whys.filter(Boolean).join(' ')}</span></>)}
      </p>
      <p className="sg02-sim">{t.sim}</p>
    </div>
  );
}
