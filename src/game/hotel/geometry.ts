/**
 * Elevation of the hotel, designed to fit ONE screen from spire to sidewalk.
 * One setback tier per programme block (Bloc 1 at street level, Bloc 6 under the crown);
 * each chapter is a tall arched suite window, set side by side within its tier.
 * Everything shares one coordinate space (viewBox 0 0 W H), so overlays positioned in
 * percentages of it stay aligned at any size.
 */

export const W = 1000;
export const CX = W / 2;

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Suite extends Rect {
  id: string;
  index: number;
  tier: number;
  plaque: Rect;
  cell: Rect; // generous hit area (the suite's share of the tier)
}

export interface Tier extends Rect {
  block: number;
  name: string;
  frieze: Rect;
  suites: Suite[];
  deco: Rect[]; // small windows
  lit: boolean[]; // which deco windows glow
  piers: Rect[];
}

export interface Model {
  W: number;
  H: number;
  groundY: number;
  tiers: Tier[];
  crown: Rect[]; // three stepped blocks, bottom to top
  spire: { x: number; top: number; base: number };
  lobby: Rect;
  suites: Suite[];
  stars: { x: number; y: number; r: number }[];
}

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];
export const roman = (n: number) => ROMAN[n] ?? String(n);

export const TIER_H = 150;
const FRIEZE = 22;
const LOBBY_H = 150;
const CROWN = [62, 54, 70];
const SPIRE = 96;
const SKY = 34;
export const STREET = 74;

export function buildModel(chapters: { id: string; blockNumber: number; blockName: string }[]): Model {
  const rand = rng(1931);
  const blocks = new Map<number, { name: string; ids: { id: string; index: number }[] }>();
  chapters.forEach((c, index) => {
    const b = c.blockNumber || 1;
    if (!blocks.has(b)) blocks.set(b, { name: c.blockName, ids: [] });
    blocks.get(b)!.ids.push({ id: c.id, index });
  });
  const list = [...blocks.entries()].sort((a, b) => a[0] - b[0]);
  const n = list.length;
  const widths = list.map((_, i) => Math.round(800 - (i * (800 - 440)) / Math.max(1, n - 1)));

  const top = SKY + SPIRE + CROWN.reduce((a, b) => a + b, 0);
  const groundY = top + n * TIER_H + LOBBY_H;
  const H = groundY + STREET;

  const tiers: Tier[] = [];
  const suites: Suite[] = [];
  list.forEach(([block, b], i) => {
    const w = widths[i];
    const x = CX - w / 2;
    const y = groundY - LOBBY_H - (i + 1) * TIER_H;
    const frieze = { x: x - 8, y, w: w + 16, h: FRIEZE };
    const innerX = x + 24;
    const innerW = w - 48;
    const cw = innerW / b.ids.length;
    const tierSuites: Suite[] = [];
    const deco: Rect[] = [];
    const piers: Rect[] = [{ x, y: y + FRIEZE, w: 24, h: TIER_H - FRIEZE }, { x: x + w - 24, y: y + FRIEZE, w: 24, h: TIER_H - FRIEZE }];
    b.ids.forEach(({ id, index }, k) => {
      const cellX = innerX + k * cw;
      const sw = 92;
      const sh = 96;
      const sx = cellX + cw / 2 - sw / 2;
      const sy = y + FRIEZE + 14;
      const suite: Suite = {
        id,
        index,
        tier: i,
        x: sx,
        y: sy,
        w: sw,
        h: sh,
        plaque: { x: sx + sw / 2 - 26, y: sy + sh + 3, w: 52, h: 18 },
        cell: { x: cellX + 4, y: y + FRIEZE + 2, w: cw - 8, h: TIER_H - FRIEZE - 4 },
      };
      tierSuites.push(suite);
      suites.push(suite);
      // flanking piers around each suite
      piers.push({ x: sx - 16, y: y + FRIEZE, w: 10, h: TIER_H - FRIEZE }, { x: sx + sw + 6, y: y + FRIEZE, w: 10, h: TIER_H - FRIEZE });
      // small windows on both sides of the suite, three floors
      const free = (cw - sw - 32) / 2;
      const cols = Math.max(0, Math.floor((free - 6) / 30));
      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < 3; r++) {
          const wy = y + FRIEZE + 12 + r * 38;
          deco.push({ x: sx - 22 - (c + 1) * 30 + 6, y: wy, w: 18, h: 26 });
          deco.push({ x: sx + sw + 22 + c * 30, y: wy, w: 18, h: 26 });
        }
      }
    });
    const lit = deco.map(() => rand() < 0.24);
    tiers.push({ x, y, w, h: TIER_H, block, name: b.name, frieze, suites: tierSuites, deco, lit, piers });
  });

  const topW = widths[n - 1] ?? 440;
  const crown: Rect[] = [];
  let cy = groundY - LOBBY_H - n * TIER_H;
  let cwid = topW - 70;
  CROWN.forEach((h) => {
    crown.push({ x: CX - cwid / 2, y: cy - h, w: cwid, h });
    cy -= h;
    cwid -= 84;
  });
  const spire = { x: CX, top: cy - SPIRE, base: cy };
  const lobby = { x: CX - 440, y: groundY - LOBBY_H, w: 880, h: LOBBY_H };
  const stars = Array.from({ length: 22 }, () => ({ x: rand() * W * 1.6 - W * 0.3, y: 10 + rand() * 360, r: 0.7 + rand() * 1.1 }));
  return { W, H, groundY, tiers, crown, spire, lobby, suites, stars };
}
