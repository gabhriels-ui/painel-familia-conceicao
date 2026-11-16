import { useMemo, useState, type CSSProperties } from 'react';
import {
  AlertTriangle,
  BellRing,
  BookOpenCheck,
  Calendar,
  Check,
  Cross,
  Flame,
  HeartHandshake,
  Plus,
  Shield,
  ShieldCheck,
  Sparkles,
  Sun,
  Trash2,
} from 'lucide-react';
import { SPIRITUAL_ACTS, SPIRITUAL_DAILY_GOALS } from '../data/chroniclesData';
import type {
  SpiritualActType,
  SpiritualAlertLevel,
  SpiritualLog,
  SpiritualState,
} from '../types/chronicles';
import { formatDateBr } from '../utils/scheduleConflicts';
import {
  computeSpiritualMultiplier,
  evaluateSoulWatchAlert,
  getEffectiveSpiritualDailyGoals,
  getLocalDateStr,
  getSpiritualActDefinition,
} from '../utils/spiritual';
import { SpiritualXpChart } from './SpiritualXpChart';

interface EspiritualModuleCardProps {
  spiritual: SpiritualState;
  spiritualLogs: SpiritualLog[];
  pmShiftDates?: string[];
  onLogSpiritualAct: (data: {
    actType: SpiritualActType;
    dateStr: string;
    notes: string;
  }) => void;
  onDeleteSpiritualLog: (logId: string) => void;
  onTogglePmDutyMode: () => void;
}

type LogCategoryFilter = 'todos' | 'diaria' | 'devocao' | 'sacramento';

interface SacredPalette {
  core: string;
  halo: string;
  beamTop: string;
  beamBottom: string;
  mote: string;
  ringStroke: string;
  barClass: string;
}

function getSacredPalette(
  alertLevel: SpiritualAlertLevel,
  strengthPct: number,
  isPmDutyActive: boolean
): SacredPalette {
  if (alertLevel === 'critico') {
    return {
      core: '#f87171',
      halo: 'rgba(239, 68, 68, 0.36)',
      beamTop: 'rgba(248, 113, 113, 0.38)',
      beamBottom: 'rgba(153, 27, 27, 0.04)',
      mote: '#fca5a5',
      ringStroke: 'rgba(248, 113, 113, 0.55)',
      barClass: 'from-red-800 via-red-500 to-amber-400',
    };
  }
  if (alertLevel === 'afastamento') {
    return {
      core: '#fb923c',
      halo: 'rgba(249, 115, 22, 0.34)',
      beamTop: 'rgba(251, 146, 60, 0.36)',
      beamBottom: 'rgba(194, 65, 12, 0.05)',
      mote: '#fdba74',
      ringStroke: 'rgba(251, 146, 60, 0.58)',
      barClass: 'from-orange-700 via-amber-500 to-yellow-300',
    };
  }
  if (alertLevel === 'vigilia') {
    return {
      core: '#fbbf24',
      halo: 'rgba(245, 158, 11, 0.36)',
      beamTop: 'rgba(251, 191, 36, 0.36)',
      beamBottom: 'rgba(180, 83, 9, 0.05)',
      mote: '#fde68a',
      ringStroke: 'rgba(251, 191, 36, 0.62)',
      barClass: 'from-amber-700 via-amber-400 to-yellow-200',
    };
  }
  if (isPmDutyActive) {
    return {
      core: '#fef08a',
      halo: 'rgba(250, 204, 21, 0.46)',
      beamTop: 'rgba(254, 240, 138, 0.52)',
      beamBottom: 'rgba(234, 179, 8, 0.08)',
      mote: '#fef9c3',
      ringStroke: 'rgba(253, 224, 71, 0.85)',
      barClass: 'from-[#854d0e] via-[#eab308] to-[#fef9c3]',
    };
  }
  if (strengthPct >= 75) {
    return {
      core: '#fef08a',
      halo: 'rgba(253, 224, 71, 0.42)',
      beamTop: 'rgba(254, 240, 138, 0.44)',
      beamBottom: 'rgba(234, 179, 8, 0.06)',
      mote: '#fef9c3',
      ringStroke: 'rgba(253, 224, 71, 0.72)',
      barClass: 'from-[#a16207] via-[#eab308] to-[#fef08a]',
    };
  }
  return {
    core: '#eab308',
    halo: 'rgba(234, 179, 8, 0.32)',
    beamTop: 'rgba(234, 179, 8, 0.34)',
    beamBottom: 'rgba(161, 98, 7, 0.05)',
    mote: '#fde047',
    ringStroke: 'rgba(234, 179, 8, 0.58)',
    barClass: 'from-[#854d0e] via-[#ca8a04] to-[#fde047]',
  };
}

