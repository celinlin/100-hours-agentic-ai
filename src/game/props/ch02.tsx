import { INK, Shadow, type PropFn } from './common';

/** 02 · The writing salon */

const TEAL = '#3e6b74';
const OX = '#7a2f2f';

/** A writing desk with a stand of five instruction cards (R T C E F), an inkwell and a nib. */
export const c02_desk: PropFn = ({ x, y }) => (
  <g>
    <Shadow x={x} y={y + 122} w={250} />
    {/* desk */}
    <rect x={x - 130} y={y + 20} width="260" height="16" fill={INK.wood} />
    <rect x={x - 124} y={y + 36} width="248" height="10" fill={INK.woodLight} />
    <rect x={x - 118} y={y + 46} width="14" height="74" fill={INK.wood} />
    <rect x={x + 104} y={y + 46} width="14" height="74" fill={INK.wood} />
    {/* card stand */}
    <rect x={x - 116} y={y + 6} width="176" height="14" fill={INK.bronze} />
    <rect x={x - 116} y={y + 2} width="176" height="4" fill={INK.brass} />
    {['R', 'T', 'C', 'E', 'F'].map((l, i) => (
      <g key={l} transform={`rotate(${(i - 2) * 6} ${x - 28 + (i - 2) * 34} ${y + 4})`}>
        <rect x={x - 46 + (i - 2) * 34} y={y - 74} width="36" height="78" rx="3" fill={i === 4 ? INK.light : INK.paper} />
        <rect x={x - 46 + (i - 2) * 34} y={y - 74} width="36" height="10" rx="3" fill={i === 4 ? INK.brass : TEAL} />
        <text x={x - 28 + (i - 2) * 34} y={y - 36} textAnchor="middle" fontSize="13" fontFamily="var(--mono)" fill={INK.bronze}>
          {l}
        </text>
        <rect x={x - 40 + (i - 2) * 34} y={y - 24} width="24" height="3" fill="#cfc4ae" />
        <rect x={x - 40 + (i - 2) * 34} y={y - 16} width="18" height="3" fill="#cfc4ae" />
      </g>
    ))}
    {/* inkwell and nib */}
    <rect x={x + 76} y={y - 6} width="40" height="26" rx="4" fill={INK.greenDeep} />
    <rect x={x + 86} y={y - 14} width="20" height="10" fill={INK.brass} />
    <path d={`M${x + 96} ${y - 12} L${x + 122} ${y - 78} L${x + 128} ${y - 76} L${x + 100} ${y - 10} Z`} fill={INK.bronze} />
    <path d={`M${x + 122} ${y - 78} L${x + 130} ${y - 96} L${x + 128} ${y - 76} Z`} fill={INK.brass} />
  </g>
);

/** A wall frame holding one specimen page: the model answer, shown not described. */
export const c02_frame: PropFn = ({ x, y }) => (
  <g>
    {/* cord */}
    <path d={`M${x - 50} ${y - 112} L${x} ${y - 150} L${x + 50} ${y - 112}`} fill="none" stroke={INK.brassDeep} strokeWidth="2.5" />
    <circle cx={x} cy={y - 150} r="5" fill={INK.brass} />
    {/* frame with stepped deco top */}
    <path d={`M${x - 100} ${y - 100} H${x - 40} V${y - 114} H${x + 40} V${y - 100} H${x + 100} V${y + 120} H${x - 100} Z`} fill={INK.bronze} />
    <rect x={x - 88} y={y - 88} width="176" height="196" fill={INK.brass} />
    <rect x={x - 80} y={y - 80} width="160" height="180" fill={INK.paper} />
    {/* the specimen: a JSON-shaped page */}
    <text x={x - 68} y={y - 56} fontSize="13" fontFamily="var(--mono)" fill={TEAL}>
      {'{'}
    </text>
    {[0, 1, 2, 3, 4, 5].map((i) => (
      <g key={i}>
        <rect x={x - 56} y={y - 46 + i * 20} width={[34, 30, 42, 52, 38, 60][i]} height="6" rx="2" fill={TEAL} />
        <rect x={x - 16 + [0, -4, 8, 18, 4, 26][i]} y={y - 46 + i * 20} width={[60, 40, 52, 36, 58, 30][i]} height="6" rx="2" fill={i === 1 ? INK.light : '#d8cfbd'} />
      </g>
    ))}
    <text x={x - 68} y={y + 90} fontSize="13" fontFamily="var(--mono)" fill={TEAL}>
      {'}'}
    </text>
    {/* tag */}
    <rect x={x - 42} y={y + 128} width="84" height="20" rx="3" fill={INK.greenDeep} />
    <text x={x} y={y + 142} textAnchor="middle" fontSize="11" fontFamily="var(--mono)" fill={INK.light}>
      exemple
    </text>
  </g>
);

