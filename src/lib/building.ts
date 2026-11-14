/**
 * Procedural elevation of the hotel.
 *
 * Everything lives in one SVG coordinate space (viewBox 0 0 W H). The façade scales
 * uniformly with its container, so chapter windows and the HTML labels positioned in
 * percentages of this space stay aligned at every screen size.
 *
 * Reading from the street up: lobby, then one setback tier per programme block
 * (Bloc 1 at the bottom, Bloc 6 under the crown). Each chapter occupies a
 * three-floor "suite" in the central bay: a carved plaque floor and a double-height window.
 */

export const W = 1200;
export const CX = W / 2;
export const FH = 56; // floor height
const SIDE_BAY = 58;
const CENTRAL_BAY = 176;
const FRIEZE = 38;
const LOBBY_H = 268;
const SIDEWALK = 46;
const STREET = 92;

export interface ChapterInput {
  id: string;
  blockNumber: number;
  blockName: string;
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface SideWindow extends Rect {
  lit: 0 | 1 | 2 | 3; // 0 dark glass, 1 warm, 2 dim warm, 3 warm with curtain
}

export interface ChapterWindow extends Rect {
  id: string;
  index: number; // 0-based order in programme
  tier: number;
  plaque: Rect;
  head: Rect; // stepped hood above the window
  hit: Rect; // generous interactive area
}

export interface Tier extends Rect {
  block: number;
  name: string;
  piers: Rect[];
  frieze: Rect;
  floors: number;
}

export interface Neighbor extends Rect {
  tone: 0 | 1 | 2;
  windows: Rect[];
  litWindows: Rect[];
  waterTower?: { x: number; y: number };
  stepped?: boolean;
}

export interface BuildingModel {
  W: number;
  H: number;
  groundY: number;
  lobby: Rect;
  tiers: Tier[];
  sideWindows: SideWindow[];
  reliefPanels: Rect[]; // carved panels in the central bay
  chapterWindows: ChapterWindow[];
  crown: { steps: Rect[]; fins: Rect[]; spire: Rect; fan: { cx: number; cy: number; r: number } };
  neighbors: Neighbor[];
  stars: { x: number; y: number; r: number }[];
  silhouette: string; // outline path of the tower (used for the mini-map)
}

/** Deterministic pseudo-random generator so server and client draw the same façade. */
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
export const roman = (n: number) => ROMAN[n] ?? String(n);

export function buildModel(chapters: ChapterInput[]): BuildingModel {
  const rand = rng(1931);

  // group chapters by block, keep programme order
  const blocks = new Map<number, { name: string; ids: { id: string; index: number }[] }>();
  chapters.forEach((c, index) => {
    const b = c.blockNumber || 1;
    if (!blocks.has(b)) blocks.set(b, { name: c.blockName, ids: [] });
    blocks.get(b)!.ids.push({ id: c.id, index });
  });
  const blockList = [...blocks.entries()].sort((a, b) => a[0] - b[0]);
  const nTiers = blockList.length;

  // tier widths, narrowing upward
  const baseW = 800;
  const topW = 372;
  const widthOf = (i: number) => {
    const t = nTiers > 1 ? i / (nTiers - 1) : 0;
    const raw = baseW - (baseW - topW) * t;
    // snap so that side bays fit evenly
    const side = Math.max(0, Math.floor((raw - CENTRAL_BAY - 2 * 26) / 2 / SIDE_BAY));
    return CENTRAL_BAY + 2 * side * SIDE_BAY + 2 * 26;
  };

  const floorsOf = (n: number) => n * 3 + 1;
  const towerH = blockList.reduce((acc, [, b]) => acc + floorsOf(b.ids.length) * FH + FRIEZE, 0);

  const crownH = 70 + 64 + 92;
  const spireH = 176;
  const skyTop = 230;
  const groundY = skyTop + spireH + crownH + towerH + LOBBY_H;
  const H = groundY + SIDEWALK + STREET;

  const tiers: Tier[] = [];
  const sideWindows: SideWindow[] = [];
  const reliefPanels: Rect[] = [];
  const chapterWindows: ChapterWindow[] = [];

  let yBottom = groundY - LOBBY_H; // top of lobby = bottom of tier 1
  blockList.forEach(([blockNo, b], ti) => {
    const w = widthOf(ti);
    const floors = floorsOf(b.ids.length);
    const h = floors * FH + FRIEZE;
    const x = CX - w / 2;
    const y = yBottom - h;
    const nSide = (w - CENTRAL_BAY - 52) / 2 / SIDE_BAY;

    const piers: Rect[] = [];
    // edge piers
    piers.push({ x, y: y + FRIEZE, w: 26, h: h - FRIEZE });
    piers.push({ x: x + w - 26, y: y + FRIEZE, w: 26, h: h - FRIEZE });
    // central bay piers (the strong vertical of the composition)
    piers.push({ x: CX - CENTRAL_BAY / 2, y: y + FRIEZE, w: 18, h: h - FRIEZE });
    piers.push({ x: CX + CENTRAL_BAY / 2 - 18, y: y + FRIEZE, w: 18, h: h - FRIEZE });
    // side bay piers
    for (let s = 1; s < nSide; s++) {
      piers.push({ x: x + 26 + s * SIDE_BAY - 5, y: y + FRIEZE, w: 10, h: h - FRIEZE });
      piers.push({ x: CX + CENTRAL_BAY / 2 + s * SIDE_BAY - 5, y: y + FRIEZE, w: 10, h: h - FRIEZE });
    }

    const frieze = { x: x - 8, y, w: w + 16, h: FRIEZE };
    tiers.push({ x, y, w, h, block: blockNo, name: b.name, piers, frieze, floors });

    // floors (0 = lowest floor of the tier)
    for (let f = 0; f < floors; f++) {
      const fy = yBottom - (f + 1) * FH; // top of floor
      // side windows
      for (let s = 0; s < nSide; s++) {
        for (const side of [-1, 1]) {
          const bx = side < 0 ? x + 26 + s * SIDE_BAY : CX + CENTRAL_BAY / 2 + s * SIDE_BAY;
          const r = rand();
          // more lights low and on the warm (left) side; tops are mostly dark at dusk
          const p = 0.2 + (side < 0 ? 0.06 : 0) - ti * 0.012;
          const lit: SideWindow['lit'] = r < p * 0.55 ? 1 : r < p * 0.85 ? 2 : r < p ? 3 : 0;
          sideWindows.push({ x: bx + 13, y: fy + 10, w: SIDE_BAY - 26, h: FH - 22, lit });
        }
      }
    }

    // central bay: suites
    const innerX = CX - CENTRAL_BAY / 2 + 18;
    const innerW = CENTRAL_BAY - 36;
    b.ids.forEach(({ id, index }, k) => {
      const f0 = k * 3; // plaque floor
      const plaqueTop = yBottom - (f0 + 1) * FH;
      const winTop = yBottom - (f0 + 3) * FH + 14;
      const winH = FH * 2 - 14 - 6;
      const ww = innerW - 22;
      const wx = CX - ww / 2;
      chapterWindows.push({
        id,
        index,
        tier: ti,
        x: wx,
        y: winTop,
        w: ww,
        h: winH,
        plaque: { x: CX - 34, y: plaqueTop + 12, w: 68, h: 30 },
        head: { x: wx - 6, y: winTop - 12, w: ww + 12, h: 12 },
        hit: { x: innerX, y: winTop - 14, w: innerW, h: winH + 14 + FH - 4 },
      });
      // relief panels flanking the plaque
      reliefPanels.push({ x: innerX + 6, y: plaqueTop + 12, w: (innerW - 68) / 2 - 14, h: 30 });
      reliefPanels.push({ x: CX + 34 + 8, y: plaqueTop + 12, w: (innerW - 68) / 2 - 14, h: 30 });
    });
    // top floor of the tier: a carved panel across the central bay
    const topFloorY = yBottom - floors * FH;
    reliefPanels.push({ x: innerX + 6, y: topFloorY + 10, w: innerW - 12, h: FH - 22 });

    yBottom = y;
  });

  // crown: three stepped blocks, fins, a fan and the spire
  const towerTop = yBottom;
  const topTierW = tiers[tiers.length - 1]?.w ?? 360;
  const s1 = { x: CX - (topTierW - 64) / 2, y: towerTop - 70, w: topTierW - 64, h: 70 };
  const s2 = { x: CX - (s1.w - 76) / 2, y: s1.y - 64, w: s1.w - 76, h: 64 };
  const s3 = { x: CX - (s2.w - 72) / 2, y: s2.y - 92, w: s2.w - 72, h: 92 };
  const fins: Rect[] = [];
  for (const s of [s1, s2, s3]) {
    const n = Math.max(3, Math.round(s.w / 36));
    for (let i = 0; i < n; i++) {
      const fx = s.x + 10 + (i * (s.w - 20)) / (n - 1) - 3;
      fins.push({ x: fx, y: s.y + 8, w: 6, h: s.h - 8 });
    }
  }
  const spire = { x: CX - 5, y: s3.y - spireH, w: 10, h: spireH };
  const fan = { cx: CX, cy: s3.y + s3.h, r: s3.w / 2 - 12 };

  // neighbors (background), drawn in the dusty blue-grey family
  const neighbors: Neighbor[] = [];
  const mkNeighbor = (x: number, w: number, top: number, tone: 0 | 1 | 2, opts: Partial<Neighbor> = {}): Neighbor => {
    const windows: Rect[] = [];
    const litWindows: Rect[] = [];
    const cols = Math.floor((w - 16) / 26);
    for (let yy = top + 28; yy < groundY - 60; yy += 34) {
      for (let c = 0; c < cols; c++) {
        const rr = { x: x + 12 + c * 26, y: yy, w: 12, h: 18 };
        if (rand() < 0.1) litWindows.push(rr);
        else windows.push(rr);
      }
    }
    return { x, y: top, w, h: groundY - top, tone, windows, litWindows, ...opts };
  };
  neighbors.push(mkNeighbor(-20, 170, groundY - 2350, 0, { stepped: true }));
  neighbors.push(mkNeighbor(120, 230, groundY - 1420, 1, { waterTower: { x: 230, y: groundY - 1420 } }));
  neighbors.push(mkNeighbor(1040, 190, groundY - 2050, 0, { stepped: true }));
  neighbors.push(mkNeighbor(900, 190, groundY - 1180, 1, { waterTower: { x: 1010, y: groundY - 1180 } }));
  neighbors.push(mkNeighbor(-10, 230, groundY - 640, 2));
  neighbors.push(mkNeighbor(990, 230, groundY - 760, 2));

  const stars = Array.from({ length: 16 }, () => ({
    x: rand() * W,
    y: 20 + rand() * 520,
    r: 0.8 + rand() * 1.1,
  }));

  // silhouette path (for the mini-map): from bottom-left, around, clockwise
  const pts: [number, number][] = [];
  const lobbyW = 880;
  pts.push([CX - lobbyW / 2, groundY]);
  pts.push([CX - lobbyW / 2, groundY - LOBBY_H]);
  for (const t of tiers) {
    pts.push([t.x, t.y + t.h]);
    pts.push([t.x, t.y]);
  }
  for (const s of [s1, s2, s3]) {
    pts.push([s.x, s.y + s.h]);
    pts.push([s.x, s.y]);
  }
  pts.push([spire.x, s3.y], [CX, spire.y], [spire.x + spire.w, s3.y]);
  for (const s of [s3, s2, s1]) {
    pts.push([s.x + s.w, s.y]);
    pts.push([s.x + s.w, s.y + s.h]);
  }
  for (const t of [...tiers].reverse()) {
    pts.push([t.x + t.w, t.y]);
    pts.push([t.x + t.w, t.y + t.h]);
  }
  pts.push([CX + lobbyW / 2, groundY - LOBBY_H]);
  pts.push([CX + lobbyW / 2, groundY]);
  const silhouette = 'M' + pts.map(([a, c]) => `${a.toFixed(1)} ${c.toFixed(1)}`).join(' L') + ' Z';

  return {
    W,
    H,
    groundY,
    lobby: { x: CX - lobbyW / 2, y: groundY - LOBBY_H, w: lobbyW, h: LOBBY_H },
    tiers,
    sideWindows,
    reliefPanels,
    chapterWindows,
    crown: { steps: [s1, s2, s3], fins, spire, fan },
    neighbors,
    stars,
    silhouette,
  };
}

export const LAYOUT = { SIDEWALK, STREET, LOBBY_H, FRIEZE, CENTRAL_BAY };
