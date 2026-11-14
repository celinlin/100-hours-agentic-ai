import { INK, Shadow, type PropFn } from './common';

/** 13 · The boiler room */

const COPPER = '#9a5530';
const SOOT = '#38332d';

/** The boiler: a long riveted tank on a plinth, a round firebox door, a gauge on the pipe. */
export const c13_boiler: PropFn = ({ x, y }) => (
  <g>
    <Shadow x={x} y={y + 102} w={320} />
    <rect x={x - 150} y={y + 70} width="300" height="30" rx="6" fill={SOOT} />
    {/* horizontal tank */}
    <rect x={x - 120} y={y - 50} width="210" height="120" rx="56" fill={COPPER} />
    {[-70, -20, 30].map((dx) => (
      <rect key={dx} x={x + dx} y={y - 48} width="6" height="116" fill={INK.brassDeep} />
    ))}
    {Array.from({ length: 7 }, (_, i) => (
      <circle key={i} cx={x - 90 + i * 28} cy={y - 40} r="2.5" fill={INK.brass} />
    ))}
    {/* round firebox door, low on the left */}
    <circle cx={x - 70} cy={y + 30} r="26" fill={INK.bronze} />
    <circle cx={x - 70} cy={y + 30} r="18" fill={INK.light} />
    <path d={`M${x - 86} ${y + 30} H${x - 54} M${x - 70} ${y + 14} V${y + 46}`} stroke={INK.bronze} strokeWidth="4" />
    <rect x={x - 46} y={y + 26} width="14" height="8" rx="3" fill={INK.brass} />
    {/* chimney */}
    <rect x={x + 40} y={y - 110} width="22" height="62" fill={SOOT} />
    <rect x={x + 34} y={y - 116} width="34" height="10" fill={INK.brassDeep} />
    {/* pipe with a pressure gauge, return loop */}
    <path d={`M${x + 90} ${y - 10} H${x + 132} V${y + 50} H${x + 90}`} fill="none" stroke={INK.brass} strokeWidth="8" />
    <circle cx={x + 132} cy={y - 34} r="20" fill={INK.bronze} />
    <circle cx={x + 132} cy={y - 34} r="15" fill={INK.paper} />
    <path d={`M${x + 142} ${y - 45} A15 15 0 0 1 ${x + 147} ${y - 34}`} fill="none" stroke={COPPER} strokeWidth="4" />
    <line x1={x + 132} y1={y - 34} x2={x + 140} y2={y - 42} stroke={INK.bronze} strokeWidth="2.5" />
    <rect x={x + 129} y={y - 16} width="6" height="8" fill={INK.brass} />
    <rect x={x - 6} y={y + 8} width="80" height="22" rx="3" fill={INK.greenDeep} />
    <text x={x + 34} y={y + 23} textAnchor="middle" fontSize="11" fill={INK.light} fontFamily="var(--mono)">
      req-014
    </text>
  </g>
);

/** A wall board of valves, each tagged like a setting: the key comes from the environment. */
export const c13_valves: PropFn = ({ x, y }) => (
  <g>
    <rect x={x - 120} y={y - 110} width="240" height="210" fill={INK.bronze} />
    <rect x={x - 110} y={y - 100} width="220" height="190" fill={SOOT} />
    {/* main pipe */}
    <rect x={x - 110} y={y - 6} width="220" height="12" fill={INK.brassDeep} />
    {[
      [-70, -60, INK.light],
      [0, -60, INK.brass],
      [70, -60, INK.brass],
    ].map(([dx, dy, c], i) => {
      const cx = x + (dx as number);
      const cy = y + (dy as number);
      return (
        <g key={i}>
          <rect x={cx - 4} y={cy} width="8" height="54" fill={INK.brassDeep} />
          <circle cx={cx} cy={cy} r="20" fill="none" stroke={c as string} strokeWidth="6" />
          <line x1={cx - 20} y1={cy} x2={cx + 20} y2={cy} stroke={c as string} strokeWidth="4" />
          <line x1={cx} y1={cy - 20} x2={cx} y2={cy + 20} stroke={c as string} strokeWidth="4" />
          <circle cx={cx} cy={cy} r="5" fill={INK.bronze} />
        </g>
      );
    })}
    {/* tags */}
    {[
      ['ENV', -70],
      ['0', 0],
      ['>=', 70],
    ].map(([t, dx], i) => (
      <g key={i}>
        <rect x={x + (dx as number) - 26} y={y + 24} width="52" height="20" rx="3" fill={INK.paper} />
        <circle cx={x + (dx as number) - 18} cy={y + 34} r="2.5" fill={INK.bronze} />
        <text x={x + (dx as number) + 4} y={y + 38} textAnchor="middle" fontSize="11" fill={INK.bronze} fontFamily="var(--mono)">
          {t}
        </text>
      </g>
    ))}
    <rect x={x - 60} y={y + 58} width="120" height="22" rx="3" fill={INK.greenDeep} />
    <text x={x} y={y + 73} textAnchor="middle" fontSize="11" fill={INK.light} fontFamily="var(--mono)">
      sleep 1·2·4
    </text>
  </g>
);

