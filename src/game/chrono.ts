'use client';

/**
 * The 100-hour chronometer.
 *
 * Counts ACTIVE learning time only:
 * - a session starts and stops on purpose (start / pause / resume / stop);
 * - one tab ticks at a time (a heartbeat lock in localStorage), so several open tabs never double count;
 * - a hidden tab pauses at once and resumes on return if it was away < 15 min;
 * - 10 minutes without any interaction pauses the session and removes those idle minutes;
 * - after a refresh or a crash, the session resumes only if the last tick is < 10 s old —
 *   time the page was not running is never counted;
 * - the cumulative total is written at every tick and is never reset except by an explicit,
 *   confirmed action on the progress page.
 */

import { useSyncExternalStore } from 'react';

export const GOAL_MS = 100 * 3600 * 1000;
const KEY = 'hotel100.chrono.v1';
const LOCK = 'hotel100.chrono.lock';
const TICK = 1000;
const MAX_STEP = 5000; // a longer gap means the page was frozen: not counted
const IDLE_MS = 10 * 60 * 1000;
const HIDDEN_RESUME_MS = 15 * 60 * 1000;

export type PauseReason = 'user' | 'hidden' | 'idle' | 'restored';

export interface ChronoSession {
  startedAt: number;
  ms: number;
  running: boolean;
  lastTick: number;
  pausedAt?: number;
  reason?: PauseReason;
}

export interface ChronoState {
  v: 1;
  totalMs: number;
  sessions: number;
  session: ChronoSession | null;
}

const EMPTY: ChronoState = { v: 1, totalMs: 0, sessions: 0, session: null };
let state: ChronoState = EMPTY;
let started = false;
const listeners = new Set<() => void>();
const tabId = Math.random().toString(36).slice(2);
let lastActivity = Date.now();
let channel: BroadcastChannel | null = null;

function read(): ChronoState {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const p = JSON.parse(raw) as ChronoState;
    if (p.v !== 1 || typeof p.totalMs !== 'number' || p.totalMs < 0) return EMPTY;
    return p;
  } catch {
    return state;
  }
}

function write(next: ChronoState, broadcast = true, allowDecrease = false) {
  // the total never goes backwards by accident (only idle give-back and explicit reset may lower it)
  const prev = read();
  if (!allowDecrease && next.totalMs < prev.totalMs) next = { ...next, totalMs: prev.totalMs };
  state = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* in memory only */
  }
  if (broadcast) channel?.postMessage('sync');
  emit();
}

function emit() {
  listeners.forEach((l) => l());
}

function ownLock(): boolean {
  const now = Date.now();
  try {
    const raw = window.localStorage.getItem(LOCK);
    const lock = raw ? (JSON.parse(raw) as { tab: string; beat: number }) : null;
    if (!lock || lock.tab === tabId || now - lock.beat > 4000) {
      window.localStorage.setItem(LOCK, JSON.stringify({ tab: tabId, beat: now }));
      return true;
    }
    return false;
  } catch {
    return true;
  }
}

function tick() {
  const s = read();
  state = s;
  const ses = s.session;
  if (!ses || !ses.running) {
    emit();
    return;
  }
  if (document.visibilityState === 'hidden') return;
  if (!ownLock()) {
    emit(); // another tab is counting
    return;
  }
  const now = Date.now();
  // idle: pause and give back the idle minutes
  if (now - lastActivity > IDLE_MS && !videoFocused()) {
    // minutes counted since the last interaction are given back
    const counted = Math.min(ses.ms, now - lastActivity);
    write(
      {
        ...s,
        totalMs: Math.max(0, s.totalMs - counted),
        session: { ...ses, ms: ses.ms - counted, running: false, pausedAt: now, reason: 'idle', lastTick: now },
      },
      true,
      true,
    );
    return;
  }
  const step = now - ses.lastTick;
  const add = step > 0 && step <= MAX_STEP ? step : 0;
  write({ ...s, totalMs: s.totalMs + add, session: { ...ses, ms: ses.ms + add, lastTick: now } }, false);
}

