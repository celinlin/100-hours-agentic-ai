'use client';

import './c04.css';
import { useEffect, useRef, useState } from 'react';
import type { SignatureProps } from './list';
import { sfx } from '../sound';

/**
 * Chapter 04 — "Le standard". The learner is the operator: they compose an HTTP call
 * (method, address, token), put it through, read the lamp, then tell the guest the truth.
 * The service is simulated; codes and their meaning are the real ones.
 */

type Method = 'GET' | 'POST';
type PathId = 'ok' | 'typo';
type Code = 200 | 401 | 403 | 404 | 429;
type Say = 'events' | 'empty' | 'lost' | 'scope';
type Tone = 'info' | 'ok' | 'err';
interface Res { code: Code; items: number }

const CODES: Code[] = [200, 401, 403, 404, 429];
const NAMES: Record<Code, string> = { 200: 'OK', 401: 'Unauthorized', 403: 'Forbidden', 404: 'Not Found', 429: 'Too Many Requests' };
const PATHS: Record<PathId, string> = { typo: '/calendar/v3/calendar/primary/event', ok: '/calendar/v3/calendars/primary/events' };
const SAYS: Say[] = ['events', 'empty', 'lost', 'scope'];
const COOL_MS = 4000;

interface Round { day: 'thu' | 'fri' | 'sat'; want: Method; expired: boolean; answer: Say }
const ROUNDS: Round[] = [
  { day: 'thu', want: 'GET', expired: false, answer: 'events' },
  { day: 'fri', want: 'GET', expired: false, answer: 'empty' },
  { day: 'sat', want: 'GET', expired: true, answer: 'lost' },
  { day: 'thu', want: 'POST', expired: false, answer: 'scope' },
];

/** The simulated calendar service. Auth is checked first, then the address, then the scope. */
function respond(method: Method, path: PathId, token: boolean, round: Round): Res {
  if (!token || round.expired) return { code: 401, items: 0 };
  if (path !== 'ok') return { code: 404, items: 0 };
  if (method === 'POST') return { code: 403, items: 0 };
  return { code: 200, items: round.day === 'thu' ? 2 : 0 };
}
function truth(r: Res): Say | null {
  if (r.code === 200) return r.items > 0 ? 'events' : 'empty';
  if (r.code === 401) return 'lost';
  if (r.code === 403) return 'scope';
  return null;
}

