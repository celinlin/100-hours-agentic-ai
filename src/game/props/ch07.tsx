import { INK, Shadow, type PropFn } from './common';

/** 07 · The records room — memory: a shredder, a ledger, a checkpoint clock, SQLite drawers. */

const PLUM = '#5a3a5e'; // ledger covers (room tone 1)
const WAX = '#7a2e2a'; // sealing wax and labels (room tone 2)

/** A shredder over a basket: what the state deliberately forgets. */
export const c07_shredder: PropFn = ({ x, y }) => (
  <g>
    <Shadow x={x} y={y + 124} w={190} />
    {/* basket */}
    <path d={`M${x - 80} ${y - 10} H${x + 80} L${x + 66} ${y + 122} H${x - 66} Z`} fill={INK.bronze} />
    {Array.from({ length: 6 }, (_, i) => (
      <line key={i} x1={x - 60 + i * 24} y1={y + 4} x2={x - 52 + i * 21} y2={y + 116} stroke={INK.bronzeLight} strokeWidth="4" />
    ))}
    <rect x={x - 84} y={y - 14} width="168" height="10" fill={INK.brassDeep} />
    {/* shredder head */}
    <rect x={x - 96} y={y - 70} width="192" height="58" rx="8" fill={INK.green} />
    <rect x={x - 96} y={y - 70} width="192" height="12" rx="6" fill={INK.greenDeep} />
    <rect x={x - 70} y={y - 64} width="140" height="5" rx="2" fill={INK.bronze} />
    <circle cx={x + 74} cy={y - 34} r="7" fill={INK.brass} />
    <rect x={x - 76} y={y - 42} width="80" height="16" rx="2" fill={INK.paper} />
    <text x={x - 36} y={y - 30} textAnchor="middle" fontSize="10" fill={WAX} fontFamily="var(--mono)">
      oublier
    </text>
    {/* sheet going in */}
    <path d={`M${x - 50} ${y - 64} L${x - 40} ${y - 150} H${x + 46} L${x + 50} ${y - 64} Z`} fill={INK.paper} />
    {[0, 1, 2, 3].map((i) => (
      <rect key={i} x={x - 34 + i * 2} y={y - 136 + i * 16} width={70 - i * 4} height="4" fill={i === 1 ? WAX : '#cfc6b3'} />
    ))}
    {/* strips coming out */}
    {Array.from({ length: 7 }, (_, i) => (
      <rect key={i} x={x - 54 + i * 16} y={y - 12} width="8" height={22 + ((i * 13) % 20)} fill={INK.cream} />
    ))}
  </g>
);

/** A great ledger on a wall shelf: the history, summarised. */
export const c07_ledger: PropFn = ({ x, y }) => (
  <g>
    {/* shelf and brackets */}
    <rect x={x - 130} y={y + 40} width="260" height="12" fill={INK.wood} />
    <path d={`M${x - 100} ${y + 52} v40 l30 -40 z`} fill={INK.wood} />
    <path d={`M${x + 100} ${y + 52} v40 l-30 -40 z`} fill={INK.wood} />
    {/* stacked ledgers on the right */}
    {[0, 1, 2].map((i) => (
      <g key={i}>
        <rect x={x + 54 + i * 2} y={y + 40 - (i + 1) * 20} width="68" height="18" fill={[PLUM, INK.green, WAX][i]} />
        <rect x={x + 60 + i * 2} y={y + 47 - (i + 1) * 20} width="20" height="4" fill={INK.brass} />
      </g>
    ))}
    {/* open ledger standing */}
    <path d={`M${x - 120} ${y + 40} L${x - 112} ${y - 80} L${x - 30} ${y - 88} L${x - 30} ${y + 34} Z`} fill={PLUM} />
    <path d={`M${x - 112} ${y + 36} L${x - 106} ${y - 74} Q${x - 70} ${y - 82} ${x - 34} ${y - 76} V${y + 30} Q${x - 72} ${y + 26} ${x - 112} ${y + 36} Z`} fill={INK.paper} />
    <path d={`M${x + 50} ${y + 36} L${x + 44} ${y - 74} Q${x + 8} ${y - 82} ${x - 34} ${y - 76} V${y + 30} Q${x + 6} ${y + 26} ${x + 50} ${y + 36} Z`} fill={INK.cream} />
    {/* many lines on the left, five on the right: the summary */}
    {Array.from({ length: 9 }, (_, i) => (
      <rect key={i} x={x - 102} y={y - 64 + i * 10} width="60" height="3" fill="#cfc6b3" />
    ))}
    {Array.from({ length: 5 }, (_, i) => (
      <rect key={i} x={x - 24} y={y - 58 + i * 16} width={56 - (i % 2) * 12} height="5" fill={i < 2 ? INK.green : INK.brassDeep} />
    ))}
    <rect x={x - 36} y={y - 88} width="4" height="124" fill={INK.bronze} />
    <path d={`M${x - 10} ${y + 30} v26 l5 -6 l5 6 v-26 z`} fill={WAX} />
  </g>
);

