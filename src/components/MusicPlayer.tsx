'use client';

import { useEffect, useRef, useState } from 'react';
import { music, useMusic, type Mood } from '../game/music';
import type { Lang } from '../lib/i18n';

const L = {
  fr: {
    title: 'Musique de concentration',
    play: 'Lancer la musique',
    pause: 'Mettre en pause',
    volume: 'Volume',
    note: 'Composée en direct dans ton navigateur : lente, sans paroles ni percussions. Aucun fichier audio.',
    open: 'Musique de concentration',
    close: 'Fermer',
    moods: { salon: ['Salon', 'Nappes chaudes et piano épars'], pluie: ['Pluie', 'Nappes douces sous la pluie'], nuit: ['Nuit', 'Bourdon grave, notes lointaines'] } as Record<Mood, [string, string]>,
  },
  en: {
    title: 'Focus music',
    play: 'Play music',
    pause: 'Pause',
    volume: 'Volume',
    note: 'Composed live in your browser: slow, no lyrics, no percussion. No audio file.',
    open: 'Focus music',
    close: 'Close',
    moods: { salon: ['Lounge', 'Warm pads and sparse piano'], pluie: ['Rain', 'Soft pads under the rain'], nuit: ['Night', 'Low drone, distant notes'] } as Record<Mood, [string, string]>,
  },
};

export default function MusicPlayer({ lang }: { lang: Lang }) {
  const t = L[lang];
  const m = useMusic();
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
  const playing = hydrated && m.playing;

  return (
    <div className={`music${open ? ' is-open' : ''}`} ref={ref}>
      <button type="button" className={`music__btn${playing ? ' is-playing' : ''}`} aria-expanded={open} aria-label={t.open} title={t.open} onClick={() => setOpen((o) => !o)}>
        <span className="music__bars" aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
        </span>
      </button>
      {open && (
        <div className="music__pop" role="dialog" aria-label={t.title}>
          <div className="chrono__pop-head">
            <p className="chrono__name">{t.title}</p>
            <button type="button" className="chrono__x" onClick={() => setOpen(false)}>
              {t.close}
            </button>
          </div>
          <button type="button" className="music__play" onClick={() => (playing ? music.pause() : music.play())}>
            <span className={`music__play-icon${playing ? ' is-pause' : ''}`} aria-hidden="true" />
            {playing ? t.pause : t.play}
          </button>
          <div className="music__moods" role="radiogroup" aria-label={t.title}>
            {(Object.keys(t.moods) as Mood[]).map((k) => (
              <button
                key={k}
                type="button"
                role="radio"
                aria-checked={m.mood === k}
                className={`music__mood${m.mood === k ? ' is-on' : ''}`}
                onClick={() => {
                  music.setMood(k);
                  if (!playing) music.play();
                }}
              >
                <span className="music__mood-name">{t.moods[k][0]}</span>
                <span className="music__mood-desc">{t.moods[k][1]}</span>
              </button>
            ))}
          </div>
          <label className="music__vol">
            <span>{t.volume}</span>
            <input type="range" min={0} max={1} step={0.05} value={m.volume} onChange={(e) => music.setVolume(Number(e.target.value))} />
          </label>
          <p className="chrono__note">{t.note}</p>
        </div>
      )}
    </div>
  );
}
