import { INK, Shadow, type PropFn } from './common';

/** 08 · The front desk — human in the loop. Two room tones: oxblood ink and slate. */
const OX = '#7a2e3a';
const SLATE = '#3e5560';

/** A lectern with the open register of action levels: read, write, send. */
export const c08_register: PropFn = ({ x, y }) => (
  <g>
    <Shadow x={x} y={y + 122} w={210} />
    {/* pedestal */}
    <path d={`M${x - 70} ${y + 120} h140 l-14 -16 h-112 z`} fill={INK.bronze} />
    <rect x={x - 16} y={y + 6} width="32" height="100" fill={INK.wood} />
    <rect x={x - 24} y={y + 40} width="48" height="8" fill={INK.brassDeep} />
    {/* slanted top */}
    <path d={`M${x - 124} ${y + 14} L${x - 108} ${y - 50} H${x + 108} L${x + 124} ${y + 14} Z`} fill={INK.woodLight} />
    <rect x={x - 126} y={y + 10} width="252" height="10" fill={INK.wood} />
    {/* open ledger */}
    <path d={`M${x - 112} ${y + 6} L${x - 100} ${y - 44} H${x - 4} L${x - 4} ${y + 6} Z`} fill={INK.paper} />
    <path d={`M${x + 4} ${y + 6} L${x + 4} ${y - 44} H${x + 100} L${x + 112} ${y + 6} Z`} fill={INK.paper} />
    <rect x={x - 4} y={y - 44} width="8" height="50" fill={INK.cream} />
    {Array.from({ length: 5 }, (_, i) => (
      <g key={i}>
        <line x1={x - 98 - i * 0.6} y1={y - 34 + i * 8} x2={x - 14} y2={y - 34 + i * 8} stroke="#c7bba5" strokeWidth="1.5" />
        <line x1={x + 14} y1={y - 34 + i * 8} x2={x + 98 + i * 0.6} y2={y - 34 + i * 8} stroke="#c7bba5" strokeWidth="1.5" />
      </g>
    ))}
    {/* three level columns, marked by coloured tabs */}
    <rect x={x + 18} y={y - 40} width="22" height="40" fill={INK.green} opacity="0.18" />
    <rect x={x + 46} y={y - 40} width="22" height="40" fill={INK.light} opacity="0.35" />
    <rect x={x + 74} y={y - 40} width="22" height="40" fill={OX} opacity="0.2" />
    <rect x={x + 18} y={y - 56} width="22" height="12" fill={INK.green} />
    <rect x={x + 46} y={y - 56} width="22" height="12" fill={INK.light} />
    <rect x={x + 74} y={y - 56} width="22" height="12" fill={OX} />
    {/* ribbon and quill */}
    <path d={`M${x} ${y + 6} v26 l-5 -6 l-5 6 v-26 z`} fill={OX} />
    <rect x={x - 96} y={y - 76} width="22" height="16" rx="3" fill={INK.bronze} />
    <path d={`M${x - 84} ${y - 72} L${x - 50} ${y - 128} q 10 4 2 18 Z`} fill={INK.cream} />
    <text x={x - 56} y={y - 18} textAnchor="middle" fontSize="11" fill={INK.bronzeLight} fontFamily="var(--mono)">
      NIVEAUX
    </text>
  </g>
);

/** A wall key rack: each key opens one door only — least privilege. */
export const c08_keys: PropFn = ({ x, y }) => (
  <g>
    {/* crown */}
    <path d={`M${x - 120} ${y - 96} L${x} ${y - 140} L${x + 120} ${y - 96} Z`} fill={INK.wood} />
    <path d={`M${x - 70} ${y - 100} L${x} ${y - 126} L${x + 70} ${y - 100} Z`} fill={INK.brass} />
    <rect x={x - 126} y={y - 100} width="252" height="210" fill={INK.wood} />
    <rect x={x - 112} y={y - 86} width="224" height="182" fill={SLATE} />
    {Array.from({ length: 3 }, (_, r) =>
      Array.from({ length: 4 }, (_, c) => {
        const hx = x - 84 + c * 56;
        const hy = y - 70 + r * 58;
        const empty = (r === 1 && c === 2) || (r === 2 && c === 0);
        return (
          <g key={`${r}-${c}`}>
            <rect x={hx - 3} y={hy - 4} width="6" height="8" fill={INK.brassDeep} />
            {!empty && (
              <g>
                <circle cx={hx} cy={hy + 12} r="7" fill="none" stroke={INK.brass} strokeWidth="3.5" />
                <rect x={hx - 2} y={hy + 18} width="4" height="20" fill={INK.brass} />
                <rect x={hx + 2} y={hy + 30} width="6" height="3" fill={INK.brass} />
                <rect x={hx + 8} y={hy + 10} width="16" height="22" rx="2" fill={r === 0 && c === 1 ? INK.light : INK.paper} />
                <text x={hx + 16} y={hy + 25} textAnchor="middle" fontSize="9" fill={INK.bronze} fontFamily="var(--mono)">
                  {r * 4 + c + 1}
                </text>
              </g>
            )}
          </g>
        );
      }),
    )}
    <rect x={x - 46} y={y + 112} width="92" height="20" fill={INK.bronze} />
    <text x={x} y={y + 126} textAnchor="middle" fontSize="11" fill={INK.light} fontFamily="var(--mono)">
      UNE CLÉ
    </text>
  </g>
);

