import { INK, Shadow, type PropFn } from './common';

/** 11 · The control room */

const TEAL = '#3f7a74';
const SIGNAL = '#b5523b';

/** A ticker machine printing one trace line per event on a paper tape. */
export const c11_ticker: PropFn = ({ x, y }) => (
  <g>
    <Shadow x={x} y={y + 122} w={210} />
    {/* pedestal */}
    <path d={`M${x - 56} ${y + 120} h112 l-12 -14 h-88 z`} fill={INK.bronze} />
    <rect x={x - 14} y={y + 20} width="28" height="88" fill={INK.bronzeLight} />
    {/* glass dome */}
    <rect x={x - 70} y={y + 4} width="140" height="20" rx="4" fill={INK.wood} />
    <path d={`M${x - 58} ${y + 4} V${y - 60} A58 58 0 0 1 ${x + 58} ${y - 60} V${y + 4} Z`} fill={INK.glow} opacity="0.35" />
    <path d={`M${x - 58} ${y + 4} V${y - 60} A58 58 0 0 1 ${x + 58} ${y - 60} V${y + 4}`} fill="none" stroke={INK.brass} strokeWidth="3" />
    {/* mechanism */}
    <rect x={x - 34} y={y - 40} width="68" height="44" rx="6" fill={INK.greenDeep} />
    <circle cx={x - 14} cy={y - 18} r="12" fill={INK.brass} />
    <circle cx={x - 14} cy={y - 18} r="4" fill={INK.bronze} />
    <rect x={x + 6} y={y - 30} width="20" height="8" fill={TEAL} />
    <rect x={x + 6} y={y - 16} width="20" height="8" fill={SIGNAL} />
    {/* paper tape coming out and curling down */}
    <path d={`M${x + 34} ${y - 6} H${x + 96} Q${x + 118} ${y - 6} ${x + 118} ${y + 16} V${y + 70} Q${x + 118} ${y + 84} ${x + 104} ${y + 84} H${x + 86}`} fill="none" stroke={INK.paper} strokeWidth="16" />
    {[0, 1, 2, 3].map((i) => (
      <rect key={i} x={x + 42 + i * 14} y={y - 9} width="9" height="5" fill={i === 2 ? SIGNAL : INK.bronzeLight} />
    ))}
    {[0, 1, 2].map((i) => (
      <rect key={i} x={x + 115} y={y + 22 + i * 16} width="6" height="9" fill={INK.bronzeLight} />
    ))}
    <text x={x} y={y + 18} textAnchor="middle" fontSize="10" fill={INK.light} fontFamily="var(--mono)">
      traces.jsonl
    </text>
  </g>
);

/** A wall board where the turns of one case are pinned and linked, the error flagged. */
export const c11_traceboard: PropFn = ({ x, y }) => (
  <g>
    <rect x={x - 130} y={y - 120} width="260" height="220" fill={INK.bronze} />
    <rect x={x - 118} y={y - 108} width="236" height="196" fill={INK.cream} />
    <rect x={x - 118} y={y - 108} width="236" height="24" fill={INK.greenDeep} />
    <text x={x} y={y - 91} textAnchor="middle" fontSize="12" fill={INK.light} fontFamily="var(--mono)">
      cas 12
    </text>
    {/* five turns, linked */}
    <path d={`M${x - 90} ${y - 50} L${x - 40} ${y - 20} L${x + 4} ${y - 50} L${x + 48} ${y - 10} L${x + 90} ${y + 30}`} fill="none" stroke={INK.bronzeLight} strokeWidth="2.5" />
    {[
      [-90, -50],
      [-40, -20],
      [4, -50],
      [48, -10],
      [90, 30],
    ].map(([dx, dy], i) => (
      <g key={i}>
        <rect x={x + dx - 16} y={y + dy - 12} width="32" height="24" rx="3" fill={i === 2 ? SIGNAL : TEAL} />
        <text x={x + dx} y={y + dy + 5} textAnchor="middle" fontSize="11" fill={INK.paper} fontFamily="var(--mono)">
          {i + 1}
        </text>
      </g>
    ))}
    {/* the backwards arrow, from the end to the cause */}
    <path d={`M${x + 84} ${y + 58} Q${x + 30} ${y + 76} ${x + 4} ${y - 30}`} fill="none" stroke={SIGNAL} strokeWidth="2.5" strokeDasharray="6 5" />
    <path d={`M${x - 4} ${y - 22} L${x + 4} ${y - 34} L${x + 12} ${y - 22}`} fill="none" stroke={SIGNAL} strokeWidth="2.5" />
    {/* brass pins at the corners */}
    {[
      [-122, -112],
      [122, -112],
      [-122, 92],
      [122, 92],
    ].map(([dx, dy], i) => (
      <circle key={i} cx={x + dx} cy={y + dy} r="5" fill={INK.brass} />
    ))}
  </g>
);

