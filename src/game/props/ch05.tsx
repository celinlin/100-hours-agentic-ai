import { INK, Shadow, type PropFn } from './common';

/** 05 · The concierge desk */

/** Room tones: plum leather and oxblood luggage. */
const PLUM = '#5e3a55';
const OXBLOOD = '#7c2f2a';

/** The concierge counter: a curved deco desk with three panels (host, client, server) and a bell. */
export const c05_desk: PropFn = ({ x, y }) => (
  <g>
    <Shadow x={x} y={y + 124} w={320} />
    {/* counter top */}
    <rect x={x - 156} y={y - 20} width="312" height="18" rx="4" fill={INK.brass} />
    {/* body */}
    <path d={`M${x - 146} ${y - 2} H${x + 146} V${y + 112} Q${x} ${y + 128} ${x - 146} ${y + 112} Z`} fill={PLUM} />
    <rect x={x - 146} y={y - 2} width="292" height="8" fill={INK.brassDeep} />
    {['host', 'client', 'serveur'].map((lab, i) => {
      const px = x - 132 + i * 92;
      return (
        <g key={lab}>
          <rect x={px} y={y + 18} width="80" height="84" fill={INK.woodLight} />
          <path d={`M${px + 8} ${y + 96} A32 32 0 0 1 ${px + 72} ${y + 96}`} fill="none" stroke={INK.brass} strokeWidth="2" />
          {Array.from({ length: 5 }, (_, k) => (
            <line key={k} x1={px + 40} y1={y + 96} x2={px + 14 + k * 13} y2={y + 70} stroke={INK.brassDeep} strokeWidth="1.5" />
          ))}
          <rect x={px + 8} y={y + 26} width="64" height="18" rx="2" fill={INK.bronze} />
          <text x={px + 40} y={y + 39} textAnchor="middle" fontSize="11" fontFamily="var(--mono)" fill={INK.brass}>
            {lab}
          </text>
        </g>
      );
    })}
    {/* bell on the counter */}
    <ellipse cx={x + 92} cy={y - 22} rx="24" ry="5" fill={INK.bronze} />
    <path d={`M${x + 72} ${y - 24} A20 20 0 0 1 ${x + 112} ${y - 24} Z`} fill={INK.brass} />
    <rect x={x + 90} y={y - 52} width="4" height="10" fill={INK.brassDeep} />
    <circle cx={x + 92} cy={y - 54} r="4" fill={INK.brassDeep} />
    {/* register card */}
    <rect x={x - 110} y={y - 34} width="70" height="14" fill={INK.paper} />
    <rect x={x - 104} y={y - 30} width="40" height="4" fill="#d8cfbd" />
  </g>
);

/** The key board: pigeonholes in three columns (tools, resources, prompts), keys on tags. */
export const c05_keyboard: PropFn = ({ x, y }) => (
  <g>
    <path d={`M${x - 120} ${y - 100} A120 40 0 0 1 ${x + 120} ${y - 100} Z`} fill={INK.woodLight} />
    <rect x={x - 120} y={y - 100} width="240" height="212" fill={INK.wood} />
    <rect x={x - 120} y={y + 104} width="240" height="10" fill={INK.brassDeep} />
    {['tools', 'resources', 'prompts'].map((lab, c) => {
      const cx = x - 76 + c * 76;
      return (
        <g key={lab}>
          <rect x={cx - 34} y={y - 92} width="68" height="18" fill={INK.bronze} />
          <text x={cx} y={y - 79} textAnchor="middle" fontSize="10" fontFamily="var(--mono)" fill={INK.brass}>
            {lab}
          </text>
          {Array.from({ length: 3 }, (_, r) => {
            const cy = y - 64 + r * 54;
            const full = !(c === 2 && r === 2) && !(c === 1 && r === 1);
            return (
              <g key={r}>
                <rect x={cx - 32} y={cy} width="64" height="48" fill="#4b3220" />
                {full && (
                  <g>
                    <circle cx={cx - 8} cy={cy + 8} r="3" fill={INK.brass} />
                    <line x1={cx - 8} y1={cy + 8} x2={cx - 8} y2={cy + 16} stroke={INK.brass} strokeWidth="1.5" />
                    <rect x={cx - 14} y={cy + 16} width="12" height="22" rx="2" fill={c === 0 ? INK.light : c === 1 ? INK.paper : PLUM} />
                    <circle cx={cx + 10} cy={cy + 20} r="6" fill="none" stroke={INK.brass} strokeWidth="3" />
                    <rect x={cx + 8.5} y={cy + 25} width="3" height="16" fill={INK.brass} />
                  </g>
                )}
              </g>
            );
          })}
        </g>
      );
    })}
  </g>
);

