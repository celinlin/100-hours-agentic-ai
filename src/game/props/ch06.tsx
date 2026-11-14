import { INK, Shadow, type PropFn } from './common';

/** 06 · The library — RAG: shelves of chunks, a catalogue of embeddings, a lectern, a stamp. */

const OX = '#6e2f2a'; // oxblood book spines (room tone 1)
const TEAL = '#2f6b6a'; // teal book spines (room tone 2)

/** Tall shelves: documents cut into short, labelled passages (chunks). */
export const c06_shelves: PropFn = ({ x, y }) => {
  const spines = [OX, INK.green, INK.brassDeep, TEAL, INK.cream, OX, TEAL, INK.green];
  return (
    <g>
      <Shadow x={x} y={y + 124} w={240} />
      <rect x={x - 110} y={y - 170} width="220" height="292" fill={INK.wood} />
      <path d={`M${x - 120} ${y - 170} L${x} ${y - 204} L${x + 120} ${y - 170} Z`} fill={INK.woodLight} />
      <circle cx={x} cy={y - 182} r="7" fill={INK.brass} />
      <rect x={x - 98} y={y - 158} width="196" height="262" fill={INK.bronze} />
      {[0, 1, 2].map((r) => (
        <g key={r}>
          {spines.map((c, i) => {
            const w = 16 + ((i * 7 + r * 5) % 9);
            const h = 58 + ((i * 11 + r * 3) % 18);
            const off = spines.slice(0, i).reduce((s, _, k) => s + 16 + ((k * 7 + r * 5) % 9) + 3, 0);
            return <rect key={i} x={x - 92 + off} y={y - 82 + r * 86 - h} width={w} height={h} fill={c} />;
          })}
          <rect x={x - 104} y={y - 82 + r * 86} width="208" height="8" fill={INK.woodLight} />
        </g>
      ))}
      {/* label plates: one per chunk shelf */}
      {[0, 1, 2].map((r) => (
        <rect key={r} x={x - 16} y={y - 79 + r * 86} width="32" height="5" fill={INK.brass} />
      ))}
      <rect x={x - 110} y={y + 104} width="220" height="18" fill={INK.woodLight} />
    </g>
  );
};

/** A card catalogue of embeddings: drawers of index cards, one open with a vector card. */
export const c06_catalogue: PropFn = ({ x, y }) => (
  <g>
    <Shadow x={x} y={y + 124} w={230} />
    <rect x={x - 104} y={y - 70} width="208" height="150" fill={INK.wood} />
    <rect x={x - 112} y={y - 80} width="224" height="12" fill={INK.woodLight} />
    {Array.from({ length: 3 }, (_, r) =>
      Array.from({ length: 4 }, (_, c) => (
        <g key={`${r}-${c}`}>
          <rect x={x - 96 + c * 49} y={y - 60 + r * 46} width="43" height="40" fill={INK.woodLight} />
          <rect x={x - 86 + c * 49} y={y - 54 + r * 46} width="23" height="9" fill={INK.paper} />
          <circle cx={x - 74.5 + c * 49} cy={y - 30 + r * 46} r="4" fill={INK.brass} />
        </g>
      )),
    )}
    {/* legs */}
    <rect x={x - 96} y={y + 80} width="14" height="42" fill={INK.bronzeLight} />
    <rect x={x + 82} y={y + 80} width="14" height="42" fill={INK.bronzeLight} />
    <rect x={x - 96} y={y + 92} width="192" height="6" fill={INK.bronzeLight} />
    {/* an index card drawn out: a short vector */}
    <rect x={x - 66} y={y - 150} width="132" height="78" fill={INK.paper} />
    <rect x={x - 66} y={y - 150} width="132" height="16" fill={TEAL} />
    <text x={x} y={y - 138} textAnchor="middle" fontSize="11" fill={INK.paper} fontFamily="var(--mono)">
      embedding
    </text>
    {[0.62, 0.21, 0.85, 0.4, 0.73, 0.3, 0.55].map((v, i) => (
      <rect key={i} x={x - 54 + i * 16} y={y - 82 - v * 42} width="10" height={v * 42} fill={i % 2 ? INK.brassDeep : INK.green} />
    ))}
  </g>
);

