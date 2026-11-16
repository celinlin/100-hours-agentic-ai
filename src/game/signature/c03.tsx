'use client';

import './c03.css';
import { useEffect, useRef, useState } from 'react';
import { sfx } from '../sound';
import type { SignatureProps } from './list';

/**
 * 03 · "L'établi de l'agent" — the agent's workbench.
 * The learner plays the model: fills a tool_use slip (tool, argument name, value). The bench's
 * code checks it (allow-list, argument schema), runs the tool with a mechanical arm and returns a
 * tool_result or a typed error. Each model output burns one turn of max_tours. Won when the final
 * answer is given with the three facts of the brief in the history.
 */

type Tool = 'calendrier' | 'recherche' | 'envoyer_mail';
type Arg = 'jour' | 'date' | 'requete' | 'a';
type Val = 'jeudi' | 'ines' | 'bq';
type Fact = 'when' | 'company' | 'contact';
type Kind = 'ok' | 'empty' | 'error' | 'refused';

const MAX_TOURS = 6;
const ALLOWED: Tool[] = ['calendrier', 'recherche'];
const SCHEMA: Record<Tool, Arg> = { calendrier: 'jour', recherche: 'requete', envoyer_mail: 'a' };
const TOOLS: Tool[] = ['calendrier', 'recherche', 'envoyer_mail'];
const ARGS: Arg[] = ['date', 'requete', 'jour', 'a'];
const VALS: Val[] = ['jeudi', 'ines', 'bq'];
const VAL_TEXT: Record<Val, string> = { jeudi: 'jeudi', ines: 'Inès Caron', bq: 'Brume & Quai' };

interface Turn {
  n: number;
  call: string;
  kind: Kind;
  result: string;
  fact?: Fact;
  repeat?: boolean;
}

