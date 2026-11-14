import { INK, Shadow, type PropFn } from './common';

/** 00 · The lobby lounge (annex): the concierge's everyday tools. */

const TEAL = '#24504a';
const OX = '#7c2f2a';

/** The concierge desk with its service bell (ChatGPT: ask, follow up, attach). */
export const cH_desk: PropFn = ({ x, y }) => (
  <g>
    <Shadow x={x} y={y + 124} w={270} />
    {/* counter body */}
    <rect x={x - 130} y={y - 10} width="260" height="132" fill={INK.wood} />
    <rect x={x - 140} y={y - 22} width="280" height="16" fill={INK.woodLight} />
    {/* deco front panels */}
    {[0, 1, 2].map((i) => (
      <g key={i}>
        <rect x={x - 116 + i * 80} y={y + 10} width="72" height="96" fill={INK.bronzeLight} />
        <path d={`M${x - 80 + i * 80} ${y + 22} L${x - 104 + i * 80} ${y + 58} L${x - 80 + i * 80} ${y + 94} L${x - 56 + i * 80} ${y + 58} Z`} fill="none" stroke={INK.brass} strokeWidth="2" />
      </g>
    ))}
    <rect x={x - 130} y={y + 114} width="260" height="8" fill={INK.brassDeep} />
    {/* service bell */}
    <rect x={x + 40} y={y - 30} width="58" height="8" rx="2" fill={INK.brassDeep} />
    <path d={`M${x + 44} ${y - 30} A25 25 0 0 1 ${x + 94} ${y - 30} Z`} fill={INK.brass} />
    <rect x={x + 66} y={y - 62} width="6" height="8" fill={INK.brassDeep} />
    <circle cx={x + 69} cy={y - 64} r="5" fill={INK.brass} />
    {/* message pad with a follow-up arrow */}
    <rect x={x - 104} y={y - 46} width="96" height="24" fill={INK.paper} />
    <text x={x - 56} y={y - 30} textAnchor="middle" fontSize="11" fill={INK.bronze} fontFamily="var(--mono)">
      + relance
    </text>
    <rect x={x - 112} y={y - 82} width="56" height="36" fill={INK.cream} />
    <rect x={x - 106} y={y - 74} width="34" height="4" fill={TEAL} />
    <rect x={x - 106} y={y - 66} width="40" height="4" fill="#cfc3ab" />
    <rect x={x - 106} y={y - 58} width="28" height="4" fill="#cfc3ab" />
  </g>
);

/** A wall rack of pigeonholes: projects, documents, a sealed private envelope (Claude). */
export const cH_pigeonholes: PropFn = ({ x, y }) => (
  <g>
    <rect x={x - 120} y={y - 110} width="240" height="210" fill={INK.wood} />
    <path d={`M${x - 120} ${y - 110} L${x} ${y - 146} L${x + 120} ${y - 110} Z`} fill={INK.woodLight} />
    <circle cx={x} cy={y - 124} r="8" fill={INK.brass} />
    {Array.from({ length: 3 }, (_, r) =>
      Array.from({ length: 4 }, (_, c) => (
        <rect key={`${r}-${c}`} x={x - 108 + c * 54} y={y - 98 + r * 62} width="48" height="54" fill={INK.bronze} />
      )),
    )}
    {/* folders and letters */}
    <rect x={x - 102} y={y - 80} width="36" height="36" fill={INK.paper} />
    <rect x={x - 96} y={y - 86} width="36" height="42" fill={INK.cream} />
    <rect x={x - 48} y={y - 76} width="38" height="32" fill={TEAL} />
    <rect x={x + 8} y={y - 18} width="36" height="34" fill={INK.paper} />
    <path d={`M${x + 8} ${y - 18} L${x + 26} ${y} L${x + 44} ${y - 18}`} fill="none" stroke="#cfc3ab" strokeWidth="2" />
    {/* the sealed envelope: a private chat */}
    <rect x={x + 60} y={y - 18} width="38" height="30" fill={INK.cream} />
    <path d={`M${x + 60} ${y - 18} L${x + 79} ${y} L${x + 98} ${y - 18}`} fill="none" stroke="#cfc3ab" strokeWidth="2" />
    <circle cx={x + 79} cy={y} r="7" fill={OX} />
    <rect x={x - 102} y={y + 46} width="40" height="30" fill={INK.light} />
    <rect x={x - 46} y={y + 40} width="36" height="38" fill={INK.paper} />
    {/* brass label plate */}
    <rect x={x - 54} y={y + 104} width="108" height="20" fill={INK.brass} />
    <text x={x} y={y + 118} textAnchor="middle" fontSize="11" fill={INK.bronze} fontFamily="var(--mono)">
      PROJETS
    </text>
  </g>
);

