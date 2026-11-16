import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Cross,
  Plus,
} from 'lucide-react';
import type { MissionEntry } from '../types/chronicles';

interface MescCommandWidgetProps {
  shifts: MissionEntry[];
  onAddMescShift: (data: {
    title: string;
    detail: string;
    dateStr: string;
    timeStr: string;
  }) => void;
  onToggleMescShift: (entryId: string, xpReward: number) => void;
  onOpenMescPanel: () => void;
}

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

const MESC_ROLES = [
  'Distribuição Eucarística',
  'Comunhão aos Enfermos',
  'Adoração ao Santíssimo',
  'Missa Dominical',
];

function parseShiftTimestamp(entry: MissionEntry): number | null {
  if (!entry.dateStr) return null;
  const normalizedTime =
    entry.timeStr && /^\d{2}:\d{2}$/.test(entry.timeStr) ? entry.timeStr : '19:00';
  const dt = new Date(`${entry.dateStr}T${normalizedTime}:00`);
  if (Number.isNaN(dt.getTime())) return null;
  return dt.getTime();
}

function formatDateKey(year: number, monthIndex: number, day: number): string {
  return `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function formatShortDate(dateStr: string): string {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

export function MescCommandWidget({
  shifts,
  onAddMescShift,
  onToggleMescShift,
  onOpenMescPanel,
}: MescCommandWidgetProps) {
  const [nowMs, setNowMs] = useState<number>(() => Date.now());
  const nowDate = useMemo(() => new Date(nowMs), [nowMs]);

  const [viewYear, setViewYear] = useState<number>(() => new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(() => new Date().getMonth());
  const [selectedDateKey, setSelectedDateKey] = useState<string>(() =>
    formatDateKey(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())
  );

  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [quickRole, setQuickRole] = useState(MESC_ROLES[0]);
  const [quickTime, setQuickTime] = useState('19:00');
  const [quickParish, setQuickParish] = useState('Igreja Matriz · Paróquia');

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNowMs(Date.now());
    }, 1000);
    return () => window.clearInterval(interval);
  }, []);

  const shiftsByDate = useMemo(() => {
    const map = new Map<string, MissionEntry[]>();
    for (const s of shifts) {
      if (!s.dateStr) continue;
      const list = map.get(s.dateStr) || [];
      list.push(s);
      map.set(s.dateStr, list);
    }
    map.forEach((list) => {
      list.sort((a, b) => (a.timeStr || '').localeCompare(b.timeStr || ''));
    });
    return map;
  }, [shifts]);

  // Próximo plantão litúrgico: prioriza pendentes futuros (ou em andamento nos últimos 90 min),
  // e se todos pendentes forem anteriores, exibe o pendente mais recente para baixa.
  const { nextShift, nextShiftTargetMs } = useMemo(() => {
    const pending = shifts
      .filter((s) => !s.completed)
      .map((s) => ({ entry: s, ts: parseShiftTimestamp(s) }))
      .filter((item): item is { entry: MissionEntry; ts: number } => item.ts !== null)
      .sort((a, b) => a.ts - b.ts);

    const activeWindowCutoff = nowMs - 90 * 60 * 1000;
    const upcoming = pending.find((item) => item.ts >= activeWindowCutoff) || pending[0] || null;
    return {
      nextShift: upcoming ? upcoming.entry : null,
      nextShiftTargetMs: upcoming ? upcoming.ts : null,
    };
  }, [shifts, nowMs]);

  const countdown = useMemo(() => {
    if (nextShiftTargetMs === null) {
      return {
        status: 'empty' as const,
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
      };
    }
    const diff = nextShiftTargetMs - nowMs;
    if (diff <= 0) {
      const elapsedMin = Math.floor(Math.abs(diff) / 60000);
      return {
        status: elapsedMin <= 90 ? ('live' as const) : ('overdue' as const),
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
      };
    }
    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return {
      status: 'counting' as const,
      days,
      hours,
      minutes,
      seconds,
    };
  }, [nextShiftTargetMs, nowMs]);

  const todayKey = formatDateKey(
    nowDate.getFullYear(),
    nowDate.getMonth(),
    nowDate.getDate()
  );
  const isCurrentMonthView =
    viewYear === nowDate.getFullYear() && viewMonth === nowDate.getMonth();

  const { leadingBlanks, days } = useMemo(() => {
    const firstWeekday = new Date(viewYear, viewMonth, 1).getDay();
    const totalDays = new Date(viewYear, viewMonth + 1, 0).getDate();
    const cells: {
      day: number;
      dateKey: string;
      isToday: boolean;
      dayShifts: MissionEntry[];
      hasNextShift: boolean;
    }[] = [];

    for (let d = 1; d <= totalDays; d++) {
      const dateKey = formatDateKey(viewYear, viewMonth, d);
      const dayShifts = shiftsByDate.get(dateKey) || [];
      cells.push({
        day: d,
        dateKey,
        isToday: dateKey === todayKey,
        dayShifts,
        hasNextShift: Boolean(nextShift && dayShifts.some((s) => s.id === nextShift.id)),
      });
    }

    return { leadingBlanks: firstWeekday, days: cells };
  }, [viewYear, viewMonth, todayKey, shiftsByDate, nextShift]);

  const selectedDayShifts = shiftsByDate.get(selectedDateKey) || [];
  const pendingCount = shifts.filter((s) => !s.completed).length;
  const fulfilledCount = shifts.filter((s) => s.completed).length;

  const goPrevMonth = () => {
    const prev = new Date(viewYear, viewMonth - 1, 1);
    setViewYear(prev.getFullYear());
    setViewMonth(prev.getMonth());
    setSelectedDateKey(formatDateKey(prev.getFullYear(), prev.getMonth(), 1));
  };

  const goNextMonth = () => {
    const next = new Date(viewYear, viewMonth + 1, 1);
    setViewYear(next.getFullYear());
    setViewMonth(next.getMonth());
    setSelectedDateKey(formatDateKey(next.getFullYear(), next.getMonth(), 1));
  };

  const goToday = () => {
    setViewYear(nowDate.getFullYear());
    setViewMonth(nowDate.getMonth());
    setSelectedDateKey(todayKey);
  };

  const handleQuickAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDateKey) return;
    onAddMescShift({
      title: quickRole,
      detail: quickParish.trim() || 'Comunidade / Paróquia',
      dateStr: selectedDateKey,
      timeStr: quickTime || '19:00',
    });
    setQuickAddOpen(false);
  };

  return (
    <section
      className="cathedral-glass state-card p-5 sm:p-6 space-y-5"
      aria-labelledby="mesc-command-heading"
    >
      {/* Cabeçalho do Módulo Litúrgico na Aba Comando */}
      <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-[#7d5d28]/35">
        <div className="flex items-start gap-3">
          <div className="depth-layer-3 w-10 h-10 rounded-lg bg-[#16191f] border border-[#eab308]/55 flex items-center justify-center shrink-0">
            <Cross className="w-5 h-5 text-[#fde047]" aria-hidden="true" />
          </div>
          <div>
            <div className="depth-layer-1 flex flex-wrap items-center gap-2 text-xs text-[#c59b27]">
              <span className="font-epic">Ministério da Eucaristia · MESC</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono-num text-[#a69982]">
                {pendingCount} {pendingCount === 1 ? 'escala ativa' : 'escalas ativas'} ·{' '}
                {fulfilledCount} {fulfilledCount === 1 ? 'serviço' : 'serviços'}
              </span>
            </div>
            <h2
              id="mesc-command-heading"
              className="depth-layer-2 font-epic text-lg sm:text-xl text-[#f3ead6]"
            >
              Calendário & Vigília Litúrgica do MESC
            </h2>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenMescPanel}
          className="depth-layer-2 rpg-btn-iron px-3.5 py-2 rounded-lg text-xs font-epic flex items-center gap-1.5 cursor-pointer min-h-[40px] whitespace-nowrap shrink-0"
        >
          <span>Abrir Escalas MESC</span>
          <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Esquerda (5 cols): Timer Regressivo com Moldura de Ferro Batido */}
        <div className="lg:col-span-5 flex flex-col">
          <div
            className="depth-layer-2 wrought-iron-timer-frame flex-1 flex flex-col"
            aria-label="Contagem regressiva para o próximo plantão litúrgico em moldura de ferro batido"
          >
            <div className="wrought-iron-timer-inner p-4 sm:p-5 flex-1 flex flex-col justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2 text-xs font-epic text-[#e4c770]">
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#eab308]" aria-hidden="true" />
                    <span>Contagem Regressiva · Próximo Plantão</span>
                  </span>
                </div>

                {nextShift ? (
                  <div className="space-y-0.5 pt-1">
                    <h3 className="depth-layer-3 font-epic text-base sm:text-lg text-[#fff6da] leading-snug">
                      {nextShift.title}
                    </h3>
                    <div className="text-xs font-mono-num text-[#c9bca6]">
                      <span>{formatShortDate(nextShift.dateStr)}</span>
                      <span aria-hidden="true"> · </span>
                      <span className="text-[#fde047] font-semibold">{nextShift.timeStr}</span>
                      <span aria-hidden="true"> · </span>
                      <span>{nextShift.detail}</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1 pt-1">
                    <h3 className="font-epic text-base text-[#e4d7be]">
                      Nenhum Plantão Pendente
                    </h3>
                    <p className="text-xs text-[#a69982]">
                      Selecione um dia no calendário ao lado ou agende sua próxima escala litúrgica.
                    </p>
                  </div>
                )}
              </div>

              {/* Mostrador Digital em Ferro Batido */}
              <div className="depth-layer-3 space-y-2">
                {countdown.status === 'live' && (
                  <div className="text-center font-epic text-sm text-emerald-300 bg-emerald-950/40 border border-emerald-500/45 rounded-md py-2 px-3">
                    Serviço Litúrgico em Curso Agora
                  </div>
                )}
                {countdown.status === 'overdue' && (
                  <div className="text-center font-epic text-sm text-amber-300 bg-amber-950/40 border border-amber-500/45 rounded-md py-2 px-3">
                    Horário Atingido · Confirme a Conclusão
                  </div>
                )}

                <div className="grid grid-cols-4 gap-2">
                  {[
                    { value: countdown.days, label: 'Dias' },
                    { value: countdown.hours, label: 'Horas' },
                    { value: countdown.minutes, label: 'Min' },
                    { value: countdown.seconds, label: 'Seg' },
                  ].map((unit) => (
                    <div
                      key={unit.label}
                      className="wrought-iron-dial-cell py-3 px-1.5 text-center"
                    >
                      <div className="font-mono-num text-2xl sm:text-3xl font-bold text-[#fde047] leading-none">
                        {String(unit.value).padStart(2, '0')}
                      </div>
                      <div className="text-[11px] font-epic text-[#a69982] mt-1.5">
                        {unit.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ação do Timer */}
              <div className="pt-1 flex flex-wrap gap-2">
                {nextShift ? (
                  <button
                    type="button"
                    onClick={() => onToggleMescShift(nextShift.id, 80)}
                    className="rpg-btn-gold w-full py-2.5 px-4 rounded text-xs sm:text-sm font-epic flex items-center justify-center gap-2 cursor-pointer min-h-[42px]"
                  >
                    <Check className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>Confirmar Serviço Prestado (+80 XP)</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setQuickAddOpen(true)}
                    className="rpg-btn-gold w-full py-2.5 px-4 rounded text-xs sm:text-sm font-epic flex items-center justify-center gap-2 cursor-pointer min-h-[42px]"
                  >
                    <Plus className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>Agendar Próximo Plantão</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Direita (7 cols): Calendário Mensal Integrado do MESC */}
        <div className="lg:col-span-7 parchment-box p-4 flex flex-col justify-between gap-3.5">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-epic text-[#dfc168]">
                <CalendarDays className="w-4 h-4 text-[#eab308]" aria-hidden="true" />
                <span>Escala Mensal da Paróquia</span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={goPrevMonth}
                  aria-label="Mês anterior do calendário MESC"
                  className="rpg-btn-iron p-1.5 rounded-md cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
                >
                  <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={goToday}
                  className={`px-3 py-1.5 rounded-md text-xs font-epic whitespace-nowrap shrink-0 cursor-pointer min-h-[36px] border transition-colors ${
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
                  aria-label="Próximo mês do calendário MESC"
                  className="rpg-btn-iron p-1.5 rounded-md cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
                >
                  <ChevronRight className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center">
              {WEEKDAY_LABELS.map((wd) => (
                <div key={wd} className="text-[11px] font-epic text-[#9e9380] pb-1">
                  {wd}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: leadingBlanks }).map((_, idx) => (
                <div key={`mesc_blank_${idx}`} aria-hidden="true" className="min-h-[42px]" />
              ))}

              {days.map((cell) => {
                const isSelected = selectedDateKey === cell.dateKey;
                const hasShifts = cell.dayShifts.length > 0;
                const allDone = hasShifts && cell.dayShifts.every((s) => s.completed);
                const hasPending = hasShifts && cell.dayShifts.some((s) => !s.completed);

                let cellStyle =
                  'bg-[#101215] border-white/10 text-[#d8ccb4] hover:border-[#c59b27]/60';
                if (cell.hasNextShift) {
                  cellStyle =
                    'bg-gradient-to-b from-[#33260b] to-[#1a1409] border-[#eab308] text-[#fff6da] shadow-[0_0_12px_rgba(234,179,8,0.28)]';
                } else if (hasPending) {
                  cellStyle =
                    'bg-amber-950/40 border-amber-500/65 text-amber-100 hover:border-amber-400';
                } else if (allDone) {
                  cellStyle =
                    'bg-emerald-950/40 border-emerald-600/60 text-emerald-200 hover:border-emerald-400';
                } else if (cell.isToday) {
                  cellStyle =
                    'bg-[#1b1f26] border-[#c59b27]/65 text-[#fde047] hover:border-[#eab308]';
                }

                return (
                  <button
                    key={cell.dateKey}
                    type="button"
                    onClick={() => setSelectedDateKey(cell.dateKey)}
                    aria-pressed={isSelected}
                    aria-label={`Dia ${formatShortDate(cell.dateKey)}${
                      hasShifts ? `, ${cell.dayShifts.length} escala(s) MESC` : ''
                    }`}
                    className={`rounded-md border p-1 min-h-[44px] flex flex-col items-center justify-between transition-colors cursor-pointer ${cellStyle} ${
                      isSelected
                        ? 'ring-2 ring-[#fde047]/80 ring-offset-1 ring-offset-[#12100e]'
                        : ''
                    }`}
                  >
                    <span className="font-mono-num text-xs font-bold leading-none">
                      {String(cell.day).padStart(2, '0')}
                    </span>
                    <span className="h-3.5 flex items-center justify-center leading-none">
                      {cell.hasNextShift ? (
                        <Cross className="w-3 h-3 text-[#fde047]" aria-hidden="true" />
                      ) : hasPending ? (
                        <span className="font-mono-num text-[9px] font-bold text-amber-300">
                          {cell.dayShifts[0].timeStr || 'MESC'}
                        </span>
                      ) : allDone ? (
                        <Check className="w-3 h-3 text-emerald-400" aria-hidden="true" />
                      ) : cell.isToday ? (
                        <span className="font-epic text-[9px] text-[#e4c770]">HOJE</span>
                      ) : (
                        <span className="text-[9px] text-[#5c626d]">·</span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Detalhe do Dia Selecionado + Agendamento Rápido */}
          <div className="pt-3 border-t border-white/10 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-xs font-mono-num text-[#dfc168]">
                Dia selecionado: <strong>{formatShortDate(selectedDateKey)}</strong>
                {selectedDayShifts.length > 0 && (
                  <span className="text-[#a69982]">
                    {' '}
                    · {selectedDayShifts.length}{' '}
                    {selectedDayShifts.length === 1 ? 'escala' : 'escalas'}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => setQuickAddOpen((v) => !v)}
                className="rpg-btn-iron px-2.5 py-1.5 rounded text-xs font-semibold flex items-center gap-1 cursor-pointer min-h-[34px]"
              >
                <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{quickAddOpen ? 'Fechar Formulário' : 'Agendar Neste Dia'}</span>
              </button>
            </div>

            {quickAddOpen && (
              <form
                onSubmit={handleQuickAddSubmit}
                className="bg-[#101215] border border-[#c59b27]/45 rounded-lg p-3 grid grid-cols-1 sm:grid-cols-12 gap-2"
              >
                <div className="sm:col-span-5">
                  <label htmlFor="mesc-cmd-role" className="sr-only">
                    Função litúrgica
                  </label>
                  <select
                    id="mesc-cmd-role"
                    value={quickRole}
                    onChange={(e) => setQuickRole(e.target.value)}
                    className="w-full bg-[#16191f] border border-[#3a3f45] focus:border-[#c59b27] focus:outline-none rounded px-2.5 py-2 text-xs text-white min-h-[38px]"
                  >
                    {MESC_ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-3">
                  <label htmlFor="mesc-cmd-time" className="sr-only">
                    Horário
                  </label>
                  <input
                    id="mesc-cmd-time"
                    type="time"
                    value={quickTime}
                    onChange={(e) => setQuickTime(e.target.value)}
                    className="w-full bg-[#16191f] border border-[#3a3f45] focus:border-[#c59b27] focus:outline-none rounded px-2.5 py-2 text-xs font-mono-num text-white min-h-[38px]"
                  />
                </div>
                <div className="sm:col-span-4">
                  <button
                    type="submit"
                    className="rpg-btn-gold w-full px-3 py-2 rounded text-xs font-epic cursor-pointer min-h-[38px]"
                  >
                    Salvar Escala
                  </button>
                </div>
                <div className="sm:col-span-12">
                  <label htmlFor="mesc-cmd-parish" className="sr-only">
                    Comunidade ou Igreja
                  </label>
                  <input
                    id="mesc-cmd-parish"
                    type="text"
                    value={quickParish}
                    onChange={(e) => setQuickParish(e.target.value)}
                    maxLength={180}
                    placeholder="Comunidade / Igreja (ex: Igreja Matriz)"
                    className="w-full bg-[#16191f] border border-[#3a3f45] focus:border-[#c59b27] focus:outline-none rounded px-2.5 py-1.5 text-xs text-white placeholder:text-[#6f7279] min-h-[36px]"
                  />
                </div>
              </form>
            )}

            {selectedDayShifts.length === 0 ? (
              <p className="text-xs text-[#9e9380]">
                Sem escalas litúrgicas cadastradas para {formatShortDate(selectedDateKey)}.
              </p>
            ) : (
              <div className="space-y-1.5">
                {selectedDayShifts.map((shift) => (
                  <div
                    key={shift.id}
                    className="flex flex-wrap items-center justify-between gap-2 bg-[#101215] border border-white/10 rounded-md px-3 py-2"
                  >
                    <div className="min-w-0">
                      <div
                        className={`text-xs sm:text-sm font-semibold ${
                          shift.completed
                            ? 'line-through text-emerald-300'
                            : 'text-[#f3ead6]'
                        }`}
                      >
                        {shift.title}
                      </div>
                      <div className="text-[11px] font-mono-num text-[#9e9380]">
                        {shift.timeStr} · {shift.detail}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onToggleMescShift(shift.id, 80)}
                      className={`px-2.5 py-1.5 rounded text-xs font-semibold cursor-pointer min-h-[34px] border ${
                        shift.completed
                          ? 'rpg-btn-iron text-emerald-300 border-emerald-600/50'
                          : 'rpg-btn-gold'
                      }`}
                    >
                      {shift.completed ? 'Prestado' : 'Cumprir (+80 XP)'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
