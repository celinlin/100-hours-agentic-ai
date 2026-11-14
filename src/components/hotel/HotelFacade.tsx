'use client';

import { memo } from 'react';
import { CX, roman, STREET, type Model, type Suite } from '../../game/hotel/geometry';
import type { WindowState } from '../../game/state';

/* ------------------------------------------------------------------ */
/* Static decor: sky details, city, tower, crown, lobby, street         */
/* ------------------------------------------------------------------ */

export const HotelDecor = memo(function HotelDecor({ m }: { m: Model }) {
  const g = m.groundY;
  const [c1, c2, c3] = m.crown;
  const lob = m.lobby;
  return (
    <>
      <defs>
        <linearGradient id="hg-glass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3b5650" />
          <stop offset="0.5" stopColor="#24372f" />
          <stop offset="1" stopColor="#192620" />
        </linearGradient>
        <linearGradient id="hg-warm" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff0b8" />
          <stop offset="0.55" stopColor="#f6d77c" />
          <stop offset="1" stopColor="#d9a64a" />
        </linearGradient>
        <radialGradient id="hg-room" cx="0.5" cy="0.7" r="0.8">
          <stop offset="0" stopColor="#fff4c9" />
          <stop offset="0.5" stopColor="#f7d983" />
          <stop offset="1" stopColor="#c98f3e" />
        </radialGradient>
        <radialGradient id="hg-halo" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fee274" stopOpacity="0.5" />
          <stop offset="0.6" stopColor="#fee274" stopOpacity="0.1" />
          <stop offset="1" stopColor="#fee274" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="hg-stone" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#efe7d8" />
          <stop offset="0.55" stopColor="#e3d9c6" />
          <stop offset="1" stopColor="#c9bca5" />
        </linearGradient>
        <linearGradient id="hg-flood" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#fbe6a6" stopOpacity="0.55" />
          <stop offset="1" stopColor="#fbe6a6" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="hg-shade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0f2a20" stopOpacity="0" />
          <stop offset="1" stopColor="#0f2a20" stopOpacity="0.28" />
        </linearGradient>
        <radialGradient id="hg-lamp" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff1c4" stopOpacity="0.95" />
          <stop offset="0.3" stopColor="#f6d77c" stopOpacity="0.32" />
          <stop offset="1" stopColor="#f6d77c" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="hg-reflect" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f6d77c" stopOpacity="0.32" />
          <stop offset="1" stopColor="#f6d77c" stopOpacity="0" />
        </linearGradient>
        <pattern id="hg-flutes" width="7" height="10" patternUnits="userSpaceOnUse">
          <rect width="7" height="10" fill="#ebe3d3" />
          <rect x="3" width="1.6" height="10" fill="#cbbfa8" />
        </pattern>
        <pattern id="hg-chevron" width="14" height="9" patternUnits="userSpaceOnUse">
          <rect width="14" height="9" fill="#ddd2bf" />
          <path d="M0 7 L7 2 L14 7" fill="none" stroke="#cbbda5" strokeWidth="1.2" />
        </pattern>
        <clipPath id="hg-fanclip">
          <rect x={c3.x} y={c3.y} width={c3.w} height={c3.h} />
        </clipPath>
      </defs>

      {/* stars */}
      <g aria-hidden="true">
        {m.stars.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#f7f4ed" opacity="0.4" />
        ))}
      </g>

      {/* city, wider than the frame for wide screens */}
      <g aria-hidden="true" className="hx-city">
        <path
          d={`M-900 ${g} V${g - 760} H-760 V${g - 980} H-640 V${g - 820} H-520 V${g - 1100} H-450 V${g - 1180} H-390 V${g - 1100} H-300 V${g - 720} H-160 V${g - 900} H-40 V${g} Z`}
          fill="#3c4a44"
          opacity="0.7"
        />
        <path
          d={`M1040 ${g} V${g - 860} H1160 V${g - 1060} H1240 V${g - 1150} H1290 V${g - 1060} H1380 V${g - 780} H1520 V${g - 960} H1660 V${g - 700} H1900 V${g} Z`}
          fill="#3c4a44"
          opacity="0.7"
        />
        {[
          { x: -620, w: 230, t: 640, lit: 5 },
          { x: -360, w: 260, t: 900, lit: 7, tower: true },
          { x: -90, w: 210, t: 560, lit: 4 },
          { x: 880, w: 220, t: 620, lit: 5, tower: true },
          { x: 1100, w: 260, t: 820, lit: 6 },
          { x: 1370, w: 230, t: 540, lit: 4 },
        ].map((b, i) => (
          <g key={i}>
            <rect x={b.x} y={g - b.t} width={b.w} height={b.t} fill={i % 2 ? '#2c3732' : '#323e39'} />
            {Array.from({ length: Math.floor(b.t / 34) - 1 }, (_, r) =>
              Array.from({ length: Math.floor((b.w - 20) / 26) }, (_, c) => {
                const on = (r * 7 + c * 3 + i) % 11 === 0;
                return <rect key={`${r}-${c}`} x={b.x + 14 + c * 26} y={g - b.t + 22 + r * 34} width={11} height={16} fill={on ? '#e9c875' : '#202a26'} opacity={on ? 0.8 : 0.7} />;
              }),
            )}
            {b.tower && (
              <g>
                <path d={`M${b.x + b.w / 2 - 22} ${g - b.t} l5 -36 M${b.x + b.w / 2 + 22} ${g - b.t} l-5 -36`} stroke="#26312c" strokeWidth="3" />
                <rect x={b.x + b.w / 2 - 25} y={g - b.t - 86} width={50} height={52} fill="#2f3a35" />
                <path d={`M${b.x + b.w / 2 - 29} ${g - b.t - 86} L${b.x + b.w / 2} ${g - b.t - 108} L${b.x + b.w / 2 + 29} ${g - b.t - 86} Z`} fill="#28322e" />
              </g>
            )}
          </g>
        ))}
      </g>

      {/* the hotel */}
      <g className="hx-hotel">
        {/* spire */}
        <path d={`M${CX - 12} ${m.spire.base} L${CX - 2.5} ${m.spire.top + 12} L${CX} ${m.spire.top} L${CX + 2.5} ${m.spire.top + 12} L${CX + 12} ${m.spire.base} Z`} fill="#d8cba9" />
        <path d={`M${CX} ${m.spire.top} L${CX + 2.5} ${m.spire.top + 12} L${CX + 12} ${m.spire.base} L${CX} ${m.spire.base} Z`} fill="#ad9d7c" />
        {[0.35, 0.6, 0.8].map((k, i) => {
          const y = m.spire.top + (m.spire.base - m.spire.top) * k;
          const hw = 2 + 10 * k;
          return <rect key={i} x={CX - hw - 2} y={y} width={2 * hw + 4} height={3.5} fill="#c9b67a" />;
        })}
        <circle cx={CX} cy={m.spire.top - 3} r={3} fill="#d26a4f" />

        {/* crown */}
        {[c1, c2, c3].map((c, i) => (
          <g key={i}>
            <rect x={c.x} y={c.y} width={c.w} height={c.h} fill="url(#hg-stone)" />
            <rect x={c.x - 6} y={c.y} width={c.w + 12} height={7} fill="#f3ecdf" />
            <rect x={c.x - 6} y={c.y + 7} width={c.w + 12} height={3} fill="#b6a68a" />
            {(() => {
              const nf = Math.max(3, Math.round(c.w / 34));
              return Array.from({ length: nf }, (_, k) => (
                <rect key={k} x={c.x + 10 + (k * (c.w - 26)) / (nf - 1)} y={c.y + 14} width={6} height={c.h - 14} fill="#f4eee2" opacity="0.9" />
              ));
            })()}
            <rect x={c.x} y={c.y} width={c.w} height={c.h} fill="url(#hg-flood)" />
          </g>
        ))}
        <g clipPath="url(#hg-fanclip)">
          <circle cx={CX} cy={c3.y + c3.h} r={c3.w / 2 - 10} fill="url(#hg-warm)" />
          {Array.from({ length: 11 }, (_, i) => {
            const a = Math.PI + (i * Math.PI) / 10;
            const r = c3.w / 2 - 6;
            return <line key={i} x1={CX} y1={c3.y + c3.h} x2={CX + Math.cos(a) * r} y2={c3.y + c3.h + Math.sin(a) * r} stroke="#8f7a52" strokeWidth="2.6" />;
          })}
          <circle cx={CX} cy={c3.y + c3.h} r={(c3.w / 2 - 10) * 0.42} fill="#e8dfcf" />
          <circle cx={CX} cy={c3.y + c3.h} r={c3.w / 2 - 10} fill="none" stroke="#c9b67a" strokeWidth="3.5" />
        </g>

        {/* tiers */}
        {m.tiers.map((t) => (
          <g key={t.block}>
            <rect x={t.x} y={t.y} width={t.w} height={t.h} fill="url(#hg-chevron)" />
            {t.piers.map((p, i) => (
              <g key={i}>
                <rect x={p.x} y={p.y} width={p.w} height={p.h} fill="#ede6d8" />
                <rect x={p.x + p.w - 1.6} y={p.y} width={1.6} height={p.h} fill="#c6b9a1" />
              </g>
            ))}
            {t.deco.map((d, i) => (
              <g key={i}>
                <rect x={d.x} y={d.y} width={d.w} height={d.h} fill={t.lit[i] ? 'url(#hg-warm)' : 'url(#hg-glass)'} opacity={t.lit[i] ? 0.85 : 1} />
                <rect x={d.x} y={d.y} width={d.w} height={2.5} fill="#11201a" opacity="0.5" />
                <rect x={d.x + d.w / 2 - 0.6} y={d.y} width={1.2} height={d.h} fill="#6b6155" opacity="0.6" />
              </g>
            ))}
            {/* frieze with the block's carved name */}
            <rect x={t.frieze.x} y={t.frieze.y} width={t.frieze.w} height={t.frieze.h} fill="url(#hg-flutes)" />
            <rect x={t.frieze.x} y={t.frieze.y} width={t.frieze.w} height={5} fill="#f4eee3" />
            <rect x={t.frieze.x} y={t.frieze.y + t.frieze.h - 3} width={t.frieze.w} height={3} fill="#b2a387" />
            <rect x={CX - 118} y={t.frieze.y + 6} width={236} height={t.frieze.h - 10} fill="#ede6d8" />
            <text x={CX} y={t.frieze.y + t.frieze.h / 2 + 4.5} textAnchor="middle" className="hx-inscription">
              {`${roman(t.block)} · ${t.name.toUpperCase()}`}
            </text>
            <rect x={t.x} y={t.y} width={t.w} height={t.h} fill="url(#hg-shade)" pointerEvents="none" />
          </g>
        ))}

        {/* lobby */}
        <rect x={lob.x} y={lob.y} width={lob.w} height={lob.h} fill="#262a29" />
        <rect x={lob.x - 10} y={lob.y} width={lob.w + 20} height={18} fill="#e8dfcf" />
        <rect x={lob.x - 10} y={lob.y + 18} width={lob.w + 20} height={3} fill="#c9b67a" />
        {[-1, 1].map((side) =>
          [0, 1, 2].map((k) => {
            const x = side < 0 ? lob.x + 36 + k * 84 : lob.x + lob.w - 36 - 62 - k * 84;
            return (
              <g key={`${side}${k}`}>
                <rect x={x - 5} y={lob.y + 36} width={72} height={g - lob.y - 36} fill="#1a1d1c" />
                <rect x={x} y={lob.y + 42} width={62} height={g - lob.y - 54} fill="url(#hg-warm)" opacity="0.85" />
                <path d={`M${x + 31} ${lob.y + 42} V${g - 12} M${x} ${lob.y + 76} H${x + 62}`} stroke="#6e5a3e" strokeWidth="2.5" />
              </g>
            );
          }),
        )}
        {[0, 1, 2].map((k) => (
          <rect key={k} x={CX - 130 + k * 12} y={lob.y + 24 + k * 10} width={260 - k * 24} height={g - (lob.y + 24 + k * 10)} fill={k % 2 ? '#ddd3c2' : '#ece4d6'} />
        ))}
        <rect x={CX - 92} y={lob.y + 58} width={184} height={g - lob.y - 58} fill="#151716" />
        <rect x={CX - 86} y={lob.y + 63} width={172} height={g - lob.y - 63} fill="url(#hg-warm)" />
        <g stroke="#7a6342" strokeWidth="2.5" fill="none">
          {[-60, -30, 0, 30, 60].map((dx) => (
            <path key={dx} d={`M${CX + dx} ${lob.y + 63} V${g - 92}`} />
          ))}
          <path d={`M${CX - 86} ${lob.y + 100} L${CX} ${lob.y + 70} L${CX + 86} ${lob.y + 100}`} />
        </g>
        {/* marquee with the sign */}
        <path d={`M${CX - 176} ${g - 100} L${CX - 132} ${g - 150} M${CX + 176} ${g - 100} L${CX + 132} ${g - 150}`} stroke="#5e4c33" strokeWidth="2.5" />
        <rect x={CX - 188} y={g - 110} width={376} height={28} fill="#1d2120" />
        <rect x={CX - 188} y={g - 110} width={376} height={2.5} fill="#e3cf8f" />
        <text x={CX} y={g - 91.5} textAnchor="middle" className="hx-sign">
          100 HOURS OF AGENTIC AI
        </text>
        <rect x={CX - 184} y={g - 82} width={368} height={2.5} fill="#fff1c4" opacity="0.9" />
        <rect x={CX - 184} y={g - 80} width={368} height={40} fill="url(#hg-reflect)" />
        {[-1, 0, 1].map((k) => (
          <g key={k}>
            <rect x={CX + k * 54 - 24} y={g - 74} width={48} height={74} fill="#fbe8b6" opacity="0.92" />
            <rect x={CX + k * 54 - 24} y={g - 74} width={48} height={74} fill="none" stroke="#7a6342" strokeWidth="4" />
            <path d={`M${CX + k * 54} ${g - 74} V${g}`} stroke="#7a6342" strokeWidth="1.6" />
          </g>
        ))}
        {[-1, 1].map((side) => (
          <g key={side}>
            <circle cx={CX + side * 150} cy={g - 128} r={30} fill="url(#hg-lamp)" />
            <rect x={CX + side * 150 - 6} y={g - 140} width={12} height={22} rx={2} fill="#fbe8b6" stroke="#5e4c33" strokeWidth="2.5" />
          </g>
        ))}
      </g>

      {/* street */}
      <g aria-hidden="true">
        <rect x={-900} y={g} width={2800} height={28} fill="#76736d" />
        <rect x={-900} y={g + 22} width={2800} height={6} fill="#a29e96" />
        <rect x={-900} y={g + 28} width={2800} height={STREET - 28} fill="#1d2320" />
        <rect x={CX - 200} y={g + 28} width={400} height={STREET - 28} fill="url(#hg-reflect)" opacity="0.7" />
        {[90, 910, -380, 1380].map((x) => (
          <g key={x}>
            <circle cx={x + 18} cy={g - 156} r={40} fill="url(#hg-lamp)" />
            <rect x={x - 2.5} y={g - 160} width={5} height={162} fill="#252b29" />
            <path d={`M${x} ${g - 160} q 2 -16 18 -13`} stroke="#252b29" strokeWidth="4" fill="none" />
            <path d={`M${x + 11} ${g - 170} h14 l-2.5 10 h-9 Z`} fill="#fbe8b6" />
          </g>
        ))}
      </g>
    </>
  );
});

