'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { sfx } from '../sound';
import { S, type Lang } from './strings';

export interface MechProps<M> {
  m: M;
  lang: Lang;
  onSolved: () => void;
  onMistake?: () => void;
  compact?: boolean;
}

export type Status = { tone: 'info' | 'err' | 'ok'; text: string; n: number } | null;

export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ');

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rng(seed: number) {
  let a = seed || 1;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let x = Math.imul(a ^ (a >>> 15), 1 | a);
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Deterministic pseudo-random shuffle (same result on server and client, so no hydration
 * mismatch), guaranteed different from the input order when there are ≥ 2 items.
 */
export function shuffle<X>(items: X[], seed: string): X[] {
  const out = [...items];
  const r = rng(hash(seed));
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  if (out.length > 1 && out.every((x, i) => x === items[i])) out.push(out.shift() as X);
  return out;
}

export function prefersReducedMotion() {
  return typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

/** Success: sound, settle animation (CSS, via `solved`), then onSolved exactly once. */
export function useSolve(onSolved: () => void) {
  const [solved, setSolved] = useState(false);
  const done = useRef(false);
  const cb = useRef(onSolved);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => {
    cb.current = onSolved;
  }, [onSolved]);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const solve = useCallback(() => {
    if (done.current) return;
    done.current = true;
    setSolved(true);
    sfx('solve');
    timer.current = window.setTimeout(() => cb.current(), prefersReducedMotion() ? 150 : 900);
  }, []);
  return { solved, solve };
}

/** Status message with a counter so repeated identical messages are re-announced. */
export function useStatus() {
  const [status, setStatusRaw] = useState<Status>(null);
  const n = useRef(0);
  const setStatus = useCallback((tone: 'info' | 'err' | 'ok' | null, text = '') => {
    n.current += 1;
    setStatusRaw(tone ? { tone, text, n: n.current } : null);
  }, []);
  return [status, setStatus] as const;
}

export function Frame(props: {
  kind: string;
  prompt: ReactNode;
  lang: Lang;
  compact?: boolean;
  solved: boolean;
  status: Status;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const { kind, prompt, lang, compact, solved, status, children, footer } = props;
  return (
    <div className={cx('mg', `mg-${kind}`, compact && 'mg--compact', solved && 'mg--solved')}>
      <p className="mg-prompt">{prompt}</p>
      {children}
      <div className="mg-foot">
        {footer}
        <p className={cx('mg-status', status && `mg-status--${status.tone}`)} role="status" aria-live="polite" aria-atomic="true">
          {solved ? (
            <span key="solved" className="mg-success">
              <mark className="mg-mark">{S.solved[lang]}</mark>
            </span>
          ) : status ? (
            <span key={status.n}>{status.text}</span>
          ) : null}
        </p>
      </div>
    </div>
  );
}

/** Text label (not only colour) for a checked item. */
export function Verdict({ ok, lang }: { ok: boolean; lang: Lang }) {
  return <span className={cx('mg-verdict', ok ? 'mg-verdict--ok' : 'mg-verdict--err')}>{ok ? S.right[lang] : S.again[lang]}</span>;
}

export function CheckButton({ onClick, lang, disabled }: { onClick: () => void; lang: Lang; disabled?: boolean }) {
  return (
    <button type="button" className="mg-btn mg-btn--primary" onClick={onClick} disabled={disabled}>
      {S.check[lang]}
    </button>
  );
}