/** A standing checkpoint clock: one notch for each saved step. */
export const c07_clock: PropFn = ({ x, y }) => (
  <g>
    <Shadow x={x} y={y + 124} w={170} />
    <rect x={x - 64} y={y + 96} width="128" height="26" fill={INK.bronzeLight} />
    <rect x={x - 50} y={y - 60} width="100" height="160" fill={INK.woodLight} />
    <rect x={x - 36} y={y - 40} width="72" height="124" fill={INK.bronze} />
    {/* pendulum */}
    <line x1={x} y1={y - 40} x2={x + 14} y2={y + 50} stroke={INK.brassDeep} strokeWidth="3" />
    <circle cx={x + 14} cy={y + 56} r="14" fill={INK.brass} />
    {/* hood */}
    <path d={`M${x - 70} ${y - 60} V${y - 150} L${x} ${y - 196} L${x + 70} ${y - 150} V${y - 60} Z`} fill={INK.wood} />
    <circle cx={x} cy={y - 112} r="50" fill={INK.brass} />
    <circle cx={x} cy={y - 112} r="42" fill={INK.paper} />
    {Array.from({ length: 12 }, (_, i) => {
      const a = (i * Math.PI) / 6;
      return <rect key={i} x={x - 2 + Math.sin(a) * 34} y={y - 114 - Math.cos(a) * 34} width="4" height="4" fill={i % 3 === 0 ? WAX : INK.bronze} />;
    })}
    {/* saved steps: arc of notches already passed */}
    <path d={`M${x} ${y - 140} A28 28 0 0 1 ${x + 28} ${y - 112}`} fill="none" stroke={INK.green} strokeWidth="6" />
    <line x1={x} y1={y - 112} x2={x + 20} y2={y - 92} stroke={INK.bronze} strokeWidth="4" strokeLinecap="round" />
    <line x1={x} y1={y - 112} x2={x} y2={y - 140} stroke={INK.bronze} strokeWidth="3" strokeLinecap="round" />
    <circle cx={x} cy={y - 112} r="5" fill={INK.bronze} />
    <rect x={x - 34} y={y - 4} width="68" height="18" rx="3" fill={INK.greenDeep} />
    <text x={x} y={y + 9} textAnchor="middle" fontSize="11" fill={INK.light} fontFamily="var(--mono)">
      reprise
    </text>
  </g>
);

/** A filing cabinet of SQLite drawers: the state on disk, one row per dossier. */
export const c07_drawers: PropFn = ({ x, y }) => (
  <g>
    <Shadow x={x} y={y + 124} w={220} />
    <rect x={x - 96} y={y - 120} width="192" height="240" fill={INK.green} />
    <rect x={x - 104} y={y - 128} width="208" height="12" fill={INK.greenDeep} />
    {[0, 1, 2, 3].map((r) => (
      <g key={r}>
        <rect x={x - 84} y={y - 108 + r * 56} width="168" height="48" fill={r === 1 ? INK.bronzeLight : '#2a5a47'} />
        <rect x={x - 30} y={y - 100 + r * 56} width="60" height="14" fill={INK.paper} />
        <rect x={x - 22} y={y - 78 + r * 56} width="44" height="8" rx="4" fill={INK.brass} />
      </g>
    ))}
    <text x={x} y={y - 89} textAnchor="middle" fontSize="10" fill={INK.bronze} fontFamily="var(--mono)">
      etat.db
    </text>
    {/* the second drawer pulled out, with a JSON card */}
    <rect x={x - 70} y={y - 12} width="140" height="10" fill={INK.brassDeep} />
    <rect x={x - 56} y={y - 50} width="112" height="38" fill={INK.paper} />
    <text x={x} y={y - 34} textAnchor="middle" fontSize="10" fill={WAX} fontFamily="var(--mono)">
      {'{"etape": …}'}
    </text>
    <rect x={x - 44} y={y - 26} width="88" height="3" fill="#cfc6b3" />
    <rect x={x - 96} y={y + 112} width="192" height="8" fill={INK.greenDeep} />
  </g>
);

