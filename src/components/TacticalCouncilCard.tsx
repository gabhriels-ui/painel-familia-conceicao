import { useMemo } from 'react';
import { ArrowRight, Compass, Flame, Shield, Swords } from 'lucide-react';
import { PROVIDER_TASKS, VAULTS } from '../data/chroniclesData';
import type { AppState, TabId, VaultConfig, VaultId } from '../types/chronicles';
import {
  buildXpSeries,
  estimateVaultConquest,
  evaluateArca1CostRisk,
  formatBRL,
  getLevelInfo,
  getLocalDateKey,
} from '../utils/formatters';
import { TacticalStrategistCrest } from './Crests';

interface TacticalCouncilCardProps {
  state: AppState;
  shieldSecondsLeft: number | null;
  onNavigateTab: (tab: TabId) => void;
  onStartShield: () => void;
  onOpenArena: () => void;
  onNextOracleQuote: () => void;
}

type TacticalActionKind =
  | 'navigate-rota'
  | 'navigate-provedor'
  | 'open-arena'
  | 'start-shield'
  | 'next-quote';

interface TacticalAssessment {
  urgency: 'critical' | 'priority' | 'advance';
  postureLabel: string;
  headline: string;
  strategistSpeech: string;
  ctaLabel: string;
  ctaKind: TacticalActionKind;
  todayXp: number;
  avgDailyXp: number;
  currentStreakDays: number;
  xpToNext: number;
  nextLevel: number;
  activeVault: VaultConfig;
  activeVaultBalance: number;
  activeVaultRemaining: number;
  activeVaultPct: number;
  projectionText: string;
  costRiskLevel: 'safe' | 'warning' | 'critical';
  costMonthly: number;
}

