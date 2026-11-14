import { INK, Shadow, type PropFn } from './common';

/** 10 · The testing laboratory */

const VERDIGRIS = '#5e8c87';
const OXBLOOD = '#7c2f2a';

/** A lectern holding the open ledger of reference cases. */
export const c10_ledger: PropFn = ({ x, y }) => (
  <g>
    <Shadow x={x} y={y + 122} w={200} />
    {/* stand */}
    <path d={`M${x - 60} ${y + 120} h120 l-12 -14 h-96 z`} fill={INK.bronze} />
    <rect x={x - 12} y={y - 10} width="24" height="118" fill={INK.wood} />
    <rect x={x - 22} y={y + 40} width="44" height="8" fill={INK.brassDeep} />
    {/* slanted desk */}
    <path d={`M${x - 120} ${y - 4} L${x - 100} ${y - 70} H${x + 100} L${x + 120} ${y - 4} Z`} fill={INK.woodLight} />
    <rect x={x - 122} y={y - 6} width="244" height="10" fill={INK.wood} />
    {/* open ledger */}
    <path d={`M${x - 100} ${y - 14} L${x - 86} ${y - 66} H${x - 4} L${x - 4} ${y - 14} Z`} fill={INK.paper} />
    <path d={`M${x + 100} ${y - 14} L${x + 86} ${y - 66} H${x + 4} L${x + 4} ${y - 14} Z`} fill={INK.cream} />
    <rect x={x - 4} y={y - 66} width="8" height="52" fill={INK.brassDeep} />
    {Array.from({ length: 5 }, (_, i) => (
      <g key={i}>
        <line x1={x - 84 + i * 2} y1={y - 56 + i * 9} x2={x - 14} y2={y - 56 + i * 9} stroke={INK.bronzeLight} strokeWidth="1.5" />
        <rect x={x + 16} y={y - 60 + i * 9} width="10" height="6" fill={i === 3 ? OXBLOOD : VERDIGRIS} />
        <line x1={x + 32} y1={y - 57 + i * 9} x2={x + 84 - i * 2} y2={y - 57 + i * 9} stroke={INK.bronzeLight} strokeWidth="1.5" />
      </g>
    ))}
    {/* ribbon bookmark */}
    <path d={`M${x + 2} ${y - 14} v34 l-6 -6 l-6 6 v-34 z`} fill={OXBLOOD} />
    <rect x={x - 44} y={y + 14} width="88" height="18" rx="3" fill={INK.greenDeep} />
    <text x={x} y={y + 27} textAnchor="middle" fontSize="11" fill={INK.light} fontFamily="var(--mono)">
      20 cas
    </text>
  </g>
);

/** A brass balance with three pans: code, judge, human. */
export const c10_scale: PropFn = ({ x, y }) => (
  <g>
    <Shadow x={x} y={y + 122} w={190} />
    <path d={`M${x - 70} ${y + 120} h140 l-14 -18 h-112 z`} fill={INK.bronze} />
    <rect x={x - 8} y={y - 90} width="16" height="194" fill={INK.brassDeep} />
    <path d={`M${x - 20} ${y - 100} L${x} ${y - 124} L${x + 20} ${y - 100} Z`} fill={INK.brass} />
    {/* beam */}
    <rect x={x - 130} y={y - 96} width="260" height="10" rx="5" fill={INK.brass} />
    <circle cx={x} cy={y - 91} r="10" fill={INK.bronze} />
    <circle cx={x} cy={y - 91} r="4" fill={INK.brass} />
    {/* three pans */}
    {[
      [-118, 'code'],
      [0, 'juge'],
      [118, 'toi'],
    ].map(([dx, label], i) => {
      const cx = x + (dx as number);
      const top = i === 1 ? y - 30 : y - 10;
      return (
        <g key={i}>
          {i !== 1 && (
            <>
              <line x1={cx} y1={y - 86} x2={cx - 30} y2={top} stroke={INK.brassDeep} strokeWidth="2" />
              <line x1={cx} y1={y - 86} x2={cx + 30} y2={top} stroke={INK.brassDeep} strokeWidth="2" />
            </>
          )}
          <path d={`M${cx - 38} ${top} H${cx + 38} Q${cx + 30} ${top + 22} ${cx} ${top + 22} Q${cx - 30} ${top + 22} ${cx - 38} ${top} Z`} fill={i === 1 ? VERDIGRIS : INK.brass} />
          <rect x={cx - 24} y={top + 30} width="48" height="16" rx="3" fill={INK.greenDeep} />
          <text x={cx} y={top + 42} textAnchor="middle" fontSize="11" fill={INK.light} fontFamily="var(--mono)">
            {label}
          </text>
        </g>
      );
    })}
    {/* weights on the code pan */}
    <rect x={x - 132} y={y - 22} width="12" height="12" fill={INK.bronze} />
    <rect x={x - 116} y={y - 26} width="14" height="16" fill={INK.bronze} />
  </g>
);

