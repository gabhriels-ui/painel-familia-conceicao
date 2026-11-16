import { useEffect, useState } from 'react';
import {
  Baby,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  Compass,
  HeartPulse,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';
import {
  calculateGestationSnapshot,
  PREGNANCY_WEEK_MILESTONES,
  TOTAL_GESTATION_DAYS,
  type GestationalWeekMilestone,
} from '../data/pregnancyMilestones';

function BotanicalEmblemSvg({
  tone,
  week,
}: {
  tone: GestationalWeekMilestone['fruitTone'];
  week: number;
}) {
  const palette =
    tone === 'crimson'
      ? { ring: '#dc2626', fillA: '#991b1b', fillB: '#f87171', leaf: '#10b981' }
      : tone === 'emerald'
      ? { ring: '#10b981', fillA: '#065f46', fillB: '#34d399', leaf: '#a7f3d0' }
      : tone === 'amber'
      ? { ring: '#d97706', fillA: '#92400e', fillB: '#fbbf24', leaf: '#10b981' }
      : { ring: '#c59b27', fillA: '#7d5d28', fillB: '#f2d987', leaf: '#10b981' };

  // Tamanho visual cresce proporcionalmente à semana dentro do brasão
  const coreRadius = Math.min(20, 7 + Math.round((week / 40) * 13));

  return (
    <svg
      viewBox="0 0 72 72"
      className="w-16 h-16 shrink-0"
      aria-hidden="true"
    >
      <circle
        cx="36"
        cy="36"
        r="32"
        fill="#101215"
        stroke={palette.ring}
        strokeWidth="1.5"
        strokeOpacity="0.65"
      />
      <circle
        cx="36"
        cy="36"
        r="27"
        fill="none"
        stroke="#c59b27"
        strokeWidth="0.75"
        strokeDasharray="3 3"
        strokeOpacity="0.45"
      />
      {/* Caule e folha */}
      <path
        d="M36 16 C36 12, 39 10, 42 10"
        fill="none"
        stroke="#a67c32"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M37 15 C42 10, 49 11, 48 16 C45 19, 39 18, 37 15 Z"
        fill={palette.leaf}
        fillOpacity="0.88"
      />
      {/* Fruto / Semente estilizado */}
      <circle
        cx="36"
        cy="39"
        r={coreRadius}
        fill={palette.fillA}
        stroke={palette.fillB}
        strokeWidth="1.6"
      />
      <ellipse
        cx={36 - coreRadius * 0.28}
        cy={39 - coreRadius * 0.32}
        rx={Math.max(2, coreRadius * 0.28)}
        ry={Math.max(1.2, coreRadius * 0.16)}
        transform={`rotate(-25 ${36 - coreRadius * 0.28} ${39 - coreRadius * 0.32})`}
        fill="#ffffff"
        fillOpacity="0.28"
      />
    </svg>
  );
}

export function PaternalPregnancyMonitor() {
  const [now, setNow] = useState<Date>(() => new Date());
  const snapshot = calculateGestationSnapshot(now);
  const [inspectedWeek, setInspectedWeek] = useState<number | null>(null);

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

  const displayedWeek = inspectedWeek ?? snapshot.currentWeekNumber;
  const isLiveWeek = displayedWeek === snapshot.currentWeekNumber;

  const displayedMilestone =
    PREGNANCY_WEEK_MILESTONES.find((m) => m.week === displayedWeek) ||
    snapshot.milestone;

  return (
    <section
      className="cathedral-glass state-card p-5 sm:p-6 flex flex-col justify-between gap-4"
      aria-labelledby="paternal-pregnancy-heading"
    >
      <div className="space-y-4">
        {/* Topo: Contador de dias restantes até o parto (30/06/2027) + barra dourada com pulso sutil */}
        <div className="depth-layer-2 rounded-lg bg-[#110f0c]/85 border border-[#eab308]/35 p-3.5 space-y-2.5 shadow-[inset_0_1px_0_rgba(253,224,71,0.14)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-md bg-[#2a2112] border border-[#eab308]/45 flex items-center justify-center shrink-0">
                <CalendarClock className="w-4 h-4 text-[#fde047]" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-[11px] font-epic tracking-wide text-[#e4c770]">
                  <span
                    className="inline-block w-1.5 h-1.5 rounded-full bg-[#fde047] golden-pulse-dot shrink-0"
                    aria-hidden="true"
                  />
                  <span>Contagem Regressiva até o Parto · 30/06/2027</span>
                </div>
                <div className="text-[11px] font-mono-num text-[#a69982]">
                  Jornada real: {snapshot.elapsedDays} / {TOTAL_GESTATION_DAYS} dias ({snapshot.progressPct.toFixed(1)}%)
                </div>
              </div>
            </div>

            <div className="depth-layer-3 text-right font-mono-num shrink-0">
              {snapshot.remainingDays === 0 ? (
                <div className="font-epic text-sm sm:text-base font-bold text-[#fde047]">
                  Chegada do Herdeiro!
                </div>
              ) : (
                <div className="flex items-baseline gap-1.5 justify-end">
                  <span className="text-xl sm:text-2xl font-bold text-[#fde047] leading-none">
                    {snapshot.remainingDays}
                  </span>
                  <span className="text-xs text-[#dfc168] font-semibold">
                    {snapshot.remainingDays === 1 ? 'dia restante' : 'dias restantes'}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div
            className="w-full h-3 bg-[#0c0a08] rounded-sm overflow-hidden border border-[#eab308]/45 shadow-[inset_0_1px_2px_rgba(0,0,0,0.85)]"
            role="progressbar"
            aria-valuenow={Math.round(snapshot.progressPct)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Contagem regressiva e progresso da gestação até 30/06/2027"
          >
            <div
              className="h-full bg-gradient-to-r from-[#854d0e] via-[#eab308] to-[#fde047] transition-all duration-500 golden-pulse-bar shadow-[0_0_12px_rgba(234,179,8,0.45)]"
              style={{ width: `${snapshot.progressPct}%` }}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-start justify-between gap-3 pb-3.5 border-b border-[#7d5d28]/35">
          <div className="space-y-1">
            <div className="depth-layer-1 flex items-center gap-2 text-xs font-epic text-[#c59b27]">
              <Baby className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Sala de Comando Paterno · Monitor de Gestação</span>
            </div>
            <h2
              id="paternal-pregnancy-heading"
              className="depth-layer-3 font-epic text-lg sm:text-xl text-[#f3ead6]"
            >
              {snapshot.completedWeeks} Semanas e {snapshot.extraDays}{' '}
              {snapshot.extraDays === 1 ? 'Dia' : 'Dias'}
            </h2>
            <div className="depth-layer-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs font-mono-num text-[#a69982]">
              <span>DUM: 23/09/2026</span>
              <span aria-hidden="true">·</span>
              <span>DPP: 30/06/2027</span>
              <span aria-hidden="true">·</span>
              <span className="text-[#dfc168] font-semibold">
                {isLiveWeek
                  ? `${snapshot.trimester}º Trimestre (${snapshot.currentWeekNumber}ª semana)`
                  : `Prévia: ${displayedWeek}ª semana (${displayedMilestone.trimester}º Trimestre)`}
              </span>
            </div>
          </div>

          <div className="depth-layer-2 flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              disabled={displayedWeek <= 1}
              onClick={() => setInspectedWeek(Math.max(1, displayedWeek - 1))}
              aria-label="Semana gestacional anterior"
              className="rpg-btn-iron p-2 rounded-lg cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => setInspectedWeek(null)}
              disabled={isLiveWeek}
              title="Voltar para a semana atual em tempo real"
              className={`px-3 py-2 rounded-lg text-xs font-epic whitespace-nowrap shrink-0 min-h-[40px] border transition-colors flex items-center gap-1.5 ${
                isLiveWeek
                  ? 'bg-[#c59b27] text-[#101215] border-[#e4c770] cursor-default'
                  : 'rpg-btn-iron text-[#e4c770] cursor-pointer'
              }`}
            >
              {!isLiveWeek && <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />}
              <span>Sem. {displayedWeek}/40</span>
            </button>
            <button
              type="button"
              disabled={displayedWeek >= 40}
              onClick={() => setInspectedWeek(Math.min(40, displayedWeek + 1))}
              aria-label="Próxima semana gestacional"
              className="rpg-btn-iron p-2 rounded-lg cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Card comparativo Fruta/Semente + Medidas */}
        <div className="depth-layer-2 parchment-box p-4 flex items-center gap-4">
          <div className="depth-layer-3 shrink-0">
            <BotanicalEmblemSvg
              tone={displayedMilestone.fruitTone}
              week={displayedMilestone.week}
            />
          </div>
          <div className="min-w-0 space-y-1 flex-1">
            <div className="text-xs font-epic text-[#c59b27]">
              Tamanho na {displayedMilestone.week}ª Semana
            </div>
            <div className="depth-layer-3 font-epic text-base sm:text-lg text-[#f3ead6] leading-snug">
              {displayedMilestone.fruitComparison}
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-0.5 text-xs font-mono-num text-[#a69982]">
              <span>
                Comprimento: <strong className="text-[#e4d7be]">{displayedMilestone.sizeApprox}</strong>
              </span>
              <span>
                Peso est.: <strong className="text-[#e4d7be]">{displayedMilestone.weightApprox}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Desenvolvimento dos Órgãos */}
        <div className="depth-layer-2 space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-epic text-emerald-400">
            <HeartPulse className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Desenvolvimento dos Órgãos · Semana {displayedMilestone.week}</span>
          </div>
          <p className="text-sm text-[#e4d7be] leading-relaxed">
            {displayedMilestone.organDevelopment}
          </p>
        </div>
      </div>

      {/* Diretriz de Apoio Paterno */}
      <div className="pt-3.5 border-t border-[#7d5d28]/35 space-y-1.5">
        <div className="flex items-center justify-between gap-2 text-xs font-epic text-[#dfc168]">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Diretriz de Apoio Paterno</span>
          </span>
          {!isLiveWeek && (
            <button
              type="button"
              onClick={() => setInspectedWeek(null)}
              className="inline-flex items-center gap-1 text-[11px] font-sans font-semibold text-[#c59b27] hover:text-[#f3ead6] underline cursor-pointer"
            >
              <Compass className="w-3 h-3" aria-hidden="true" />
              <span>Ir para semana real ({snapshot.currentWeekNumber}ª)</span>
            </button>
          )}
        </div>
        <p className="text-sm text-[#d5c7b0] italic leading-relaxed">
          “{displayedMilestone.paternalDirective}”
        </p>
      </div>
    </section>
  );
}
