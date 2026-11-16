import React from 'react';

export type ArenaGateStage = 'fade-black' | 'part-gates' | 'reveal';

interface ArenaGateTransitionProps {
  stage: ArenaGateStage;
}

export const ArenaGateTransition: React.FC<ArenaGateTransitionProps> = ({ stage }) => {
  const isFadingOut = stage === 'reveal';
  const areGatesOpen = stage === 'part-gates' || stage === 'reveal';

  return (
    <div
      aria-hidden="true"
      className={`arena-gate-overlay fixed inset-0 z-[60] overflow-hidden select-none ${
        isFadingOut ? 'arena-gate-overlay--reveal pointer-events-none' : 'pointer-events-auto'
      }`}
    >
      {/* Véu Obsidian Fade-to-Black */}
      <div className="absolute inset-0 bg-[#030304]" />

      {/* Fresta de Luz de Tocha e Ouro Dourado/Carmesim entre os portões */}
      <div
        className={`arena-gate-seam-glow pointer-events-none absolute inset-y-0 left-1/2 -translate-x-1/2 w-56 sm:w-80 ${
          stage === 'part-gates' ? 'opacity-100 scale-x-125' : 'opacity-0 scale-x-75'
        }`}
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(228,199,112,0.44) 0%, rgba(180,83,9,0.28) 38%, rgba(136,27,27,0.18) 68%, transparent 100%)',
        }}
      />

      {/* Folha Esquerda do Portão Pesado de Ferro Forjado */}
      <div
        className="arena-gate-door-left absolute inset-y-0 left-0 w-1/2 border-r-2 border-[#3c3f46] shadow-[inset_-24px_0_48px_rgba(0,0,0,0.88),14px_0_38px_rgba(0,0,0,0.9)]"
        style={{
          transform: areGatesOpen ? 'translate3d(-104%, 0, 0)' : 'translate3d(0, 0, 0)',
          background:
            'linear-gradient(90deg, #0b0d10 0%, #15181e 55%, #1d2129 92%, #292d36 100%)',
        }}
      >
        <svg
          viewBox="0 0 500 900"
          preserveAspectRatio="none"
          className="h-full w-full opacity-90"
        >
          <defs>
            <linearGradient id="gateIronBarL" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#14171c" />
              <stop offset="48%" stopColor="#353b45" />
              <stop offset="100%" stopColor="#0d0f13" />
            </linearGradient>
          </defs>
          <rect x="0" y="0" width="500" height="44" fill="#101216" stroke="#2c313a" strokeWidth="2" />
          <rect x="0" y="420" width="500" height="58" fill="#13161b" stroke="#393f4b" strokeWidth="2" />
          <rect x="0" y="856" width="500" height="44" fill="#101216" stroke="#2c313a" strokeWidth="2" />

          {[75, 165, 255, 345, 435].map((x) => (
            <g key={x}>
              <rect x={x - 10} y="0" width="20" height="900" fill="url(#gateIronBarL)" />
              <circle cx={x} cy="22" r="5" fill="#707784" />
              <circle cx={x} cy="449" r="5" fill="#c59b27" opacity="0.72" />
              <circle cx={x} cy="878" r="5" fill="#707784" />
            </g>
          ))}

          <line x1="15" y1="45" x2="485" y2="418" stroke="#262b33" strokeWidth="18" />
          <line x1="15" y1="482" x2="485" y2="855" stroke="#262b33" strokeWidth="18" />

          <rect x="476" y="0" width="24" height="900" fill="#1a1d24" />
          <path
            d="M498 370 A78 78 0 0 0 498 526"
            fill="none"
            stroke="#c59b27"
            strokeWidth="12"
            opacity="0.88"
          />
          <circle cx="478" cy="449" r="9" fill="#e4c770" />
        </svg>
      </div>

      {/* Folha Direita do Portão Pesado de Ferro Forjado */}
      <div
        className="arena-gate-door-right absolute inset-y-0 right-0 w-1/2 border-l-2 border-[#3c3f46] shadow-[inset_24px_0_48px_rgba(0,0,0,0.88),-14px_0_38px_rgba(0,0,0,0.9)]"
        style={{
          transform: areGatesOpen ? 'translate3d(104%, 0, 0)' : 'translate3d(0, 0, 0)',
          background:
            'linear-gradient(270deg, #0b0d10 0%, #15181e 55%, #1d2129 92%, #292d36 100%)',
        }}
      >
        <svg
          viewBox="0 0 500 900"
          preserveAspectRatio="none"
          className="h-full w-full opacity-90"
        >
          <defs>
            <linearGradient id="gateIronBarR" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0d0f13" />
              <stop offset="52%" stopColor="#353b45" />
              <stop offset="100%" stopColor="#14171c" />
            </linearGradient>
          </defs>
          <rect x="0" y="0" width="500" height="44" fill="#101216" stroke="#2c313a" strokeWidth="2" />
          <rect x="0" y="420" width="500" height="58" fill="#13161b" stroke="#393f4b" strokeWidth="2" />
          <rect x="0" y="856" width="500" height="44" fill="#101216" stroke="#2c313a" strokeWidth="2" />

          {[65, 155, 245, 335, 425].map((x) => (
            <g key={x}>
              <rect x={x - 10} y="0" width="20" height="900" fill="url(#gateIronBarR)" />
              <circle cx={x} cy="22" r="5" fill="#707784" />
              <circle cx={x} cy="449" r="5" fill="#c59b27" opacity="0.72" />
              <circle cx={x} cy="878" r="5" fill="#707784" />
            </g>
          ))}

          <line x1="485" y1="45" x2="15" y2="418" stroke="#262b33" strokeWidth="18" />
          <line x1="485" y1="482" x2="15" y2="855" stroke="#262b33" strokeWidth="18" />

          <rect x="0" y="0" width="24" height="900" fill="#1a1d24" />
          <path
            d="M2 370 A78 78 0 0 1 2 526"
            fill="none"
            stroke="#c59b27"
            strokeWidth="12"
            opacity="0.88"
          />
          <circle cx="22" cy="449" r="9" fill="#e4c770" />
        </svg>
      </div>

      {/* Selo Central de Comando da Arena */}
      <div
        className={`arena-gate-crest-emblem pointer-events-none absolute inset-0 flex items-center justify-center ${
          stage === 'fade-black'
            ? 'opacity-100 scale-100'
            : stage === 'part-gates'
              ? 'opacity-90 scale-105'
              : 'opacity-0 scale-110'
        }`}
      >
        <div className="px-6 py-4 rounded-xl border border-[#c59b27]/45 bg-[#090a0d]/92 shadow-[0_0_48px_rgba(0,0,0,0.95)] text-center">
          <div className="font-epic text-[10px] tracking-[0.28em] text-[#c59b27] uppercase mb-1">
            Portões da Arena
          </div>
          <div className="font-epic text-base sm:text-xl text-[#e7dcc6] tracking-[0.14em]">
            EMPUNHAR O AÇO
          </div>
        </div>
      </div>
    </div>
  );
};