function buildTacticalAssessment(
  state: AppState,
  isShieldActive: boolean
): TacticalAssessment {
  const todayKey = getLocalDateKey();
  const todayXp = Math.max(0, Math.round(Number(state.xpHistory?.[todayKey]) || 0));
  const xpSeries = buildXpSeries(state.xpHistory, 30);
  const levelInfo = getLevelInfo(state.xp);

  const balances: Record<VaultId, number> = {
    1: state.box1 || 0,
    2: state.box2 || 0,
    3: state.box3 || 0,
    4: state.box4 || 0,
  };

  const activeVault =
    VAULTS.find((v) => balances[v.id] < v.target) || VAULTS[VAULTS.length - 1];
  const activeVaultBalance = balances[activeVault.id];
  const activeVaultRemaining = Math.max(0, activeVault.target - activeVaultBalance);
  const activeVaultPct = Math.min(
    100,
    Math.round((activeVaultBalance / activeVault.target) * 100)
  );

  const projection = estimateVaultConquest(
    activeVault.id,
    activeVaultBalance,
    activeVault.target,
    state.transactions || []
  );

  const costRisk = evaluateArca1CostRisk(state.box1 || 0, state.recurringCosts || []);
  const dutiesDone = Object.values(state.providerDuties || {}).filter(Boolean).length;
  const allDutiesDone = dutiesDone >= PROVIDER_TASKS.length;
  const rosaryInProgress = (state.rosaryDecades || 0) > 0;

  let urgency: TacticalAssessment['urgency'] = 'advance';
  let postureLabel = 'Ordem do Dia · Marcha Constante';
  let headline = '';
  let strategistSpeech = '';
  let ctaLabel = 'Abrir Tesouro';
  let ctaKind: TacticalActionKind = 'navigate-rota';

  if (costRisk.level === 'critical') {
    urgency = 'critical';
    postureLabel = 'Alerta de Flanco · Cerco na Arca I';
    headline = `Contenha o Sangramento: ${formatBRL(costRisk.totalMonthly)}/mês Pressionam a Arca I`;
    strategistSpeech = `Comandante, nossos batedores detectaram custos recorrentes somando ${formatBRL(
      costRisk.totalMonthly
    )} frente aos ${formatBRL(
      costRisk.remainingArca1
    )} que faltam para libertar o Portão do Crédito. Corte supérfluos hoje e reforce a Arca I com um novo depósito antes que a dívida ganhe terreno.`;
    ctaLabel = 'Reforçar Arca I no Tesouro';
    ctaKind = 'navigate-rota';
  } else if (activeVaultRemaining > 0 && activeVaultPct >= 80) {
    urgency = 'priority';
    postureLabel = `Brecha Aberta · ${activeVault.roman} a ${activeVaultPct}%`;
    headline = `Assalto Final a ${activeVault.roman}: Faltam ${formatBRL(
      activeVaultRemaining
    )}`;
    strategistSpeech = `As muralhas de ${activeVault.title} já cederam em ${activeVaultPct}% do cerco. Um último avanço coordenado hoje fecha esta frente, garante +380 XP ao estandarte e libera sua tropa para o próximo feudo.`;
    ctaLabel = `Concluir ${activeVault.roman}`;
    ctaKind = 'navigate-rota';
  } else if (todayXp === 0) {
    urgency = 'priority';
    postureLabel =
      xpSeries.currentStreakDays > 0
        ? `Risco de Quebra · Sequência de ${xpSeries.currentStreakDays} dias`
        : 'Guarnição em Repouso · 0 XP Hoje';
    if (rosaryInProgress) {
      const missingDecades = 5 - (state.rosaryDecades || 0);
      headline = `Retome a Vigília: Faltam ${missingDecades} ${
        missingDecades === 1 ? 'Dezena' : 'Dezenas'
      } para Selar o Terço`;
      strategistSpeech = `O caderno diário ainda marca 0 XP hoje (média de ${xpSeries.avgDailyXp} XP/dia), mas seu terço já está em ${state.rosaryDecades}/5 dezenas. Feche essa oração no Provedor ou medite um ponto no Oráculo para acender a fogueira do dia.`;
      ctaLabel = 'Concluir Terço no Provedor';
      ctaKind = 'navigate-provedor';
    } else {
      headline = 'Rompa a Inércia do Dia e Garanta os Primeiros Pontos na Muralha';
      strategistSpeech = `Comandante, nenhum ganho de XP foi registrado hoje frente à sua média de ${xpSeries.avgDailyXp} XP/dia. Aplique o primeiro golpe imediato no Oráculo (+50 XP) ou registre um aporte em ${activeVault.roman} (+80 XP) para manter a tropa em ordem de batalha.`;
      ctaLabel = 'Meditar no Oráculo (+50 XP)';
      ctaKind = 'next-quote';
    }
  } else if (levelInfo.xpToNext <= 150) {
    urgency = 'priority';
    postureLabel = `Promoção Iminente · Faltam ${levelInfo.xpToNext} XP`;
    headline = `Alcance o Nível ${levelInfo.level + 1} Antes do Toque de Recolher`;
    strategistSpeech = `Você já somou +${todayXp} XP hoje e está a apenas ${levelInfo.xpToNext} XP de subir de patente. Enfrente um chefe na Arena ou cumpra um dever do Provedor para consolidar a promoção ainda nesta jornada.`;
    ctaLabel = 'Entrar na Arena de Combate';
    ctaKind = 'open-arena';
  } else if (!allDutiesDone && todayXp < Math.max(80, xpSeries.avgDailyXp)) {
    urgency = 'advance';
    postureLabel = `Frente Doméstica · ${dutiesDone}/${PROVIDER_TASKS.length} Deveres`;
    headline = `Fortaleça a Retaguarda na Oficina de São José (+120 XP por Dever)`;
    strategistSpeech = `Hoje você somou +${todayXp} XP, ainda abaixo do ritmo médio de ${xpSeries.avgDailyXp} XP/dia. Cumpra um dever doméstico pendente para blindar a disciplina da casa enquanto prepara o próximo aporte em ${activeVault.roman}.`;
    ctaLabel = 'Abrir Oficina de São José';
    ctaKind = 'navigate-provedor';
  } else if (activeVaultRemaining > 0) {
    urgency = 'advance';
    postureLabel = `Campanha Ativa · ${activeVault.roman}`;
    headline = `Mantenha a Pressão sobre ${activeVault.title} (${activeVaultPct}%)`;
    strategistSpeech = `Excelente ritmo, Comandante: +${todayXp} XP hoje e ${xpSeries.currentStreakDays} ${
      xpSeries.currentStreakDays === 1 ? 'dia seguido' : 'dias seguidos'
    } em atividade. Faltam ${formatBRL(
      activeVaultRemaining
    )} para concluir ${activeVault.roman}; ${
      isShieldActive
        ? 'mantenha o escudo erguido até o fim da vigília.'
        : 'erga o Escudo de 60s diante de qualquer gasto impulsivo e canalize cada sobra para o Tesouro.'
    }`;
    ctaLabel = isShieldActive ? 'Aportar no Tesouro' : 'Erguer Escudo Contra Impulso';
    ctaKind = isShieldActive ? 'navigate-rota' : 'start-shield';
  } else {
    urgency = 'advance';
    postureLabel = 'Domínio Consolidado · Todas as Arcas em 100%';
    headline = 'Guarnição Vitoriosa: Expanda o Legado e Mantenha a Guarda Alta';
    strategistSpeech = `As quatro Arcas principais atingiram suas metas de batalha e sua conta soma +${todayXp} XP hoje. Mantenha a disciplina diária na Arena e registre novas cartas para o herdeiro de 2027.`;
    ctaLabel = 'Desafiar Chefe na Arena';
    ctaKind = 'open-arena';
  }

  return {
    urgency,
    postureLabel,
    headline,
    strategistSpeech,
    ctaLabel,
    ctaKind,
    todayXp,
    avgDailyXp: xpSeries.avgDailyXp,
    currentStreakDays: xpSeries.currentStreakDays,
    xpToNext: levelInfo.xpToNext,
    nextLevel: levelInfo.level + 1,
    activeVault,
    activeVaultBalance,
    activeVaultRemaining,
    activeVaultPct,
    projectionText:
      projection.status === 'ready'
        ? `Previsto para ${projection.dateText}`
        : projection.dateText,
    costRiskLevel: costRisk.level,
    costMonthly: costRisk.totalMonthly,
  };
}

