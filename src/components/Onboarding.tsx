'use client';

import { useEffect, useRef, useState } from 'react';
import type { Lang } from '../lib/i18n';
import { sfx } from '../game/sound';
import { SoundSettings } from './SoundToggle';

const KEY = 'hotel100.onboarded.v1';
const EVT = 'hotel100:onboarding';

/** Re-open the tutorial from anywhere (the "?" button). */
export function openOnboarding() {
  window.dispatchEvent(new Event(EVT));
}

export function isOnboarded() {
  try {
    return window.localStorage.getItem(KEY) === '1';
  } catch {
    return true;
  }
}

const L = {
  fr: {
    label: 'Bienvenue',
    skip: 'Passer',
    close: 'Fermer',
    next: 'Suivant',
    back: 'Retour',
    start: 'Commencer l’aventure',
    step: (i: number) => `Écran ${i} sur 3`,
    slides: [
      { title: 'Bienvenue à l’hôtel', text: '14 chambres. 100 heures. Une aventure pour apprendre l’IA.' },
      { title: 'Apprends en jouant', text: 'Explore, expérimente et résous des missions pour progresser.' },
      { title: 'Choisis ta chambre', text: 'Toutes les fenêtres sont ouvertes. Réussis le défi d’une chambre pour illuminer sa fenêtre.' },
    ],
    sound: 'Veux-tu les effets sonores ?',
  },
  en: {
    label: 'Welcome',
    skip: 'Skip',
    close: 'Close',
    next: 'Next',
    back: 'Back',
    start: 'Start the adventure',
    step: (i: number) => `Screen ${i} of 3`,
    slides: [
      { title: 'Welcome to the hotel', text: '14 rooms. 100 hours. An adventure to learn AI.' },
      { title: 'Learn by playing', text: 'Explore, experiment and solve missions to progress.' },
      { title: 'Pick your room', text: 'Every window is open. Pass a room’s challenge to light up its window.' },
    ],
    sound: 'Would you like sound effects?',
  },
};

/** Screen 1 — the hotel, its windows lighting up one after another. */
function ArtHotel() {
  const rows = [3, 3, 3, 3, 2];
  let n = 0;
  return (
    <svg viewBox="0 0 320 220" className="ob-art" aria-hidden="true">
      <rect width="320" height="220" fill="#102022" />
      {[30, 70, 250, 285].map((x, i) => (
        <rect key={x} x={x} y={90 + (i % 2) * 30} width="34" height="130" fill="#1c2d2a" />
      ))}
      <path d="M160 14 l4 22 h-8 z" fill="#d8cba9" />
      {rows.map((count, r) => {
        const w = 200 - r * 26;
        const y = 178 - (r + 1) * 30;
        return (
          <g key={r}>
            <rect x={160 - w / 2} y={y} width={w} height="30" fill="#e3d9c6" />
            <rect x={160 - w / 2 - 3} y={y} width={w + 6} height="4" fill="#f3ecdf" />
            {Array.from({ length: count }, (_, k) => {
              const i = n++;
              const x = 160 - w / 2 + (w / count) * (k + 0.5) - 9;
              return (
                <g key={k}>
                  <rect x={x} y={y + 8} width="18" height="18" fill="#24372f" />
                  <rect className="ob-win" style={{ animationDelay: `${0.25 + i * 0.12}s` }} x={x} y={y + 8} width="18" height="18" fill="#efc77a" />
                </g>
              );
            })}
          </g>
        );
      })}
      <rect x="84" y="36" width="152" height="0" />
      <rect x="120" y="28" width="80" height="20" fill="#e3d9c6" />
      <rect x="50" y="178" width="220" height="30" fill="#262a29" />
      <rect x="140" y="184" width="40" height="24" fill="#efc77a" />
      <rect x="0" y="208" width="320" height="12" fill="#76736d" />
    </svg>
  );
}

/** Screen 2 — a window opens; inside, an object is tapped and reacts. */
function ArtPlay() {
  return (
    <svg viewBox="0 0 320 220" className="ob-art" aria-hidden="true">
      <rect width="320" height="220" fill="#e3d9c6" />
      <rect x="70" y="26" width="180" height="170" fill="#2d2721" />
      <rect x="80" y="36" width="160" height="150" fill="#2f4a3f" />
      <rect x="80" y="136" width="160" height="50" fill="#7a5536" />
      {/* the object: a little machine with a dial */}
      <g className="ob-machine">
        <rect x="128" y="96" width="64" height="52" rx="8" fill="#1e4d3b" />
        <circle cx="160" cy="118" r="14" fill="#f7f2e6" />
        <line className="ob-needle" x1="160" y1="118" x2="160" y2="107" stroke="#2d2721" strokeWidth="2.5" strokeLinecap="round" />
        <rect x="140" y="138" width="40" height="4" rx="2" fill="#c9b67a" />
      </g>
      <g className="ob-spark">
        <circle cx="160" cy="80" r="5" fill="#e3c27a" />
        <circle cx="140" cy="88" r="3" fill="#e3c27a" />
        <circle cx="180" cy="88" r="3" fill="#e3c27a" />
      </g>
      {/* shutters */}
      <rect className="ob-shutter ob-shutter--l" x="80" y="36" width="80" height="150" fill="#24453a" />
      <rect className="ob-shutter ob-shutter--r" x="160" y="36" width="80" height="150" fill="#24453a" />
      {/* the finger */}
      <g className="ob-finger">
        <circle cx="0" cy="0" r="11" fill="none" stroke="#fff" strokeWidth="2.5" />
        <circle cx="0" cy="0" r="4" fill="#fff" />
      </g>
      <rect x="60" y="192" width="200" height="8" fill="#f1eadc" />
    </svg>
  );
}

