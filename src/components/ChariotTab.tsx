import { useState } from 'react';
import {
  ArrowRight,
  Award,
  Car,
  Check,
  CheckCircle2,
  Gauge,
  Lock,
  Pencil,
  Wrench,
} from 'lucide-react';
import type { AppState, TabId } from '../types/chronicles';
import { formatBRL, parsePositiveAmount } from '../utils/formatters';
import { CorollaSilhouetteSvg } from './Crests';

interface ChariotTabProps {
  state: AppState;
  onOpenCockpit: () => void;
  onUpdateCarValue: (value: number) => void;
  onNavigateTab?: (tab: TabId) => void;
}

const ARCA3_TARGET = 45000;

interface AssemblyPhase {
  phase: 1 | 2 | 3 | 4 | 5;
  rangeLabel: string;
  minPctExclusive: number;
  title: string;
  description: string;
  unlockAmountLabel: string;
}

const ASSEMBLY_PHASES: AssemblyPhase[] = [
  {
    phase: 1,
    rangeLabel: '0–20%',
    minPctExclusive: -1,
    title: 'Chassi & Esqueleto Estrutural',
    description: 'Longarinas de aço, piso blindado e gaiola de segurança do habitáculo.',
    unlockAmountLabel: 'Base Inicial',
  },
  {
    phase: 2,
    rangeLabel: '21–40%',
    minPctExclusive: 20,
    title: 'Bloco do Motor 2.0 Dual VVT-i',
    description: 'Instalação do conjunto motriz 2.0 Flex de 154 CV, radiador e coletores.',
    unlockAmountLabel: 'R$ 9.450+',
  },
  {
    phase: 3,
    rangeLabel: '41–60%',
    minPctExclusive: 40,
    title: 'Carroceria & Pintura',
    description: 'Chapas em aço escovado, portas com rebites de bronze e vidros blindados.',
    unlockAmountLabel: 'R$ 18.450+',
  },
  {
    phase: 4,
    rangeLabel: '61–80%',
    minPctExclusive: 60,
    title: 'Rodas & Suspensão',
    description: 'Retirada dos cavaletes hidráulicos, molas helicoidais e rodas forjadas.',
    unlockAmountLabel: 'R$ 27.450+',
  },
  {
    phase: 5,
    rangeLabel: '81–100%',
    minPctExclusive: 80,
    title: 'Conjunto Final & Faróis Acesos',
    description: 'Veículo 100% montado com faróis acesos e selo Pronto para Compra à Vista.',
    unlockAmountLabel: 'R$ 36.450+',
  },
];