const T = {
  fr: {
    call: (n: number, t: number) => `Appel ${n} / ${t}`,
    tickets: [
      { q: '« Qu’ai-je jeudi ? »', note: 'Lire l’agenda' },
      { q: '« Et vendredi ? »', note: 'Lire l’agenda' },
      { q: '« Et samedi ? »', note: 'Lire l’agenda · une semaine plus tard' },
      { q: '« Ajoute “Préparer Brume & Quai” jeudi à 9 h. »', note: 'Créer un événement · nouveau jeton, même scope' },
    ],
    days: { thu: 'jeudi', fri: 'vendredi', sat: 'samedi' },
    board: 'Le standard',
    method: 'Méthode',
    address: 'Adresse',
    token: 'Jeton',
    tokenOn: 'présenté',
    tokenOff: 'rangé',
    scope: 'scope',
    noAuth: '(aucun en-tête Authorization)',
    connect: 'Brancher',
    service: 'Service agenda',
    lamps: 'Voyants',
    sim: 'simulation',
    off: 'éteint',
    lit: 'allumé',
    mean: {
      200: 'Réussi : la réponse est dans le corps.',
      401: 'Le service ne sait pas qui appelle : jeton absent, expiré ou invalide.',
      403: 'Identité reconnue, droit insuffisant : ce jeton ne fait que lire.',
      404: 'Adresse introuvable : vérifie le chemin.',
      429: 'Trop d’appels : attends, puis réessaie.',
    } as Record<Code, string>,
    cooling: 'Le voyant refroidit…',
    cooled: 'Voyant refroidi : change l’appel avant de rebrancher.',
    sayTitle: 'Que dis-tu au client ?',
    say: { events: 'Voici vos rendez-vous', empty: 'Rien de prévu ce jour-là', lost: 'Accès à l’agenda perdu', scope: 'Droit insuffisant : lecture seule' } as Record<Say, string>,
    next: 'Appel suivant',
    start: 'Branche une méthode et une adresse, puis appelle.',
    same: 'Même appel, même réponse. Change quelque chose avant de rappeler.',
    hammer: 'Trois fois le même appel : le service te fait patienter (429).',
    still: 'Encore trop tôt : le délai repart.',
    win: [
      'Juste : 200, deux rendez-vous dans « items ».',
      'Juste : 200 et une liste vide. Un jour libre n’est pas une erreur.',
      'Juste : un 401 se dit. Il ne devient jamais « rien de prévu ».',
      'Juste : jeton reconnu, droit trop étroit. Réessayer n’y changerait rien.',
    ],
    done: 'Standard tenu : quatre appels, quatre réponses lues.',
    fixToken: 'Vrai, mais réparable : le jeton n’était pas présenté. Tourne la clé.',
    fixRead: 'Vrai, mais la demande est une lecture : branche GET.',
    fixWrite: 'Tu as lu, pas créé : cette demande veut un POST.',
    fixPath: 'Vrai, mais l’adresse de la fiche est fausse : corrige-la aussi.',
    ready: 'Fiche prête : branche l’appel.',
    w404: '404 : c’est l’adresse qui est fausse. Rien à transmettre, corrige la fiche.',
    w429: '429 : rien à transmettre. Attends que le voyant refroidisse.',
    wEmptyOn401: 'Le client croit sa journée libre. L’agenda n’a jamais été lu : un 401 n’est pas un jour vide.',
    wEmptyOn403: 'Rien n’a été créé, et tu annonces une journée vide.',
    wEmptyOnEvents: 'Inès Caron attendra seule à 10 h : les rendez-vous étaient dans le corps.',
    wEvents: 'Tu annonces des rendez-vous que la réponse ne contient pas.',
    wAlarm: 'Fausse alerte : 200, l’appel a réussi.',
    wAlarmEmpty: 'Fausse alerte : 200, l’appel a réussi. La liste est juste vide.',
    wLostOn403: 'Non : le jeton est reconnu. C’est le droit qui manque (403).',
    wScopeOn401: 'Non : ici le service ne sait même pas qui appelle (401).',
    team: 'Point d’équipe',
    prep: 'Préparer Brume & Quai',
  },
  en: {
    call: (n: number, t: number) => `Call ${n} / ${t}`,
    tickets: [
      { q: '“What do I have on Thursday?”', note: 'Read the calendar' },
      { q: '“And Friday?”', note: 'Read the calendar' },
      { q: '“And Saturday?”', note: 'Read the calendar · a week later' },
      { q: '“Add ‘Préparer Brume & Quai’ on Thursday at 9.”', note: 'Create an event · new token, same scope' },
    ],
    days: { thu: 'Thursday', fri: 'Friday', sat: 'Saturday' },
    board: 'The switchboard',
    method: 'Method',
    address: 'Address',
    token: 'Token',
    tokenOn: 'presented',
    tokenOff: 'put away',
    scope: 'scope',
    noAuth: '(no Authorization header)',
    connect: 'Connect',
    service: 'Calendar service',
    lamps: 'Lamps',
    sim: 'simulation',
    off: 'off',
    lit: 'lit',
    mean: {
      200: 'Success: the answer is in the body.',
      401: 'The service does not know who is calling: token missing, expired or invalid.',
      403: 'Identity known, permission insufficient: this token can only read.',
      404: 'Address not found: check the path.',
      429: 'Too many calls: wait, then retry.',
    } as Record<Code, string>,
    cooling: 'The lamp is cooling down…',
    cooled: 'Lamp cooled: change the call before connecting again.',
    sayTitle: 'What do you tell the guest?',
    say: { events: 'Here are your meetings', empty: 'Nothing planned that day', lost: 'Access to the calendar is lost', scope: 'Insufficient permission: read-only' } as Record<Say, string>,
    next: 'Next call',
    start: 'Plug a method and an address, then call.',
    same: 'Same call, same response. Change something before calling again.',
    hammer: 'The same call three times: the service makes you wait (429).',
    still: 'Still too early: the delay starts again.',
    win: [
      'Right: 200, two meetings in “items”.',
      'Right: 200 and an empty list. A free day is not an error.',
      'Right: a 401 is stated. It never becomes “nothing planned”.',
      'Right: token recognised, permission too narrow. Retrying would change nothing.',
    ],
    done: 'Switchboard held: four calls, four responses read.',
    fixToken: 'True, but fixable: the token was not presented. Turn the key.',
    fixRead: 'True, but the request is a read: plug GET.',
    fixWrite: 'You read, you did not create: this request needs a POST.',
    fixPath: 'True, but the address on the slip is wrong: fix it too.',
    ready: 'Slip ready: put the call through.',
    w404: '404: the address is wrong. Nothing to pass on, fix the slip.',
    w429: '429: nothing to pass on. Wait for the lamp to cool down.',
    wEmptyOn401: 'The guest believes the day is free. The calendar was never read: a 401 is not an empty day.',
    wEmptyOn403: 'Nothing was created, and you announce an empty day.',
    wEmptyOnEvents: 'Inès Caron will wait alone at 10: the meetings were in the body.',
    wEvents: 'You announce meetings the response does not contain.',
    wAlarm: 'False alarm: 200, the call succeeded.',
    wAlarmEmpty: 'False alarm: 200, the call succeeded. The list is simply empty.',
    wLostOn403: 'No: the token is recognised. The permission is what is missing (403).',
    wScopeOn401: 'No: here the service does not even know who is calling (401).',
    team: 'Team sync',
    prep: 'Préparer Brume & Quai',
  },
};

