'use client';

import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { buildModel, roman, W, CX, LAYOUT, type BuildingModel, type ChapterWindow } from '../lib/building';
import { dict, routes, type Lang } from '../lib/i18n';
import { useProgress, statusOf, nav, type Status } from '../lib/progress';
import { enterChapter, isPlainClick, prefersReducedMotion } from '../lib/transition';

export interface FacadeChapter {
  id: string;
  title: string;
  blockNumber: number;
  blockName: string;
}

interface Props {
  lang: Lang;
  chapters: FacadeChapter[];
  /** id highlighted from outside (directory hover) */
  highlight: string | null;
  selected: string | null;
  onSelect: (id: string | null) => void;
  onActive: (id: string | null) => void;
}

const pct = (v: number, of: number) => `${((v / of) * 100).toFixed(4)}%`;

/* ------------------------------------------------------------------ */
/* Static architecture — memoised, never re-renders with progress      */
/* ------------------------------------------------------------------ */

const Architecture = memo(function Architecture({ m, lang }: { m: BuildingModel; lang: Lang }) {
  const g = m.groundY;
  const lob = m.lobby;
  const [s1, s2, s3] = m.crown.steps;
  const portalW = 300;
  return (
    <>
      <defs>
        <linearGradient id="glassDark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3E5650" />
          <stop offset="0.45" stopColor="#263A34" />
          <stop offset="1" stopColor="#1B2925" />
        </linearGradient>
        <linearGradient id="warmLight" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F3D29C" />
          <stop offset="0.6" stopColor="#E8BD7A" />
          <stop offset="1" stopColor="#C8924F" />
        </linearGradient>
        <linearGradient id="dimLight" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#C9A06A" />
          <stop offset="1" stopColor="#8E6A43" />
        </linearGradient>
        <radialGradient id="suiteLight" cx="0.5" cy="0.62" r="0.75">
          <stop offset="0" stopColor="#FBE3B4" />
          <stop offset="0.55" stopColor="#EDC385" />
          <stop offset="1" stopColor="#C38A48" />
        </radialGradient>
        <radialGradient id="halo" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#F2C98A" stopOpacity="0.55" />
          <stop offset="0.6" stopColor="#E8BD7A" stopOpacity="0.14" />
          <stop offset="1" stopColor="#E8BD7A" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="duskSide" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#F0C38A" stopOpacity="0.16" />
          <stop offset="0.48" stopColor="#F0C38A" stopOpacity="0" />
          <stop offset="0.52" stopColor="#10261D" stopOpacity="0" />
          <stop offset="1" stopColor="#10261D" stopOpacity="0.26" />
        </linearGradient>
        <linearGradient id="streetShade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#10261D" stopOpacity="0" />
          <stop offset="1" stopColor="#10261D" stopOpacity="0.34" />
        </linearGradient>
        <linearGradient id="flood" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#F4CF95" stopOpacity="0.5" />
          <stop offset="1" stopColor="#F4CF95" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="lobbyGlow" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#E8BD7A" stopOpacity="0.38" />
          <stop offset="1" stopColor="#E8BD7A" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="reflection" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#E8BD7A" stopOpacity="0.28" />
          <stop offset="1" stopColor="#E8BD7A" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="lampGlow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#FCE2B0" stopOpacity="0.95" />
          <stop offset="0.25" stopColor="#F0C584" stopOpacity="0.35" />
          <stop offset="1" stopColor="#E8BD7A" stopOpacity="0" />
        </radialGradient>
        <pattern id="flutes" width="8" height="10" patternUnits="userSpaceOnUse">
          <rect width="8" height="10" fill="#E9E1D2" />
          <rect x="3" width="2" height="10" fill="#CDBFA8" />
        </pattern>
        <pattern id="chevron" width="16" height="10" patternUnits="userSpaceOnUse">
          <rect width="16" height="10" fill="#D7CBB7" />
          <path d="M0 8 L8 2 L16 8" fill="none" stroke="#C3B49B" strokeWidth="1.4" />
        </pattern>
        <clipPath id="fanClip">
          <rect x={s3.x} y={s3.y} width={s3.w} height={s3.h} />
        </clipPath>
      </defs>

      {/* stars, very faint */}
      <g className="f-stars" aria-hidden="true">
        {m.stars.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#F7F4ED" opacity={0.35} />
        ))}
      </g>

      {/* background city, extends beyond the viewBox for wide screens */}
      <g className="f-city" aria-hidden="true">
        {/* far skyline band beyond the frame */}
        <path
          d={`M-1400 ${g} V${g - 1600} H-1180 V${g - 1980} H-1040 V${g - 1720} H-860 V${g - 2240} H-760 V${g - 2400} H-700 V${g - 2240} H-600 V${g - 1500} H-420 V${g - 1880} H-240 V${g} Z`}
          fill="#4B5752"
          opacity="0.6"
        />
        <path
          d={`M${W + 240} ${g} V${g - 1760} H${W + 420} V${g - 2140} H${W + 520} V${g - 2300} H${W + 580} V${g - 2140} H${W + 700} V${g - 1640} H${W + 900} V${g - 1960} H${W + 1080} V${g - 1440} H${W + 1400} V${g} Z`}
          fill="#4B5752"
          opacity="0.6"
        />
        {[
          { x: -900, w: 320, top: g - 1240 },
          { x: -560, w: 300, top: g - 980 },
          { x: -260, w: 260, top: g - 1700 },
          { x: W + 20, w: 260, top: g - 1560 },
          { x: W + 260, w: 330, top: g - 1080 },
          { x: W + 580, w: 300, top: g - 1320 },
        ].map((b, i) => (
          <rect key={`b${i}`} x={b.x} y={b.top} width={b.w} height={g - b.top} fill="#38433E" />
        ))}
        {m.neighbors.map((n, i) => {
          const fill = n.tone === 0 ? '#3E4A45' : n.tone === 1 ? '#313C37' : '#252E2A';
          return (
            <g key={i}>
              {n.stepped ? (
                <path
                  d={`M${n.x} ${g} V${n.y + 60} H${n.x + 22} V${n.y + 24} H${n.x + 44} V${n.y} H${n.x + n.w - 44} V${n.y + 24} H${n.x + n.w - 22} V${n.y + 60} H${n.x + n.w} V${g} Z`}
                  fill={fill}
                />
              ) : (
                <rect x={n.x} y={n.y} width={n.w} height={n.h} fill={fill} />
              )}
              <rect x={n.x} y={n.y + (n.stepped ? 60 : 0)} width={n.w} height={6} fill="#000" opacity="0.12" />
              {n.windows.map((w, j) => (
                <rect key={j} x={w.x} y={w.y} width={w.w} height={w.h} fill="#1F2824" opacity="0.6" />
              ))}
              {n.litWindows.map((w, j) => (
                <rect key={`l${j}`} x={w.x} y={w.y} width={w.w} height={w.h} fill="#DDB273" opacity="0.72" />
              ))}
              {n.waterTower && <WaterTower x={n.waterTower.x} y={n.waterTower.y} />}
            </g>
          );
        })}
      </g>

      {/* the hotel */}
      <g className="f-hotel">
        {/* spire */}
        <path
          d={`M${CX - 13} ${s3.y} L${CX - 3} ${m.crown.spire.y + 14} L${CX} ${m.crown.spire.y} L${CX + 3} ${m.crown.spire.y + 14} L${CX + 13} ${s3.y} Z`}
          fill="#CDBF9F"
        />
        <path d={`M${CX} ${m.crown.spire.y} L${CX + 3} ${m.crown.spire.y + 14} L${CX + 13} ${s3.y} L${CX} ${s3.y} Z`} fill="#A99978" />
        {[0.32, 0.55, 0.75].map((t, i) => {
          const y = m.crown.spire.y + (s3.y - m.crown.spire.y) * t;
          const hw = 2 + 11 * t;
          return <rect key={i} x={CX - hw - 2} y={y} width={2 * hw + 4} height={4} fill="#B49768" />;
        })}
        <circle cx={CX} cy={m.crown.spire.y - 3} r={3.2} fill="#D0664F" />
        <circle cx={CX} cy={m.crown.spire.y - 3} r={9} fill="#D0664F" opacity="0.16" />

        {/* crown steps */}
        {[s1, s2, s3].map((s, i) => (
          <g key={i}>
            <rect x={s.x} y={s.y} width={s.w} height={s.h} fill="#E6DDCD" />
            <rect x={s.x - 6} y={s.y} width={s.w + 12} height={8} fill="#EFE8DB" />
            <rect x={s.x - 6} y={s.y + 8} width={s.w + 12} height={3} fill="#B8A88E" />
          </g>
        ))}
        {m.crown.fins.map((f, i) => (
          <rect key={i} x={f.x} y={f.y + 3} width={f.w} height={f.h - 3} fill="#F1EADD" />
        ))}
        {/* sunburst window in the upper crown */}
        <g clipPath="url(#fanClip)">
          <circle cx={m.crown.fan.cx} cy={m.crown.fan.cy} r={m.crown.fan.r} fill="url(#warmLight)" opacity="0.9" />
          {Array.from({ length: 13 }, (_, i) => {
            const a = Math.PI + (i * Math.PI) / 12;
            return (
              <line
                key={i}
                x1={m.crown.fan.cx}
                y1={m.crown.fan.cy}
                x2={m.crown.fan.cx + Math.cos(a) * (m.crown.fan.r + 4)}
                y2={m.crown.fan.cy + Math.sin(a) * (m.crown.fan.r + 4)}
                stroke="#9C8259"
                strokeWidth="3"
              />
            );
          })}
          <circle cx={m.crown.fan.cx} cy={m.crown.fan.cy} r={m.crown.fan.r * 0.42} fill="#E6DDCD" />
          <circle cx={m.crown.fan.cx} cy={m.crown.fan.cy} r={m.crown.fan.r} fill="none" stroke="#B49768" strokeWidth="4" />
          <circle cx={m.crown.fan.cx} cy={m.crown.fan.cy} r={m.crown.fan.r * 0.42} fill="none" stroke="#B49768" strokeWidth="3" />
        </g>
        {/* floodlight wash on the crown */}
        {[s1, s2, s3].map((s, i) => (
          <rect key={`fl${i}`} x={s.x} y={s.y} width={s.w} height={s.h} fill="url(#flood)" />
        ))}
        {[s1, s2, s3].map((s, i) => (
          <rect key={`ds${i}`} x={s.x} y={s.y} width={s.w} height={s.h} fill="url(#duskSide)" opacity="0.8" />
        ))}

        {/* tiers */}
        {m.tiers.map((t) => (
          <g key={t.block}>
            <rect x={t.x} y={t.y} width={t.w} height={t.h} fill="url(#chevron)" />
            {t.piers.map((p, i) => (
              <g key={i}>
                <rect x={p.x} y={p.y} width={p.w} height={p.h} fill="#ECE5D8" />
                <rect x={p.x + p.w - 2} y={p.y} width={2} height={p.h} fill="#C9BBA3" />
              </g>
            ))}
            {/* frieze with carved inscription */}
            <rect x={t.frieze.x} y={t.frieze.y} width={t.frieze.w} height={t.frieze.h} fill="url(#flutes)" />
            <rect x={t.frieze.x} y={t.frieze.y} width={t.frieze.w} height={6} fill="#F2ECE1" />
            <rect x={t.frieze.x} y={t.frieze.y + t.frieze.h - 4} width={t.frieze.w} height={4} fill="#B4A48A" />
            <rect x={CX - 150} y={t.frieze.y + 8} width={300} height={t.frieze.h - 14} fill="#ECE5D8" />
            <text
              x={CX}
              y={t.frieze.y + t.frieze.h / 2 + 5}
              textAnchor="middle"
              className="f-inscription"
            >
              {`${roman(t.block)} · ${t.name.toUpperCase()}`}
            </text>
            <rect x={t.x} y={t.y + t.h - 8} width={t.w} height={8} fill="#C8BBA5" opacity="0.6" />
          </g>
        ))}

        {/* relief panels in the central bay */}
        {m.reliefPanels.map((r, i) => (
          <g key={i}>
            <rect x={r.x} y={r.y} width={r.w} height={r.h} fill="#DED3C1" />
            <path
              d={`M${r.x + 4} ${r.y + r.h - 4} L${r.x + r.w / 2} ${r.y + 5} L${r.x + r.w - 4} ${r.y + r.h - 4}`}
              fill="none"
              stroke="#BFAF95"
              strokeWidth="1.5"
            />
            <path
              d={`M${r.x + r.w / 2} ${r.y + 5} V${r.y + r.h - 4}`}
              stroke="#CDBFA8"
              strokeWidth="1"
            />
          </g>
        ))}

        {/* side windows */}
        {m.sideWindows.map((w, i) => (
          <SideWin key={i} w={w} i={i} />
        ))}

        {/* dusk light across each tier */}
        {m.tiers.map((t) => (
          <rect key={`d${t.block}`} x={t.x} y={t.y} width={t.w} height={t.h} fill="url(#duskSide)" pointerEvents="none" />
        ))}
        {m.tiers[0] && (
          <rect
            x={m.tiers[0].x}
            y={m.tiers[0].y + m.tiers[0].h * 0.3}
            width={m.tiers[0].w}
            height={m.tiers[0].h * 0.7}
            fill="url(#streetShade)"
            pointerEvents="none"
          />
        )}

        {/* lobby */}
        <rect x={lob.x} y={lob.y} width={lob.w} height={lob.h} fill="#2A2D31" />
        <rect x={lob.x - 10} y={lob.y} width={lob.w + 20} height={24} fill="#E6DDCD" />
        <rect x={lob.x - 10} y={lob.y + 24} width={lob.w + 20} height={4} fill="#B49768" />
        <rect x={lob.x} y={lob.y + 28} width={lob.w} height={lob.h - 28} fill="url(#lobbyGlow)" />
        {/* lobby side windows */}
        {[-1, 1].map((side) =>
          [0, 1, 2].map((k) => {
            const x = side < 0 ? lob.x + 40 + k * 92 : lob.x + lob.w - 40 - 70 - k * 92;
            return (
              <g key={`${side}${k}`}>
                <rect x={x - 6} y={lob.y + 52} width={82} height={g - lob.y - 52} fill="#1E2024" />
                <rect x={x} y={lob.y + 58} width={70} height={46} fill="url(#dimLight)" opacity="0.75" />
                <rect x={x} y={lob.y + 112} width={70} height={g - lob.y - 130} fill="url(#warmLight)" opacity="0.88" />
                <path d={`M${x + 35} ${lob.y + 112} V${g - 18} M${x} ${lob.y + 160} H${x + 70}`} stroke="#6E5A3E" strokeWidth="3" />
                <path d={`M${x} ${lob.y + 104} H${x + 70} V${lob.y + 112} H${x} Z`} fill="#6E5A3E" />
              </g>
            );
          }),
        )}
        {/* portal */}
        {[0, 1, 2].map((k) => (
          <rect
            key={k}
            x={CX - portalW / 2 + k * 14}
            y={lob.y + 30 + k * 12}
            width={portalW - k * 28}
            height={g - (lob.y + 30 + k * 12)}
            fill={k % 2 ? '#DDD3C2' : '#EAE2D4'}
          />
        ))}
        <rect x={CX - 106} y={lob.y + 70} width={212} height={g - lob.y - 70} fill="#18191C" />
        <rect x={CX - 100} y={lob.y + 76} width={200} height={g - lob.y - 76} fill="url(#warmLight)" />
        {/* deco grille above the doors */}
        <g stroke="#7A6342" strokeWidth="3" fill="none">
          {[-75, -50, -25, 0, 25, 50, 75].map((dx) => (
            <path key={dx} d={`M${CX + dx} ${lob.y + 76} V${g - 128}`} />
          ))}
          <path d={`M${CX - 100} ${lob.y + 126} L${CX} ${lob.y + 86} L${CX + 100} ${lob.y + 126}`} />
          <path d={`M${CX - 100} ${lob.y + 146} L${CX} ${lob.y + 106} L${CX + 100} ${lob.y + 146}`} />
        </g>
        {/* marquee */}
        <path d={`M${CX - 200} ${g - 128} L${CX - 150} ${g - 196} M${CX + 200} ${g - 128} L${CX + 150} ${g - 196}`} stroke="#5E4C33" strokeWidth="3" />
        <rect x={CX - 214} y={g - 140} width={428} height={34} fill="#1F2226" />
        <rect x={CX - 214} y={g - 140} width={428} height={3} fill="#C8AE7D" />
        <rect x={CX - 214} y={g - 109} width={428} height={3} fill="#8C7550" />
        <text x={CX} y={g - 117.5} textAnchor="middle" className="f-sign">
          100 HOURS OF AGENTIC AI
        </text>
        <rect x={CX - 210} y={g - 106} width={420} height={3} fill="#F3D29C" opacity="0.9" />
        <rect x={CX - 210} y={g - 103} width={420} height={50} fill="url(#reflection)" />
        {/* doors */}
        {[-1, 0, 1].map((k) => (
          <g key={k}>
            <rect x={CX + k * 64 - 28} y={g - 96} width={56} height={96} fill="#F4D7A4" opacity="0.92" />
            <rect x={CX + k * 64 - 28} y={g - 96} width={56} height={96} fill="none" stroke="#7A6342" strokeWidth="5" />
            <path d={`M${CX + k * 64} ${g - 96} V${g}`} stroke="#7A6342" strokeWidth="2" />
            <rect x={CX + k * 64 - 6} y={g - 52} width={3} height={18} fill="#C8AE7D" />
            <rect x={CX + k * 64 + 3} y={g - 52} width={3} height={18} fill="#C8AE7D" />
          </g>
        ))}
        {/* lanterns */}
        {[-1, 1].map((side) => (
          <g key={side}>
            <circle cx={CX + side * 172} cy={g - 168} r={34} fill="url(#lampGlow)" />
            <rect x={CX + side * 172 - 7} y={g - 182} width={14} height={26} rx={2} fill="#F4D7A4" stroke="#5E4C33" strokeWidth="3" />
          </g>
        ))}
        <rect x={lob.x} y={g - 8} width={lob.w} height={8} fill="#1A1C1F" />
      </g>

      {/* street */}
      <g className="f-street" aria-hidden="true">
        <rect x={-1400} y={g} width={W + 2800} height={LAYOUT.SIDEWALK} fill="#77746F" />
        {Array.from({ length: 46 }, (_, i) => (
          <rect key={i} x={-1400 + i * 90} y={g} width={1.5} height={LAYOUT.SIDEWALK} fill="#66635F" />
        ))}
        <rect x={-1400} y={g + LAYOUT.SIDEWALK - 7} width={W + 2800} height={7} fill="#A39F98" />
        <rect x={-1400} y={g + LAYOUT.SIDEWALK} width={W + 2800} height={LAYOUT.STREET} fill="#1F242A" />
        <rect x={CX - 230} y={g + LAYOUT.SIDEWALK} width={460} height={LAYOUT.STREET} fill="url(#reflection)" opacity="0.6" />
        {Array.from({ length: 12 }, (_, i) => (
          <rect key={`m${i}`} x={-1300 + i * 330} y={g + LAYOUT.SIDEWALK + 50} width={120} height={3} fill="#C9BFA9" opacity="0.18" />
        ))}
        {[110, W - 110, -480, W + 480].map((x) => (
          <LampPost key={x} x={x} g={g} />
        ))}
        {/* planters by the door */}
        {[-1, 1].map((s) => (
          <g key={s}>
            <rect x={CX + s * 250 - 22} y={g - 28} width={44} height={30} fill="#3A3D41" />
            <ellipse cx={CX + s * 250} cy={g - 40} rx={26} ry={20} fill="#3E4A3F" />
          </g>
        ))}
      </g>

      {/* accessible description of the illustration */}
      <title>{lang === 'fr' ? 'Façade de l’hôtel 100 Hours of Agentic AI' : 'Façade of the 100 Hours of Agentic AI hotel'}</title>
    </>
  );
});

