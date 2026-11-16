import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Coins,
  Loader2,
  ScrollText,
  Send,
  ShieldAlert,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import type {
  AppState,
  TacticalExpenseClassification,
  TacticalExpenseEntry,
} from '../types/chronicles';
import { formatBRL } from '../utils/formatters';

interface TacticalExpenseChatProps {
  state: AppState;
  enemyFrontBanner: TacticalExpenseEntry | null;
  onDismissEnemyFront: () => void;
  onRecordExpense: (entry: TacticalExpenseEntry) => void;
  onDeleteExpense: (id: string) => void;
}

interface QuickExample {
  label: string;
  text: string;
}

const QUICK_EXAMPLES: QuickExample[] = [
  {
    label: 'Açaí fora do plano',
    text: 'Gastei R$ 80 hoje com açaí fora do plano',
  },
  {
    label: 'Compra de mês',
    text: 'Gastei R$ 350 na compra de mês',
  },
  {
    label: 'Estacionamento no serviço',
    text: 'Paguei R$ 22 de estacionamento no serviço',
  },
];

interface TacticalApiResponse {
  classification: TacticalExpenseClassification;
  categoryLabel: string;
  itemDescription: string;
  amount: number;
  xpDelta: number;
  streakReset: boolean;
  tacticalReply: string;
  error?: string;
}

function getVerdictMeta(classification: TacticalExpenseClassification) {
  if (classification === 'impulso') {
    return {
      verdictTitle: 'INIMIGO NO FRONT · BRECHA DE IMPULSO',
      borderClass: 'border-red-700/60 bg-red-950/25',
      titleColor: 'text-red-300',
      xpColor: 'text-red-400',
      icon: 'alert' as const,
    };
  }
  if (classification === 'suprimento') {
    return {
      verdictTitle: 'SUPRIMENTO PREVISTO · TROPA REFORÇADA',
      borderClass: 'border-emerald-700/45 bg-emerald-950/20',
      titleColor: 'text-emerald-300',
      xpColor: 'text-emerald-400',
      icon: 'supply' as const,
    };
  }
  return {
    verdictTitle: 'CONTA OPERACIONAL · LANÇAMENTO COMUM',
    borderClass: 'border-[#c59b27]/35 bg-[#191611]',
    titleColor: 'text-[#e4c770]',
    xpColor: 'text-[#dfc168]',
    icon: 'common' as const,
  };
}

