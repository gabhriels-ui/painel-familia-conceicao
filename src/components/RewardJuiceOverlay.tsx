import type { CSSProperties } from 'react';

export interface RewardBurstItem {
  id: string;
  label: string;
  tone: 'gold' | 'emerald';
  coins: {
    key: string;
    leftPct: number;
    topPct: number;
    dxMid: number;
    dxEnd: number;
    delayMs: number;
  }[];
}

export function RewardJuiceOverlay({ bursts }: { bursts: RewardBurstItem[] }) {
  if (!bursts.length) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-50 overflow-hidden"
    >
      {bursts.map((burst) => (
        <div key={burst.id} className="absolute inset-0">
          {burst.coins.map((c) => {
            const style = {
              left: `${c.leftPct}%`,
              top: `${c.topPct}%`,
              animationDelay: `${c.delayMs}ms`,
              '--dx-mid': `${c.dxMid}px`,
              '--dx-end': `${c.dxEnd}px`,
            } as CSSProperties;

            return (
              <div
                key={c.key}
                style={style}
                className="coin-particle absolute w-5 h-5 rounded-full border border-[#ead38c] bg-gradient-to-br from-[#dfc168] via-[#c59b27] to-[#6b4d0e] shadow-[0_0_10px_rgba(197,155,39,0.65)] flex items-center justify-center text-[10px] font-black text-[#141517]"
              >
                ✠
              </div>
            );
          })}

          <div
            className={`reward-float-text absolute left-1/2 top-[38%] font-epic text-lg sm:text-2xl whitespace-nowrap px-3.5 py-1.5 rounded bg-[#141517]/90 border shadow-2xl ${
              burst.tone === 'emerald'
                ? 'text-emerald-300 border-emerald-500/60'
                : 'text-[#dfc168] border-[#c59b27]/75'
            }`}
          >
            {burst.label}
          </div>
        </div>
      ))}
    </div>
  );
}
