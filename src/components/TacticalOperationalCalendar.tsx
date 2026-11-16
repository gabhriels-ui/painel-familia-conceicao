import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowDownToLine,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Cross,
  Crosshair,
  HeartHandshake,
  Home,
  Shield,
  X,
} from 'lucide-react';
import type { MarriageCouple, MissionEntry } from '../types/chronicles';
import {
  detectCoupleScheduleConflicts,
  formatDateBr,
  getAllCoupleConflicts,
  type ScheduleConflictItem,
} from '../utils/scheduleConflicts';

const WEEKDAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const MONTH_NAMES_PT = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

const COUPLE_STATUS_TEXT: Record<MarriageCouple['status'], string> = {
  aguardando_data: 'Aguardando data',
  em_andamento: 'Em andamento',
  encontro_concluido: 'Encontro Concluído',
};

type CriticalEventType = 'housing' | 'income' | null;

interface CalendarDayCell {
  day: number;
  dateStr: string;
  dateMs: number;
  isPast: boolean;
  isToday: boolean;
  isFuture: boolean;
  criticalType: CriticalEventType;
  title: string;
  subtitle: string;
  pmShifts: MissionEntry[];
  mescShifts: MissionEntry[];
  couples: MarriageCouple[];
  conflictsByCoupleId: Record<string, ScheduleConflictItem[]>;
  hasHardConflict: boolean;
  hasAttention: boolean;
}

interface TacticalOperationalCalendarProps {
  missionEntries?: MissionEntry[];
  marriageCouples?: MarriageCouple[];
  onOpenPastoral?: () => void;
  onOpenMesc?: () => void;
  onOpenQuartel?: () => void;
}

function toDateStr(year: number, monthIndex: number, day: number): string {
  return `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(
    2,
    '0'
  )}`;
}

function getLocalMidnightMs(year: number, monthIndex: number, day: number): number {
  return new Date(year, monthIndex, day, 0, 0, 0, 0).getTime();
}

function getCriticalEventMeta(day: number): {
  type: CriticalEventType;
  shortTag: string;
  title: string;
  subtitle: string;
} {
  if (day === 3) {
    return {
      type: 'housing',
      shortTag: 'CAIXA',
      title: 'Dia 03 · Vencimento Habitação Caixa',
      subtitle:
        'Débito automático da prestação da casa própria (R$ 616,88). Garanta saldo prévio em conta.',
    };
  }
  if (day === 24) {
    return {
      type: 'income',
      shortTag: 'SALÁRIO',
      title: 'Dia 24 · Recebimento de Salário e Indenizações',
      subtitle:
        'Primeira janela mensal de entrada de soldo. Direcione aportes prioritários às Arcas.',
    };
  }
  if (day === 30) {
    return {
      type: 'income',
      shortTag: 'INDENIZ.',
      title: 'Dia 30 · Recebimento de Salário e Indenizações',
      subtitle:
        'Fechamento de proventos e indenizações do mês. Reforce a Arca I e a Muralha da Família.',
    };
  }
  return {
    type: null,
    shortTag: '',
    title: `Dia ${String(day).padStart(2, '0')} · Operação Diária`,
    subtitle:
      'Dia de vigília padrão: controle de gastos no plano, oração e disciplina financeira.',
  };
}

