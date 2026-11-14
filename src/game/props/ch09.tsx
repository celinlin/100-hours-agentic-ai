import { INK, Shadow, type PropFn } from './common';

/** 09 · The chef's kitchens — one lead, two helpers. Two room tones: steel and copper. */
const STEEL = '#b9bdb4';
const COPPER = '#b0603a';

/** The ticket rail on its stand: each ticket goes to a helper, to the chef, or stays whole. */
export const c09_rail: PropFn = ({ x, y }) => (
  <g>
    <Shadow x={x} y={y + 122} w={220} />
    <rect x={x - 104} y={y - 80} width="10" height="200" fill={INK.bronze} />
    <rect x={x + 94} y={y - 80} width="10" height="200" fill={INK.bronze} />
    <rect x={x - 118} y={y + 112} width="38" height="8" fill={INK.bronze} />
    <rect x={x + 80} y={y + 112} width="38" height="8" fill={INK.bronze} />
    {/* rail */}
    <rect x={x - 116} y={y - 92} width="232" height="14" rx="3" fill={STEEL} />
    <rect x={x - 116} y={y - 80} width="232" height="3" fill={INK.bronzeLight} />
    {/* tickets */}
    {[
      [-92, 66, INK.paper],
      [-50, 80, INK.light],
      [-8, 60, INK.paper],
      [34, 74, INK.paper],
      [76, 56, INK.cream],
    ].map(([dx, h, c], i) => (
      <g key={i} transform={`rotate(${i % 2 ? 2 : -2} ${x + (dx as number) + 16} ${y - 78})`}>
        <rect x={x + (dx as number)} y={y - 80} width="32" height={h as number} fill={c as string} />
        {[0, 1, 2].map((k) => (
          <rect key={k} x={x + (dx as number) + 5} y={y - 66 + k * 10} width={k === 2 ? 12 : 22} height="3" fill="#c7bba5" />
        ))}
      </g>
    ))}
    {/* tray of bins below */}
    <rect x={x - 94} y={y + 30} width="188" height="12" fill={INK.wood} />
    {[0, 1, 2].map((i) => (
      <g key={i}>
        <rect x={x - 88 + i * 62} y={y + 42} width="52" height="40" fill={i === 1 ? INK.green : INK.woodLight} />
        <rect x={x - 76 + i * 62} y={y + 52} width="28" height="8" fill={INK.paper} />
      </g>
    ))}
    <text x={x} y={y - 100} textAnchor="middle" fontSize="11" fill={INK.light} fontFamily="var(--mono)">
      BONS
    </text>
  </g>
);

/** A chalk slate on the wall: each method with its price and its quality. */
export const c09_slate: PropFn = ({ x, y }) => (
  <g>
    <rect x={x - 126} y={y - 104} width="252" height="196" fill={INK.wood} />
    <rect x={x - 114} y={y - 92} width="228" height="172" fill="#1d2622" />
    <path d={`M${x - 60} ${y - 104} L${x} ${y - 128} L${x + 60} ${y - 104} Z`} fill={INK.brass} />
    <text x={x} y={y - 70} textAnchor="middle" fontSize="12" fill={INK.cream} fontFamily="var(--mono)">
      MÉTHODES
    </text>
    <rect x={x - 40} y={y - 62} width="80" height="2" fill={INK.cream} opacity="0.6" />
    {[0, 1, 2, 3].map((i) => (
      <g key={i}>
        <rect x={x - 96} y={y - 46 + i * 28} width={100 - (i % 2) * 22} height="4" fill={INK.cream} opacity="0.75" />
        <rect x={x + 20} y={y - 48 + i * 28} width="22" height="8" fill="none" stroke={INK.cream} strokeWidth="1.5" opacity="0.7" />
        {Array.from({ length: i + 1 }, (_, k) => (
          <circle key={k} cx={x + 60 + k * 11} cy={y - 44 + i * 28} r="3.5" fill={i === 3 ? INK.light : INK.cream} />
        ))}
      </g>
    ))}
    <rect x={x - 100} y={y + 80} width="200" height="10" fill={INK.woodLight} />
    <rect x={x + 40} y={y + 74} width="22" height="6" fill={INK.paper} />
  </g>
);

