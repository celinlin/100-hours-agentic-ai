'use client';

import { useEffect, useState } from 'react';
import type { Lang } from '../lib/i18n';
import { useTimer, focusTimer } from '../lib/workbook';

const T = {
  fr: { pause: 'Pause', resume: 'Reprendre', stop: 'Arrêter', done: 'Temps écoulé', close: 'Fermer', label: 'Minuteur' },
  en: { pause: 'Pause', resume: 'Resume', stop: 'Stop', done: 'Time is up', close: 'Close', label: 'Timer' },
};

function fmt(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/** A small, quiet focus timer started from an activity's duration. */
export default function FocusTimer({ lang }: { lang: Lang }) {
  const t = T[lang];
  const timer = useTimer();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!timer || timer.endsAt == null) return;
    const id = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(id);
  }, [timer]);

  if (!timer) return null;
  const running = timer.endsAt != null;
  const remaining = running ? Math.max(0, Math.round((timer.endsAt! - now) / 1000)) : timer.remaining;
  const finished = remaining <= 0;
  const ratio = 1 - remaining / timer.total;

  return (
    <div className={`ftimer${finished ? ' is-finished' : ''}`} role="timer" aria-label={`${t.label} · ${timer.label}`}>
      <svg className="ftimer__ring" viewBox="0 0 36 36" aria-hidden="true">
        <circle cx="18" cy="18" r="15.5" className="ftimer__track" />
        <circle cx="18" cy="18" r="15.5" className="ftimer__fill" pathLength={1} style={{ strokeDasharray: `${ratio} 1` }} />
      </svg>
      <div className="ftimer__text">
        <span className="ftimer__label">{timer.label}</span>
        <span className="ftimer__time" aria-live={finished ? 'assertive' : 'off'}>
          {finished ? t.done : fmt(remaining)}
        </span>
      </div>
      <div className="ftimer__actions">
        {!finished &&
          (running ? (
            <button type="button" onClick={() => focusTimer.pause()}>
              {t.pause}
            </button>
          ) : (
            <button type="button" onClick={() => focusTimer.resume()}>
              {t.resume}
            </button>
          ))}
        <button type="button" onClick={() => focusTimer.stop()} aria-label={finished ? t.close : t.stop}>
          {finished ? t.close : t.stop}
        </button>
      </div>
    </div>
  );
}
