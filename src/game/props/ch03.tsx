import { INK, Shadow, type PropFn } from './common';

/** 03 · The tool workshop */

const STEEL = '#8c9a9c';
const RUST = '#9a4a2c';

/** The workbench where the loop is built: model box, code box, a ring of pipe and a turn counter. */
export const c03_bench: PropFn = ({ x, y }) => (
  <g>
    <Shadow x={x} y={y + 112} w={320} />
    {/* bench */}
    <rect x={x - 156} y={y + 30} width="312" height="18" fill={INK.wood} />
    <rect x={x - 150} y={y + 48} width="300" height="8" fill={INK.woodLight} />
    <rect x={x - 144} y={y + 56} width="16" height="54" fill={INK.wood} />
    <rect x={x + 128} y={y + 56} width="16" height="54" fill={INK.wood} />
    <rect x={x - 128} y={y + 88} width="256" height="8" fill={INK.wood} />
    {/* vise */}
    <rect x={x - 156} y={y + 14} width="28" height="16" fill={STEEL} />
    <rect x={x - 168} y={y + 18} width="12" height="8" fill={INK.bronze} />
    {/* model box */}
    <rect x={x - 120} y={y - 70} width="90" height="100" rx="10" fill={INK.green} />
    <rect x={x - 110} y={y - 60} width="70" height="40" rx="6" fill={INK.greenDeep} />
    <text x={x - 75} y={y - 36} textAnchor="middle" fontSize="11" fill={INK.light} fontFamily="var(--mono)">
      tool_use
    </text>
    <rect x={x - 104} y={y - 8} width="58" height="7" rx="3" fill={INK.brass} />
    {/* code box */}
    <rect x={x + 30} y={y - 70} width="90" height="100" rx="10" fill={INK.light} />
    <circle cx={x + 75} cy={y - 28} r="24" fill="none" stroke={INK.bronze} strokeWidth="5" />
    {Array.from({ length: 8 }, (_, i) => {
      const a = (i * Math.PI) / 4;
      return <rect key={i} x={x + 72 + Math.cos(a) * 26} y={y - 31 + Math.sin(a) * 26} width="6" height="6" fill={INK.bronze} />;
    })}
    <circle cx={x + 75} cy={y - 28} r="7" fill={INK.bronze} />
    {/* pipe: request out over the top, result back underneath */}
    <path d={`M${x - 75} ${y - 70} V${y - 96} H${x + 75} V${y - 70}`} fill="none" stroke={INK.brass} strokeWidth="6" />
    <path d={`M${x + 67} ${y - 80} L${x + 75} ${y - 70} L${x + 83} ${y - 80}`} fill="none" stroke={INK.brass} strokeWidth="4" />
    <path d={`M${x - 30} ${y + 12} H${x + 30}`} stroke={INK.brassDeep} strokeWidth="6" />
    <path d={`M${x - 20} ${y + 4} L${x - 30} ${y + 12} L${x - 20} ${y + 20}`} fill="none" stroke={INK.brassDeep} strokeWidth="4" />
    {/* turn counter */}
    <rect x={x - 26} y={y - 60} width="52" height="34" rx="4" fill={INK.bronze} />
    <text x={x} y={y - 38} textAnchor="middle" fontSize="12" fill={INK.light} fontFamily="var(--mono)">
      3/8
    </text>
    <rect x={x - 44} y={y + 60} width="88" height="20" rx="3" fill={INK.greenDeep} />
    <text x={x} y={y + 74} textAnchor="middle" fontSize="11" fill={INK.light} fontFamily="var(--mono)">
      max_tours
    </text>
  </g>
);

