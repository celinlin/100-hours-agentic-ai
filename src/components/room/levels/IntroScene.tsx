'use client';

import { useState } from 'react';
import type { IntroScene as Intro } from '../../../game/types';
import { sfx } from '../../../game/sound';
import type { Lang } from '../../../lib/i18n';
import { shuffle } from '../../../game/mechanics/common';

const T = {
  fr: {
    kicker: 'Le comptoir du concierge',
    guess: 'Répondre sans rien consulter',
    pick: 'Ou consulter un outil :',
    invented: 'Invention plausible',
    why: 'Le modèle a produit la suite la plus probable. Il n’a rien vérifié : il ne connaît pas les réservations de l’hôtel.',
    calling: 'Appel d’outil',
    result: 'Résultat',
    model: 'Le modèle',
    call: 'L’appel d’outil',
    res: 'Le résultat',
    enter: 'Entrer dans la pièce',
    again: 'Réessayer',
  },
  en: {
    kicker: 'The concierge desk',
    guess: 'Answer without checking anything',
    pick: 'Or consult a tool:',
    invented: 'Plausible invention',
    why: 'The model produced the most likely continuation. It checked nothing: it does not know the hotel’s bookings.',
    calling: 'Tool call',
    result: 'Result',
    model: 'The model',
    call: 'The tool call',
    res: 'The result',
    enter: 'Enter the room',
    again: 'Try again',
  },
};

type Phase = 'idle' | 'guessed' | 'wrong' | 'calling' | 'returning' | 'done';

/** The concierge figure: an Art Deco silhouette whose expression follows the scene. */
function Concierge({ mood }: { mood: 'neutral' | 'unsure' | 'happy' }) {
  return (
    <g className={`cc cc--${mood}`}>
      <path d="M-46 120 L-34 40 Q0 22 34 40 L46 120 Z" fill="#1e4d3b" />
      <path d="M-14 40 L0 70 L14 40" fill="#efe7d8" />
      <path d="M-8 52 L0 58 L8 52 L8 62 L0 58 L-8 62 Z" fill="#e3c27a" />
      {[78, 92, 106].map((y) => (
        <circle key={y} cx="0" cy={y} r="2.5" fill="#e3c27a" />
      ))}
      <circle cx="0" cy="8" r="24" fill="#d9b48f" />
      <path d="M-26 -2 Q0 -26 26 -2 L26 -8 Q0 -32 -26 -8 Z" fill="#1e4d3b" />
      <rect x="-24" y="-6" width="48" height="5" fill="#e3c27a" />
      <circle cx="-8" cy="8" r="2.4" fill="#2d2721" />
      <circle cx="8" cy="8" r="2.4" fill="#2d2721" />
      <path className="cc__mouth" d={mood === 'happy' ? 'M-8 18 Q0 25 8 18' : mood === 'unsure' ? 'M-8 21 Q0 17 8 21' : 'M-7 19 L7 19'} fill="none" stroke="#2d2721" strokeWidth="2" strokeLinecap="round" />
    </g>
  );
}

function Guest({ mood }: { mood: 'neutral' | 'doubt' | 'happy' }) {
  return (
    <g className="gg">
      <path d="M-40 130 L-30 46 Q0 30 30 46 L40 130 Z" fill="#7c2f2a" />
      <circle cx="0" cy="16" r="22" fill="#c99b78" />
      <path d="M-24 10 Q-20 -14 0 -12 Q22 -12 24 10 Q14 -2 0 -2 Q-14 -2 -24 10 Z" fill="#2d2721" />
      <circle cx="-7" cy="16" r="2.2" fill="#2d2721" />
      <circle cx="7" cy="16" r="2.2" fill="#2d2721" />
      <path d={mood === 'happy' ? 'M-7 26 Q0 32 7 26' : mood === 'doubt' ? 'M-7 28 Q0 24 7 28' : 'M-6 27 L6 27'} fill="none" stroke="#2d2721" strokeWidth="2" strokeLinecap="round" />
      {mood === 'doubt' && (
        <text x="30" y="-6" fontSize="26" fontFamily="var(--serif)" fill="#e3c27a">
          ?
        </text>
      )}
    </g>
  );
}

