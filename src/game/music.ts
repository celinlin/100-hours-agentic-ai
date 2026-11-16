'use client';

/**
 * Focus music, generated live with Web Audio — no audio file, no licence question.
 * Five ambiances, all slow and soft, original by construction (the notes are computed here):
 *  - "salon": warm pads on a slow seventh-chord progression, a few sparse piano notes;
 *  - "piano": minimalist piano alone — a bass note, then two chord tones, a lot of air;
 *  - "lofi": muted electric-piano chords, a very soft kick and brush, a little tape crackle;
 *  - "pluie": the pads, quieter, under soft rain;
 *  - "nuit": a low drone and distant notes, for deep work.
 * Levels are measured (see `music.measure`), not guessed: ≈ −19 to −22 dBFS RMS at the default volume (was ≈ −33: too quiet).
 * Off by default. It plays only after the learner presses play (a user gesture); the
 * preference is remembered and resumes on the next interaction, never on its own.
 * The engine is a module singleton, so it keeps playing across client-side navigation.
 */

import { useSyncExternalStore } from 'react';

export type Mood = 'salon' | 'piano' | 'lofi' | 'pluie' | 'nuit';
export const MOODS: Mood[] = ['salon', 'piano', 'lofi', 'pluie', 'nuit'];

interface Prefs {
  on: boolean;
  mood: Mood;
  volume: number; // 0..1
}

const KEY = 'hotel100.music.v1';
let prefs: Prefs = { on: false, mood: 'salon', volume: 0.45 };
let playing = false;
let loaded = false;
const listeners = new Set<() => void>();
let snapshot = { ...prefs, playing };

let ctx: AudioContext | null = null;
let out: GainNode | null = null; // volume
let bus: GainNode | null = null; // fades
let reverb: ConvolverNode | null = null;
let analyser: AnalyserNode | null = null;
let crackle: { src: AudioBufferSourceNode; gain: GainNode } | null = null;
let rain: { src: AudioBufferSourceNode; gain: GainNode } | null = null;
let timer: ReturnType<typeof setInterval> | null = null;
let nextBar = 0;
let bar = 0;

/** master gain at volume 1 — set from measurement, see music.measure() */
const MASTER = 2.4;
const BEAT = 60 / 56;
const BAR = BEAT * 4;

const midi = (n: number) => 440 * 2 ** ((n - 69) / 12);
// Fmaj7 · Em7 · Dm9 · Cmaj7 (voicings around middle C)
const PROGRESSION = [
  [53, 57, 60, 64],
  [52, 55, 59, 62],
  [50, 53, 57, 64],
  [48, 52, 55, 59],
];
const NIGHT = [
  [41, 48, 55],
  [40, 47, 55],
  [38, 45, 52],
  [36, 43, 52],
];

function emit() {
  snapshot = { ...prefs, playing };
  listeners.forEach((l) => l());
}

function load() {
  if (loaded || typeof window === 'undefined') return;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      const p = JSON.parse(raw) as Partial<Prefs>;
      prefs = {
        on: p.on === true,
        mood: MOODS.includes(p.mood as Mood) ? (p.mood as Mood) : 'salon',
        volume: typeof p.volume === 'number' ? Math.min(1, Math.max(0, p.volume)) : 0.45,
      };
    }
  } catch {
    /* defaults */
  }
  snapshot = { ...prefs, playing };
  // the preference resumes on the next interaction — never by itself
  if (prefs.on) {
    const resume = () => {
      window.removeEventListener('pointerdown', resume);
      window.removeEventListener('keydown', resume);
      if (prefs.on && !playing) start();
    };
    window.addEventListener('pointerdown', resume, { once: true });
    window.addEventListener('keydown', resume, { once: true });
  }
}

function save() {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(prefs));
  } catch {
    /* not remembered */
  }
}

function impulse(c: AudioContext, seconds: number, decay: number) {
  const len = Math.floor(c.sampleRate * seconds);
  const buf = c.createBuffer(2, len, c.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len) ** decay;
  }
  return buf;
}

function ensure() {
  if (ctx) return ctx;
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  out = ctx.createGain();
  out.gain.value = prefs.volume * MASTER;
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -20;
  comp.ratio.value = 3;
  bus = ctx.createGain();
  bus.gain.value = 0;
  reverb = ctx.createConvolver();
  reverb.buffer = impulse(ctx, 4.5, 2.6);
  const wet = ctx.createGain();
  wet.gain.value = 0.55;
  reverb.connect(wet);
  wet.connect(bus);
  bus.connect(comp);
  comp.connect(out);
  analyser = ctx.createAnalyser();
  analyser.fftSize = 2048;
  out.connect(analyser);
  out.connect(ctx.destination);
  return ctx;
}

