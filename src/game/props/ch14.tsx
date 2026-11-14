import { INK, Shadow, type PropFn } from './common';

/** 14 · The penthouse — where the agent is handed over to Inès. */

const NIGHT = '#232842'; // room tone: night-blue screen glass
const OCHRE = '#b08a3a'; // room tone: penthouse gilt

/** The delivery desk: a stamped handover folder, a test stack and a desk lamp. */
export const c14_desk: PropFn = ({ x, y }) => (
  <g>
    <Shadow x={x} y={y + 122} w={260} />
    {/* desk */}
    <rect x={x - 135} y={y + 10} width="270" height="18" fill={INK.wood} />
    <rect x={x - 125} y={y + 28} width="90" height="92" fill={INK.woodLight} />
    {[0, 1, 2].map((i) => (
      <g key={i}>
        <rect x={x - 117} y={y + 36 + i * 28} width="74" height="22" fill={INK.wood} />
        <rect x={x - 88} y={y + 45 + i * 28} width="16" height="4" rx="2" fill={INK.brass} />
      </g>
    ))}
    <rect x={x + 105} y={y + 28} width="16" height="92" fill={INK.wood} />
    {/* stack of verdict sheets */}
    {[0, 1, 2, 3].map((i) => (
      <rect key={i} x={x - 110 + i * 2} y={y - 6 - i * 6} width="70" height="8" fill={i === 3 ? INK.paper : INK.cream} stroke="#c7bba5" />
    ))}
    <rect x={x - 102} y={y - 50} width="54" height="20" rx="3" fill={INK.greenDeep} />
    <text x={x - 75} y={y - 36} textAnchor="middle" fontSize="12" fill={INK.light} fontFamily="var(--mono)">
      38/38
    </text>
    {/* handover folder with seal */}
    <path d={`M${x - 26} ${y + 10} L${x - 16} ${y - 30} H${x + 70} L${x + 60} ${y + 10} Z`} fill={INK.green} />
    <rect x={x - 6} y={y - 26} width="56" height="10" fill={INK.paper} />
    <circle cx={x + 34} cy={y - 4} r="10" fill="#7c2f2a" />
    <circle cx={x + 34} cy={y - 4} r="5" fill="none" stroke={INK.brass} strokeWidth="1.5" />
    {/* desk lamp */}
    <rect x={x + 82} y={y + 2} width="40" height="8" rx="3" fill={INK.bronze} />
    <line x1={x + 102} y1={y + 2} x2={x + 92} y2={y - 58} stroke={INK.bronze} strokeWidth="5" />
    <line x1={x + 92} y1={y - 58} x2={x + 118} y2={y - 82} stroke={INK.bronze} strokeWidth="5" />
    <path d={`M${x + 100} ${y - 92} L${x + 140} ${y - 72} L${x + 124} ${y - 58} Z`} fill={OCHRE} />
    <path d={`M${x + 124} ${y - 58} L${x + 140} ${y - 72} L${x + 150} ${y - 40} Z`} fill={INK.glow} opacity="0.55" />
  </g>
);

/** A framed wall board showing the handover file, livraison.json. */
export const c14_board: PropFn = ({ x, y }) => (
  <g>
    <rect x={x - 100} y={y - 120} width="200" height="230" fill={INK.bronze} />
    <path d={`M${x - 60} ${y - 120} L${x} ${y - 150} L${x + 60} ${y - 120} Z`} fill={OCHRE} />
    <path d={`M${x - 30} ${y - 120} L${x} ${y - 136} L${x + 30} ${y - 120} Z`} fill={INK.brassDeep} />
    <rect x={x - 88} y={y - 108} width="176" height="206" fill="none" stroke={INK.brass} strokeWidth="3" />
    <rect x={x - 74} y={y - 94} width="148" height="178" fill={INK.paper} />
    <text x={x - 64} y={y - 74} fontSize="12" fill={INK.bronze} fontFamily="var(--mono)">
      livraison.json
    </text>
    <line x1={x - 64} y1={y - 66} x2={x + 64} y2={y - 66} stroke={INK.brassDeep} strokeWidth="1.5" />
    {[
      [0, 90, INK.green],
      [1, 70, INK.green],
      [2, 100, '#7c2f2a'],
      [3, 60, INK.green],
      [4, 84, INK.green],
      [5, 76, INK.green],
    ].map(([i, w, c]) => (
      <g key={i as number}>
        <rect x={x - 64} y={y - 54 + (i as number) * 20} width="30" height="7" rx="2" fill={c as string} />
        <rect x={x - 30} y={y - 54 + (i as number) * 20} width={(w as number) - 4} height="7" rx="2" fill="#d9cfbb" />
      </g>
    ))}
    {/* brass pin */}
    <circle cx={x} cy={y - 94} r="6" fill={INK.brass} />
  </g>
);

