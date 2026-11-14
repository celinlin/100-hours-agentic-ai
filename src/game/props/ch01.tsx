import { INK, Shadow, type PropFn } from './common';

/** 01 · The language engine room */

/** A typewriter that cuts sentences into tokens (paper strip with chips). */
export const typewriter: PropFn = ({ x, y }) => (
  <g>
    {/* desk */}
    <rect x={x - 130} y={y + 30} width="260" height="16" fill={INK.wood} />
    <rect x={x - 118} y={y + 46} width="14" height="74" fill={INK.wood} />
    <rect x={x + 104} y={y + 46} width="14" height="74" fill={INK.wood} />
    <Shadow x={x} y={y + 122} w={240} />
    {/* paper strip with tokens */}
    <rect x={x - 46} y={y - 110} width="92" height="70" fill={INK.paper} />
    {[
      [0, 0, 34],
      [38, 0, 22],
      [0, 18, 20],
      [24, 18, 40],
      [0, 36, 26],
      [30, 36, 14],
      [48, 36, 18],
    ].map(([dx, dy, w], i) => (
      <rect key={i} x={x - 40 + dx} y={y - 102 + dy} width={w} height="12" rx="2" fill={i === 5 || i === 6 ? INK.light : '#dfe7df'} />
    ))}
    {/* machine body */}
    <path d={`M${x - 92} ${y + 30} L${x - 76} ${y - 26} H${x + 76} L${x + 92} ${y + 30} Z`} fill={INK.greenDeep} />
    <rect x={x - 70} y={y - 44} width="140" height="22" rx="10" fill={INK.bronze} />
    <rect x={x - 82} y={y - 40} width="10" height="14" rx="3" fill={INK.brass} />
    <rect x={x + 72} y={y - 40} width="10" height="14" rx="3" fill={INK.brass} />
    {Array.from({ length: 3 }, (_, r) =>
      Array.from({ length: 9 - r }, (_, c) => <circle key={`${r}-${c}`} cx={x - 56 + r * 7 + c * 14} cy={y - 6 + r * 11} r="4.5" fill={INK.cream} stroke={INK.bronze} strokeWidth="1.5" />),
    )}
    <rect x={x - 40} y={y + 22} width="80" height="5" rx="2" fill={INK.brass} />
  </g>
);

/** A standing gauge: probabilities of the next token, with a needle. */
export const gauge: PropFn = ({ x, y }) => (
  <g>
    <rect x={x - 10} y={y} width="20" height="110" fill={INK.bronze} />
    <path d={`M${x - 50} ${y + 120} h100 l-10 -12 h-80 z`} fill={INK.bronze} />
    <Shadow x={x} y={y + 122} w={140} />
    <circle cx={x} cy={y - 40} r="80" fill={INK.bronze} />
    <circle cx={x} cy={y - 40} r="70" fill={INK.paper} />
    {/* three sectors: 62 / 21 / 9 (illustrative, as in the programme) */}
    <path d={`M${x} ${y - 40} L${x - 70} ${y - 40} A70 70 0 0 1 ${x + 32} ${y - 102} Z`} fill={INK.green} opacity="0.9" />
    <path d={`M${x} ${y - 40} L${x + 32} ${y - 102} A70 70 0 0 1 ${x + 66} ${y - 62} Z`} fill={INK.light} />
    <path d={`M${x} ${y - 40} L${x + 66} ${y - 62} A70 70 0 0 1 ${x + 70} ${y - 40} Z`} fill={INK.brass} />
    <circle cx={x} cy={y - 40} r="70" fill="none" stroke={INK.brass} strokeWidth="4" />
    <line x1={x} y1={y - 40} x2={x - 40} y2={y - 88} stroke={INK.bronze} strokeWidth="4" strokeLinecap="round" />
    <circle cx={x} cy={y - 40} r="8" fill={INK.brass} />
    <rect x={x - 36} y={y - 4} width="72" height="18" rx="3" fill={INK.greenDeep} />
    <text x={x} y={y + 9} textAnchor="middle" fontSize="11" fill={INK.light} fontFamily="var(--mono)">
      T = 1.0
    </text>
  </g>
);

/** A card catalogue: what the model receives — instructions, conversation, documents. */
export const cardfile: PropFn = ({ x, y }) => (
  <g>
    <rect x={x - 110} y={y - 100} width="220" height="220" fill={INK.wood} />
    <rect x={x - 116} y={y - 108} width="232" height="12" fill={INK.woodLight} />
    {Array.from({ length: 3 }, (_, r) =>
      Array.from({ length: 3 }, (_, c) => (
        <g key={`${r}-${c}`}>
          <rect x={x - 100 + c * 68} y={y - 88 + r * 68} width="60" height="58" fill={INK.woodLight} stroke="#4b3220" strokeWidth="2" />
          <rect x={x - 86 + c * 68} y={y - 76 + r * 68} width="32" height="12" fill={INK.paper} />
          <circle cx={x - 70 + c * 68} cy={y - 48 + r * 68} r="5" fill={INK.brass} />
        </g>
      )),
    )}
    {/* one drawer pulled out with cards */}
    <rect x={x - 32} y={y - 30} width="60" height="30" fill="#7a5537" />
    {[0, 1, 2].map((i) => (
      <rect key={i} x={x - 26 + i * 4} y={y - 52 + i * 3} width="48" height="30" fill={i === 2 ? INK.light : INK.paper} stroke="#c7bba5" />
    ))}
    <Shadow x={x} y={y + 122} w={240} />
  </g>
);