/** A pad voice: two detuned oscillators through a slow low-pass, long attack and release. */
function pad(c: AudioContext, freq: number, t: number, dur: number, level: number) {
  const g = c.createGain();
  const f = c.createBiquadFilter();
  f.type = 'lowpass';
  f.frequency.setValueAtTime(700, t);
  f.frequency.linearRampToValueAtTime(1100, t + dur / 2);
  f.frequency.linearRampToValueAtTime(700, t + dur);
  f.Q.value = 0.4;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(level, t + 1.8);
  g.gain.setValueAtTime(level, t + dur - 0.4);
  g.gain.linearRampToValueAtTime(0.0001, t + dur + 2.6);
  for (const det of [-6, 7]) {
    const o = c.createOscillator();
    o.type = 'triangle';
    o.frequency.value = freq;
    o.detune.value = det;
    o.connect(f);
    o.start(t);
    o.stop(t + dur + 2.8);
  }
  f.connect(g);
  g.connect(bus!);
  g.connect(reverb!);
}

/** A soft piano-like note: sine + a quiet octave, quick attack, long decay, mostly reverb. */
function note(c: AudioContext, freq: number, t: number, level: number) {
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(level, t + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 3.2);
  const o1 = c.createOscillator();
  o1.type = 'sine';
  o1.frequency.value = freq;
  const o2 = c.createOscillator();
  o2.type = 'sine';
  o2.frequency.value = freq * 2;
  const g2 = c.createGain();
  g2.gain.value = 0.18;
  o1.connect(g);
  o2.connect(g2);
  g2.connect(g);
  const dry = c.createGain();
  dry.gain.value = 0.45;
  g.connect(dry);
  dry.connect(bus!);
  g.connect(reverb!);
  o1.start(t);
  o2.start(t);
  o1.stop(t + 3.4);
  o2.stop(t + 3.4);
}

function startRain(c: AudioContext, level: number) {
  if (rain) return;
  const len = c.sampleRate * 4;
  const buf = c.createBuffer(2, len, c.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    let last = 0;
    for (let i = 0; i < len; i++) {
      // pinkish noise with sparse droplets
      last = 0.97 * last + 0.03 * (Math.random() * 2 - 1);
      d[i] = last * 3 + (Math.random() < 0.0006 ? (Math.random() * 2 - 1) * 0.6 : 0);
    }
  }
  const src = c.createBufferSource();
  src.buffer = buf;
  src.loop = true;
  const hp = c.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = 400;
  const lp = c.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 5200;
  const gain = c.createGain();
  gain.gain.value = 0;
  gain.gain.linearRampToValueAtTime(level, c.currentTime + 3);
  src.connect(hp);
  hp.connect(lp);
  lp.connect(gain);
  gain.connect(bus!);
  src.start();
  rain = { src, gain };
}

function stopRain() {
  if (!rain || !ctx) return;
  const r = rain;
  rain = null;
  r.gain.gain.cancelScheduledValues(ctx.currentTime);
  r.gain.gain.setValueAtTime(r.gain.gain.value, ctx.currentTime);
  r.gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.5);
  r.src.stop(ctx.currentTime + 1.6);
}

/** A felt-piano note: three partials, soft hammer, natural decay that shortens with pitch. */
function key(c: AudioContext, n: number, t: number, level: number) {
  const freq = midi(n);
  const dur = Math.max(1.6, 5.2 - (n - 36) * 0.07);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(level, t + 0.008);
  g.gain.exponentialRampToValueAtTime(level * 0.35, t + 0.35);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  const lp = c.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.setValueAtTime(Math.min(5200, freq * 7), t);
  lp.frequency.exponentialRampToValueAtTime(Math.min(1800, freq * 2.5), t + 0.9);
  [
    [1, 1, 'triangle'],
    [2.003, 0.32, 'sine'],
    [3.01, 0.1, 'sine'],
  ].forEach(([mult, amp, type]) => {
    const o = c.createOscillator();
    o.type = type as OscillatorType;
    o.frequency.value = freq * (mult as number);
    const a = c.createGain();
    a.gain.value = amp as number;
    o.connect(a);
    a.connect(lp);
    o.start(t);
    o.stop(t + dur + 0.1);
  });
  lp.connect(g);
  const dry = c.createGain();
  dry.gain.value = 0.7;
  g.connect(dry);
  dry.connect(bus!);
  g.connect(reverb!);
}

