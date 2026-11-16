import { useEffect, useMemo, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { HEIR_DUE_DATE_ISO, VAULTS } from '../data/chroniclesData';
import type { AppState, TabId } from '../types/chronicles';
import { buildXpSeries, calculateCountdown, formatBRL } from '../utils/formatters';
import { ParchmentScrollIcon } from './Crests';

interface FleetLifespanCardProps {
  state: AppState;
  onNavigateTab: (tab: TabId) => void;
}

const YEAR_2027_ISO = '2027-01-01T00:00:00';

export function FleetLifespanCard({ state, onNavigateTab }: FleetLifespanCardProps) {
  const [daysUntil2027, setDaysUntil2027] = useState(
    () => calculateCountdown(YEAR_2027_ISO).days
  );
  const [daysUntilHeir, setDaysUntilHeir] = useState(
    () => calculateCountdown(HEIR_DUE_DATE_ISO).days
  );

  useEffect(() => {
    const syncDates = () => {
      setDaysUntil2027(calculateCountdown(YEAR_2027_ISO).days);
      setDaysUntilHeir(calculateCountdown(HEIR_DUE_DATE_ISO).days);
    };
    const timer = window.setInterval(syncDates, 60000);
    return () => window.clearInterval(timer);
  }, []);

  const totalWealth =
    (state.box1 || 0) + (state.box2 || 0) + (state.box3 || 0) + (state.box4 || 0);
  const totalTarget = useMemo(
    () => VAULTS.reduce((sum, vault) => sum + vault.target, 0),
    []
  );
  const wealthPercent = Math.min(
    100,
    Math.round((totalWealth / Math.max(1, totalTarget)) * 1000) / 10
  );
  const completedVaults = VAULTS.filter((vault) => {
    const key = `box${vault.id}` as 'box1' | 'box2' | 'box3' | 'box4';
    return (state[key] || 0) >= vault.target;
  }).length;

  const xpSummary = useMemo(
    () => buildXpSeries(state.xpHistory, 30),
    [state.xpHistory]
  );

  const fleetCombinedPower = totalWealth + (state.currentCarValue || 0);

  return (
    <section
      className="rpg-panel state-card p-5 sm:p-6 space-y-5"
      data-tilt-subtle="true"
      aria-labelledby="fleet-lifespan-heading"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-white/10">
        <div className="space-y-1">
          <div className="depth-layer-1 text-xs font-epic text-[#c59b27] tracking-wider">
            Boletim de Vida Útil da Frota
          </div>
          <h2
            id="fleet-lifespan-heading"
            className="depth-layer-2 font-epic text-base sm:text-lg text-[#f3ead6] text-balance"
          >
            Prontidão da Frota e Horizonte de Campanha
          </h2>
          <p className="depth-layer-1 text-sm text-[#9e9380]">
            Montaria atual ({formatBRL(state.currentCarValue || 0)}) · Poder combinado da frota:{' '}
            <span className="font-mono-num text-[#e4c770]">
              {formatBRL(fleetCombinedPower)}
            </span>
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigateTab('corolla')}
          className="depth-layer-2 rpg-btn-iron px-4 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 whitespace-nowrap shrink-0 cursor-pointer min-h-[40px]"
        >
          <span>Inspecionar Biga de Aço</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#c59b27]" aria-hidden="true" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/10">
        {/* Métrica 1: Dias até 2027 */}
        <div className="py-4 md:py-1 md:pr-6 flex items-start gap-4">
          <div className="depth-layer-3 shrink-0">
            <ParchmentScrollIcon
              variant="calendar"
              className="w-12 h-12 sm:w-14 sm:h-14"
            />
          </div>
          <div className="min-w-0 space-y-1">
            <div className="depth-layer-1 text-xs text-[#9e9380] font-medium">Dias até 2027</div>
            <div className="depth-layer-3 font-mono-num text-2xl sm:text-3xl font-bold text-[#f3ead6]">
              {daysUntil2027 === 0
                ? 'Ano 2027'
                : `${daysUntil2027.toLocaleString('pt-BR')} dias`}
            </div>
            <div className="depth-layer-1 text-xs font-mono-num text-[#c59b27]">
              Virada 01/01/2027 · Herdeiro em {daysUntilHeir}d
            </div>
          </div>
        </div>

        {/* Métrica 2: Progresso Total do Patrimônio */}
        <div className="py-4 md:py-1 md:px-6 flex items-start gap-4">
          <div className="depth-layer-3 shrink-0">
            <ParchmentScrollIcon
              variant="wealth"
              className="w-12 h-12 sm:w-14 sm:h-14"
            />
          </div>
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="depth-layer-1 text-xs text-[#9e9380] font-medium">
              Progresso Total do Patrimônio
            </div>
            <div className="depth-layer-3 flex items-baseline justify-between gap-2">
              <span className="font-mono-num text-2xl sm:text-3xl font-bold text-emerald-400">
                {wealthPercent.toLocaleString('pt-BR', {
                  minimumFractionDigits: 1,
                  maximumFractionDigits: 1,
                })}
                %
              </span>
              <span className="text-[11px] font-mono-num text-[#9e9380] whitespace-nowrap">
                {completedVaults}/4 Arcas
              </span>
            </div>
            <div
              className="depth-layer-2 w-full h-2 bg-[#0e1013] rounded-sm overflow-hidden border border-white/10"
              role="progressbar"
              aria-valuenow={Math.round(wealthPercent)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Progresso total do patrimônio nas 4 Arcas"
            >
              <div
                className="h-full bg-gradient-to-r from-[#047857] via-[#10b981] to-[#e4c770] transition-all duration-300"
                style={{ width: `${Math.min(100, wealthPercent)}%` }}
              />
            </div>
            <div className="depth-layer-1 text-xs font-mono-num text-[#9e9380] truncate">
              {formatBRL(totalWealth)} de {formatBRL(totalTarget)}
            </div>
          </div>
        </div>

        {/* Métrica 3: Média de XP diário */}
        <div className="py-4 md:py-1 md:pl-6 flex items-start gap-4">
          <div className="depth-layer-3 shrink-0">
            <ParchmentScrollIcon
              variant="xp"
              className="w-12 h-12 sm:w-14 sm:h-14"
            />
          </div>
          <div className="min-w-0 space-y-1">
            <div className="depth-layer-1 text-xs text-[#9e9380] font-medium">Média de XP diário</div>
            <div className="depth-layer-3 font-mono-num text-2xl sm:text-3xl font-bold text-[#e4c770]">
              +{xpSummary.avgDailyXp.toLocaleString('pt-BR')} XP
            </div>
            <div className="depth-layer-1 text-xs font-mono-num text-[#9e9380]">
              Base 30d · {xpSummary.activeDays} {xpSummary.activeDays === 1 ? 'dia ativo' : 'dias ativos'} · Pico +{xpSummary.bestDayXp.toLocaleString('pt-BR')}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