/** A standing rate meter: a dial with a red zone and a ticket of the last error code. */
export const c13_meter: PropFn = ({ x, y }) => (
  <g>
    <Shadow x={x} y={y + 122} w={160} />
    <path d={`M${x - 56} ${y + 120} h112 l-12 -14 h-88 z`} fill={INK.bronze} />
    <rect x={x - 12} y={y + 10} width="24" height="100" fill={INK.bronze} />
    <rect x={x - 100} y={y - 120} width="200" height="140" rx="12" fill={INK.bronze} />
    <rect x={x - 90} y={y - 110} width="180" height="120" rx="8" fill={INK.paper} />
    {/* dial arc with zones */}
    <path d={`M${x - 70} ${y - 10} A70 70 0 0 1 ${x + 35} ${y - 71}`} fill="none" stroke={INK.green} strokeWidth="12" />
    <path d={`M${x + 35} ${y - 71} A70 70 0 0 1 ${x + 70} ${y - 10}`} fill="none" stroke={COPPER} strokeWidth="12" />
    {Array.from({ length: 9 }, (_, i) => {
      const a = Math.PI + (i * Math.PI) / 8;
      return <line key={i} x1={x + Math.cos(a) * 52} y1={y - 10 + Math.sin(a) * 52} x2={x + Math.cos(a) * 60} y2={y - 10 + Math.sin(a) * 60} stroke={INK.bronze} strokeWidth="2" />;
    })}
    <line x1={x} y1={y - 10} x2={x + 44} y2={y - 52} stroke={INK.bronze} strokeWidth="4" strokeLinecap="round" />
    <circle cx={x} cy={y - 10} r="8" fill={INK.brass} />
    {/* printed ticket */}
    <rect x={x + 60} y={y - 4} width="54" height="62" fill={INK.cream} />
    <text x={x + 87} y={y + 18} textAnchor="middle" fontSize="13" fill={COPPER} fontFamily="var(--mono)">
      429
    </text>
    <rect x={x + 68} y={y + 28} width="38" height="4" rx="2" fill={INK.bronzeLight} opacity="0.5" />
    <rect x={x + 68} y={y + 38} width="26" height="4" rx="2" fill={INK.bronzeLight} opacity="0.5" />
  </g>
);

/** A wall clock for the night shift, with a schedule card tucked under it. */
export const c13_clock: PropFn = ({ x, y }) => (
  <g>
    {/* octagonal deco case */}
    <path
      d={`M${x - 40} ${y - 130} H${x + 40} L${x + 90} ${y - 80} V${y - 0} L${x + 40} ${y + 50} H${x - 40} L${x - 90} ${y} V${y - 80} Z`}
      fill={INK.bronze}
    />
    <circle cx={x} cy={y - 40} r="70" fill={INK.brass} />
    <circle cx={x} cy={y - 40} r="62" fill={INK.greenDeep} />
    {/* night half */}
    <path d={`M${x} ${y - 102} A62 62 0 0 1 ${x} ${y + 22} Z`} fill={SOOT} />
    {Array.from({ length: 12 }, (_, i) => {
      const a = (i * Math.PI) / 6;
      return <rect key={i} x={x + Math.sin(a) * 52 - 2} y={y - 40 - Math.cos(a) * 52 - 5} width="4" height="10" fill={INK.cream} transform={`rotate(${i * 30} ${x + Math.sin(a) * 52} ${y - 40 - Math.cos(a) * 52})`} />;
    })}
    <line x1={x} y1={y - 40} x2={x - 26} y2={y - 58} stroke={INK.light} strokeWidth="5" strokeLinecap="round" />
    <line x1={x} y1={y - 40} x2={x} y2={y - 92} stroke={INK.cream} strokeWidth="3" strokeLinecap="round" />
    <circle cx={x} cy={y - 40} r="6" fill={INK.light} />
    {/* crescent */}
    <circle cx={x + 30} cy={y - 66} r="10" fill={INK.light} />
    <circle cx={x + 35} cy={y - 70} r="9" fill={SOOT} />
    {/* schedule card: generate / automate / RPA */}
    <rect x={x - 70} y={y + 60} width="140" height="60" fill={INK.paper} />
    {['GEN', 'AUTO', 'RPA'].map((t, i) => (
      <g key={t}>
        <rect x={x - 62 + i * 44} y={y + 70} width="38" height="16" rx="2" fill={i === 0 ? INK.light : i === 1 ? INK.brass : COPPER} />
        <text x={x - 43 + i * 44} y={y + 82} textAnchor="middle" fontSize="10" fill={INK.bronze} fontFamily="var(--mono)">
          {t}
        </text>
        <rect x={x - 62 + i * 44} y={y + 94} width="38" height="4" rx="2" fill={INK.bronzeLight} opacity="0.5" />
        <rect x={x - 62 + i * 44} y={y + 104} width="26" height="4" rx="2" fill={INK.bronzeLight} opacity="0.5" />
      </g>
    ))}
  </g>
);

