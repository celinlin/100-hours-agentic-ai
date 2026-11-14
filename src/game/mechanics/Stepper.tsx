'use client';

import { useState } from 'react';
import type { StepperMechanic } from '../types';
import { sfx } from '../sound';
import { cx, type MechProps } from './common';
import Choice from './Choice';

const T = {
  fr: { next: 'Étape suivante', replay: 'Revoir', step: (i: number, n: number) => `${i} / ${n}`, check: 'Vérifie que le mécanisme est clair :', actors: { guest: 'Client', model: 'Modèle', tool: 'Outil', system: 'Système', human: 'Humain' } },
  en: { next: 'Next step', replay: 'Replay', step: (i: number, n: number) => `${i} / ${n}`, check: 'Check that the mechanism is clear:', actors: { guest: 'Guest', model: 'Model', tool: 'Tool', system: 'System', human: 'Human' } },
};

const ORDER: StepperMechanic['steps'][number]['actor'][] = ['guest', 'model', 'system', 'tool', 'human'];

/** Small illustrated actors, drawn in the house inks. */
function Actor({ kind, active }: { kind: string; active: boolean }) {
  const c = active ? '#e3c27a' : '#c9b67a';
  return (
    <svg viewBox="0 0 80 80" className={cx('st__actor-svg', active && 'is-active')} aria-hidden="true">
      <circle cx="40" cy="40" r="36" fill={active ? '#1e4d3b' : '#13281f'} stroke={c} strokeWidth="2" />
      {kind === 'guest' && (
        <g fill="none" stroke={c} strokeWidth="2.5">
          <circle cx="40" cy="30" r="9" />
          <path d="M24 58 q16 -18 32 0" />
        </g>
      )}
      {kind === 'model' && (
        <g>
          <rect x="22" y="24" width="36" height="30" rx="6" fill="none" stroke={c} strokeWidth="2.5" />
          <text x="40" y="44" textAnchor="middle" fontSize="11" fontFamily="var(--mono)" fill={c}>
            LLM
          </text>
        </g>
      )}
      {kind === 'system' && (
        <g fill="none" stroke={c} strokeWidth="2.5">
          <circle cx="40" cy="40" r="12" />
          {Array.from({ length: 8 }, (_, i) => {
            const a = (i * Math.PI) / 4;
            return <line key={i} x1={40 + Math.cos(a) * 14} y1={40 + Math.sin(a) * 14} x2={40 + Math.cos(a) * 19} y2={40 + Math.sin(a) * 19} />;
          })}
        </g>
      )}
      {kind === 'tool' && (
        <g fill="none" stroke={c} strokeWidth="2.5">
          <rect x="24" y="22" width="32" height="38" rx="2" />
          <path d="M30 32 h20 M30 40 h20 M30 48 h12" />
        </g>
      )}
      {kind === 'human' && (
        <g fill="none" stroke={c} strokeWidth="2.5">
          <path d="M28 52 h24 M32 52 v-10 h16 v10 M40 42 v-12" />
          <circle cx="40" cy="27" r="4" />
        </g>
      )}
    </svg>
  );
}

export default function Stepper({ m, lang, onSolved, onMistake, compact }: MechProps<StepperMechanic>) {
  const t = T[lang];
  const [i, setI] = useState(0);
  const actors = ORDER.filter((a) => m.steps.some((s) => s.actor === a));
  const step = m.steps[i];
  const done = i >= m.steps.length - 1;
  const [seen, setSeen] = useState(false);
  const pos = actors.indexOf(step.actor);

  return (
    <div className={cx('mg', 'mg-stepper', compact && 'mg--compact')}>
      <p className="mg-prompt">{m.prompt[lang]}</p>
      <div className="st">
        <div className="st__stage" style={{ ['--n' as string]: actors.length }}>
          <div className="st__rail" aria-hidden="true" />
          <span className="st__letter" style={{ ['--p' as string]: pos }} aria-hidden="true" />
          {actors.map((a) => (
            <div key={a} className={cx('st__actor', a === step.actor && 'is-active')}>
              <Actor kind={a} active={a === step.actor} />
              <span className="st__name">{t.actors[a]}</span>
            </div>
          ))}
        </div>
        <div className="st__caption" aria-live="polite" key={i}>
          <span className="st__count">{t.step(i + 1, m.steps.length)}</span>
          <p className="st__label">{step.label[lang]}</p>
          <p className="st__detail">{step.detail[lang]}</p>
        </div>
        <div className="st__controls">
          <button type="button" className="mg-btn" onClick={() => (sfx('tick'), setI(0))} disabled={i === 0}>
            {t.replay}
          </button>
          {!done && (
            <button type="button" className="mg-btn mg-btn--primary" onClick={() => (sfx('place'), setI(i + 1), i + 1 >= m.steps.length - 1 && setSeen(true))}>
              {t.next}
            </button>
          )}
        </div>
      </div>
      {(done || seen) && (
        <div className="st__check">
          <p className="st__check-title">{t.check}</p>
          <Choice m={m.check} lang={lang} onSolved={onSolved} onMistake={onMistake} compact />
        </div>
      )}
    </div>
  );
}