/** A muted electric-piano chord tone with a slow tape wobble. */
function rhodes(c: AudioContext, n: number, t: number, dur: number, level: number) {
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(level, t + 0.03);
  g.gain.exponentialRampToValueAtTime(level * 0.4, t + dur * 0.6);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.6);
  const lp = c.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 1300;
  const o = c.createOscillator();
  o.type = 'triangle';
  o.frequency.value = midi(n);
  const wob = c.createOscillator();
  wob.frequency.value = 0.6;
  const wobGain = c.createGain();
  wobGain.gain.value = 5; // cents
  wob.connect(wobGain);
  wobGain.connect(o.detune);
  const bell = c.createOscillator();
  bell.type = 'sine';
  bell.frequency.value = midi(n) * 2;
  const bellGain = c.createGain();
  bellGain.gain.value = 0.12;
  o.connect(lp);
  bell.connect(bellGain);
  bellGain.connect(lp);
  lp.connect(g);
  g.connect(bus!);
  const send = c.createGain();
  send.gain.value = 0.35;
  g.connect(send);
  send.connect(reverb!);
  [o, wob, bell].forEach((x) => {
    x.start(t);
    x.stop(t + dur + 0.8);
  });
}

/** A very soft kick: a sine that drops, no click. */
function kick(c: AudioContext, t: number, level: number) {
  const o = c.createOscillator();
  o.type = 'sine';
  o.frequency.setValueAtTime(95, t);
  o.frequency.exponentialRampToValueAtTime(42, t + 0.16);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(level, t + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.34);
  o.connect(g);
  g.connect(bus!);
  o.start(t);
  o.stop(t + 0.4);
}

let noiseBuf: AudioBuffer | null = null;
function noise(c: AudioContext) {
  if (noiseBuf) return noiseBuf;
  noiseBuf = c.createBuffer(1, c.sampleRate, c.sampleRate);
  const d = noiseBuf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return noiseBuf;
}

/** A brush: a short breath of filtered noise. */
function brush(c: AudioContext, t: number, level: number) {
  const src = c.createBufferSource();
  src.buffer = noise(c);
  const bp = c.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = 3800;
  bp.Q.value = 0.7;
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(level, t + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
  src.connect(bp);
  bp.connect(g);
  g.connect(bus!);
  src.start(t, Math.random() * 0.5, 0.2);
}

function startCrackle(c: AudioContext, level: number) {
  if (crackle) return;
  const len = c.sampleRate * 5;
  const buf = c.createBuffer(1, len, c.sampleRate);
  const d = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < len; i++) {
    last = 0.985 * last + 0.015 * (Math.random() * 2 - 1);
    d[i] = last * 0.8 + (Math.random() < 0.00035 ? (Math.random() * 2 - 1) * 0.9 : 0);
  }
  const src = c.createBufferSource();
  src.buffer = buf;
  src.loop = true;
  const hp = c.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = 900;
  const gain = c.createGain();
  gain.gain.value = 0;
  gain.gain.linearRampToValueAtTime(level, c.currentTime + 2);
  src.connect(hp);
  hp.connect(gain);
  gain.connect(bus!);
  src.start();
  crackle = { src, gain };
}

function stopCrackle() {
  if (!crackle || !ctx) return;
  const r = crackle;
  crackle = null;
  r.gain.gain.cancelScheduledValues(ctx.currentTime);
  r.gain.gain.setValueAtTime(r.gain.gain.value, ctx.currentTime);
  r.gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.2);
  r.src.stop(ctx.currentTime + 1.3);
}

/** Background textures that belong to a mood. */
function ambience(c: AudioContext, m: Mood) {
  stopRain();
  stopCrackle();
  if (m === 'pluie') startRain(c, 0.22);
  else if (m === 'nuit') startRain(c, 0.06);
  else if (m === 'lofi') startCrackle(c, 0.05);
}

// Piano alone: a bass note, then two chord tones — one bar per chord, a breath every fourth bar.
const PIANO = [
  { bass: 41, tones: [60, 64, 57, 65] }, // F
  { bass: 40, tones: [59, 62, 55, 64] }, // Em
  { bass: 38, tones: [57, 60, 65, 64] }, // Dm
  { bass: 36, tones: [55, 59, 64, 62] }, // C
];
const LOFI_BEAT = 60 / 72;