/** A pegboard on the wall: labelled tools hang in their outlines; one slot waits for a new tool. */
export const c03_toolwall: PropFn = ({ x, y }) => (
  <g>
    <rect x={x - 140} y={y - 110} width="280" height="210" fill={INK.bronze} />
    <rect x={x - 130} y={y - 100} width="260" height="190" fill={INK.bronzeLight} />
    {Array.from({ length: 6 }, (_, r) =>
      Array.from({ length: 12 }, (_, c) => <circle key={`${r}-${c}`} cx={x - 118 + c * 21.5} cy={y - 88 + r * 33} r="2" fill={INK.bronze} />),
    )}
    {/* spanner */}
    <rect x={x - 102} y={y - 70} width="12" height="90" rx="4" fill={STEEL} />
    <path d={`M${x - 90} ${y - 95} A18 18 0 1 1 ${x - 102} ${y - 95} L${x - 102} ${y - 80} L${x - 90} ${y - 80} Z`} fill={STEEL} />
    <rect x={x - 126} y={y + 34} width="60" height="20" fill={INK.paper} />
    <text x={x - 96} y={y + 48} textAnchor="middle" fontSize="9" fontFamily="var(--mono)" fill={INK.bronze}>
      calendrier
    </text>
    {/* magnifier */}
    <circle cx={x - 18} cy={y - 50} r="24" fill="none" stroke={INK.brass} strokeWidth="7" />
    <circle cx={x - 18} cy={y - 50} r="17" fill={INK.glow} opacity="0.6" />
    <rect x={x - 24} y={y - 22} width="12" height="48" rx="4" fill={INK.wood} />
    <rect x={x - 46} y={y + 34} width="56" height="20" fill={INK.paper} />
    <text x={x - 18} y={y + 48} textAnchor="middle" fontSize="9" fontFamily="var(--mono)" fill={INK.bronze}>
      recherche
    </text>
    {/* empty outline slot */}
    <rect x={x + 44} y={y - 74} width="60" height="96" rx="6" fill="none" stroke={INK.cream} strokeWidth="2" strokeDasharray="6 5" />
    <rect x={x + 44} y={y + 34} width="60" height="20" fill={INK.light} />
    <text x={x + 74} y={y + 48} textAnchor="middle" fontSize="9" fontFamily="var(--mono)" fill={INK.bronze}>
      ?
    </text>
    {/* deco crown */}
    <path d={`M${x - 60} ${y - 110} L${x} ${y - 132} L${x + 60} ${y - 110} Z`} fill={INK.brass} />
  </g>
);

/** A drafting table with a sheet of code: the loop being written. */
export const c03_drafting: PropFn = ({ x, y }) => (
  <g>
    <Shadow x={x} y={y + 122} w={220} />
    {/* legs */}
    <path d={`M${x - 80} ${y + 120} L${x - 40} ${y + 20}`} stroke={INK.wood} strokeWidth="12" />
    <path d={`M${x + 80} ${y + 120} L${x + 40} ${y + 20}`} stroke={INK.wood} strokeWidth="12" />
    <rect x={x - 64} y={y + 74} width="128" height="8" fill={INK.woodLight} />
    {/* tilted board */}
    <path d={`M${x - 120} ${y + 30} L${x - 96} ${y - 110} H${x + 96} L${x + 120} ${y + 30} Z`} fill={INK.wood} />
    <path d={`M${x - 104} ${y + 20} L${x - 84} ${y - 98} H${x + 84} L${x + 104} ${y + 20} Z`} fill={INK.paper} />
    <rect x={x - 124} y={y + 28} width="248" height="8" fill={INK.brassDeep} />
    {/* code lines */}
    <text x={x - 76} y={y - 78} fontSize="11" fontFamily="var(--mono)" fill={RUST}>
      boucle.py
    </text>
    {[
      [0, 70],
      [12, 96],
      [24, 60],
      [12, 84],
      [24, 74],
      [36, 50],
      [12, 90],
    ].map(([ind, w], i) => (
      <rect key={i} x={x - 80 + ind + i * 1.6} y={y - 64 + i * 11} width={w} height="5" rx="2" fill={i === 5 ? INK.light : i === 1 ? INK.green : '#cfc5b0'} />
    ))}
    {/* set square and pencil */}
    <path d={`M${x + 50} ${y + 12} L${x + 92} ${y + 12} L${x + 50} ${y - 30} Z`} fill="none" stroke={RUST} strokeWidth="4" />
    <rect x={x - 90} y={y + 22} width="70" height="5" rx="2" fill={INK.light} />
  </g>
);