export function TacticalCouncilCard({
  state,
  shieldSecondsLeft,
  onNavigateTab,
  onStartShield,
  onOpenArena,
  onNextOracleQuote,
}: TacticalCouncilCardProps) {
  const isShieldActive = shieldSecondsLeft !== null && shieldSecondsLeft > 0;

  const assessment = useMemo(
    () => buildTacticalAssessment(state, isShieldActive),
    [state, isShieldActive]
  );

  const handlePrimaryOrder = () => {
    switch (assessment.ctaKind) {
      case 'navigate-rota':
        onNavigateTab('rota');
        break;
      case 'navigate-provedor':
        onNavigateTab('provedor');
        break;
      case 'open-arena':
        onOpenArena();
        break;
      case 'start-shield':
        onStartShield();
        break;
      case 'next-quote':
        onNextOracleQuote();
        break;
    }
  };

  const urgencyBorder =
    assessment.urgency === 'critical'
      ? 'border-[#881b1b]'
      : assessment.urgency === 'priority'
      ? 'border-[#c59b27]/65'
      : '';

  const postureTextTone =
    assessment.urgency === 'critical'
      ? 'text-red-400'
      : assessment.urgency === 'priority'
      ? 'text-[#e4c770]'
      : 'text-emerald-400';

  const CtaIcon =
    assessment.ctaKind === 'open-arena'
      ? Swords
      : assessment.ctaKind === 'start-shield'
      ? Shield
      : assessment.ctaKind === 'next-quote'
      ? Flame
      : Compass;

  return (
    <section
      className={`rpg-panel state-card p-5 sm:p-6 space-y-5 ${urgencyBorder}`}
      data-tilt-subtle="true"
      aria-labelledby="tactical-council-heading"
    >
      {/* Cabeçalho do Conselho Tático */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-white/10">
        <div className="flex items-start sm:items-center gap-4 min-w-0">
          <div className="depth-layer-3 shrink-0">
            <TacticalStrategistCrest className="w-12 h-12 sm:w-14 sm:h-14" />
          </div>
          <div className="min-w-0 space-y-1">
            <div className={`depth-layer-1 text-xs font-epic tracking-wider ${postureTextTone}`}>
              Conselho Tático · {assessment.postureLabel}
            </div>
            <h2
              id="tactical-council-heading"
              className="depth-layer-2 font-epic text-base sm:text-xl text-[#f3ead6] text-balance"
            >
              {assessment.headline}
            </h2>
          </div>
        </div>

        <button
          type="button"
          onClick={handlePrimaryOrder}
          className={`depth-layer-2 ${
            assessment.urgency === 'critical' ? 'rpg-btn-crimson' : 'rpg-btn-gold'
          } px-4 py-2.5 rounded-lg text-xs sm:text-sm font-epic flex items-center justify-center gap-2 whitespace-nowrap shrink-0 cursor-pointer min-h-[44px]`}
        >
          <CtaIcon className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>{assessment.ctaLabel}</span>
          <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
        </button>
      </div>

      {/* Despacho do Estrategista */}
      <div className="depth-layer-2 parchment-box px-4 py-3.5 sm:px-5 sm:py-4">
        <p className="text-sm sm:text-base text-[#e7dcc6] leading-relaxed">
          “{assessment.strategistSpeech}”
        </p>
      </div>

      {/* Leitura Analítica das Frentes (XP Diário e Meta das Arcas) */}
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/10">
        <div className="py-3 md:py-1 md:pr-6 space-y-1.5">
          <div className="depth-layer-1 flex items-center justify-between gap-2 text-xs text-[#9e9380]">
            <span>Cadência de XP Diário</span>
            <span className="font-mono-num text-[#e4c770]">
              Faltam {assessment.xpToNext} XP · Nv. {assessment.nextLevel}
            </span>
          </div>
          <div className="depth-layer-3 flex flex-wrap items-baseline gap-x-4 gap-y-1 font-mono-num">
            <span className="text-lg sm:text-xl font-bold text-[#f3ead6]">
              +{assessment.todayXp.toLocaleString('pt-BR')} XP hoje
            </span>
            <span className="text-xs text-[#9e9380]">
              Média 30d: {assessment.avgDailyXp.toLocaleString('pt-BR')} XP/dia ·{' '}
              {assessment.currentStreakDays}{' '}
              {assessment.currentStreakDays === 1 ? 'dia ativo seguido' : 'dias ativos seguidos'}
            </span>
          </div>
        </div>

        <div className="py-3 md:py-1 md:pl-6 space-y-1.5">
          <div className="depth-layer-1 flex items-center justify-between gap-2 text-xs text-[#9e9380]">
            <span>Frente Principal: {assessment.activeVault.roman}</span>
            <span className="font-mono-num text-emerald-400">
              {assessment.activeVaultPct}% concluída
            </span>
          </div>
          <div className="depth-layer-3 flex flex-wrap items-baseline justify-between gap-2 font-mono-num">
            <span className="text-lg sm:text-xl font-bold text-[#f3ead6]">
              {assessment.activeVaultRemaining === 0
                ? 'Meta Conquistada'
                : `Falta ${formatBRL(assessment.activeVaultRemaining)}`}
            </span>
            <span className="text-xs text-[#9e9380]">
              {assessment.costRiskLevel !== 'safe'
                ? `Custos: ${formatBRL(assessment.costMonthly)}/mês · ${assessment.projectionText}`
                : assessment.projectionText}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
