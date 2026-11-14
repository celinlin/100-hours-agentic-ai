'use client';

import { useState } from 'react';
import type { SpotMechanic } from '../types';
import { sfx } from '../sound';
import { CheckButton, Frame, Verdict, cx, useSolve, useStatus, type MechProps } from './common';
import { S } from './strings';

export default function Spot({ m, lang, onSolved, onMistake, compact }: MechProps<SpotMechanic>) {
  const [picked, setPicked] = useState<number[]>([]);
  const [checked, setChecked] = useState<number[] | null>(null);
  const [status, setStatus] = useStatus();
  const { solved, solve } = useSolve(onSolved);

  const toggle = (i: number) => {
    if (solved) return;
    setPicked((p) => (p.includes(i) ? p.filter((x) => x !== i) : [...p, i]));
    setChecked(null);
    sfx('tick');
  };

  const check = () => {
    if (!picked.length) {
      setStatus('info', S.pickLine[lang]);
      return;
    }
    setChecked(picked);
    const wrong = picked.filter((i) => !m.lines[i].faulty).length;
    const missing = m.lines.filter((l, i) => l.faulty && !picked.includes(i)).length;
    if (!wrong && !missing) {
      setStatus('ok', S.solved[lang]);
      solve();
      return;
    }
    const parts: string[] = [];
    if (wrong) parts.push(`${wrong} ${S.linesWrong[lang]}`);
    if (missing) parts.push(S.linesMissing[lang]);
    setStatus('err', parts.join(' '));
    sfx('wrong');
    onMistake?.();
  };

  return (
    <Frame kind="spot" prompt={m.prompt[lang]} lang={lang} compact={compact} solved={solved} status={status} footer={!solved && <CheckButton onClick={check} lang={lang} />}>
      <ol className={cx('mg-lines', m.code && 'mg-lines--code')}>
        {m.lines.map((l, i) => {
          const on = picked.includes(i);
          const was = !!checked?.includes(i);
          return (
            <li key={i} className={cx('mg-line', on && 'is-active', was && l.faulty && 'is-ok', was && !l.faulty && 'is-err')}>
              <button type="button" className="mg-line-btn" aria-pressed={on} disabled={solved} onClick={() => toggle(i)}>
                <span className="mg-line-no" aria-hidden="true">
                  {i + 1}
                </span>
                <span className="mg-visually-hidden">
                  {S.line[lang]} {i + 1} :{' '}
                </span>
                <span className="mg-line-text">{l.text[lang]}</span>
              </button>
              {was && (
                <div className="mg-line-fb">
                  <Verdict ok={l.faulty} lang={lang} />
                  {l.faulty && <span className="mg-verdict-k">{S.faulty[lang]}</span>}
                  {l.why && <p className={cx('mg-why', l.faulty && 'mg-why--ok')}>{l.why[lang]}</p>}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </Frame>
  );
}
