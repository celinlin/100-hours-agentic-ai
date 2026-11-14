'use client';

import { useEffect, useState } from 'react';
import { setSound, useSound } from '../game/sound';
import type { Lang } from '../lib/i18n';

/** Off by default. Turning it on is the gesture that unlocks audio. */
export default function SoundToggle({ lang }: { lang: Lang }) {
  const on = useSound();
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  const active = hydrated && on;
  const label = lang === 'fr' ? (active ? 'Couper le son' : 'Activer le son') : active ? 'Turn sound off' : 'Turn sound on';
  return (
    <button type="button" className={`sound-toggle${active ? ' is-on' : ''}`} aria-pressed={active} aria-label={label} title={label} onClick={() => setSound(!active)}>
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <path d="M4 9.5h3.2L12 5.5v13l-4.8-4H4z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        {active ? (
          <>
            <path d="M15.5 9a4 4 0 0 1 0 6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M18 6.5a7.5 7.5 0 0 1 0 11" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </>
        ) : (
          <path d="M16 10l4 4m0-4l-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        )}
      </svg>
    </button>
  );
}
