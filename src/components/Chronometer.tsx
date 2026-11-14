'use client';

import { useEffect, useRef, useState } from 'react';
import { useChrono, chrono, fmtClock, fmtTotal, GOAL_MS } from '../game/chrono';
import { sfx } from '../game/sound';
import type { Lang } from '../lib/i18n';

const L = {
  fr: {
    name: 'Le Régulateur',
    session: 'Session',
    total: 'Temps total',
    goal: '100 h',
    start: 'Démarrer une session',
    pause: 'Pause',
    resume: 'Reprendre',
    stop: 'Terminer la session',
    idle: 'Mise en pause après 10 minutes sans activité. Ces minutes n’ont pas été comptées.',
    hidden: 'En pause pendant que l’onglet était caché.',
    restored: 'Session retrouvée en pause après la fermeture de la page.',
    note: 'Seul le temps actif est compté. Les chapitres se débloquent par les défis, pas par le temps.',
    open: 'Ouvrir le chronomètre',
    close: 'Fermer',
    running: 'en cours',
    paused: 'en pause',
    none: 'aucune session',
    of: 'sur',
  },
  en: {
    name: 'The Regulator',
    session: 'Session',
    total: 'Total time',
    goal: '100h',
    start: 'Start a session',
    pause: 'Pause',
    resume: 'Resume',
    stop: 'End session',
    idle: 'Paused after 10 minutes without activity. Those minutes were not counted.',
    hidden: 'Paused while the tab was hidden.',
    restored: 'Session found paused after the page was closed.',
    note: 'Only active time is counted. Chapters unlock through challenges, not time.',
    open: 'Open the chronometer',
    close: 'Close',
    running: 'running',
    paused: 'paused',
    none: 'no session',
    of: 'of',
  },
};

/** Digits that roll softly when they change. */
function Rolling({ value, className }: { value: string; className?: string }) {
  return (
    <span className={`roll ${className ?? ''}`} aria-hidden="true">
      {value.split('').map((ch, i) => (
        <span key={`${i}-${ch}`} className={/\d/.test(ch) ? 'roll__d' : 'roll__s'}>
          {ch}
        </span>
      ))}
    </span>
  );
}

/** The dial: 100 hour ticks, every tenth longer; the brass arc follows the cumulative total. */
export function Dial({ ratio, sessionRatio, size = 40, detailed = false }: { ratio: number; sessionRatio: number; size?: number; detailed?: boolean }) {
  const r = 46;
  const c = 2 * Math.PI * r;
  const ticks = detailed ? 100 : 20;
  return (
    <svg className="dial2" width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
      <circle cx="50" cy="50" r="49" className="dial2__case" />
      <circle cx="50" cy="50" r={r} className="dial2__track" />
      <circle
        cx="50"
        cy="50"
        r={r}
        className="dial2__fill"
        strokeDasharray={`${Math.max(0.0001, Math.min(1, ratio)) * c} ${c}`}
        transform="rotate(-90 50 50)"
      />
      {Array.from({ length: ticks }, (_, i) => {
        const a = (i / ticks) * 2 * Math.PI - Math.PI / 2;
        const major = detailed ? i % 10 === 0 : i % 5 === 0;
        const r1 = major ? 33 : 37;
        return (
          <line
            key={i}
            x1={50 + Math.cos(a) * r1}
            y1={50 + Math.sin(a) * r1}
            x2={50 + Math.cos(a) * 40}
            y2={50 + Math.sin(a) * 40}
            className={major ? 'dial2__tick dial2__tick--major' : 'dial2__tick'}
          />
        );
      })}
      {detailed &&
        [0, 25, 50, 75].map((h) => {
          const a = (h / 100) * 2 * Math.PI - Math.PI / 2;
          return (
            <text key={h} x={50 + Math.cos(a) * 25} y={50 + Math.sin(a) * 25 + 3} textAnchor="middle" className="dial2__num">
              {h === 0 ? '100' : h}
            </text>
          );
        })}
      {/* the session hand: one turn per hour */}
      <line
        x1="50"
        y1="50"
        x2={50 + Math.cos(sessionRatio * 2 * Math.PI - Math.PI / 2) * 30}
        y2={50 + Math.sin(sessionRatio * 2 * Math.PI - Math.PI / 2) * 30}
        className="dial2__hand"
      />
      <circle cx="50" cy="50" r="3.2" className="dial2__hub" />
    </svg>
  );
}

