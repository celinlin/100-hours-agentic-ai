'use client';

/**
 * Sound effects, synthesised with Web Audio (no audio files: nothing to load, no path that can
 * break under GitHub Pages, no licence question).
 *
 * Why the first version was inaudible (audit):
 *  1. Level. Master gain 0.22 × voice gains 0.1–0.22 put peaks around −26 dBFS, and several
 *     effects were 30 ms noise bursts. On phone and laptop speakers that is next to nothing.
 *     → Voices are now mixed around −12 dBFS before the user volume, behind a limiter.
 *  2. iOS. Web Audio follows the ringer switch: with the phone on silent, nothing plays.
 *     → When sound is switched on we ask for the "playback" audio session where the browser
 *       supports it (Safari 17+), and we say so in the UI where it does not.
 *  3. Suspended context. A context created outside a tap (e.g. a sound fired from a timer
 *     after a reload) stays suspended. → The context is created and resumed inside the tap
 *     that enables sound, and resumed again on every later gesture (also covers iOS
 *     "interrupted" state after the app goes to the background).
 *
 * Off by default. Nothing plays before the learner turns sound on.
 */

import { useSyncExternalStore } from 'react';

export type Sfx = 'tick' | 'select' | 'place' | 'correct' | 'wrong' | 'solve' | 'open' | 'enter' | 'close' | 'unlock' | 'latch';

const KEY = 'hotel100.sound.v1';
const VOL_KEY = 'hotel100.sound.volume';
let enabled = false;
let volume = 0.8;
let loaded = false;
let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let lastError: string | null = null;
const listeners = new Set<() => void>();
const lastPlayed: Partial<Record<Sfx, number>> = {};
let snapshot = { on: false, volume: 0.8, state: 'off' as string, error: null as string | null };

function emit() {
  snapshot = { on: enabled, volume, state: !enabled ? 'off' : ctx ? ctx.state : 'idle', error: lastError };
  listeners.forEach((l) => l());
}

function load() {
  if (loaded || typeof window === 'undefined') return;
  loaded = true;
  try {
    enabled = window.localStorage.getItem(KEY) === 'on';
    const v = Number(window.localStorage.getItem(VOL_KEY));
    if (Number.isFinite(v) && v > 0 && v <= 1) volume = v;
  } catch {
    enabled = false;
  }
  snapshot = { on: enabled, volume, state: enabled ? 'idle' : 'off', error: null };
  // any gesture (re)starts a suspended or interrupted context
  const wake = () => {
    if (enabled) ensureCtx();
  };
  window.addEventListener('pointerdown', wake, { passive: true });
  window.addEventListener('keydown', wake, { passive: true });
  window.addEventListener('touchend', wake, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && enabled && ctx && ctx.state !== 'running') void ctx.resume().catch(() => {});
  });
}

function ensureCtx(): AudioContext | null {
  if (!enabled || typeof window === 'undefined') return null;
  try {
    if (!ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) {
        lastError = 'no-webaudio';
        emit();
        return null;
      }
      // iOS: play even when the ringer switch is on silent (Safari 17+)
      const session = (navigator as unknown as { audioSession?: { type: string } }).audioSession;
      if (session) {
        try {
          session.type = 'playback';
        } catch {
          /* older Safari: Web Audio follows the ringer switch */
        }
      }
      ctx = new AC({ latencyHint: 'interactive' });
      const limiter = ctx.createDynamicsCompressor();
      limiter.threshold.value = -6;
      limiter.knee.value = 6;
      limiter.ratio.value = 12;
      limiter.attack.value = 0.002;
      limiter.release.value = 0.12;
      master = ctx.createGain();
      master.gain.value = volume;
      master.connect(limiter);
      limiter.connect(ctx.destination);
      ctx.onstatechange = () => emit();
    }
    if (ctx.state !== 'running') {
      void ctx
        .resume()
        .then(() => emit())
        .catch((e) => {
          lastError = String(e?.name ?? e);
          emit();
        });
    }
    return ctx;
  } catch (e) {
    lastError = String((e as Error)?.name ?? e);
    emit();
    return null;
  }
}

