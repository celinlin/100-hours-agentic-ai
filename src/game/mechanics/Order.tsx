'use client';

import { useEffect, useMemo, useRef, useState, type PointerEvent as RPointerEvent } from 'react';
import type { OrderMechanic } from '../types';
import { sfx } from '../sound';
import { CheckButton, Frame, Verdict, cx, shuffle, useSolve, useStatus, type MechProps } from './common';
import { S } from './strings';

export default function Order({ m, lang, onSolved, onMistake, compact }: MechProps<OrderMechanic>) {
  const correct = useMemo(() => m.items.map((i) => i.id), [m.items]);
  const byId = useMemo(() => new Map(m.items.map((i) => [i.id, i])), [m.items]);
  const [order, setOrder] = useState(() => shuffle(correct, 'order:' + correct.join('|')));
  const [marks, setMarks] = useState<Record<string, boolean> | null>(null);
  const [status, setStatus] = useStatus();
  const { solved, solve } = useSolve(onSolved);
  const listRef = useRef<HTMLOListElement>(null);
  const focusAfter = useRef<{ id: string; dir: 'up' | 'down' } | null>(null);
  const drag = useRef<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);

  useEffect(() => {
    const f = focusAfter.current;
    if (!f || !listRef.current) return;
    focusAfter.current = null;
    const q = (d: string) => listRef.current!.querySelector<HTMLButtonElement>(`[data-move="${CSS.escape(f.id)}:${d}"]`);
    const b = q(f.dir);
    (b && !b.disabled ? b : q(f.dir === 'up' ? 'down' : 'up'))?.focus();
  }, [order]);

  const announce = (id: string, idx: number) => {
    const it = byId.get(id);
    if (it) setStatus('info', `${it.label[lang]} : ${S.position[lang]} ${idx + 1} ${S.of[lang]} ${order.length}`);
  };

  const move = (id: string, dir: -1 | 1) => {
    if (solved) return;
    const from = order.indexOf(id);
    const to = from + dir;
    if (to < 0 || to >= order.length) return;
    const next = [...order];
    next.splice(from, 1);
    next.splice(to, 0, id);
    focusAfter.current = { id, dir: dir < 0 ? 'up' : 'down' };
    setOrder(next);
    setMarks(null);
    sfx('tick');
    announce(id, to);
  };

  const onDown = (e: RPointerEvent<HTMLElement>, id: string) => {
    if (solved || (e.pointerType === 'mouse' && e.button !== 0)) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = id;
    setDragId(id);
  };
  const onMove = (e: RPointerEvent<HTMLElement>) => {
    const id = drag.current;
    const list = listRef.current;
    if (!id || !list) return;
    const rows = Array.from(list.children) as HTMLElement[];
    let hit = rows.length;
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i].getBoundingClientRect();
      if (e.clientY < r.top + r.height / 2) {
        hit = i;
        break;
      }
    }
    setOrder((o) => {
      const from = o.indexOf(id);
      const to = Math.min(o.length - 1, hit > from ? hit - 1 : hit);
      if (to === from) return o;
      const next = [...o];
      next.splice(from, 1);
      next.splice(to, 0, id);
      return next;
    });
    setMarks(null);
  };
  const onUp = () => {
    const id = drag.current;
    if (!id) return;
    drag.current = null;
    setDragId(null);
    sfx('place');
    announce(id, order.indexOf(id));
  };

  const check = () => {
    const res: Record<string, boolean> = {};
    let wrong = 0;
    order.forEach((id, i) => {
      res[id] = id === correct[i];
      if (!res[id]) wrong++;
    });
    setMarks(res);
    if (wrong === 0) {
      setStatus('ok', S.solved[lang]);
      solve();
    } else {
      setStatus('err', `${wrong} ${S.stepsToReview[lang]}`);
      sfx('wrong');
      onMistake?.();
    }
  };

  return (
    <Frame kind="order" prompt={m.prompt[lang]} lang={lang} compact={compact} solved={solved} status={status} footer={!solved && <CheckButton onClick={check} lang={lang} />}>
      <ol className="mg-list" ref={listRef}>
        {order.map((id, i) => {
          const it = byId.get(id)!;
          const mark = marks?.[id];
          const label = it.label[lang];
          return (
            <li
              key={id}
              className={cx('mg-card', 'mg-order-row', dragId === id && 'is-dragging', mark === true && 'is-ok', mark === false && 'is-err')}
            >
              <div className="mg-order-main">
                <span
                  className="mg-grip"
                  aria-hidden="true"
                  title={S.dragHandle[lang]}
                  onPointerDown={(e) => onDown(e, id)}
                  onPointerMove={onMove}
                  onPointerUp={onUp}
                  onPointerCancel={onUp}
                >
                  <span className="mg-index">{i + 1}</span>
                </span>
                <span className="mg-label">{label}</span>
                {mark !== undefined && <Verdict ok={mark} lang={lang} />}
                <span className="mg-movers">
                  <button
                    type="button"
                    className="mg-icon-btn"
                    data-move={`${id}:up`}
                    disabled={solved || i === 0}
                    aria-label={`${S.moveUp[lang]} : ${label}`}
                    onClick={() => move(id, -1)}
                  >
                    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M3.5 10 8 5.5 12.5 10" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg>
                  </button>
                  <button
                    type="button"
                    className="mg-icon-btn"
                    data-move={`${id}:down`}
                    disabled={solved || i === order.length - 1}
                    aria-label={`${S.moveDown[lang]} : ${label}`}
                    onClick={() => move(id, 1)}
                  >
                    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M3.5 6 8 10.5 12.5 6" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg>
                  </button>
                </span>
              </div>
              {mark === false && it.hint && (
                <p className="mg-why">
                  <span className="mg-why-k">{S.hint[lang]}</span> {it.hint[lang]}
                </p>
              )}
            </li>
          );
        })}
      </ol>
    </Frame>
  );
}