/** The arrivals register: a lectern with an open ledger, one line highlighted. */
export const c05_ledger: PropFn = ({ x, y }) => (
  <g>
    <Shadow x={x} y={y + 122} w={170} />
    <path d={`M${x - 60} ${y + 122} h120 l-14 -14 h-92 z`} fill={INK.bronze} />
    <rect x={x - 12} y={y + 4} width="24" height="106" fill={INK.wood} />
    <rect x={x - 4} y={y + 4} width="8" height="106" fill={INK.woodLight} />
    {/* slanted top */}
    <path d={`M${x - 110} ${y + 10} L${x - 96} ${y - 50} H${x + 96} L${x + 110} ${y + 10} Z`} fill={INK.wood} />
    <rect x={x - 112} y={y + 8} width="224" height="8" fill={INK.brassDeep} />
    {/* open book */}
    <path d={`M${x - 90} ${y + 4} L${x - 80} ${y - 44} H${x - 2} V${y + 4} Z`} fill={INK.paper} />
    <path d={`M${x + 90} ${y + 4} L${x + 80} ${y - 44} H${x + 2} V${y + 4} Z`} fill={INK.cream} />
    <rect x={x - 2} y={y - 44} width="4" height="48" fill={OXBLOOD} />
    {[0, 1, 2, 3].map((i) => (
      <rect key={i} x={x - 76 + i * 1.5} y={y - 36 + i * 10} width="62" height="3" fill="#d8cfbd" />
    ))}
    <rect x={x + 10} y={y - 32} width="70" height="13" fill={INK.light} />
    <text x={x + 45} y={y - 22} textAnchor="middle" fontSize="10" fontFamily="var(--mono)" fill={INK.bronze}>
      tools/list
    </text>
    {[0, 1].map((i) => (
      <rect key={i} x={x + 12} y={y - 12 + i * 10} width="60" height="3" fill="#d8cfbd" />
    ))}
  </g>
);

/** The luggage cart: a brass bellhop trolley; some bags stay (local), one leaves (HTTP). */
export const c05_cart: PropFn = ({ x, y }) => (
  <g>
    <Shadow x={x} y={y + 124} w={260} />
    {/* frame */}
    <rect x={x - 110} y={y + 92} width="220" height="12" fill={INK.brass} />
    <rect x={x - 104} y={y - 100} width="8" height="196" fill={INK.brass} />
    <rect x={x + 96} y={y - 100} width="8" height="196" fill={INK.brass} />
    <path d={`M${x - 100} ${y - 96} Q${x} ${y - 168} ${x + 100} ${y - 96}`} fill="none" stroke={INK.brass} strokeWidth="8" />
    <rect x={x - 100} y={y - 100} width="200" height="6" fill={INK.brassDeep} />
    <circle cx={x - 84} cy={y + 112} r="11" fill={INK.bronze} />
    <circle cx={x + 84} cy={y + 112} r="11" fill={INK.bronze} />
    <circle cx={x - 84} cy={y + 112} r="4" fill={INK.brass} />
    <circle cx={x + 84} cy={y + 112} r="4" fill={INK.brass} />
    {/* bags */}
    <rect x={x - 88} y={y + 30} width="110" height="62" rx="6" fill={INK.green} />
    <rect x={x - 54} y={y + 22} width="40" height="10" rx="4" fill="none" stroke={INK.bronze} strokeWidth="4" />
    <rect x={x - 88} y={y + 56} width="110" height="6" fill={INK.greenDeep} />
    <rect x={x + 28} y={y + 10} width="62" height="82" rx="6" fill={PLUM} />
    <rect x={x + 50} y={y + 2} width="18" height="10" rx="3" fill="none" stroke={INK.bronze} strokeWidth="3" />
    <rect x={x - 70} y={y - 30} width="80" height="58" rx="6" fill={OXBLOOD} />
    <rect x={x - 42} y={y - 38} width="24" height="10" rx="3" fill="none" stroke={INK.bronze} strokeWidth="3" />
    {/* tags */}
    <path d={`M${x - 70} ${y + 44} l-16 -6`} stroke={INK.brass} strokeWidth="1.5" />
    <rect x={x - 70} y={y + 40} width="44" height="16" rx="2" fill={INK.paper} />
    <text x={x - 48} y={y + 52} textAnchor="middle" fontSize="10" fontFamily="var(--mono)" fill={INK.bronze}>
      local
    </text>
    <rect x={x - 6} y={y - 22} width="40" height="16" rx="2" fill={INK.light} />
    <text x={x + 14} y={y - 10} textAnchor="middle" fontSize="10" fontFamily="var(--mono)" fill={INK.bronze}>
      HTTP
    </text>
  </g>
);