/** A secretary desk with five drawers, one per Microsoft 365 app. */
export const cH_secretary: PropFn = ({ x, y }) => (
  <g>
    <Shadow x={x} y={y + 124} w={300} />
    {/* upper cabinet */}
    <rect x={x - 120} y={y - 118} width="240" height="96" fill={INK.green} />
    <path d={`M${x - 120} ${y - 118} L${x} ${y - 150} L${x + 120} ${y - 118} Z`} fill={INK.greenDeep} />
    <path d={`M${x - 26} ${y - 126} A26 26 0 0 1 ${x + 26} ${y - 126}`} fill="none" stroke={INK.brass} strokeWidth="3" />
    {['WORD', 'EXCEL', 'PPT', 'MAIL', 'TEAMS'].map((t, i) => (
      <g key={t}>
        <rect x={x - 112 + i * 45} y={y - 108} width="40" height="76" fill={INK.greenDeep} />
        <rect x={x - 106 + i * 45} y={y - 96} width="28" height={18 + (i % 3) * 8} fill={i === 1 ? INK.light : INK.paper} />
        <text x={x - 92 + i * 45} y={y - 40} textAnchor="middle" fontSize="9" fill={INK.brass} fontFamily="var(--mono)">
          {t}
        </text>
      </g>
    ))}
    {/* writing leaf */}
    <rect x={x - 140} y={y - 22} width="280" height="18" fill={INK.woodLight} />
    <rect x={x - 70} y={y - 34} width="90" height="12" fill={INK.paper} />
    <rect x={x + 40} y={y - 40} width="6" height="18" fill={INK.brass} transform={`rotate(20 ${x + 43} ${y - 31})`} />
    {/* drawers */}
    <rect x={x - 128} y={y - 4} width="256" height="112" fill={INK.wood} />
    {[0, 1].map((r) => (
      <g key={r}>
        <rect x={x - 116} y={y + 8 + r * 50} width="232" height="40" fill={INK.woodLight} />
        <rect x={x - 14} y={y + 24 + r * 50} width="28" height="7" rx="3" fill={INK.brass} />
      </g>
    ))}
    <rect x={x - 124} y={y + 108} width="16" height="16" fill={INK.bronze} />
    <rect x={x + 108} y={y + 108} width="16" height="16" fill={INK.bronze} />
  </g>
);

/** A reading lectern with an open notebook, sources tabbed, and a magnifier (research tools). */
export const cH_lectern: PropFn = ({ x, y }) => (
  <g>
    <Shadow x={x} y={y + 124} w={220} />
    {/* stand */}
    <path d={`M${x - 70} ${y + 122} h140 l-14 -16 h-112 z`} fill={INK.bronze} />
    <rect x={x - 12} y={y - 10} width="24" height="116" fill={INK.bronzeLight} />
    <rect x={x - 26} y={y + 40} width="52" height="8" fill={INK.brassDeep} />
    {/* sloped desk */}
    <path d={`M${x - 120} ${y - 6} L${x - 100} ${y - 70} H${x + 100} L${x + 120} ${y - 6} Z`} fill={INK.wood} />
    {/* open notebook */}
    <path d={`M${x - 96} ${y - 16} L${x - 82} ${y - 64} H${x - 2} V${y - 16} Z`} fill={INK.paper} />
    <path d={`M${x + 96} ${y - 16} L${x + 82} ${y - 64} H${x + 2} V${y - 16} Z`} fill={INK.cream} />
    {[0, 1, 2, 3].map((i) => (
      <rect key={i} x={x - 80 + i * 2} y={y - 56 + i * 9} width={60 - i * 6} height="4" fill="#cfc3ab" />
    ))}
    {/* citation marker */}
    <rect x={x - 26} y={y - 48} width="14" height="10" rx="2" fill={INK.light} />
    <text x={x - 19} y={y - 40} textAnchor="middle" fontSize="8" fill={INK.bronze} fontFamily="var(--mono)">
      1
    </text>
    {/* source tabs */}
    {[TEAL, OX, INK.brass].map((c, i) => (
      <rect key={i} x={x + 98 - i * 3} y={y - 62 + i * 14} width="16" height="10" fill={c} />
    ))}
    {/* magnifier over the right page */}
    <circle cx={x + 46} cy={y - 42} r="18" fill="none" stroke={INK.brass} strokeWidth="5" />
    <circle cx={x + 46} cy={y - 42} r="13" fill={INK.glow} opacity="0.6" />
    <rect x={x + 58} y={y - 30} width="8" height="28" rx="3" fill={INK.bronze} transform={`rotate(-40 ${x + 62} ${y - 16})`} />
    <rect x={x - 46} y={y - 4} width="92" height="16" fill={INK.brass} />
    <text x={x} y={y + 8} textAnchor="middle" fontSize="10" fill={INK.bronze} fontFamily="var(--mono)">
      SOURCES
    </text>
  </g>
);