export function ChariotTab({
  state,
  onOpenCockpit,
  onUpdateCarValue,
  onNavigateTab,
}: ChariotTabProps) {
  const [editingCar, setEditingCar] = useState(false);
  const [carInput, setCarInput] = useState(String(state.currentCarValue || 33000));

  const arca3 = Math.max(0, state.box3 || 0);
  const currentCar = state.currentCarValue || 33000;
  const totalPower = arca3 + currentCar;
  const targetTotal = ARCA3_TARGET + currentCar;
  const rawPct = Math.min(100, (arca3 / ARCA3_TARGET) * 100);
  const progressPct = Math.min(100, Math.round(rawPct));
  const missingForCash = Math.max(0, ARCA3_TARGET - arca3);

  const currentPhase =
    rawPct > 80
      ? 5
      : rawPct > 60
      ? 4
      : rawPct > 40
      ? 3
      : rawPct > 20
      ? 2
      : 1;

  const isReadyForCash = rawPct > 80;

  const saveCarValue = () => {
    const parsed = parsePositiveAmount(carInput);
    if (parsed === null) return;
    onUpdateCarValue(parsed);
    setEditingCar(false);
  };

  return (
    <div className="space-y-6">
      <section className="rpg-panel p-5 sm:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#3a3f45] pb-4">
          <div>
            <span className="text-xs font-epic text-[#c59b27]">
              Hangar Tático de Montagem Real · Arca III
            </span>
            <h2 className="font-epic text-xl sm:text-2xl text-[#f3ead6] text-balance">
              Toyota Corolla XEi 2017 · 2.0 (154 CV)
            </h2>
            <p className="text-sm text-[#a69982]">
              Cada camada estrutural do veículo é desbloqueada em tempo real conforme o saldo acumulado na Caixinha 3 (meta de R$ 45.000,00).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {onNavigateTab && (
              <button
                type="button"
                onClick={() => onNavigateTab('rota')}
                className="rpg-btn-iron px-3.5 py-2.5 rounded text-xs sm:text-sm font-semibold flex items-center gap-2 whitespace-nowrap cursor-pointer min-h-[44px]"
              >
                <span>Atualizar Caixinha 3</span>
                <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
              </button>
            )}
            <button
              type="button"
              onClick={onOpenCockpit}
              className="rpg-btn-gold px-4 py-2.5 rounded text-sm font-epic flex items-center gap-2 whitespace-nowrap cursor-pointer min-h-[44px]"
            >
              <Gauge className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Inspecionar Cockpit</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Hangar SVG 3D Vinculado ao Saldo */}
          <div className="lg:col-span-6 cathedral-glass state-card p-5 sm:p-6 flex flex-col justify-between gap-4">
            <div className="depth-layer-1 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="font-epic text-[#eab308] flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Fase {currentPhase} de 5 em Construção</span>
              </span>
              {isReadyForCash ? (
                <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-300">
                  <Award className="w-4 h-4 text-emerald-400" aria-hidden="true" />
                  <span>Pronto para Compra à Vista</span>
                </span>
              ) : (
                <span className="font-mono-num text-[#a69982]">
                  {ASSEMBLY_PHASES[currentPhase - 1].title}
                </span>
              )}
            </div>

            <div className="depth-layer-3 w-full flex items-center justify-center py-2">
              <CorollaSilhouetteSvg
                className="w-full max-w-lg h-44 sm:h-48"
                progressPct={rawPct}
              />
            </div>

            <div className="depth-layer-2 w-full space-y-2 pt-2 border-t border-white/10">
              <div className="flex justify-between items-center text-xs font-mono-num">
                <span className="text-[#a69982]">
                  Progresso Real da Caixinha 3 ({formatBRL(arca3)} / {formatBRL(ARCA3_TARGET)})
                </span>
                <span className="text-[#fde047] font-bold">{progressPct}%</span>
              </div>
              <div
                className="w-full h-3 bg-[#111214] rounded-sm overflow-hidden border border-[#3a3f45]"
                role="progressbar"
                aria-valuenow={progressPct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Progresso de montagem real do Corolla XEi 2017"
              >
                <div
                  className={`h-full transition-all duration-500 ${
                    isReadyForCash
                      ? 'bg-gradient-to-r from-[#b45309] via-[#eab308] to-emerald-400'
                      : 'bg-gradient-to-r from-[#7d5d28] via-[#eab308] to-[#fde047]'
                  }`}
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          </div>

          {/* 5 Fases de Construção + KPIs Financeiros */}
          <div className="lg:col-span-6 flex flex-col justify-between gap-4">
            <div className="parchment-box p-4 space-y-2.5">
              <div className="flex items-center justify-between gap-2 pb-1 border-b border-white/10">
                <span className="text-xs font-epic text-[#eab308]">
                  Etapas de Montagem por Saldo
                </span>
                <span className="text-[11px] font-mono-num text-[#9e9380]">
                  Atualização Instantânea
                </span>
              </div>

              <div className="space-y-2">
                {ASSEMBLY_PHASES.map((step) => {
                  const unlocked = rawPct > step.minPctExclusive;
                  const isCurrent = step.phase === currentPhase;
                  return (
                    <div
                      key={step.phase}
                      className={`px-3 py-2 rounded-md border transition-colors flex items-start justify-between gap-3 ${
                        unlocked
                          ? isCurrent
                            ? 'bg-[#eab308]/12 border-[#eab308]/60'
                            : 'bg-emerald-950/25 border-emerald-500/35'
                          : 'bg-[#101215]/75 border-white/10 opacity-70'
                      }`}
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        {unlocked ? (
                          <CheckCircle2
                            className={`w-4 h-4 mt-0.5 shrink-0 ${
                              isCurrent ? 'text-[#fde047]' : 'text-emerald-400'
                            }`}
                            aria-hidden="true"
                          />
                        ) : (
                          <Lock
                            className="w-4 h-4 mt-0.5 shrink-0 text-[#7a7d84]"
                            aria-hidden="true"
                          />
                        )}
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-[#f3ead6] flex flex-wrap items-center gap-1.5">
                            <span>
                              Fase {step.phase} ({step.rangeLabel})
                            </span>
                            <span aria-hidden="true">·</span>
                            <span className={unlocked ? 'text-[#fde047]' : 'text-[#a69982]'}>
                              {step.title}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#9e9380] leading-snug mt-0.5">
                            {step.description}
                          </p>
                        </div>
                      </div>

                      <span className="font-mono-num text-[11px] text-[#a89982] shrink-0 whitespace-nowrap">
                        {unlocked ? 'Montado' : step.unlockAmountLabel}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="parchment-box state-card p-3.5 space-y-1">
                <div className="depth-layer-1 text-xs text-[#a69982]">Saldo Caixinha 3</div>
                <div className="depth-layer-3 font-mono-num text-lg font-bold text-[#dfc168]">
                  {formatBRL(arca3)}
                </div>
                <div className="depth-layer-1 text-[11px] text-[#a69982]">
                  Meta: R$ 45.000,00
                </div>
              </div>

              <div className="parchment-box state-card p-3.5 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-[#a69982]">Montaria Atual</span>
                  {!editingCar && (
                    <button
                      type="button"
                      onClick={() => {
                        setCarInput(String(currentCar));
                        setEditingCar(true);
                      }}
                      aria-label="Editar valor do carro atual"
                      className="text-xs text-[#c59b27] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Pencil className="w-3 h-3" aria-hidden="true" />
                      <span>Editar</span>
                    </button>
                  )}
                </div>

                {editingCar ? (
                  <div className="flex items-center gap-1.5 pt-1">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={carInput}
                      onChange={(e) => setCarInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveCarValue();
                      }}
                      className="w-full bg-[#111214] border border-[#c59b27] rounded px-2 py-1 text-sm font-mono-num text-white focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={saveCarValue}
                      aria-label="Salvar valor do carro atual"
                      className="rpg-btn-gold p-1.5 rounded cursor-pointer"
                    >
                      <Check className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                ) : (
                  <div className="font-mono-num text-lg font-bold text-[#f3ead6]">
                    {formatBRL(currentCar)}
                  </div>
                )}
                <div className="text-[11px] text-[#a69982]">Base de troca FIPE</div>
              </div>

              <div className="parchment-box state-card p-3.5 space-y-1">
                <div className="depth-layer-1 text-xs text-[#a69982]">Poder de Compra</div>
                <div className="depth-layer-3 font-mono-num text-lg font-bold text-emerald-400">
                  {formatBRL(totalPower)}
                </div>
                <div className="depth-layer-1 text-[11px] text-[#a69982]">
                  Alvo total: {formatBRL(targetTotal)}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="parchment-box p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <Car className="w-5 h-5 text-[#c59b27] shrink-0" aria-hidden="true" />
            <div className="text-sm text-[#e4d7be]">
              {missingForCash === 0 ? (
                <strong className="text-emerald-400">
                  Pronto para Compra à Vista! A Caixinha 3 atingiu 100% do alvo de R$ 45.000,00.
                </strong>
              ) : isReadyForCash ? (
                <>
                  <strong className="text-emerald-400">Fase 5 liberada (Pronto para Compra à Vista)!</strong>{' '}
                  Faltam apenas{' '}
                  <strong className="font-mono-num text-[#dfc168]">{formatBRL(missingForCash)}</strong> para fechar 100% da meta.
                </>
              ) : (
                <>
                  Restam{' '}
                  <strong className="font-mono-num text-[#dfc168]">{formatBRL(missingForCash)}</strong>{' '}
                  na Caixinha 3 para concluir todas as etapas de montagem e comprar à vista.
                </>
              )}
            </div>
          </div>
          <span className="text-xs font-mono-num text-[#a69982] shrink-0">
            {missingForCash === 0
              ? '100% Quitável'
              : `Se poupar R$ 1.500/mês · ~${Math.ceil(missingForCash / 1500)} meses`}
          </span>
        </div>
      </section>
    </div>
  );
}
