'use client';

import { useId, useMemo, useState } from 'react';
import type { SortMechanic } from '../types';
import { sfx } from '../sound';
import { CheckButton, Frame, Verdict, cx, shuffle, useSolve, useStatus, type MechProps } from './common';
import { S } from './strings';

export default function Sort({ m, lang, onSolved, onMistake, compact }: MechProps<SortMechanic>) {
  const uid = useId();
  const items = useMemo(() => shuffle(m.items, 'sort:' + m.items.map((i) => i.id).join('|')), [m.items]);
  const binLabel = useMemo(() => new Map(m.bins.map((b) => [b.id, b.label])), [m.bins]);
  const [place, setPlace] = useState<Record<string, string>>({});
  const [sel, setSel] = useState<string | null>(null);
  const [marks, setMarks] = useState<Record<string, boolean> | null>(null);
  const [status, setStatus] = useStatus();
  const { solved, solve } = useSolve(onSolved);

  const put = (itemId: string, binId: string) => {
    if (solved) return;
    setPlace((p) => {
      const n = { ...p };
      if (binId) n[itemId] = binId;
      else delete n[itemId];
      return n;
    });
    setSel(null);
    setMarks(null);
    sfx('place');
    const it = m.items.find((i) => i.id === itemId);
    const bl = binLabel.get(binId);
    if (it) setStatus('info', bl ? `${it.label[lang]} : ${S.placedIn[lang]} « ${bl[lang]} »` : `${it.label[lang]} : ${S.notPlaced[lang]}`);
  };

  const pick = (itemId: string) => {
    if (solved) return;
    const next = sel === itemId ? null : itemId;
    setSel(next);
    sfx('tick');
    const it = m.items.find((i) => i.id === itemId);
    if (next && it) setStatus('info', `${it.label[lang]} ${S.selected[lang]}`);
  };

  const tapBin = (binId: string) => {
    if (solved) return;
    if (!sel) {
      setStatus('info', S.pickCardFirst[lang]);
      return;
    }
    put(sel, binId);
  };

  const check = () => {
    if (items.some((i) => !place[i.id])) {
      setStatus('info', S.placeAll[lang]);
      return;
    }
    const res: Record<string, boolean> = {};
    let wrong = 0;
    for (const i of items) {
      res[i.id] = place[i.id] === i.bin;
      if (!res[i.id]) wrong++;
    }
    setMarks(res);
    setSel(null);
    if (wrong === 0) {
      setStatus('ok', S.solved[lang]);
      solve();
    } else {
      setStatus('err', `${wrong} ${S.cardsToReview[lang]}`);
      sfx('wrong');
      onMistake?.();
    }
  };

  const card = (it: (typeof items)[number]) => {
    const mark = marks?.[it.id];
    const selId = `${uid}-sel-${it.id}`;
    return (
      <li key={it.id} className={cx('mg-card', 'mg-sort-card', sel === it.id && 'is-active', mark === true && 'is-ok', mark === false && 'is-err')}>
        <div className="mg-sort-row">
          <button type="button" className="mg-pick" aria-pressed={sel === it.id} disabled={solved} onClick={() => pick(it.id)}>
            <span className="mg-label">{it.label[lang]}</span>
          </button>
          {mark !== undefined && <Verdict ok={mark} lang={lang} />}
        </div>
        <div className="mg-sort-fallback">
          <label className="mg-visually-hidden" htmlFor={selId}>
            {S.binFor[lang]} {it.label[lang]}
          </label>
          <select id={selId} className="mg-select" value={place[it.id] ?? ''} disabled={solved} onChange={(e) => put(it.id, e.target.value)}>
            <option value="">{S.notPlaced[lang]}</option>
            {m.bins.map((b) => (
              <option key={b.id} value={b.id}>
                {b.label[lang]}
              </option>
            ))}
          </select>
        </div>
        {mark === false && <p className="mg-why">{it.why[lang]}</p>}
        {solved && mark === true && <p className="mg-why mg-why--ok">{it.why[lang]}</p>}
      </li>
    );
  };

  const pool = items.filter((i) => !place[i.id]);

  return (
    <Frame kind="sort" prompt={m.prompt[lang]} lang={lang} compact={compact} solved={solved} status={status} footer={!solved && <CheckButton onClick={check} lang={lang} />}>
      {pool.length > 0 && (
        <section className="mg-pool" aria-label={S.toPlace[lang]}>
          <h4 className="mg-kicker">{S.toPlace[lang]}</h4>
          <ul className="mg-list">{pool.map(card)}</ul>
        </section>
      )}
      <div className="mg-bins">
        {m.bins.map((b) => {
          const inBin = items.filter((i) => place[i.id] === b.id);
          return (
            <section key={b.id} className={cx('mg-bin', sel && 'is-target')} aria-label={b.label[lang]}>
              <button type="button" className="mg-bin-head" disabled={solved} onClick={() => tapBin(b.id)}>
                <span className="mg-bin-name">{b.label[lang]}</span>
                {sel && <span className="mg-bin-cta">{S.dropIn[lang]}</span>}
              </button>
              {inBin.length ? <ul className="mg-list">{inBin.map(card)}</ul> : <p className="mg-empty">{S.emptyBin[lang]}</p>}
            </section>
          );
        })}
      </div>
    </Frame>
  );
}