/** A wall time clock with a rack of cards: punch the state at every step. */
export const c07_punchclock: PropFn = ({ x, y }) => (
  <g>
    {/* card rack */}
    <rect x={x + 54} y={y - 120} width="70" height="200" fill={INK.wood} />
    {[0, 1, 2, 3, 4].map((i) => (
      <g key={i}>
        <rect x={x + 60} y={y - 110 + i * 38} width="58" height="8" fill={INK.bronze} />
        <rect x={x + 66} y={y - 128 + i * 38} width="46" height="26" fill={i === 4 ? INK.cream : INK.paper} />
        <rect x={x + 72} y={y - 122 + i * 38} width="22" height="3" fill={i < 3 ? WAX : '#cfc6b3'} />
      </g>
    ))}
    {/* clock body */}
    <rect x={x - 110} y={y - 130} width="150" height="230" rx="10" fill={PLUM} />
    <rect x={x - 98} y={y - 118} width="126" height="8" rx="4" fill={INK.brassDeep} />
    <circle cx={x - 35} cy={y - 52} r="48" fill={INK.brass} />
    <circle cx={x - 35} cy={y - 52} r="40" fill={INK.paper} />
    {Array.from({ length: 12 }, (_, i) => {
      const a = (i * Math.PI) / 6;
      return <circle key={i} cx={x - 35 + Math.sin(a) * 32} cy={y - 52 - Math.cos(a) * 32} r="2.5" fill={INK.bronze} />;
    })}
    <line x1={x - 35} y1={y - 52} x2={x - 35} y2={y - 80} stroke={INK.bronze} strokeWidth="4" strokeLinecap="round" />
    <line x1={x - 35} y1={y - 52} x2={x - 14} y2={y - 44} stroke={INK.bronze} strokeWidth="4" strokeLinecap="round" />
    <circle cx={x - 35} cy={y - 52} r="5" fill={WAX} />
    {/* card slot with a card half in */}
    <rect x={x - 80} y={y + 14} width="90" height="12" fill={INK.bronze} />
    <rect x={x - 66} y={y - 8} width="62" height="26" fill={INK.paper} />
    <rect x={x - 60} y={y - 2} width="30" height="3" fill={WAX} />
    <rect x={x - 82} y={y + 46} width="94" height="22" rx="3" fill={INK.greenDeep} />
    <text x={x - 35} y={y + 61} textAnchor="middle" fontSize="11" fill={INK.light} fontFamily="var(--mono)">
      sauver()
    </text>
  </g>
);

/** Reward: the sealed register, a ledger closed with a wax seal. */
export const c07_register: PropFn = ({ x, y }) => (
  <g>
    <rect x={x - 120} y={y - 80} width="230" height="160" rx="6" fill={INK.paper} />
    <rect x={x - 130} y={y - 90} width="230" height="160" rx="6" fill={PLUM} />
    <rect x={x - 130} y={y - 90} width="22" height="160" rx="4" fill={INK.bronze} />
    <rect x={x - 90} y={y - 60} width="150" height="40" fill="none" stroke={INK.brass} strokeWidth="3" />
    <text x={x - 15} y={y - 35} textAnchor="middle" fontSize="13" fill={INK.brass} fontFamily="var(--mono)">
      etat.db
    </text>
    <rect x={x - 108} y={y + 6} width="230" height="10" fill={INK.brassDeep} />
    {/* wax seal */}
    <circle cx={x + 100} cy={y + 11} r="34" fill={WAX} />
    <circle cx={x + 100} cy={y + 11} r="24" fill="none" stroke="#5c211d" strokeWidth="3" />
    <path d={`M${x + 88} ${y + 11} L${x + 98} ${y + 21} L${x + 114} ${y}`} fill="none" stroke={INK.cream} strokeWidth="4" strokeLinecap="round" />
    <path d={`M${x + 86} ${y + 40} l-8 30 l14 -8 l8 14 l4 -34 z`} fill={WAX} />
  </g>
);