const T = {
  fr: {
    request: 'La demande',
    goal: '« Prépare mon rendez-vous de jeudi avec Inès Caron. »',
    turns: (n: number) => `Tour ${n} sur ${MAX_TOURS}`,
    slip: 'Le bon du modèle : tool_use',
    tool: 'Outil',
    arg: 'Argument',
    val: 'Valeur',
    locked: 'pas encore connu',
    send: 'Envoyer le bon',
    final: 'Réponse finale',
    restart: 'Relancer l’agent',
    bench: 'Ton code',
    allow: 'liste autorisée',
    off: 'hors liste',
    schema: 'Schémas des outils',
    brief: 'Le brief',
    facts: { when: 'Quand', company: 'Entreprise', contact: 'Contact' },
    values: { when: 'jeudi, 10 h, visio, 45 min', company: 'agence de communication, Lille, 12 personnes', contact: 'Inès Caron, directrice associée' },
    hole: 'inconnu',
    history: 'L’historique',
    empty: 'Vide : le modèle ne sait encore rien.',
    result: 'tool_result',
    repeat: 'déjà dans l’historique',
    hint0: 'Remplis le bon : un outil, son argument, une valeur.',
    hintNext: 'Le résultat est dans l’historique. Que manque-t-il au brief ?',
    hintReady: 'Le brief est complet : réponds sans outil.',
    res: {
      cal: '10 h, Inès Caron, Brume & Quai, visio, 45 min.',
      calNone: (v: string) => `Aucun rendez-vous pour « ${v} ».`,
      bq: 'Agence de communication à Lille, douze personnes.',
      ines: 'Directrice associée de Brume & Quai depuis 2022.',
      none: (v: string) => `Aucun résultat utile pour « ${v} ».`,
      unknown: (a: string, good: string) => `Erreur : argument inconnu : ${a}. Utilise ${good}.`,
      refused: 'Refusé : outil absent de la liste de l’agent.',
    },
    why: {
      ok: 'Exécuté par ton code, renvoyé au modèle.',
      empty: 'Appel valide, mais un tour dépensé pour rien.',
      repeat: 'Même appel, même résultat : un tour perdu.',
      error: 'Le schéma est vérifié par ton code. L’erreur revient au modèle, qui peut corriger.',
      refused: 'Le modèle peut demander, ton code décide : rien n’a été envoyé.',
    },
    halted: 'Arrêt : limite de tours atteinte.',
    haltedWhy: 'Sans max_tours, cette boucle tournerait encore. Relance et dépense moins de tours.',
    thin: 'Brief à trous.',
    thinWhy: 'Le modèle ne sait que ce que l’historique contient. Relance et va chercher ce qui manque.',
    win: (n: number) => `Brief complet en ${n} tours. Le modèle a demandé, ton code a exécuté.`,
    stop: 'stop_reason : "end_turn"',
    sim: 'Simulation : les deux outils sont une table de réponses, comme dans le programme.',
  },
  en: {
    request: 'The request',
    goal: '“Prepare my Thursday meeting with Inès Caron.”',
    turns: (n: number) => `Turn ${n} of ${MAX_TOURS}`,
    slip: 'The model’s slip: tool_use',
    tool: 'Tool',
    arg: 'Argument',
    val: 'Value',
    locked: 'not known yet',
    send: 'Send the slip',
    final: 'Final answer',
    restart: 'Restart the agent',
    bench: 'Your code',
    allow: 'allow-list',
    off: 'not listed',
    schema: 'Tool schemas',
    brief: 'The brief',
    facts: { when: 'When', company: 'Company', contact: 'Contact' },
    values: { when: 'Thursday, 10 am, video call, 45 min', company: 'communications agency, Lille, 12 people', contact: 'Inès Caron, associate director' },
    hole: 'unknown',
    history: 'The history',
    empty: 'Empty: the model knows nothing yet.',
    result: 'tool_result',
    repeat: 'already in the history',
    hint0: 'Fill in the slip: a tool, its argument, a value.',
    hintNext: 'The result is in the history. What is the brief still missing?',
    hintReady: 'The brief is complete: answer without a tool.',
    res: {
      cal: '10 am, Inès Caron, Brume & Quai, video call, 45 min.',
      calNone: (v: string) => `No meeting for “${v}”.`,
      bq: 'Communications agency in Lille, twelve people.',
      ines: 'Associate director at Brume & Quai since 2022.',
      none: (v: string) => `No useful result for “${v}”.`,
      unknown: (a: string, good: string) => `Error: unknown argument: ${a}. Use ${good}.`,
      refused: 'Refused: tool not in the agent’s list.',
    },
    why: {
      ok: 'Executed by your code, returned to the model.',
      empty: 'A valid call, but a turn spent for nothing.',
      repeat: 'Same call, same result: a turn lost.',
      error: 'Your code checks the schema. The error goes back to the model, which can fix it.',
      refused: 'The model may ask, your code decides: nothing was sent.',
    },
    halted: 'Stopped: turn limit reached.',
    haltedWhy: 'Without max_tours, this loop would still be running. Restart and spend fewer turns.',
    thin: 'A brief with holes.',
    thinWhy: 'The model only knows what the history contains. Restart and fetch what is missing.',
    win: (n: number) => `Complete brief in ${n} turns. The model asked, your code executed.`,
    stop: 'stop_reason: "end_turn"',
    sim: 'Simulation: both tools are a table of answers, as in the programme.',
  },
};

type Txt = (typeof T)['fr'];

/** The bench's code: allow-list, then argument schema, then the (simulated) tool. */
function execute(tool: Tool, arg: Arg, val: Val, t: Txt): { kind: Kind; result: string; fact?: Fact } {
  if (!ALLOWED.includes(tool)) return { kind: 'refused', result: t.res.refused };
  if (SCHEMA[tool] !== arg) return { kind: 'error', result: t.res.unknown(arg, SCHEMA[tool]) };
  if (tool === 'calendrier') {
    return val === 'jeudi' ? { kind: 'ok', result: t.res.cal, fact: 'when' } : { kind: 'empty', result: t.res.calNone(VAL_TEXT[val]) };
  }
  if (val === 'bq') return { kind: 'ok', result: t.res.bq, fact: 'company' };
  if (val === 'ines') return { kind: 'ok', result: t.res.ines, fact: 'contact' };
  return { kind: 'empty', result: t.res.none(VAL_TEXT[val]) };
}