/** A reading lectern with an open book and a magnifier over one passage. */
export const c06_lectern: PropFn = ({ x, y }) => (
  <g>
    <Shadow x={x} y={y + 122} w={200} />
    <path d={`M${x - 70} ${y + 120} h140 l-14 -16 h-112 z`} fill={INK.bronze} />
    <rect x={x - 12} y={y - 10} width="24" height="114" fill={INK.bronzeLight} />
    <rect x={x - 20} y={y + 30} width="40" height="10" fill={INK.brassDeep} />
    {/* slanted desk */}
    <path d={`M${x - 120} ${y - 10} L${x - 104} ${y - 60} H${x + 104} L${x + 120} ${y - 10} Z`} fill={INK.woodLight} />
    <rect x={x - 120} y={y - 12} width="240" height="8" fill={INK.wood} />
    {/* open book */}
    <path d={`M${x - 96} ${y - 20} L${x - 86} ${y - 62} Q${x - 44} ${y - 70} ${x} ${y - 58} L${x} ${y - 16} Q${x - 46} ${y - 28} ${x - 96} ${y - 20} Z`} fill={INK.paper} />
    <path d={`M${x + 96} ${y - 20} L${x + 86} ${y - 62} Q${x + 44} ${y - 70} ${x} ${y - 58} L${x} ${y - 16} Q${x + 46} ${y - 28} ${x + 96} ${y - 20} Z`} fill={INK.cream} />
    {[0, 1, 2, 3].map((i) => (
      <g key={i}>
        <rect x={x - 80 + i * 2} y={y - 54 + i * 9} width="64" height="3" fill="#cfc6b3" />
        <rect x={x + 16} y={y - 54 + i * 9} width="64" height="3" fill={i === 1 ? INK.light : '#cfc6b3'} />
      </g>
    ))}
    {/* magnifier */}
    <circle cx={x + 48} cy={y - 44} r="26" fill={INK.glow} opacity="0.35" />
    <circle cx={x + 48} cy={y - 44} r="26" fill="none" stroke={INK.brass} strokeWidth="6" />
    <path d={`M${x + 66} ${y - 26} L${x + 98} ${y + 4}`} stroke={INK.bronze} strokeWidth="9" strokeLinecap="round" />
    {/* bookmark ribbon */}
    <path d={`M${x - 4} ${y - 18} v26 l4 -6 l4 6 v-26 z`} fill={OX} />
  </g>
);

/** A returns cart with three trays: reading, retrieval, generation. */
export const c06_cart: PropFn = ({ x, y }) => (
  <g>
    <Shadow x={x} y={y + 124} w={240} />
    <rect x={x - 116} y={y - 110} width="10" height="210" fill={INK.bronze} />
    <rect x={x + 106} y={y - 110} width="10" height="210" fill={INK.bronze} />
    <path d={`M${x - 116} ${y - 110} q -24 -6 -26 -26`} fill="none" stroke={INK.brass} strokeWidth="5" />
    {[0, 1, 2].map((r) => (
      <g key={r}>
        <rect x={x - 112} y={y - 40 + r * 60} width="224" height="10" fill={INK.wood} />
        {Array.from({ length: 6 }, (_, i) => {
          const c = [OX, TEAL, INK.green, INK.brassDeep, INK.cream, OX][(i + r) % 6];
          const h = 34 + ((i * 7 + r * 4) % 14);
          return <rect key={i} x={x - 100 + i * 22 + r * 6} y={y - 40 + r * 60 - h} width="18" height={h} fill={c} transform={i === 5 ? `rotate(14 ${x - 82 + i * 22 + r * 6} ${y - 40 + r * 60})` : undefined} />;
        })}
        <rect x={x + 44} y={y - 34 + r * 60} width="58" height="14" rx="2" fill={INK.paper} />
        <text x={x + 73} y={y - 23 + r * 60} textAnchor="middle" fontSize="10" fill={INK.bronze} fontFamily="var(--mono)">
          {['lecture', 'recherche', 'génération'][r]}
        </text>
      </g>
    ))}
    <rect x={x - 112} y={y + 100} width="224" height="8" fill={INK.bronzeLight} />
    <circle cx={x - 90} cy={y + 114} r="10" fill={INK.bronze} />
    <circle cx={x + 90} cy={y + 114} r="10" fill={INK.bronze} />
    <circle cx={x - 90} cy={y + 114} r="4" fill={INK.brass} />
    <circle cx={x + 90} cy={y + 114} r="4" fill={INK.brass} />
  </g>
);