/** Screen 3 — a challenge is passed, a key appears, the next window unlocks. */
function ArtUnlock() {
  return (
    <svg viewBox="0 0 320 220" className="ob-art" aria-hidden="true">
      <rect width="320" height="220" fill="#102022" />
      <rect x="20" y="50" width="280" height="130" fill="#e3d9c6" />
      <rect x="14" y="50" width="292" height="8" fill="#f3ecdf" />
      {[60, 200].map((x, i) => (
        <g key={x}>
          <rect x={x - 6} y="72" width="72" height="92" fill="#2d2721" />
          <rect x={x} y="78" width="60" height="80" fill="#24372f" />
          <rect className={i === 0 ? 'ob-lit ob-lit--done' : 'ob-lit ob-lit--next'} x={x} y="78" width="60" height="80" fill="#efc77a" />
          {i === 1 && (
            <>
              <rect className="ob-shutter ob-shutter--l ob-shutter--late" x={x} y="78" width="30" height="80" fill="#24453a" />
              <rect className="ob-shutter ob-shutter--r ob-shutter--late" x={x + 30} y="78" width="30" height="80" fill="#24453a" />
            </>
          )}
          <rect x={x + 16} y="162" width="28" height="12" fill={i === 0 ? '#e3c27a' : '#12302a'} />
          <text x={x + 30} y="171.5" textAnchor="middle" fontSize="9" fontFamily="var(--serif)" fill={i === 0 ? '#1e4d3b' : '#e3c27a'}>
            {i === 0 ? '01' : '02'}
          </text>
        </g>
      ))}
      <g className="ob-key">
        <circle cx="146" cy="118" r="9" fill="none" stroke="#e3c27a" strokeWidth="4" />
        <rect x="154" y="116" width="26" height="4" fill="#e3c27a" />
        <rect x="172" y="120" width="3" height="7" fill="#e3c27a" />
        <rect x="177" y="120" width="3" height="5" fill="#e3c27a" />
      </g>
      <rect x="0" y="180" width="320" height="40" fill="#1d2320" />
    </svg>
  );
}

export default function Onboarding({ lang, auto }: { lang: Lang; auto: boolean }) {
  const t = L[lang];
  const ref = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const [i, setI] = useState(0);

  useEffect(() => {
    if (auto && !isOnboarded()) setOpen(true);
    const on = () => {
      setI(0);
      setOpen(true);
    };
    window.addEventListener(EVT, on);
    return () => window.removeEventListener(EVT, on);
  }, [auto]);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  const finish = () => {
    try {
      window.localStorage.setItem(KEY, '1');
    } catch {
      /* shown again next time */
    }
    setOpen(false);
    window.dispatchEvent(new Event('hotel100:onboarded'));
  };

  const go = (n: number) => {
    sfx('tick');
    setI(n);
  };

  const s = t.slides[i];
  return (
    <dialog
      ref={ref}
      className="ob"
      aria-label={t.label}
      onClose={finish}
      onClick={(e) => {
        if (e.target === ref.current) finish();
      }}
    >
      {open && (
        <div className="ob__card">
          <div className="ob__top">
            <span className="ob__count" aria-live="polite">
              {t.step(i + 1)}
            </span>
            <button type="button" className="ob__skip" onClick={finish}>
              {i < 2 ? t.skip : t.close}
            </button>
          </div>
          <div className="ob__art" key={i}>
            {i === 0 && <ArtHotel />}
            {i === 1 && <ArtPlay />}
            {i === 2 && <ArtUnlock />}
          </div>
          <div className="ob__text" key={`t${i}`}>
            <h2 className="ob__title">{s.title}</h2>
            <p className="ob__p">{s.text}</p>
            {i === 2 && (
              <div className="ob__sound">
                <p className="ob__sound-q">{t.sound}</p>
                <SoundSettings lang={lang} compact />
              </div>
            )}
          </div>
          <div className="ob__dots" aria-hidden="true">
            {[0, 1, 2].map((k) => (
              <span key={k} className={k === i ? 'is-on' : ''} />
            ))}
          </div>
          <div className="ob__nav">
            {i > 0 ? (
              <button type="button" className="ob__back" onClick={() => go(i - 1)}>
                {t.back}
              </button>
            ) : (
              <span />
            )}
            {i < 2 ? (
              <button type="button" className="hx-cta" onClick={() => go(i + 1)} autoFocus>
                {t.next}
              </button>
            ) : (
              <button type="button" className="hx-cta" onClick={finish}>
                {t.start}
              </button>
            )}
          </div>
        </div>
      )}
    </dialog>
  );
}
