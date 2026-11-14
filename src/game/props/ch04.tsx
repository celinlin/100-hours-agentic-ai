import { INK, Shadow, type PropFn } from './common';

/** 04 · The switchboard */

/** Room tones: a lit error lamp, and the slate of the board. */
const RED = '#a8443a';
const SLATE = '#2c3f45';

/** The operator's desk: a candlestick telephone and a request slip. */
export const c04_desk: PropFn = ({ x, y }) => (
  <g>
    <Shadow x={x} y={y + 122} w={250} />
    {/* desk */}
    <rect x={x - 130} y={y + 18} width="260" height="16" fill={INK.woodLight} />
    <rect x={x - 120} y={y + 34} width="240" height="60" fill={INK.wood} />
    <rect x={x - 108} y={y + 44} width="100" height="40" fill="none" stroke={INK.brassDeep} strokeWidth="2" />
    <rect x={x + 8} y={y + 44} width="100" height="40" fill="none" stroke={INK.brassDeep} strokeWidth="2" />
    <rect x={x - 66} y={y + 61} width="16" height="6" rx="2" fill={INK.brass} />
    <rect x={x + 50} y={y + 61} width="16" height="6" rx="2" fill={INK.brass} />
    <rect x={x - 120} y={y + 94} width="14" height="26" fill={INK.wood} />
    <rect x={x + 106} y={y + 94} width="14" height="26" fill={INK.wood} />
    {/* candlestick telephone */}
    <ellipse cx={x - 60} cy={y + 14} rx="30" ry="7" fill={INK.bronze} />
    <rect x={x - 66} y={y - 70} width="12" height="84" fill={INK.bronze} />
    <circle cx={x - 60} cy={y - 80} r="17" fill={INK.bronze} />
    <circle cx={x - 60} cy={y - 80} r="9" fill={INK.brass} />
    <rect x={x - 54} y={y - 46} width="26" height="6" fill={INK.brass} />
    <rect x={x - 32} y={y - 62} width="14" height="44" rx="6" fill={INK.bronze} />
    <path d={`M${x - 60} ${y + 18} q 30 22 70 0`} fill="none" stroke={INK.bronze} strokeWidth="3" />
    {/* request slip */}
    <rect x={x + 6} y={y - 52} width="110" height="66" fill={INK.paper} transform={`rotate(-4 ${x + 60} ${y - 20})`} />
    <g transform={`rotate(-4 ${x + 60} ${y - 20})`}>
      <text x={x + 16} y={y - 32} fontSize="12" fontFamily="var(--mono)" fill={INK.bronze}>
        GET events
      </text>
      <rect x={x + 16} y={y - 24} width="84" height="5" fill="#d8cfbd" />
      <rect x={x + 16} y={y - 14} width="60" height="5" fill="#d8cfbd" />
      <rect x={x + 16} y={y - 2} width="46" height="10" rx="2" fill={INK.green} />
    </g>
  </g>
);

/** The lamp board: rows of status lamps (2xx, 4xx, 5xx) above a row of jacks with cords. */
export const c04_switchboard: PropFn = ({ x, y }) => (
  <g>
    <rect x={x - 124} y={y - 134} width="248" height="250" fill={INK.wood} />
    <path d={`M${x - 124} ${y - 134} L${x} ${y - 160} L${x + 124} ${y - 134} Z`} fill={INK.woodLight} />
    <circle cx={x} cy={y - 144} r="6" fill={INK.brass} />
    <rect x={x - 108} y={y - 120} width="216" height="160" fill={SLATE} />
    {['2xx', '4xx', '5xx'].map((lab, r) => (
      <g key={lab}>
        <text x={x - 96} y={y - 84 + r * 44} fontSize="11" fontFamily="var(--mono)" fill={INK.brass}>
          {lab}
        </text>
        {Array.from({ length: 4 }, (_, c) => {
          const lit = (r === 0 && c === 0) || (r === 1 && c === 1) || (r === 1 && c === 3);
          const fill = !lit ? INK.bronzeLight : r === 0 ? INK.light : RED;
          return (
            <g key={c}>
              <circle cx={x - 40 + c * 40} cy={y - 88 + r * 44} r="12" fill={INK.brassDeep} />
              <circle cx={x - 40 + c * 40} cy={y - 88 + r * 44} r="8" fill={fill} />
            </g>
          );
        })}
      </g>
    ))}
    {/* shelf with jacks */}
    <rect x={x - 124} y={y + 40} width="248" height="16" fill={INK.woodLight} />
    <rect x={x - 108} y={y + 60} width="216" height="40" fill={INK.bronze} />
    {Array.from({ length: 6 }, (_, i) => (
      <g key={i}>
        <circle cx={x - 80 + i * 32} cy={y + 80} r="8" fill={INK.brass} />
        <circle cx={x - 80 + i * 32} cy={y + 80} r="3.5" fill={INK.bronze} />
      </g>
    ))}
    {/* two patch cords */}
    <path d={`M${x - 48} ${y + 80} C ${x - 40} ${y + 140}, ${x + 30} ${y + 140}, ${x + 48} ${y + 80}`} fill="none" stroke={RED} strokeWidth="4" />
    <path d={`M${x - 80} ${y + 80} C ${x - 70} ${y + 128}, ${x + 70} ${y + 150}, ${x + 80} ${y + 80}`} fill="none" stroke={INK.green} strokeWidth="4" />
    <rect x={x - 12} y={y + 104} width="24" height="10" fill={INK.brassDeep} />
  </g>
);

