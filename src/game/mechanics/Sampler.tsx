'use client';

import { useId, useMemo, useState } from 'react';
import type { SamplerMechanic } from '../types';
import { sfx } from '../sound';
import { Frame, cx, useSolve, useStatus, type MechProps } from './common';
import { S } from './strings';

const HIGH_T = 1.2;

/** Temperature reshaping: p_i^(1/T), renormalised (computed in log space for stability). */
export function reshape(ps: number[], temp: number): number[] {
  const T = Math.max(0.05, temp);
  const logs = ps.map((p) => (p > 0 ? Math.log(p) / T : -Infinity));
  const max = Math.max(...logs);
  const ex = logs.map((l) => (l === -Infinity ? 0 : Math.exp(l - max)));
  const sum = ex.reduce((a, b) => a + b, 0) || 1;
  return ex.map((e) => e / sum);
}

function sample(probs: number[]): number {
  const r = Math.random();
  let acc = 0;
  for (let i = 0; i < probs.length; i++) {
    acc += probs[i];
    if (r < acc) return i;
  }
  return probs.length - 1;
}

export default function Sampler({ m, lang, onSolved, compact }: MechProps<SamplerMechanic>) {
  const uid = useId();
  const [temp, setTemp] = useState(1);
  const [hist, setHist] = useState<{ i: number; T: number }[]>([]);
  const [status, setStatus] = useStatus();
  const { solved, solve } = useSolve(onSolved);
  const loc = lang === 'fr' ? 'fr-FR' : 'en-US';
  const fmtT = (x: number) => x.toLocaleString(loc, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const fmtP = (x: number) => (x * 100).toLocaleString(loc, { maximumFractionDigits: x < 0.1 ? 1 : 0 }) + ' %';

  const probs = useMemo(() => reshape(m.tokens.map((t) => t.p), temp), [m.tokens, temp]);
  const need = m.goal.distinctAtHighTemp ?? 0;

  const progress = (h: { i: number; T: number }[]) => ({
    draws: h.length,
    distinct: new Set(h.filter((x) => x.T >= HIGH_T - 1e-9).map((x) => x.i)).size,
  });
  const pr = progress(hist);

  const draw = () => {
    const i = sample(probs);
    const next = [...hist, { i, T: temp }];
    setHist(next);
    sfx('place');
    const tok = m.tokens[i].text[lang];
    setStatus('info', `${S.drawn[lang]} : « ${tok} » (T = ${fmtT(temp)}, p = ${fmtP(probs[i])})`);
    const p = progress(next);
    if (!solved && p.draws >= m.goal.draws && p.distinct >= need) solve();
  };

  const reset = () => {
    setHist([]);
    setStatus(null);
    sfx('tick');
  };

  const last = hist[hist.length - 1];
  const tempId = `${uid}-t`;

  return (
    <Frame
      kind="sampler"
      prompt={m.prompt[lang]}
      lang={lang}
      compact={compact}
      solved={solved}
      status={status}
      footer={
        <>
          <button type="button" className="mg-btn mg-btn--primary" onClick={draw}>
            {S.draw[lang]}
          </button>
          {hist.length > 0 && (
            <button type="button" className="mg-btn" onClick={reset}>
              {S.retry[lang]}
            </button>
          )}
        </>
      }
    >
      <p className="mg-context" aria-label={S.context[lang]}>
        <span>{m.context[lang]}</span>{' '}
        {last ? (
          <mark key={hist.length} className="mg-token mg-token--new">
            {m.tokens[last.i].text[lang]}
          </mark>
        ) : (
          <span className="mg-token mg-token--slot" aria-label={S.nextToken[lang]}>
            ___
          </span>
        )}
      </p>

      <div className="mg-temp">
        <label htmlFor={tempId} className="mg-temp-label">
          {S.temperature[lang]}
        </label>
        <input
          id={tempId}
          className="mg-range"
          type="range"
          min={0.2}
          max={2}
          step={0.1}
          value={temp}
          aria-valuetext={fmtT(temp)}
          onChange={(e) => setTemp(Number(e.target.value))}
        />
        <output htmlFor={tempId} className={cx('mg-temp-val', temp >= HIGH_T - 1e-9 && 'is-high')}>
          {fmtT(temp)}
        </output>
      </div>

      <figure className="mg-bars">
        <figcaption className="mg-kicker">{S.illustrative[lang]}</figcaption>
        <ul className="mg-list mg-list--tight">
          {m.tokens.map((tk, i) => (
            <li key={i} className={cx('mg-bar-row', last?.i === i && 'is-last')}>
              <span className="mg-bar-tok">{tk.text[lang]}</span>
              <span className="mg-bar-track" aria-hidden="true">
                <span className="mg-bar-fill" style={{ transform: `scaleX(${probs[i]})` }} />
              </span>
              <span className="mg-bar-p">{fmtP(probs[i])}</span>
            </li>
          ))}
        </ul>
      </figure>

      <div className="mg-goal">
        <span className={cx('mg-goal-item', pr.draws >= m.goal.draws && 'is-done')}>
          {S.history[lang]} : {Math.min(pr.draws, m.goal.draws)} / {m.goal.draws}
        </span>
        {need > 0 && (
          <span className={cx('mg-goal-item', pr.distinct >= need && 'is-done')}>
            {S.distinctHigh[lang]} : {Math.min(pr.distinct, need)} / {need}
          </span>
        )}
      </div>

      <section className="mg-history" aria-label={S.history[lang]}>
        {hist.length === 0 ? (
          <p className="mg-empty">{S.noDraw[lang]}</p>
        ) : (
          <ol className="mg-chips">
            {hist.map((h, k) => (
              <li key={k} className={cx('mg-chip', h.T >= HIGH_T - 1e-9 && 'is-high')}>
                <span className="mg-chip-tok">{m.tokens[h.i].text[lang]}</span>
                <span className="mg-chip-t">T {fmtT(h.T)}</span>
              </li>
            ))}
          </ol>
        )}
      </section>
    </Frame>
  );
}