/** A wall board with two paths: a fixed rail (workflow) and a compass of choices (agent). */
export const c03_switch: PropFn = ({ x, y }) => (
  <g>
    <rect x={x - 140} y={y - 100} width="280" height="190" fill={INK.bronze} />
    <rect x={x - 130} y={y - 90} width="126" height="150" fill={INK.greenDeep} />
    <rect x={x + 4} y={y - 90} width="126" height="150" fill={INK.greenDeep} />
    {/* fixed rail: three stops in line */}
    <line x1={x - 67} y1={y - 70} x2={x - 67} y2={y + 40} stroke={INK.brass} strokeWidth="5" />
    {[0, 1, 2].map((i) => (
      <circle key={i} cx={x - 67} cy={y - 60 + i * 45} r="11" fill={i === 1 ? INK.light : INK.cream} stroke={INK.brass} strokeWidth="3" />
    ))}
    {/* compass: branching choices */}
    <circle cx={x + 67} cy={y - 15} r="44" fill="none" stroke={INK.brass} strokeWidth="3" />
    {Array.from({ length: 8 }, (_, i) => {
      const a = (i * Math.PI) / 4;
      const r = i % 2 ? 26 : 40;
      return <line key={i} x1={x + 67} y1={y - 15} x2={x + 67 + Math.cos(a) * r} y2={y - 15 + Math.sin(a) * r} stroke={i === 7 ? INK.light : INK.cream} strokeWidth={i === 7 ? 4 : 2} />;
    })}
    <circle cx={x + 67} cy={y - 15} r="6" fill={INK.brass} />
    {/* labels */}
    <rect x={x - 124} y={y + 66} width="114" height="18" fill={INK.paper} />
    <text x={x - 67} y={y + 79} textAnchor="middle" fontSize="11" fontFamily="var(--mono)" fill={INK.bronze}>
      workflow
    </text>
    <rect x={x + 10} y={y + 66} width="114" height="18" fill={INK.paper} />
    <text x={x + 67} y={y + 79} textAnchor="middle" fontSize="11" fontFamily="var(--mono)" fill={INK.bronze}>
      agent
    </text>
    <path d={`M${x - 50} ${y - 100} L${x} ${y - 120} L${x + 50} ${y - 100} Z`} fill={INK.brass} />
  </g>
);

/** The test bench: five verdict lamps, one lever to run the whole suite. */
export const c03_testbench: PropFn = ({ x, y }) => (
  <g>
    <Shadow x={x} y={y + 122} w={220} />
    <rect x={x - 100} y={y - 40} width="200" height="160" fill={INK.green} />
    <rect x={x - 106} y={y - 50} width="212" height="12" fill={INK.greenDeep} />
    <rect x={x - 92} y={y + 112} width="20" height="10" fill={INK.bronze} />
    <rect x={x + 72} y={y + 112} width="20" height="10" fill={INK.bronze} />
    {/* lamp panel */}
    <rect x={x - 88} y={y - 26} width="176" height="62" rx="4" fill={INK.greenDeep} />
    {[0, 1, 2, 3, 4].map((i) => (
      <g key={i}>
        <circle cx={x - 64 + i * 32} cy={y - 2} r="11" fill={i === 3 ? RUST : INK.light} />
        <circle cx={x - 64 + i * 32} cy={y - 2} r="11" fill="none" stroke={INK.brass} strokeWidth="2.5" />
        <text x={x - 64 + i * 32} y={y + 28} textAnchor="middle" fontSize="10" fontFamily="var(--mono)" fill={INK.cream}>
          {i + 1}
        </text>
      </g>
    ))}
    {/* lever */}
    <rect x={x - 70} y={y + 54} width="140" height="40" rx="4" fill={INK.bronze} />
    <rect x={x - 16} y={y + 64} width="32" height="20" rx="3" fill={INK.brassDeep} />
    <path d={`M${x} ${y + 74} L${x + 48} ${y + 50}`} stroke={STEEL} strokeWidth="7" strokeLinecap="round" />
    <circle cx={x + 50} cy={y + 49} r="8" fill={RUST} />
    {/* top: a sheet of test cards */}
    <rect x={x - 76} y={y - 92} width="62" height="42" fill={INK.paper} transform={`rotate(-6 ${x - 45} ${y - 71})`} />
    <rect x={x - 40} y={y - 86} width="62" height="36" fill={INK.paper} />
    <rect x={x + 28} y={y - 76} width="56" height="20" rx="3" fill={INK.bronze} />
    <text x={x + 56} y={y - 62} textAnchor="middle" fontSize="10" fontFamily="var(--mono)" fill={INK.light}>
      5 cas
    </text>
  </g>
);

/** Reward: the workshop wrench, engraved with the tool call. */
export const c03_wrench: PropFn = ({ x, y }) => (
  <g transform={`rotate(-18 ${x} ${y})`}>
    <rect x={x - 90} y={y - 14} width="180" height="28" rx="10" fill={INK.brass} />
    <rect x={x - 70} y={y - 5} width="140" height="10" rx="4" fill={INK.brassDeep} />
    {/* open jaw on the left (head centred at x-110) */}
    <path d={`M${x - 144.3} ${y - 11} A36 36 0 1 1 ${x - 144.3} ${y + 11} L${x - 104} ${y + 11} L${x - 104} ${y - 11} Z`} fill={INK.brass} />
    {/* ring on the right */}
    <circle cx={x + 104} cy={y} r="34" fill={INK.brass} />
    <circle cx={x + 104} cy={y} r="16" fill={INK.bronze} />
    <text x={x} y={y + 40} textAnchor="middle" fontSize="13" fontFamily="var(--mono)" fill={INK.brass}>
      tool_use
    </text>
  </g>
);
