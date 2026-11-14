'use client';

import { useState } from 'react';
import type { ChoiceMechanic } from '../types';
import { sfx } from '../sound';
import { CheckButton, Frame, Verdict, cx, useSolve, useStatus, type MechProps } from './common';
import { S } from './strings';

export default function Choice({ m, lang, onSolved, onMistake, compact }: MechProps<ChoiceMechanic>) {
  const multiple = !!m.multiple;
  const [picked, setPicked] = useState<string[]>([]);
  const [checked, setChecked] = useState<string[] | null>(null);
  const [status, setStatus] = useStatus();
  const { solved, solve } = useSolve(onSolved);

  const toggle = (id: string) => {
    if (solved) return;
    setPicked((p) => (multiple ? (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]) : [id]));
    setChecked(null);
    sfx('tick');
  };

  const check = () => {
    if (!picked.length) {
      setStatus('info', multiple ? S.pickSome[lang] : S.pickOne[lang]);
      return;
    }
    setChecked(picked);
    const wrongPicked = m.options.filter((o) => picked.includes(o.id) && !o.correct).length;
    const missing = m.options.filter((o) => o.correct && !picked.includes(o.id)).length;
    if (wrongPicked === 0 && missing === 0) {
      setStatus('ok', S.solved[lang]);
      solve();
      return;
    }
    setStatus('err', wrongPicked ? S.notThis[lang] : S.missing[lang]);
    sfx('wrong');
    onMistake?.();
  };

  return (
    <Frame kind="choice" prompt={m.prompt[lang]} lang={lang} compact={compact} solved={solved} status={status} footer={!solved && <CheckButton onClick={check} lang={lang} />}>
      {m.scene && <p className="mg-scene">{m.scene[lang]}</p>}
      {multiple && <p className="mg-note">{S.severalAnswers[lang]}</p>}
      <ul className="mg-list" role={multiple ? 'group' : 'radiogroup'} aria-label={m.prompt[lang]}>
        {m.options.map((o) => {
          const on = picked.includes(o.id);
          const wasChecked = !!checked?.includes(o.id);
          const showOk = wasChecked && o.correct;
          const showErr = wasChecked && !o.correct;
          return (
            <li key={o.id} className={cx('mg-card', 'mg-option', on && 'is-active', showOk && 'is-ok', showErr && 'is-err')}>
              <button
                type="button"
                className="mg-pick"
                role={multiple ? 'checkbox' : 'radio'}
                aria-checked={on}
                disabled={solved}
                onClick={() => toggle(o.id)}
              >
                <span className={cx('mg-tick', multiple ? 'mg-tick--box' : 'mg-tick--dot')} aria-hidden="true" />
                <span className="mg-label">{o.label[lang]}</span>
                {wasChecked && <Verdict ok={o.correct} lang={lang} />}
              </button>
              {(showErr || (showOk && (solved || multiple))) && <p className={cx('mg-why', showOk && 'mg-why--ok')}>{o.why[lang]}</p>}
            </li>
          );
        })}
      </ul>
    </Frame>
  );
}