function WaterTower({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <path d={`M${x - 26} ${y} L${x - 20} ${y - 46} M${x + 26} ${y} L${x + 20} ${y - 46} M${x - 24} ${y - 14} L${x + 24} ${y - 34} M${x + 24} ${y - 14} L${x - 24} ${y - 34}`} stroke="#36423D" strokeWidth="3" />
      <rect x={x - 28} y={y - 106} width={56} height={62} fill="#404C47" />
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={x - 28} y={y - 96 + i * 14} width={56} height={2} fill="#343F3A" />
      ))}
      <path d={`M${x - 32} ${y - 106} L${x} ${y - 132} L${x + 32} ${y - 106} Z`} fill="#38443F" />
    </g>
  );
}

function LampPost({ x, g }: { x: number; g: number }) {
  return (
    <g>
      <circle cx={x + 22} cy={g - 186} r={46} fill="url(#lampGlow)" />
      <rect x={x - 3} y={g - 190} width={6} height={194} fill="#2A2F35" />
      <rect x={x - 8} y={g - 18} width={16} height={18} fill="#2A2F35" />
      <path d={`M${x} ${g - 190} q 2 -20 22 -16`} stroke="#2A2F35" strokeWidth="5" fill="none" />
      <path d={`M${x + 14} ${g - 202} h16 l-3 12 h-10 Z`} fill="#F7DDAE" />
    </g>
  );
}