/** The test bench: a workbench with a rack of three trial flasks and a counter. */
export const c10_bench: PropFn = ({ x, y }) => (
  <g>
    <Shadow x={x} y={y + 92} w={320} />
    <rect x={x - 150} y={y + 6} width="300" height="16" fill={INK.wood} />
    <rect x={x - 138} y={y + 22} width="14" height="68" fill={INK.wood} />
    <rect x={x + 124} y={y + 22} width="14" height="68" fill={INK.wood} />
    <rect x={x - 124} y={y + 56} width="248" height="8" fill={INK.woodLight} />
    {/* rack */}
    <rect x={x - 130} y={y - 24} width="150" height="12" fill={INK.bronze} />
    <rect x={x - 130} y={y - 6} width="150" height="12" fill={INK.bronze} />
    {[0, 1, 2].map((i) => {
      const cx = x - 102 + i * 48;
      const fill = i === 1 ? OXBLOOD : VERDIGRIS;
      return (
        <g key={i}>
          <rect x={cx - 11} y={y - 96} width="22" height="96" rx="11" fill={INK.cream} />
          <rect x={cx - 11} y={y - 50 + (i === 1 ? 20 : 0)} width="22" height={50 - (i === 1 ? 20 : 0)} rx="0" fill={fill} />
          <rect x={cx - 14} y={y - 102} width="28" height="8" rx="2" fill={INK.brass} />
          <text x={cx} y={y + 3} textAnchor="middle" fontSize="10" fill={INK.light} fontFamily="var(--mono)">
            {['3', '0', '3'][i]}
          </text>
        </g>
      );
    })}
    {/* counter box */}
    <rect x={x + 34} y={y - 70} width="104" height="76" rx="8" fill={INK.greenDeep} />
    <rect x={x + 44} y={y - 60} width="84" height="30" rx="3" fill={INK.bronze} />
    <text x={x + 86} y={y - 40} textAnchor="middle" fontSize="13" fill={INK.light} fontFamily="var(--mono)">
      min = 0
    </text>
    <circle cx={x + 58} cy={y - 14} r="7" fill={OXBLOOD} />
    <circle cx={x + 80} cy={y - 14} r="7" fill={INK.brass} />
    <rect x={x + 96} y={y - 18} width="34" height="8" rx="4" fill={INK.brass} />
  </g>
);

/** The judge's bench: a small desk with a gavel and a rubric card. */
export const c10_gavel: PropFn = ({ x, y }) => (
  <g>
    <Shadow x={x} y={y + 122} w={240} />
    {/* desk front */}
    <rect x={x - 110} y={y - 10} width="220" height="130" fill={INK.wood} />
    <rect x={x - 118} y={y - 22} width="236" height="14" fill={INK.woodLight} />
    <rect x={x - 92} y={y + 8} width="184" height="96" fill="none" stroke={INK.brass} strokeWidth="2" />
    <path d={`M${x} ${y + 18} L${x + 40} ${y + 56} L${x} ${y + 94} L${x - 40} ${y + 56} Z`} fill="none" stroke={INK.brass} strokeWidth="2" />
    <circle cx={x} cy={y + 56} r="8" fill={INK.brass} />
    {/* rubric card */}
    <rect x={x - 96} y={y - 76} width="80" height="56" fill={INK.paper} transform={`rotate(-6 ${x - 56} ${y - 48})`} />
    {[0, 1, 2].map((i) => (
      <g key={i} transform={`rotate(-6 ${x - 56} ${y - 48})`}>
        <rect x={x - 88} y={y - 68 + i * 15} width="9" height="9" fill="none" stroke={INK.bronze} strokeWidth="1.5" />
        <line x1={x - 74} y1={y - 63 + i * 15} x2={x - 26} y2={y - 63 + i * 15} stroke={INK.bronzeLight} strokeWidth="1.5" />
      </g>
    ))}
    {/* sound block + gavel */}
    <ellipse cx={x + 50} cy={y - 26} rx="34" ry="8" fill={INK.bronze} />
    <rect x={x + 20} y={y - 34} width="60" height="8" fill={INK.bronzeLight} />
    <rect x={x + 30} y={y - 96} width="44" height="26" rx="6" fill={OXBLOOD} transform={`rotate(-24 ${x + 52} ${y - 83})`} />
    <rect x={x + 26} y={y - 90} width="6" height="34" fill={INK.brass} transform={`rotate(-24 ${x + 52} ${y - 83})`} />
    <rect x={x + 72} y={y - 90} width="6" height="34" fill={INK.brass} transform={`rotate(-24 ${x + 52} ${y - 83})`} />
    <rect x={x + 48} y={y - 72} width="8" height="70" rx="3" fill={INK.woodLight} transform={`rotate(56 ${x + 52} ${y - 72})`} />
  </g>
);

