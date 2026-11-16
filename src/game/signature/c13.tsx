'use client';

import './c13.css';
import { useEffect, useRef, useState } from 'react';
import type { SignatureProps } from './list';
import { sfx } from '../sound';

/* ------------------------------------------------------------------------------------------
 * 13 · La chaufferie — the night shift.
 * The learner sets the regulator (key, retries, delay, which errors are retried, daily cap,
 * alert), then launches a night. A fixed sequence of events (529 burst, runaway loop, 429,
 * 401 after a key rotation) plays on the gauges; every outcome is computed from the settings.
 * Amounts in euros are illustrative; the error codes and their handling are the Claude API's.
 * ---------------------------------------------------------------------------------------- */

type Lang = 'fr' | 'en';
interface Cfg {
  key: 'code' | 'env';
  tries: '1' | '3' | 'inf';
  delay: 'none' | 'expo';
  scope: 'all' | 'transient';
  cap: 'off' | 'on';
  alert: 'none' | 'all' | 'useful';
}
const START: Cfg = { key: 'code', tries: 'inf', delay: 'none', scope: 'all', cap: 'off', alert: 'none' };
const CAP = 5;
const RECOVERABLE = 9;

type LineId =
  | 'keyCode' | 'keyEnv'
  | 'b1' | 'bFast' | 'bHammer' | 'bOk' | 'bHang'
  | 'loopCap' | 'loopFree'
  | 'r1' | 'rFast' | 'rHammer' | 'rOk'
  | 'aStop' | 'aRetry3' | 'aLoop' | 'fixed' | 'mute' | 'drowned';
interface Line { id: LineId; bad: boolean; n?: number }
interface Step { time: string; code: string; lines: Line[]; pressure: number; spend: number; served: number; alerts: number }
interface Night {
  steps: Step[];
  served: number;
  peak: number;
  wasted: boolean;
  hammer: boolean;
  hang: boolean;
  retry401: boolean;
  alertRead: boolean;
  alerts: number;
  leak: boolean;
  checks: boolean[];
  won: boolean;
}

/** The whole night, computed from the regulator. No randomness. */
function night(c: Cfg): Night {
  const inf = c.tries === 'inf';
  const spaced = c.delay === 'expo';
  const hammer = inf && !spaced;
  const useful = c.alert === 'useful';
  const steps: Step[] = [];
  let served = 0;
  let errors = 0; // error responses seen: what a "one alert per error" setting would send
  let alerts = 0; // useful alerts actually sent
  let hang = false;

  steps.push({ time: '22:00', code: 'KEY', lines: [{ id: c.key === 'code' ? 'keyCode' : 'keyEnv', bad: c.key === 'code' }], pressure: 0.12, spend: 1.2, served, alerts });

  // 22:10 · 529 burst: five requests. Four pass once the overload clears (a few seconds); one meets a long outage.
  const burst: Line[] = [];
  if (c.tries === '1') { burst.push({ id: 'b1', bad: true }); errors += 5; if (useful) alerts += 1; }
  else if (!spaced && !inf) { burst.push({ id: 'bFast', bad: true }); errors += 15; if (useful) alerts += 1; }
  else if (hammer) { burst.push({ id: 'bHammer', bad: true }); served += 4; errors += 300; hang = true; }
  else {
    served += 4;
    errors += 11;
    if (inf) { burst.push({ id: 'bHang', bad: true }); hang = true; }
    else { burst.push({ id: 'bOk', bad: false }); if (useful) alerts += 1; }
  }
  steps.push({ time: '22:10', code: '529', lines: burst, pressure: hammer ? 1 : spaced ? 0.3 : 0.55, spend: 1.2, served, alerts });

  // 23:20 · a runaway loop burns tokens until the daily cap, or until nothing stops it.
  const peak = c.cap === 'on' ? CAP : 38.4;
  if (c.cap === 'on' && useful) alerts += 1;
  steps.push({ time: '23:20', code: 'LOOP', lines: [{ id: c.cap === 'on' ? 'loopCap' : 'loopFree', bad: c.cap !== 'on' }], pressure: c.cap === 'on' ? 0.2 : 0.7, spend: peak, served, alerts });

  // 01:30 · 429 on two requests (a new day: the spend gauge is back near zero).
  const rate: Line[] = [];
  if (c.tries === '1') { rate.push({ id: 'r1', bad: true }); errors += 2; }
  else if (hammer) { rate.push({ id: 'rHammer', bad: true }); errors += 300; }
  else if (!spaced) { rate.push({ id: 'rFast', bad: true }); errors += 6; }
  else { rate.push({ id: 'rOk', bad: false }); served += 2; errors += 2; }
  steps.push({ time: '01:30', code: '429', lines: rate, pressure: hammer ? 1 : spaced ? 0.3 : 0.6, spend: 0.3, served, alerts });

  // 02:40 · the key was rotated: 401. Retrying cannot fix it; only a human with a readable alert can.
  const auth: Line[] = [];
  const retry401 = c.scope === 'all' && c.tries !== '1';
  const stuck = retry401 && inf;
  auth.push(retry401 ? { id: inf ? 'aLoop' : 'aRetry3', bad: true } : { id: 'aStop', bad: false });
  errors += retry401 ? (inf ? 300 : 3) : 1;
  const alertRead = useful && !stuck;
  if (useful) alerts += 1;
  if (alertRead) { served += 3; auth.push({ id: 'fixed', bad: false }); }
  else if (c.alert === 'all') auth.push({ id: 'drowned', bad: true, n: errors });
  else auth.push({ id: 'mute', bad: true });
  steps.push({ time: '02:40', code: '401', lines: auth, pressure: stuck ? 1 : 0.15, spend: 0.6, served, alerts });

  const wasted = hammer || hang || retry401;
  const checks = [served === RECOVERABLE, !wasted, peak <= CAP, alertRead, c.key === 'env'];
  return {
    steps, served, peak, wasted, hammer, hang, retry401, alertRead, leak: c.key === 'code',
    alerts: c.alert === 'all' ? errors : c.alert === 'useful' ? alerts : 0,
    checks, won: checks.every(Boolean),
  };
}