/** The reception desk with its service bell: the agent rings, a human answers. */
export const c08_desk: PropFn = ({ x, y }) => (
  <g>
    <Shadow x={x} y={y + 92} w={330} />
    {/* desk body */}
    <rect x={x - 150} y={y - 30} width="300" height="120" fill={INK.wood} />
    {[-1, 0, 1].map((k) => (
      <g key={k}>
        <rect x={x - 40 + k * 96} y={y - 16} width="80" height="92" fill={INK.woodLight} />
        <path d={`M${x + k * 96} ${y - 8} L${x + 30 + k * 96} ${y + 30} L${x + k * 96} ${y + 68} L${x - 30 + k * 96} ${y + 30} Z`} fill="none" stroke={INK.brass} strokeWidth="2" />
      </g>
    ))}
    <rect x={x - 162} y={y - 44} width="324" height="16" fill={INK.bronze} />
    <rect x={x - 162} y={y - 30} width="324" height="4" fill={INK.brassDeep} />
    {/* plate */}
    <rect x={x - 46} y={y + 22} width="92" height="18" fill={INK.greenDeep} />
    <text x={x} y={y + 35} textAnchor="middle" fontSize="11" fill={INK.light} fontFamily="var(--mono)">
      RÉCEPTION
    </text>
    {/* service bell */}
    <ellipse cx={x - 70} cy={y - 46} rx="34" ry="5" fill={INK.bronze} />
    <path d={`M${x - 100} ${y - 48} A30 28 0 0 1 ${x - 40} ${y - 48} Z`} fill={INK.brass} />
    <path d={`M${x - 90} ${y - 56} A20 18 0 0 1 ${x - 74} ${y - 70}`} fill="none" stroke={INK.glow} strokeWidth="3" />
    <rect x={x - 72} y={y - 84} width="4" height="10" fill={INK.brassDeep} />
    <rect x={x - 78} y={y - 88} width="16" height="5" rx="2" fill={INK.brass} />
    {/* request card waiting for a yes */}
    <rect x={x + 10} y={y - 64} width="78" height="20" fill={INK.paper} transform={`rotate(-4 ${x + 49} ${y - 54})`} />
    <text x={x + 49} y={y - 50} textAnchor="middle" fontSize="10" fill={INK.bronze} fontFamily="var(--mono)" transform={`rotate(-4 ${x + 49} ${y - 54})`}>
      oui / non ?
    </text>
    {/* pigeonholes behind */}
    <rect x={x + 100} y={y - 98} width="48" height="54" fill={INK.bronze} />
    {[0, 1].map((r) => [0, 1].map((c) => <rect key={`${r}${c}`} x={x + 104 + c * 22} y={y - 94 + r * 25} width="18" height="21" fill={INK.bronzeLight} />))}
    <rect x={x + 108} y={y - 90} width="10" height="14" fill={INK.paper} />
  </g>
);

/** A side table with the approval stamp, its ink pad and a stamped request. */
export const c08_stamp: PropFn = ({ x, y }) => (
  <g>
    <Shadow x={x} y={y + 122} w={220} />
    {/* table */}
    <rect x={x - 112} y={y + 6} width="224" height="14" fill={INK.wood} />
    <rect x={x - 100} y={y + 20} width="200" height="16" fill={INK.woodLight} />
    <rect x={x - 96} y={y + 36} width="12" height="84" fill={INK.wood} />
    <rect x={x + 84} y={y + 36} width="12" height="84" fill={INK.wood} />
    <rect x={x - 84} y={y + 96} width="168" height="6" fill={INK.brassDeep} />
    {/* request sheet with stamp mark */}
    <rect x={x - 96} y={y - 64} width="96" height="70" fill={INK.paper} />
    {[0, 1, 2, 3].map((i) => (
      <rect key={i} x={x - 88} y={y - 56 + i * 9} width={i === 3 ? 40 : 70} height="3" fill="#c7bba5" />
    ))}
    <circle cx={x - 40} cy={y - 14} r="17" fill="none" stroke={OX} strokeWidth="3" />
    <text x={x - 40} y={y - 10} textAnchor="middle" fontSize="11" fill={OX} fontFamily="var(--mono)" fontWeight="700">
      OUI
    </text>
    {/* ink pad */}
    <rect x={x + 20} y={y - 10} width="70" height="16" rx="3" fill={INK.bronze} />
    <rect x={x + 26} y={y - 8} width="58" height="8" rx="2" fill={OX} />
    {/* stamp */}
    <rect x={x + 30} y={y - 34} width="52" height="18" rx="3" fill={INK.brass} />
    <rect x={x + 34} y={y - 18} width="44" height="6" fill={OX} />
    <rect x={x + 49} y={y - 74} width="14" height="42" fill={INK.brassDeep} />
    <ellipse cx={x + 56} cy={y - 84} rx="20" ry="16" fill={INK.wood} />
    <ellipse cx={x + 50} cy={y - 90} rx="7" ry="4" fill={INK.woodLight} />
  </g>
);

