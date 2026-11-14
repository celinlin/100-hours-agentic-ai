'use client';

/**
 * A small sound identity synthesised with Web Audio — no audio files, so no licensing question.
 * Brass, felt and glass: soft clicks, a latch, two-note chimes. Off by default; nothing plays
 * before the learner switches sound on (which is itself a user gesture that unlocks the context).
 */

import { useSyncExternalStore } from 'react';

export type Sfx = 'tick' | 'place' | 'correct' | 'wrong' | 'solve' | 'open' | 'close' | 'unlock' | 'latch';

const KEY = 'hotel100.sound.v1';
let enabled = false;
let loaded = false;
let ctx: AudioContext | null = null;
let master: GainNode | null = null;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === 'undefined') return;
  loaded = true;
  try {
    enabled = window.localStorage.getItem(KEY) === 'on';
  } catch {
    enabled = false;
  }
}

function ensureCtx() {
  if (!enabled || typeof window === 'undefined') return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.22;
    master.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
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
    ensureCtx();
    sfx('latch');
  }
  listeners.forEach((l) => l());
}

export function useSound(): boolean {
  return useSyncExternalStore(
    (cb) => {
      load();
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => {
      load();
      return enabled;
    },
    () => false,
  );
}

function tone(c: AudioContext, freq: number, start: number, dur: number, type: OscillatorType, gain: number) {
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, start);
  g.gain.setValueAtTime(0.0001, start);
  g.gain.exponentialRampToValueAtTime(gain, start + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  o.connect(g);
  g.connect(master!);
  o.start(start);
  o.stop(start + dur + 0.02);
}

function noise(c: AudioContext, start: number, dur: number, freq: number, gain: number) {
  const len = Math.max(1, Math.floor(c.sampleRate * dur));
  const buf = c.createBuffer(1, len, c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 2;
  const src = c.createBufferSource();
  src.buffer = buf;
  const f = c.createBiquadFilter();
  f.type = 'bandpass';
  f.frequency.value = freq;
  f.Q.value = 1.4;
  const g = c.createGain();
  g.gain.value = gain;
  src.connect(f);
  f.connect(g);
  g.connect(master!);
  src.start(start);
}

export function sfx(name: Sfx) {
  load();
  const c = ensureCtx();
  if (!c || !master) return;
  const t = c.currentTime + 0.005;
  switch (name) {
    case 'tick':
      noise(c, t, 0.03, 3200, 0.5);
      break;
    case 'place':
      noise(c, t, 0.05, 1400, 0.7);
      tone(c, 220, t, 0.08, 'sine', 0.12);
      break;
    case 'latch':
      noise(c, t, 0.04, 2400, 0.6);
      noise(c, t + 0.07, 0.05, 1200, 0.6);
      break;
    case 'correct':
      tone(c, 784, t, 0.35, 'sine', 0.22);
      tone(c, 1175, t + 0.07, 0.45, 'sine', 0.14);
      break;
    case 'wrong':
      tone(c, 196, t, 0.18, 'triangle', 0.2);
      tone(c, 175, t + 0.06, 0.22, 'triangle', 0.14);
      break;
    case 'solve':
      [523, 659, 784].forEach((f, i) => tone(c, f, t + i * 0.08, 0.55, 'sine', 0.18));
      break;
    case 'open':
      noise(c, t, 0.18, 900, 0.35);
      tone(c, 392, t + 0.05, 0.5, 'sine', 0.1);
      break;
    case 'close':
      noise(c, t, 0.12, 700, 0.35);
      break;
    case 'unlock':
      noise(c, t, 0.05, 2600, 0.6);
      [392, 523, 659, 1047].forEach((f, i) => tone(c, f, t + 0.1 + i * 0.11, 0.9, 'sine', 0.16));
      break;
  }
}
