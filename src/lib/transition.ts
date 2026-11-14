'use client';

/**
 * A tiny veil system shared by the hotel and the reading room.
 * It survives route changes because the <Veil/> element lives in the [lang] layout.
 */

type Listener = (cmd: VeilCommand) => void;

export type VeilCommand =
  | { type: 'enter'; rect: DOMRect | null; href: string }
  | { type: 'leave'; href: string }
  | { type: 'reveal' };

const listeners = new Set<Listener>();

export function onVeil(l: Listener) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

export function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Window → chapter: light grows out of the clicked window into the reading room. */
export function enterChapter(rect: DOMRect | null, href: string) {
  listeners.forEach((l) => l({ type: 'enter', rect, href }));
}

/** Reading room → hotel: a short dusk veil. */
export function leaveToHotel(href: string) {
  listeners.forEach((l) => l({ type: 'leave', href }));
}

/** Called by a page once it has mounted, to lift the veil. */
export function revealPage() {
  listeners.forEach((l) => l({ type: 'reveal' }));
}

/** Plain left-click without modifiers — the only case we intercept. */
export function isPlainClick(e: { button: number; metaKey: boolean; ctrlKey: boolean; shiftKey: boolean; altKey: boolean }) {
  return e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;
}