export default function IntroSceneView({ lang, intro, onDone }: { lang: Lang; intro: Intro; onDone: () => void }) {
  const t = T[lang];
  const [phase, setPhase] = useState<Phase>('idle');
  const [tool, setTool] = useState<string | null>(null);
  const chosen = intro.tools.find((x) => x.id === tool);

  const consult = (id: string) => {
    setTool(id);
    if (id !== intro.correct) {
      sfx('wrong');
      setPhase('wrong');
      return;
    }
    sfx('place');
    setPhase('calling');
    setTimeout(() => (sfx('tick'), setPhase('returning')), 900);
    setTimeout(() => (sfx('solve'), setPhase('done')), 1800);
  };

  const conciergeSays =
    phase === 'guessed' ? intro.guess[lang] : phase === 'done' ? intro.answer[lang] : phase === 'wrong' && chosen ? chosen.result[lang] : null;

  return (
    <div className={`intro intro--${phase}`}>
      <p className="intro__kicker">{t.kicker}</p>
      <div className="intro__scene">
        <svg viewBox="0 0 800 360" className="intro__svg" aria-hidden="true">
          <defs>
            <radialGradient id="in-lamp" cx="0.5" cy="0.4" r="0.6">
              <stop offset="0" stopColor="#fff3c4" stopOpacity="0.5" />
              <stop offset="1" stopColor="#fff3c4" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="800" height="360" fill="#203a31" />
          <g opacity="0.25" stroke="#14271f" strokeWidth="1.2" fill="none">
            {Array.from({ length: 20 }, (_, i) => (
              <path key={i} d={`M${i * 44 - 20} 250 L${i * 44 + 2} 236 L${i * 44 + 24} 250`} />
            ))}
          </g>
          {/* key rack behind the desk */}
          <rect x="60" y="40" width="200" height="120" fill="#2d2721" />
          {Array.from({ length: 12 }, (_, i) => (
            <g key={i}>
              <rect x={74 + (i % 6) * 30} y={52 + Math.floor(i / 6) * 52} width="22" height="40" fill="#3d3329" />
              <circle cx={85 + (i % 6) * 30} cy={64 + Math.floor(i / 6) * 52} r="3" fill="#c9b67a" />
            </g>
          ))}
          <ellipse cx="300" cy="120" rx="240" ry="160" fill="url(#in-lamp)" />
          <rect y="250" width="800" height="110" fill="#5e3f2a" />
          {/* concierge behind the desk */}
          <g transform="translate(300 128)">
            <Concierge mood={phase === 'done' ? 'happy' : phase === 'guessed' || phase === 'wrong' ? 'unsure' : 'neutral'} />
          </g>
          <rect x="150" y="230" width="320" height="100" fill="#2d2721" />
          <rect x="140" y="222" width="340" height="14" fill="#c9b67a" />
          {[0, 1, 2].map((k) => (
            <path key={k} d={`M${190 + k * 100} 250 l20 30 l-20 30 l-20 -30 z`} fill="none" stroke="#9c8559" strokeWidth="2" />
          ))}
          {/* the bell */}
          <path d="M420 222 a16 14 0 0 1 32 0 z" fill="#e3c27a" />
          <rect x="434" y="202" width="4" height="6" fill="#e3c27a" />
          {/* the guest */}
          <g transform="translate(620 120)">
            <Guest mood={phase === 'done' ? 'happy' : phase === 'guessed' ? 'doubt' : 'neutral'} />
          </g>
          {/* the call travelling to the ledger and back */}
          {(phase === 'calling' || phase === 'returning') && (
            <g className={`intro__envelope intro__envelope--${phase}`}>
              <rect x="-22" y="-14" width="44" height="28" rx="3" fill="#f7f2e6" stroke="#9c8559" />
              <path d="M-22 -14 L0 4 L22 -14" fill="none" stroke="#9c8559" />
            </g>
          )}
        </svg>
        <div className="intro__bubble intro__bubble--guest">
          <span className="intro__who">{intro.guest}</span>« {intro.request[lang]} »
        </div>
        {conciergeSays && (
          <div className={`intro__bubble intro__bubble--concierge${phase === 'guessed' ? ' is-invented' : ''}`} key={phase + (tool ?? '')}>
            {phase === 'guessed' && <span className="intro__tag">{t.invented}</span>}
            {phase === 'wrong' && <span className="intro__tag">{t.result}</span>}« {conciergeSays} »
          </div>
        )}
        {(phase === 'calling' || phase === 'returning') && (
          <div className="intro__call" aria-live="polite">
            <span className="intro__tag">{phase === 'calling' ? t.calling : t.result}</span>
            <code>{phase === 'calling' ? chosen?.label[lang] : chosen?.result[lang]}</code>
          </div>
        )}
      </div>

      {phase !== 'done' ? (
        <div className="intro__actions">
          {(phase === 'guessed' || phase === 'wrong') && (
            <p className="intro__feedback" role="status">
              {phase === 'guessed' ? t.why : intro.wrongTool[lang]}
            </p>
          )}
          <button type="button" className="intro__guess" onClick={() => (sfx('tick'), setPhase('guessed'))} disabled={phase === 'calling' || phase === 'returning'}>
            {t.guess}
          </button>
          <p className="intro__pick">{t.pick}</p>
          <div className="intro__tools">
            {shuffle(intro.tools, `intro:${intro.guest}`).map((x) => (
              <button key={x.id} type="button" className={`intro__tool${tool === x.id ? ' is-picked' : ''}`} onClick={() => consult(x.id)} disabled={phase === 'calling' || phase === 'returning'}>
                <span className="intro__tool-icon" aria-hidden="true" />
                <code>{x.label[lang]}</code>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="intro__lesson">
          <ol>
            <li>
              <b>{t.model}</b> {intro.lesson.model[lang]}
            </li>
            <li>
              <b>{t.call}</b> {intro.lesson.call[lang]}
            </li>
            <li>
              <b>{t.res}</b> {intro.lesson.result[lang]}
            </li>
          </ol>
          <button type="button" className="hx-cta" onClick={onDone} autoFocus>
            {t.enter}
          </button>
        </div>
      )}
    </div>
  );
}
