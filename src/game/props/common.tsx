import type { RoomStyle } from '../types';

export type PropProps = { x: number; y: number; style: RoomStyle };
export type PropFn = (p: PropProps) => React.JSX.Element;

/** House palette for props — every room draws with the same inks. */
export const INK = {
  brass: '#c9b67a',
  brassDeep: '#9c8559',
  bronze: '#2d2721',
  bronzeLight: '#4a3f33',
  green: '#1e4d3b',
  greenDeep: '#0f2a20',
  cream: '#efe7d8',
  paper: '#f7f2e6',
  light: '#e3c27a',
  glow: '#fff3c4',
  shadow: 'rgba(0,0,0,0.22)',
  wood: '#6b4a2f',
  woodLight: '#8a6340',
};

/** Soft contact shadow under an object standing on the floor. */
export function Shadow({ x, y, w = 160 }: { x: number; y: number; w?: number }) {
  return <ellipse cx={x} cy={y} rx={w / 2} ry={w / 12} fill={INK.shadow} />;
}

/** The lift door to the next floor: every room has one; the final challenge opens it. */
export const door: PropFn = ({ x, y }) => (
  <g>
    <rect x={x - 92} y={y - 210} width="184" height="380" fill={INK.bronze} />
    <path d={`M${x - 80} ${y - 150} L${x} ${y - 200} L${x + 80} ${y - 150} Z`} fill={INK.brass} />
    {Array.from({ length: 7 }, (_, i) => (
      <line key={i} x1={x} y1={y - 158} x2={x - 72 + i * 24} y2={y - 152 + Math.abs(3 - i) * -6 + 18} stroke={INK.brassDeep} strokeWidth="2" />
    ))}
    <rect x={x - 80} y={y - 146} width="78" height="306" fill={INK.green} />
    <rect x={x + 2} y={y - 146} width="78" height="306" fill={INK.green} />
    {[0, 1].map((k) => (
      <g key={k} transform={`translate(${k ? x + 2 : x - 80} 0)`}>
        <rect x="10" y={y - 130} width="58" height="120" fill="none" stroke={INK.brass} strokeWidth="2" />
        <path d={`M10 ${y - 70} L39 ${y - 120} L68 ${y - 70} L39 ${y - 20} Z`} fill="none" stroke={INK.brass} strokeWidth="1.5" />
        <rect x="10" y={y + 6} width="58" height="134" fill="none" stroke={INK.brass} strokeWidth="2" />
      </g>
    ))}
    <rect x={x - 3} y={y - 146} width="6" height="306" fill={INK.brassDeep} />
    {/* floor indicator */}
    <path d={`M${x - 40} ${y - 172} A40 40 0 0 1 ${x + 40} ${y - 172}`} fill="none" stroke={INK.brass} strokeWidth="2" />
    <line x1={x} y1={y - 172} x2={x + 24} y2={y - 196} stroke={INK.light} strokeWidth="2.5" />
    {/* keyhole plate */}
    <rect x={x + 16} y={y - 6} width="18" height="34" rx="4" fill={INK.brass} />
    <circle cx={x + 25} cy={y + 6} r="3.5" fill={INK.bronze} />
    <rect x={x + 23.5} y={y + 7} width="3" height="10" fill={INK.bronze} />
    <Shadow x={x} y={y + 172} w={220} />
  </g>
);

/** Generic reward: a brass key on a tassel. Chapters may define their own reward props. */
export const key: PropFn = ({ x, y }) => (
  <g>
    <circle cx={x - 60} cy={y} r="34" fill="none" stroke={INK.brass} strokeWidth="14" />
    <circle cx={x - 60} cy={y} r="12" fill="none" stroke={INK.brassDeep} strokeWidth="3" />
    <rect x={x - 28} y={y - 8} width="120" height="16" rx="3" fill={INK.brass} />
    <rect x={x + 56} y={y + 8} width="12" height="26" fill={INK.brass} />
    <rect x={x + 76} y={y + 8} width="12" height="18" fill={INK.brass} />
    <path d={`M${x - 94} ${y} q -30 40 -6 90`} fill="none" stroke={INK.green} strokeWidth="5" />
    <path d={`M${x - 106} ${y + 84} h24 l-4 40 h-16 z`} fill={INK.green} />
  </g>
);
