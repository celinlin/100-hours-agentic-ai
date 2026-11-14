import { INK, Shadow, type PropFn } from './common';

/** 12 · The vault room */

const STEEL = '#56656d';
const OXBLOOD = '#6a2a35';

/** A writing desk with an opened letter; one hidden line glows in the paper. */
export const c12_letter: PropFn = ({ x, y }) => (
  <g>
    <Shadow x={x} y={y + 122} w={240} />
    {/* desk */}
    <rect x={x - 120} y={y + 20} width="240" height="16" fill={INK.wood} />
    <rect x={x - 108} y={y + 36} width="14" height="84" fill={INK.wood} />
    <rect x={x + 94} y={y + 36} width="14" height="84" fill={INK.wood} />
    <rect x={x - 70} y={y + 44} width="140" height="30" fill={INK.woodLight} />
    <circle cx={x} cy={y + 59} r="4" fill={INK.brass} />
    {/* envelope */}
    <rect x={x - 100} y={y - 16} width="90" height="36" fill={INK.cream} />
    <path d={`M${x - 100} ${y - 16} L${x - 55} ${y + 8} L${x - 10} ${y - 16}`} fill="none" stroke={INK.brassDeep} strokeWidth="2" />
    <circle cx={x - 55} cy={y + 6} r="7" fill={OXBLOOD} />
    {/* letter, slightly raised */}
    <g transform={`rotate(-6 ${x + 30} ${y - 40})`}>
      <rect x={x - 20} y={y - 120} width="100" height="132" fill={INK.paper} />
      {[0, 1, 2, 4, 5].map((i) => (
        <rect key={i} x={x - 8} y={y - 104 + i * 16} width={i === 5 ? 44 : 76} height="5" rx="2" fill={INK.bronzeLight} opacity="0.55" />
      ))}
      {/* the hidden line */}
      <rect x={x - 12} y={y - 60} width="84" height="11" rx="2" fill={INK.light} />
      <rect x={x - 6} y={y - 57} width="70" height="5" rx="2" fill={INK.paper} />
    </g>
    {/* magnifier */}
    <circle cx={x + 82} cy={y - 6} r="18" fill="none" stroke={INK.brass} strokeWidth="5" />
    <rect x={x + 94} y={y + 6} width="8" height="24" rx="3" fill={INK.bronze} transform={`rotate(-40 ${x + 98} ${y + 18})`} />
  </g>
);

/** A wall door with three padlocks: private data, external content, sending. */
export const c12_locks: PropFn = ({ x, y }) => (
  <g>
    <rect x={x - 100} y={y - 130} width="200" height="250" fill={INK.bronze} />
    <rect x={x - 88} y={y - 118} width="176" height="226" fill={STEEL} />
    <path d={`M${x - 88} ${y - 80} L${x} ${y - 118} L${x + 88} ${y - 80}`} fill="none" stroke={INK.brass} strokeWidth="2" />
    {[
      ['privé', -84],
      ['externe', -6],
      ['envoi', 72],
    ].map(([label, dy], i) => {
      const cy = y + (dy as number) - 10;
      return (
        <g key={i}>
          <path d={`M${x - 14} ${cy} V${cy - 12} A14 14 0 0 1 ${x + 14} ${cy - 12} V${cy}`} fill="none" stroke={i === 2 ? INK.light : INK.brass} strokeWidth="5" />
          <rect x={x - 22} y={cy} width="44" height="34" rx="5" fill={i === 2 ? INK.light : INK.brass} />
          <circle cx={x} cy={cy + 13} r="4" fill={INK.bronze} />
          <rect x={x - 1.5} y={cy + 14} width="3" height="10" fill={INK.bronze} />
          <rect x={x + 30} y={cy + 9} width="48" height="16" rx="2" fill={INK.greenDeep} />
          <text x={x + 54} y={cy + 21} textAnchor="middle" fontSize="10" fill={INK.light} fontFamily="var(--mono)">
            {label}
          </text>
        </g>
      );
    })}
    {/* chain linking the three */}
    <line x1={x - 40} y1={y - 80} x2={x - 40} y2={y + 80} stroke={INK.brassDeep} strokeWidth="3" strokeDasharray="6 4" />
  </g>
);

/** The vault door on the floor: a round door with layered rings and bolts. */
export const c12_vault: PropFn = ({ x, y }) => (
  <g>
    <Shadow x={x} y={y + 112} w={320} />
    <rect x={x - 150} y={y - 110} width="300" height="220" fill={INK.bronze} />
    <rect x={x - 138} y={y - 98} width="276" height="196" fill={INK.bronzeLight} />
    {/* layered rings: defence in depth */}
    <circle cx={x - 10} cy={y} r="88" fill={STEEL} />
    <circle cx={x - 10} cy={y} r="88" fill="none" stroke={INK.brass} strokeWidth="5" />
    <circle cx={x - 10} cy={y} r="66" fill="none" stroke={INK.brassDeep} strokeWidth="4" />
    <circle cx={x - 10} cy={y} r="44" fill="none" stroke={INK.brass} strokeWidth="3" />
    {Array.from({ length: 8 }, (_, i) => {
      const a = (i * Math.PI) / 4;
      return <circle key={i} cx={x - 10 + Math.cos(a) * 77} cy={y + Math.sin(a) * 77} r="5" fill={INK.brass} />;
    })}
    {/* handwheel */}
    {[0, 1, 2].map((i) => (
      <rect key={i} x={x - 42} y={y - 3} width="64" height="6" rx="3" fill={INK.cream} transform={`rotate(${i * 60} ${x - 10} ${y})`} />
    ))}
    <circle cx={x - 10} cy={y} r="12" fill={INK.light} />
    {/* hinges */}
    <rect x={x + 96} y={y - 60} width="22" height="34" rx="4" fill={INK.brass} />
    <rect x={x + 96} y={y + 26} width="22" height="34" rx="4" fill={INK.brass} />
    <rect x={x - 130} y={y + 76} width="60" height="16" rx="2" fill={INK.greenDeep} />
    <text x={x - 100} y={y + 88} textAnchor="middle" fontSize="10" fill={INK.light} fontFamily="var(--mono)">
      5 / 5
    </text>
  </g>
);