function reducedMotion() {
  return typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

const FACTS: Fact[] = ['when', 'company', 'contact'];

export default function Game({ lang, onSolved, onMistake }: SignatureProps) {
  const t = T[lang];
  const [tool, setTool] = useState<Tool | null>(null);
  const [arg, setArg] = useState<Arg | null>(null);
  const [val, setVal] = useState<Val | null>(null);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [used, setUsed] = useState(0);
  const [busy, setBusy] = useState<Tool | 'check' | 'gate' | null>(null);
  const [end, setEnd] = useState<null | 'halted' | 'thin' | 'won'>(null);
  const [runs, setRuns] = useState(1);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const done = useRef(false);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const known = new Set<Fact>(turns.filter((x) => x.fact).map((x) => x.fact as Fact));
  const complete = FACTS.every((f) => known.has(f));
  const last = turns[turns.length - 1];
  const locked = busy !== null || end !== null;
  const call = `${tool ?? '…'}({"${arg ?? '…'}": "${val ? VAL_TEXT[val] : '…'}"})`;

  const pick = <X,>(set: (x: X) => void, x: X) => {
    if (locked) return;
    set(x);
    sfx('select');
  };

  const send = () => {
    if (locked || !tool || !arg || !val) return;
    const out = execute(tool, arg, val, t);
    const text = `${tool}({"${arg}": "${VAL_TEXT[val]}"})`;
    const repeat = out.kind === 'ok' && turns.some((x) => x.call === text && x.kind === 'ok');
    const n = used + 1;
    sfx('latch');
    setBusy(out.kind === 'refused' ? 'gate' : out.kind === 'error' ? 'check' : tool);
    timers.current.push(
      setTimeout(() => {
        setBusy(null);
        setUsed(n);
        setTurns((h) => [...h, { n, call: text, kind: out.kind, result: out.result, fact: repeat ? undefined : out.fact, repeat }]);
        if (out.kind === 'ok' && !repeat) {
          sfx('place');
          setArg(null);
          setVal(null);
        } else {
          sfx('wrong');
        }
        const halt = n >= MAX_TOURS;
        if (halt) setEnd('halted');
        if (halt || out.kind === 'error' || out.kind === 'refused') onMistake?.();
      }, reducedMotion() ? 60 : 760),
    );
  };

  const final = () => {
    if (locked) return;
    setUsed(used + 1);
    if (complete) {
      setEnd('won');
      sfx('correct');
      if (!done.current) {
        done.current = true;
        timers.current.push(setTimeout(onSolved, 700));
      }
    } else {
      setEnd('thin');
      sfx('wrong');
      onMistake?.();
    }
  };

  const restart = () => {
    setTurns([]);
    setUsed(0);
    setEnd(null);
    setTool(null);
    setArg(null);
    setVal(null);
    setRuns((r) => r + 1);
    sfx('tick');
  };

  const armTarget = busy === 'calendrier' ? 'cal' : busy === 'recherche' ? 'search' : busy === 'check' ? 'check' : busy === 'gate' ? 'gate' : 'rest';
  const status = end === 'won' ? t.win(used) : end === 'halted' ? t.haltedWhy : end === 'thin' ? t.thinWhy : last ? t.why[last.repeat ? 'repeat' : last.kind] : '';
  const hint = end ? '' : complete ? t.hintReady : turns.length === 0 ? t.hint0 : last?.kind === 'ok' && !last.repeat ? t.hintNext : '';

  return (
    <div className="sg03" data-game="c03" data-solved={end === 'won' ? 'true' : 'false'} data-busy={busy ? 'true' : 'false'} data-turns={used} data-end={end ?? 'none'}>
      <header className="sg03-top">
        <div className="sg03-request">
          <span className="sg03-pin" aria-hidden="true" />
          <p className="sg03-cap">{t.request}</p>
          <p className="sg03-goal">{t.goal}</p>
        </div>
        <div className="sg03-counter" role="img" aria-label={`${t.turns(Math.min(used, MAX_TOURS))} (max_tours = ${MAX_TOURS})`} data-testid="sg03-counter">
          <code>max_tours = {MAX_TOURS}</code>
          <span className="sg03-pegs" aria-hidden="true">
            {Array.from({ length: MAX_TOURS }, (_, i) => (
              <i key={i} className={i < used ? (end === 'halted' ? 'is-burnt is-halt' : 'is-burnt') : undefined} />
            ))}
          </span>
        </div>
      </header>

      <section className="sg03-wall" aria-label={t.schema}>
        <p className="sg03-schema-cap">{t.schema} · {t.allow}</p>
        <dl className="sg03-schema">
          <div>
            <dt>calendrier</dt>
            <dd>{'{"jour": string}'}</dd>
          </div>
          <div>
            <dt>recherche</dt>
            <dd>{'{"requete": string}'}</dd>
          </div>
          <div className="is-off">
            <dt>envoyer_mail</dt>
            <dd>{t.off}</dd>
          </div>
        </dl>
      </section>

      <section className="sg03-slip" aria-label={t.slip}>
        <p className="sg03-cap">{t.slip}</p>
        <div className="sg03-row" role="group" aria-label={t.tool}>
          <span className="sg03-row-label">{t.tool}</span>
          <div className="sg03-chips">
            {TOOLS.map((x) => (
              <button key={x} type="button" className="sg03-chip" aria-pressed={tool === x} disabled={locked} onClick={() => pick(setTool, x)} data-testid={`sg03-tool-${x}`}>
                {x}
              </button>
            ))}
          </div>
        </div>
        <div className="sg03-row" role="group" aria-label={t.arg}>
          <span className="sg03-row-label">{t.arg}</span>
          <div className="sg03-chips">
            {ARGS.map((x) => (
              <button key={x} type="button" className="sg03-chip" aria-pressed={arg === x} disabled={locked} onClick={() => pick(setArg, x)} data-testid={`sg03-arg-${x}`}>
                {x}
              </button>
            ))}
          </div>
        </div>
        <div className="sg03-row" role="group" aria-label={t.val}>
          <span className="sg03-row-label">{t.val}</span>
          <div className="sg03-chips">
            {VALS.map((x) => {
              const hidden = x === 'bq' && !known.has('when');
              return (
                <button key={x} type="button" className={`sg03-chip${hidden ? ' is-locked' : ''}`} aria-pressed={val === x} disabled={locked || hidden} onClick={() => pick(setVal, x)} data-testid={`sg03-val-${x}`} aria-label={hidden ? `? (${t.locked})` : undefined}>
                  {hidden ? `? · ${t.locked}` : `"${VAL_TEXT[x]}"`}
                </button>
              );
            })}
          </div>
        </div>
        <p className="sg03-call" data-testid="sg03-call">
          <code>{call}</code>
        </p>
        <div className="sg03-actions">
          {end && end !== 'won' ? (
            <button type="button" className="sg03-btn sg03-btn--primary" onClick={restart} data-testid="sg03-restart">
              {t.restart}
            </button>
          ) : (
            <>
              <button type="button" className="sg03-btn sg03-btn--primary" onClick={send} disabled={locked || !tool || !arg || !val} data-testid="sg03-send">
                {t.send}
              </button>
              <button type="button" className={`sg03-btn${complete ? ' is-ready' : ''}`} onClick={final} disabled={locked} data-testid="sg03-final">
                {t.final}
              </button>
            </>
          )}
        </div>
        {hint && <p className="sg03-hint">{hint}</p>}
      </section>

      <section className="sg03-bench" aria-label={t.bench} data-arm={armTarget} data-last={end || busy ? 'none' : last ? (last.kind === 'ok' && !last.repeat ? 'ok' : 'ko') : 'none'}>
        <p className="sg03-cap">
          {t.bench} <code>executer()</code>
        </p>
        <svg className="sg03-scene" viewBox="0 0 320 132" aria-hidden="true" focusable="false">
          {/* tool wall */}
          <rect x="196" y="6" width="118" height="84" rx="4" fill="#0f2a20" />
          <rect x="196" y="6" width="118" height="16" rx="4" fill="#1e4d3b" />
          {/* calendar */}
          <g className={`sg03-tool${busy === 'calendrier' ? ' is-hit' : ''}`}>
            <rect x="210" y="32" width="36" height="34" rx="3" fill="#efe7d8" />
            <rect x="210" y="32" width="36" height="10" rx="3" fill="#7c2f2a" />
            <rect x="217" y="27" width="4" height="9" rx="2" fill="#c9b67a" />
            <rect x="235" y="27" width="4" height="9" rx="2" fill="#c9b67a" />
            <rect x="216" y="48" width="6" height="5" fill="#2d2721" />
            <rect x="225" y="48" width="6" height="5" fill="#2d2721" />
            <rect x="234" y="48" width="6" height="5" fill="#e3c27a" />
            <rect x="216" y="56" width="6" height="5" fill="#2d2721" />
            <rect x="225" y="56" width="6" height="5" fill="#2d2721" />
          </g>
          {/* magnifier */}
          <g className={`sg03-tool${busy === 'recherche' ? ' is-hit' : ''}`}>
            <circle cx="278" cy="46" r="13" fill="#efe7d8" stroke="#c9b67a" strokeWidth="4" />
            <rect x="286" y="56" width="18" height="6" rx="3" transform="rotate(45 286 56)" fill="#c9b67a" />
          </g>
          {/* the tool that is not on the list, behind a grille */}
          <rect x="196" y="96" width="118" height="30" rx="4" fill="#2d2721" />
          <rect x="206" y="103" width="24" height="16" rx="2" fill="#efe7d8" />
          <path d="M206 104 l12 9 l12 -9" fill="none" stroke="#2d2721" strokeWidth="2" />
          <g stroke="#c9b67a" strokeWidth="2">
            <line x1="202" y1="98" x2="202" y2="124" />
            <line x1="212" y1="98" x2="212" y2="124" />
            <line x1="222" y1="98" x2="222" y2="124" />
            <line x1="232" y1="98" x2="232" y2="124" />
          </g>
          {/* bench top */}
          <rect x="0" y="108" width="186" height="10" rx="2" fill="#6b4a2f" />
          <rect x="10" y="118" width="10" height="14" fill="#57391f" />
          <rect x="166" y="118" width="10" height="14" fill="#57391f" />
          {/* slip slot and checker lamp */}
          <rect x="8" y="84" width="46" height="24" rx="3" fill="#2d2721" />
          <rect x="14" y="90" width="34" height="4" rx="2" fill="#efe7d8" />
          <circle className="sg03-gate" cx="31" cy="101" r="4" />
          {/* the arm */}
          <rect x="84" y="96" width="36" height="12" rx="3" fill="#2d2721" />
          <g className="sg03-arm">
            <rect x="98" y="88" width="96" height="8" rx="4" fill="#c9b67a" />
            <path d="M190 84 h12 v4 h-8 v8 h8 v4 h-12 z" fill="#2d2721" />
            <rect className="sg03-ticket" x="150" y="76" width="30" height="12" rx="2" />
            <circle cx="102" cy="92" r="9" fill="#2d2721" />
            <circle cx="102" cy="92" r="3.5" fill="#e3c27a" />
          </g>
        </svg>
      </section>

      <div className="sg03-live" role="status" aria-live="polite">
        {last && !end && (
          <div className={`sg03-result is-${last.kind}`} key={`${runs}-${last.n}`} data-testid="sg03-result" data-kind={last.kind} data-turn={last.n}>
            <p className="sg03-result-head">
              <code>{t.result}</code>
              {last.repeat && <span>{t.repeat}</span>}
            </p>
            <p className="sg03-result-text">{last.result}</p>
          </div>
        )}
        {end && end !== 'won' && (
          <div className="sg03-result is-halt" data-testid="sg03-end" data-kind={end}>
            <p className="sg03-result-text">{end === 'halted' ? t.halted : t.thin}</p>
          </div>
        )}
        {status && <p className="sg03-status" data-testid="sg03-status">{status}</p>}
      </div>

      <section className={`sg03-brief${end === 'won' ? ' is-final' : ''}${end === 'thin' ? ' is-thin' : ''}`} aria-label={t.brief}>
        <p className="sg03-cap">
          {t.brief}
          {end === 'won' && <code className="sg03-stop">{t.stop}</code>}
        </p>
        <dl>
          {FACTS.map((f) => (
            <div key={f} className={known.has(f) ? 'is-known' : undefined} data-testid={`sg03-fact-${f}`} data-known={known.has(f) ? 'true' : 'false'}>
              <dt>{t.facts[f]}</dt>
              <dd>{known.has(f) ? t.values[f] : end === 'thin' ? t.hole : '…'}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="sg03-history" aria-label={t.history}>
        <p className="sg03-cap">{t.history}</p>
        {turns.length === 0 ? (
          <p className="sg03-empty">{t.empty}</p>
        ) : (
          <ol>
            {turns.map((x) => (
              <li key={`${runs}-${x.n}`} className={`is-${x.kind}`}>
                <span className="sg03-h-n">{x.n}</span>
                <code>{x.call}</code>
                <span className="sg03-h-res">{x.result}</span>
              </li>
            ))}
          </ol>
        )}
      </section>
      <p className="sg03-sim">{t.sim}</p>
    </div>
  );
}