/** The pass: heat lamps, plates waiting, the chef's bell — where helpers' returns are checked. */
export const c09_pass: PropFn = ({ x, y }) => (
  <g>
    <Shadow x={x} y={y + 92} w={330} />
    {/* lamps hanging from a gantry */}
    <rect x={x - 150} y={y - 132} width="300" height="10" fill={STEEL} />
    <rect x={x - 150} y={y - 122} width="8" height="80" fill={STEEL} />
    <rect x={x + 142} y={y - 122} width="8" height="80" fill={STEEL} />
    {[-70, 0, 70].map((dx) => (
      <g key={dx}>
        <rect x={x + dx - 2} y={y - 122} width="4" height="16" fill={INK.bronze} />
        <path d={`M${x + dx - 22} ${y - 90} L${x + dx - 10} ${y - 106} H${x + dx + 10} L${x + dx + 22} ${y - 90} Z`} fill={COPPER} />
        <path d={`M${x + dx - 18} ${y - 88} L${x + dx - 30} ${y - 46} H${x + dx + 30} L${x + dx + 18} ${y - 88} Z`} fill={INK.glow} opacity="0.35" />
      </g>
    ))}
    {/* counter */}
    <rect x={x - 160} y={y - 46} width="320" height="14" fill={STEEL} />
    <rect x={x - 150} y={y - 32} width="300" height="122" fill={INK.bronze} />
    {[0, 1, 2].map((i) => (
      <rect key={i} x={x - 136 + i * 92} y={y - 18} width="88" height="96" fill={INK.bronzeLight} />
    ))}
    {/* plates and a cloche */}
    <ellipse cx={x - 70} cy={y - 48} rx="30" ry="5" fill={INK.paper} />
    <path d={`M${x - 94} ${y - 50} A24 22 0 0 1 ${x - 46} ${y - 50} Z`} fill={STEEL} />
    <circle cx={x - 70} cy={y - 74} r="4" fill={INK.brass} />
    <ellipse cx={x + 4} cy={y - 48} rx="30" ry="5" fill={INK.paper} />
    <ellipse cx={x + 4} cy={y - 52} rx="16" ry="4" fill={INK.green} />
    {/* bell and ticket */}
    <path d={`M${x + 68} ${y - 47} A14 13 0 0 1 ${x + 96} ${y - 47} Z`} fill={INK.brass} />
    <rect x={x + 80} y={y - 66} width="4" height="7" fill={INK.brassDeep} />
    <rect x={x + 108} y={y - 76} width="28" height="30" fill={INK.paper} />
    <rect x={x + 112} y={y - 70} width="18" height="3" fill="#c7bba5" />
    <rect x={x + 112} y={y - 62} width="12" height="3" fill="#c7bba5" />
    <rect x={x - 26} y={y + 20} width="52" height="18" fill={INK.greenDeep} />
    <text x={x} y={y + 33} textAnchor="middle" fontSize="11" fill={INK.light} fontFamily="var(--mono)">
      PASSE
    </text>
  </g>
);

/** A range with two burners lit at once: two helpers, in parallel. */
export const c09_stove: PropFn = ({ x, y }) => (
  <g>
    <Shadow x={x} y={y + 122} w={250} />
    <rect x={x - 120} y={y - 10} width="240" height="130" fill={INK.greenDeep} />
    <rect x={x - 126} y={y - 22} width="252" height="14" fill={STEEL} />
    {/* oven door */}
    <rect x={x - 96} y={y + 24} width="192" height="80" fill={INK.green} />
    <rect x={x - 80} y={y + 34} width="160" height="8" rx="4" fill={INK.brass} />
    <rect x={x - 70} y={y + 52} width="140" height="40" fill={INK.bronze} />
    {[0, 1, 2, 3].map((i) => (
      <circle key={i} cx={x - 66 + i * 44} cy={y + 8} r="6" fill={INK.brass} />
    ))}
    {/* two flames */}
    {[-56, 56].map((dx) => (
      <g key={dx}>
        <ellipse cx={x + dx} cy={y - 24} rx="34" ry="5" fill={INK.bronze} />
        {[-16, -6, 4, 14].map((f) => (
          <path key={f} d={`M${x + dx + f - 3} ${y - 24} q 3 -10 6 0 z`} fill={INK.light} />
        ))}
      </g>
    ))}
    {/* two copper pans with steam */}
    <path d={`M${x - 90} ${y - 32} h68 v-30 a6 6 0 0 0 -6 -6 h-56 a6 6 0 0 0 -6 6 z`} fill={COPPER} />
    <rect x={x - 118} y={y - 58} width="30" height="7" rx="3" fill={INK.bronze} />
    <path d={`M${x + 22} ${y - 32} h68 v-36 a6 6 0 0 0 -6 -6 h-56 a6 6 0 0 0 -6 6 z`} fill={COPPER} />
    <rect x={x + 88} y={y - 64} width="30" height="7" rx="3" fill={INK.bronze} />
    {[-66, -46, 46, 66].map((dx, i) => (
      <path key={i} d={`M${x + dx} ${y - 76 - (i % 2) * 6} q -8 -12 0 -24 q 8 -12 0 -24`} fill="none" stroke={INK.cream} strokeWidth="3" opacity="0.6" />
    ))}
  </g>
);

