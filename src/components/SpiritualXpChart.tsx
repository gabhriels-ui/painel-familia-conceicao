import { useMemo, useState } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Shield, TrendingUp } from 'lucide-react';
import type { SpiritualLog, SpiritualState } from '../types/chronicles';
import { formatDateBr } from '../utils/scheduleConflicts';
import { getLocalDateStr } from '../utils/spiritual';

interface SpiritualXpChartProps {
  spiritual: SpiritualState;
  spiritualLogs: SpiritualLog[];
  pmShiftDates?: string[];
}

interface DailyChartPoint {
  dateStr: string;
  shortLabel: string;
  fullDateLabel: string;
  xp: number;
  actsCount: number;
  maxMultiplier: number;
  isDutyDay: boolean;
  isDutyPeak: boolean;
  topActLabel: string;
}

type RangeWindow = 14 | 30;

function shiftLocalDateStr(baseDateStr: string, offsetDays: number): string {
  const dt = new Date(`${baseDateStr}T12:00:00`);
  if (Number.isNaN(dt.getTime())) return baseDateStr;
  dt.setDate(dt.getDate() + offsetDays);
  return getLocalDateStr(dt);
}

interface CustomDotProps {
  cx?: number;
  cy?: number;
  payload?: DailyChartPoint;
}

function DutyPeakDot({ cx, cy, payload }: CustomDotProps) {
  if (typeof cx !== 'number' || typeof cy !== 'number' || !payload) return null;
  if (payload.xp <= 0 && !payload.isDutyDay) return null;

  if (payload.isDutyPeak) {
    return (
      <g>
        <circle cx={cx} cy={cy} r={10} fill="rgba(250, 204, 21, 0.22)" />
        <circle
          cx={cx}
          cy={cy}
          r={5.5}
          fill="#fef08a"
          stroke="#881b1b"
          strokeWidth={2}
        />
        <circle cx={cx} cy={cy} r={2} fill="#881b1b" />
      </g>
    );
  }

  if (payload.isDutyDay) {
    return (
      <circle
        cx={cx}
        cy={cy}
        r={4}
        fill="#1e222b"
        stroke="#fde047"
        strokeWidth={1.6}
      />
    );
  }

  return (
    <circle
      cx={cx}
      cy={cy}
      r={3}
      fill="#eab308"
      stroke="#14110c"
      strokeWidth={1.2}
    />
  );
}

function ActiveDutyDot({ cx, cy, payload }: CustomDotProps) {
  if (typeof cx !== 'number' || typeof cy !== 'number' || !payload) return null;
  const isDuty = payload.isDutyDay;
  return (
    <g>
      <circle
        cx={cx}
        cy={cy}
        r={11}
        fill={isDuty ? 'rgba(254, 240, 138, 0.28)' : 'rgba(234, 179, 8, 0.22)'}
      />
      <circle
        cx={cx}
        cy={cy}
        r={6}
        fill={isDuty ? '#fef08a' : '#eab308'}
        stroke={isDuty ? '#881b1b' : '#120e09'}
        strokeWidth={2}
      />
    </g>
  );
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload?: DailyChartPoint }>;
}

function SpiritualChartTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0]?.payload;
  if (!point) return null;

  return (
    <div className="rounded-lg border border-[#eab308]/55 bg-[#120e0a]/95 px-3.5 py-2.5 shadow-xl text-xs space-y-1 min-w-[195px]">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-1">
        <span className="font-epic text-[#f3ead6]">{point.fullDateLabel}</span>
        {point.isDutyDay && (
          <span className="font-epic text-[11px] text-[#fef08a] flex items-center gap-1">
            <Shield className="w-3 h-3 text-[#fde047]" aria-hidden="true" />
            <span>Plantão PMSE</span>
          </span>
        )}
      </div>

      <div className="flex items-center justify-between gap-3">
        <span className="text-[#a89982]">XP Espiritual</span>
        <span className="font-mono-num font-bold text-[#fde047]">
          +{point.xp.toLocaleString('pt-BR')} XP
        </span>
      </div>

      <div className="flex items-center justify-between gap-3">
        <span className="text-[#a89982]">Atos Registrados</span>
        <span className="font-mono-num text-[#efe3c8]">
          {point.actsCount} {point.actsCount === 1 ? 'ato' : 'atos'}
        </span>
      </div>

      {point.maxMultiplier > 1 && (
        <div className="flex items-center justify-between gap-3">
          <span className="text-[#a89982]">Multiplicador Máx.</span>
          <span className="font-mono-num font-semibold text-emerald-300">
            {point.maxMultiplier.toFixed(1)}x
          </span>
        </div>
      )}

      {point.topActLabel && (
        <div className="text-[11px] text-[#d5c7b0] pt-0.5 truncate max-w-[230px]">
          Destaque: {point.topActLabel}
        </div>
      )}
    </div>
  );
}

