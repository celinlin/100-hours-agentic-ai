'use client';

import { useEffect, useRef, useState } from 'react';
import { setSound, setSoundVolume, testSound, useSoundState } from '../game/sound';
import type { Lang } from '../lib/i18n';

const L = {
  fr: {
    title: 'Effets sonores',
    on: 'Activés',
    off: 'Désactivés',
    enable: 'Activer les effets sonores',
    disable: 'Couper les effets sonores',
    test: 'Écouter un son',
    volume: 'Volume',
    close: 'Fermer',
    open: 'Réglages du son',
    ios: 'Sur iPhone, si tu n’entends rien, vérifie le bouton silencieux sur le côté et le volume du téléphone.',
    blocked: 'Le navigateur a mis le son en attente : touche « Écouter un son ».',
    none: 'Ce navigateur ne permet pas de jouer ces sons.',
    visual: 'Chaque action a aussi un retour visuel : le jeu se joue très bien sans le son.',
  },
  en: {
    title: 'Sound effects',
    on: 'On',
    off: 'Off',
    enable: 'Turn sound effects on',
    disable: 'Turn sound effects off',
    test: 'Play a sound',
    volume: 'Volume',
    close: 'Close',
    open: 'Sound settings',
    ios: 'On iPhone, if you hear nothing, check the silent switch on the side and the phone volume.',
    blocked: 'The browser has put sound on hold: tap “Play a sound”.',
    none: 'This browser cannot play these sounds.',
    visual: 'Every action also has visual feedback: the game plays perfectly well without sound.',
  },
};

export function SoundIcon({ on }: { on: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path d="M4 9.5h3.2L12 5.5v13l-4.8-4H4z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      {on ? (
        <>
          <path d="M15.5 9a4 4 0 0 1 0 6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M18 6.5a7.5 7.5 0 0 1 0 11" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </>
      ) : (
        <path d="M16 10l4 4m0-4l-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      )}
    </svg>
  );
}

/** Sound settings: on/off, volume, a test button, and honest status. */
export function SoundSettings({ lang, compact = false }: { lang: Lang; compact?: boolean }) {
  const t = L[lang];
  const s = useSoundState();
  const [isIOS, setIsIOS] = useState(false);
  useEffect(() => setIsIOS(/iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)), []);
  return (
    <div className={`snd${compact ? ' snd--compact' : ''}`}>
      <button type="button" className={`snd__switch${s.on ? ' is-on' : ''}`} role="switch" aria-checked={s.on} onClick={() => setSound(!s.on)}>
        <span className="snd__knob" aria-hidden="true" />
        <span>{s.on ? t.disable : t.enable}</span>
      </button>
      {s.on && (
        <>
          <div className="snd__row">
            <button type="button" className="snd__test" onClick={testSound}>
              <SoundIcon on />
              {t.test}
            </button>
            <label className="snd__vol">
              <span>{t.volume}</span>
              <input type="range" min={0.1} max={1} step={0.05} value={s.volume} onChange={(e) => setSoundVolume(Number(e.target.value))} onPointerUp={testSound} onKeyUp={testSound} />
            </label>
          </div>
          {s.error === 'no-webaudio' && <p className="snd__note snd__note--warn">{t.none}</p>}
          {s.state === 'suspended' && <p className="snd__note snd__note--warn">{t.blocked}</p>}
          {isIOS && <p className="snd__note">{t.ios}</p>}
        </>
      )}
      {!compact && <p className="snd__note">{t.visual}</p>}
    </div>
  );
}

export default function SoundToggle({ lang }: { lang: Lang }) {
  const t = L[lang];
  const s = useSoundState();
  const [open, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => setHydrated(true), []);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);
  const active = hydrated && s.on;
  return (
    <div className="music" ref={ref}>
      <button type="button" className={`sound-toggle${active ? ' is-on' : ''}`} aria-expanded={open} aria-label={`${t.open} · ${active ? t.on : t.off}`} title={t.open} onClick={() => setOpen((o) => !o)}>
        <SoundIcon on={active} />
      </button>
      {open && (
        <div className="music__pop" role="dialog" aria-label={t.title}>
          <div className="chrono__pop-head">
            <p className="chrono__name">{t.title}</p>
            <button type="button" className="chrono__x" onClick={() => setOpen(false)}>
              {t.close}
            </button>
          </div>
          <SoundSettings lang={lang} />
        </div>
      )}
    </div>
  );
}