/** The notice board: a framed slate on the wall showing the server's decorator. */
export const c05_notice: PropFn = ({ x, y }) => (
  <g>
    <rect x={x - 6} y={y - 136} width="12" height="18" fill={INK.brassDeep} />
    <path d={`M${x - 40} ${y - 104} L${x} ${y - 126} L${x + 40} ${y - 104}`} fill="none" stroke={INK.brass} strokeWidth="2" />
    <rect x={x - 104} y={y - 106} width="208" height="196" fill={INK.brass} />
    <rect x={x - 94} y={y - 96} width="188" height="176" fill={INK.greenDeep} />
    <text x={x - 80} y={y - 70} fontSize="12" fontFamily="var(--mono)" fill={INK.light}>
      @mcp.tool()
    </text>
    <text x={x - 80} y={y - 48} fontSize="11" fontFamily="var(--mono)" fill={INK.cream}>
      def calendrier
    </text>
    {[0, 1, 2].map((i) => (
      <rect key={i} x={x - 70} y={y - 34 + i * 16} width={110 - i * 24} height="5" fill={INK.bronzeLight} />
    ))}
    <rect x={x - 80} y={y + 22} width="160" height="1.5" fill={INK.brassDeep} />
    <text x={x - 80} y={y + 46} fontSize="11" fontFamily="var(--mono)" fill={INK.brass}>
      stdio
    </text>
    <circle cx={x + 64} cy={y + 50} r="12" fill={INK.brass} />
    <circle cx={x + 64} cy={y + 50} r="5" fill={INK.greenDeep} />
    <rect x={x - 70} y={y + 90} width="140" height="10" fill={INK.brassDeep} />
  </g>
);

/** Reward: the concierge's service bell, engraved MCP. Fits a 320×240 view centred on (0,0). */
export const c05_bell: PropFn = ({ x, y }) => (
  <g>
    <rect x={x - 120} y={y + 50} width="240" height="26" rx="6" fill={INK.wood} />
    <rect x={x - 120} y={y + 70} width="240" height="8" rx="3" fill={INK.bronze} />
    <ellipse cx={x} cy={y + 50} rx="96" ry="12" fill={INK.brassDeep} />
    <path d={`M${x - 90} ${y + 46} A90 84 0 0 1 ${x + 90} ${y + 46} Z`} fill={INK.brass} />
    <path d={`M${x - 64} ${y + 6} A70 60 0 0 1 ${x - 20} ${y - 26}`} fill="none" stroke={INK.glow} strokeWidth="6" strokeLinecap="round" />
    <rect x={x - 6} y={y - 64} width="12" height="26" fill={INK.brassDeep} />
    <ellipse cx={x} cy={y - 68} rx="18" ry="7" fill={INK.brassDeep} />
    <text x={x} y={y + 30} textAnchor="middle" fontSize="13" fontFamily="var(--mono)" fill={INK.bronze}>
      MCP
    </text>
  </g>
);