function videoFocused() {
  const a = document.activeElement;
  return !!a && a.tagName === 'IFRAME';
}

function onActivity() {
  lastActivity = Date.now();
}

function onVisibility() {
  const s = read();
  const ses = s.session;
  if (!ses) return;
  const now = Date.now();
  if (document.visibilityState === 'hidden' && ses.running) {
    if (!ownLock()) return;
    const step = now - ses.lastTick;
    const add = step > 0 && step <= MAX_STEP ? step : 0;
    write({ ...s, totalMs: s.totalMs + add, session: { ...ses, ms: ses.ms + add, running: false, pausedAt: now, reason: 'hidden', lastTick: now } });
  } else if (document.visibilityState === 'visible' && !ses.running && ses.reason === 'hidden' && ses.pausedAt && now - ses.pausedAt < HIDDEN_RESUME_MS) {
    lastActivity = now;
    write({ ...s, session: { ...ses, running: true, reason: undefined, pausedAt: undefined, lastTick: now } });
  }
}

function start() {
  if (started || typeof window === 'undefined') return;
  started = true;
  state = read();
  // restore after refresh: continue only if the page was running a moment ago
  const ses = state.session;
  if (ses?.running && Date.now() - ses.lastTick > 10000) {
    write({ ...state, session: { ...ses, running: false, pausedAt: ses.lastTick, reason: 'restored' } });
  }
  try {
    channel = new BroadcastChannel('hotel100.chrono');
    channel.onmessage = () => {
      state = read();
      emit();
    };
  } catch {
    channel = null;
  }
  window.addEventListener('storage', (e) => {
    if (e.key === KEY) {
      state = read();
      emit();
    }
  });
  ['pointerdown', 'keydown', 'wheel', 'touchstart', 'scroll'].forEach((ev) => window.addEventListener(ev, onActivity, { passive: true }));
  document.addEventListener('visibilitychange', onVisibility);
  setInterval(tick, TICK);
}

function getSnap() {
  start();
  return state;
}

export function useChrono(): ChronoState {
  return useSyncExternalStore(
    (cb) => {
      start();
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    getSnap,
    () => EMPTY,
  );
}

export const chrono = {
  start() {
    start();
    const s = read();
    const now = Date.now();
    lastActivity = now;
    ownLock();
    if (s.session) {
      if (!s.session.running) write({ ...s, session: { ...s.session, running: true, reason: undefined, pausedAt: undefined, lastTick: now } });
      return;
    }
    write({ ...s, session: { startedAt: now, ms: 0, running: true, lastTick: now } });
  },
  pause() {
    const s = read();
    if (!s.session?.running) return;
    const now = Date.now();
    const step = now - s.session.lastTick;
    const add = step > 0 && step <= MAX_STEP ? step : 0;
    write({ ...s, totalMs: s.totalMs + add, session: { ...s.session, ms: s.session.ms + add, running: false, pausedAt: now, reason: 'user', lastTick: now } });
  },
  stop() {
    const s = read();
    if (!s.session) return;
    let { totalMs } = s;
    let ms = s.session.ms;
    if (s.session.running) {
      const step = Date.now() - s.session.lastTick;
      const add = step > 0 && step <= MAX_STEP ? step : 0;
      totalMs += add;
      ms += add;
    }
    write({ ...s, totalMs, sessions: s.sessions + (ms > 0 ? 1 : 0), session: null });
  },
  /** Explicit, confirmed reset from the progress page only. */
  resetAll() {
    write(EMPTY, true, true);
  },
};

export function fmtClock(ms: number) {
  const t = Math.floor(ms / 1000);
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const s = t % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function fmtTotal(ms: number, lang: 'fr' | 'en') {
  const t = Math.floor(ms / 60000);
  const h = Math.floor(t / 60);
  const m = t % 60;
  return lang === 'fr' ? `${h} h ${String(m).padStart(2, '0')}` : `${h}h ${String(m).padStart(2, '0')}m`;
}