/** A framed poster draft on the wall, with an editor's red marks (marketing review). */
export const cH_poster: PropFn = ({ x, y }) => (
  <g>
    <rect x={x - 100} y={y - 126} width="200" height="252" fill={INK.brass} />
    <rect x={x - 90} y={y - 116} width="180" height="232" fill={INK.paper} />
    {/* sunburst header */}
    <rect x={x - 80} y={y - 106} width="160" height="70" fill={TEAL} />
    {Array.from({ length: 7 }, (_, i) => (
      <line key={i} x1={x} y1={y - 36} x2={x - 72 + i * 24} y2={y - 104} stroke={INK.brass} strokeWidth="2" />
    ))}
    <path d={`M${x - 26} ${y - 36} A26 26 0 0 1 ${x + 26} ${y - 36} Z`} fill={INK.light} />
    {/* headline + copy */}
    <rect x={x - 70} y={y - 24} width="140" height="10" fill={INK.bronze} />
    {[0, 1, 2, 3, 4].map((i) => (
      <rect key={i} x={x - 70} y={y + i * 16} width={[130, 110, 124, 96, 118][i]} height="6" fill="#cfc3ab" />
    ))}
    {/* the unsourced figure, circled */}
    <text x={x - 66} y={y + 26} fontSize="13" fill={INK.bronze} fontFamily="var(--mono)">
      93 %
    </text>
    <ellipse cx={x - 50} cy={y + 22} rx="26" ry="13" fill="none" stroke={OX} strokeWidth="3" />
    <text x={x + 38} y={y + 26} fontSize="16" fill={OX} fontFamily="var(--mono)">
      ?
    </text>
    {/* approval stamp area */}
    <rect x={x - 70} y={y + 84} width="72" height="20" fill="none" stroke={OX} strokeWidth="2" />
    <text x={x - 34} y={y + 98} textAnchor="middle" fontSize="10" fill={OX} fontFamily="var(--mono)">
      À RELIRE
    </text>
    <circle cx={x} cy={y - 136} r="5" fill={INK.brassDeep} />
    <path d={`M${x - 60} ${y - 126} L${x} ${y - 136} L${x + 60} ${y - 126}`} fill="none" stroke={INK.brassDeep} strokeWidth="2" />
  </g>
);

/** Reward: the concierge's notebook — leather, brass corners, ribbon and pencil. */
export const cH_notebook: PropFn = ({ x, y }) => (
  <g>
    <rect x={x - 96} y={y - 92} width="180" height="190" rx="6" fill={TEAL} />
    <rect x={x - 96} y={y - 92} width="22" height="190" fill="#1b3c37" />
    {/* brass corners */}
    <path d={`M${x + 84} ${y - 92} h-26 l26 26 z`} fill={INK.brass} />
    <path d={`M${x + 84} ${y + 98} h-26 l26 -26 z`} fill={INK.brass} />
    {/* label */}
    <rect x={x - 54} y={y - 46} width="116" height="50" fill={INK.paper} />
    <rect x={x - 48} y={y - 40} width="104" height="38" fill="none" stroke={INK.brassDeep} strokeWidth="2" />
    <text x={x + 4} y={y - 16} textAnchor="middle" fontSize="12" fill={INK.bronze} fontFamily="var(--mono)">
      CONCIERGE
    </text>
    {/* fan emblem */}
    <path d={`M${x - 26} ${y + 56} A30 30 0 0 1 ${x + 34} ${y + 56} Z`} fill={INK.brass} />
    {[0, 1, 2, 3, 4].map((i) => (
      <line key={i} x1={x + 4} y1={y + 56} x2={x + 4 + 30 * Math.cos(Math.PI * (1 - i / 4))} y2={y + 56 - 30 * Math.sin(Math.PI * (1 - i / 4))} stroke={INK.brassDeep} strokeWidth="2" />
    ))}
    {/* ribbon */}
    <path d={`M${x + 40} ${y + 98} v10 l8 -6 l8 6 v-10 z`} fill={OX} />
    {/* pencil */}
    <rect x={x + 100} y={y - 80} width="12" height="150" fill={INK.light} />
    <rect x={x + 100} y={y - 92} width="12" height="12" fill={INK.brassDeep} />
    <path d={`M${x + 100} ${y + 70} L${x + 106} ${y + 88} L${x + 112} ${y + 70} Z`} fill={INK.cream} />
    <path d={`M${x + 104} ${y + 82} L${x + 106} ${y + 88} L${x + 108} ${y + 82} Z`} fill={INK.bronze} />
  </g>
);