function body(r: Res, t: (typeof T)['fr']): string {
  switch (r.code) {
    case 200:
      return r.items
        ? `{ "items": [\n  { "summary": "Brume & Quai, Inès Caron",\n    "start": { "dateTime": "…T10:00" } },\n  { "summary": "${t.team}",\n    "start": { "dateTime": "…T14:30" } }\n] }`
        : '{ "items": [] }';
    case 401:
      return '{ "error": { "code": 401,\n  "status": "UNAUTHENTICATED" } }';
    case 403:
      return '{ "error": { "code": 403,\n  "status": "PERMISSION_DENIED",\n  "message": "Request had insufficient authentication scopes." } }';
    case 404:
      return '{ "error": { "code": 404,\n  "message": "Not Found" } }';
    default:
      return `Retry-After: ${COOL_MS / 1000}\n{ "error": { "code": 429,\n  "status": "RESOURCE_EXHAUSTED" } }`;
  }
}

export default function Game({ lang, onSolved, onMistake }: SignatureProps) {
  const t = T[lang];
  const [round, setRound] = useState(0);
  const [method, setMethod] = useState<Method | null>(null);
  const [path, setPath] = useState<PathId | null>(null);
  const [token, setToken] = useState(false);
  const [res, setRes] = useState<Res | null>(null);
  const [calls, setCalls] = useState(0);
  const [cooling, setCooling] = useState(false);
  const [seen, setSeen] = useState<Code[]>([]);
  const [passed, setPassed] = useState(false); // current round answered correctly
  const [solved, setSolved] = useState(false);
  const [msg, setMsg] = useState<{ tone: Tone; text: string }>({ tone: 'info', text: t.start });
  const repeat = useRef({ sig: '', n: 0 });
  const coolTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const doneTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fired = useRef(false);

  useEffect(() => () => {
    if (coolTimer.current) clearTimeout(coolTimer.current);
    if (doneTimer.current) clearTimeout(doneTimer.current);
  }, []);

  const R = ROUNDS[round];
  const locked = passed || solved;

  const change = (fn: () => void) => {
    if (locked) return;
    fn();
    setRes(null);
    sfx('place');
    if (!cooling) setMsg({ tone: 'info', text: '' });
  };

  const startCooling = () => {
    setCooling(true);
    if (coolTimer.current) clearTimeout(coolTimer.current);
    coolTimer.current = setTimeout(() => {
      setCooling(false);
      repeat.current = { sig: '', n: 0 };
      setMsg({ tone: 'info', text: T[lang].cooled });
    }, COOL_MS);
  };

  const connect = () => {
    if (locked || !method || !path) return;
    setCalls((c) => c + 1);
    if (cooling) {
      setRes({ code: 429, items: 0 });
      startCooling();
      setMsg({ tone: 'err', text: t.still });
      sfx('wrong');
      return;
    }
    const r = respond(method, path, token, R);
    const sig = `${round}|${method}|${path}|${token}`;
    if (r.code !== 200 && repeat.current.sig === sig) repeat.current.n += 1;
    else repeat.current = { sig, n: 1 };
    if (r.code !== 200 && repeat.current.n >= 3) {
      setRes({ code: 429, items: 0 });
      setSeen((s) => (s.includes(429) ? s : [...s, 429]));
      startCooling();
      setMsg({ tone: 'err', text: t.hammer });
      sfx('wrong');
      onMistake?.();
      return;
    }
    setRes(r);
    setSeen((s) => (s.includes(r.code) ? s : [...s, r.code]));
    sfx(r.code === 200 ? 'latch' : 'tick');
    setMsg(r.code !== 200 && repeat.current.n === 2 ? { tone: 'info', text: t.same } : { tone: 'info', text: '' });
  };

  const wrongWhy = (r: Res, s: Say): string => {
    if (r.code === 404) return t.w404;
    if (r.code === 429) return t.w429;
    if (s === 'events') return t.wEvents;
    if (s === 'empty') return r.code === 401 ? t.wEmptyOn401 : r.code === 403 ? t.wEmptyOn403 : t.wEmptyOnEvents;
    if (r.code === 200) return r.items ? t.wAlarm : t.wAlarmEmpty;
    return s === 'lost' ? t.wLostOn403 : t.wScopeOn401;
  };

  const say = (s: Say) => {
    if (locked || !res) return;
    if (truth(res) !== s) {
      setMsg({ tone: 'err', text: wrongWhy(res, s) });
      sfx('wrong');
      onMistake?.();
      return;
    }
    const rightCall = method === R.want && path === 'ok' && token;
    if (s !== R.answer || !rightCall) {
      // A truthful reading of a call that was not the one the guest needs.
      const text = res.code === 401 && !token ? t.fixToken : method !== R.want ? (R.want === 'POST' ? t.fixWrite : t.fixRead) : t.fixPath;
      setMsg({ tone: 'info', text });
      sfx('tick');
      return;
    }
    const last = round === ROUNDS.length - 1;
    setPassed(true);
    if (last) {
      setSolved(true);
      setMsg({ tone: 'ok', text: `${t.win[round]} ${t.done}` });
      sfx('solve');
      if (!fired.current) {
        fired.current = true;
        doneTimer.current = setTimeout(onSolved, 700);
      }
    } else {
      setMsg({ tone: 'ok', text: t.win[round] });
      sfx('correct');
    }
  };

  const next = () => {
    setRound((r) => r + 1);
    setPassed(false);
    setRes(null);
    repeat.current = { sig: '', n: 0 };
    setMsg({ tone: 'info', text: '' });
    sfx('select');
  };

  const day = t.days[R.day];
  const line1 = `${method ?? '···'} ${path ? PATHS[path] : '/···'}`;
  const line2 = method === 'POST' ? `{ "summary": "${t.prep}" }` : `timeMin … timeMax : ${day}`;
  const line3 = token ? 'Authorization: Bearer ya29.…' : t.noAuth;
  const hint = !method || !path ? t.start : !res && !cooling ? t.ready : '';
  const shown = msg.text || hint;
  const fam = res ? (res.code === 200 ? 'ok' : res.code === 429 ? 'wait' : 'no') : 'off';

  return (
    <div className="sg04" data-game="c04" data-solved={solved ? 'true' : 'false'} data-round={round + 1}>
      <div className="sg04-ticket" key={round}>
        <span className="sg04-ticket__n">{t.call(round + 1, ROUNDS.length)}</span>
        <p className="sg04-ticket__q">{t.tickets[round].q}</p>
        <p className="sg04-ticket__note">{t.tickets[round].note}</p>
        <span className="sg04-pips" aria-hidden="true">
          {ROUNDS.map((_, i) => (
            <i key={i} className={i < round || (i === round && passed) ? 'is-done' : i === round ? 'is-now' : ''} />
          ))}
        </span>
      </div>

      <div className="sg04-board" aria-label={t.board}>
        <div className="sg04-row" role="group" aria-label={t.method}>
          <span className="sg04-row__label">{t.method}</span>
          <div className="sg04-jacks sg04-jacks--two">
            {(['GET', 'POST'] as Method[]).map((m) => (
              <button key={m} type="button" className={`sg04-jack${method === m ? ' is-in' : ''}`} aria-pressed={method === m} disabled={locked} data-testid={`method-${m}`} onClick={() => change(() => setMethod(m))}>
                <span className="sg04-socket" aria-hidden="true"><i /></span>
                <span className="sg04-jack__txt">{m}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="sg04-row" role="group" aria-label={t.address}>
          <span className="sg04-row__label">{t.address}</span>
          <div className="sg04-jacks">
            {(['typo', 'ok'] as PathId[]).map((p) => (
              <button key={p} type="button" className={`sg04-jack sg04-jack--path${path === p ? ' is-in' : ''}`} aria-pressed={path === p} disabled={locked} data-testid={`path-${p}`} onClick={() => change(() => setPath(p))}>
                <span className="sg04-socket" aria-hidden="true"><i /></span>
                <span className="sg04-jack__txt">{PATHS[p]}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="sg04-row sg04-row--token">
          <span className="sg04-row__label">{t.token}</span>
          <div className="sg04-tokenline">
            <button type="button" role="switch" aria-checked={token} aria-label={`${t.token} : ${token ? t.tokenOn : t.tokenOff}`} className={`sg04-key${token ? ' is-on' : ''}`} disabled={locked} data-testid="token" onClick={() => change(() => setToken(!token))}>
              <span className="sg04-key__slot" aria-hidden="true">
                <svg className="sg04-key__svg" viewBox="0 0 34 16" width="34" height="16">
                  <circle cx="7" cy="8" r="5.5" fill="none" stroke="currentColor" strokeWidth="3" />
                  <path d="M12.5 8H32M26 8v5M31 8v4" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="square" />
                </svg>
              </span>
              <span className="sg04-key__txt">{token ? t.tokenOn : t.tokenOff}</span>
            </button>
            <span className="sg04-plate"><b>{t.scope}</b> calendar.readonly</span>
          </div>
        </div>

        <div className="sg04-req" aria-label="HTTP">
          <code>{line1}</code>
          <code>{line2}</code>
          <code className={token ? '' : 'is-missing'}>{line3}</code>
        </div>

        <div className="sg04-wire">
          <button type="button" className="sg04-connect" onClick={connect} disabled={locked || !method || !path} data-testid="connect">
            {t.connect}
          </button>
          <span className="sg04-line" aria-hidden="true">
            {calls > 0 && <span className="sg04-pulse" key={calls} />}
          </span>
          <span className="sg04-service">
            <svg viewBox="0 0 28 28" width="28" height="28" aria-hidden="true">
              <rect x="3" y="6" width="22" height="19" rx="2" fill="#efe7d8" />
              <rect x="3" y="6" width="22" height="6" rx="2" fill="#c9b67a" />
              <path d="M9 3v6M19 3v6" stroke="#efe7d8" strokeWidth="2.4" strokeLinecap="round" />
              <path d="M8 16h4M16 16h4M8 20.5h4" stroke="#2d2721" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span>{t.service}</span>
          </span>
        </div>

        <ul className={`sg04-lamps${cooling ? ' is-cooling' : ''}`} aria-label={t.lamps}>
          {CODES.map((c) => {
            const on = res?.code === c;
            return (
              <li key={c} className={`sg04-lamp sg04-lamp--${c === 200 ? 'ok' : c === 429 ? 'wait' : 'no'}${on ? ' is-on' : ''}${seen.includes(c) ? ' is-seen' : ''}`} aria-label={`${c} ${NAMES[c]} : ${on ? t.lit : t.off}`}>
                <span className="sg04-bulb" key={on ? calls : 0} aria-hidden="true" />
                <span className="sg04-lamp__code" aria-hidden="true">{c}</span>
              </li>
            );
          })}
        </ul>
        {cooling && (
          <div className="sg04-cool" data-testid="cooling">
            <span className="sg04-cool__bar" key={calls} style={{ animationDuration: `${COOL_MS}ms` }} aria-hidden="true" />
            <span className="sg04-cool__txt">{t.cooling}</span>
          </div>
        )}
      </div>

      <div className="sg04-out" aria-live="polite">
        {res && (
          <div className={`sg04-res sg04-res--${fam}`} key={calls} data-testid="response" data-code={res.code}>
            <p className="sg04-res__head">
              <b>{res.code} {NAMES[res.code]}</b>
              <span>{t.mean[res.code]}</span>
            </p>
            <pre className="sg04-res__body">{body(res, t)}</pre>
            <span className="sg04-res__sim">{t.sim}</span>
          </div>
        )}
      </div>

      {!locked && (
        <div className={`sg04-say${res ? '' : ' is-idle'}`} role="group" aria-label={t.sayTitle}>
          <p className="sg04-say__title">{t.sayTitle}</p>
          <div className="sg04-say__grid">
            {SAYS.map((s) => (
              <button key={s} type="button" className="sg04-say__btn" disabled={!res} data-testid={`say-${s}`} onClick={() => say(s)}>
                {t.say[s]}
              </button>
            ))}
          </div>
        </div>
      )}

      <p className={`sg04-msg sg04-msg--${msg.tone}`} role="status" aria-live="polite" data-testid="feedback" data-tone={msg.tone}>
        {shown && <span key={shown}>{shown}</span>}
      </p>

      {passed && !solved && (
        <button type="button" className="sg04-next" onClick={next} data-testid="next">
          {t.next}
        </button>
      )}
    </div>
  );
}
