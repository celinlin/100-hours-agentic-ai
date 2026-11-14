'use client';

import { memo } from 'react';
import type { ChapterGame, RoomStyle, Station } from '../types';
import { PROPS } from '../props';

export const RW = 1600;
export const RH = 900;
const FLOOR = 640;

/** Wallpaper motifs, drawn in the room's deep wall tone. */
function Motif({ style }: { style: RoomStyle }) {
  const c = style.wallDeep;
  switch (style.motif) {
    case 'fan':
      return (
        <pattern id="rm-motif" width="80" height="60" patternUnits="userSpaceOnUse">
          {[0, 40].map((ox, k) => (
            <g key={k} transform={`translate(${ox} ${k * 30})`}>
              <path d="M0 30 A30 30 0 0 1 60 30" fill="none" stroke={c} strokeWidth="1.2" />
              <path d="M10 30 A20 20 0 0 1 50 30 M30 30 V0 M30 30 L9 9 M30 30 L51 9" fill="none" stroke={c} strokeWidth="1" />
            </g>
          ))}
        </pattern>
      );
    case 'grid':
      return (
        <pattern id="rm-motif" width="44" height="44" patternUnits="userSpaceOnUse">
          <rect x="0.5" y="0.5" width="43" height="43" fill="none" stroke={c} strokeWidth="1" />
          <rect x="18" y="18" width="8" height="8" fill="none" stroke={c} strokeWidth="1" transform="rotate(45 22 22)" />
        </pattern>
      );
    case 'stripes':
      return (
        <pattern id="rm-motif" width="36" height="10" patternUnits="userSpaceOnUse">
          <rect x="0" width="2" height="10" fill={c} />
          <rect x="8" width="10" height="10" fill={c} opacity="0.35" />
        </pattern>
      );
    case 'diamond':
      return (
        <pattern id="rm-motif" width="48" height="64" patternUnits="userSpaceOnUse">
          <path d="M24 2 L46 32 L24 62 L2 32 Z" fill="none" stroke={c} strokeWidth="1.1" />
          <circle cx="24" cy="32" r="2.5" fill={c} />
        </pattern>
      );
    case 'arch':
      return (
        <pattern id="rm-motif" width="60" height="80" patternUnits="userSpaceOnUse">
          <path d="M8 80 V34 A22 22 0 0 1 52 34 V80" fill="none" stroke={c} strokeWidth="1.2" />
          <path d="M18 80 V38 A12 12 0 0 1 42 38 V80" fill="none" stroke={c} strokeWidth="0.8" />
        </pattern>
      );
    case 'chevron':
    default:
      return (
        <pattern id="rm-motif" width="40" height="24" patternUnits="userSpaceOnUse">
          <path d="M0 18 L20 6 L40 18" fill="none" stroke={c} strokeWidth="1.3" />
          <path d="M0 24 L20 12 L40 24" fill="none" stroke={c} strokeWidth="0.7" opacity="0.6" />
        </pattern>
      );
  }
}