export function TacticalOperationalCalendar({
  missionEntries = [],
  marriageCouples = [],
  onOpenPastoral,
  onOpenMesc,
  onOpenQuartel,
}: TacticalOperationalCalendarProps) {
  const [now, setNow] = useState<Date>(() => new Date());
  const [viewYear, setViewYear] = useState<number>(() => new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(() => new Date().getMonth());
  const [selectedDay, setSelectedDay] = useState<number>(() => new Date().getDate());

  useEffect(() => {
    const timer = window.setInterval(() => {
      const fresh = new Date();
      setNow((prev) => {
        if (
          prev.getFullYear() !== fresh.getFullYear() ||
          prev.getMonth() !== fresh.getMonth() ||
          prev.getDate() !== fresh.getDate()
        ) {
          return fresh;
        }
        return prev;
      });
    }, 60000);
    return () => window.clearInterval(timer);
  }, []);

  const todayMidnightMs = getLocalMidnightMs(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

  const isCurrentMonthView =
    viewYear === now.getFullYear() && viewMonth === now.getMonth();

  const { pmByDate, mescByDate, couplesByDate } = useMemo(() => {
    const pmMap = new Map<string, MissionEntry[]>();
    const mescMap = new Map<string, MissionEntry[]>();
    const coupleMap = new Map<string, MarriageCouple[]>();

    for (const entry of missionEntries) {
      if (!entry.dateStr) continue;
      if (entry.module === 'pm_shift') {
        const list = pmMap.get(entry.dateStr) || [];
        list.push(entry);
        pmMap.set(entry.dateStr, list);
      } else if (entry.module === 'mesc_shift') {
        const list = mescMap.get(entry.dateStr) || [];
        list.push(entry);
        mescMap.set(entry.dateStr, list);
      }
    }

    for (const couple of marriageCouples) {
      if (!couple.scheduledDate) continue;
      const list = coupleMap.get(couple.scheduledDate) || [];
      list.push(couple);
      coupleMap.set(couple.scheduledDate, list);
    }

    return { pmByDate: pmMap, mescByDate: mescMap, couplesByDate: coupleMap };
  }, [missionEntries, marriageCouples]);

  const allConflicts = useMemo(
    () => getAllCoupleConflicts(marriageCouples, missionEntries),
    [marriageCouples, missionEntries]
  );

  const { leadingBlanks, days, passedCount, remainingCount } = useMemo(() => {
    const firstWeekday = new Date(viewYear, viewMonth, 1).getDay();
    const totalDays = new Date(viewYear, viewMonth + 1, 0).getDate();
    const result: CalendarDayCell[] = [];
    let passed = 0;
    let remaining = 0;

    for (let d = 1; d <= totalDays; d++) {
      const cellMs = getLocalMidnightMs(viewYear, viewMonth, d);
      const dateStr = toDateStr(viewYear, viewMonth, d);
      const isPast = cellMs < todayMidnightMs;
      const isToday = cellMs === todayMidnightMs;
      const isFuture = cellMs > todayMidnightMs;
      if (isPast) passed += 1;
      else remaining += 1;

      const meta = getCriticalEventMeta(d);
      const pmShifts = pmByDate.get(dateStr) || [];
      const mescShifts = mescByDate.get(dateStr) || [];
      const couples = couplesByDate.get(dateStr) || [];

      const conflictsByCoupleId: Record<string, ScheduleConflictItem[]> = {};
      let hasHardConflict = false;
      let hasAttention = false;

      for (const couple of couples) {
        const found = detectCoupleScheduleConflicts(
          dateStr,
          couple.scheduledTime,
          missionEntries
        );
        if (found.length > 0) {
          conflictsByCoupleId[couple.id] = found;
          if (found.some((c) => c.severity === 'conflict')) hasHardConflict = true;
          else hasAttention = true;
        }
      }

      result.push({
        day: d,
        dateStr,
        dateMs: cellMs,
        isPast,
        isToday,
        isFuture,
        criticalType: meta.type,
        title: meta.title,
        subtitle: meta.subtitle,
        pmShifts,
        mescShifts,
        couples,
        conflictsByCoupleId,
        hasHardConflict,
        hasAttention,
      });
    }

    return {
      leadingBlanks: firstWeekday,
      days: result,
      passedCount: passed,
      remainingCount: remaining,
    };
  }, [
    viewYear,
    viewMonth,
    todayMidnightMs,
    pmByDate,
    mescByDate,
    couplesByDate,
    missionEntries,
  ]);

  const activeDayCell = useMemo(() => {
    const clampedDay = Math.min(selectedDay, days.length);
    return days.find((d) => d.day === clampedDay) || days[0];
  }, [days, selectedDay]);

  const nextCriticalSummary = useMemo(() => {
    const criticalDays = [3, 24, 30];
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const candidates: {
      day: number;
      dateMs: number;
      label: string;
      type: CriticalEventType;
    }[] = [];
    for (let offset = 0; offset <= 1; offset++) {
      const targetDate = new Date(currentYear, currentMonth + offset, 1);
      const y = targetDate.getFullYear();
      const m = targetDate.getMonth();
      const maxD = new Date(y, m + 1, 0).getDate();
      for (const cd of criticalDays) {
        if (cd > maxD) continue;
        const ms = getLocalMidnightMs(y, m, cd);
        if (ms >= todayMidnightMs) {
          const meta = getCriticalEventMeta(cd);
          candidates.push({
            day: cd,
            dateMs: ms,
            label: `${String(cd).padStart(2, '0')}/${String(m + 1).padStart(
              2,
              '0'
            )} · ${meta.shortTag}`,
            type: meta.type,
          });
        }
      }
    }

    candidates.sort((a, b) => a.dateMs - b.dateMs);
    const next = candidates[0];
    if (!next) return null;
    const diffDays = Math.round((next.dateMs - todayMidnightMs) / 86400000);
    return {
      ...next,
      diffDays,
    };
  }, [now, todayMidnightMs]);

  const scheduledCouplesCount = marriageCouples.filter((c) => !!c.scheduledDate).length;
  const activePmCount = missionEntries.filter((e) => e.module === 'pm_shift').length;
  const activeMescCount = missionEntries.filter((e) => e.module === 'mesc_shift').length;

  const goPrevMonth = () => {
    const prev = new Date(viewYear, viewMonth - 1, 1);
    setViewYear(prev.getFullYear());
    setViewMonth(prev.getMonth());
    setSelectedDay(1);
  };

  const goNextMonth = () => {
    const next = new Date(viewYear, viewMonth + 1, 1);
    setViewYear(next.getFullYear());
    setViewMonth(next.getMonth());
    setSelectedDay(1);
  };

  const goToday = () => {
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
    setSelectedDay(now.getDate());
  };

  const focusDate = (dateStr: string) => {
    const parts = dateStr.split('-');
    if (parts.length !== 3) return;
    const y = Number(parts[0]);
    const m = Number(parts[1]) - 1;
    const d = Number(parts[2]);
    if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) return;
    setViewYear(y);
    setViewMonth(m);
    setSelectedDay(d);
  };

  return (
    <section
      className="rpg-panel state-card p-5 sm:p-6 flex flex-col justify-between gap-4"
      aria-labelledby="tactical-calendar-heading"
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3 pb-3.5 border-b border-white/10">
          <div className="space-y-1">
            <div className="depth-layer-1 flex items-center gap-2 text-xs font-epic text-[#c59b27]">
              <CalendarDays className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Cronograma &amp; Sincronização Pastoral / PMSE / MESC</span>
            </div>
            <h2
              id="tactical-calendar-heading"
              className="depth-layer-2 font-epic text-lg sm:text-xl text-[#f3ead6]"
            >
              Calendário Tático Operacional
            </h2>
          </div>

          <div className="depth-layer-2 flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={goPrevMonth}
              aria-label="Mês anterior"
              className="rpg-btn-iron p-2 rounded-lg cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
            >
              <ChevronLeft className="w-4 h-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={goToday}
              className={`px-3 py-2 rounded-lg text-xs font-epic whitespace-nowrap shrink-0 cursor-pointer min-h-[40px] border transition-colors ${
                isCurrentMonthView
                  ? 'bg-[#c59b27] text-[#101215] border-[#e4c770]'
                  : 'rpg-btn-iron text-[#e4c770]'
              }`}
            >
              {MONTH_NAMES_PT[viewMonth]} {viewYear}
            </button>
            <button
              type="button"
              onClick={goNextMonth}
              aria-label="Próximo mês"
              className="rpg-btn-iron p-2 rounded-lg cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
            >
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Telemetria limpa do mês + resumo sincronizado */}
        <div className="depth-layer-1 flex flex-wrap items-center justify-between gap-2 text-xs font-mono-num text-[#9e9380]">
          <span>
            Vencidos: <strong className="text-[#f3ead6]">{passedCount}</strong> · Restantes:{' '}
            <strong className="text-[#dfc168]">{remainingCount}</strong>
          </span>
          {nextCriticalSummary && (
            <span
              className={
                nextCriticalSummary.type === 'housing'
                  ? 'text-red-300'
                  : 'text-emerald-300'
              }
            >
              Próxima data crítica: <strong>{nextCriticalSummary.label}</strong> (
              {nextCriticalSummary.diffDays === 0
                ? 'HOJE'
                : `em ${nextCriticalSummary.diffDays}d`}
              )
            </span>
          )}
        </div>

        <div className="depth-layer-1 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono-num text-[#b8aa92]">
          <span>
            Agenda Sincronizada · Casais:{' '}
            <strong className="text-rose-200">{scheduledCouplesCount}</strong> · PMSE:{' '}
            <strong className="text-sky-200">{activePmCount}</strong> · MESC:{' '}
            <strong className="text-[#fde047]">{activeMescCount}</strong>
          </span>
          {allConflicts.length === 0 ? (
            <span className="text-emerald-300/90">Sem choques de horário</span>
          ) : (
            <span className="text-amber-300 font-semibold">
              {allConflicts.length}{' '}
              {allConflicts.length === 1 ? 'choque detectado' : 'choques detectados'}
            </span>
          )}
        </div>

        {/* Alerta imediato quando encontro de casais choca com PMSE ou MESC */}
        {allConflicts.length > 0 && (
          <div className="rounded-lg border border-amber-500/75 bg-amber-950/35 px-3 py-2.5 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-epic text-amber-300">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>Alerta de Choque · Matrimônio vs PMSE / MESC</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {allConflicts.map(({ couple, conflicts }) => (
                <button
                  key={`cal-conflict-${couple.id}`}
                  type="button"
                  onClick={() => focusDate(couple.scheduledDate)}
                  className="text-left text-[11px] text-amber-100 underline decoration-amber-400/60 hover:text-white cursor-pointer"
                >
                  {formatDateBr(couple.scheduledDate)} · {couple.coupleNames} (
                  {conflicts.map((c) => c.moduleLabel).join(' + ')})
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Grade de dias da semana */}
        <div className="depth-layer-2 parchment-box p-3 sm:p-3.5 space-y-2">
          <div className="grid grid-cols-7 gap-1.5 text-center">
            {WEEKDAY_LABELS.map((wd) => (
              <div key={wd} className="text-[11px] font-epic text-[#9e9380] pb-1">
                {wd}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {Array.from({ length: leadingBlanks }).map((_, idx) => (
              <div key={`blank_${idx}`} aria-hidden="true" className="min-h-[52px]" />
            ))}

            {days.map((cell) => {
              const isSelected = activeDayCell?.day === cell.day;
              const isHousing = cell.criticalType === 'housing';
              const isIncome = cell.criticalType === 'income';
              const hasCouple = cell.couples.length > 0;
              const hasPm = cell.pmShifts.length > 0;
              const hasMesc = cell.mescShifts.length > 0;

              let containerClass =
                'bg-[#101215] border-white/10 text-[#d8ccb4] hover:border-[#c59b27]/60';
              if (cell.isPast && !isHousing && !isIncome) {
                containerClass =
                  'bg-[#0c0e11] border-white/5 text-[#696f79] hover:border-white/20';
              } else if (isHousing) {
                containerClass = cell.isPast
                  ? 'bg-red-950/35 border-red-700/50 text-red-200/75 hover:border-red-500'
                  : 'bg-red-950/60 border-red-500/80 text-red-100 hover:border-red-400';
              } else if (isIncome) {
                containerClass = cell.isPast
                  ? 'bg-emerald-950/30 border-emerald-700/45 text-emerald-200/75 hover:border-emerald-500'
                  : 'bg-emerald-950/55 border-emerald-500/75 text-emerald-100 hover:border-emerald-400';
              }

              if (cell.hasHardConflict) {
                containerClass =
                  'bg-amber-950/45 border-amber-400/85 text-amber-100 hover:border-amber-300';
              } else if (hasCouple && !isHousing && !isIncome && !cell.isToday) {
                containerClass =
                  'bg-rose-950/30 border-rose-400/55 text-rose-100 hover:border-rose-300';
              } else if ((hasPm || hasMesc) && !isHousing && !isIncome && !cell.isToday) {
                containerClass =
                  'bg-[#141923] border-sky-400/45 text-[#e6edf7] hover:border-[#c59b27]';
              }

              if (cell.isToday) {
                containerClass =
                  'bg-gradient-to-b from-[#33270d] to-[#1a150a] border-[#e4c770] text-[#fff6da] shadow-[0_0_16px_rgba(228,199,112,0.32)]';
              }

              const ariaExtras: string[] = [];
              if (hasCouple) ariaExtras.push(`${cell.couples.length} encontro(s) de casais`);
              if (hasPm) ariaExtras.push(`${cell.pmShifts.length} plantão(ões) PMSE`);
              if (hasMesc) ariaExtras.push(`${cell.mescShifts.length} escala(s) MESC`);
              if (cell.hasHardConflict) ariaExtras.push('choque de horário');

              return (
                <button
                  key={cell.day}
                  type="button"
                  onClick={() => setSelectedDay(cell.day)}
                  aria-label={`${cell.title}${cell.isPast ? ' (dia vencido)' : cell.isToday ? ' (hoje)' : ''}${ariaExtras.length ? ` · ${ariaExtras.join(', ')}` : ''}`}
                  aria-pressed={isSelected}
                  className={`relative rounded-md border p-1.5 min-h-[54px] sm:min-h-[60px] flex flex-col items-center justify-between transition-all cursor-pointer ${containerClass} ${
                    isSelected
                      ? 'ring-2 ring-[#e4c770]/75 ring-offset-1 ring-offset-[#101215]'
                      : ''
                  }`}
                >
                  <div className="w-full flex items-center justify-between gap-0.5 leading-none">
                    <span className="font-mono-num text-xs sm:text-sm font-bold">
                      {String(cell.day).padStart(2, '0')}
                    </span>
                    {cell.hasHardConflict ? (
                      <AlertTriangle
                        className="w-3 h-3 text-amber-300 shrink-0"
                        aria-hidden="true"
                      />
                    ) : cell.isToday ? (
                      <Crosshair
                        className="w-3 h-3 text-[#e4c770] shrink-0"
                        aria-hidden="true"
                      />
                    ) : isHousing ? (
                      <Home className="w-3 h-3 text-red-400 shrink-0" aria-hidden="true" />
                    ) : isIncome ? (
                      <ArrowDownToLine
                        className="w-3 h-3 text-emerald-400 shrink-0"
                        aria-hidden="true"
                      />
                    ) : null}
                  </div>

                  {/* Marcadores sincronizados (Casais, PMSE, MESC) + Financeiro / Passado */}
                  <div className="w-full flex flex-col items-center justify-end gap-0.5 leading-none min-h-[18px]">
                    {(hasCouple || hasPm || hasMesc) && (
                      <div className="flex items-center justify-center gap-1">
                        {hasCouple && (
                          <HeartHandshake
                            className="w-3 h-3 text-rose-300 shrink-0"
                            aria-hidden="true"
                          />
                        )}
                        {hasPm && (
                          <Shield
                            className="w-3 h-3 text-sky-300 shrink-0"
                            aria-hidden="true"
                          />
                        )}
                        {hasMesc && (
                          <Cross
                            className="w-3 h-3 text-[#fde047] shrink-0"
                            aria-hidden="true"
                          />
                        )}
                      </div>
                    )}

                    {cell.hasHardConflict ? (
                      <span className="text-[8.5px] font-epic text-amber-300 tracking-tight truncate">
                        CHOQUE
                      </span>
                    ) : cell.isToday ? (
                      <span className="text-[9px] font-epic text-[#e4c770] tracking-tight">
                        HOJE
                      </span>
                    ) : isHousing ? (
                      <span className="text-[9px] font-mono-num font-bold text-red-300 truncate">
                        {cell.isPast ? '✖ 03' : 'CAIXA'}
                      </span>
                    ) : isIncome ? (
                      <span className="text-[9px] font-mono-num font-bold text-emerald-300 truncate">
                        {cell.isPast ? '✖ R$' : 'SALÁRIO'}
                      </span>
                    ) : hasCouple ? (
                      <span className="text-[8.5px] font-epic text-rose-200 truncate">
                        CASAIS
                      </span>
                    ) : hasPm && hasMesc ? (
                      <span className="text-[8.5px] font-epic text-sky-200 truncate">
                        PM·MESC
                      </span>
                    ) : hasPm ? (
                      <span className="text-[8.5px] font-epic text-sky-200 truncate">
                        PMSE
                      </span>
                    ) : hasMesc ? (
                      <span className="text-[8.5px] font-epic text-[#fde047] truncate">
                        MESC
                      </span>
                    ) : cell.isPast ? (
                      <span
                        className="inline-flex items-center justify-center text-red-400/70"
                        title="Dia vencido"
                      >
                        <X className="w-3.5 h-3.5 stroke-[2.6]" aria-hidden="true" />
                      </span>
                    ) : (
                      <span className="text-[9px] font-mono-num text-[#6f7279]">·</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Legenda limpa sem pílulas */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-[#a69982]">
          <span className="inline-flex items-center gap-1.5 text-rose-200">
            <HeartHandshake className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Pastoral de Casais</span>
          </span>
          <span className="inline-flex items-center gap-1.5 text-sky-300">
            <Shield className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Plantão PMSE</span>
          </span>
          <span className="inline-flex items-center gap-1.5 text-[#fde047]">
            <Cross className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Escala MESC</span>
          </span>
          <span className="inline-flex items-center gap-1.5 text-amber-300">
            <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Choque de Horário</span>
          </span>
          <span className="inline-flex items-center gap-1.5 text-red-300">
            <Home className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Dia 03 · Caixa</span>
          </span>
          <span className="inline-flex items-center gap-1.5 text-emerald-300">
            <ArrowDownToLine className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Dias 24 &amp; 30 · Soldo</span>
          </span>
        </div>
      </div>

      {/* Inspetor Detalhado do Dia Selecionado */}
      {activeDayCell && (
        <div className="pt-3 border-t border-white/10 space-y-3">
          <div className="space-y-0.5 min-w-0">
            <div
              className={`text-xs font-epic ${
                activeDayCell.hasHardConflict
                  ? 'text-amber-300'
                  : activeDayCell.criticalType === 'housing'
                  ? 'text-red-300'
                  : activeDayCell.criticalType === 'income'
                  ? 'text-emerald-300'
                  : activeDayCell.isToday
                  ? 'text-[#e4c770]'
                  : 'text-[#dfc168]'
              }`}
            >
              {activeDayCell.title}
              {activeDayCell.isPast && ' · Vencido (✖)'}
              {activeDayCell.isToday && ' · EM CURSO HOJE'}
            </div>
            <p className="text-xs sm:text-sm text-[#c7b8a0] leading-snug">
              {activeDayCell.subtitle}
            </p>
          </div>

          {(activeDayCell.couples.length > 0 ||
            activeDayCell.pmShifts.length > 0 ||
            activeDayCell.mescShifts.length > 0) && (
            <div className="space-y-2 pt-1">
              {activeDayCell.couples.map((couple) => {
                const conflicts = activeDayCell.conflictsByCoupleId[couple.id] || [];
                return (
                  <div
                    key={`insp-couple-${couple.id}`}
                    className={`parchment-box p-3 space-y-1 ${
                      conflicts.some((c) => c.severity === 'conflict')
                        ? 'border-amber-500/80 bg-amber-950/25'
                        : 'border-rose-400/50'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <span className="inline-flex items-center gap-1.5 font-semibold text-rose-200">
                        <HeartHandshake className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Matrimônio · {couple.coupleNames}</span>
                      </span>
                      <span className="font-mono-num text-[#dfc168]">
                        {couple.scheduledTime || 'Horário livre'} ·{' '}
                        {COUPLE_STATUS_TEXT[couple.status]}
                      </span>
                    </div>
                    {couple.topic && (
                      <div className="text-xs text-[#e4d7be]">{couple.topic}</div>
                    )}
                    {couple.notes && (
                      <div className="text-[11px] text-[#a69982] italic">
                        {couple.notes}
                      </div>
                    )}
                    {conflicts.map((c) => (
                      <div
                        key={c.shiftId}
                        className="text-[11px] text-amber-300 flex items-center gap-1.5 pt-0.5"
                      >
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                        <span>{c.reason}</span>
                      </div>
                    ))}
                  </div>
                );
              })}

              {activeDayCell.pmShifts.map((shift) => (
                <div
                  key={`insp-pm-${shift.id}`}
                  className="parchment-box p-2.5 border-sky-500/40 flex flex-wrap items-center justify-between gap-2 text-xs"
                >
                  <span className="inline-flex items-center gap-1.5 font-semibold text-sky-200">
                    <Shield className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>PMSE · {shift.title}</span>
                  </span>
                  <span className="font-mono-num text-[#c7b8a0]">
                    {shift.timeStr || 'Turno'} · {shift.detail}
                    {shift.completed ? ' (Cumprido)' : ''}
                  </span>
                </div>
              ))}

              {activeDayCell.mescShifts.map((shift) => (
                <div
                  key={`insp-mesc-${shift.id}`}
                  className="parchment-box p-2.5 border-[#eab308]/45 flex flex-wrap items-center justify-between gap-2 text-xs"
                >
                  <span className="inline-flex items-center gap-1.5 font-semibold text-[#fde047]">
                    <Cross className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>MESC · {shift.title}</span>
                  </span>
                  <span className="font-mono-num text-[#c7b8a0]">
                    {shift.timeStr || 'Horário'} · {shift.detail}
                    {shift.completed ? ' (Prestado)' : ''}
                  </span>
                </div>
              ))}
            </div>
          )}

          {(onOpenPastoral || onOpenQuartel || onOpenMesc) && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {onOpenPastoral && (
                <button
                  type="button"
                  onClick={onOpenPastoral}
                  className="rpg-btn-iron px-2.5 py-1.5 rounded text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer"
                >
                  <HeartHandshake className="w-3 h-3 text-rose-300" aria-hidden="true" />
                  <span>Gerenciar Casais</span>
                </button>
              )}
              {onOpenQuartel && (
                <button
                  type="button"
                  onClick={onOpenQuartel}
                  className="rpg-btn-iron px-2.5 py-1.5 rounded text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer"
                >
                  <Shield className="w-3 h-3 text-sky-300" aria-hidden="true" />
                  <span>Escala PMSE</span>
                </button>
              )}
              {onOpenMesc && (
                <button
                  type="button"
                  onClick={onOpenMesc}
                  className="rpg-btn-iron px-2.5 py-1.5 rounded text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer"
                >
                  <Cross className="w-3 h-3 text-[#fde047]" aria-hidden="true" />
                  <span>Escalas MESC</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