/** The demo screen: a gilt console with a screen showing one of Inès's real files. */
export const c14_screen: PropFn = ({ x, y }) => (
  <g>
    <Shadow x={x} y={y + 92} w={300} />
    {/* console */}
    <path d={`M${x - 130} ${y + 90} L${x - 110} ${y + 30} H${x + 110} L${x + 130} ${y + 90} Z`} fill={INK.bronze} />
    <rect x={x - 100} y={y + 44} width="200" height="8" rx="4" fill={OCHRE} />
    <rect x={x - 14} y={y - 6} width="28" height="36" fill={INK.bronzeLight} />
    {/* screen with stepped deco crown */}
    <rect x={x - 140} y={y - 140} width="280" height="140" rx="8" fill={INK.bronze} />
    <path d={`M${x - 50} ${y - 140} V${y - 154} H${x - 24} V${y - 166} H${x + 24} V${y - 154} H${x + 50} V${y - 140} Z`} fill={OCHRE} />
    <rect x={x - 126} y={y - 126} width="252" height="112" rx="4" fill={NIGHT} />
    {/* three real files chosen with Inès */}
    {[0, 1, 2].map((i) => (
      <g key={i}>
        <rect x={x - 112 + i * 80} y={y - 112} width="64" height="78" fill={i === 1 ? INK.light : INK.cream} />
        <rect x={x - 104 + i * 80} y={y - 100} width="40" height="5" fill={INK.brassDeep} />
        <rect x={x - 104 + i * 80} y={y - 88} width="48" height="4" fill="#bdb29b" />
        <rect x={x - 104 + i * 80} y={y - 78} width="34" height="4" fill="#bdb29b" />
        <circle cx={x - 80 + i * 80} cy={y - 50} r="7" fill={INK.green} />
      </g>
    ))}
    <text x={x} y={y - 20} textAnchor="middle" fontSize="11" fill={INK.light} fontFamily="var(--mono)">
      démo
    </text>
  </g>
);

/** The review table: Inès's log, a few true figures, two chairs. */
export const c14_table: PropFn = ({ x, y }) => (
  <g>
    <Shadow x={x} y={y + 122} w={280} />
    {/* chairs */}
    {[-1, 1].map((s) => (
      <g key={s}>
        <rect x={x + s * 118 - 18} y={y - 20} width="36" height="80" rx="10" fill="#7c2f2a" />
        <rect x={x + s * 118 - 22} y={y + 56} width="44" height="14" rx="4" fill="#5e2420" />
        <rect x={x + s * 118 - 16} y={y + 70} width="6" height="50" fill={INK.bronze} />
        <rect x={x + s * 118 + 10} y={y + 70} width="6" height="50" fill={INK.bronze} />
      </g>
    ))}
    {/* table */}
    <ellipse cx={x} cy={y + 14} rx="110" ry="24" fill={INK.woodLight} />
    <rect x={x - 110} y={y + 14} width="220" height="12" fill={INK.wood} />
    <ellipse cx={x} cy={y + 26} rx="110" ry="24" fill={INK.wood} />
    <ellipse cx={x} cy={y + 14} rx="110" ry="24" fill={INK.woodLight} />
    <rect x={x - 10} y={y + 40} width="20" height="70" fill={INK.bronze} />
    <path d={`M${x - 46} ${y + 120} h92 l-12 -12 h-68 z`} fill={INK.bronze} />
    {/* the log sheet and a small bar card */}
    <path d={`M${x - 76} ${y + 6} L${x - 60} ${y - 10} H${x - 4} L${x - 20} ${y + 6} Z`} fill={INK.paper} />
    {[0, 1, 2].map((i) => (
      <line key={i} x1={x - 66 + i * 3} y1={y - 6 + i * 4} x2={x - 22 + i * 3} y2={y - 6 + i * 4} stroke="#bdb29b" strokeWidth="1.5" />
    ))}
    <rect x={x + 10} y={y - 34} width="62" height="40" fill={INK.cream} />
    {[14, 22, 18, 28, 24].map((h, i) => (
      <rect key={i} x={x + 16 + i * 11} y={y + 2 - h} width="7" height={h} fill={i === 3 ? OCHRE : INK.green} />
    ))}
  </g>
);

