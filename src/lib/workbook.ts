'use client';

import { useSyncExternalStore } from 'react';

/**
 * The learner's workbook: answers, journal lines, checked activities, read resources.
 * Stored locally per chapter. Keys are structural (e.g. "pre:3", "act:seance-1-2"),
 * so the same notes appear whether the chapter is read in French or English.
 */

type Value = string | boolean;
interface Book {
  v: 1;
  data: Record<string, Record<string, Value>>;
}

const KEY = 'hotel100.workbook.v1';
let book: Book = { v: 1, data: {} };
let loaded = false;
const listeners = new Set<() => void>();
let version = 0;

function load() {
  if (loaded || typeof window === 'undefined') return;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    if (parsed && parsed.v === 1 && parsed.data && typeof parsed.data === 'object') book = parsed;
  } catch {
    /* start empty */
  }
  window.addEventListener('storage', (e) => {
    if (e.key !== KEY) return;
    try {
      book = e.newValue ? JSON.parse(e.newValue) : { v: 1, data: {} };
    } catch {
      book = { v: 1, data: {} };
    }
    bump();
  });
}

function bump() {
  version++;
  listeners.forEach((l) => l());
}

let saveTimer: ReturnType<typeof setTimeout> | null = null;
function save() {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(book));
    } catch {
      /* in-memory only */
    }
  }, 250);
}

export function wbGet(chapter: string, key: string): Value | undefined {
  load();
  return book.data[chapter]?.[key];
}

export function wbSet(chapter: string, key: string, value: Value, notify = true) {
  load();
  const ch = { ...(book.data[chapter] ?? {}) };
  if (value === '' || value === false) delete ch[key];
  else ch[key] = value;
  book = { ...book, data: { ...book.data, [chapter]: ch } };
  save();
  if (notify) bump();
}

export function wbChapter(chapter: string): Record<string, Value> {
  load();
  return book.data[chapter] ?? {};
}

export function wbReset() {
  book = { v: 1, data: {} };
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
  bump();
}

function subscribe(cb: () => void) {
  load();
  listeners.add(cb);
  return () => listeners.delete(cb);
}

/** Re-renders when anything in the workbook changes. */
export function useWorkbookVersion() {
  return useSyncExternalStore(
    subscribe,
    () => version,
    () => 0,
  );
}

/* ------------------------------------------------------------------ */
/* Focus timer — one at a time, survives reloads                       */
/* ------------------------------------------------------------------ */

export interface TimerState {
  label: string;
  total: number; // seconds
  endsAt: number | null; // running
  remaining: number; // seconds, when paused
  chapter: string;
}

const TKEY = 'hotel100.timer.v1';
let timer: TimerState | null = null;
let timerLoaded = false;
const timerListeners = new Set<() => void>();

function loadTimer() {
  if (timerLoaded || typeof window === 'undefined') return;
  timerLoaded = true;
  try {
    const raw = window.localStorage.getItem(TKEY);
    timer = raw ? JSON.parse(raw) : null;
  } catch {
    timer = null;
  }
}
function setTimer(t: TimerState | null) {
  timer = t;
  try {
    if (t) window.localStorage.setItem(TKEY, JSON.stringify(t));
    else window.localStorage.removeItem(TKEY);
  } catch {
    /* ignore */
  }
  timerListeners.forEach((l) => l());
}

export function useTimer(): TimerState | null {
  return useSyncExternalStore(
    (cb) => {
      loadTimer();
      timerListeners.add(cb);
      return () => timerListeners.delete(cb);
    },
    () => {
      loadTimer();
      return timer;
    },
    () => null,
  );
}

export const focusTimer = {
  start(chapter: string, label: string, minutes: number) {
    const total = Math.max(1, Math.round(minutes * 60));
    setTimer({ chapter, label, total, endsAt: Date.now() + total * 1000, remaining: total });
  },
  pause() {
    if (!timer || timer.endsAt == null) return;
    setTimer({ ...timer, remaining: Math.max(0, Math.round((timer.endsAt - Date.now()) / 1000)), endsAt: null });
  },
  resume() {
    if (!timer || timer.endsAt != null) return;
    setTimer({ ...timer, endsAt: Date.now() + timer.remaining * 1000 });
  },
  stop() {
    setTimer(null);
  },
};