/** A wall board comparing versions: two columns of scores and a worst case flagged. */
export const c10_scoreboard: PropFn = ({ x, y }) => (
  <g>
    <rect x={x - 100} y={y - 130} width="200" height="250" fill={INK.bronze} />
    <path d={`M${x - 100} ${y - 130} L${x} ${y - 168} L${x + 100} ${y - 130} Z`} fill={INK.brass} />
    <rect x={x - 88} y={y - 118} width="176" height="226" fill={INK.greenDeep} />
    <text x={x - 44} y={y - 96} textAnchor="middle" fontSize="13" fill={INK.brass} fontFamily="var(--mono)">
      v3
    </text>
    <text x={x + 44} y={y - 96} textAnchor="middle" fontSize="13" fill={INK.brass} fontFamily="var(--mono)">
      v4
    </text>
    <line x1={x} y1={y - 110} x2={x} y2={y + 98} stroke={INK.brassDeep} strokeWidth="2" />
    {[2, 3, 2, 3, 3, 2, 2].map((s, i) => {
      const s4 = i === 2 ? 0 : [3, 3, 0, 3, 3, 3, 2][i];
      return (
        <g key={i}>
          <rect x={x - 76} y={y - 82 + i * 22} width={s * 20} height="12" fill={VERDIGRIS} />
          <rect x={x + 12} y={y - 82 + i * 22} width={Math.max(s4 * 20, 4)} height="12" fill={s4 === 0 ? OXBLOOD : VERDIGRIS} />
        </g>
      );
    })}
    <rect x={x - 70} y={y + 76} width="140" height="22" rx="3" fill={INK.paper} />
    <text x={x} y={y + 91} textAnchor="middle" fontSize="11" fill={INK.bronze} fontFamily="var(--mono)">
      pire : cas 12
    </text>
  </g>
);

/** Reward: an assay hallmark — a brass punch and the stamped mark "3/3". */
export const c10_hallmark: PropFn = ({ x, y }) => (
  <g>
    {/* stamped plate */}
    <rect x={x - 140} y={y - 60} width="150" height="120" rx="12" fill={INK.cream} />
    <path d={`M${x - 65} ${y - 44} L${x - 22} ${y} L${x - 65} ${y + 44} L${x - 108} ${y} Z`} fill="none" stroke={INK.brassDeep} strokeWidth="5" />
    <text x={x - 65} y={y + 7} textAnchor="middle" fontSize="20" fill={INK.bronze} fontFamily="var(--mono)">
      3/3
    </text>
    {/* punch */}
    <rect x={x + 40} y={y - 96} width="46" height="140" rx="6" fill={INK.brass} transform={`rotate(18 ${x + 63} ${y - 26})`} />
    {[0, 1, 2, 3].map((i) => (
      <rect key={i} x={x + 40} y={y - 80 + i * 14} width="46" height="4" fill={INK.brassDeep} transform={`rotate(18 ${x + 63} ${y - 26})`} />
    ))}
    <path d={`M${x + 44} ${y + 44} h38 l-8 26 h-22 z`} fill={INK.bronze} transform={`rotate(18 ${x + 63} ${y - 26})`} />
    <rect x={x + 30} y={y + 72} width="110" height="14" rx="4" fill={VERDIGRIS} />
  </g>
);