/** The loop machine: a model chamber, a tool arm and a return pipe. */
export const loopmachine: PropFn = ({ x, y }) => (
  <g>
    <Shadow x={x} y={y + 92} w={320} />
    <rect x={x - 150} y={y + 40} width="300" height="50" rx="8" fill={INK.bronze} />
    {/* model chamber */}
    <rect x={x - 130} y={y - 80} width="110" height="120" rx="14" fill={INK.green} />
    <rect x={x - 118} y={y - 68} width="86" height="60" rx="8" fill={INK.greenDeep} />
    <text x={x - 75} y={y - 33} textAnchor="middle" fontSize="13" fill={INK.light} fontFamily="var(--mono)">
      OUTIL
    </text>
    <rect x={x - 110} y={y + 4} width="70" height="8" rx="4" fill={INK.brass} />
    {/* system chamber */}
    <rect x={x + 20} y={y - 80} width="110" height="120" rx="14" fill={INK.light} />
    <circle cx={x + 75} cy={y - 26} r="30" fill="none" stroke={INK.bronze} strokeWidth="5" />
    {Array.from({ length: 8 }, (_, i) => {
      const a = (i * Math.PI) / 4;
      return <rect key={i} x={x + 72 + Math.cos(a) * 32} y={y - 29 + Math.sin(a) * 32} width="6" height="6" fill={INK.bronze} />;
    })}
    <circle cx={x + 75} cy={y - 26} r="8" fill={INK.bronze} />
    {/* arrows: request out, result back */}
    <path d={`M${x - 20} ${y - 50} H${x + 20}`} stroke={INK.brass} strokeWidth="6" />
    <path d={`M${x + 12} ${y - 58} L${x + 22} ${y - 50} L${x + 12} ${y - 42}`} fill="none" stroke={INK.brass} strokeWidth="4" />
    <path d={`M${x + 75} ${y + 40} V${y + 64} H${x - 75} V${y + 40}`} fill="none" stroke={INK.brassDeep} strokeWidth="6" />
    <path d={`M${x - 83} ${y + 50} L${x - 75} ${y + 40} L${x - 67} ${y + 50}`} fill="none" stroke={INK.brassDeep} strokeWidth="4" />
    <rect x={x - 22} y={y + 52} width="44" height="18" rx="3" fill={INK.greenDeep} />
    <text x={x} y={y + 65} textAnchor="middle" fontSize="11" fill={INK.light} fontFamily="var(--mono)">
      tour
    </text>
  </g>
);

/** A display cabinet: families of AI, nested like boxes. */
export const cabinet: PropFn = ({ x, y }) => (
  <g>
    <Shadow x={x} y={y + 152} w={200} />
    <rect x={x - 90} y={y - 150} width="180" height="300" fill={INK.bronze} />
    <rect x={x - 78} y={y - 138} width="156" height="200" fill="#25372f" />
    <rect x={x - 78} y={y - 138} width="156" height="200" fill="none" stroke={INK.brass} strokeWidth="3" />
    {/* nested boxes: AI ⊃ ML ⊃ DL ⊃ LLM */}
    <rect x={x - 66} y={y - 120} width="132" height="168" rx="6" fill="none" stroke={INK.cream} strokeWidth="2" />
    <rect x={x - 52} y={y - 92} width="104" height="128" rx="6" fill="none" stroke={INK.brass} strokeWidth="2" />
    <rect x={x - 38} y={y - 64} width="76" height="88" rx="6" fill="none" stroke={INK.light} strokeWidth="2" />
    <rect x={x - 22} y={y - 36} width="44" height="48" rx="6" fill={INK.light} opacity="0.85" />
    <rect x={x - 78} y={y + 72} width="156" height="66" fill={INK.bronzeLight} />
    <rect x={x - 70} y={y + 80} width="66" height="50" fill="none" stroke={INK.brass} strokeWidth="2" />
    <rect x={x + 4} y={y + 80} width="66" height="50" fill="none" stroke={INK.brass} strokeWidth="2" />
  </g>
);

/** Reward: the engine-room key, with a token-shaped bow. */
export const key01: PropFn = ({ x, y }) => (
  <g>
    <rect x={x - 100} y={y - 40} width="80" height="80" rx="16" fill={INK.brass} />
    <rect x={x - 86} y={y - 26} width="52" height="52" rx="8" fill="none" stroke={INK.brassDeep} strokeWidth="4" />
    <text x={x - 60} y={y + 8} textAnchor="middle" fontSize="22" fontFamily="var(--mono)" fill={INK.bronze}>
      tok
    </text>
    <rect x={x - 22} y={y - 9} width="130" height="18" rx="4" fill={INK.brass} />
    <rect x={x + 70} y={y + 9} width="14" height="28" fill={INK.brass} />
    <rect x={x + 92} y={y + 9} width="14" height="20" fill={INK.brass} />
  </g>
);