/** The architecture of every room: same hotel, same hand. */
export const RoomBackdrop = memo(function RoomBackdrop({ style }: { style: RoomStyle }) {
  return (
    <g>
      <defs>
        <Motif style={style} />
        <linearGradient id="rm-night" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0d1c17" />
          <stop offset="0.7" stopColor="#24382f" />
          <stop offset="1" stopColor="#5a5f4d" />
        </linearGradient>
        <linearGradient id="rm-cone" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff3c4" stopOpacity="0.42" />
          <stop offset="1" stopColor="#fff3c4" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="rm-pool" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff3c4" stopOpacity="0.35" />
          <stop offset="1" stopColor="#fff3c4" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="rm-vignette" cx="0.5" cy="0.45" r="0.75">
          <stop offset="0.55" stopColor="#0b1612" stopOpacity="0" />
          <stop offset="1" stopColor="#0b1612" stopOpacity="0.55" />
        </radialGradient>
        <pattern id="rm-parquet" width="64" height="32" patternUnits="userSpaceOnUse">
          <rect width="64" height="32" fill={style.floor} />
          <path d="M0 32 L32 0 M32 32 L64 0" stroke="#000" strokeOpacity="0.16" strokeWidth="1.2" />
          <path d="M0 0 L32 32 M32 0 L64 32" stroke="#fff" strokeOpacity="0.05" strokeWidth="6" />
        </pattern>
      </defs>
      {/* wall */}
      <rect width={RW} height={FLOOR} fill={style.wall} />
      <rect width={RW} height={FLOOR} fill="url(#rm-motif)" opacity="0.55" />
      {/* crown moulding */}
      <rect width={RW} height="34" fill="#efe7d8" />
      <rect y="34" width={RW} height="6" fill="#c9b67a" />
      <rect y="40" width={RW} height="10" fill="#000" opacity="0.08" />
      {/* tall window on the city */}
      <g>
        <path d="M640 560 V210 A160 160 0 0 1 960 210 V560 Z" fill="#2d2721" />
        <path d="M652 552 V214 A148 148 0 0 1 948 214 V552 Z" fill="url(#rm-night)" />
        <g fill="#1a2621">
          <rect x="660" y="430" width="70" height="122" />
          <rect x="740" y="390" width="52" height="162" />
          <rect x="802" y="452" width="80" height="100" />
          <rect x="890" y="410" width="56" height="142" />
        </g>
        <g fill="#e9c875" opacity="0.8">
          {[
            [672, 448],
            [700, 476],
            [752, 410],
            [770, 452],
            [820, 470],
            [856, 500],
            [904, 430],
            [920, 470],
          ].map(([x, y], i) => (
            <rect key={i} x={x} y={y} width="7" height="10" />
          ))}
        </g>
        <circle cx="880" cy="270" r="18" fill="#f3ecd6" opacity="0.85" />
        <g stroke="#c9b67a" strokeWidth="5" fill="none">
          <path d="M800 64 V552" />
          <path d="M652 330 H948" />
          <path d="M652 214 A148 148 0 0 1 948 214" />
        </g>
        {/* drapes */}
        <path d="M600 52 C 640 200, 610 420, 650 620 L 600 620 Z" fill={style.accent} />
        <path d="M1000 52 C 960 200, 990 420, 950 620 L 1000 620 Z" fill={style.accent} />
        <path d="M600 52 C 640 200, 610 420, 650 620" fill="none" stroke="#000" strokeOpacity="0.2" strokeWidth="3" />
        <path d="M1000 52 C 960 200, 990 420, 950 620" fill="none" stroke="#000" strokeOpacity="0.2" strokeWidth="3" />
        <rect x="586" y="46" width="428" height="10" rx="5" fill="#c9b67a" />
      </g>
      {/* wainscot */}
      <rect y="470" width={RW} height={FLOOR - 470} fill={style.wallDeep} />
      <rect y="466" width={RW} height="6" fill="#c9b67a" />
      {Array.from({ length: 10 }, (_, i) => (
        <rect key={i} x={30 + i * 160} y="492" width="130" height="126" fill="none" stroke="#000" strokeOpacity="0.18" strokeWidth="2" />
      ))}
      <rect y={FLOOR - 14} width={RW} height="14" fill="#2b2620" />
      {/* floor */}
      <rect y={FLOOR} width={RW} height={RH - FLOOR} fill="url(#rm-parquet)" />
      <rect y={FLOOR} width={RW} height={RH - FLOOR} fill="#000" opacity="0.12" />
      <ellipse cx="800" cy="780" rx="560" ry="90" fill={style.accent} opacity="0.55" />
      <ellipse cx="800" cy="780" rx="530" ry="78" fill="none" stroke="#c9b67a" strokeWidth="2" opacity="0.7" />
      {/* pendant lamps */}
      {[360, 1240].map((x) => (
        <g key={x}>
          <path d={`M${x} 40 V128`} stroke="#2b2620" strokeWidth="2" />
          <path d={`M${x - 150} 900 L${x - 30} 160 L${x + 30} 160 L${x + 150} 900 Z`} fill="url(#rm-cone)" />
          <path d={`M${x - 34} 160 L${x - 18} 128 H${x + 18} L${x + 34} 160 Z`} fill="#c9b67a" />
          <ellipse cx={x} cy="161" rx="34" ry="5" fill="#fff3c4" />
          <ellipse cx={x} cy="790" rx="190" ry="40" fill="url(#rm-pool)" />
        </g>
      ))}
    </g>
  );
});

export function RoomVignette() {
  return <rect width={RW} height={RH} fill="url(#rm-vignette)" pointerEvents="none" />;
}

/** A station hotspot: the prop + a number tag + an invisible generous hit area. */
export function Hotspot({
  st,
  index,
  style,
  solved,
  active,
  label,
  onOpen,
}: {
  st: Station;
  index: number;
  style: RoomStyle;
  solved: boolean;
  active: boolean;
  label: string;
  onOpen: () => void;
}) {
  const Prop = PROPS[st.prop];
  return (
    <g
      className={`hs${solved ? ' is-solved' : ''}${active ? ' is-active' : ''}`}
      role="button"
      tabIndex={0}
      aria-label={label}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen();
        }
      }}
    >
      <ellipse className="hs__glow" cx={st.at.x} cy={st.at.y} rx="170" ry="150" fill="url(#rm-pool)" />
      <g className="hs__prop">{Prop ? <Prop x={st.at.x} y={st.at.y} style={style} /> : <circle cx={st.at.x} cy={st.at.y} r="40" fill={style.accent} />}</g>
      <rect className="hs__hit" x={st.at.x - 140} y={st.at.y - 150} width="280" height="260" fill="transparent" />
      <g className="hs__tag" transform={`translate(${st.at.x} ${st.at.y - 168})`}>
        <circle r="17" className="hs__tag-bg" />
        <text y="5.5" textAnchor="middle" className="hs__tag-num">
          {index + 1}
        </text>
      </g>
      <rect className="hs__focus" x={st.at.x - 146} y={st.at.y - 190} width="292" height="306" rx="14" />
    </g>
  );
}

export function RoomStage({ game, children }: { game: ChapterGame; children: React.ReactNode }) {
  return (
    <svg className="room-svg" viewBox={`0 0 ${RW} ${RH}`} preserveAspectRatio="xMidYMid meet" role="group" aria-label={game.room.name.en}>
      <RoomBackdrop style={game.room.style} />
      {children}
      <RoomVignette />
    </svg>
  );
}