/** A tall rack with two sauce pots that disagree, and a tasting spoon. */
export const c09_rack: PropFn = ({ x, y }) => (
  <g>
    <Shadow x={x} y={y + 152} w={200} />
    <rect x={x - 90} y={y - 150} width="10" height="300" fill={INK.bronze} />
    <rect x={x + 80} y={y - 150} width="10" height="300" fill={INK.bronze} />
    {[-140, -40, 60, 140].map((dy) => (
      <rect key={dy} x={x - 94} y={y + dy} width="188" height="8" fill={STEEL} />
    ))}
    {/* top shelf: jars */}
    {[0, 1, 2, 3].map((i) => (
      <rect key={i} x={x - 70 + i * 36} y={y - 168} width="24" height="28" rx="4" fill={i === 2 ? INK.light : INK.cream} />
    ))}
    {/* two sauce pots, two labels */}
    {[
      [-40, '15 000'],
      [40, '18 000'],
    ].map(([dx, label]) => (
      <g key={label as string}>
        <path d={`M${x + (dx as number) - 34} ${y - 40} h68 v-46 a6 6 0 0 0 -6 -6 h-56 a6 6 0 0 0 -6 6 z`} fill={COPPER} />
        <rect x={x + (dx as number) - 38} y={y - 96} width="76" height="8" rx="3" fill={INK.bronze} />
        <rect x={x + (dx as number) - 28} y={y - 74} width="56" height="18" fill={INK.paper} />
        <text x={x + (dx as number)} y={y - 61} textAnchor="middle" fontSize="11" fill={INK.bronze} fontFamily="var(--mono)">
          {label}
        </text>
      </g>
    ))}
    {/* tasting spoon */}
    <rect x={x - 6} y={y + 4} width="80" height="6" rx="3" fill={INK.brass} transform={`rotate(-14 ${x} ${y + 7})`} />
    <ellipse cx={x - 12} cy={y + 12} rx="16" ry="9" fill={INK.brass} />
    {/* lower shelf: stacked pans */}
    {[0, 1, 2].map((i) => (
      <rect key={i} x={x - 70 + i * 6} y={y + 100 + i * 10} width={110 - i * 12} height="8" rx="3" fill={i === 1 ? COPPER : INK.bronzeLight} />
    ))}
    <rect x={x - 30} y={y + 72} width="60" height="18" fill={INK.greenDeep} />
    <text x={x} y={y + 85} textAnchor="middle" fontSize="10" fill={INK.light} fontFamily="var(--mono)">
      ÉCART ?
    </text>
  </g>
);

/** Reward: the chef's toque, with a brass badge. */
export const c09_toque: PropFn = ({ x, y }) => (
  <g>
    {/* puffed crown */}
    <circle cx={x - 62} cy={y - 34} r="44" fill={INK.paper} />
    <circle cx={x} cy={y - 56} r="54" fill={INK.paper} />
    <circle cx={x + 62} cy={y - 34} r="44" fill={INK.paper} />
    <rect x={x - 90} y={y - 40} width="180" height="70" fill={INK.paper} />
    <path d={`M${x - 30} ${y - 24} v50 M${x + 30} ${y - 24} v50 M${x} ${y - 40} v66`} stroke={INK.cream} strokeWidth="6" />
    {/* band */}
    <rect x={x - 96} y={y + 26} width="192" height="64" rx="6" fill={INK.cream} />
    <rect x={x - 96} y={y + 26} width="192" height="10" fill={INK.brassDeep} opacity="0.5" />
    {/* badge */}
    <rect x={x - 38} y={y + 44} width="76" height="34" rx="4" fill={INK.brass} />
    <rect x={x - 32} y={y + 50} width="64" height="22" rx="2" fill="none" stroke={INK.bronze} strokeWidth="2" />
    <text x={x} y={y + 66} textAnchor="middle" fontSize="13" fill={INK.bronze} fontFamily="var(--mono)" fontWeight="700">
      CHEF
    </text>
  </g>
);