function SacredSoulStage3D({
  strengthPct,
  alertLevel,
  hasSeal,
  isPmDutyActive,
}: {
  strengthPct: number;
  alertLevel: SpiritualAlertLevel;
  hasSeal: boolean;
  isPmDutyActive: boolean;
}) {
  const palette = getSacredPalette(alertLevel, strengthPct, isPmDutyActive);
  const intensity = 0.32 + (strengthPct / 100) * 0.68;
  const activeMotesCount =
    alertLevel === 'critico' ? 3 : Math.max(4, Math.min(10, Math.round(strengthPct / 10)));

  const motes = [
    { left: '30%', top: '76%', size: 4, dx: '-7px', z: '18px', dur: '3.2s', delay: '0s' },
    { left: '50%', top: '80%', size: 5, dx: '3px', z: '32px', dur: '3.8s', delay: '0.5s' },
    { left: '70%', top: '75%', size: 4, dx: '8px', z: '22px', dur: '3.0s', delay: '1.1s' },
    { left: '40%', top: '72%', size: 3.5, dx: '-5px', z: '38px', dur: '3.6s', delay: '1.6s' },
    { left: '61%', top: '74%', size: 4.5, dx: '6px', z: '28px', dur: '3.4s', delay: '2.0s' },
    { left: '24%', top: '68%', size: 3, dx: '-4px', z: '14px', dur: '4.1s', delay: '0.8s' },
    { left: '76%', top: '69%', size: 3.5, dx: '5px', z: '36px', dur: '3.9s', delay: '2.4s' },
    { left: '46%', top: '84%', size: 4, dx: '-2px', z: '42px', dur: '3.3s', delay: '1.4s' },
    { left: '55%', top: '66%', size: 3, dx: '4px', z: '44px', dur: '4.2s', delay: '2.8s' },
    { left: '35%', top: '82%', size: 3.5, dx: '-6px', z: '24px', dur: '3.5s', delay: '0.3s' },
  ].slice(0, activeMotesCount);

  return (
    <div
      className="sacred-3d-stage w-36 h-36 sm:w-40 sm:h-40 shrink-0 relative select-none"
      role="img"
      aria-label={`Luz Sagrada 3D em ${strengthPct}%${isPmDutyActive ? ' · Fortitude no Plantão PMSE ativa' : ''}`}
    >
      <div className="sacred-3d-rig relative w-full h-full">
        {/* Camada Z = -18px: Abside gótica em ferro forjado e ouro */}
        <div
          className="sacred-3d-layer absolute inset-0 pointer-events-none"
          style={{ transform: 'translateZ(-18px)' }}
        >
          <svg viewBox="0 0 140 140" className="w-full h-full">
            <defs>
              <radialGradient id="apseFloorGlow3d" cx="50%" cy="62%" r="52%">
                <stop offset="0%" stopColor={palette.halo} />
                <stop offset="100%" stopColor="rgba(10, 8, 6, 0)" />
              </radialGradient>
            </defs>
            <path
              d="M18,128 L18,56 Q18,16 70,7 Q122,16 122,56 L122,128 Z"
              fill="#0b0907"
              stroke={palette.ringStroke}
              strokeWidth="1.8"
            />
            <path
              d="M25,123 L25,58 Q25,24 70,15 Q115,24 115,58 L115,123 Z"
              fill="url(#apseFloorGlow3d)"
              stroke="rgba(255, 255, 255, 0.09)"
              strokeWidth="1"
            />
            <rect
              x="28"
              y="119"
              width="84"
              height="9"
              rx="2"
              fill="#1c150e"
              stroke="rgba(234, 179, 8, 0.55)"
              strokeWidth="1.1"
            />
          </svg>
        </div>

        {/* Camada Z = -6px: Colunas volumétricas de luz sacra ascensional */}
        <div
          className="sacred-3d-layer sacred-3d-beam-sweep absolute inset-0 pointer-events-none"
          style={
            {
              '--beam-opacity-min': (0.28 + (strengthPct / 100) * 0.32).toFixed(2),
              '--beam-opacity-max': (0.55 + (strengthPct / 100) * 0.43).toFixed(2),
            } as CSSProperties
          }
        >
          <svg viewBox="0 0 140 140" className="w-full h-full">
            <defs>
              <linearGradient id="sacredBeam3dGrad" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor={palette.beamBottom} />
                <stop offset="48%" stopColor={palette.halo} />
                <stop offset="100%" stopColor={palette.beamTop} />
              </linearGradient>
            </defs>
            <polygon points="46,16 94,16 112,122 28,122" fill="url(#sacredBeam3dGrad)" />
            <polygon
              points="58,18 82,18 92,122 48,122"
              fill={palette.beamTop}
              opacity={intensity * 0.62}
            />
          </svg>
        </div>

        {/* Camada Z = +8px: Anel orbital inclinado em 3D */}
        <div
          className="sacred-3d-layer sacred-3d-ring-spin absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{ opacity: intensity }}
        >
          <div
            className="w-24 h-24 rounded-full border border-dashed"
            style={{
              borderColor: palette.ringStroke,
              boxShadow: `0 0 16px ${palette.halo}, inset 0 0 12px ${palette.halo}`,
            }}
          />
        </div>

        {/* Camada Z = +16px: Segundo halo contra-rotativo (Selo ou Plantão) */}
        <div
          className="sacred-3d-layer sacred-3d-ring-counter absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{ opacity: hasSeal || isPmDutyActive ? Math.min(1, intensity + 0.15) : intensity * 0.72 }}
        >
          <div
            className="w-20 h-20 rounded-full border"
            style={{
              borderColor: palette.core,
              borderWidth: hasSeal || isPmDutyActive ? '1.8px' : '1px',
              boxShadow: `0 0 18px ${palette.halo}`,
            }}
          />
        </div>

        {/* Camada Z = +24px: Núcleo radiante etéreo */}
        <div
          className="sacred-3d-layer absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{ transform: 'translateZ(24px)', opacity: intensity }}
        >
          <div
            className="w-16 h-16 rounded-full"
            style={{
              background: `radial-gradient(circle, rgba(255,255,255,0.92) 0%, ${palette.core} 42%, transparent 74%)`,
              filter: `drop-shadow(0 0 16px ${palette.core})`,
            }}
          />
        </div>

        {/* Camada Z = +36px: Cruz Sagrada em Relevo + Escudo (quando em Plantão PMSE) */}
        <div className="sacred-3d-layer sacred-3d-crest-float absolute inset-0 flex items-center justify-center pointer-events-none">
          <svg
            viewBox="0 0 100 100"
            className="w-20 h-20"
            style={{ filter: 'drop-shadow(0 8px 10px rgba(0, 0, 0, 0.85))' }}
          >
            {isPmDutyActive && (
              <path
                d="M50,14 L76,25 L74,56 C72,72 60,82 50,87 C40,82 28,72 26,56 L24,25 Z"
                fill="rgba(22, 26, 33, 0.78)"
                stroke="#fde047"
                strokeWidth="2.2"
              />
            )}
            <rect
              x="45.5"
              y="22"
              width="9"
              height="56"
              rx="2"
              fill={palette.core}
              stroke="#1f1407"
              strokeWidth="1.2"
            />
            <rect
              x="29"
              y="38"
              width="42"
              height="9"
              rx="2"
              fill={palette.core}
              stroke="#1f1407"
              strokeWidth="1.2"
            />
            <circle cx="50" cy="42.5" r="3" fill="#fffbeb" opacity={hasSeal || isPmDutyActive ? 1 : 0.78} />
          </svg>
        </div>

        {/* Camada Z = +18..44px: Partículas Ascensionais 3D */}
        <div className="sacred-3d-layer absolute inset-0 pointer-events-none overflow-hidden rounded-lg">
          {motes.map((m, i) => (
            <span
              key={i}
              className="sacred-3d-mote absolute rounded-full"
              style={
                {
                  left: m.left,
                  top: m.top,
                  width: `${m.size}px`,
                  height: `${m.size}px`,
                  background: `radial-gradient(circle, #ffffff 0%, ${palette.mote} 65%, transparent 100%)`,
                  boxShadow: `0 0 8px ${palette.core}`,
                  '--mote-dx': m.dx,
                  '--mote-z': m.z,
                  '--mote-dur': m.dur,
                  '--mote-delay': m.delay,
                } as CSSProperties
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}

const ALERT_STYLES: Record<
  SpiritualAlertLevel,
  {
    container: string;
    titleColor: string;
    iconBg: string;
    badgeText: string;
  }
> = {
  comunhao: {
    container: 'border-[#eab308]/45 bg-[#1b150c]/80',
    titleColor: 'text-[#fde047]',
    iconBg: 'bg-[#eab308]/15 border-[#eab308]/50 text-[#fde047]',
    badgeText: 'Em Comunhão',
  },
  vigilia: {
    container: 'border-amber-500/55 bg-amber-950/25',
    titleColor: 'text-amber-300',
    iconBg: 'bg-amber-900/40 border-amber-500/60 text-amber-300',
    badgeText: 'Chamado à Oração',
  },
  afastamento: {
    container: 'border-orange-500/65 bg-orange-950/30',
    titleColor: 'text-orange-300',
    iconBg: 'bg-orange-900/45 border-orange-500/70 text-orange-300',
    badgeText: 'Alerta de Afastamento',
  },
  critico: {
    container: 'border-red-500/75 bg-red-950/35',
    titleColor: 'text-red-300',
    iconBg: 'bg-red-900/50 border-red-500/75 text-red-300',
    badgeText: 'Vigília Crítica',
  },
};

export function EspiritualModuleCard({
  spiritual,
  spiritualLogs,
  pmShiftDates = [],
  onLogSpiritualAct,
  onDeleteSpiritualLog,
  onTogglePmDutyMode,
}: EspiritualModuleCardProps) {
  const todayStr = getLocalDateStr();
  const [selectedAct, setSelectedAct] = useState<SpiritualActType>('manha_noite');
  const [dateStr, setDateStr] = useState<string>(todayStr);
  const [notes, setNotes] = useState('');
  const [historyFilter, setHistoryFilter] = useState<LogCategoryFilter>('todos');

  const effectiveDaily = useMemo(
    () => getEffectiveSpiritualDailyGoals(spiritual, todayStr),
    [spiritual, todayStr]
  );

  const multiplierInfo = useMemo(
    () => computeSpiritualMultiplier(spiritual, spiritualLogs, todayStr),
    [spiritual, spiritualLogs, todayStr]
  );

  const soulWatch = useMemo(
    () => evaluateSoulWatchAlert(spiritual, spiritualLogs, todayStr),
    [spiritual, spiritualLogs, todayStr]
  );

  const palette = getSacredPalette(
    soulWatch.alertLevel,
    soulWatch.strengthPct,
    multiplierInfo.isPmDutyActive
  );
  const alertStyle = ALERT_STYLES[soulWatch.alertLevel];

  const todayLogs = useMemo(
    () => (spiritualLogs || []).filter((l) => l.dateStr === todayStr),
    [spiritualLogs, todayStr]
  );

  const filteredLogs = useMemo(() => {
    const list = spiritualLogs || [];
    if (historyFilter === 'todos') return list;
    return list.filter((l) => getSpiritualActDefinition(l.actType).category === historyFilter);
  }, [spiritualLogs, historyFilter]);

  const recentGraceLogs = useMemo(() => {
    return [...(spiritualLogs || [])]
      .sort((a, b) => {
        const byDate = (b.dateStr || '').localeCompare(a.dateStr || '');
        if (byDate !== 0) return byDate;
        return new Date(b.createdAtIso).getTime() - new Date(a.createdAtIso).getTime();
      })
      .slice(0, 5);
  }, [spiritualLogs]);

  const formMultiplierInfo = useMemo(
    () =>
      dateStr === todayStr
        ? multiplierInfo
        : computeSpiritualMultiplier(spiritual, spiritualLogs, dateStr),
    [dateStr, todayStr, multiplierInfo, spiritual, spiritualLogs]
  );

  const activeDef = getSpiritualActDefinition(selectedAct);
  const projectedXp = Math.round(activeDef.baseXp * formMultiplierInfo.multiplier);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogSpiritualAct({
      actType: selectedAct,
      dateStr: dateStr || todayStr,
      notes: notes.trim(),
    });
    setNotes('');
  };

  return (
    <section
      className="cathedral-glass state-card p-5 sm:p-6 space-y-6"
      data-tilt-subtle="true"
      aria-label="Módulo Espiritual: Força Espiritual e Conexão com Deus"
    >
      {/* Cabeçalho e Palco Sacral 3D + Barra de Força Espiritual */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 border-b border-[#eab308]/25 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 min-w-0">
          <div className="parchment-box p-2 flex items-center justify-center shrink-0 self-start">
            <SacredSoulStage3D
              strengthPct={soulWatch.strengthPct}
              alertLevel={soulWatch.alertLevel}
              hasSeal={multiplierInfo.hasSealOfCommunion}
              isPmDutyActive={multiplierInfo.isPmDutyActive}
            />
          </div>

          <div className="space-y-2 min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-epic text-[#c59b27]">
                Pilar Central · Conexão com Deus &amp; Graça
              </span>
              {multiplierInfo.hasSealOfCommunion && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#eab308]/20 border border-[#eab308]/60 text-[11px] font-semibold text-[#fef08a] whitespace-nowrap shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Selo de Comunhão</span>
                </span>
              )}
              {multiplierInfo.isPmDutyActive && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/20 border border-[#fde047]/65 text-[11px] font-semibold text-[#fef08a] whitespace-nowrap shrink-0">
                  <Shield className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Plantão PMSE · 2x XP</span>
                </span>
              )}
            </div>

            <h2 className="font-epic text-xl sm:text-2xl text-[#f3ead6] leading-tight">
              Força Espiritual &amp; Vigília da Alma
            </h2>

            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <span className="font-epic text-sm sm:text-base text-[#fde047]">
                {soulWatch.rank.title}
              </span>
              <span className="text-xs text-[#a89982]">{soulWatch.rank.subtitle}</span>
            </div>

            {/* Barra de Força Espiritual reativa */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="text-[#d5c7b0] font-semibold">
                  Barra de Força Espiritual
                </span>
                <span className="font-mono-num font-bold text-[#fde047]">
                  {soulWatch.strengthPct}% ·{' '}
                  {(spiritual?.spiritualXp || 0).toLocaleString('pt-BR')} XP Espiritual
                </span>
              </div>
              <div
                className="relative w-full h-3.5 bg-[#0f1013] rounded-md overflow-hidden border border-[#eab308]/35"
                role="progressbar"
                aria-valuenow={soulWatch.strengthPct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Nível da barra de Força Espiritual"
              >
                <div
                  className={`h-full bg-gradient-to-r ${palette.barClass} transition-all duration-500 relative overflow-hidden`}
                  style={{ width: `${soulWatch.strengthPct}%` }}
                >
                  <span
                    aria-hidden="true"
                    className="sacred-bar-radiance absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none"
                  />
                </div>
              </div>
            </div>

            {/* Card Compacto: Histórico de Graça (últimos 5 atos de piedade com fade-in) */}
            <div
              className="grace-history-fade-in rounded-lg border border-[#eab308]/25 bg-[#110e0a]/90 px-3.5 py-2.5 shadow-[inset_0_1px_0_rgba(253,224,71,0.08)] space-y-2"
              aria-label="Histórico de Graça: últimos 5 atos de piedade"
            >
              <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-1.5">
                <h3 className="font-epic text-xs sm:text-sm text-[#fde047]">
                  Histórico de Graça
                </h3>
                <span className="font-mono-num text-[11px] text-[#a89982]">
                  {recentGraceLogs.length === 0
                    ? '0/5 registros'
                    : `Últimos ${recentGraceLogs.length} de 5`}
                </span>
              </div>

              {recentGraceLogs.length === 0 ? (
                <div className="flex flex-wrap items-center justify-between gap-2 py-1">
                  <p className="text-xs text-[#a89982]">
                    Nenhum ato de piedade registrado ainda.
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      onLogSpiritualAct({
                        actType: 'manha_noite',
                        dateStr: todayStr,
                        notes: 'Primeiro registro no Histórico de Graça',
                      })
                    }
                    className="rpg-btn-iron px-3 py-1.5 rounded text-[11px] font-semibold cursor-pointer whitespace-nowrap shrink-0"
                  >
                    Registrar Oração
                  </button>
                </div>
              ) : (
                <ul className="divide-y divide-white/5">
                  {recentGraceLogs.map((log, idx) => {
                    const def = getSpiritualActDefinition(log.actType);
                    return (
                      <li
                        key={log.id}
                        className="grace-history-row py-1.5 first:pt-0.5 last:pb-0.5 flex items-center justify-between gap-3 text-xs"
                        style={{ '--grace-delay': `${idx * 55}ms` } as CSSProperties}
                      >
                        <div className="min-w-0 flex flex-wrap items-baseline gap-x-1.5">
                          <span className="font-medium text-[#f3ead6] truncate max-w-[220px] sm:max-w-[280px]">
                            {log.actLabel || def.label}
                          </span>
                          <span className="text-[11px] font-mono-num text-[#9e9380] whitespace-nowrap">
                            · {formatDateBr(log.dateStr)}
                            {log.multiplierApplied > 1
                              ? ` · ${log.multiplierApplied.toFixed(1)}x`
                              : ''}
                          </span>
                        </div>
                        <span className="font-mono-num font-bold text-[11px] text-[#fde047] whitespace-nowrap shrink-0">
                          +{log.xpGranted} XP
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Painel de Multiplicador & Novena de São José */}
        <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 shrink-0 lg:w-64">
          <div className="parchment-box p-3 space-y-1">
            <div className="flex items-center justify-between gap-2 text-[11px] text-[#c59b27] font-semibold">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Multiplicador Hoje</span>
              </span>
              <span className="font-mono-num font-bold text-[#fde047]">
                {multiplierInfo.multiplier.toFixed(1)}x
              </span>
            </div>
            <div className="text-xs font-semibold text-[#f3ead6]">{multiplierInfo.label}</div>
            <div className="text-[11px] text-[#a89982] leading-snug">
              {multiplierInfo.nextHint}
            </div>
          </div>

          <div className="parchment-box p-3 space-y-1">
            <div className="flex items-center justify-between gap-2 text-[11px] text-[#c59b27] font-semibold">
              <span className="flex items-center gap-1">
                <HeartHandshake className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Novena de São José</span>
              </span>
              <span className="font-mono-num font-bold text-[#fde047]">
                {spiritual?.novenaStreak || 0}{' '}
                {(spiritual?.novenaStreak || 0) === 1 ? 'dia' : 'dias'}
              </span>
            </div>
            <div className="text-[11px] text-[#d5c7b0] leading-snug">
              Ciclo {((Math.max(1, spiritual?.novenaStreak || 1) - 1) % 9) + 1}/9 · Gestação &amp; Matrimônio
            </div>
          </div>
        </div>
      </div>

      {/* Mecânica Tática: Fortitude no Plantão (24h) — Modo Plantão PMSE */}
      <div
        className={`rounded-lg border p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
          multiplierInfo.isPmDutyActive
            ? 'border-[#eab308]/80 bg-gradient-to-r from-[#241b0c]/95 via-[#1c160c]/95 to-[#151820]/95 shadow-[0_0_24px_rgba(234,179,8,0.16)]'
            : 'border-white/15 bg-[#121418]/90'
        }`}
      >
        <div className="flex items-start gap-3 min-w-0">
          <div
            className={`w-10 h-10 rounded-md border flex items-center justify-center shrink-0 ${
              multiplierInfo.isPmDutyActive
                ? 'bg-[#eab308]/20 border-[#fde047]/70 text-[#fde047]'
                : 'bg-[#1a1d24] border-white/15 text-[#9e9380]'
            }`}
          >
            <Shield className="w-5 h-5" aria-hidden="true" />
          </div>
          <div className="space-y-0.5 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-epic text-sm sm:text-base text-[#fef08a]">
                Fortitude no Plantão (24h) · 2ª Cia / 11º BPM
              </span>
              <span
                className={`px-2 py-0.5 rounded border text-[11px] font-mono-num whitespace-nowrap shrink-0 ${
                  multiplierInfo.isPmDutyActive
                    ? 'bg-[#eab308]/20 border-[#fde047]/65 text-[#fef08a]'
                    : 'bg-black/35 border-white/15 text-[#a89982]'
                }`}
              >
                {multiplierInfo.isPmDutyActive ? 'Ativo Hoje · 2x XP' : 'Modo Normal · 1x'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#e4d7be] leading-snug">
              {multiplierInfo.isPmDutyActive
                ? 'Todas as orações, dezenas e devoções concluídas hoje recebem XP Espiritual em dobro (2x), honrando a fidelidade a Deus sob escala de 24h.'
                : 'Em serviço operacional de 24h? Ative o Modo Plantão PMSE para dobrar (2x) o XP espiritual de cada oração registrada hoje e blindar sua vigília.'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onTogglePmDutyMode}
          aria-pressed={multiplierInfo.isPmDutyActive}
          className={`${
            multiplierInfo.isPmDutyActive ? 'rpg-btn-gold' : 'rpg-btn-iron'
          } px-4 py-2.5 rounded text-xs sm:text-sm font-epic flex items-center justify-center gap-2 whitespace-nowrap shrink-0 cursor-pointer min-h-[42px]`}
        >
          <ShieldCheck className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>
            {multiplierInfo.isPmDutyActive
              ? 'Modo Plantão PMSE Ativo (2x)'
              : 'Ativar Modo Plantão PMSE (2x XP)'}
          </span>
        </button>
      </div>

      {/* Sistema de Alerta de Afastamento (Vigília da Alma) */}
      <div
        role="status"
        className={`rounded-lg border p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${alertStyle.container} ${
          soulWatch.alertLevel === 'afastamento' || soulWatch.alertLevel === 'critico'
            ? 'soul-warning-pulse'
            : ''
        }`}
      >
        <div className="flex items-start gap-3 min-w-0">
          <div
            className={`w-9 h-9 rounded-md border flex items-center justify-center shrink-0 ${alertStyle.iconBg}`}
          >
            {soulWatch.alertLevel === 'comunhao' ? (
              <Sun className="w-4 h-4" aria-hidden="true" />
            ) : soulWatch.alertLevel === 'vigilia' ? (
              <BellRing className="w-4 h-4" aria-hidden="true" />
            ) : (
              <AlertTriangle className="w-4 h-4" aria-hidden="true" />
            )}
          </div>
          <div className="space-y-0.5 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`font-epic text-sm sm:text-base ${alertStyle.titleColor}`}>
                {soulWatch.title}
              </span>
              <span className="px-2 py-0.5 rounded bg-black/35 border border-white/15 text-[11px] font-mono-num text-[#efe3c8] whitespace-nowrap shrink-0">
                {alertStyle.badgeText}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#e4d7be] leading-snug">{soulWatch.message}</p>
            {(spiritual?.decayedXpTotal || 0) > 0 && (
              <div className="text-[11px] font-mono-num text-[#a89982]">
                Histórico de decaimento por ausência: -{spiritual.decayedXpTotal} XP · Última oração:{' '}
                {spiritual.lastPrayerDate ? formatDateBr(spiritual.lastPrayerDate) : 'Sem registro'}
              </div>
            )}
          </div>
        </div>

        {soulWatch.alertLevel !== 'comunhao' && (
          <button
            type="button"
            onClick={() =>
              onLogSpiritualAct({
                actType: 'manha_noite',
                dateStr: todayStr,
                notes: 'Retorno imediato pela Vigília da Alma',
              })
            }
            className="rpg-btn-gold px-3.5 py-2 rounded text-xs font-epic flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer min-h-[40px]"
          >
            <Flame className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>Rezar Agora (+{Math.round(25 * multiplierInfo.multiplier)} XP)</span>
          </button>
        )}
      </div>

      {/* Evolução do XP Espiritual Diário ao longo do último mês (Recharts) */}
      <SpiritualXpChart
        spiritual={spiritual}
        spiritualLogs={spiritualLogs}
        pmShiftDates={pmShiftDates}
      />

      {/* Metas Básicas Diárias (4 pilares para desbloquear Multiplicador + Selo de Comunhão) */}
      <div className="space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="font-epic text-sm sm:text-base text-[#f3ead6]">
              Metas Básicas Diárias ({multiplierInfo.completedCoreCount}/4)
            </h3>
            <p className="text-xs text-[#a89982]">
              {multiplierInfo.isPmDutyActive
                ? 'Modo Plantão PMSE ativo (2x): cumpra as 4 metas para 3.0x ou adicione Missa/Adoração/Confissão/Terço para 4.0x.'
                : 'Cumpra os 4 deveres de piedade hoje para ativar o Selo de Comunhão (1.5x) ou supere-os com Missa/Adoração/Confissão (2.0x).'}
            </p>
          </div>
          <span className="text-xs font-mono-num text-[#dfc168]">
            {todayLogs.length} {todayLogs.length === 1 ? 'ato hoje' : 'atos hoje'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          {SPIRITUAL_DAILY_GOALS.map((goal) => {
            const done = effectiveDaily[goal.key];
            const def = getSpiritualActDefinition(goal.actType);
            const xpNow = Math.round(def.baseXp * multiplierInfo.multiplier);
            return (
              <button
                key={goal.key}
                type="button"
                onClick={() =>
                  onLogSpiritualAct({
                    actType: goal.actType,
                    dateStr: todayStr,
                    notes: '',
                  })
                }
                aria-pressed={done}
                className={`parchment-box p-3.5 text-left flex items-center justify-between gap-2.5 cursor-pointer transition-colors min-h-[64px] ${
                  done
                    ? 'border-[#eab308]/75 bg-[#eab308]/10'
                    : 'hover:border-[#eab308]/60'
                }`}
              >
                <div className="min-w-0">
                  <div
                    className={`text-sm font-semibold truncate ${
                      done ? 'text-[#fef08a]' : 'text-[#efe3c8]'
                    }`}
                  >
                    {goal.label}
                  </div>
                  <div className="text-[11px] text-[#a89982] truncate">
                    {goal.detail} · <span className="font-mono-num text-[#dfc168]">+{xpNow} XP</span>
                  </div>
                </div>

                <span
                  className={`w-7 h-7 rounded flex items-center justify-center shrink-0 border ${
                    done
                      ? 'bg-[#eab308] border-[#fef08a] text-[#120b04]'
                      : 'bg-[#111214] border-[#525861] text-[#848890]'
                  }`}
                >
                  {done ? (
                    <Check className="w-4 h-4" aria-hidden="true" />
                  ) : (
                    <Plus className="w-4 h-4" aria-hidden="true" />
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Registro Completo de Piedade, Devoções e Sacramentos */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start pt-1">
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-6 parchment-box p-4 space-y-3.5"
        >
          <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2.5">
            <div>
              <h3 className="font-epic text-sm sm:text-base text-[#fde047]">
                Registrar Ato Espiritual ou Sacramento
              </h3>
              <p className="text-[11px] text-[#a89982]">
                Pesos calibrados conforme a gravidade litúrgica e espiritual.
              </p>
            </div>
            <span className="font-mono-num text-xs font-bold text-[#fef08a] whitespace-nowrap shrink-0">
              +{projectedXp} XP
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2" role="radiogroup" aria-label="Escolher ato espiritual">
            {SPIRITUAL_ACTS.map((act) => {
              const selected = selectedAct === act.type;
              const xpVal = Math.round(act.baseXp * formMultiplierInfo.multiplier);
              return (
                <button
                  key={act.type}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setSelectedAct(act.type)}
                  className={`p-2.5 rounded-md border text-left transition-colors cursor-pointer flex items-center justify-between gap-2 min-h-[46px] ${
                    selected
                      ? 'bg-[#eab308]/18 border-[#eab308] text-[#fef08a]'
                      : 'bg-[#111214]/90 border-white/10 text-[#d5c7b0] hover:border-[#eab308]/50'
                  }`}
                >
                  <span className="text-xs font-semibold leading-snug">{act.shortLabel}</span>
                  <span className="font-mono-num text-[11px] font-bold text-[#dfc168] shrink-0">
                    +{xpVal}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="rounded-md bg-[#101215] border border-white/10 p-2.5 text-xs text-[#d5c7b0] space-y-0.5">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-[#fde047]">{activeDef.label}</span>
              <span className="font-mono-num text-[11px] text-[#a89982]">
                {activeDef.categoryLabel} · Base {activeDef.baseXp} XP
              </span>
            </div>
            <p className="text-[11px] text-[#a89982]">{activeDef.description}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div>
              <label
                htmlFor="spiritual-act-date"
                className="block text-[11px] text-[#a89982] mb-1"
              >
                Data do Ato
              </label>
              <div className="relative">
                <Calendar
                  className="w-3.5 h-3.5 text-[#a89982] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  id="spiritual-act-date"
                  type="date"
                  value={dateStr}
                  max={todayStr}
                  onChange={(e) => setDateStr(e.target.value)}
                  className="w-full bg-[#111214] border border-[#3a3f45] focus:border-[#c59b27] focus:outline-none rounded pl-8 pr-2.5 py-2 text-xs font-mono-num text-white min-h-[40px]"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="spiritual-act-notes"
                className="block text-[11px] text-[#a89982] mb-1"
              >
                Intenção / Propósito da Alma (opcional)
              </label>
              <input
                id="spiritual-act-notes"
                type="text"
                maxLength={240}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex: Pela saúde do bebê, pelo Matrimônio ou pela 2ª Cia"
                className="w-full bg-[#111214] border border-[#3a3f45] focus:border-[#c59b27] focus:outline-none rounded px-3 py-2 text-xs text-white placeholder:text-[#6f7279] min-h-[40px]"
              />
            </div>
          </div>

          <button
            type="submit"
            className="rpg-btn-gold w-full py-2.5 rounded text-sm font-epic flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
          >
            <Cross className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Ofertar {activeDef.shortLabel} (+{projectedXp} XP)</span>
          </button>
        </form>

        {/* Diário Espiritual & Sacramentos */}
        <div className="lg:col-span-6 parchment-box p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2.5">
            <div className="flex items-center gap-2">
              <BookOpenCheck className="w-4 h-4 text-[#eab308]" aria-hidden="true" />
              <h3 className="font-epic text-sm sm:text-base text-[#f3ead6]">
                Diário Espiritual ({filteredLogs.length})
              </h3>
            </div>

            <div
              className="inline-flex flex-wrap gap-1 p-1 rounded bg-[#101215] border border-white/10"
              role="group"
              aria-label="Filtrar diário espiritual"
            >
              {(
                [
                  { id: 'todos', label: 'Todos' },
                  { id: 'diaria', label: 'Diária' },
                  { id: 'devocao', label: 'Devoções' },
                  { id: 'sacramento', label: 'Sacramentos' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setHistoryFilter(tab.id)}
                  className={`px-2 py-1 rounded text-[11px] font-semibold cursor-pointer whitespace-nowrap shrink-0 ${
                    historyFilter === tab.id
                      ? 'bg-[#c59b27] text-[#101215]'
                      : 'text-[#9e9380] hover:text-[#f3ead6]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
            {filteredLogs.length === 0 ? (
              <div className="rounded-md bg-[#101215] border border-white/10 p-5 text-center space-y-2">
                <p className="text-xs sm:text-sm text-[#a89982]">
                  Nenhum ato espiritual registrado nesta categoria ainda.
                </p>
                <button
                  type="button"
                  onClick={() =>
                    onLogSpiritualAct({
                      actType: 'lectio_divina',
                      dateStr: todayStr,
                      notes: 'Primeiro registro na Vigília da Alma',
                    })
                  }
                  className="rpg-btn-iron px-3 py-1.5 rounded text-xs font-semibold cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#eab308]" aria-hidden="true" />
                  <span>Registrar Lectio Divina Hoje</span>
                </button>
              </div>
            ) : (
              filteredLogs.slice(0, 30).map((log) => {
                const def = getSpiritualActDefinition(log.actType);
                return (
                  <article
                    key={log.id}
                    className="rounded-md bg-[#101215]/95 border border-white/10 px-3 py-2.5 flex items-start justify-between gap-2.5"
                  >
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs sm:text-sm font-semibold text-[#f3ead6]">
                          {log.actLabel || def.label}
                        </span>
                        <span className="text-[11px] font-mono-num text-[#fde047]">
                          +{log.xpGranted} XP
                          {log.multiplierApplied > 1 ? ` (${log.multiplierApplied}x)` : ''}
                        </span>
                      </div>
                      {log.notes && (
                        <p className="text-xs text-[#d5c7b0] italic leading-snug">
                          “{log.notes}”
                        </p>
                      )}
                      <div className="text-[11px] font-mono-num text-[#9e9380]">
                        {formatDateBr(log.dateStr)} · {def.categoryLabel}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onDeleteSpiritualLog(log.id)}
                      aria-label={`Excluir registro espiritual ${log.actLabel}`}
                      className="text-[#848890] hover:text-red-400 p-1 rounded cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </article>
                );
              })
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