/* ------------------------------------------------------------------ */
/* A suite window, four states                                          */
/* ------------------------------------------------------------------ */

export function SuiteWindow({
  s,
  state,
  active,
  opening,
  unlocking,
}: {
  s: Suite;
  state: WindowState;
  active: boolean;
  opening: boolean;
  unlocking: boolean;
}) {
  const { x, y, w, h } = s;
  const arch = 22; // height of the stepped head
  const glassTop = y + arch;
  const head = `M${x} ${glassTop} V${y + 12} H${x + 14} V${y + 5} H${x + 28} V${y} H${x + w - 28} V${y + 5} H${x + w - 14} V${y + 12} H${x + w} V${glassTop}`;
  const shape = `${head} V${y + h} H${x} Z`;
  return (
    <g className={`sw sw--${state}${active ? ' is-active' : ''}${opening ? ' is-opening' : ''}${unlocking ? ' is-unlocking' : ''}`}>
      <ellipse className="sw__halo" cx={x + w / 2} cy={y + h / 2} rx={w} ry={h * 0.85} fill="url(#hg-halo)" />
      {/* bronze surround */}
      <path
        d={`M${x - 5} ${glassTop} V${y + 8} H${x + 10} V${y + 1} H${x + 25} V${y - 4} H${x + w - 25} V${y + 1} H${x + w - 10} V${y + 8} H${x + w + 5} V${y + h + 4} H${x - 5} Z`}
        fill="#2d2721"
      />
      {/* the room behind */}
      <path d={shape} fill="url(#hg-glass)" />
      <path d={shape} className="sw__room" fill="url(#hg-room)" />
      {/* a glimpse of the interior: lamp + table silhouette */}
      <g className="sw__interior" opacity="0.55">
        <path d={`M${x + w * 0.62} ${y + h - 10} v-26 m-7 0 h14 l-4 -12 h-6 z`} fill="#8a6a3c" />
        <rect x={x + w * 0.18} y={y + h - 24} width={w * 0.34} height={4} fill="#8a6a3c" />
        <rect x={x + w * 0.22} y={y + h - 20} width={3} height={20} fill="#8a6a3c" />
        <rect x={x + w * 0.46} y={y + h - 20} width={3} height={20} fill="#8a6a3c" />
      </g>
      {/* curtains */}
      <rect className="sw__curtain sw__curtain--l" x={x} y={glassTop} width={w / 2} height={h - arch} />
      <rect className="sw__curtain sw__curtain--r" x={x + w / 2} y={glassTop} width={w / 2} height={h - arch} />
      {/* mullions */}
      <g stroke="#c9b67a" strokeWidth="2.4" fill="none">
        <path d={`M${x + w / 2} ${y} V${y + h}`} />
        <path d={`M${x} ${glassTop + 10} H${x + w}`} />
        <path d={head} />
      </g>
      <path d={shape} fill="none" stroke="#d6c58f" strokeWidth="2.6" />
      {/* shutters (closed when locked, swing open when available) */}
      <g className="sw__shutters">
        <g className="sw__shutter sw__shutter--l">
          <rect x={x} y={glassTop} width={w / 2} height={h - arch} fill="#24453a" />
          {Array.from({ length: 9 }, (_, i) => (
            <rect key={i} x={x + 5} y={glassTop + 6 + i * ((h - arch - 12) / 9)} width={w / 2 - 10} height={2.2} fill="#18322a" />
          ))}
          <rect x={x} y={glassTop} width={w / 2} height={h - arch} fill="none" stroke="#173027" strokeWidth="2" />
        </g>
        <g className="sw__shutter sw__shutter--r">
          <rect x={x + w / 2} y={glassTop} width={w / 2} height={h - arch} fill="#24453a" />
          {Array.from({ length: 9 }, (_, i) => (
            <rect key={i} x={x + w / 2 + 5} y={glassTop + 6 + i * ((h - arch - 12) / 9)} width={w / 2 - 10} height={2.2} fill="#18322a" />
          ))}
          <rect x={x + w / 2} y={glassTop} width={w / 2} height={h - arch} fill="none" stroke="#173027" strokeWidth="2" />
        </g>
      </g>
      {/* sill */}
      <rect x={x - 9} y={y + h + 2} width={w + 18} height={4} fill="#f1eadc" />
      {/* completion crest */}
      <g className="sw__crest">
        {Array.from({ length: 7 }, (_, i) => {
          const a = Math.PI + ((i + 1) * Math.PI) / 8;
          return <line key={i} x1={x + w / 2 + Math.cos(a) * 6} y1={y - 6 + Math.sin(a) * 6} x2={x + w / 2 + Math.cos(a) * 15} y2={y - 6 + Math.sin(a) * 15} stroke="#e7cd6e" strokeWidth="2.2" />;
        })}
      </g>
      {/* plaque */}
      <rect x={s.plaque.x} y={s.plaque.y} width={s.plaque.w} height={s.plaque.h} rx={1.5} className="sw__plaque" />
      <text x={x + w / 2} y={s.plaque.y + s.plaque.h - 4} textAnchor="middle" className="sw__num">
        {s.id}
      </text>
      <rect x={s.cell.x} y={s.cell.y} width={s.cell.w} height={s.cell.h} rx={4} className="sw__focus" />
    </g>
  );
}
