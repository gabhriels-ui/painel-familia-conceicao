import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  ArrowRight,
  Check,
  Compass,
  Flag,
  Flame,
  Lock,
  Mountain,
  ShieldCheck,
  Target,
  X,
} from 'lucide-react';
import type { AppState, FeudChecklistState, TabId } from '../types/chronicles';
import { formatBRL } from '../utils/formatters';
import { TacticalCampaignMap, type MapFeudSummary } from './TacticalCampaignMap';

export interface WarRoomFeudItem extends MapFeudSummary {
  planPhase: string;
  planLinkLabel: string;
  remainingText: string;
  linkedTab?: TabId;
  linkedActionLabel?: string;
  checklist?: { key: keyof FeudChecklistState; label: string; checked: boolean }[];
}

interface WarRoomModalProps {
  isOpen: boolean;
  state: AppState;
  feuds: WarRoomFeudItem[];
  conquered: Record<number, boolean>;
  conqueredCount: number;
  unlockedRelicsCount: number;
  totalRelicsCount: number;
  selectedFeudId: number;
  onSelectFeud: (feudId: number) => void;
  onToggleChecklist: (key: keyof FeudChecklistState) => void;
  onNavigateTab?: (tab: TabId) => void;
  onClose: () => void;
}

export function WarRoomModal({
  isOpen,
  state,
  feuds,
  conquered,
  conqueredCount,
  unlockedRelicsCount,
  totalRelicsCount,
  selectedFeudId,
  onSelectFeud,
  onToggleChecklist,
  onNavigateTab,
  onClose,
}: WarRoomModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === 'undefined') return null;

  const selectedFeud = feuds.find((f) => f.id === selectedFeudId) ?? feuds[0];
  const selectedIsConquered = !!conquered[selectedFeud.id];

  const totalTreasure =
    (state.box1 || 0) + (state.box2 || 0) + (state.box3 || 0) + (state.box4 || 0);

  const caixinhasResumo = [
    {
      id: 'C1',
      label: 'Caixinha 1 · Crédito',
      current: state.box1 || 0,
      target: 6829,
      pct: Math.min(100, Math.round(((state.box1 || 0) / 6829) * 100)),
    },
    {
      id: 'C2',
      label: 'Caixinha 2 · Reserva',
      current: state.box2 || 0,
      target: 12000,
      pct: Math.min(100, Math.round(((state.box2 || 0) / 12000) * 100)),
    },
    {
      id: 'C3',
      label: 'Caixinha 3 · Corolla',
      current: state.box3 || 0,
      target: 45000,
      pct: Math.min(100, Math.round(((state.box3 || 0) / 45000) * 100)),
    },
    {
      id: 'C4',
      label: 'Caixinha 4 · Legado',
      current: state.box4 || 0,
      target: 50000,
      pct: Math.min(100, Math.round(((state.box4 || 0) / 50000) * 100)),
    },
  ];

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="war-room-modal-title"
      className="fixed inset-0 z-50 w-screen h-screen bg-[#070504] text-[#efe3c8] flex flex-col overflow-hidden"
      style={{
        backgroundImage:
          'radial-gradient(ellipse at 32% 18%, rgba(234, 179, 8, 0.08) 0%, transparent 52%), radial-gradient(circle at 82% 84%, rgba(136, 27, 27, 0.14) 0%, transparent 48%), repeating-linear-gradient(90deg, rgba(64, 42, 24, 0.08) 0px, rgba(64, 42, 24, 0.08) 1px, transparent 1px, transparent 42px)',
      }}
    >
      {/* Moldura interna em ferro batido e pergaminho */}
      <div className="flex-1 min-h-0 flex flex-col m-1.5 sm:m-3 rounded-xl border border-[#eab308]/40 bg-[#120d09]/96 shadow-[0_0_60px_rgba(0,0,0,0.95),inset_0_1px_0_rgba(253,224,71,0.22),inset_0_0_0_3px_rgba(10,8,6,0.75)] overflow-hidden">
        {/* Cabeçalho Superior da Sala de Guerra */}
        <header className="shrink-0 px-4 sm:px-6 py-3.5 border-b border-[#7d5d28]/45 bg-gradient-to-r from-[#1c140d] via-[#151316] to-[#1a120b] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-[#231910] border border-[#eab308]/45 flex items-center justify-center shrink-0 shadow-[inset_0_1px_0_rgba(253,224,71,0.2)]">
              <Compass className="w-5 h-5 text-[#eab308]" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-epic text-[#c59b27]">
                Sala de Guerra · Comando Estratégico (2026–2028)
              </div>
              <h2
                id="war-room-modal-title"
                className="font-epic text-lg sm:text-xl text-[#f3ead6] truncate"
              >
                Mapa de Campanha & Objetivos da Família Conceição
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 shrink-0">
            <div className="hidden md:flex items-center gap-3 text-xs font-mono-num text-[#c7b8a0]">
              <span>
                <strong className="text-[#fde047]">{conqueredCount}/6</strong> Feudos
              </span>
              <span aria-hidden="true">·</span>
              <span>
                <strong className="text-[#fde047]">
                  {unlockedRelicsCount}/{totalRelicsCount}
                </strong>{' '}
                Relíquias
              </span>
              <span aria-hidden="true">·</span>
              <span>
                Arcas: <strong className="text-emerald-400">{formatBRL(totalTreasure)}</strong>
              </span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rpg-btn-crimson px-4 py-2.5 rounded-lg text-xs sm:text-sm font-epic inline-flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0 min-h-[44px]"
            >
              <span>Recuar / Fechar</span>
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </header>

        {/* Área Principal: Mapa Topográfico + Painel Lateral de Objetivos */}
        <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden">
          {/* Coluna Esquerda / Superior: Mapa Topográfico em Alta Escala */}
          <div className="lg:flex-1 min-w-0 lg:min-h-0 flex flex-col justify-between p-4 sm:p-5 gap-4 lg:overflow-y-auto bg-[#0e0a07]/70">
            <div className="flex-1 min-h-0 flex items-center justify-center">
              <div className="w-full max-w-[1140px]">
                <TacticalCampaignMap
                  feuds={feuds}
                  conquered={conquered}
                  selectedFeudId={selectedFeudId}
                  soundEnabled={state.soundEnabled}
                  onSelectFeud={(id) => onSelectFeud(id)}
                  svgIdPrefix="warroom-"
                  showReconPanel={false}
                />
              </div>
            </div>

            {/* Faixa de Reconhecimento do Território Selecionado no Mapa */}
            <div className="shrink-0 pt-3 border-t border-[#7d5d28]/35 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="space-y-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 text-xs text-[#a69982]">
                  <span className="font-epic text-[#eab308]">
                    Território em Foco · {selectedFeud.roman}. {selectedFeud.name}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="inline-flex items-center gap-1">
                    <Mountain className="w-3.5 h-3.5 text-[#9e9380]" aria-hidden="true" />
                    <span>
                      {selectedFeud.terrainType} ({selectedFeud.elevation})
                    </span>
                  </span>
                  <span aria-hidden="true">·</span>
                  <span
                    className={`inline-flex items-center gap-1 font-semibold ${
                      selectedIsConquered ? 'text-emerald-400' : 'text-amber-300'
                    }`}
                  >
                    {selectedIsConquered ? (
                      <>
                        <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Conquistado</span>
                      </>
                    ) : (
                      <>
                        <Flame className="w-3.5 h-3.5 text-red-400" aria-hidden="true" />
                        <span>Em Campanha · {selectedFeud.progressPct}%</span>
                      </>
                    )}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#d5c7b0]">
                  {selectedFeud.planLinkLabel}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-[#9e9380] shrink-0">
                <span className="inline-flex items-center gap-1.5">
                  <Flag className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
                  <span>Conquistado</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-red-400" aria-hidden="true" />
                  <span>Sob Cerco</span>
                </span>
              </div>
            </div>
          </div>

          {/* Coluna Direita / Inferior: Painel Detalhado de Objetivos a Conquistar */}
          <aside
            aria-label="Painel de Objetivos do Plano Diretor 2026-2028"
            className="lg:w-[440px] xl:w-[490px] shrink-0 border-t lg:border-t-0 lg:border-l border-[#7d5d28]/45 bg-[#14100c] flex flex-col lg:min-h-0"
          >
            {/* Resumo das Caixinhas do Plano Diretor */}
            <div className="shrink-0 p-4 sm:p-5 border-b border-[#7d5d28]/35 space-y-3 bg-[#19130d]">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-[#eab308] shrink-0" aria-hidden="true" />
                  <h3 className="font-epic text-base text-[#f3ead6]">
                    Objetivos a Conquistar
                  </h3>
                </div>
                <span className="text-xs font-mono-num text-[#c59b27]">
                  Plano 2026–2028
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-1">
                {caixinhasResumo.map((cx) => (
                  <div
                    key={cx.id}
                    className="p-2.5 rounded-lg bg-[#0e0b08] border border-[#7d5d28]/30 space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-1 text-[11px]">
                      <span className="text-[#c7b8a0] truncate">{cx.label}</span>
                      <span className="font-mono-num font-bold text-[#fde047] shrink-0">
                        {cx.pct}%
                      </span>
                    </div>
                    <div className="font-mono-num text-xs font-semibold text-[#f3ead6]">
                      {formatBRL(cx.current)}
                    </div>
                    <div className="h-1.5 w-full rounded-sm bg-[#1c1814] overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          cx.pct >= 100 ? 'bg-emerald-500' : 'bg-[#eab308]'
                        }`}
                        style={{ width: `${cx.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Lista Detalhada dos 6 Territórios */}
            <div className="lg:flex-1 lg:overflow-y-auto divide-y divide-[#7d5d28]/25">
              {feuds.map((feud) => {
                const isConquered = !!conquered[feud.id];
                const isSelected = selectedFeudId === feud.id;

                return (
                  <div
                    key={`war-obj-${feud.id}`}
                    onClick={() => onSelectFeud(feud.id)}
                    className={`p-4 sm:px-5 transition-colors cursor-pointer space-y-2.5 ${
                      isSelected
                        ? 'bg-[#211910]'
                        : 'hover:bg-[#1a140d]/80'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 text-[11px]">
                          <span className="font-epic text-[#eab308]">
                            {feud.planPhase}
                          </span>
                          <span aria-hidden="true" className="text-[#7d5d28]">
                            ·
                          </span>
                          <span className="text-[#a69982]">{feud.terrainType}</span>
                        </div>
                        <h4 className="font-epic text-base text-[#f3ead6]">
                          {feud.roman}. {feud.name}
                        </h4>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1 text-xs font-semibold shrink-0 ${
                          isConquered ? 'text-emerald-400' : 'text-[#dfc168]'
                        }`}
                      >
                        {isConquered ? (
                          <>
                            <Flag className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Conquistado</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-3.5 h-3.5 text-red-400" aria-hidden="true" />
                            <span className="font-mono-num">{feud.progressPct}%</span>
                          </>
                        )}
                      </span>
                    </div>

                    <p className="text-xs text-[#d5c7b0] leading-relaxed">
                      {feud.planLinkLabel}
                    </p>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2 text-xs font-mono-num">
                        <span className="text-[#e4c770]">{feud.progressLabel}</span>
                        <span className="text-[#a69982]">{feud.remainingText}</span>
                      </div>
                      <div className="h-2 w-full rounded-sm bg-[#0b0907] overflow-hidden border border-[#7d5d28]/35">
                        <div
                          className={`h-full transition-all duration-300 ${
                            isConquered ? 'bg-emerald-500' : 'bg-[#eab308]'
                          }`}
                          style={{ width: `${feud.progressPct}%` }}
                        />
                      </div>
                    </div>

                    {feud.checklist && (
                      <div className="space-y-1.5 pt-1">
                        {feud.checklist.map((item) => (
                          <button
                            key={item.key}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectFeud(feud.id);
                              onToggleChecklist(item.key);
                            }}
                            aria-pressed={item.checked}
                            className="w-full flex items-center gap-2.5 text-left text-xs py-2 px-3 rounded-lg bg-[#0d0a08] border border-white/10 hover:border-[#eab308]/60 cursor-pointer transition-colors min-h-[42px]"
                          >
                            <span
                              className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border ${
                                item.checked
                                  ? 'bg-emerald-700 border-emerald-400 text-white'
                                  : 'border-[#525861] text-transparent'
                              }`}
                            >
                              <Check className="w-3 h-3" aria-hidden="true" />
                            </span>
                            <span
                              className={
                                item.checked ? 'text-emerald-300 font-semibold' : 'text-[#d5c7b0]'
                              }
                            >
                              {item.label}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}

                    {feud.linkedTab && onNavigateTab && (
                      <div className="pt-1 flex justify-end">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onClose();
                            onNavigateTab(feud.linkedTab!);
                          }}
                          className="rpg-btn-iron px-3.5 py-2 rounded-lg text-xs font-epic text-[#e4c770] inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap min-h-[40px]"
                        >
                          <span>{feud.linkedActionLabel ?? 'Ir para Caixinhas'}</span>
                          <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </aside>
        </div>
      </div>
    </div>,
    document.body
  );
}