/** The defence lectern, facing the skyline: where you present to the jury. */
export const c14_lectern: PropFn = ({ x, y }) => (
  <g>
    <Shadow x={x} y={y + 152} w={180} />
    <path d={`M${x - 60} ${y + 150} h120 l-14 -18 h-92 z`} fill={INK.bronze} />
    <path d={`M${x - 34} ${y + 132} L${x - 46} ${y - 40} H${x + 46} L${x + 34} ${y + 132} Z`} fill={INK.green} />
    {[0, 1, 2].map((i) => (
      <rect key={i} x={x - 30 + i * 22} y={y - 24} width="16" height="140" fill={INK.greenDeep} />
    ))}
    <rect x={x - 46} y={y - 48} width="92" height="10" fill={OCHRE} />
    {/* slanted top with notes */}
    <path d={`M${x - 76} ${y - 48} L${x - 64} ${y - 96} H${x + 64} L${x + 76} ${y - 48} Z`} fill={INK.bronze} />
    <path d={`M${x - 54} ${y - 56} L${x - 46} ${y - 88} H${x + 42} L${x + 50} ${y - 56} Z`} fill={INK.paper} />
    {[0, 1, 2, 3, 4].map((i) => (
      <line key={i} x1={x - 44 + i * 1.6} y1={y - 82 + i * 5.6} x2={x + 36 + i * 1.6} y2={y - 82 + i * 5.6} stroke="#bdb29b" strokeWidth="1.5" />
    ))}
    {/* deco fan medallion */}
    <path d={`M${x - 22} ${y + 20} A22 22 0 0 1 ${x + 22} ${y + 20} Z`} fill={OCHRE} />
    {[-2, -1, 0, 1, 2].map((k) => (
      <line key={k} x1={x} y1={y + 20} x2={x + Math.sin((k * Math.PI) / 6) * 20} y2={y + 20 - Math.cos((k * Math.PI) / 6) * 20} stroke={INK.bronze} strokeWidth="1.5" />
    ))}
    {/* microphone */}
    <line x1={x + 40} y1={y - 96} x2={x + 54} y2={y - 128} stroke={INK.bronze} strokeWidth="3" />
    <rect x={x + 48} y={y - 142} width="14" height="20" rx="7" fill={INK.brass} />
  </g>
);

/** Reward: the skyline medal — the stepped tower of the whole hotel, fourteen floors lit. */
export const c14_medal: PropFn = ({ x, y }) => (
  <g>
    {/* ribbon */}
    <path d={`M${x - 46} ${y - 108} L${x - 18} ${y - 40} H${x + 18} L${x + 46} ${y - 108} Z`} fill={INK.green} />
    <path d={`M${x - 14} ${y - 108} L${x} ${y - 70} L${x + 14} ${y - 108} Z`} fill="#7c2f2a" />
    {/* sunburst rim */}
    {Array.from({ length: 24 }, (_, i) => {
      const a = (i * Math.PI) / 12;
      return <line key={i} x1={x + Math.cos(a) * 66} y1={y + 20 + Math.sin(a) * 66} x2={x + Math.cos(a) * 84} y2={y + 20 + Math.sin(a) * 84} stroke={OCHRE} strokeWidth="5" />;
    })}
    <circle cx={x} cy={y + 20} r="68" fill={INK.brass} />
    <circle cx={x} cy={y + 20} r="58" fill={NIGHT} />
    <circle cx={x} cy={y + 20} r="58" fill="none" stroke={INK.brassDeep} strokeWidth="3" />
    {/* stepped tower */}
    <path
      d={`M${x - 30} ${y + 72} V${y + 20} H${x - 20} V${y} H${x - 10} V${y - 14} L${x} ${y - 34} L${x + 10} ${y - 14} V${y} H${x + 20} V${y + 20} H${x + 30} V${y + 72} Z`}
      fill={INK.brass}
    />
    {/* fourteen lit windows */}
    {Array.from({ length: 14 }, (_, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      return <rect key={i} x={x - 9 + col * 12} y={y + 64 - row * 9} width="6" height="5" fill={INK.light} />;
    })}
    <rect x={x - 1} y={y - 50} width="2" height="16" fill={INK.brass} />
    <circle cx={x} cy={y - 52} r="3" fill={INK.light} />
  </g>
);