export function SpiritualXpChart({
  spiritual,
  spiritualLogs,
  pmShiftDates = [],
}: SpiritualXpChartProps) {
  const [rangeDays, setRangeDays] = useState<RangeWindow>(30);
  const [onlyDutyDays, setOnlyDutyDays] = useState(false);

  const todayStr = getLocalDateStr();

  const fullMonthSeries = useMemo(() => {
    const dutySet = new Set<string>(
      (pmShiftDates || []).filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d))
    );
    if (spiritual?.pmDutyDate && /^\d{4}-\d{2}-\d{2}$/.test(spiritual.pmDutyDate)) {
      dutySet.add(spiritual.pmDutyDate);
    }

    const byDate = new Map<
      string,
      {
        xp: number;
        actsCount: number;
        maxMultiplier: number;
        topXp: number;
        topActLabel: string;
      }
    >();

    for (const log of spiritualLogs || []) {
      if (!log.dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(log.dateStr)) continue;
      const cur = byDate.get(log.dateStr) || {
        xp: 0,
        actsCount: 0,
        maxMultiplier: 1,
        topXp: -1,
        topActLabel: '',
      };
      const logXp = Math.max(0, Number(log.xpGranted) || 0);
      const logMult = Number(log.multiplierApplied) || 1;
      cur.xp += logXp;
      cur.actsCount += 1;
      if (logMult > cur.maxMultiplier) cur.maxMultiplier = logMult;
      if (logXp > cur.topXp) {
        cur.topXp = logXp;
        cur.topActLabel = log.actLabel || '';
      }
      if (logMult >= 3) {
        dutySet.add(log.dateStr);
      }
      byDate.set(log.dateStr, cur);
    }

    const points: DailyChartPoint[] = [];
    for (let offset = -(rangeDays - 1); offset <= 0; offset += 1) {
      const dateStr = shiftLocalDateStr(todayStr, offset);
      const agg = byDate.get(dateStr);
      const xp = agg?.xp || 0;
      const isDutyDay = dutySet.has(dateStr);
      const [, mm, dd] = dateStr.split('-');
      points.push({
        dateStr,
        shortLabel: `${dd}/${mm}`,
        fullDateLabel: formatDateBr(dateStr),
        xp,
        actsCount: agg?.actsCount || 0,
        maxMultiplier: agg?.maxMultiplier || 1,
        isDutyDay,
        isDutyPeak: isDutyDay && xp > 0,
        topActLabel: agg?.topActLabel || '',
      });
    }
    return points;
  }, [spiritual?.pmDutyDate, spiritualLogs, pmShiftDates, rangeDays, todayStr]);

  const visibleSeries = useMemo(() => {
    if (!onlyDutyDays) return fullMonthSeries;
    return fullMonthSeries.map((pt) =>
      pt.isDutyDay ? pt : { ...pt, xp: 0, actsCount: 0 }
    );
  }, [fullMonthSeries, onlyDutyDays]);

  const summary = useMemo(() => {
    let totalXp = 0;
    let activeDays = 0;
    let dutyPeak: DailyChartPoint | null = null;
    const dutyPeakDates: DailyChartPoint[] = [];

    for (const pt of fullMonthSeries) {
      totalXp += pt.xp;
      if (pt.xp > 0) activeDays += 1;
      if (pt.isDutyPeak) {
        dutyPeakDates.push(pt);
        if (!dutyPeak || pt.xp > dutyPeak.xp) {
          dutyPeak = pt;
        }
      }
    }

    const avgXp = activeDays > 0 ? Math.round(totalXp / rangeDays) : 0;
    return {
      totalXp,
      activeDays,
      avgXp,
      dutyPeak,
      dutyPeakDates,
    };
  }, [fullMonthSeries, rangeDays]);

  return (
    <div className="parchment-box p-4 sm:p-5 space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#eab308]" aria-hidden="true" />
            <h3 className="font-epic text-sm sm:text-base text-[#f3ead6]">
              Evolução do XP Espiritual Diário ({rangeDays} dias)
            </h3>
          </div>
          <p className="text-xs text-[#a89982]">
            Acompanhamento diário do último mês com destaque para picos conquistados em dias de plantão PMSE.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setOnlyDutyDays((v) => !v)}
            aria-pressed={onlyDutyDays}
            className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 cursor-pointer border transition-colors whitespace-nowrap shrink-0 min-h-[36px] ${
              onlyDutyDays
                ? 'bg-[#eab308]/20 border-[#fde047]/70 text-[#fef08a]'
                : 'bg-[#101215] border-white/15 text-[#9e9380] hover:text-[#f3ead6]'
            }`}
          >
            <Shield className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Isolar Plantões</span>
          </button>

          <div
            className="inline-flex p-1 rounded-md bg-[#101215] border border-white/10"
            role="group"
            aria-label="Período do gráfico de XP Espiritual"
          >
            {([14, 30] as const).map((days) => (
              <button
                key={days}
                type="button"
                onClick={() => setRangeDays(days)}
                className={`px-2.5 py-1 rounded text-xs font-mono-num font-semibold cursor-pointer whitespace-nowrap shrink-0 ${
                  rangeDays === days
                    ? 'bg-[#c59b27] text-[#101215]'
                    : 'text-[#9e9380] hover:text-[#f3ead6]'
                }`}
              >
                {days}d
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Resumo quantitativo do período */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="rounded-md bg-[#101215]/90 border border-white/10 px-3 py-2 flex items-center justify-between gap-2">
          <span className="text-[#a89982]">Acumulado ({rangeDays}d)</span>
          <span className="font-mono-num font-bold text-[#fde047]">
            {summary.totalXp.toLocaleString('pt-BR')} XP
          </span>
        </div>

        <div className="rounded-md bg-[#101215]/90 border border-white/10 px-3 py-2 flex items-center justify-between gap-2">
          <span className="text-[#a89982]">Média Diária</span>
          <span className="font-mono-num font-bold text-[#f3ead6]">
            {summary.avgXp.toLocaleString('pt-BR')} XP/dia · {summary.activeDays}d ativos
          </span>
        </div>

        <div className="rounded-md bg-[#101215]/90 border border-[#eab308]/35 px-3 py-2 flex items-center justify-between gap-2">
          <span className="text-[#d5c7b0]">Pico em Plantão</span>
          <span className="font-mono-num font-bold text-[#fef08a]">
            {summary.dutyPeak
              ? `+${summary.dutyPeak.xp.toLocaleString('pt-BR')} XP (${summary.dutyPeak.shortLabel})`
              : 'Sem pico no período'}
          </span>
        </div>
      </div>

      {/* Gráfico Recharts Responsivo */}
      <div className="w-full h-[230px] sm:h-[250px] min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={visibleSeries}
            margin={{ top: 16, right: 16, left: -12, bottom: 4 }}
          >
            <CartesianGrid
              stroke="rgba(234, 179, 8, 0.12)"
              strokeDasharray="3 3"
              vertical={false}
            />
            <XAxis
              dataKey="shortLabel"
              tick={{ fill: '#a89982', fontSize: 11 }}
              axisLine={{ stroke: 'rgba(255, 255, 255, 0.12)' }}
              tickLine={false}
              minTickGap={20}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fill: '#a89982', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
              width={46}
            />
            {summary.dutyPeakDates.map((pt) => (
              <ReferenceLine
                key={pt.dateStr}
                x={pt.shortLabel}
                stroke="rgba(253, 224, 71, 0.34)"
                strokeDasharray="3 3"
              />
            ))}
            <Tooltip
              content={<SpiritualChartTooltip />}
              cursor={{ stroke: 'rgba(234, 179, 8, 0.45)', strokeWidth: 1.5 }}
            />
            <Line
              type="monotone"
              dataKey="xp"
              name="XP Espiritual Diário"
              stroke="#eab308"
              strokeWidth={2.5}
              dot={<DutyPeakDot />}
              activeDot={<ActiveDutyDot />}
              isAnimationActive
              animationDuration={550}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legenda limpa sem cápsulas */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] text-[#a89982] border-t border-white/10 pt-2.5">
        <div className="flex flex-wrap items-center gap-4">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-4 h-0.5 bg-[#eab308] inline-block" aria-hidden="true" />
            <span>Evolução diária de XP Espiritual</span>
          </span>
          <span className="inline-flex items-center gap-1.5 text-[#fef08a]">
            <span
              className="w-2.5 h-2.5 rounded-full bg-[#fef08a] border-2 border-[#881b1b] inline-block"
              aria-hidden="true"
            />
            <span>Pico conquistado em dia de Plantão PMSE</span>
          </span>
        </div>

        {summary.totalXp === 0 && (
          <span className="text-[#9e9380]">
            Registre uma oração ou ative o Modo Plantão PMSE para inaugurar a curva do mês.
          </span>
        )}
      </div>
    </div>
  );
}