/** A format press: the platen presses the brief into a fixed JSON form. */
export const c02_press: PropFn = ({ x, y }) => (
  <g>
    <Shadow x={x} y={y + 92} w={320} />
    {/* base */}
    <rect x={x - 150} y={y + 40} width="300" height="50" rx="8" fill={INK.bronze} />
    <rect x={x - 140} y={y + 50} width="280" height="6" fill={INK.brassDeep} />
    {/* bed with a sheet */}
    <rect x={x - 110} y={y + 22} width="220" height="18" fill={INK.bronzeLight} />
    <rect x={x - 70} y={y + 10} width="140" height="14" fill={INK.paper} />
    <text x={x} y={y + 21} textAnchor="middle" fontSize="11" fontFamily="var(--mono)" fill={TEAL}>
      {'{ "heure": … }'}
    </text>
    {/* pillars and crown */}
    <rect x={x - 110} y={y - 100} width="22" height="122" fill={INK.green} />
    <rect x={x + 88} y={y - 100} width="22" height="122" fill={INK.green} />
    <path d={`M${x - 124} ${y - 100} H${x + 124} L${x + 100} ${y - 128} H${x - 100} Z`} fill={INK.greenDeep} />
    <path d={`M${x - 40} ${y - 128} L${x} ${y - 146} L${x + 40} ${y - 128} Z`} fill={INK.brass} />
    {/* screw and platen */}
    <rect x={x - 7} y={y - 100} width="14" height="70" fill={INK.brassDeep} />
    {Array.from({ length: 6 }, (_, i) => (
      <rect key={i} x={x - 9} y={y - 94 + i * 11} width="18" height="3" fill={INK.brass} />
    ))}
    <rect x={x - 80} y={y - 30} width="160" height="22" rx="3" fill={INK.brass} />
    <rect x={x - 80} y={y - 12} width="160" height="6" fill={INK.brassDeep} />
    {/* handwheel */}
    <circle cx={x} cy={y - 112} r="4" fill={INK.bronze} />
    <rect x={x - 70} y={y - 116} width="140" height="8" rx="4" fill={INK.bronze} />
    <circle cx={x - 70} cy={y - 112} r="9" fill={OX} />
    <circle cx={x + 70} cy={y - 112} r="9" fill={OX} />
    {/* label plate */}
    <rect x={x - 44} y={y + 60} width="88" height="20" rx="3" fill={INK.greenDeep} />
    <text x={x} y={y + 74} textAnchor="middle" fontSize="11" fontFamily="var(--mono)" fill={INK.light}>
      required
    </text>
  </g>
);

/** A cabinet of drawers; one drawer open, three cards kept, one set aside on top. */
export const c02_drawer: PropFn = ({ x, y }) => (
  <g>
    <Shadow x={x} y={y + 122} w={240} />
    <rect x={x - 100} y={y - 90} width="200" height="210" fill={INK.wood} />
    <rect x={x - 108} y={y - 100} width="216" height="12" fill={INK.woodLight} />
    <rect x={x - 94} y={y + 112} width="20" height="10" fill={INK.bronze} />
    <rect x={x + 74} y={y + 112} width="20" height="10" fill={INK.bronze} />
    {[0, 1, 2, 3].map((r) => (
      <g key={r}>
        {[0, 1].map((c) => (
          <g key={c}>
            <rect x={x - 90 + c * 92} y={y - 78 + r * 48} width="88" height="42" fill={INK.woodLight} stroke="#4b3220" strokeWidth="2" />
            <rect x={x - 66 + c * 92} y={y - 70 + r * 48} width="40" height="10" fill={INK.paper} />
            <rect x={x - 54 + c * 92} y={y - 52 + r * 48} width="16" height="5" rx="2" fill={INK.brass} />
          </g>
        ))}
      </g>
    ))}
    {/* open drawer, pulled forward */}
    <rect x={x - 8} y={y - 4} width="104" height="40" fill="#7a5537" />
    <rect x={x - 8} y={y + 30} width="104" height="8" fill="#4b3220" />
    {[0, 1, 2].map((i) => (
      <rect key={i} x={x + 4 + i * 26} y={y - 34 + i * 2} width="30" height="38" fill={i === 1 ? INK.light : INK.paper} stroke="#c7bba5" />
    ))}
    {/* a card set aside on top, crossed out */}
    <g transform={`rotate(-12 ${x - 56} ${y - 116})`}>
      <rect x={x - 78} y={y - 132} width="44" height="30" fill={INK.paper} stroke="#c7bba5" />
      <line x1={x - 74} y1={y - 128} x2={x - 38} y2={y - 106} stroke={OX} strokeWidth="3" />
      <line x1={x - 38} y1={y - 128} x2={x - 74} y2={y - 106} stroke={OX} strokeWidth="3" />
    </g>
    <rect x={x + 6} y={y - 124} width="76" height="18" rx="3" fill={INK.greenDeep} />
    <text x={x + 44} y={y - 111} textAnchor="middle" fontSize="11" fontFamily="var(--mono)" fill={INK.light}>
      contexte
    </text>
  </g>
);