/** A standing board listing the allowed addresses, with a brake lever. */
export const c12_board: PropFn = ({ x, y }) => (
  <g>
    <Shadow x={x} y={y + 122} w={220} />
    <rect x={x - 70} y={y + 50} width="10" height="70" fill={INK.bronze} />
    <rect x={x + 60} y={y + 50} width="10" height="70" fill={INK.bronze} />
    <rect x={x - 100} y={y - 120} width="200" height="176" fill={INK.wood} />
    <rect x={x - 90} y={y - 110} width="180" height="156" fill={INK.greenDeep} />
    <text x={x} y={y - 88} textAnchor="middle" fontSize="12" fill={INK.brass} fontFamily="var(--mono)">
      LISTE BLANCHE
    </text>
    <line x1={x - 76} y1={y - 80} x2={x + 76} y2={y - 80} stroke={INK.brass} strokeWidth="1.5" />
    {/* one allowed entry, two refused */}
    <rect x={x - 76} y={y - 70} width="120" height="16" rx="2" fill={INK.light} />
    <circle cx={x + 62} cy={y - 62} r="7" fill={INK.light} />
    {[0, 1].map((i) => (
      <g key={i}>
        <rect x={x - 76} y={y - 44 + i * 26} width="120" height="16" rx="2" fill={INK.cream} opacity="0.35" />
        <line x1={x - 80} y1={y - 36 + i * 26} x2={x + 48} y2={y - 36 + i * 26} stroke={OXBLOOD} strokeWidth="4" />
        <path d={`M${x + 56} ${y - 42 + i * 26} l12 12 M${x + 68} ${y - 42 + i * 26} l-12 12`} stroke={OXBLOOD} strokeWidth="3" />
      </g>
    ))}
    {/* brake lever */}
    <rect x={x - 76} y={y + 14} width="152" height="22" rx="4" fill={INK.bronze} />
    <rect x={x - 60} y={y + 20} width="70" height="10" rx="5" fill={INK.brassDeep} />
    <circle cx={x - 50} cy={y + 25} r="9" fill={INK.brass} />
    <text x={x + 42} y={y + 29} textAnchor="middle" fontSize="10" fill={INK.light} fontFamily="var(--mono)">
      accord
    </text>
  </g>
);

/** A framed charter with four tiered bands: the AI Act risk levels. */
export const c12_charter: PropFn = ({ x, y }) => (
  <g>
    <rect x={x - 90} y={y - 130} width="180" height="250" fill={INK.brass} />
    <rect x={x - 80} y={y - 120} width="160" height="230" fill={INK.paper} />
    <path d={`M${x - 60} ${y - 106} L${x} ${y - 120} L${x + 60} ${y - 106}`} fill="none" stroke={INK.brassDeep} strokeWidth="2" />
    <text x={x} y={y - 90} textAnchor="middle" fontSize="12" fill={INK.bronze} fontFamily="var(--mono)">
      CHARTE
    </text>
    {/* risk pyramid: unacceptable, high, limited, minimal */}
    {[
      [26, OXBLOOD],
      [56, INK.brassDeep],
      [86, INK.light],
      [116, INK.green],
    ].map(([w, c], i) => (
      <rect key={i} x={x - (w as number) / 2} y={y - 74 + i * 26} width={w as number} height="20" fill={c as string} />
    ))}
    {[0, 1, 2].map((i) => (
      <rect key={i} x={x - 60} y={y + 40 + i * 14} width={i === 2 ? 70 : 120} height="5" rx="2" fill={INK.bronzeLight} opacity="0.5" />
    ))}
    <circle cx={x + 52} cy={y + 88} r="12" fill={OXBLOOD} />
    <circle cx={x + 52} cy={y + 88} r="6" fill="none" stroke={INK.cream} strokeWidth="1.5" />
  </g>
);

/** Reward: the vault dial, a brass combination dial with three notches. */
export const c12_dial: PropFn = ({ x, y }) => (
  <g>
    <circle cx={x} cy={y} r="96" fill={INK.bronze} />
    <circle cx={x} cy={y} r="86" fill={INK.brass} />
    <circle cx={x} cy={y} r="66" fill={INK.brassDeep} />
    {Array.from({ length: 24 }, (_, i) => {
      const a = (i * Math.PI) / 12;
      const r1 = i % 6 === 0 ? 70 : 76;
      return <line key={i} x1={x + Math.cos(a) * r1} y1={y + Math.sin(a) * r1} x2={x + Math.cos(a) * 84} y2={y + Math.sin(a) * 84} stroke={INK.bronze} strokeWidth={i % 6 === 0 ? 4 : 2} />;
    })}
    {/* three locks closed */}
    {[0, 1, 2].map((i) => {
      const a = -Math.PI / 2 + (i * 2 * Math.PI) / 3;
      return <circle key={i} cx={x + Math.cos(a) * 40} cy={y + Math.sin(a) * 40} r="10" fill={i === 2 ? INK.light : INK.cream} />;
    })}
    <circle cx={x} cy={y} r="16" fill={INK.bronze} />
    <rect x={x - 4} y={y - 104} width="8" height="18" fill={OXBLOOD} />
  </g>
);