/** The key rack: hooks with keys and two tags (scopes). */
export const c04_keyrack: PropFn = ({ x, y }) => (
  <g>
    <rect x={x - 104} y={y - 100} width="208" height="190" fill={INK.brassDeep} />
    <rect x={x - 96} y={y - 92} width="192" height="174" fill={INK.wood} />
    <rect x={x - 96} y={y - 92} width="192" height="26" fill={INK.bronze} />
    <text x={x} y={y - 74} textAnchor="middle" fontSize="12" fontFamily="var(--mono)" fill={INK.brass}>
      SCOPES
    </text>
    {[0, 1].map((r) =>
      Array.from({ length: 4 }, (_, c) => {
        const hx = x - 66 + c * 44;
        const hy = y - 48 + r * 72;
        const empty = (r === 0 && c === 2) || (r === 1 && c === 0);
        return (
          <g key={`${r}-${c}`}>
            <circle cx={hx} cy={hy} r="4" fill={INK.brass} />
            {!empty && (
              <g>
                <circle cx={hx} cy={hy + 14} r="9" fill="none" stroke={INK.brass} strokeWidth="4" />
                <rect x={hx - 2.5} y={hy + 22} width="5" height="26" fill={INK.brass} />
                <rect x={hx + 2} y={hy + 38} width="7" height="4" fill={INK.brass} />
                <rect x={hx + 2} y={hy + 44} width="5" height="4" fill={INK.brass} />
              </g>
            )}
          </g>
        );
      }),
    )}
    {/* tags */}
    <rect x={x + 30} y={y - 30} width="62" height="18" rx="3" fill={INK.paper} />
    <text x={x + 61} y={y - 17} textAnchor="middle" fontSize="10" fontFamily="var(--mono)" fill={INK.bronze}>
      readonly
    </text>
    <rect x={x - 92} y={y + 44} width="44" height="18" rx="3" fill={INK.light} />
    <text x={x - 70} y={y + 57} textAnchor="middle" fontSize="10" fontFamily="var(--mono)" fill={INK.bronze}>
      .env
    </text>
  </g>
);

/** The mail chute: a glazed brass column with falling envelopes, into a deco mailbox. */
export const c04_chute: PropFn = ({ x, y }) => (
  <g>
    <Shadow x={x} y={y + 122} w={170} />
    {/* column */}
    <rect x={x - 22} y={y - 200} width="44" height="214" fill={INK.brass} />
    <rect x={x - 14} y={y - 192} width="28" height="200" fill={INK.greenDeep} />
    {[
      [-6, -170, -12],
      [2, -112, 10],
      [-4, -52, -6],
    ].map(([dx, dy, rot], i) => (
      <g key={i} transform={`rotate(${rot} ${x + dx} ${y + dy})`}>
        <rect x={x + dx - 10} y={y + dy - 7} width="20" height="14" fill={INK.paper} />
        <path d={`M${x + dx - 10} ${y + dy - 7} L${x + dx} ${y + dy + 1} L${x + dx + 10} ${y + dy - 7}`} fill="none" stroke="#c7bba5" strokeWidth="1.5" />
      </g>
    ))}
    {/* box */}
    <rect x={x - 74} y={y + 10} width="148" height="112" fill={INK.brass} />
    <rect x={x - 62} y={y + 22} width="124" height="88" fill={INK.bronze} />
    {Array.from({ length: 7 }, (_, i) => (
      <line key={i} x1={x} y1={y + 106} x2={x - 54 + i * 18} y2={y + 64} stroke={INK.brassDeep} strokeWidth="2" />
    ))}
    <path d={`M${x - 54} ${y + 64} A54 40 0 0 1 ${x + 54} ${y + 64}`} fill="none" stroke={INK.brass} strokeWidth="2" />
    <rect x={x - 40} y={y + 30} width="80" height="8" rx="3" fill={INK.greenDeep} />
    <text x={x} y={y + 58} textAnchor="middle" fontSize="12" fontFamily="var(--mono)" fill={INK.light}>
      POST
    </text>
    {/* envelope sticking out */}
    <rect x={x - 22} y={y + 20} width="44" height="16" fill={INK.paper} />
    <path d={`M${x - 22} ${y + 20} L${x} ${y + 30} L${x + 22} ${y + 20}`} fill="none" stroke="#c7bba5" strokeWidth="1.5" />
  </g>
);

