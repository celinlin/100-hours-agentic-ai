'use client';

import { useEffect, useRef, useState } from 'react';
import type { LoopMechanic } from '../types';
import { sfx } from '../sound';
import { Frame, cx, prefersReducedMotion, useSolve, useStatus, type MechProps } from './common';
import { S } from './strings';

type Entry = { kind: 'call' | 'result' | 'final'; text: string; key: number };

export default function Loop({ m, lang, onSolved, onMistake, compact }: MechProps<LoopMechanic>) {
  const [called, setCalled] = useState<string[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [pending, setPending] = useState<string | null>(null);
  const [wrongId, setWrongId] = useState<string | null>(null);
  const [status, setStatus] = useStatus();
  const { solved, solve } = useSolve(onSolved);
  const timer = useRef<number | undefined>(undefined);
  const seq = useRef(0);
  const ctxEnd = useRef<HTMLLIElement>(null);

  useEffect(() => () => window.clearTimeout(timer.current), []);
  useEffect(() => {
    ctxEnd.current?.scrollIntoView({ block: 'nearest', behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  }, [entries.length, pending]);

  const isValid = (id: string) => {
    if (called.length >= m.expected.length) return false;
    if (!m.anyOrder) return m.expected[called.length] === id;
    const remaining = [...m.expected];
    for (const c of called) {
      const k = remaining.indexOf(c);
      if (k >= 0) remaining.splice(k, 1);
    }
    return remaining.includes(id);
  };

  const push = (e: Omit<Entry, 'key'>) => setEntries((p) => [...p, { ...e, key: ++seq.current }]);

  const callTool = (id: string) => {
    if (pending || solved) return;
    const tool = m.tools.find((t) => t.id === id);
    if (!tool) return;
    if (!isValid(id)) {
      setWrongId(id);
      setStatus('err', m.wrongTool[lang]);
      sfx('wrong');
      onMistake?.();
      return;
    }
    setWrongId(null);
    sfx('tick');
    push({ kind: 'call', text: tool.label });
    setPending(tool.label);
    setStatus('info', `${S.executing[lang]} ${tool.label}…`);
    timer.current = window.setTimeout(() => {
      push({ kind: 'result', text: tool.returns[lang] });
      setCalled((c) => [...c, id]);
      setPending(null);
      sfx('place');
      setStatus('info', `${tool.label} : ${S.resultAdded[lang]}`);
    }, 500);
  };

  const final = () => {
    if (pending || solved) return;
    if (called.length < m.expected.length) {
      setWrongId('__final');
      setStatus('err', m.tooEarly[lang]);
      sfx('wrong');
      onMistake?.();
      return;
    }
    setWrongId(null);
    push({ kind: 'final', text: m.finalLabel[lang] });
    setStatus('ok', S.solved[lang]);
    solve();
  };

  const reset = () => {
    window.clearTimeout(timer.current);
    setCalled([]);
    setEntries([]);
    setPending(null);
    setWrongId(null);
    setStatus(null);
    sfx('tick');
  };

  const kindLabel = { call: S.toolCall, result: S.result, final: S.final } as const;

  return (
    <Frame
      kind="loop"
      prompt={m.prompt[lang]}
      lang={lang}
      compact={compact}
      solved={solved}
      status={status}
      footer={
        entries.length > 0 && !solved ? (
          <button type="button" className="mg-btn" onClick={reset} disabled={!!pending}>
            {S.retry[lang]}
          </button>
        ) : null
      }
    >
      <section className="mg-ctx" aria-label={S.context[lang]}>
        <h4 className="mg-kicker">{S.context[lang]}</h4>
        <ol className="mg-ctx-list">
          <li className="mg-ctx-item mg-ctx-item--goal">
            <span className="mg-ctx-k">{S.request[lang]}</span>
            <span className="mg-ctx-v">{m.goal[lang]}</span>
          </li>
          {entries.map((e) => (
            <li key={e.key} className={cx('mg-ctx-item', `mg-ctx-item--${e.kind}`, 'mg-enter')}>
              <span className="mg-ctx-k">{kindLabel[e.kind][lang]}</span>
              <span className={cx('mg-ctx-v', e.kind === 'call' && 'mg-code')}>{e.text}</span>
            </li>
          ))}
          {pending && (
            <li className="mg-ctx-item mg-exec" aria-hidden="true">
              <span className="mg-ctx-k">{S.executing[lang]}</span>
              <span className="mg-exec-bar">
                <span className="mg-exec-fill" />
              </span>
            </li>
          )}
          <li ref={ctxEnd} className="mg-ctx-end" aria-hidden="true" />
        </ol>
      </section>

      <section className="mg-actions" aria-label={S.actions[lang]}>
        <h4 className="mg-kicker">{S.actions[lang]}</h4>
        <div className="mg-tools">
          {m.tools.map((tl) => (
            <span key={tl.id} className="mg-tool-wrap">
              <button
                type="button"
                className={cx('mg-btn', 'mg-tool', wrongId === tl.id && 'is-err', called.includes(tl.id) && 'is-used')}
                disabled={solved || !!pending}
                onClick={() => callTool(tl.id)}
              >
                <span className="mg-code">{tl.label}</span>
              </button>
              {wrongId === tl.id && <span className="mg-verdict mg-verdict--err">{S.again[lang]}</span>}
            </span>
          ))}
          <span className="mg-tool-wrap">
            <button type="button" className={cx('mg-btn', 'mg-final', wrongId === '__final' && 'is-err')} disabled={solved || !!pending} onClick={final}>
              {m.finalLabel[lang]}
            </button>
            {wrongId === '__final' && <span className="mg-verdict mg-verdict--err">{S.again[lang]}</span>}
          </span>
        </div>
        {wrongId && !solved && <p className="mg-why">{wrongId === '__final' ? m.tooEarly[lang] : m.wrongTool[lang]}</p>}
      </section>
    </Frame>
  );
}
