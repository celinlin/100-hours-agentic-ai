'use client';

/**
 * Gaspard, the hotel concierge: a small companion that guides without taking over.
 * Rooms tell him what the learner is looking at (a hint in two levels); he listens to
 * successes and mistakes through the sound events, whether sound is on or off.
 */

import { useSyncExternalStore } from 'react';
import type { Lang } from '../lib/i18n';

export interface CompanionContext {
  /** level 1: the everyday analogy */
  nudge?: string;
  /** level 2: the idea to hold on to */
  key?: string;
}

interface State {
  ctx: CompanionContext | null;
  /** a line to say now, with an id so the bubble re-animates */
  line: { id: number; text: string; mood: Mood } | null;
}
export type Mood = 'calm' | 'pleased' | 'concerned' | 'thinking';

let state: State = { ctx: null, line: null };
let seq = 0;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export const companion = {
  setContext(ctx: CompanionContext | null) {
    state = { ...state, ctx };
    emit();
  },
  say(text: string, mood: Mood = 'calm') {
    state = { ...state, line: { id: ++seq, text, mood } };
    emit();
  },
  hush() {
    if (!state.line) return;
    state = { ...state, line: null };
    emit();
  },
};

export function useCompanion(): State {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => state,
    () => state,
  );
}

export const LINES: Record<Lang, { success: string[]; mistake: string[]; offer: string; nothing: string; name: string; role: string }> = {
  fr: {
    success: ['Bien vu.', 'Exactement.', 'C’est ça.', 'Proprement fait.', 'Parfait.'],
    mistake: ['Regarde ce qui s’est passé.', 'Presque. Relis l’effet.', 'Ça arrive. On réessaie.'],
    offer: 'Un indice ? Touche-moi.',
    nothing: 'Choisis un objet de la pièce, je te guide.',
    name: 'Gaspard',
    role: 'concierge',
  },
  en: {
    success: ['Well spotted.', 'Exactly.', 'That’s it.', 'Neatly done.', 'Perfect.'],
    mistake: ['Look at what happened.', 'Almost. Read the effect.', 'It happens. Try again.'],
    offer: 'A hint? Tap me.',
    nothing: 'Pick an object in the room, I’ll guide you.',
    name: 'Gaspard',
    role: 'concierge',
  },
};