/** The teleprinter: a ticker machine on a cabinet, its paper tape printing status codes. */
export const c04_teleprinter: PropFn = ({ x, y }) => (
  <g>
    <Shadow x={x} y={y + 124} w={260} />
    {/* cabinet */}
    <rect x={x - 110} y={y + 20} width="220" height="100" fill={INK.wood} />
    <rect x={x - 116} y={y + 12} width="232" height="12" fill={INK.woodLight} />
    <rect x={x - 96} y={y + 36} width="88" height="70" fill="none" stroke={INK.brassDeep} strokeWidth="2" />
    <rect x={x + 8} y={y + 36} width="88" height="70" fill="none" stroke={INK.brassDeep} strokeWidth="2" />
    <circle cx={x - 18} cy={y + 71} r="4" fill={INK.brass} />
    <circle cx={x + 18} cy={y + 71} r="4" fill={INK.brass} />
    {/* machine */}
    <path d={`M${x - 90} ${y + 12} L${x - 70} ${y - 50} H${x + 70} L${x + 90} ${y + 12} Z`} fill={INK.greenDeep} />
    <path d={`M${x - 60} ${y - 50} A60 34 0 0 1 ${x + 60} ${y - 50} Z`} fill={INK.bronze} />
    <circle cx={x} cy={y - 62} r="10" fill={INK.brass} />
    {Array.from({ length: 2 }, (_, r) =>
      Array.from({ length: 8 - r }, (_, c) => <rect key={`${r}-${c}`} x={x - 56 + r * 7 + c * 14} y={y - 30 + r * 14} width="10" height="8" rx="2" fill={INK.cream} />),
    )}
    {/* paper tape */}
    <path d={`M${x + 70} ${y - 40} q 50 -10 60 30 q 8 40 -20 60`} fill="none" stroke={INK.paper} strokeWidth="18" />
    <text x={x + 108} y={y - 34} fontSize="10" fontFamily="var(--mono)" fill={INK.bronze} transform={`rotate(20 ${x + 108} ${y - 34})`}>
      200
    </text>
    <text x={x + 124} y={y + 4} fontSize="10" fontFamily="var(--mono)" fill={RED} transform={`rotate(80 ${x + 124} ${y + 4})`}>
      429
    </text>
  </g>
);

/** Reward: a brass telephone token, grooved, stamped 200 OK. Fits a 320×240 view centred on (0,0). */
export const c04_token: PropFn = ({ x, y }) => (
  <g>
    <path d={`M${x - 14} ${y - 92} q 14 -24 28 0`} fill="none" stroke={INK.green} strokeWidth="6" />
    <circle cx={x} cy={y - 104} r="5" fill={INK.green} />
    <circle cx={x} cy={y} r="92" fill={INK.brassDeep} />
    <circle cx={x} cy={y} r="86" fill={INK.brass} />
    <circle cx={x} cy={y} r="70" fill="none" stroke={INK.brassDeep} strokeWidth="3" />
    <rect x={x - 62} y={y - 30} width="124" height="7" rx="3" fill={INK.brassDeep} />
    <rect x={x - 62} y={y + 24} width="124" height="7" rx="3" fill={INK.brassDeep} />
    <text x={x} y={y + 12} textAnchor="middle" fontSize="34" fontFamily="var(--mono)" fill={INK.bronze}>
      200
    </text>
    <text x={x} y={y + 54} textAnchor="middle" fontSize="13" fontFamily="var(--mono)" fill={INK.bronze}>
      OK
    </text>
    <text x={x} y={y - 42} textAnchor="middle" fontSize="11" fontFamily="var(--mono)" fill={INK.bronze}>
      JETON
    </text>
  </g>
);
