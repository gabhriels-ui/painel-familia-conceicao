import { useState } from 'react';
import { CalendarClock, Coins, PieChart, Plus, Search, Sprout, Trash2 } from 'lucide-react';
import { VAULTS } from '../data/chroniclesData';
import type { AppState, RecurringCost, VaultId } from '../types/chronicles';
import { estimateVaultConquest, formatBRL, parsePositiveAmount } from '../utils/formatters';
import { CostWatchPanel } from './CostWatchPanel';
import { VaultChestSvg } from './Crests';

interface TreasureTabProps {
  state: AppState;
  onUpdateVault: (vaultId: VaultId, amount: number, mode: 'deposit' | 'set') => void;
  onHarvestCdi: (amount: number) => void;
  onDeleteTransaction: (entryId: string) => void;
  onAddRecurringCost: (cost: Omit<RecurringCost, 'id'>) => void;
  onToggleRecurringCost: (costId: string) => void;
  onDeleteRecurringCost: (costId: string) => void;
}

const VAULT_COLORS: Record<VaultId, { stroke: string; bar: string; dot: string }> = {
  1: { stroke: '#991b1b', bar: 'bg-[#991b1b]', dot: 'bg-[#991b1b]' },
  2: { stroke: '#059669', bar: 'bg-emerald-600', dot: 'bg-emerald-600' },
  3: { stroke: '#c59b27', bar: 'bg-[#c59b27]', dot: 'bg-[#c59b27]' },
  4: { stroke: '#3b82f6', bar: 'bg-blue-500', dot: 'bg-blue-500' },
};