/** A brass line with five proof sheets clipped to it: the five trials, two flagged. */
export const c02_proofs: PropFn = ({ x, y }) => (
  <g>
    <rect x={x - 130} y={y - 96} width="260" height="6" rx="3" fill={INK.brass} />
    <circle cx={x - 132} cy={y - 93} r="8" fill={INK.brassDeep} />
    <circle cx={x + 132} cy={y - 93} r="8" fill={INK.brassDeep} />
    {[0, 1, 2, 3, 4].map((i) => {
      const sx = x - 120 + i * 50;
      const bad = i === 1 || i === 2 || i === 4;
      return (
        <g key={i} transform={`rotate(${[-3, 2, -2, 3, -1][i]} ${sx + 20} ${y - 92})`}>
          <rect x={sx} y={y - 86} width="40" height="120" fill={INK.paper} />
          <rect x={sx + 14} y={y - 100} width="12" height="18" rx="2" fill={INK.bronze} />
          <text x={sx + 20} y={y - 64} textAnchor="middle" fontSize="12" fontFamily="var(--mono)" fill={TEAL}>
            {i + 1}
          </text>
          {[0, 1, 2, 3, 4].map((k) => (
            <rect key={k} x={sx + 7} y={y - 50 + k * 13} width={[26, 20, 24, 16, 22][(k + i) % 5]} height="4" fill="#d3c9b5" />
          ))}
          <rect x={sx + 6} y={y + 18} width="28" height="10" rx="2" fill={bad ? OX : INK.green} />
        </g>
      );
    })}
    <rect x={x - 46} y={y + 54} width="92" height="20" rx="3" fill={INK.greenDeep} />
    <text x={x} y={y + 68} textAnchor="middle" fontSize="11" fontFamily="var(--mono)" fill={INK.light}>
      5 essais
    </text>
  </g>
);

/** Reward: the format stamp, a brass hand stamp and its print of braces. */
export const c02_stamp: PropFn = ({ x, y }) => (
  <g>
    {/* the print on paper */}
    <rect x={x - 140} y={y + 30} width="150" height="74" fill={INK.paper} transform={`rotate(-4 ${x - 65} ${y + 67})`} />
    <rect x={x - 124} y={y + 44} width="116" height="46" rx="6" fill="none" stroke={OX} strokeWidth="3" transform={`rotate(-4 ${x - 65} ${y + 67})`} />
    <text x={x - 66} y={y + 76} textAnchor="middle" fontSize="22" fontFamily="var(--mono)" fill={OX} transform={`rotate(-4 ${x - 65} ${y + 67})`}>
      {'{ }'}
    </text>
    {/* the stamp */}
    <ellipse cx={x + 70} cy={y - 78} rx="30" ry="26" fill={INK.wood} />
    <rect x={x + 58} y={y - 62} width="24" height="56" fill={INK.woodLight} />
    <rect x={x + 26} y={y - 10} width="88" height="20" rx="4" fill={INK.brass} />
    <rect x={x + 18} y={y + 10} width="104" height="26" rx="3" fill={INK.brassDeep} />
    <rect x={x + 18} y={y + 36} width="104" height="12" fill={OX} />
    <rect x={x + 30} y={y + 16} width="80" height="4" fill={INK.brass} />
  </g>
);
