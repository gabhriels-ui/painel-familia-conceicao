import { useState } from 'react';
import { Eye, EyeOff, Plus, ShieldAlert, ShieldCheck, Trash2 } from 'lucide-react';
import type { RecurringCost, RecurringCostCategory } from '../types/chronicles';
import {
  ARCA1_TARGET,
  evaluateArca1CostRisk,
  formatBRL,
  parsePositiveAmount,
} from '../utils/formatters';

interface CostWatchPanelProps {
  box1: number;
  recurringCosts: RecurringCost[];
  onAddCost: (cost: Omit<RecurringCost, 'id'>) => void;
  onToggleCost: (costId: string) => void;
  onDeleteCost: (costId: string) => void;
}

const CATEGORY_LABELS: Record<RecurringCostCategory, string> = {
  mercado: 'Mercado',
  educacao: 'Escola / Educação',
  lar: 'Moradia / Lar',
  transporte: 'Transporte',
  outros: 'Outros',
};

export function CostWatchPanel({
  box1,
  recurringCosts,
  onAddCost,
  onToggleCost,
  onDeleteCost,
}: CostWatchPanelProps) {
  const [name, setName] = useState('');
  const [amountInput, setAmountInput] = useState('');
  const [category, setCategory] = useState<RecurringCostCategory>('mercado');
  const [dueDay, setDueDay] = useState('10');

  const risk = evaluateArca1CostRisk(box1, recurringCosts);
  const pressurePct = Math.min(100, risk.gapImpactPct);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const parsedAmount = parsePositiveAmount(amountInput);
    if (!trimmedName || parsedAmount === null || parsedAmount <= 0) return;
    const parsedDay = Math.max(1, Math.min(31, Math.floor(Number(dueDay) || 10)));

    onAddCost({
      name: trimmedName.slice(0, 80),
      amount: parsedAmount,
      category,
      dueDay: parsedDay,
      active: true,
    });

    setName('');
    setAmountInput('');
  };

  return (
    <section
      id="vigilia-de-custos"
      aria-label="Vigília de Custos Recorrentes"
      className="rpg-panel state-card p-5 sm:p-6 space-y-5"
      data-tilt-subtle="true"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <span className="depth-layer-1 text-xs font-epic text-[#eab308] flex items-center gap-1.5">
            {risk.level === 'safe' ? (
              <ShieldCheck className="w-4 h-4 text-emerald-400" aria-hidden="true" />
            ) : (
              <ShieldAlert
                className={`w-4 h-4 ${risk.level === 'critical' ? 'text-red-400' : 'text-[#fde047]'}`}
                aria-hidden="true"
              />
            )}
            <span>Vigília de Custos · Sentinela da Arca I</span>
          </span>
          <h3 className="depth-layer-2 font-epic text-lg sm:text-xl text-[#efe3c8] mt-0.5">
            Gastos Recorrentes da Família
          </h3>
          <p className="depth-layer-1 text-sm text-[#a89982]">
            Cadastre despesas mensais fixas (escola, mercado, contas). Se pressionarem a quitação da Arca I ({formatBRL(ARCA1_TARGET)}), o comando emitirá um alerta discreto no topo.
          </p>
        </div>

        <div className="depth-layer-3 parchment-box px-4 py-2.5 shrink-0 text-left sm:text-right">
          <div className="text-[11px] text-[#a89982]">Carga Mensal Vigente</div>
          <div className="font-mono-num text-lg font-bold text-[#eab308]">
            {formatBRL(risk.totalMonthly)}
          </div>
          <div className="text-[11px] font-mono-num text-[#a89982]">
            {risk.remainingArca1 === 0
              ? 'Arca I 100% blindada'
              : `${risk.gapImpactPct}% do restante da Arca I`}
          </div>
        </div>
      </div>

      {/* Medidor de Pressão sobre a Arca I */}
      {risk.activeCount > 0 && risk.remainingArca1 > 0 && (
        <div className="parchment-box p-3.5 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-semibold text-[#e7dcc6]">
              Pressão sobre o saldo restante da Arca I ({formatBRL(risk.remainingArca1)})
            </span>
            <span
              className={`font-mono-num font-bold ${
                risk.level === 'critical'
                  ? 'text-red-400'
                  : risk.level === 'warning'
                  ? 'text-[#e4c770]'
                  : 'text-emerald-400'
              }`}
            >
              {risk.level === 'critical'
                ? 'Risco Elevado'
                : risk.level === 'warning'
                ? 'Atenção na Muralha'
                : 'Sob Controle'}{' '}
              · {risk.gapImpactPct}%
            </span>
          </div>
          <div className="w-full h-2 bg-[#0d0f12] rounded-sm overflow-hidden border border-white/10">
            <div
              className={`h-full transition-all duration-300 ${
                risk.level === 'critical'
                  ? 'bg-gradient-to-r from-[#991b1b] to-[#ef4444]'
                  : risk.level === 'warning'
                  ? 'bg-gradient-to-r from-[#b45309] to-[#e4c770]'
                  : 'bg-gradient-to-r from-[#047857] to-[#10b981]'
              }`}
              style={{ width: `${pressurePct}%` }}
            />
          </div>
        </div>
      )}

      {/* Formulário de Cadastro */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
        <div className="sm:col-span-4 space-y-1">
          <label htmlFor="cost-name" className="block text-xs text-[#9e9380]">
            Nome do gasto recorrente
          </label>
          <input
            id="cost-name"
            type="text"
            maxLength={80}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Escola, Mercado..."
            className="w-full bg-[#0e1013] border border-white/15 focus:border-[#c59b27] focus:outline-none rounded-lg px-3 py-2 text-sm text-white placeholder:text-[#6d7179] min-h-[42px]"
          />
        </div>

        <div className="sm:col-span-3 space-y-1">
          <label htmlFor="cost-amount" className="block text-xs text-[#9e9380]">
            Valor mensal (R$)
          </label>
          <input
            id="cost-amount"
            type="text"
            inputMode="decimal"
            value={amountInput}
            onChange={(e) => setAmountInput(e.target.value)}
            placeholder="Ex: 1250,00"
            className="w-full bg-[#0e1013] border border-white/15 focus:border-[#c59b27] focus:outline-none rounded-lg px-3 py-2 text-sm font-mono-num text-white placeholder:text-[#6d7179] min-h-[42px]"
          />
        </div>

        <div className="sm:col-span-2 space-y-1">
          <label htmlFor="cost-category" className="block text-xs text-[#9e9380]">
            Frente
          </label>
          <select
            id="cost-category"
            value={category}
            onChange={(e) => setCategory(e.target.value as RecurringCostCategory)}
            className="w-full bg-[#0e1013] border border-white/15 focus:border-[#c59b27] focus:outline-none rounded-lg px-2.5 py-2 text-sm text-white min-h-[42px]"
          >
            {(Object.entries(CATEGORY_LABELS) as [RecurringCostCategory, string][]).map(
              ([val, label]) => (
                <option key={val} value={val}>
                  {label}
                </option>
              )
            )}
          </select>
        </div>

        <div className="sm:col-span-1 space-y-1">
          <label htmlFor="cost-due-day" className="block text-xs text-[#9e9380]">
            Dia
          </label>
          <input
            id="cost-due-day"
            type="number"
            min={1}
            max={31}
            value={dueDay}
            onChange={(e) => setDueDay(e.target.value)}
            className="w-full bg-[#0e1013] border border-white/15 focus:border-[#c59b27] focus:outline-none rounded-lg px-2.5 py-2 text-sm font-mono-num text-white min-h-[42px]"
          />
        </div>

        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={!name.trim() || !parsePositiveAmount(amountInput)}
            className="rpg-btn-gold w-full px-3.5 py-2 rounded-lg text-xs font-epic flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer min-h-[42px]"
          >
            <Plus className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Vigiar Custo</span>
          </button>
        </div>
      </form>

      {/* Lista de Custos Recorrentes */}
      {recurringCosts.length === 0 ? (
        <div className="parchment-box p-5 text-center space-y-1">
          <p className="text-sm font-semibold text-[#e7dcc6]">
            Nenhum gasto recorrente em vigília ainda.
          </p>
          <p className="text-xs text-[#9e9380]">
            Adicione despesas como Mercado ou Escola acima para monitorar automaticamente o impacto na meta da Arca I.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-white/10 max-h-72 overflow-y-auto pr-1">
          {recurringCosts.map((cost) => {
            const threatensArca1 =
              cost.active &&
              risk.remainingArca1 > 0 &&
              (cost.amount >= risk.remainingArca1 * 0.2 || cost.amount >= 1000);

            return (
              <div
                key={cost.id}
                className={`py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 ${
                  !cost.active ? 'opacity-60' : ''
                }`}
              >
                <div className="min-w-0 space-y-0.5">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <span className="font-semibold text-[#f3ead6] truncate">{cost.name}</span>
                    <span aria-hidden="true" className="text-[#6d7179]">·</span>
                    <span className="text-xs text-[#9e9380]">
                      {CATEGORY_LABELS[cost.category]}
                    </span>
                    <span aria-hidden="true" className="text-[#6d7179]">·</span>
                    <span className="text-xs font-mono-num text-[#9e9380]">
                      Venc. dia {String(cost.dueDay).padStart(2, '0')}
                    </span>
                    {threatensArca1 && (
                      <>
                        <span aria-hidden="true" className="text-[#6d7179]">·</span>
                        <span className="text-xs font-semibold text-[#e4c770]">
                          Pressiona Arca I
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0">
                  <span className="font-mono-num text-sm font-bold text-[#e4c770]">
                    {formatBRL(cost.amount)}/mês
                  </span>
                  <button
                    type="button"
                    onClick={() => onToggleCost(cost.id)}
                    aria-label={cost.active ? `Pausar vigília de ${cost.name}` : `Ativar vigília de ${cost.name}`}
                    title={cost.active ? 'Pausar vigília deste custo' : 'Reativar vigília deste custo'}
                    className={`px-2.5 py-1.5 rounded-md border text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors min-h-[36px] ${
                      cost.active
                        ? 'bg-[#121418] border-white/15 text-[#e7dcc6] hover:border-[#c59b27]'
                        : 'bg-[#0e1013] border-white/10 text-[#9e9380] hover:text-white'
                    }`}
                  >
                    {cost.active ? (
                      <Eye className="w-3.5 h-3.5 text-[#c59b27]" aria-hidden="true" />
                    ) : (
                      <EyeOff className="w-3.5 h-3.5" aria-hidden="true" />
                    )}
                    <span>{cost.active ? 'Ativo' : 'Pausado'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteCost(cost.id)}
                    aria-label={`Remover gasto ${cost.name}`}
                    className="text-[#848890] hover:text-red-400 p-1.5 rounded-md cursor-pointer transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                  >
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