/** The control desk: a slanted console with a screen of JSON lines and switches. */
export const c11_console: PropFn = ({ x, y }) => (
  <g>
    <Shadow x={x} y={y + 92} w={330} />
    <rect x={x - 156} y={y + 10} width="312" height="80" rx="6" fill={INK.bronze} />
    <path d={`M${x - 156} ${y + 10} L${x - 132} ${y - 34} H${x + 132} L${x + 156} ${y + 10} Z`} fill={INK.bronzeLight} />
    {/* screen */}
    <rect x={x - 80} y={y - 116} width="160" height="84" rx="8" fill={INK.greenDeep} />
    <rect x={x - 80} y={y - 116} width="160" height="84" rx="8" fill="none" stroke={INK.brass} strokeWidth="4" />
    {[44, 72, 58, 90, 36].map((w, i) => (
      <rect key={i} x={x - 66} y={y - 104 + i * 13} width={w + (i === 3 ? 30 : 0)} height="6" rx="2" fill={i === 3 ? SIGNAL : INK.light} opacity={i === 3 ? 1 : 0.75} />
    ))}
    <rect x={x - 10} y={y - 32} width="20" height="10" fill={INK.bronze} />
    {/* switches and knobs on the slant */}
    {Array.from({ length: 6 }, (_, i) => (
      <g key={i}>
        <rect x={x - 120 + i * 18} y={y - 22} width="8" height="22" rx="3" fill={INK.cream} />
        <rect x={x - 120 + i * 18} y={y - (i % 2 ? 22 : 10)} width="8" height="10" rx="3" fill={i === 4 ? SIGNAL : INK.brass} />
      </g>
    ))}
    {[0, 1, 2].map((i) => (
      <circle key={i} cx={x + 40 + i * 32} cy={y - 10} r="10" fill={TEAL} stroke={INK.brass} strokeWidth="2" />
    ))}
    <rect x={x - 40} y={y + 30} width="80" height="20" rx="3" fill={INK.greenDeep} />
    <text x={x} y={y + 44} textAnchor="middle" fontSize="11" fill={INK.light} fontFamily="var(--mono)">
      flush()
    </text>
  </g>
);

/** The cost meter: a cash-register counter turning tokens into euros. */
export const c11_meter: PropFn = ({ x, y }) => (
  <g>
    <Shadow x={x} y={y + 122} w={230} />
    {/* cabinet */}
    <rect x={x - 100} y={y + 10} width="200" height="110" fill={INK.wood} />
    <rect x={x - 88} y={y + 24} width="176" height="82" fill="none" stroke={INK.brass} strokeWidth="2" />
    <rect x={x - 30} y={y + 56} width="60" height="10" rx="5" fill={INK.brass} />
    {/* register body */}
    <path d={`M${x - 90} ${y + 10} L${x - 70} ${y - 70} H${x + 70} L${x + 90} ${y + 10} Z`} fill={INK.bronze} />
    {/* number drums */}
    <rect x={x - 62} y={y - 110} width="124" height="44" rx="6" fill={INK.brass} />
    {['0', ',', '0', '7', '5'].map((d, i) => (
      <g key={i}>
        <rect x={x - 54 + i * 22} y={y - 102} width="18" height="28" fill={d === ',' ? INK.brass : INK.paper} />
        <text x={x - 45 + i * 22} y={y - 82} textAnchor="middle" fontSize="13" fill={INK.bronze} fontFamily="var(--mono)">
          {d}
        </text>
      </g>
    ))}
    <text x={x + 76} y={y - 82} textAnchor="middle" fontSize="13" fill={INK.brass} fontFamily="var(--mono)">
      €
    </text>
    {/* keys: input / output */}
    {Array.from({ length: 2 }, (_, r) =>
      Array.from({ length: 5 }, (_, c) => (
        <circle key={`${r}-${c}`} cx={x - 48 + c * 24 + r * 6} cy={y - 44 + r * 26} r="8" fill={r === 0 ? TEAL : SIGNAL} stroke={INK.brass} strokeWidth="1.5" />
      )),
    )}
    {/* crank */}
    <rect x={x + 90} y={y - 30} width="30" height="8" rx="4" fill={INK.brassDeep} />
    <rect x={x + 114} y={y - 54} width="8" height="32" rx="4" fill={INK.brassDeep} />
    <circle cx={x + 118} cy={y - 58} r="8" fill={INK.brass} />
  </g>
);