function SideWin({ w, i }: { w: { x: number; y: number; w: number; h: number; lit: 0 | 1 | 2 | 3 }; i: number }) {
  if (w.lit === 0) {
    return (
      <g>
        <rect x={w.x} y={w.y} width={w.w} height={w.h} fill="url(#glassDark)" />
        <rect x={w.x} y={w.y} width={w.w} height={3} fill="#151D26" opacity="0.7" />
        <rect x={w.x + w.w / 2 - 0.75} y={w.y} width={1.5} height={w.h} fill="#6B6155" opacity="0.6" />
      </g>
    );
  }
  const fill = w.lit === 2 ? 'url(#dimLight)' : 'url(#warmLight)';
  return (
    <g className="f-lit" style={{ ['--d' as string]: `${(i % 23) * 60}ms` }}>
      <rect x={w.x} y={w.y} width={w.w} height={w.h} fill="url(#glassDark)" />
      <rect className="f-lit__glow" x={w.x} y={w.y} width={w.w} height={w.h} fill={fill} />
      {w.lit === 3 && <rect x={w.x} y={w.y} width={w.w * 0.42} height={w.h} fill="#A07A50" opacity="0.8" />}
      <rect x={w.x} y={w.y} width={w.w} height={3} fill="#151D26" opacity="0.5" />
      <rect x={w.x + w.w / 2 - 0.75} y={w.y} width={1.5} height={w.h} fill="#6B6155" opacity="0.7" />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* Chapter windows — the interactive layer                             */
/* ------------------------------------------------------------------ */

function SuiteWindow({
  cw,
  status,
  title,
  lang,
  active,
  celebrate,
  onHover,
  onActivate,
}: {
  cw: ChapterWindow;
  status: Status;
  title: string;
  lang: Lang;
  active: boolean;
  celebrate: boolean;
  onHover: (id: string | null) => void;
  onActivate: (e: React.MouseEvent<Element>, cw: ChapterWindow) => void;
}) {
  const t = dict[lang];
  const { x, y, w, h } = cw;
  const transomY = y + h * 0.28;
  const num = cw.id;
  const href = routes.chapter(lang, cw.id);
  return (
    <a
      href={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}${href}`}
      className={`cw cw--${status}${active ? ' is-active' : ''}${celebrate ? ' is-celebrating' : ''}`}
      data-chapter={cw.id}
      aria-label={`${t.chapter} ${num} — ${title}. ${t.status[status]}.`}
      onMouseEnter={() => onHover(cw.id)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onHover(cw.id)}
      onBlur={() => onHover(null)}
      onClick={(e) => onActivate(e, cw)}
    >
      <rect className="cw__hit" x={cw.hit.x} y={cw.hit.y} width={cw.hit.w} height={cw.hit.h} fill="transparent" />
      <ellipse className="cw__halo" cx={x + w / 2} cy={y + h / 2} rx={w * 0.95} ry={h * 0.95} fill="url(#halo)" />
      {/* stepped hood */}
      <path
        d={`M${cw.head.x} ${cw.head.y + cw.head.h} V${cw.head.y + 6} H${cw.head.x + 14} V${cw.head.y} H${cw.head.x + cw.head.w - 14} V${cw.head.y + 6} H${cw.head.x + cw.head.w} V${cw.head.y + cw.head.h} Z`}
        fill="#EFE8DB"
      />
      <rect x={x - 6} y={y - 2} width={w + 12} height={h + 8} fill="#3A3128" />
      <rect x={x} y={y} width={w} height={h} fill="url(#glassDark)" />
      <rect className="cw__light" x={x} y={y} width={w} height={h} fill="url(#suiteLight)" />
      {/* curtains */}
      <rect className="cw__curtain cw__curtain--l" x={x} y={transomY} width={w / 2} height={h - (transomY - y)} />
      <rect className="cw__curtain cw__curtain--r" x={x + w / 2} y={transomY} width={w / 2} height={h - (transomY - y)} />
      {/* brass mullions */}
      <g className="cw__mullions" stroke="#B49768" strokeWidth="3">
        <path d={`M${x + w / 3} ${y} V${y + h} M${x + (2 * w) / 3} ${y} V${y + h}`} />
        <path d={`M${x} ${transomY} H${x + w}`} />
      </g>
      <rect x={x} y={y} width={w} height={h} fill="none" stroke="#C8AE7D" strokeWidth="3" />
      <rect x={x - 10} y={y + h + 4} width={w + 20} height={6} fill="#EFE8DB" />
      {/* completion ornament: a brass sunburst over the hood */}
      <g className="cw__crown" aria-hidden="true">
        {Array.from({ length: 7 }, (_, i) => {
          const a = Math.PI + ((i + 1) * Math.PI) / 8;
          const cx = x + w / 2;
          const cy = cw.head.y + 1;
          return <line key={i} x1={cx + Math.cos(a) * 7} y1={cy + Math.sin(a) * 7} x2={cx + Math.cos(a) * 17} y2={cy + Math.sin(a) * 17} stroke="#C8AE7D" strokeWidth="2.4" />;
        })}
      </g>
      {/* number plaque */}
      <g className="cw__plaque">
        <rect x={cw.plaque.x} y={cw.plaque.y} width={cw.plaque.w} height={cw.plaque.h} rx={2} className="cw__plaque-bg" />
        <rect x={cw.plaque.x + 3} y={cw.plaque.y + 3} width={cw.plaque.w - 6} height={cw.plaque.h - 6} rx={1} fill="none" className="cw__plaque-line" />
        <text x={x + w / 2} y={cw.plaque.y + cw.plaque.h / 2 + 7} textAnchor="middle" className="cw__num">
          {num}
        </text>
      </g>
      <rect className="cw__focus" x={cw.hit.x - 4} y={cw.hit.y - 4} width={cw.hit.w + 8} height={cw.hit.h + 8} rx={4} />
    </a>
  );
}

export default function Facade({ lang, chapters, highlight, selected, onSelect, onActive }: Props) {
  const t = dict[lang];
  const router = useRouter();
  const progress = useProgress();
  const model = useMemo(
    () => buildModel(chapters.map((c) => ({ id: c.id, blockNumber: c.blockNumber, blockName: c.blockName }))),
    [chapters],
  );
  const byId = useMemo(() => new Map(chapters.map((c) => [c.id, c])), [chapters]);
  const [hover, setHover] = useState<string | null>(null);
  const [celebrate, setCelebrate] = useState<string | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  // prefetch chapter routes so the entrance is instant
  useEffect(() => {
    const idle = (cb: () => void) =>
      'requestIdleCallback' in window ? (window as Window & { requestIdleCallback: (c: () => void) => number }).requestIdleCallback(cb) : setTimeout(cb, 600);
    idle(() => chapters.forEach((c) => router.prefetch(routes.chapter(lang, c.id))));
  }, [chapters, lang, router]);

  // returning from a chapter: light the window that just changed
  useEffect(() => {
    const c = nav.takeCelebrate();
    const f = nav.takeFocusWindow();
    if (c) {
      setCelebrate(c);
      const timer = setTimeout(() => setCelebrate(null), 2400);
      return () => clearTimeout(timer);
    }
    if (f) {
      const el = wrapRef.current?.querySelector<SVGAElement>(`[data-chapter="${f}"]`);
      el?.focus({ preventScroll: true });
    }
    return undefined;
  }, []);

  // which suite sits closest to the middle of the screen (for the compact bar on touch devices)
  useEffect(() => {
    const els = Array.from(wrapRef.current?.querySelectorAll<SVGAElement>('.cw') ?? []);
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting);
        if (vis.length) {
          const best = vis.sort((a, b) => Math.abs(a.boundingClientRect.top + a.boundingClientRect.height / 2 - window.innerHeight / 2) - Math.abs(b.boundingClientRect.top + b.boundingClientRect.height / 2 - window.innerHeight / 2))[0];
          onActive((best.target as SVGAElement).dataset.chapter ?? null);
        }
      },
      { rootMargin: '-35% 0px -35% 0px' },
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, [onActive, model]);

  const activate = useCallback(
    (e: React.MouseEvent<Element>, cw: ChapterWindow) => {
      if (!isPlainClick(e)) return; // let the browser open new tabs etc.
      e.preventDefault();
      const coarse = window.matchMedia('(hover: none)').matches;
      if (coarse && selected !== cw.id) {
        onSelect(cw.id); // first tap selects, the compact panel offers "Enter"
        return;
      }
      const href = routes.chapter(lang, cw.id);
      nav.saveHotelScroll(window.scrollY / Math.max(1, document.documentElement.scrollHeight));
      nav.setFocusWindow(cw.id);
      const glass = (e.currentTarget.querySelector('.cw__light') as SVGGraphicsElement | null)?.getBoundingClientRect() ?? null;
      if (prefersReducedMotion()) router.push(href);
      else enterChapter(glass, href);
    },
    [lang, onSelect, router, selected],
  );

  const shown = hover ?? highlight ?? selected;
  const shownWin = shown ? model.chapterWindows.find((c) => c.id === shown) : null;
  const shownChapter = shown ? byId.get(shown) : null;

  return (
    <div className="facade" ref={wrapRef} style={{ ['--ar' as string]: `${model.W} / ${model.H}` }}>
      <svg
        className="facade__svg"
        viewBox={`0 0 ${model.W} ${model.H}`}
        role="group"
        aria-label={t.directoryTitle}
        preserveAspectRatio="xMidYMin meet"
      >
        <Architecture m={model} lang={lang} />
        <g className="f-suites">
          {[...model.chapterWindows]
            .sort((a, b) => a.index - b.index)
            .map((cw) => (
              <SuiteWindow
                key={cw.id}
                cw={cw}
                lang={lang}
                title={byId.get(cw.id)?.title ?? ''}
                status={statusOf(progress, cw.id)}
                active={shown === cw.id}
                celebrate={celebrate === cw.id}
                onHover={setHover}
                onActivate={activate}
              />
            ))}
        </g>
      </svg>
      {/* HTML label pinned in façade coordinates (percentages), so it never drifts */}
      {shownWin && shownChapter && (
        <div
          className="facade__label"
          aria-hidden="true"
          style={{
            left: pct(CX + LAYOUT.CENTRAL_BAY / 2 + 14, model.W),
            top: pct(shownWin.y + shownWin.h / 2, model.H),
          }}
          key={shownWin.id}
        >
          <span className="facade__label-num">
            {t.chapter} {shownWin.id}
          </span>
          <span className="facade__label-title">{shownChapter.title}</span>
          <span className={`facade__label-status is-${statusOf(progress, shownWin.id)}`}>{t.status[statusOf(progress, shownWin.id)]}</span>
        </div>
      )}
    </div>
  );
}

export { buildModel };
