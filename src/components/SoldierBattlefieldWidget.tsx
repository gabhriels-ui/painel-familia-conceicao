import { useState } from 'react';
import { ArrowRight, Flame, Shield, Swords, X } from 'lucide-react';
import type { AppState, TabId } from '../types/chronicles';
import { formatBRL } from '../utils/formatters';
import { soundFx } from '../utils/sound';
import { VaultChestSvg } from './Crests';

interface SoldierBattlefieldWidgetProps {
  state: AppState;
  soldiers: number;
  totalWealth: number;
  onClose: () => void;
  onNavigateTab: (tab: TabId) => void;
}

export function SoldierBattlefieldWidget({
  state,
  soldiers,
  totalWealth,
  onClose,
  onNavigateTab,
}: SoldierBattlefieldWidgetProps) {
  const [chargeCount, setChargeCount] = useState(0);

  const unitArca1 = Math.floor((state.box1 || 0) / 100);
  const unitArca2 = Math.floor((state.box2 || 0) / 100);
  const unitArca3 = Math.floor((state.box3 || 0) / 100);
  const unitArca4 = Math.floor((state.box4 || 0) / 100);

  // Calcula fileiras visuais proporcionais ao saldo real (mínimo 1 guarda de vigília)
  const visibleWarriors = Math.max(1, Math.min(6, Math.ceil(Math.max(soldiers, 1) / 40)));
  const legionTitle =
    soldiers >= 500
      ? 'Exército Cruzado Imponente'
      : soldiers >= 150
      ? 'Legião Veterana em Formação'
      : soldiers >= 30
      ? 'Companhia de Vanguarda'
      : soldiers >= 1
      ? 'Pelotão de Vigília'
      : 'Sentinela Solitária';

  const handleCharge = () => {
    setChargeCount((c) => c + 1);
    soundFx.strike(state.soundEnabled);
    window.setTimeout(() => soundFx.warDrums(state.soundEnabled), 90);
  };

  return (
    <div className="drawer-expand rpg-panel border-[#c59b27]/40 p-4 sm:p-6 space-y-5 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-white/10 pb-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#c59b27] font-semibold">
            <Swords className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>Teatro de Operações da Guarnição</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono-num text-[#e4c770]">{legionTitle}</span>
          </div>
          <h2 className="font-epic text-lg sm:text-xl text-[#f3ead6] text-balance">
            {soldiers.toLocaleString('pt-BR')}{' '}
            {soldiers === 1 ? 'Soldado em Combate' : 'Soldados em Combate'} contra as Dívidas
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleCharge}
            className="rpg-btn-crimson px-3.5 py-2 rounded-lg text-xs font-epic flex items-center gap-1.5 whitespace-nowrap cursor-pointer min-h-[42px]"
          >
            <Flame className="w-3.5 h-3.5 text-[#e4c770] shrink-0" aria-hidden="true" />
            <span>Ordenar Carga!</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigateTab('rota')}
            className="rpg-btn-gold px-3.5 py-2 rounded-lg text-xs font-epic flex items-center gap-1.5 whitespace-nowrap cursor-pointer min-h-[42px]"
          >
            <span>Recrutar no Tesouro</span>
            <ArrowRight className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Recolher campo de batalha"
            className="rpg-btn-iron p-2 rounded-lg text-[#9e9380] hover:text-white cursor-pointer min-h-[42px] min-w-[42px] flex items-center justify-center"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Palco SVG animado de soldados guerreando em tempo real */}
      <div className="parchment-box relative overflow-hidden p-2 sm:p-4">
        {chargeCount > 0 && (
          <div
            key={`charge-${chargeCount}`}
            aria-hidden="true"
            className="legion-charge-wave pointer-events-none absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-[#c59b27]/0 via-[#c59b27]/25 to-[#dc2626]/0 z-10"
          />
        )}

        <svg
          viewBox="0 0 680 180"
          className="w-full h-auto max-h-[210px] block"
          role="img"
          aria-label="Animação de soldados templários da família combatendo espectros da dívida"
        >
          {/* Céu de cerco & muralha distante */}
          <rect x="0" y="0" width="680" height="180" rx="6" fill="#0d0f13" />
          <ellipse cx="340" cy="118" rx="220" ry="52" fill="rgba(197, 155, 39, 0.08)" />
          <ellipse cx="520" cy="110" rx="140" ry="44" fill="rgba(136, 27, 27, 0.14)" />

          {/* Silhueta de castelo e tochas ao fundo */}
          <path
            d="M0 132 H48 V98 H62 V110 H78 V98 H94 V132 H160 V116 H188 V132 H680 V180 H0 Z"
            fill="#14171c"
          />
          <rect x="0" y="138" width="680" height="42" fill="#18120e" />
          <line x1="0" y1="138" x2="680" y2="138" stroke="#7d5d28" strokeOpacity="0.45" strokeWidth="1.5" />

          {/* Estandarte da Família Conceição tremulando à esquerda */}
          <g transform="translate(36, 42)">
            <line x1="0" y1="0" x2="0" y2="96" stroke="#cbd5e1" strokeWidth="3" />
            <g className="banner-flutter" style={{ transformOrigin: '0px 14px' }}>
              <path d="M2 6 H48 L40 20 L48 34 H2 Z" fill="url(#crimsonShield)" stroke="url(#goldMetal)" strokeWidth="1.5" />
              <path d="M21 12 V28 M14 20 H28" stroke="#e4c770" strokeWidth="2.2" strokeLinecap="round" />
            </g>
          </g>

          {/* Arqueiros na retaguarda disparando flechas */}
          <g transform="translate(88, 92)">
            <circle cx="10" cy="10" r="6" fill="#3a3f45" stroke="#c59b27" strokeWidth="1.2" />
            <rect x="5" y="17" width="10" height="19" rx="2" fill="#232629" stroke="#525861" strokeWidth="1" />
            <path d="M16 14 Q26 24 16 34" fill="none" stroke="#c59b27" strokeWidth="2" />
            <path d="M4 36 L2 46 M14 36 L16 46" stroke="#1f2329" strokeWidth="3" strokeLinecap="round" />
          </g>

          {/* Flechas voando pelo campo de batalha */}
          <g className="arrow-volley-1" transform="translate(112, 102)">
            <line x1="0" y1="0" x2="22" y2="0" stroke="#cbd5e1" strokeWidth="1.8" />
            <polygon points="22,-3 28,0 22,3" fill="#e4c770" />
          </g>
          <g className="arrow-volley-2" transform="translate(106, 94)">
            <line x1="0" y1="0" x2="22" y2="0" stroke="#cbd5e1" strokeWidth="1.8" />
            <polygon points="22,-3 28,0 22,3" fill="#e4c770" />
          </g>

          {/* Fileira de Escudeiros & Espadachins da Fortaleza (escala com o saldo real) */}
          {Array.from({ length: visibleWarriors }).map((_, idx) => {
            const x = 148 + idx * 38;
            const y = idx % 2 === 0 ? 86 : 92;
            const isFrontRank = idx >= visibleWarriors - 2;
            return (
              <g
                key={idx}
                transform={`translate(${x}, ${y})`}
                className={isFrontRank ? 'soldier-shield-brace' : ''}
              >
                {/* Capa & Corpo */}
                <path d="M8 20 L2 42 H16 Z" fill="#7f1d1d" opacity="0.85" />
                <rect x="7" y="18" width="12" height="20" rx="2" fill="url(#brushedIron)" stroke="#c59b27" strokeWidth="1" />
                {/* Elmo com cruz */}
                <path d="M7 9 Q13 1 19 9 V17 H7 Z" fill="#474d56" stroke="#e4c770" strokeWidth="1.1" />
                <line x1="9" y1="11" x2="17" y2="11" stroke="#090a0c" strokeWidth="1.6" />
                {/* Pernas */}
                <path d="M9 38 L7 50 M17 38 L20 50" stroke="#2d323a" strokeWidth="3.2" strokeLinecap="round" />

                {/* Escudo Templário */}
                <path
                  d="M16 19 L27 22 V32 C27 38 21.5 42 21.5 42 C21.5 42 16 38 16 32 Z"
                  fill="url(#crimsonShield)"
                  stroke="url(#goldMetal)"
                  strokeWidth="1.4"
                />
                <path d="M21.5 24 V36 M18 29 H25" stroke="#e4c770" strokeWidth="1.4" />

                {/* Espada golpeando */}
                <g className={idx % 2 === 0 ? 'soldier-swing' : 'soldier-swing-delay'}>
                  <line x1="18" y1="22" x2="38" y2="4" stroke="url(#steelBlade)" strokeWidth="2.8" strokeLinecap="round" />
                  <line x1="16" y1="19" x2="23" y2="25" stroke="#c59b27" strokeWidth="2.2" strokeLinecap="round" />
                </g>
              </g>
            );
          })}

          {/* Zona Central de Impacto e Faíscas de Aço */}
          <g transform="translate(388, 96)" className="clash-spark">
            <path
              d="M0 -14 L3 -3 L14 0 L3 3 L0 14 L-3 3 L-14 0 L-3 -3 Z"
              fill="#fde047"
            />
            <circle cx="0" cy="0" r="10" fill="#ea580c" opacity="0.28" />
          </g>
          <g transform="translate(412, 114)" className="clash-spark" style={{ animationDelay: '0.45s' }}>
            <path
              d="M0 -10 L2 -2 L10 0 L2 2 L0 10 L-2 2 L-10 0 L-2 -2 Z"
              fill="#e4c770"
            />
          </g>

          {/* Inimigos: Espectros dos Juros e Impulso atacando pela direita */}
          {[0, 1, 2].map((eIdx) => {
            const ex = 416 + eIdx * 54;
            const ey = eIdx === 1 ? 92 : 84;
            return (
              <g
                key={eIdx}
                transform={`translate(${ex}, ${ey})`}
                className="enemy-lunge"
                style={{ animationDelay: `${eIdx * 0.22}s` }}
              >
                {/* Manto sombrio */}
                <path d="M12 18 L2 46 H26 Z" fill="#18080b" stroke="#7f1d1d" strokeWidth="1.1" />
                {/* Chifres e olhos incandescentes */}
                <path d="M8 9 L4 1 M18 9 L22 1" stroke="#991b1b" strokeWidth="2.2" strokeLinecap="round" />
                <circle cx="13" cy="12" r="6" fill="#231215" stroke="#7f1d1d" strokeWidth="1.1" />
                <circle cx="10.5" cy="12" r="1.4" fill="#ef4444" />
                <circle cx="15.5" cy="12" r="1.4" fill="#ef4444" />
                {/* Lâmina sombria investindo contra a esquerda */}
                <line x1="8" y1="24" x2="-14" y2="10" stroke="#991b1b" strokeWidth="2.8" strokeLinecap="round" />
                <line x1="6" y1="20" x2="10" y2="27" stroke="#525861" strokeWidth="2" />
              </g>
            );
          })}

          {/* Estandarte Inimigo Recuando à Direita */}
          <g transform="translate(616, 48)" opacity="0.82">
            <line x1="0" y1="0" x2="0" y2="90" stroke="#525861" strokeWidth="2.5" />
            <path d="M-36 10 H0 V34 H-36 L-28 22 Z" fill="#2b0709" stroke="#7f1d1d" strokeWidth="1.2" />
            <text x="-20" y="25" fill="#f87171" fontSize="9" fontWeight="bold">%</text>
          </g>
        </svg>
      </div>

      {/* Distribuição de Regimentos pelas 4 Arcas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="parchment-box p-3 flex items-center gap-2.5">
          <VaultChestSvg vaultId={1} className="w-7 h-7 shrink-0" breatheDelayMs={0} />
          <div className="min-w-0 space-y-0.5">
            <div className="text-[11px] text-[#9e9380] truncate">Vanguarda · Arca I</div>
            <div className="font-mono-num text-sm font-bold text-[#f3ead6] truncate">
              {unitArca1.toLocaleString('pt-BR')} {unitArca1 === 1 ? 'Escudeiro' : 'Escudeiros'}
            </div>
            <div className="text-[11px] font-mono-num text-[#c59b27]">{formatBRL(state.box1 || 0)}</div>
          </div>
        </div>

        <div className="parchment-box p-3 flex items-center gap-2.5">
          <VaultChestSvg vaultId={2} className="w-7 h-7 shrink-0" breatheDelayMs={420} />
          <div className="min-w-0 space-y-0.5">
            <div className="text-[11px] text-[#9e9380] truncate">Muralha · Arca II</div>
            <div className="font-mono-num text-sm font-bold text-[#f3ead6] truncate">
              {unitArca2.toLocaleString('pt-BR')} {unitArca2 === 1 ? 'Lanceiro' : 'Lanceiros'}
            </div>
            <div className="text-[11px] font-mono-num text-emerald-400">{formatBRL(state.box2 || 0)}</div>
          </div>
        </div>

        <div className="parchment-box p-3 flex items-center gap-2.5">
          <VaultChestSvg vaultId={3} className="w-7 h-7 shrink-0" breatheDelayMs={840} />
          <div className="min-w-0 space-y-0.5">
            <div className="text-[11px] text-[#9e9380] truncate">Cavalaria · Arca III</div>
            <div className="font-mono-num text-sm font-bold text-[#f3ead6] truncate">
              {unitArca3.toLocaleString('pt-BR')} {unitArca3 === 1 ? 'Cavaleiro' : 'Cavaleiros'}
            </div>
            <div className="text-[11px] font-mono-num text-[#e4c770]">{formatBRL(state.box3 || 0)}</div>
          </div>
        </div>

        <div className="parchment-box p-3 flex items-center gap-2.5">
          <VaultChestSvg vaultId={4} className="w-7 h-7 shrink-0" breatheDelayMs={1260} />
          <div className="min-w-0 space-y-0.5">
            <div className="text-[11px] text-[#9e9380] truncate">Legado · Arca IV</div>
            <div className="font-mono-num text-sm font-bold text-[#f3ead6] truncate">
              {unitArca4.toLocaleString('pt-BR')} {unitArca4 === 1 ? 'Templário' : 'Templários'}
            </div>
            <div className="text-[11px] font-mono-num text-blue-400">{formatBRL(state.box4 || 0)}</div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#9e9380]">
        <span className="flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-[#c59b27] shrink-0" aria-hidden="true" />
          <span>Cada R$ 100,00 acumulados recruta 1 soldado permanente para proteger a família.</span>
        </span>
        <span className="font-mono-num text-[#e4c770]">
          Poder Total: {formatBRL(totalWealth)}
        </span>
      </div>
    </div>
  );
}