/** A roadmap board on an easel: three pinned cards, a date and a stop line. */
export const c13_plan: PropFn = ({ x, y }) => (
  <g>
    <Shadow x={x} y={y + 122} w={220} />
    <path d={`M${x - 70} ${y + 120} L${x - 40} ${y - 100}`} stroke={INK.wood} strokeWidth="10" />
    <path d={`M${x + 70} ${y + 120} L${x + 40} ${y - 100}`} stroke={INK.wood} strokeWidth="10" />
    <rect x={x - 110} y={y - 120} width="220" height="160" fill={INK.woodLight} />
    <rect x={x - 100} y={y - 110} width="200" height="140" fill={INK.cream} />
    {/* timeline */}
    <line x1={x - 86} y1={y - 76} x2={x + 86} y2={y - 76} stroke={INK.bronze} strokeWidth="3" />
    {[0, 1, 2].map((i) => (
      <g key={i}>
        <circle cx={x - 70 + i * 70} cy={y - 76} r="6" fill={i === 0 ? INK.green : INK.brassDeep} />
        <rect x={x - 92 + i * 70} y={y - 60} width="44" height="52" fill={i === 0 ? INK.light : INK.paper} />
        <circle cx={x - 70 + i * 70} cy={y - 60} r="4" fill={COPPER} />
        <rect x={x - 86 + i * 70} y={y - 46} width="32" height="4" rx="2" fill={INK.bronzeLight} opacity="0.6" />
        <rect x={x - 86 + i * 70} y={y - 36} width="22" height="4" rx="2" fill={INK.bronzeLight} opacity="0.6" />
      </g>
    ))}
    <text x={x - 70} y={y - 84} textAnchor="middle" fontSize="10" fill={INK.bronze} fontFamily="var(--mono)">
      lundi
    </text>
    {/* stop criterion line */}
    <rect x={x - 90} y={y + 2} width="180" height="20" rx="3" fill={COPPER} />
    <text x={x} y={y + 16} textAnchor="middle" fontSize="11" fill={INK.paper} fontFamily="var(--mono)">
      arrêt : 2/40
    </text>
    <rect x={x - 116} y={y + 40} width="232" height="10" fill={INK.wood} />
  </g>
);

/** Reward: the boiler-room handwheel, a brass valve wheel with a service tag. */
export const c13_wheel: PropFn = ({ x, y }) => (
  <g>
    <circle cx={x} cy={y} r="92" fill="none" stroke={INK.brass} strokeWidth="16" />
    <circle cx={x} cy={y} r="92" fill="none" stroke={INK.brassDeep} strokeWidth="2" />
    {Array.from({ length: 6 }, (_, i) => (
      <rect key={i} x={x - 4} y={y - 88} width="8" height="88" fill={INK.brass} transform={`rotate(${i * 60} ${x} ${y})`} />
    ))}
    {Array.from({ length: 6 }, (_, i) => {
      const a = (i * Math.PI) / 3 + Math.PI / 6;
      return <circle key={i} cx={x + Math.cos(a) * 92} cy={y + Math.sin(a) * 92} r="9" fill={INK.brassDeep} />;
    })}
    <circle cx={x} cy={y} r="26" fill={INK.bronze} />
    <circle cx={x} cy={y} r="12" fill={INK.light} />
    {/* tag */}
    <path d={`M${x + 62} ${y + 62} L${x + 82} ${y + 80}`} stroke={INK.bronze} strokeWidth="2" />
    <rect x={x + 70} y={y + 80} width="58" height="24" rx="4" fill={COPPER} />
    <text x={x + 99} y={y + 96} textAnchor="middle" fontSize="11" fill={INK.paper} fontFamily="var(--mono)">
      35/35
    </text>
  </g>
);