export function TacticalExpenseChat({
  state,
  enemyFrontBanner,
  onDismissEnemyFront,
  onRecordExpense,
  onDeleteExpense,
}: TacticalExpenseChatProps) {
  const [input, setInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const scrollFeedRef = useRef<HTMLDivElement>(null);

  const expenses = state.tacticalExpenses || [];

  // Conversa em ordem cronológica (mais recente embaixo)
  const chronologicalFeed = useMemo(() => [...expenses].reverse(), [expenses]);

  const operationalSummary = useMemo(() => {
    let totalAmount = 0;
    let supplyAmount = 0;
    let impulseAmount = 0;
    let impulseCount = 0;

    for (const item of expenses) {
      const val = Number(item.amount || 0);
      totalAmount += val;
      if (item.classification === 'suprimento') supplyAmount += val;
      if (item.classification === 'impulso') {
        impulseAmount += val;
        impulseCount += 1;
      }
    }

    return {
      totalAmount,
      supplyAmount,
      impulseAmount,
      impulseCount,
    };
  }, [expenses]);

  useEffect(() => {
    const el = scrollFeedRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [chronologicalFeed.length, submitting]);

  const submitReport = async (rawText: string) => {
    const message = rawText.trim();
    if (!message || submitting) return;

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/tactical-expense', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          context: {
            xp: state.xp,
            streak: state.streak,
            box1: state.box1,
          },
        }),
      });

      const payload = (await res.json()) as TacticalApiResponse;
      if (!res.ok) {
        setErrorMsg(
          payload.error || 'Falha ao consultar o Oficial de Inteligência Tática.'
        );
        return;
      }

      const entry: TacticalExpenseEntry = {
        id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        userReport: message,
        classification: payload.classification,
        categoryLabel: payload.categoryLabel,
        itemDescription: payload.itemDescription,
        amount: Number(payload.amount || 0),
        xpDelta: Number(payload.xpDelta || 0),
        streakReset: Boolean(payload.streakReset),
        tacticalReply: payload.tacticalReply,
        dateIso: new Date().toISOString(),
      };

      setInput('');
      onRecordExpense(entry);
    } catch {
      setErrorMsg(
        'Sem comunicação com o posto avançado de IA. Verifique sua conexão e tente novamente.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void submitReport(input);
  };

  return (
    <section
      className="rpg-panel state-card p-5 sm:p-6 space-y-5"
      data-tilt-subtle="true"
      aria-labelledby="tactical-expense-chat-heading"
    >
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 pb-4 border-b border-white/10">
        <div className="space-y-1.5">
          <div className="depth-layer-1 flex items-center gap-2 text-xs font-epic text-[#c59b27]">
            <ScrollText className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Estado-Maior Financeiro · Análise por IA</span>
          </div>
          <h2
            id="tactical-expense-chat-heading"
            className="depth-layer-2 font-epic text-lg sm:text-xl text-[#f3ead6]"
          >
            Inteligência Tática • Registro Diário de Gastos
          </h2>
          <p className="depth-layer-1 text-sm text-[#9e9380] max-w-2xl">
            Relate livremente qualquer despesa do dia. A Inteligência julga se é{' '}
            <span className="text-emerald-400 font-semibold">Suprimento Previsto (+80 XP)</span>,{' '}
            <span className="text-[#dfc168] font-semibold">Lançamento Comum (+25 XP)</span> ou{' '}
            <span className="text-red-400 font-semibold">Impulso Fora do Plano (-150 XP e zera sequência)</span>.
          </p>
        </div>

        <div className="depth-layer-3 grid grid-cols-3 gap-4 sm:gap-6 shrink-0 pt-1 lg:pt-0">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-[#9e9380]">
              Conta Operacional
            </div>
            <div className="font-mono-num text-base sm:text-lg font-bold text-[#f3ead6]">
              {formatBRL(operationalSummary.totalAmount)}
            </div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider text-emerald-400/80">
              Suprimentos
            </div>
            <div className="font-mono-num text-base sm:text-lg font-bold text-emerald-400">
              {formatBRL(operationalSummary.supplyAmount)}
            </div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider text-red-400/85">
              Impulsos ({operationalSummary.impulseCount})
            </div>
            <div className="font-mono-num text-base sm:text-lg font-bold text-red-400">
              {formatBRL(operationalSummary.impulseAmount)}
            </div>
          </div>
        </div>
      </div>

      {enemyFrontBanner && (
        <div
          role="alert"
          className="rounded-lg border border-red-600/80 bg-gradient-to-r from-[#3f0909]/90 via-[#2a0707]/95 to-[#1d0707]/95 p-4 flex items-start justify-between gap-3 shadow-[0_0_28px_rgba(185,28,28,0.38)]"
        >
          <div className="flex items-start gap-3 min-w-0">
            <ShieldAlert
              className="w-6 h-6 text-red-400 shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <div className="space-y-1 min-w-0">
              <div className="font-epic text-sm sm:text-base text-red-200 tracking-wide">
                INIMIGO NO FRONT! BRECHA NA MURALHA
              </div>
              <p className="text-sm text-red-100/90 leading-snug">
                <span className="font-semibold">{enemyFrontBanner.itemDescription}</span>{' '}
                {enemyFrontBanner.amount > 0 && (
                  <span className="font-mono-num text-red-200">
                    ({formatBRL(enemyFrontBanner.amount)})
                  </span>
                )}{' '}
                foi classificado como gasto por impulso:{' '}
                <span className="font-mono-num font-bold text-red-300">-150 XP</span> e{' '}
                <span className="font-semibold text-amber-300">
                  contador de dias invictos zerado (0 dias)
                </span>
                .
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onDismissEnemyFront}
            aria-label="Dispensar alerta de Inimigo no Front"
            className="p-2 rounded text-red-200/80 hover:text-white hover:bg-red-900/50 cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center shrink-0"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      )}

      <div
        ref={scrollFeedRef}
        className="parchment-box p-4 space-y-4 max-h-[380px] overflow-y-auto"
        aria-live="polite"
      >
        {chronologicalFeed.length === 0 ? (
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#251f14] border border-[#c59b27]/40 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-[#dfc168]" aria-hidden="true" />
            </div>
            <div className="space-y-1.5 text-sm text-[#e4d7be] leading-relaxed">
              <div className="text-xs font-epic text-[#c59b27]">
                Oficial de Inteligência Tática · Aguardando Relatório
              </div>
              <p>
                Comandante Gabriel, envie seu relatório diário abaixo. Exemplos: “Gastei R$ 80
                hoje com açaí fora do plano” ou “Gastei R$ 350 na compra de mês”. Cada moeda
                presta contas à Fortaleza.
              </p>
            </div>
          </div>
        ) : (
          chronologicalFeed.map((entry) => {
            const meta = getVerdictMeta(entry.classification);
            const dateLabel = new Date(entry.dateIso).toLocaleString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div key={entry.id} className="space-y-2.5">
                {/* Mensagem do Comandante */}
                <div className="flex justify-end">
                  <div className="max-w-[88%] sm:max-w-[78%] rounded-lg bg-[#23272e] border border-white/10 px-3.5 py-2.5 space-y-1">
                    <div className="flex items-center justify-between gap-3 text-[11px] text-[#9e9380]">
                      <span className="font-semibold text-[#dfc168]">Comandante Gabriel</span>
                      <span className="font-mono-num">{dateLabel}</span>
                    </div>
                    <p className="text-sm text-[#f3ead6] leading-snug">{entry.userReport}</p>
                  </div>
                </div>

                {/* Resposta do Oficial de Inteligência */}
                <div className="flex justify-start">
                  <div
                    className={`max-w-[94%] sm:max-w-[85%] rounded-lg border px-4 py-3 space-y-2 ${meta.borderClass}`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className={`flex items-center gap-1.5 text-xs font-epic ${meta.titleColor}`}>
                        {meta.icon === 'alert' && (
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                        )}
                        {meta.icon === 'supply' && (
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                        )}
                        {meta.icon === 'common' && (
                          <Coins className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                        )}
                        <span>{meta.verdictTitle}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`font-mono-num text-xs font-bold ${meta.xpColor}`}>
                          {entry.xpDelta >= 0 ? `+${entry.xpDelta}` : entry.xpDelta} XP
                        </span>
                        <button
                          type="button"
                          onClick={() => onDeleteExpense(entry.id)}
                          aria-label={`Excluir registro: ${entry.itemDescription}`}
                          className="p-1.5 rounded text-[#9e9380] hover:text-red-300 hover:bg-red-950/40 transition-colors cursor-pointer min-h-[32px] min-w-[32px] flex items-center justify-center"
                        >
                          <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                      </div>
                    </div>

                    <p className="text-sm text-[#ece0c8] leading-relaxed">
                      {entry.tacticalReply}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 border-t border-white/10 text-xs font-mono-num text-[#a69982]">
                      <span>Categoria: {entry.categoryLabel}</span>
                      <span>
                        Impacto:{' '}
                        <strong className="text-[#f3ead6]">
                          {entry.amount > 0 ? formatBRL(entry.amount) : 'Sem valor informado'}
                        </strong>
                      </span>
                      {entry.streakReset && (
                        <span className="text-red-300 font-semibold">
                          Sequência Invicta Zerada
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}

        {submitting && (
          <div className="flex items-center gap-2.5 text-sm text-[#dfc168] pt-1">
            <Loader2 className="w-4 h-4 animate-spin shrink-0" aria-hidden="true" />
            <span>Oficial de Inteligência inspecionando relatório de campo...</span>
          </div>
        )}
      </div>

      {errorMsg && (
        <div
          role="alert"
          className="rounded-lg border border-red-700/60 bg-red-950/35 px-4 py-2.5 text-sm text-red-200 flex items-center justify-between gap-3"
        >
          <span>{errorMsg}</span>
          <button
            type="button"
            onClick={() => setErrorMsg(null)}
            className="text-xs text-red-300 hover:text-white cursor-pointer underline shrink-0"
          >
            Fechar
          </button>
        </div>
      )}

      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-[#9e9380]">Atalhos de relatório:</span>
          {QUICK_EXAMPLES.map((ex) => (
            <button
              key={ex.label}
              type="button"
              disabled={submitting}
              onClick={() => setInput(ex.text)}
              className="rpg-btn-iron px-3 py-1.5 rounded text-xs font-semibold cursor-pointer min-h-[36px] disabled:opacity-50"
            >
              {ex.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleFormSubmit} className="flex flex-col sm:flex-row gap-3">
          <label htmlFor="tactical-expense-input" className="sr-only">
            Relatório diário de gastos
          </label>
          <input
            id="tactical-expense-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            maxLength={600}
            disabled={submitting}
            placeholder='Ex: "Gastei R$ 80 hoje com açaí fora do plano" ou "Gastei R$ 350 na compra de mês"'
            className="flex-1 bg-[#101215] border border-white/15 focus:border-[#c59b27] rounded-lg px-4 py-2.5 text-sm text-[#f3ead6] placeholder:text-[#786f5e] outline-none min-h-[44px]"
          />
          <button
            type="submit"
            disabled={submitting || !input.trim()}
            className="rpg-btn-gold px-5 py-2.5 rounded-lg text-xs sm:text-sm font-epic flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer min-h-[44px]"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin shrink-0" aria-hidden="true" />
                <span>Analisando...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Enviar Relatório</span>
              </>
            )}
          </button>
        </form>
      </div>
    </section>
  );
}