/** A wall panel of four dials: time, quality, cost, adoption. */
export const c11_gauges: PropFn = ({ x, y }) => (
  <g>
    <rect x={x - 110} y={y - 130} width="220" height="250" rx="10" fill={INK.bronze} />
    <rect x={x - 98} y={y - 118} width="196" height="226" rx="6" fill={INK.greenDeep} />
    {[
      [-48, -58, 'temps', -0.6],
      [48, -58, 'qualité', 0.4],
      [-48, 50, 'coût', -1.1],
      [48, 50, 'adoption', 0.9],
    ].map(([dx, dy, label, a], i) => {
      const cx = x + (dx as number);
      const cy = y + (dy as number);
      const ang = (a as number) - Math.PI / 2;
      return (
        <g key={i}>
          <circle cx={cx} cy={cy} r="38" fill={INK.paper} stroke={INK.brass} strokeWidth="4" />
          <path d={`M${cx - 30} ${cy} A30 30 0 0 1 ${cx + 30} ${cy}`} fill="none" stroke={i === 2 ? SIGNAL : TEAL} strokeWidth="6" />
          <line x1={cx} y1={cy} x2={cx + Math.cos(ang) * 28} y2={cy + Math.sin(ang) * 28} stroke={INK.bronze} strokeWidth="3" strokeLinecap="round" />
          <circle cx={cx} cy={cy} r="5" fill={INK.brass} />
          <text x={cx} y={cy + 24} textAnchor="middle" fontSize="10" fill={INK.bronze} fontFamily="var(--mono)">
            {label}
          </text>
        </g>
      );
    })}
  </g>
);

/** Reward: the ship's chronometer — a brass stopwatch that times every turn. */
export const c11_chrono: PropFn = ({ x, y }) => (
  <g>
    <rect x={x - 14} y={y - 104} width="28" height="18" rx="4" fill={INK.brass} />
    <rect x={x - 6} y={y - 90} width="12" height="12" fill={INK.brassDeep} />
    <rect x={x + 52} y={y - 82} width="22" height="12" rx="3" fill={INK.brass} transform={`rotate(40 ${x + 63} ${y - 76})`} />
    <circle cx={x} cy={y} r="80" fill={INK.brass} />
    <circle cx={x} cy={y} r="68" fill={INK.paper} />
    {Array.from({ length: 12 }, (_, i) => {
      const a = (i * Math.PI) / 6;
      return <rect key={i} x={x - 2} y={y - 64} width="4" height={i % 3 ? 8 : 14} fill={INK.bronze} transform={`rotate(${(a * 180) / Math.PI} ${x} ${y})`} />;
    })}
    <path d={`M${x} ${y} L${x} ${y - 60} A60 60 0 0 1 ${x + 52} ${y - 30} Z`} fill={TEAL} opacity="0.55" />
    <line x1={x} y1={y} x2={x + 46} y2={y - 26} stroke={SIGNAL} strokeWidth="4" strokeLinecap="round" />
    <circle cx={x} cy={y} r="7" fill={INK.bronze} />
    <text x={x} y={y + 38} textAnchor="middle" fontSize="12" fill={INK.bronze} fontFamily="var(--mono)">
      840 ms
    </text>
  </g>
);