type Why = 'once' | 'nodelay' | 'retry401' | 'hammer' | 'hang' | 'nocap' | 'noisy' | 'silent' | 'leak';
/** The one-line reason shown after a failed night: the first failed check, traced to its cause. */
function reason(n: Night, c: Cfg): Why {
  const waste: Why = n.hammer ? 'hammer' : n.retry401 ? 'retry401' : 'hang';
  const alert: Why = c.alert === 'all' ? 'noisy' : 'silent';
  if (!n.checks[0]) {
    if (c.tries === '1') return 'once';
    if (n.hammer) return 'hammer';
    if (c.delay === 'none') return 'nodelay';
    return n.retry401 && c.tries === 'inf' ? 'retry401' : alert;
  }
  if (!n.checks[1]) return waste;
  if (!n.checks[2]) return 'nocap';
  if (!n.checks[3]) return alert;
  return 'leak';
}

const eur = (v: number, lang: Lang) => (lang === 'fr' ? `${v.toFixed(2).replace('.', ',')} €` : `€${v.toFixed(2)}`);

const T = {
  fr: {
    scene: 'La chaufferie, de nuit',
    gauges: ['Appels', 'Dépense du jour', 'Servies'],
    alerts: 'alertes',
    illus: 'Simulation · montants illustratifs',
    setHelp: 'Règle le régulateur, puis lance la nuit. Personne ne regardera.',
    groups: {
      key: 'Clé d’API',
      tries: 'Essais par demande',
      delay: 'Délai entre deux essais',
      scope: 'Erreurs réessayées',
      cap: 'Plafond du jour',
      alert: 'Alerte',
    } as Record<keyof Cfg, string>,
    opts: {
      key: { code: 'dans le code', env: 'dans l’environnement' },
      tries: { '1': '1', '3': '3', inf: 'sans limite' },
      delay: { none: 'aucun', expo: '1 s, 2 s, 4 s' },
      scope: { all: 'toutes', transient: '429, 529, 500' },
      cap: { off: 'aucun', on: '5 €' },
      alert: { none: 'aucune', all: 'à chaque erreur', useful: 'abandon, 401, plafond' },
    } as Record<keyof Cfg, Record<string, string>>,
    launch: 'Lancer la nuit',
    playing: 'La nuit tourne…',
    back: 'Régler à nouveau',
    codes: { KEY: 'clé', LOOP: 'boucle', '529': '529', '429': '429', '401': '401' } as Record<string, string>,
    lines: {
      keyCode: 'Clé écrite dans le code : elle part dans le dépôt avec lui.',
      keyEnv: 'Clé lue dans ANTHROPIC_API_KEY : rien dans le dépôt.',
      b1: 'Saturation : un seul essai, 5 demandes abandonnées.',
      bFast: '3 essais dans la même seconde : l’API est encore saturée. 5 abandons.',
      bHammer: 'Essais sans pause ni fin : des centaines d’appels, la jauge est au rouge.',
      bOk: 'Essais à 1 s, 2 s, 4 s : 4 demandes repassent. Panne longue pour la 5e : abandon propre.',
      bHang: '4 demandes repassent. La 5e réessaie sans fin : son client attend toujours.',
      loopCap: 'Boucle folle : budget vérifié avant l’appel, arrêt à 5,00 €.',
      loopFree: 'Boucle folle : rien ne l’arrête. 38,40 € brûlés.',
      r1: 'Limite de débit : un seul essai, 2 abandons.',
      rFast: 'Réessayé tout de suite : la limite n’a pas eu le temps de retomber. 2 abandons.',
      rHammer: 'Sans pause, chaque essai compte dans la limite : les 429 se multiplient.',
      rOk: 'Attente (retry-after), puis nouvel essai : 2 demandes repassent.',
      aStop: 'Clé changée : arrêt immédiat, message clair, clé non affichée.',
      aRetry3: 'Clé changée, réessayée 3 fois : elle reste fausse. Appels inutiles.',
      aLoop: 'Clé changée, réessayée sans fin : elle reste fausse jusqu’au matin.',
      fixed: 'Alerte lue : clé remplacée, 3 demandes servies.',
      mute: 'Aucune alerte utile : service muet jusqu’au matin, 3 demandes perdues.',
      drowned: (n: number) => `Alerte noyée parmi ${n >= 300 ? 'des centaines' : n} : personne ne la lit. 3 demandes perdues.`,
    },
    report: 'Rapport du matin',
    checks: [
      (n: Night) => `Demandes récupérables servies : ${n.served} / ${RECOVERABLE}`,
      (n: Night) => (n.wasted ? 'Des essais inutiles' : 'Aucun essai inutile'),
      (n: Night) => `Jour le plus cher : ${eur(n.peak, 'fr')} (plafond ${eur(CAP, 'fr')})`,
      (n: Night) => (n.alertRead ? `Alerte utile lue (${n.alerts} dans la nuit)` : n.alerts ? `${n.alerts >= 300 ? 'Des centaines d’' : `${n.alerts} `}alertes, aucune lue` : 'Aucune alerte'),
      (n: Night) => (n.leak ? 'Clé dans le dépôt : à révoquer' : 'Clé hors du code'),
    ],
    why: {
      once: 'Une erreur passagère se réessaie : 429, 529 et 500 méritent trois essais.',
      nodelay: 'Réessayer sans attendre retombe sur la même panne : il faut un délai qui double.',
      retry401: 'Un 401 ne guérit pas en réessayant : on s’arrête et on prévient.',
      hammer: 'Marteler une API saturée aggrave la panne : des essais comptés, espacés.',
      hang: 'Sans limite d’essais, une panne longue ne finit jamais : trois essais, puis abandon propre.',
      nocap: 'Sans plafond vérifié avant l’appel, le pire cas n’a pas de borne.',
      noisy: 'Une alerte à chaque erreur n’est plus lue : rare et précise, sinon rien.',
      silent: 'Sans alerte, personne ne sait que le service est tombé : les demandes suivantes sont perdues.',
      leak: 'Une clé dans le code fuit avec lui : elle vit dans l’environnement.',
    } as Record<Why, string>,
    win: 'Nuit tenue : chaque panne est sortie par une porte connue.',
  },
  en: {
    scene: 'The boiler room at night',
    gauges: ['Calls', 'Spend today', 'Served'],
    alerts: 'alerts',
    illus: 'Simulation · illustrative amounts',
    setHelp: 'Set the regulator, then launch the night. Nobody will be watching.',
    groups: {
      key: 'API key',
      tries: 'Attempts per request',
      delay: 'Delay between attempts',
      scope: 'Errors retried',
      cap: 'Daily cap',
      alert: 'Alert',
    } as Record<keyof Cfg, string>,
    opts: {
      key: { code: 'in the code', env: 'in the environment' },
      tries: { '1': '1', '3': '3', inf: 'unlimited' },
      delay: { none: 'none', expo: '1 s, 2 s, 4 s' },
      scope: { all: 'all', transient: '429, 529, 500' },
      cap: { off: 'none', on: '€5' },
      alert: { none: 'none', all: 'on every error', useful: 'give-up, 401, cap' },
    } as Record<keyof Cfg, Record<string, string>>,
    launch: 'Launch the night',
    playing: 'The night is running…',
    back: 'Adjust again',
    codes: { KEY: 'key', LOOP: 'loop', '529': '529', '429': '429', '401': '401' } as Record<string, string>,
    lines: {
      keyCode: 'Key written in the code: it goes into the repository with it.',
      keyEnv: 'Key read from ANTHROPIC_API_KEY: nothing in the repository.',
      b1: 'Overload: a single attempt, 5 requests given up.',
      bFast: '3 attempts within the same second: the API is still overloaded. 5 give-ups.',
      bHammer: 'Attempts with no pause and no end: hundreds of calls, the gauge is in the red.',
      bOk: 'Attempts at 1 s, 2 s, 4 s: 4 requests get through. Long outage for the 5th: clean give-up.',
      bHang: '4 requests get through. The 5th retries forever: its client is still waiting.',
      loopCap: 'Runaway loop: budget checked before the call, stopped at €5.00.',
      loopFree: 'Runaway loop: nothing stops it. €38.40 burnt.',
      r1: 'Rate limit: a single attempt, 2 give-ups.',
      rFast: 'Retried at once: the limit has had no time to recover. 2 give-ups.',
      rHammer: 'With no pause, every attempt counts against the limit: the 429s multiply.',
      rOk: 'Wait (retry-after), then a new attempt: 2 requests get through.',
      aStop: 'Key rotated: immediate stop, clear message, key not shown.',
      aRetry3: 'Key rotated, retried 3 times: it is still wrong. Useless calls.',
      aLoop: 'Key rotated, retried forever: it is still wrong in the morning.',
      fixed: 'Alert read: key replaced, 3 requests served.',
      mute: 'No useful alert: the service stays silent until morning, 3 requests lost.',
      drowned: (n: number) => `Alert drowned among ${n >= 300 ? 'hundreds' : n}: nobody reads it. 3 requests lost.`,
    },
    report: 'Morning report',
    checks: [
      (n: Night) => `Recoverable requests served: ${n.served} / ${RECOVERABLE}`,
      (n: Night) => (n.wasted ? 'Useless attempts' : 'No useless attempt'),
      (n: Night) => `Most expensive day: ${eur(n.peak, 'en')} (cap ${eur(CAP, 'en')})`,
      (n: Night) => (n.alertRead ? `Useful alert read (${n.alerts} in the night)` : n.alerts ? `${n.alerts >= 300 ? 'Hundreds of' : n.alerts} alerts, none read` : 'No alert'),
      (n: Night) => (n.leak ? 'Key in the repository: revoke it' : 'Key out of the code'),
    ],
    why: {
      once: 'A temporary error is worth retrying: 429, 529 and 500 deserve three attempts.',
      nodelay: 'Retrying without waiting hits the same failure: the delay must double.',
      retry401: 'A 401 does not heal by retrying: stop and tell someone.',
      hammer: 'Hammering an overloaded API makes it worse: counted, spaced attempts.',
      hang: 'With unlimited attempts a long outage never ends: three attempts, then a clean give-up.',
      nocap: 'Without a cap checked before the call, the worst case has no bound.',
      noisy: 'An alert on every error stops being read: rare and precise, or nothing.',
      silent: 'Without an alert, nobody knows the service is down: the next requests are lost.',
      leak: 'A key in the code leaks with it: it lives in the environment.',
    } as Record<Why, string>,
    win: 'The night held: every failure left through a known door.',
  },
};

