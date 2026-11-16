import { ArrowRight, ShieldAlert, X } from 'lucide-react';
import { formatBRL, type Arca1CostRisk } from '../utils/formatters';

interface CostWatchBannerProps {
  risk: Arca1CostRisk;
  onInspectCosts: () => void;
  onDismiss: () => void;
}

export function CostWatchBanner({
  risk,
  onInspectCosts,
  onDismiss,
}: CostWatchBannerProps) {
  if (risk.level === 'safe' || !risk.topCost) return null;

  const isCritical = risk.level === 'critical';

  return (
    <div
      role="status"
      aria-live="polite"
      className={`drawer-expand rounded-xl border px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 backdrop-blur-sm ${
        isCritical
          ? 'bg-[#221214]/90 border-[#b93838]/55 text-[#f7d8d8]'
          : 'bg-[#1e1710]/90 border-[#c59b27]/40 text-[#efe3c8]'
      }`}
    >
      <div className="flex items-start sm:items-center gap-3 min-w-0">
        <ShieldAlert
          className={`w-4 h-4 shrink-0 mt-0.5 sm:mt-0 ${
            isCritical ? 'text-red-400' : 'text-[#e4c770]'
          }`}
          aria-hidden="true"
        />
        <p className="text-xs sm:text-sm leading-snug min-w-0">
          <span className="font-semibold text-[#f3ead6]">Vigília de Custos · </span>
          {risk.activeCount === 1 ? (
            <>
              O gasto recorrente <strong className="text-[#e4c770]">{risk.topCost.name}</strong> (
              <span className="font-mono-num">{formatBRL(risk.topCost.amount)}/mês</span>) equivale a{' '}
              <span className="font-mono-num font-semibold">{risk.gapImpactPct}%</span> do restante da Arca I (
              <span className="font-mono-num">{formatBRL(risk.remainingArca1)}</span>).
            </>
          ) : (
            <>
              <strong className="text-[#e4c770]">{risk.topCost.name}</strong> (
              <span className="font-mono-num">{formatBRL(risk.topCost.amount)}</span>) e seus{' '}
              {risk.activeCount} custos ativos somam{' '}
              <span className="font-mono-num font-semibold">{formatBRL(risk.totalMonthly)}/mês</span> — perto de
              comprometer a meta restante da Arca I (
              <span className="font-mono-num">{formatBRL(risk.remainingArca1)}</span>).
            </>
          )}
        </p>
      </div>

      <div className="flex items-center justify-end gap-2 shrink-0">
        <button
          type="button"
          onClick={onInspectCosts}
          className="px-3 py-1.5 rounded-lg bg-[#121418]/90 border border-white/15 hover:border-[#c59b27] text-xs font-semibold text-[#e4c770] flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-colors min-h-[36px]"
        >
          <span>Revisar Custos</span>
          <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Ocultar aviso da vigília de custos"
          className="p-1.5 rounded-lg text-[#9e9380] hover:text-white cursor-pointer transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