function scheduleBar(c: AudioContext, t: number) {
  const mood = prefs.mood;
  if (mood === 'piano') {
    const ch = PIANO[bar % PIANO.length];
    const phrase = Math.floor(bar / PIANO.length) % 3;
    key(c, ch.bass, t, 0.4);
    key(c, ch.bass + 12, t + BEAT * 0.02, 0.12);
    key(c, ch.tones[phrase % 2 ? 2 : 0], t + BEAT, 0.25);
    key(c, ch.tones[1], t + BEAT * 2, 0.22);
    if (bar % 4 !== 3) key(c, ch.tones[phrase === 2 ? 3 : 0] + 12, t + BEAT * 3 + (Math.random() < 0.5 ? BEAT / 2 : 0), 0.17);
    bar += 1;
    return BAR;
  }
  if (mood === 'lofi') {
    const chord = PROGRESSION[bar % PROGRESSION.length];
    const b = LOFI_BEAT;
    const swing = b * 0.08;
    chord.forEach((n, i) => rhodes(c, n, t + i * 0.018, b * 2.2, 0.095));
    chord.forEach((n, i) => rhodes(c, n, t + b * 2.5 + swing + i * 0.018, b * 1.2, 0.065));
    rhodes(c, chord[0] - 12, t, b * 3.5, 0.14);
    kick(c, t, 0.2);
    kick(c, t + b * 2.5 + swing, 0.14);
    brush(c, t + b, 0.035);
    brush(c, t + b * 3, 0.04);
    if (bar % 2 === 1) note(c, midi(chord[3] + 12), t + b * 1.5 + swing, 0.06);
    bar += 1;
    return b * 4;
  }
  if (mood === 'nuit') {
    const chord = NIGHT[bar % NIGHT.length];
    chord.forEach((n) => pad(c, midi(n), t, BAR * 2, 0.05));
    if (Math.random() < 0.6) note(c, midi(chord[2] + 12 + (Math.random() < 0.5 ? 7 : 0)), t + BEAT * (1 + Math.floor(Math.random() * 6)), 0.05);
    bar += 1;
    return BAR * 2;
  }
  const chord = PROGRESSION[bar % PROGRESSION.length];
  const padLevel = mood === 'pluie' ? 0.035 : 0.05;
  chord.forEach((n) => pad(c, midi(n), t, BAR, padLevel));
  pad(c, midi(chord[0] - 12), t, BAR, padLevel * 0.9);
  // sparse melody: 1–3 notes per bar from the chord, an octave up, on gentle offbeats
  const count = mood === 'pluie' ? 1 + Math.floor(Math.random() * 2) : 1 + Math.floor(Math.random() * 3);
  const used = new Set<number>();
  for (let i = 0; i < count; i++) {
    let slot = Math.floor(Math.random() * 8);
    while (used.has(slot)) slot = (slot + 3) % 8;
    used.add(slot);
    const n = chord[Math.floor(Math.random() * chord.length)] + 12 + (Math.random() < 0.25 ? 12 : 0);
    note(c, midi(n), t + slot * (BEAT / 2) + Math.random() * 0.04, mood === 'pluie' ? 0.06 : 0.08);
  }
  bar += 1;
  return BAR;
}

function tickScheduler() {
  if (!ctx || !playing) return;
  while (nextBar < ctx.currentTime + 1.5) {
    nextBar += scheduleBar(ctx, nextBar);
  }
}

function start() {
  const c = ensure();
  if (!c) return;
  if (c.state === 'suspended') void c.resume();
  playing = true;
  nextBar = Math.max(nextBar, c.currentTime + 0.1);
  bus!.gain.cancelScheduledValues(c.currentTime);
  bus!.gain.setValueAtTime(bus!.gain.value, c.currentTime);
  bus!.gain.linearRampToValueAtTime(1, c.currentTime + 2.5);
  ambience(c, prefs.mood);
  if (!timer) timer = setInterval(tickScheduler, 250);
  tickScheduler();
  emit();
}

function stop() {
  playing = false;
  if (ctx && bus) {
    bus.gain.cancelScheduledValues(ctx.currentTime);
    bus.gain.setValueAtTime(bus.gain.value, ctx.currentTime);
    bus.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.5);
  }
  stopRain();
  stopCrackle();
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
  emit();
}

export const music = {
  play() {
    load();
    prefs = { ...prefs, on: true };
    save();
    start();
  },
  pause() {
    load();
    prefs = { ...prefs, on: false };
    save();
    stop();
  },
  setMood(m: Mood) {
    load();
    prefs = { ...prefs, mood: m };
    save();
    if (playing && ctx) ambience(ctx, m);
    emit();
  },
  setVolume(v: number) {
    load();
    prefs = { ...prefs, volume: v };
    save();
    if (ctx && out) out.gain.setTargetAtTime(v * MASTER, ctx.currentTime, 0.1);
    emit();
  },
};

/** RMS and peak of what is actually sent to the speakers, in dBFS, over ~46 ms. Used by the QA script. */
export function measure(): { rms: number; peak: number } | null {
  if (!analyser) return null;
  const d = new Float32Array(analyser.fftSize);
  analyser.getFloatTimeDomainData(d);
  let sum = 0;
  let peak = 0;
  for (const v of d) {
    sum += v * v;
    peak = Math.max(peak, Math.abs(v));
  }
  const db = (x: number) => (x > 0 ? 20 * Math.log10(x) : -Infinity);
  return { rms: db(Math.sqrt(sum / d.length)), peak: db(peak) };
}

if (typeof window !== 'undefined') (window as unknown as { __hotelMusic?: unknown }).__hotelMusic = { music, measure };

export function useMusic() {
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
    () => ({ on: false, mood: 'salon' as Mood, volume: 0.45, playing: false }),
  );
}