export function TreasureTab({
  state,
  onUpdateVault,
  onHarvestCdi,
  onDeleteTransaction,
  onAddRecurringCost,
  onToggleRecurringCost,
  onDeleteRecurringCost,
}: TreasureTabProps) {
  const [inputs, setInputs] = useState<Record<VaultId, string>>({
    1: '',
    2: '',
    3: '',
    4: '',
  });
  const [modes, setModes] = useState<Record<VaultId, 'deposit' | 'set'>>({
    1: 'deposit',
    2: 'deposit',
    3: 'deposit',
    4: 'deposit',
  });
  const [cdiInput, setCdiInput] = useState('');
  const [txFilter, setTxFilter] = useState<'all' | VaultId | 'cdi'>('all');
  const [txSearch, setTxSearch] = useState('');

  const handleVaultSubmit = (vaultId: VaultId) => {
    const parsed = parsePositiveAmount(inputs[vaultId]);
    if (parsed === null) return;
    if (modes[vaultId] === 'deposit' && parsed <= 0) return;
    onUpdateVault(vaultId, parsed, modes[vaultId]);
    setInputs((prev) => ({ ...prev, [vaultId]: '' }));
  };

  const handleCdiSubmit = () => {
    const parsed = parsePositiveAmount(cdiInput);
    if (parsed === null || parsed <= 0) return;
    onHarvestCdi(parsed);
    setCdiInput('');
  };

  const getVaultBalance = (id: VaultId): number => {
    if (id === 1) return state.box1 || 0;
    if (id === 2) return state.box2 || 0;
    if (id === 3) return state.box3 || 0;
    return state.box4 || 0;
  };

  const totalWealth =
    (state.box1 || 0) + (state.box2 || 0) + (state.box3 || 0) + (state.box4 || 0);

  // Pure SVG Donut Chart geometry
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  let accumulatedOffset = 0;

  const donutSegments = VAULTS.map((vault) => {
    const value = getVaultBalance(vault.id);
    const share = totalWealth > 0 ? value / totalWealth : 0;
    const dashLength = share * circumference;
    const segmentOffset = accumulatedOffset;
    accumulatedOffset += dashLength;
    return {
      vault,
      value,
      sharePct: totalWealth > 0 ? Math.round(share * 1000) / 10 : 0,
      dashLength,
      segmentOffset,
      color: VAULT_COLORS[vault.id],
    };
  });

  const filteredTransactions = (state.transactions || []).filter((tx) => {
    const matchesFilter = txFilter === 'all' || tx.vaultId === txFilter;
    const matchesSearch =
      !txSearch.trim() ||
      tx.vaultName.toLowerCase().includes(txSearch.trim().toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const nubankTotal = (state.box2 || 0) + (state.box3 || 0) + (state.box4 || 0);

  return (
    <div className="space-y-6">
      {/* Separação Bancária Estratégica (Mercado Pago, Caixa, Nubank · 4 Caixinhas) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rpg-panel state-card p-4 flex flex-col justify-between gap-2">
          <div className="depth-layer-1 flex items-center justify-between text-xs text-[#a89982]">
            <span className="font-epic text-[#eab308]">Frente I · Mercado Pago</span>
            <span>Crédito & Quitação</span>
          </div>
          <div className="depth-layer-3 font-mono-num text-xl font-bold text-[#efe3c8]">
            {formatBRL(state.box1 || 0)}
          </div>
          <div className="depth-layer-2 text-xs text-[#a89982]">
            Arca I dedicada à quitação dos R$ 6.829,00 sem juros rotativos.
          </div>
        </div>

        <div className="rpg-panel state-card p-4 flex flex-col justify-between gap-2">
          <div className="depth-layer-1 flex items-center justify-between text-xs text-[#a89982]">
            <span className="font-epic text-[#eab308]">Frente II · Caixa</span>
            <span>Débito Dia 03</span>
          </div>
          <div className="depth-layer-3 font-mono-num text-xl font-bold text-amber-300">
            R$ 616,88 <span className="text-xs font-normal text-[#a89982]">/ mês</span>
          </div>
          <div className="depth-layer-2 text-xs text-[#a89982]">
            Financiamento da casa própria protegido antes de qualquer aporte.
          </div>
        </div>

        <div className="rpg-panel state-card p-4 flex flex-col justify-between gap-2">
          <div className="depth-layer-1 flex items-center justify-between text-xs text-[#a89982]">
            <span className="font-epic text-emerald-400">Frente III · Nubank</span>
            <span>Caixinhas & CDI</span>
          </div>
          <div className="depth-layer-3 font-mono-num text-xl font-bold text-emerald-400">
            {formatBRL(nubankTotal)}
          </div>
          <div className="depth-layer-2 text-xs font-mono-num text-[#a89982]">
            Arcas II, III e IV · CDI colhido: {formatBRL(state.cdiTotal || 0)}
          </div>
        </div>
      </div>

      <div className="rpg-panel p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-[#3a3f45]">
          <div>
            <span className="text-xs font-epic text-[#eab308]">Câmara do Tesouro de Guerra</span>
            <h2 className="font-epic text-xl text-[#efe3c8]">4 Arcas de Ouro e Reservas</h2>
          </div>
          <span className="text-xs text-[#a89982]">
            Registro automático salvo no dispositivo e na nuvem
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-5">
          {VAULTS.map((vault) => {
            const currentVal = getVaultBalance(vault.id);
            const pct = Math.min(100, Math.round((currentVal / vault.target) * 100));
            const remaining = Math.max(0, vault.target - currentVal);
            const mode = modes[vault.id];
            const projection = estimateVaultConquest(
              vault.id,
              currentVal,
              vault.target,
              state.transactions || []
            );

            return (
              <div key={vault.id} className="parchment-box state-card p-5 flex flex-col justify-between gap-4">
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="depth-layer-3 shrink-0 mt-0.5">
                        <VaultChestSvg
                          vaultId={vault.id}
                          className="w-11 h-11"
                          breatheDelayMs={(vault.id - 1) * 420}
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="depth-layer-1 text-xs font-semibold text-[#c59b27]">
                          {vault.roman} · {vault.isLongTerm ? 'Longo Prazo' : `${pct}% concluído`}
                        </div>
                        <h3 className="depth-layer-2 font-epic text-base sm:text-lg text-[#f3ead6] mt-0.5">
                          {vault.title}
                        </h3>
                      </div>
                    </div>
                    <div className="depth-layer-3 text-right shrink-0">
                      <div className="font-mono-num text-lg sm:text-xl font-bold text-[#dfc168]">
                        {formatBRL(currentVal)}
                      </div>
                      <div className="text-xs font-mono-num text-[#a69982]">
                        {remaining === 0
                          ? 'Meta atingida'
                          : `Faltam ${formatBRL(remaining)}`}
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-[#c7b8a0]">{vault.subtitle}</p>

                  <div
                    className="w-full h-2.5 bg-[#111214] rounded-sm overflow-hidden border border-[#3a3f45]"
                    role="progressbar"
                    aria-valuenow={pct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`Progresso ${vault.roman}`}
                  >
                    <div
                      className={`h-full transition-all duration-300 progress-sheen ${
                        pct >= 100
                          ? 'bg-gradient-to-r from-[#047857] to-[#10b981]'
                          : 'bg-gradient-to-r from-[#7d5d28] via-[#c59b27] to-[#dfc168]'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="text-xs font-mono-num text-[#a69982]">
                    {vault.priorityLabel}
                  </div>
                  <div
                    className={`mt-1 flex items-start gap-2 rounded border px-2.5 py-2 text-xs ${
                      projection.status === 'achieved'
                        ? 'bg-emerald-950/35 border-emerald-600/45 text-emerald-300'
                        : projection.status === 'ready'
                          ? 'bg-[#141517]/85 border-[#c59b27]/40 text-[#dfc168]'
                          : 'bg-[#141517]/75 border-[#3a3f45] text-[#a69982]'
                    }`}
                  >
                    <CalendarClock className="w-3.5 h-3.5 mt-0.5 shrink-0" aria-hidden="true" />
                    <div className="min-w-0 leading-snug">
                      <span className="font-semibold">Previsto para: </span>
                      <span className="font-mono-num font-bold">{projection.dateText}</span>
                      <div className="text-[11px] font-mono-num opacity-80 mt-0.5">
                        {projection.detailText}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5 pt-2 border-t border-[#7d5d28]/30">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="inline-flex rounded-lg bg-[#0e1013] p-1 border border-white/10">
                      <button
                        type="button"
                        onClick={() => setModes((p) => ({ ...p, [vault.id]: 'deposit' }))}
                        className={`px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-colors min-h-[34px] whitespace-nowrap ${
                          mode === 'deposit'
                            ? 'bg-[#c59b27] text-[#101215]'
                            : 'text-[#9e9380] hover:text-white'
                        }`}
                      >
                        Depositar (+)
                      </button>
                      <button
                        type="button"
                        onClick={() => setModes((p) => ({ ...p, [vault.id]: 'set' }))}
                        className={`px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-colors min-h-[34px] whitespace-nowrap ${
                          mode === 'set'
                            ? 'bg-[#c59b27] text-[#101215]'
                            : 'text-[#9e9380] hover:text-white'
                        }`}
                      >
                        Definir Saldo (=)
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onUpdateVault(vault.id, 100, 'deposit')}
                        className="rpg-btn-iron px-3 py-1.5 rounded-md text-xs font-mono-num cursor-pointer min-h-[36px]"
                      >
                        +100
                      </button>
                      <button
                        type="button"
                        onClick={() => onUpdateVault(vault.id, 500, 'deposit')}
                        className="rpg-btn-iron px-3 py-1.5 rounded-md text-xs font-mono-num cursor-pointer min-h-[36px]"
                      >
                        +500
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <label htmlFor={`vault-input-${vault.id}`} className="sr-only">
                      Valor em reais para {vault.title}
                    </label>
                    <input
                      id={`vault-input-${vault.id}`}
                      type="text"
                      inputMode="decimal"
                      value={inputs[vault.id]}
                      onChange={(e) =>
                        setInputs((prev) => ({ ...prev, [vault.id]: e.target.value }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleVaultSubmit(vault.id);
                      }}
                      placeholder={
                        mode === 'deposit' ? 'Ex: 350,00' : 'Novo saldo total...'
                      }
                      className="flex-1 min-w-0 bg-[#111214] border border-[#3a3f45] focus:border-[#c59b27] focus:outline-none rounded px-3 py-2 text-sm font-mono-num text-white placeholder:text-[#6f7279] min-h-[42px]"
                    />
                    <button
                      type="button"
                      onClick={() => handleVaultSubmit(vault.id)}
                      className="rpg-btn-gold px-4 py-2 rounded text-xs sm:text-sm font-epic flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer min-h-[42px]"
                    >
                      <Plus className="w-4 h-4 shrink-0" aria-hidden="true" />
                      <span>{mode === 'deposit' ? 'Guardar' : 'Ajustar'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Gráfico de Distribuição Patrimonial em SVG Puro + Colheita CDI */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <section className="lg:col-span-7 rpg-panel state-card p-5 sm:p-6 flex flex-col justify-between gap-5" data-tilt-subtle="true">
          <div className="flex items-center justify-between gap-2 border-b border-[#3a3f45] pb-3.5">
            <div>
              <span className="depth-layer-1 text-xs font-epic text-[#c59b27] flex items-center gap-1.5">
                <PieChart className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Distribuição Patrimonial</span>
              </span>
              <h3 className="depth-layer-2 font-epic text-lg text-[#f3ead6] mt-0.5">
                Participação de Cada Arca no Total
              </h3>
            </div>
            <div className="depth-layer-3 text-right">
              <div className="text-xs text-[#a69982]">Patrimônio nas Arcas</div>
              <div className="font-mono-num text-base font-bold text-[#dfc168]">
                {formatBRL(totalWealth)}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
            <div className="depth-layer-3 sm:col-span-5 flex items-center justify-center">
              <svg
                viewBox="0 0 160 160"
                className="w-44 h-44"
                role="img"
                aria-label="Gráfico de rosca da distribuição patrimonial entre as quatro arcas"
              >
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  fill="none"
                  stroke="#181a1d"
                  strokeWidth="18"
                />
                {totalWealth > 0 &&
                  donutSegments.map((seg) =>
                    seg.dashLength > 0 ? (
                      <circle
                        key={seg.vault.id}
                        cx="80"
                        cy="80"
                        r={radius}
                        fill="none"
                        stroke={seg.color.stroke}
                        strokeWidth="18"
                        strokeDasharray={`${seg.dashLength} ${circumference}`}
                        strokeDashoffset={-seg.segmentOffset}
                        transform="rotate(-90 80 80)"
                        className="transition-all duration-500"
                      />
                    ) : null
                  )}
                <text
                  x="80"
                  y="74"
                  textAnchor="middle"
                  className="fill-[#a69982] text-[9px] font-semibold"
                >
                  TOTAL
                </text>
                <text
                  x="80"
                  y="92"
                  textAnchor="middle"
                  className="fill-[#dfc168] text-[12px] font-bold font-mono-num"
                >
                  {totalWealth > 0
                    ? formatBRL(totalWealth).replace(/\s/g, '')
                    : 'R$0,00'}
                </text>
              </svg>
            </div>

            <div className="sm:col-span-7 space-y-3">
              {donutSegments.map((seg) => (
                <div key={seg.vault.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs gap-2">
                    <span className="flex items-center gap-2 text-[#e4d7be] font-semibold truncate">
                      <span
                        aria-hidden="true"
                        className={`w-2.5 h-2.5 rounded-sm shrink-0 ${seg.color.dot}`}
                      />
                      <span className="truncate">
                        {seg.vault.roman} · {seg.vault.title}
                      </span>
                    </span>
                    <span className="font-mono-num text-[#dfc168] shrink-0">
                      {seg.sharePct.toFixed(1)}% · {formatBRL(seg.value)}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[#111214] rounded-sm overflow-hidden border border-[#3a3f45]">
                    <div
                      className={`h-full transition-all duration-500 ${seg.color.bar}`}
                      style={{ width: `${seg.sharePct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="lg:col-span-5 rpg-panel state-card p-5 sm:p-6 flex flex-col justify-between gap-4">
          <div className="space-y-2">
            <div className="depth-layer-1 flex items-center gap-2 text-xs font-epic text-emerald-400">
              <Sprout className="w-4 h-4" aria-hidden="true" />
              <span>Colheita dos Rendimentos</span>
            </div>
            <h3 className="depth-layer-2 font-epic text-lg text-[#f3ead6]">CDI Mensal para a Muralha</h3>
            <p className="depth-layer-1 text-sm text-[#c7b8a0] leading-relaxed">
              Lance os juros compostos recebidos no mês. O valor é somado ao histórico de colheitas, registrado no extrato e adicionado à <strong className="text-[#dfc168]">Arca II · Muralha da Família</strong>.
            </p>
          </div>

          <div className="depth-layer-2 space-y-3">
            <div className="parchment-box p-3.5 flex items-center justify-between">
              <span className="text-xs text-[#a69982]">Total Colhido até Hoje</span>
              <span className="depth-layer-3 font-mono-num text-base font-bold text-emerald-400">
                {formatBRL(state.cdiTotal || 0)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="cdi-harvest-input" className="sr-only">
                Rendimento CDI recebido em reais
              </label>
              <input
                id="cdi-harvest-input"
                type="text"
                inputMode="decimal"
                value={cdiInput}
                onChange={(e) => setCdiInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCdiSubmit();
                }}
                placeholder="Ex: 142,80"
                className="flex-1 min-w-0 bg-[#111214] border border-[#3a3f45] focus:border-emerald-500 focus:outline-none rounded px-3 py-2 text-sm font-mono-num text-white placeholder:text-[#6f7279] min-h-[42px]"
              />
              <button
                type="button"
                onClick={handleCdiSubmit}
                className="rpg-btn-gold px-4 py-2 rounded text-xs sm:text-sm font-epic flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer min-h-[42px]"
              >
                <Coins className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Colher Ouro</span>
              </button>
            </div>
          </div>
        </section>
      </div>

      <CostWatchPanel
        box1={state.box1 || 0}
        recurringCosts={state.recurringCosts || []}
        onAddCost={onAddRecurringCost}
        onToggleCost={onToggleRecurringCost}
        onDeleteCost={onDeleteRecurringCost}
      />

      {/* Extrato de Movimentações */}
      <section className="rpg-panel p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#3a3f45] pb-4">
          <div>
            <span className="text-xs font-epic text-[#c59b27]">
              Auditoria do Tesouro
            </span>
            <h3 className="font-epic text-lg text-[#f3ead6]">
              Extrato de Movimentações
            </h3>
          </div>

          <div className="relative w-full sm:w-64">
            <Search
              className="w-4 h-4 text-[#a69982] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              value={txSearch}
              onChange={(e) => setTxSearch(e.target.value)}
              placeholder="Buscar por arca..."
              className="w-full bg-[#111214] border border-[#3a3f45] focus:border-[#c59b27] focus:outline-none rounded pl-9 pr-3 py-1.5 text-sm text-white placeholder:text-[#6f7279] min-h-[38px]"
            />
          </div>
        </div>

        <div className="inline-flex flex-wrap items-center gap-1 p-1 rounded-lg bg-[#0e1013] border border-white/10">
          {(
            [
              { id: 'all', label: 'Todas' },
              { id: 1, label: 'Arca I' },
              { id: 2, label: 'Arca II' },
              { id: 3, label: 'Arca III' },
              { id: 4, label: 'Arca IV' },
              { id: 'cdi', label: 'CDI' },
            ] as const
          ).map((f) => (
            <button
              key={String(f.id)}
              type="button"
              onClick={() => setTxFilter(f.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-colors min-h-[36px] whitespace-nowrap shrink-0 ${
                txFilter === f.id
                  ? 'bg-[#c59b27] text-[#101215]'
                  : 'text-[#9e9380] hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="parchment-box p-6 text-center space-y-1">
            <p className="text-sm font-semibold text-[#e4d7be]">
              Nenhuma movimentação registrada neste filtro.
            </p>
            <p className="text-xs text-[#a69982]">
              Atualize o saldo de qualquer Arca ou colha rendimentos CDI para registrar data, valor anterior, novo valor e diferença.
            </p>
          </div>
        ) : (
          <div className="max-h-72 overflow-y-auto pr-1 divide-y divide-[#3a3f45]/70">
            {filteredTransactions.map((tx) => {
              const isPositive = tx.difference >= 0;
              const diffFormatted = `${isPositive ? '+' : '-'}${formatBRL(
                Math.abs(tx.difference)
              )}`;
              return (
                <div
                  key={tx.id}
                  className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm"
                >
                  <div className="min-w-0 space-y-0.5">
                    <div className="font-semibold text-[#dfc168] truncate">
                      {tx.vaultName}
                    </div>
                    <div className="text-xs font-mono-num text-[#a69982]">
                      {new Date(tx.dateIso).toLocaleString('pt-BR', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}{' '}
                      · Anterior: {formatBRL(tx.previousValue)} → Novo:{' '}
                      {formatBRL(tx.newValue)}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                    <span
                      className={`font-mono-num font-bold ${
                        isPositive ? 'text-emerald-400' : 'text-red-400'
                      }`}
                    >
                      {diffFormatted}
                    </span>
                    <button
                      type="button"
                      onClick={() => onDeleteTransaction(tx.id)}
                      aria-label={`Remover movimentação de ${tx.vaultName}`}
                      className="text-[#848890] hover:text-red-400 p-1.5 rounded cursor-pointer transition-colors"
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
    </div>
  );
}