export default function Chronometer({ lang, tone = 'night', expanded = false }: { lang: Lang; tone?: 'night' | 'paper'; expanded?: boolean }) {
  const t = L[lang];
  const s = useChrono();
  const [open, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => setHydrated(true), []);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const ses = hydrated ? s.session : null;
  const total = hydrated ? s.totalMs : 0;
  const running = !!ses?.running;
  const sesMs = ses?.ms ?? 0;
  const ratio = total / GOAL_MS;
  const sesRatio = (sesMs % 3600000) / 3600000;
  const stateLabel = !ses ? t.none : running ? t.running : t.paused;

  const controls = (
    <div className="chrono__controls">
      {!ses && (
        <button type="button" className="chrono__btn chrono__btn--primary" onClick={() => (sfx('latch'), chrono.start())}>
          {t.start}
        </button>
      )}
      {ses && running && (
        <button type="button" className="chrono__btn chrono__btn--primary" onClick={() => (sfx('tick'), chrono.pause())}>
          {t.pause}
        </button>
      )}
      {ses && !running && (
        <button type="button" className="chrono__btn chrono__btn--primary" onClick={() => (sfx('latch'), chrono.start())}>
          {t.resume}
        </button>
      )}
      {ses && (
        <button type="button" className="chrono__btn" onClick={() => (sfx('close'), chrono.stop())}>
          {t.stop}
        </button>
      )}
    </div>
  );

  const reasonNote = ses && !running && ses.reason && ses.reason !== 'user' ? <p className="chrono__reason">{t[ses.reason]}</p> : null;

  const detail = (
    <div className="chrono__detail">
      <div className="chrono__face">
        <Dial ratio={ratio} sessionRatio={sesRatio} size={150} detailed />
      </div>
      <div className="chrono__readouts">
        <p className="chrono__label">
          {t.session} · <span className={running ? 'is-running' : ''}>{stateLabel}</span>
        </p>
        <p className="chrono__clock">
          <Rolling value={fmtClock(sesMs)} />
          <span className="sr-only">{fmtClock(sesMs)}</span>
        </p>
        <p className="chrono__label">{t.total}</p>
        <p className="chrono__total">
          <strong>{fmtTotal(total, lang)}</strong> <span>/ {t.goal}</span>
        </p>
        <div className="chrono__bar" aria-hidden="true">
          <span style={{ transform: `scaleX(${Math.min(1, ratio)})` }} />
        </div>
      </div>
      {controls}
      {reasonNote}
      <p className="chrono__note">{t.note}</p>
    </div>
  );

  if (expanded) return <section className={`chrono chrono--expanded chrono--${tone}`} aria-label={t.name}>{detail}</section>;

  return (
    <div className={`chrono chrono--${tone}${open ? ' is-open' : ''}`} ref={ref}>
      <button
        type="button"
        className={`chrono__chip${running ? ' is-running' : ''}`}
        aria-expanded={open}
        aria-label={`${t.open}. ${t.session} ${fmtClock(sesMs)}, ${stateLabel}. ${t.total} ${fmtTotal(total, lang)} ${t.of} ${t.goal}.`}
        onClick={() => setOpen((o) => !o)}
      >
        <Dial ratio={ratio} sessionRatio={sesRatio} size={30} />
        <span className="chrono__chip-text">
          <Rolling value={fmtClock(sesMs)} className="chrono__chip-clock" />
          <span className="chrono__chip-total">{fmtTotal(total, lang)} / {t.goal}</span>
        </span>
      </button>
      {open && (
        <div className="chrono__pop" role="dialog" aria-label={t.name}>
          <div className="chrono__pop-head">
            <p className="chrono__name">{t.name}</p>
            <button type="button" className="chrono__x" onClick={() => setOpen(false)}>
              {t.close}
            </button>
          </div>
          {detail}
        </div>
      )}
    </div>
  );
}
