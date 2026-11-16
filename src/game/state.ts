'use client';

/**
 * Learning progress v2: stations solved, challenge passed, unlocks.
 * Rule: every chapter is open from the start; passing a chapter's final challenge completes it.
 * Migration from v1 (self-declared "completed"): those chapters and the one after them stay
 * open (nothing the learner had access to is taken away), but "completed" now requires the challenge.
 */

import { useSyncExternalStore } from 'react';

export type WindowState = 'locked' | 'available' | 'in_progress' | 'completed';

export interface ChapterState {
  stations: string[];
  challenge: boolean;
  visited?: boolean;
  completedAt?: number;
}

export interface GameState {
  v: 2;
  chapters: Record<string, ChapterState>;
  legacyUnlocked: string[];
  current: string | null;
  /** last station opened per chapter, for "continue where I left off" */
  resume: Record<string, string>;
}

const KEY = 'hotel100.game.v2';
const V1 = 'hotel100.progress.v1';
const EMPTY: GameState = { v: 2, chapters: {}, legacyUnlocked: [], current: null, resume: {} };

let state: GameState = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function sanitize(raw: unknown): GameState {
  if (!raw || typeof raw !== 'object' || (raw as GameState).v !== 2) return EMPTY;
  const r = raw as GameState;
  const chapters: Record<string, ChapterState> = {};
  for (const [id, c] of Object.entries(r.chapters ?? {})) {
    if (!/^(\d{2}|lab)$/.test(id) || !c || typeof c !== 'object') continue;
    chapters[id] = {
      stations: Array.isArray(c.stations) ? c.stations.filter((s) => typeof s === 'string') : [],
      challenge: c.challenge === true,
      visited: c.visited === true,
      ...(typeof c.completedAt === 'number' ? { completedAt: c.completedAt } : {}),
    };
  }
  return {
    v: 2,
    chapters,
    legacyUnlocked: Array.isArray(r.legacyUnlocked) ? r.legacyUnlocked.filter((s) => /^\d{2}$/.test(s)) : [],
    current: typeof r.current === 'string' ? r.current : null,
    resume: r.resume && typeof r.resume === 'object' ? r.resume : {},
  };
}

function migrateFromV1(): GameState | null {
  try {
    const raw = window.localStorage.getItem(V1);
    if (!raw) return null;
    const v1 = JSON.parse(raw) as { chapters?: Record<string, { status?: string }>; lastVisited?: string | null };
    const legacy = new Set<string>();
    const chapters: Record<string, ChapterState> = {};
    for (const [id, c] of Object.entries(v1.chapters ?? {})) {
      if (!/^\d{2}$/.test(id)) continue;
      if (c?.status === 'completed') {
        legacy.add(id);
        legacy.add(String(Number(id) + 1).padStart(2, '0'));
      }
      if (c?.status === 'in_progress' || c?.status === 'completed') {
        legacy.add(id);
        chapters[id] = { stations: [], challenge: false, visited: true };
      }
    }
    return { v: 2, chapters, legacyUnlocked: [...legacy], current: v1.lastVisited ?? null, resume: {} };
  } catch {
    return null;
  }
}

function load() {
  if (loaded || typeof window === 'undefined') return;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) state = sanitize(JSON.parse(raw));
    else {
      const m = migrateFromV1();
      if (m) {
        state = m;
        window.localStorage.setItem(KEY, JSON.stringify(m));
      }
    }
  } catch {
    state = EMPTY;
  }
  window.addEventListener('storage', (e) => {
    if (e.key !== KEY) return;
    try {
      state = e.newValue ? sanitize(JSON.parse(e.newValue)) : EMPTY;
    } catch {
      state = EMPTY;
    }
    listeners.forEach((l) => l());
  });
}

function commit(next: GameState) {
  state = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* private mode: keep in memory */
  }
  listeners.forEach((l) => l());
}

export function getGame(): GameState {
  load();
  return state;
}

export function useGame(): GameState {
  return useSyncExternalStore(
    (cb) => {
      load();
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    getGame,
    () => EMPTY,
  );
}

function chapter(s: GameState, id: string): ChapterState {
  return s.chapters[id] ?? { stations: [], challenge: false };
}

/** Every window is open: the learner chooses where to go. Challenges complete a room, they no longer gate the next one. */
export function isUnlocked(_s: GameState, ids: string[], id: string): boolean {
  return ids.includes(id) || id === '00' || id === 'lab';
}

export function windowState(s: GameState, ids: string[], id: string): WindowState {
  if (!isUnlocked(s, ids, id)) return 'locked';
  const c = chapter(s, id);
  if (c.challenge) return 'completed';
  if (c.visited || c.stations.length) return 'in_progress';
  return 'available';
}

/** First unlocked chapter that is not completed, else the last one. */
export function nextUp(s: GameState, ids: string[]): string {
  return ids.find((id) => isUnlocked(s, ids, id) && !chapter(s, id).challenge) ?? ids[ids.length - 1];
}

export function markVisited(id: string) {
  const s = getGame();
  const c = chapter(s, id);
  commit({ ...s, current: id, chapters: { ...s.chapters, [id]: { ...c, visited: true } } });
}

export function solveStation(id: string, station: string) {
  const s = getGame();
  const c = chapter(s, id);
  if (c.stations.includes(station)) return;
  commit({ ...s, chapters: { ...s.chapters, [id]: { ...c, visited: true, stations: [...c.stations, station] } } });
}

export function setResume(id: string, station: string) {
  const s = getGame();
  commit({ ...s, current: id, resume: { ...s.resume, [id]: station } });
}

export function passChallenge(id: string) {
  const s = getGame();
  const c = chapter(s, id);
  commit({ ...s, chapters: { ...s.chapters, [id]: { ...c, visited: true, challenge: true, completedAt: c.completedAt ?? Date.now() } } });
}

export function resetGame() {
  commit(EMPTY);
}

/* ---------- one-shot navigation hints (session only) ---------- */

function ss(k: string, v?: string | null) {
  try {
    if (v === undefined) return window.sessionStorage.getItem(k);
    if (v === null) window.sessionStorage.removeItem(k);
    else window.sessionStorage.setItem(k, v);
  } catch {
    /* ignore */
  }
  return null;
}

export const travel = {
  /** the window we zoomed into; the façade zooms back out from it */
  setFrom: (id: string) => ss('hotel100.zoomFrom', id),
  takeFrom: () => {
    const v = ss('hotel100.zoomFrom');
    ss('hotel100.zoomFrom', null);
    return v;
  },
  /** a chapter just unlocked: the façade plays the unlock on that window */
  setUnlocked: (id: string) => ss('hotel100.justUnlocked', id),
  takeUnlocked: () => {
    const v = ss('hotel100.justUnlocked');
    ss('hotel100.justUnlocked', null);
    return v;
  },
};