/** A switchboard: the line that hands a sensitive case to a person. */
export const c08_switchboard: PropFn = ({ x, y }) => (
  <g>
    <Shadow x={x} y={y + 152} w={210} />
    <rect x={x - 90} y={y - 150} width="180" height="300" fill={INK.bronze} />
    <path d={`M${x - 90} ${y - 150} L${x} ${y - 176} L${x + 90} ${y - 150} Z`} fill={INK.bronzeLight} />
    <rect x={x - 76} y={y - 136} width="152" height="150" fill={SLATE} />
    {Array.from({ length: 4 }, (_, r) =>
      Array.from({ length: 5 }, (_, c) => (
        <g key={`${r}-${c}`}>
          <circle cx={x - 56 + c * 28} cy={y - 112 + r * 34} r="7" fill={INK.bronze} />
          <circle cx={x - 56 + c * 28} cy={y - 112 + r * 34} r="3" fill={r === 1 && c === 3 ? INK.light : INK.brassDeep} />
        </g>
      )),
    )}
    {/* cords */}
    <path d={`M${x - 28} ${y - 78} q 10 90 50 92`} fill="none" stroke={OX} strokeWidth="3" />
    <path d={`M${x + 28} ${y - 44} q -20 50 -46 58`} fill="none" stroke={INK.cream} strokeWidth="3" />
    {/* shelf with plugs */}
    <rect x={x - 90} y={y + 14} width="180" height="20" fill={INK.brassDeep} />
    {[0, 1, 2, 3, 4].map((i) => (
      <rect key={i} x={x - 62 + i * 28} y={y + 4} width="8" height="12" rx="2" fill={i === 1 ? OX : INK.cream} />
    ))}
    {/* handset */}
    <path d={`M${x - 70} ${y + 50} h50 a10 10 0 0 1 0 20 h-50 a10 10 0 0 1 0 -20 z`} fill={INK.greenDeep} />
    <rect x={x - 80} y={y + 48} width="18" height="26" rx="6" fill={INK.green} />
    <rect x={x - 28} y={y + 48} width="18" height="26" rx="6" fill={INK.green} />
    <rect x={x + 6} y={y + 46} width="70" height="30" fill={INK.bronzeLight} />
    <text x={x + 41} y={y + 66} textAnchor="middle" fontSize="10" fill={INK.light} fontFamily="var(--mono)">
      STANDARD
    </text>
    <rect x={x - 76} y={y + 90} width="152" height="48" fill={INK.bronzeLight} />
    <rect x={x - 68} y={y + 98} width="64" height="32" fill="none" stroke={INK.brass} strokeWidth="2" />
    <rect x={x + 4} y={y + 98} width="64" height="32" fill="none" stroke={INK.brass} strokeWidth="2" />
  </g>
);

/** Reward: the approval stamp — one yes, one action. */
export const c08_seal: PropFn = ({ x, y }) => (
  <g>
    {/* imprint */}
    <circle cx={x - 40} cy={y + 8} r="86" fill="none" stroke={OX} strokeWidth="8" />
    <circle cx={x - 40} cy={y + 8} r="70" fill="none" stroke={OX} strokeWidth="2.5" />
    <text x={x - 40} y={y + 4} textAnchor="middle" fontSize="13" fill={OX} fontFamily="var(--mono)" fontWeight="700" letterSpacing="3">
      ACCORD
    </text>
    <rect x={x - 90} y={y + 14} width="100" height="3" fill={OX} />
    <text x={x - 40} y={y + 34} textAnchor="middle" fontSize="11" fill={OX} fontFamily="var(--mono)">
      1 ACTION
    </text>
    <path d={`M${x - 40} ${y - 52} l6 12 h-12 z`} fill={OX} />
    {/* the stamp itself */}
    <rect x={x + 60} y={y + 30} width="84" height="22" rx="4" fill={INK.brass} />
    <rect x={x + 66} y={y + 52} width="72" height="10" fill={OX} />
    <rect x={x + 94} y={y - 40} width="16" height="72" fill={INK.brassDeep} />
    <ellipse cx={x + 102} cy={y - 64} rx="32" ry="26" fill={INK.wood} />
    <ellipse cx={x + 92} cy={y - 74} rx="11" ry="6" fill={INK.woodLight} />
  </g>
);