/* ------------------------------------------------------------------ */
/* Voices — written against BaseAudioContext so they can be rendered    */
/* offline and measured (see renderSfx).                                */
/* ------------------------------------------------------------------ */

type Ctx = BaseAudioContext;

/** A soft mallet / bell note: sine with a quiet upper partial, fast attack, natural decay. */
function note(c: Ctx, out: AudioNode, freq: number, t: number, dur: number, level: number, partial = 0.22) {
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(level, t + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  const o = c.createOscillator();
  o.type = 'sine';
  o.frequency.setValueAtTime(freq, t);
  o.connect(g);
  if (partial > 0) {
    const o2 = c.createOscillator();
    o2.type = 'sine';
    o2.frequency.setValueAtTime(freq * 3, t);
    const g2 = c.createGain();
    g2.gain.setValueAtTime(partial, t);
    g2.gain.exponentialRampToValueAtTime(0.001, t + dur * 0.4);
    o2.connect(g2);
    g2.connect(g);
    o2.start(t);
    o2.stop(t + dur + 0.02);
  }
  g.connect(out);
  o.start(t);
  o.stop(t + dur + 0.02);
}

/** A wooden / brass click: a very short pitched thump plus a filtered noise transient. */
function click(c: Ctx, out: AudioNode, t: number, pitch: number, level: number, bright = 2400) {
  note(c, out, pitch, t, 0.09, level, 0);
  const len = Math.max(1, Math.floor(c.sampleRate * 0.04));
  const buf = c.createBuffer(1, len, c.sampleRate);
  const d = buf.getChannelData(0);
  let seed = 1234567;
  for (let i = 0; i < len; i++) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    d[i] = ((seed / 4294967296) * 2 - 1) * (1 - i / len) ** 3;
  }
  const src = c.createBufferSource();
  src.buffer = buf;
  const f = c.createBiquadFilter();
  f.type = 'bandpass';
  f.frequency.value = bright;
  f.Q.value = 0.9;
  const g = c.createGain();
  g.gain.value = level * 1.6;
  src.connect(f);
  f.connect(g);
  g.connect(out);
  src.start(t);
}

/** An airy sweep, for doors and curtains. */
function sweep(c: Ctx, out: AudioNode, t: number, dur: number, from: number, to: number, level: number) {
  const len = Math.floor(c.sampleRate * dur);
  const buf = c.createBuffer(1, len, c.sampleRate);
  const d = buf.getChannelData(0);
  let seed = 987654;
  for (let i = 0; i < len; i++) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    d[i] = (seed / 4294967296) * 2 - 1;
  }
  const src = c.createBufferSource();
  src.buffer = buf;
  const f = c.createBiquadFilter();
  f.type = 'bandpass';
  f.Q.value = 1.2;
  f.frequency.setValueAtTime(from, t);
  f.frequency.exponentialRampToValueAtTime(to, t + dur);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(level, t + dur * 0.35);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f);
  f.connect(g);
  g.connect(out);
  src.start(t);
}