const GROUPS: (keyof Cfg)[] = ['key', 'tries', 'delay', 'scope', 'cap', 'alert'];
const STEP_MS = 850;

function Gauge({ x, v, label, read, zone, mark }: { x: number; v: number; label: string; read: string; zone?: boolean; mark?: number }) {
  const a = -120 + 240 * Math.max(0, Math.min(1, v));
  const pt = (deg: number, r: number) => {
    const rad = ((deg - 90) * Math.PI) / 180;
    return `${(x + r * Math.cos(rad)).toFixed(1)} ${(60 + r * Math.sin(rad)).toFixed(1)}`;
  };
  return (
    <g>
      <circle cx={x} cy="60" r="30" fill="#c9b67a" />
      <circle cx={x} cy="60" r="26" fill="#efe7d8" />
      {zone && <path d={`M${pt(60, 22)} A22 22 0 0 1 ${pt(120, 22)}`} fill="none" stroke="#7c2f2a" strokeWidth="5" />}
      {mark !== undefined && <path d={`M${pt(-120 + 240 * mark, 17)} L${pt(-120 + 240 * mark, 26)}`} stroke="#7c2f2a" strokeWidth="2.5" />}
      {[-120, -60, 0, 60, 120].map((d) => <path key={d} d={`M${pt(d, 21)} L${pt(d, 25)}`} stroke="#2d2721" strokeWidth="1.5" />)}
      <g className="sg13-needle" style={{ transform: `rotate(${a}deg)`, transformOrigin: `${x}px 60px` }}>
        <path d={`M${x} 64 L${x} 40`} stroke="#0f2a20" strokeWidth="3" strokeLinecap="round" />
      </g>
      <circle cx={x} cy="60" r="4" fill="#0f2a20" />
      <text x={x} y="106" textAnchor="middle" className="sg13-g__label">{label}</text>
      <text x={x} y="121" textAnchor="middle" className="sg13-g__read">{read}</text>
    </g>
  );
}

