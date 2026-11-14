'use client';

import { useSyncExternalStore } from 'react';

export type Status = 'not_started' | 'in_progress' | 'completed';

export interface ChapterProgress {
  status: Status;
  updatedAt: number;
  /** 0..1 — how far the reader scrolled, used by "Continue Learning". */
  scroll?: number;
}

export interface ProgressState {
  version: 1;
  chapters: Record<string, ChapterProgress>;
  lastVisited: string | null;
}

const KEY = 'hotel100.progress.v1';
const EMPTY: ProgressState = { version: 1, chapters: {}, lastVisited: null };

let state: ProgressState = EMPTY;
let loaded = false;
let storageOk = true;
const listeners = new Set<() => void>();

function sanitize(raw: unknown): ProgressState {
  if (!raw || typeof raw !== 'object') return EMPTY;
  const r = raw as Partial<ProgressState>;
  const chapters: Record<string, ChapterProgress> = {};
  if (r.chapters && typeof r.chapters === 'object') {
    for (const [id, v] of Object.entries(r.chapters)) {
      if (!/^\d{2}$/.test(id) || !v || typeof v !== 'object') continue;
      const s = (v as ChapterProgress).status;
      if (s !== 'in_progress' && s !== 'completed' && s !== 'not_started') continue;
      const scroll = Number((v as ChapterProgress).scroll);
      chapters[id] = {
        status: s,
        updatedAt: Number((v as ChapterProgress).updatedAt) || 0,
        ...(Number.isFinite(scroll) ? { scroll: Math.min(1, Math.max(0, scroll)) } : {}),
      };
    }
  }
  const lv = typeof r.lastVisited === 'string' && /^\d{2}$/.test(r.lastVisited) ? r.lastVisited : null;
  return { version: 1, chapters, lastVisited: lv };
}

function load() {
  if (loaded || typeof window === 'undefined') return;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    state = raw ? sanitize(JSON.parse(raw)) : EMPTY;
  } catch {
    storageOk = false;
    state = EMPTY;
  }
  window.addEventListener('storage', (e) => {
    if (e.key !== KEY) return;
    try {
      state = e.newValue ? sanitize(JSON.parse(e.newValue)) : EMPTY;
    } catch {
      state = EMPTY;
    }
    emit();
  });
}

function emit() {
  listeners.forEach((l) => l());
}

function persist(next: ProgressState) {
  state = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
    storageOk = true;
  } catch {
    storageOk = false; // private mode / quota: keep working in memory
  }
  emit();
}

function subscribe(cb: () => void) {
  load();
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function getProgress(): ProgressState {
  load();
  return state;
}

export function useProgress(): ProgressState {
  return useSyncExternalStore(subscribe, getProgress, () => EMPTY);
}

/** True once the client store has been read (avoids flashing "0 completed" during hydration). */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export function isStorageAvailable() {
  load();
  return storageOk;
}

export function statusOf(p: ProgressState, id: string): Status {
  return p.chapters[id]?.status ?? 'not_started';
}

export function visitChapter(id: string) {
  const cur = getProgress();
  const prev = cur.chapters[id];
  persist({
    ...cur,
    lastVisited: id,
    chapters: {
      ...cur.chapters,
      [id]: { ...prev, status: prev?.status === 'completed' ? 'completed' : 'in_progress', updatedAt: Date.now() },
    },
  });
}

export function setStatus(id: string, status: Status) {
  const cur = getProgress();
  persist({
    ...cur,
    chapters: { ...cur.chapters, [id]: { ...cur.chapters[id], status, updatedAt: Date.now() } },
  });
}

let scrollTimer: ReturnType<typeof setTimeout> | null = null;
export function saveScroll(id: string, ratio: number) {
  if (scrollTimer) clearTimeout(scrollTimer);
  scrollTimer = setTimeout(() => {
    const cur = getProgress();
    const prev = cur.chapters[id];
    if (!prev) return;
    // write silently (no re-render storm): update state and storage only
    state = { ...cur, chapters: { ...cur.chapters, [id]: { ...prev, scroll: ratio } } };
    try {
      window.localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* in-memory only */
    }
  }, 400);
}

export function resetProgress() {
  persist(EMPTY);
}

export function completedCount(p: ProgressState, ids: string[]) {
  return ids.filter((id) => p.chapters[id]?.status === 'completed').length;
}

/* ---------- session-only navigation context (hotel scroll, resume intent) ---------- */

const SS = {
  hotelScroll: 'hotel100.hotelScroll',
  resume: 'hotel100.resume',
  focus: 'hotel100.focusWindow',
  celebrate: 'hotel100.celebrate',
};

function ssGet(k: string): string | null {
  try {
    return window.sessionStorage.getItem(k);
  } catch {
    return null;
  }
}
function ssSet(k: string, v: string | null) {
  try {
    if (v == null) window.sessionStorage.removeItem(k);
    else window.sessionStorage.setItem(k, v);
  } catch {
    /* ignore */
  }
}

export const nav = {
  saveHotelScroll: (ratio: number) => ssSet(SS.hotelScroll, String(ratio)),
  hotelScroll: () => {
    const v = Number(ssGet(SS.hotelScroll));
    return Number.isFinite(v) && ssGet(SS.hotelScroll) != null ? v : null;
  },
  setResume: (id: string | null) => ssSet(SS.resume, id),
  takeResume: () => {
    const v = ssGet(SS.resume);
    ssSet(SS.resume, null);
    return v;
  },
  setFocusWindow: (id: string | null) => ssSet(SS.focus, id),
  takeFocusWindow: () => {
    const v = ssGet(SS.focus);
    ssSet(SS.focus, null);
    return v;
  },
  setCelebrate: (id: string | null) => ssSet(SS.celebrate, id),
  takeCelebrate: () => {
    const v = ssGet(SS.celebrate);
    ssSet(SS.celebrate, null);
    return v;
  },
};