/** All effects, at a common loudness (peaks ≈ −12 dBFS before the user volume). */
function voice(name: Sfx, c: Ctx, out: AudioNode, t: number) {
  switch (name) {
    case 'tick':
      click(c, out, t, 520, 0.2, 3000);
      break;
    case 'select':
      note(c, out, 660, t, 0.22, 0.24);
      break;
    case 'place':
      click(c, out, t, 300, 0.26, 1500);
      break;
    case 'latch':
      click(c, out, t, 420, 0.22, 2200);
      click(c, out, t + 0.08, 300, 0.2, 1400);
      break;
    case 'correct':
      note(c, out, 784, t, 0.4, 0.22);
      note(c, out, 1175, t + 0.09, 0.5, 0.2);
      break;
    case 'wrong':
      note(c, out, 233, t, 0.22, 0.26, 0.05);
      note(c, out, 196, t + 0.11, 0.3, 0.24, 0.05);
      break;
    case 'solve':
      [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => note(c, out, f, t + i * 0.085, 0.6, 0.18));
      break;
    case 'open':
      sweep(c, out, t, 0.32, 500, 2200, 0.22);
      note(c, out, 392, t + 0.1, 0.5, 0.16);
      break;
    case 'enter':
      sweep(c, out, t, 0.5, 300, 1600, 0.18);
      note(c, out, 523.25, t + 0.18, 0.7, 0.16);
      note(c, out, 783.99, t + 0.3, 0.8, 0.14);
      break;
    case 'close':
      sweep(c, out, t, 0.2, 1600, 500, 0.18);
      click(c, out, t + 0.16, 240, 0.2, 1000);
      break;
    case 'unlock':
      click(c, out, t, 360, 0.24, 2000);
      click(c, out, t + 0.1, 480, 0.22, 2600);
      [392, 523.25, 659.25, 783.99, 1046.5].forEach((f, i) => note(c, out, f, t + 0.24 + i * 0.1, 1.0, 0.16));
      break;
  }
}

const MIN_GAP: Partial<Record<Sfx, number>> = { tick: 0.05, select: 0.08, place: 0.06 };

export function sfx(name: Sfx) {
  load();
  const c = ensureCtx();
  if (!c || !master) return;
  // avoid piling up the same effect (rapid taps, repeated renders)
  const now = c.currentTime;
  const last = lastPlayed[name];
  if (last !== undefined && now - last < (MIN_GAP[name] ?? 0.12)) return;
  lastPlayed[name] = now;
  try {
    voice(name, c, master, now + 0.01);
  } catch (e) {
    lastError = String((e as Error)?.name ?? e);
    emit();
  }
}

export function setSound(on: boolean) {
  load();
  enabled = on;
  try {
    window.localStorage.setItem(KEY, on ? 'on' : 'off');
  } catch {
    /* preference not remembered */
  }
  if (on) {
    ensureCtx(); // inside the user's tap: creates and resumes the context
    sfx('correct');
  } else if (ctx && ctx.state === 'running') {
    void ctx.suspend().catch(() => {});
  }
  emit();
}

export function setSoundVolume(v: number) {
  load();
  volume = Math.min(1, Math.max(0.05, v));
  try {
    window.localStorage.setItem(VOL_KEY, String(volume));
  } catch {
    /* not remembered */
  }
  if (ctx && master) master.gain.setTargetAtTime(volume, ctx.currentTime, 0.02);
  emit();
}

/** The "test the sound" button. */
export function testSound() {
  if (!enabled) return;
  delete lastPlayed.solve;
  sfx('solve');
}

export function useSound(): boolean {
  return useSoundState().on;
}

export function useSoundState() {
  return useSyncExternalStore(
    (cb) => {
      load();
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => {
      load();
      return snapshot;
    },
    () => ({ on: false, volume: 0.8, state: 'off', error: null as string | null }),
  );
}

/** Offline render of one effect, used to measure real levels (QA). */
export async function renderSfx(name: Sfx): Promise<{ peak: number; peakDb: number; rms: number; seconds: number }> {
  const sr = 44100;
  const oc = new OfflineAudioContext(1, sr * 2, sr);
  voice(name, oc, oc.destination, 0.01);
  const buf = await oc.startRendering();
  const d = buf.getChannelData(0);
  let peak = 0;
  let sum = 0;
  let lastLoud = 0;
  for (let i = 0; i < d.length; i++) {
    const a = Math.abs(d[i]);
    if (a > peak) peak = a;
    sum += a * a;
    if (a > 0.003) lastLoud = i;
  }
  return { peak, peakDb: 20 * Math.log10(peak || 1e-9), rms: Math.sqrt(sum / Math.max(1, lastLoud)), seconds: lastLoud / sr };
}

if (typeof window !== 'undefined') {
  (window as unknown as { __hotelSound?: unknown }).__hotelSound = { renderSfx, state: () => snapshot };
}