export default function Game({ lang, onSolved, onMistake }: SignatureProps) {
  const t = T[lang];
  const [cfg, setCfg] = useState<Cfg>(START);
  const [run, setRun] = useState<Night | null>(null);
  const [shown, setShown] = useState(0); // events revealed (0..5)
  const [playing, setPlaying] = useState(false);
  const [status, setStatus] = useState<{ tone: 'ok' | 'err'; text: string } | null>(null);
  const [solved, setSolved] = useState(false);
  const timers = useRef<number[]>([]);
  const done = useRef(false);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => () => { timers.current.forEach((id) => window.clearTimeout(id)); }, []);

  const set = <K extends keyof Cfg>(k: K, v: Cfg[K]) => {
    if (cfg[k] === v) return;
    setCfg({ ...cfg, [k]: v });
    sfx('latch');
  };

  const launch = () => {
    if (playing || solved) return;
    const n = night(cfg);
    setRun(n);
    setShown(0);
    setPlaying(true);
    setStatus(null);
    sfx('open');
    n.steps.forEach((s, i) => {
      timers.current.push(window.setTimeout(() => {
        setShown(i + 1);
        sfx(s.lines.some((l) => l.bad) ? 'wrong' : 'place');
      }, (i + 1) * STEP_MS));
    });
    timers.current.push(window.setTimeout(() => {
      setPlaying(false);
      if (n.won) {
        setStatus({ tone: 'ok', text: t.win });
        setSolved(true);
        sfx('solve');
        if (!done.current) {
          done.current = true;
          timers.current.push(window.setTimeout(onSolved, 700));
        }
      } else {
        setStatus({ tone: 'err', text: t.why[reason(n, cfg)] });
        onMistake?.();
      }
      reportRef.current?.scrollIntoView({ block: 'nearest', behavior: 'auto' });
    }, (n.steps.length + 1) * STEP_MS));
  };

  const back = () => {
    setRun(null);
    setShown(0);
    sfx('close');
  };

  const cur = run && shown > 0 ? run.steps[shown - 1] : null;
  const morning = !!run && !playing && shown === run.steps.length;
  const clock = morning ? '06:00' : cur ? cur.time : '22:00';
  const spend = cur ? cur.spend : 0;
  const lineText = (l: Line) => (l.id === 'drowned' ? t.lines.drowned(l.n ?? 0) : t.lines[l.id]);

  return (
    <div className="sg13" data-game="c13" data-solved={solved ? 'true' : 'false'}>
      <svg className="sg13-scene" viewBox="0 0 320 140" role="img" aria-label={t.scene}>
        <rect width="320" height="140" fill="#2d2721" />
        <path d="M0 135 H320" stroke="#6b4a2f" strokeWidth="10" />
        <path d="M70 22 V8 H320" fill="none" stroke="#6b4a2f" strokeWidth="6" />
        {/* the boiler */}
        <rect x="14" y="22" width="84" height="108" rx="14" fill="#7c2f2a" />
        <rect x="14" y="40" width="84" height="5" fill="#2d2721" />
        <rect x="14" y="100" width="84" height="5" fill="#2d2721" />
        <rect x="34" y="56" width="44" height="34" rx="4" fill="#0f2a20" />
        <g className="sg13-flame" style={{ transform: `scale(${(0.55 + 0.75 * (cur ? cur.pressure : 0.12)).toFixed(2)})`, transformOrigin: '56px 88px' }}>
          <path d="M56 62 C66 72 68 78 64 86 H48 C44 78 48 72 56 62 Z" fill="#e3c27a" />
        </g>
        <rect x="30" y="26" width="52" height="12" fill="#0f2a20" />
        <text x="56" y="35.5" textAnchor="middle" className="sg13-clock" data-testid="sg13-clock">{clock}</text>
        {/* the key: pinned on the boiler front (in the code) or locked in its box (in the environment) */}
        {cfg.key === 'code' ? (
          <g className="sg13-key">
            <circle cx="84" cy="111" r="4" fill="none" stroke="#e3c27a" strokeWidth="2.5" />
            <path d="M84 115 v10 h4 M84 120 h3" stroke="#e3c27a" strokeWidth="2.5" fill="none" />
          </g>
        ) : (
          <g className="sg13-key">
            <rect x="74" y="109" width="18" height="16" rx="2" fill="#1e4d3b" stroke="#c9b67a" strokeWidth="1.5" />
            <circle cx="83" cy="117" r="2" fill="#e3c27a" />
          </g>
        )}
        <Gauge x={146} v={cur ? cur.pressure : 0.12} label={t.gauges[0]} read={cur && cur.pressure >= 1 ? '429 429 429' : cur ? cur.code === 'KEY' || cur.code === 'LOOP' ? '…' : cur.code : '…'} zone />
        <Gauge x={214} v={spend / 10} label={t.gauges[1]} read={eur(spend, lang)} mark={CAP / 10} />
        <Gauge x={282} v={(cur ? cur.served : 0) / RECOVERABLE} label={t.gauges[2]} read={`${cur ? cur.served : 0} / ${RECOVERABLE}`} />
      </svg>
      <p className="sg13-illus">{t.illus} · {cur ? cur.alerts : 0} {t.alerts}</p>

      {!run ? (
        <section className="sg13-reg" aria-label={t.setHelp}>
          <p className="sg13-help">{t.setHelp}</p>
          {GROUPS.map((g) => (
            <div key={g} className="sg13-group" role="radiogroup" aria-label={t.groups[g]}>
              <span className="sg13-group__label">{t.groups[g]}</span>
              <div className="sg13-seg">
                {Object.keys(t.opts[g]).map((o) => (
                  <button
                    key={o}
                    type="button"
                    role="radio"
                    aria-checked={cfg[g] === o}
                    className="sg13-opt"
                    data-testid={`sg13-${g}-${o}`}
                    onClick={() => set(g, o as never)}
                  >
                    {t.opts[g][o]}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <div className="sg13-bar">
            <button type="button" className="mg-btn mg-btn--primary" data-testid="sg13-launch" onClick={launch}>{t.launch}</button>
          </div>
        </section>
      ) : (
        <section className="sg13-night">
          <ol className="sg13-log" aria-live="off">
            {run.steps.slice(0, shown).map((s) => (
              <li key={s.time} className="sg13-ev">
                <span className="sg13-ev__time">{s.time}</span>
                <span className={`sg13-ev__code${s.lines.some((l) => l.bad) ? ' is-bad' : ''}`}>{t.codes[s.code]}</span>
                <span className="sg13-ev__lines">
                  {s.lines.map((l) => <span key={l.id} className={l.bad ? 'is-bad' : 'is-ok'}>{lineText(l)}</span>)}
                </span>
              </li>
            ))}
          </ol>
          {playing && <p className="sg13-playing">{t.playing}</p>}
          {morning && (
            <div className="sg13-report" ref={reportRef} data-testid="sg13-report">
              <p className="sg13-report__title">{t.report}</p>
              <ul>
                {run.checks.map((ok, i) => (
                  <li key={i} className={ok ? 'is-ok' : 'is-bad'}>
                    <span className="sg13-mark" aria-hidden="true">
                      <svg viewBox="0 0 16 16" width="16" height="16">
                        {ok ? <path d="M3 8.5 L6.5 12 L13 4.5" /> : <path d="M4 4 L12 12 M12 4 L4 12" />}
                      </svg>
                    </span>
                    <span>{t.checks[i](run)}</span>
                  </li>
                ))}
              </ul>
              {!solved && (
                <div className="sg13-bar">
                  <button type="button" className="mg-btn mg-btn--primary" data-testid="sg13-back" onClick={back}>{t.back}</button>
                </div>
              )}
            </div>
          )}
        </section>
      )}

      <p className={`sg13-status${status ? ` sg13-status--${status.tone}` : ''}`} role="status" aria-live="polite" data-testid="sg13-status" data-tone={status?.tone ?? ''}>
        {status?.text}
      </p>
    </div>
  );
}
