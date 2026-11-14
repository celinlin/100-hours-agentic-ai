'use client';

import { Fragment, useId, useMemo, useState } from 'react';
import type { FillMechanic } from '../types';
import { sfx } from '../sound';
import { CheckButton, Frame, Verdict, cx, useSolve, useStatus, type MechProps } from './common';
import { S } from './strings';

export default function Fill({ m, lang, onSolved, onMistake, compact }: MechProps<FillMechanic>) {
  const uid = useId();
  const parts = useMemo(() => m.template[lang].split(/\{\{(\d+)\}\}/), [m.template, lang]);
  const [vals, setVals] = useState<string[]>(() => m.blanks.map(() => ''));
  const [marks, setMarks] = useState<boolean[] | null>(null);
  const [status, setStatus] = useStatus();
  const { solved, solve } = useSolve(onSolved);

  const set = (i: number, v: string) => {
    if (solved) return;
    setVals((p) => p.map((x, j) => (j === i ? v : x)));
    setMarks(null);
    sfx('place');
  };

  const check = () => {
    if (vals.some((v) => !v)) {
      setStatus('info', S.fillAll[lang]);
      return;
    }
    const res = m.blanks.map((b, i) => vals[i] === b.answer);
    setMarks(res);
    const wrong = res.filter((x) => !x).length;
    if (!wrong) {
      setStatus('ok', S.solved[lang]);
      solve();
    } else {
      setStatus('err', `${wrong} ${S.blanksWrong[lang]}`);
      sfx('wrong');
      onMistake?.();
    }
  };

  return (
    <Frame kind="fill" prompt={m.prompt[lang]} lang={lang} compact={compact} solved={solved} status={status} footer={!solved && <CheckButton onClick={check} lang={lang} />}>
      <div className={cx('mg-snippet', m.code && 'mg-snippet--code')}>
        {parts.map((p, k) => {
          if (k % 2 === 0) return <Fragment key={k}>{p}</Fragment>;
          const i = Number(p);
          const b = m.blanks[i];
          if (!b) return <Fragment key={k}>{`{{${p}}}`}</Fragment>;
          const mark = marks?.[i];
          return (
            <span key={k} className={cx('mg-blank', vals[i] && 'is-filled', mark === true && 'is-ok', mark === false && 'is-err')}>
              <label className="mg-visually-hidden" htmlFor={`${uid}-${i}`}>
                {S.blank[lang]} {i + 1}
              </label>
              <select id={`${uid}-${i}`} className="mg-select mg-select--inline" value={vals[i]} disabled={solved} onChange={(e) => set(i, e.target.value)}>
                <option value="">{S.choose[lang]}</option>
                {b.options.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
              <sup className="mg-blank-no" aria-hidden="true">
                {i + 1}
              </sup>
            </span>
          );
        })}
      </div>
      {marks && (
        <ol className="mg-fb-list">
          {m.blanks.map((b, i) =>
            marks[i] && !solved ? null : (
              <li key={i} className={cx('mg-fb-item', marks[i] ? 'is-ok' : 'is-err')}>
                <span className="mg-fb-no">
                  {S.blank[lang]} {i + 1}
                </span>
                <Verdict ok={marks[i]} lang={lang} />
                <p className={cx('mg-why', marks[i] && 'mg-why--ok')}>{b.why[lang]}</p>
              </li>
            ),
          )}
        </ol>
      )}
    </Frame>
  );
}
