import { useMemo, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { Flame, TrendingUp } from 'lucide-react';
import { buildXpSeries } from '../utils/formatters';

interface XpHistoryChartProps {
  xpHistory: Record<string, number> | undefined;
  totalXp: number;
}

type ChartMode = 'daily' | 'cumulative';
type WindowDays = 7 | 30;

const SVG_WIDTH = 720;
const SVG_HEIGHT = 228;
const PAD_LEFT = 46;
const PAD_RIGHT = 18;
const PAD_TOP = 18;
const PAD_BOTTOM = 30;

export function XpHistoryChart({ xpHistory, totalXp }: XpHistoryChartProps) {
  const [windowDays, setWindowDays] = useState<WindowDays>(30);
  const [mode, setMode] = useState<ChartMode>('daily');
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const series = useMemo(
    () => buildXpSeries(xpHistory, windowDays),
    [xpHistory, windowDays]
  );

  const { points, totalXp: periodXp, activeDays, avgDailyXp, bestDayXp, currentStreakDays } = series;

  const plotWidth = SVG_WIDTH - PAD_LEFT - PAD_RIGHT;
  const plotHeight = SVG_HEIGHT - PAD_TOP - PAD_BOTTOM;

  const values = points.map((p) => (mode === 'daily' ? p.dailyXp : p.cumulativeXp));
  const rawMax = Math.max(...values, mode === 'daily' ? 120 : 250);
  const niceStep = rawMax <= 200 ? 50 : rawMax <= 600 ? 150 : rawMax <= 1200 ? 300 : Math.ceil(rawMax / 4 / 100) * 100;
  const maxVal = Math.max(niceStep * 4, rawMax);

  const coords = points.map((p, idx) => {
    const val = mode === 'daily' ? p.dailyXp : p.cumulativeXp;
    const x =
      points.length <= 1
        ? PAD_LEFT + plotWidth / 2
        : PAD_LEFT + (idx / (points.length - 1)) * plotWidth;
    const y = PAD_TOP + plotHeight - (val / maxVal) * plotHeight;
    return { x, y, val, point: p };
  });

  const linePath = coords
    .map((c, idx) => `${idx === 0 ? 'M' : 'L'} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`)
    .join(' ');

  const areaPath =
    coords.length > 0
      ? `${linePath} L ${coords[coords.length - 1].x.toFixed(1)} ${(PAD_TOP + plotHeight).toFixed(1)} L ${coords[0].x.toFixed(1)} ${(PAD_TOP + plotHeight).toFixed(1)} Z`
      : '';

  const defaultSelectedIdx = points.length - 1;
  const activeIdx =
    hoveredIdx !== null && hoveredIdx >= 0 && hoveredIdx < coords.length
      ? hoveredIdx
      : defaultSelectedIdx;
  const activeCoord = coords[activeIdx];

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((ratio) => ({
    value: Math.round(maxVal * ratio),
    y: PAD_TOP + plotHeight - ratio * plotHeight,
  }));

  const xLabelIndices =
    windowDays === 7
      ? [0, 1, 2, 3, 4, 5, 6]
      : [0, 5, 10, 15, 20, 25, 29];

  const avgLineY =
    mode === 'daily' && avgDailyXp > 0
      ? PAD_TOP + plotHeight - (avgDailyXp / maxVal) * plotHeight
      : null;

  const updateIndexFromPointer = (e: PointerEvent<SVGRectElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (!rect.width) return;
    const relX = ((e.clientX - rect.left) / rect.width) * plotWidth;
    const ratio = Math.max(0, Math.min(1, relX / plotWidth));
    const idx = Math.round(ratio * Math.max(1, points.length - 1));
    setHoveredIdx(idx);
  };

  const handleKeyDown = (e: KeyboardEvent<SVGSVGElement>) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setHoveredIdx((prev) => Math.max(0, (prev ?? defaultSelectedIdx) - 1));
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      setHoveredIdx((prev) => Math.min(points.length - 1, (prev ?? defaultSelectedIdx) + 1));
    }
  };

  return (
    <section
      className="rpg-panel state-card p-5 sm:p-6 space-y-5"
      data-tilt-subtle="true"
      aria-labelledby="xp-chart-heading"
    >
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-white/10">
        <div className="space-y-1">
          <div className="depth-layer-1 flex items-center gap-2 text-xs text-[#c59b27]">
            <TrendingUp className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span className="font-epic tracking-wider">Caderno de Disciplina Diária</span>
          </div>
          <h2 id="xp-chart-heading" className="depth-layer-2 font-epic text-base sm:text-lg text-[#f3ead6]">
            Evolução de XP · Últimos {windowDays} Dias
          </h2>
          <p className="depth-layer-1 text-sm text-[#9e9380]">
            Passe o cursor ou toque sobre a linha para inspecionar a constância diária do Comandante.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div
            className="inline-flex p-1 rounded-lg bg-[#0e1013] border border-white/10"
            role="group"
            aria-label="Modo de exibição do gráfico de XP"
          >
            <button
              type="button"
              onClick={() => setMode('daily')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-colors min-h-[36px] ${
                mode === 'daily'
                  ? 'bg-[#c59b27] text-[#101215]'
                  : 'text-[#9e9380] hover:text-[#f3ead6]'
              }`}
            >
              Diário
            </button>
            <button
              type="button"
              onClick={() => setMode('cumulative')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-colors min-h-[36px] ${
                mode === 'cumulative'
                  ? 'bg-[#c59b27] text-[#101215]'
                  : 'text-[#9e9380] hover:text-[#f3ead6]'
              }`}
            >
              Acumulado
            </button>
          </div>

          <div
            className="inline-flex p-1 rounded-lg bg-[#0e1013] border border-white/10"
            role="group"
            aria-label="Janela de dias do gráfico de XP"
          >
            <button
              type="button"
              onClick={() => {
                setWindowDays(7);
                setHoveredIdx(null);
              }}
              className={`px-3 py-1.5 rounded-md text-xs font-mono-num font-semibold cursor-pointer transition-colors min-h-[36px] ${
                windowDays === 7
                  ? 'bg-[#2a2f36] text-[#f3ead6] border border-[#c59b27]/45'
                  : 'text-[#9e9380] hover:text-[#f3ead6]'
              }`}
            >
              7d
            </button>
            <button
              type="button"
              onClick={() => {
                setWindowDays(30);
                setHoveredIdx(null);
              }}
              className={`px-3 py-1.5 rounded-md text-xs font-mono-num font-semibold cursor-pointer transition-colors min-h-[36px] ${
                windowDays === 30
                  ? 'bg-[#2a2f36] text-[#f3ead6] border border-[#c59b27]/45'
                  : 'text-[#9e9380] hover:text-[#f3ead6]'
              }`}
            >
              30d
            </button>
          </div>
        </div>
      </div>

      {/* KPIs de Consistência sem caixas redundantes */}
      <div className="depth-layer-2 grid grid-cols-2 sm:grid-cols-4 gap-4 pb-1">
        <div>
          <div className="text-[11px] text-[#9e9380]">Ganho em {windowDays} dias</div>
          <div className="depth-layer-3 font-mono-num text-lg sm:text-xl font-bold text-[#e4c770]">
            +{periodXp.toLocaleString('pt-BR')} XP
          </div>
          <div className="text-[11px] font-mono-num text-[#877c69]">
            Total geral: {totalXp.toLocaleString('pt-BR')} XP
          </div>
        </div>

        <div>
          <div className="text-[11px] text-[#9e9380]">Média por dia</div>
          <div className="depth-layer-3 font-mono-num text-lg sm:text-xl font-bold text-[#f3ead6]">
            {avgDailyXp.toLocaleString('pt-BR')} XP
          </div>
          <div className="text-[11px] font-mono-num text-[#877c69]">
            Pico: +{bestDayXp.toLocaleString('pt-BR')} XP
          </div>
        </div>

        <div>
          <div className="text-[11px] text-[#9e9380]">Dias ativos</div>
          <div className="depth-layer-3 font-mono-num text-lg sm:text-xl font-bold text-emerald-400">
            {activeDays} / {windowDays}
          </div>
          <div className="text-[11px] font-mono-num text-[#877c69]">
            {Math.round((activeDays / windowDays) * 100)}% de presença
          </div>
        </div>

        <div>
          <div className="text-[11px] text-[#9e9380]">Sequência atual</div>
          <div className="depth-layer-3 flex items-center gap-1.5 font-mono-num text-lg sm:text-xl font-bold text-amber-300">
            <Flame className="w-4 h-4 text-[#c59b27] shrink-0" aria-hidden="true" />
            <span>
              {currentStreakDays} {currentStreakDays === 1 ? 'dia' : 'dias'}
            </span>
          </div>
          <div className="text-[11px] text-[#877c69]">
            {currentStreakDays > 0 ? 'Fogo aceso na muralha' : 'Pontue hoje para acender'}
          </div>
        </div>
      </div>

      {/* Área do Gráfico Interativo */}
      <div className="parchment-box p-3 sm:p-4 space-y-3">
        {activeCoord && (
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-white/10 text-xs">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-[#e4c770]" aria-hidden="true" />
              <span className="font-semibold text-[#f3ead6] capitalize">
                {activeCoord.point.fullLabel}
              </span>
              {activeIdx === points.length - 1 && (
                <span className="text-[11px] font-mono-num text-[#c59b27]">(Hoje)</span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-4 font-mono-num">
              <span className="text-[#e4c770] font-semibold">
                No dia: +{activeCoord.point.dailyXp.toLocaleString('pt-BR')} XP
              </span>
              <span className="text-[#9e9380]">
                Acumulado: {activeCoord.point.cumulativeXp.toLocaleString('pt-BR')} XP
              </span>
            </div>
          </div>
        )}

        <div className="relative w-full">
          <svg
            viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
            className="w-full h-auto block select-none focus:outline-none focus-visible:ring-1 focus-visible:ring-[#c59b27] rounded"
            role="img"
            tabIndex={0}
            onKeyDown={handleKeyDown}
            aria-label={`Gráfico de linha de XP ganho nos últimos ${windowDays} dias. Use as setas esquerda e direita para navegar pelos dias.`}
          >
            <defs>
              <linearGradient id="xpAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#c59b27" stopOpacity="0.34" />
                <stop offset="70%" stopColor="#996d1a" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#14171c" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="xpLineGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#996d1a" />
                <stop offset="50%" stopColor="#e4c770" />
                <stop offset="100%" stopColor="#f5dfa0" />
              </linearGradient>
            </defs>

            {/* Linhas horizontais de grade */}
            {yTicks.map((tick) => (
              <g key={tick.value}>
                <line
                  x1={PAD_LEFT}
                  y1={tick.y}
                  x2={SVG_WIDTH - PAD_RIGHT}
                  y2={tick.y}
                  stroke="rgba(255,255,255,0.08)"
                  strokeDasharray={tick.value === 0 ? undefined : '3 4'}
                  strokeWidth={1}
                />
                <text
                  x={PAD_LEFT - 8}
                  y={tick.y + 3.5}
                  textAnchor="end"
                  fill="#877c69"
                  fontSize="10"
                  fontFamily="JetBrains Mono, monospace"
                >
                  {tick.value}
                </text>
              </g>
            ))}

            {/* Linha de média no modo Diário */}
            {avgLineY !== null && (
              <g>
                <line
                  x1={PAD_LEFT}
                  y1={avgLineY}
                  x2={SVG_WIDTH - PAD_RIGHT}
                  y2={avgLineY}
                  stroke="rgba(16, 185, 129, 0.45)"
                  strokeDasharray="5 4"
                  strokeWidth={1}
                />
                <text
                  x={SVG_WIDTH - PAD_RIGHT}
                  y={avgLineY - 5}
                  textAnchor="end"
                  fill="#34d399"
                  fontSize="9.5"
                  fontFamily="JetBrains Mono, monospace"
                >
                  média {avgDailyXp} XP
                </text>
              </g>
            )}

            {/* Preenchimento em área + linha principal */}
            {areaPath && <path d={areaPath} fill="url(#xpAreaGradient)" />}
            {linePath && (
              <path
                d={linePath}
                fill="none"
                stroke="url(#xpLineGradient)"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Crosshair vertical no ponto selecionado */}
            {activeCoord && (
              <line
                x1={activeCoord.x}
                y1={PAD_TOP}
                x2={activeCoord.x}
                y2={PAD_TOP + plotHeight}
                stroke="rgba(228, 199, 112, 0.42)"
                strokeDasharray="3 3"
                strokeWidth={1}
              />
            )}

            {/* Pontos ao longo da linha */}
            {coords.map((c, idx) => {
              const isSelected = idx === activeIdx;
              const hasValue = c.val > 0;
              if (!isSelected && !hasValue && windowDays === 30) return null;
              return (
                <g key={c.point.dateKey}>
                  {isSelected && (
                    <circle
                      cx={c.x}
                      cy={c.y}
                      r={9}
                      fill="rgba(197, 155, 39, 0.22)"
                    />
                  )}
                  <circle
                    cx={c.x}
                    cy={c.y}
                    r={isSelected ? 4.5 : hasValue ? 2.6 : 1.8}
                    fill={isSelected ? '#f5dfa0' : hasValue ? '#c59b27' : '#4a5059'}
                    stroke="#111317"
                    strokeWidth={isSelected ? 2 : 1}
                  />
                </g>
              );
            })}

            {/* Eixo X com datas */}
            {xLabelIndices.map((idx) => {
              const c = coords[idx];
              if (!c) return null;
              const isLast = idx === points.length - 1;
              return (
                <text
                  key={c.point.dateKey}
                  x={c.x}
                  y={SVG_HEIGHT - 8}
                  textAnchor={idx === 0 ? 'start' : isLast ? 'end' : 'middle'}
                  fill={idx === activeIdx ? '#e4c770' : '#877c69'}
                  fontSize="10"
                  fontFamily="JetBrains Mono, monospace"
                >
                  {isLast ? 'Hoje' : c.point.shortLabel}
                </text>
              );
            })}

            {/* Área interativa de hover e toque (scrubbing) */}
            <rect
              x={PAD_LEFT}
              y={PAD_TOP}
              width={plotWidth}
              height={plotHeight}
              fill="transparent"
              className="cursor-crosshair"
              style={{ touchAction: 'pan-y' }}
              onPointerMove={updateIndexFromPointer}
              onPointerDown={updateIndexFromPointer}
              onPointerLeave={() => setHoveredIdx(null)}
            />
          </svg>
        </div>

        {periodXp === 0 && (
          <p className="text-xs text-[#9e9380] italic text-center pt-1">
            Nenhum ganho de XP registrado nos últimos {windowDays} dias ainda — conclua um ponto do Oráculo, um dever de São José ou um depósito nas Arcas para iniciar a curva.
          </p>
        )}
      </div>
    </section>
  );
}