/** A wall dial: the distance threshold (passages under the mark are kept). */
export const c06_dial: PropFn = ({ x, y }) => (
  <g>
    <rect x={x - 6} y={y - 150} width="12" height="40" fill={INK.brassDeep} />
    <circle cx={x} cy={y - 20} r="96" fill={INK.bronze} />
    <circle cx={x} cy={y - 20} r="84" fill={INK.paper} />
    {/* kept zone (under the threshold) */}
    <path d={`M${x} ${y - 20} L${x - 59} ${y + 39} A84 84 0 0 1 ${x} ${y - 104} Z`} fill={TEAL} opacity="0.85" />
    {Array.from({ length: 11 }, (_, i) => {
      const a = Math.PI * (1.25 - i * 0.15);
      return (
        <line key={i} x1={x + Math.cos(a) * 70} y1={y - 20 - Math.sin(a) * 70} x2={x + Math.cos(a) * 82} y2={y - 20 - Math.sin(a) * 82} stroke={INK.bronze} strokeWidth={i % 5 === 0 ? 4 : 2} />
      );
    })}
    <circle cx={x} cy={y - 20} r="84" fill="none" stroke={INK.brass} strokeWidth="5" />
    {/* needle on 1.0 */}
    <line x1={x} y1={y - 20} x2={x + 4} y2={y - 96} stroke={OX} strokeWidth="5" strokeLinecap="round" />
    <circle cx={x} cy={y - 20} r="10" fill={INK.brass} />
    <rect x={x - 46} y={y + 22} width="92" height="22" rx="3" fill={INK.greenDeep} />
    <text x={x} y={y + 37} textAnchor="middle" fontSize="12" fill={INK.light} fontFamily="var(--mono)">
      SEUIL 1.0
    </text>
  </g>
);

/** Reward: the source stamp, with its imprint "[source]". */
export const c06_stamp: PropFn = ({ x, y }) => (
  <g>
    {/* imprint */}
    <rect x={x - 140} y={y + 30} width="150" height="64" rx="6" fill={INK.paper} />
    <rect x={x - 130} y={y + 40} width="130" height="44" rx="4" fill="none" stroke={OX} strokeWidth="3" />
    <text x={x - 65} y={y + 68} textAnchor="middle" fontSize="13" fill={OX} fontFamily="var(--mono)">
      [source]
    </text>
    {/* stamp */}
    <rect x={x + 10} y={y + 40} width="120" height="26" rx="4" fill={INK.brassDeep} />
    <rect x={x + 20} y={y + 66} width="100" height="12" fill={OX} />
    <rect x={x + 54} y={y - 20} width="32" height="60" fill={INK.brass} />
    <circle cx={x + 70} cy={y - 50} r="38" fill={INK.wood} />
    <circle cx={x + 70} cy={y - 50} r="28" fill={INK.woodLight} />
    <circle cx={x + 70} cy={y - 50} r="10" fill={INK.brass} />
    <rect x={x + 40} y={y - 22} width="60" height="8" fill={INK.brassDeep} />
  </g>
);
