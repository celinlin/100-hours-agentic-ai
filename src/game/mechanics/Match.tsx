'use client';

import { useMemo, useState } from 'react';
import type { MatchMechanic } from '../types';
import { sfx } from '../sound';
import { CheckButton, Frame, Verdict, cx, shuffle, useSolve, useStatus, type MechProps } from './common';
import { S } from './strings';

export default function Match({ m, lang, onSolved, onMistake, compact }: MechProps<MatchMechanic>) {
  const ids = useMemo(() => m.pairs.map((p) => p.id), [m.pairs]);
  const byId = useMemo(() => new Map(m.pairs.map((p) => [p.id, p])), [m.pairs]);
  const rights = useMemo(() => shuffle(ids, 'match:' + ids.join('|')), [ids]);
  /** leftId -> rightId (the id of the pair whose RIGHT text was chosen) */
  const [links, setLinks] = useState<Record<string, string>>({});
  const [sel, setSel] = useState<string | null>(null);
  const [marks, setMarks] = useState<Record<string, boolean> | null>(null);
  const [status, setStatus] = useStatus();
  const { solved, solve } = useSolve(onSolved);

  const leftOf = (rid: string) => Object.keys(links).find((l) => links[l] === rid);
  const num = (lid: string) => ids.indexOf(lid) + 1;

  const tapLeft = (lid: string) => {
    if (solved) return;
    setSel(sel === lid ? null : lid);
    sfx('tick');
  };

  const tapRight = (rid: string) => {
    if (solved) return;
    if (!sel) {
      setStatus('info', S.pickLeftFirst[lang]);
      return;
    }
    const left = byId.get(sel)!.left[lang];
    const next = { ...links };
    if (next[sel] === rid) {
      delete next[sel];
      setStatus('info', `${left} : ${S.unlinked[lang]}`);
    } else {
      const prev = leftOf(rid);
      if (prev) delete next[prev];
      next[sel] = rid;
      setStatus('info', `${left} : ${S.linkedTo[lang]} « ${byId.get(rid)!.right[lang]} »`);
    }
    setLinks(next);
    setMarks(null);
    sfx('place');
    // move on to the next unlinked left item, to keep the rhythm tap-left / tap-right
    setSel(ids.find((l) => !next[l] && l !== sel) ?? null);
  };

  const check = () => {
    if (ids.some((l) => !links[l])) {
      setStatus('info', S.linkAll[lang]);
      return;
    }
    const res: Record<string, boolean> = {};
    let wrong = 0;
    for (const l of ids) {
      res[l] = links[l] === l;
      if (!res[l]) wrong++;
    }
    setMarks(res);
    setSel(null);
    if (wrong === 0) {
      setStatus('ok', S.solved[lang]);
      solve();
    } else {
      setStatus('err', `${wrong} ${S.pairsToReview[lang]}`);
      sfx('wrong');
      onMistake?.();
    }
  };

  return (
    <Frame kind="match" prompt={m.prompt[lang]} lang={lang} compact={compact} solved={solved} status={status} footer={!solved && <CheckButton onClick={check} lang={lang} />}>
      <div className="mg-match-cols">
        <section aria-label={S.leftCol[lang]}>
          <h4 className="mg-kicker">{S.leftCol[lang]}</h4>
          <ul className="mg-list">
            {ids.map((lid) => {
              const p = byId.get(lid)!;
              const mark = marks?.[lid];
              return (
                <li key={lid}>
                  <button
                    type="button"
                    className={cx('mg-card', 'mg-pick', 'mg-match-item', sel === lid && 'is-active', links[lid] && 'is-linked', mark === true && 'is-ok', mark === false && 'is-err')}
                    aria-pressed={sel === lid}
                    disabled={solved}
                    onClick={() => tapLeft(lid)}
                  >
                    <span className="mg-index">{num(lid)}</span>
                    <span className="mg-label">{p.left[lang]}</span>
                    {mark !== undefined && <Verdict ok={mark} lang={lang} />}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
        <section aria-label={S.rightCol[lang]}>
          <h4 className="mg-kicker">{S.rightCol[lang]}</h4>
          <ul className="mg-list">
            {rights.map((rid) => {
              const p = byId.get(rid)!;
              const l = leftOf(rid);
              const mark = l ? marks?.[l] : undefined;
              return (
                <li key={rid}>
                  <button
                    type="button"
                    className={cx('mg-card', 'mg-pick', 'mg-match-item', l && 'is-linked', mark === true && 'is-ok', mark === false && 'is-err')}
                    disabled={solved}
                    aria-label={l ? `${p.right[lang]}, ${S.linkedTo[lang]} ${num(l)}` : undefined}
                    onClick={() => tapRight(rid)}
                  >
                    <span className={cx('mg-index', !l && 'is-empty')} aria-hidden="true">
                      {l ? num(l) : ''}
                    </span>
                    <span className="mg-label">{p.right[lang]}</span>
                    {mark === false && <Verdict ok={false} lang={lang} />}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </Frame>
  );
}
