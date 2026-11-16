'use client';

import { useEffect, useRef, useState } from 'react';
import { companion, useCompanion, LINES, type Mood } from '../game/companion';
import { sfxEvents } from '../game/sound';
import type { Lang } from '../lib/i18n';

/** Gaspard's face: pillbox hat, a blink, a mouth and brows that follow his mood. */
function Face({ mood }: { mood: Mood }) {
  const mouth =
    mood === 'pleased' ? 'M-8 9 Q0 16 8 9' : mood === 'concerned' ? 'M-7 12 Q0 8 7 12' : mood === 'thinking' ? 'M-6 11 L5 9' : 'M-6 10.5 Q0 13 6 10.5';
  const brow = mood === 'concerned' ? ['M-14 -6 L-5 -4', 'M14 -6 L5 -4'] : mood === 'thinking' ? ['M-14 -5 L-5 -6', 'M5 -8 L14 -6'] : ['M-14 -5 L-5 -6', 'M5 -6 L14 -5'];
  return (
    <svg viewBox="-30 -36 60 66" aria-hidden="true" className={`gsp__face gsp__face--${mood}`}>
      <path d="M-26 30 L-20 20 Q0 12 20 20 L26 30 Z" fill="#1e4d3b" />
      <path d="M-6 18 L0 26 L6 18" fill="#efe7d8" />
      <circle cx="0" cy="2" r="17" fill="#d9b48f" />
      <path d="M-17 -6 Q-18 -14 -12 -16 L-12 -10 Z" fill="#2d2721" />
      <path d="M17 -6 Q18 -14 12 -16 L12 -10 Z" fill="#2d2721" />
      <path d="M-15 -14 L-13 -28 H13 L15 -14 Z" fill="#1e4d3b" />
      <rect x="-15" y="-17.5" width="30" height="3.5" fill="#e3c27a" />
      <g fill="none" stroke="#2d2721" strokeWidth="1.6" strokeLinecap="round">
        <path d={brow[0]} />
        <path d={brow[1]} />
      </g>
      <g className="gsp__eyes" fill="#2d2721">
        <ellipse cx="-7" cy="1" rx="2" ry="2.3" />
        <ellipse cx="7" cy="1" rx="2" ry="2.3" />
      </g>
      <path d={mouth} fill="none" stroke="#2d2721" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Discreet companion. Says one line on arrival, then stays quiet: he reacts to successes and
 * mistakes (a word, two seconds), offers a hint after two mistakes, and gives it in two steps
 * when tapped. Never blocks anything; the bubble never covers the primary action.
 */
export default function Companion({ lang, greeting }: { lang: Lang; greeting?: string }) {
  const t = LINES[lang];
  const { ctx, line } = useCompanion();
  const [level, setLevel] = useState(0);
  const [mood, setMood] = useState<Mood>('calm');
  const mistakes = useRef(0);
  const counter = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // a new context (a new object opened) resets the hint ladder
  useEffect(() => {
    setLevel(0);
    mistakes.current = 0;
  }, [ctx]);

  useEffect(() => {
    if (!greeting) return;
    const id = setTimeout(() => companion.say(greeting, 'calm'), 900);
    return () => clearTimeout(id);
  }, [greeting]);

  useEffect(() => {
    const on = (e: Event) => {
      const name = (e as CustomEvent<string>).detail;
      const pick = (a: string[]) => a[counter.current++ % a.length];
      if (name === 'correct' || name === 'solve') {
        mistakes.current = 0;
        companion.say(pick(t.success), 'pleased');
      } else if (name === 'wrong') {
        mistakes.current += 1;
        if (mistakes.current >= 2 && companion && ctx?.nudge) companion.say(t.offer, 'thinking');
        else companion.say(pick(t.mistake), 'concerned');
      }
    };
    sfxEvents?.addEventListener('sfx', on);
    return () => sfxEvents?.removeEventListener('sfx', on);
  }, [t, ctx]);

  // each line shows briefly, then Gaspard goes back to calm
  useEffect(() => {
    if (!line) return;
    setMood(line.mood);
    if (timer.current) clearTimeout(timer.current);
    const long = line.text.length > 60;
    timer.current = setTimeout(() => {
      companion.hush();
      setMood('calm');
    }, long ? 9000 : 3200);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [line]);

  const tap = () => {
    if (line && level === 0 && line.text === greeting) {
      companion.hush();
      return;
    }
    if (!ctx?.nudge) {
      companion.say(t.nothing, 'calm');
      return;
    }
    if (level === 0 || !ctx.key) {
      setLevel(1);
      companion.say(ctx.nudge, 'thinking');
    } else {
      setLevel(2);
      companion.say(ctx.key, 'pleased');
    }
  };

  return (
    <div className="gsp" data-mood={mood}>
      <button type="button" className="gsp__btn" onClick={tap} aria-label={`${t.name}, ${t.role} : ${lang === 'fr' ? 'demander un indice' : 'ask for a hint'}`}>
        <Face mood={mood} />
        {ctx?.nudge && level < 2 && <span className="gsp__dot" aria-hidden="true" />}
      </button>
      <div className="gsp__say" aria-live="polite">
        {line && (
          <p key={line.id} className="gsp__bubble">
            {level > 0 && line.text !== greeting && (line.text === ctx?.nudge || line.text === ctx?.key) && (
              <span className="gsp__step">{level === 1 ? (lang === 'fr' ? 'Indice' : 'Hint') : lang === 'fr' ? 'L’idée clé' : 'Key idea'}</span>
            )}
            {line.text}
          </p>
        )}
      </div>
    </div>
  );
}
