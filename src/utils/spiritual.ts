import {
  SPIRITUAL_ACTS,
  SPIRITUAL_RANKS,
  type SpiritualActDefinition,
} from '../data/chroniclesData';
import type {
  SpiritualActType,
  SpiritualAlertLevel,
  SpiritualDailyGoalKey,
  SpiritualLog,
  SpiritualState,
} from '../types/chronicles';

export function getLocalDateStr(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getPreviousLocalDateStr(todayStr = getLocalDateStr()): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(todayStr)) return '';
  const dt = new Date(`${todayStr}T12:00:00`);
  if (Number.isNaN(dt.getTime())) return '';
  dt.setDate(dt.getDate() - 1);
  return getLocalDateStr(dt);
}

export function isPmDutyActiveToday(
  spiritual: SpiritualState | undefined,
  todayStr = getLocalDateStr()
): boolean {
  return Boolean(spiritual?.pmDutyDate && spiritual.pmDutyDate === todayStr);
}

export function diffDaysIso(olderDateStr: string, newerDateStr: string): number {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(olderDateStr) || !/^\d{4}-\d{2}-\d{2}$/.test(newerDateStr)) {
    return 0;
  }
  const older = new Date(`${olderDateStr}T12:00:00`);
  const newer = new Date(`${newerDateStr}T12:00:00`);
  if (Number.isNaN(older.getTime()) || Number.isNaN(newer.getTime())) return 0;
  return Math.max(0, Math.round((newer.getTime() - older.getTime()) / (1000 * 60 * 60 * 24)));
}

export function getSpiritualActDefinition(actType: SpiritualActType): SpiritualActDefinition {
  return SPIRITUAL_ACTS.find((a) => a.type === actType) || SPIRITUAL_ACTS[0];
}

export function getEffectiveSpiritualDailyGoals(
  spiritual: SpiritualState | undefined,
  todayStr = getLocalDateStr()
): Record<SpiritualDailyGoalKey, boolean> {
  if (!spiritual || spiritual.dailyGoalDate !== todayStr) {
    return {
      oracao: false,
      dezena: false,
      lectio: false,
      novena: false,
    };
  }
  return {
    oracao: Boolean(spiritual.dailyGoals?.oracao),
    dezena: Boolean(spiritual.dailyGoals?.dezena),
    lectio: Boolean(spiritual.dailyGoals?.lectio),
    novena: Boolean(spiritual.dailyGoals?.novena),
  };
}

export interface MultiplierEvaluation {
  baseMultiplier: 1 | 1.5 | 2;
  multiplier: 1 | 1.5 | 2 | 3 | 4;
  pmBonusFactor: 1 | 2;
  isPmDutyActive: boolean;
  completedCoreCount: number;
  hasSealOfCommunion: boolean;
  hasSurpassingAct: boolean;
  label: string;
  nextHint: string;
}

const SURPASSING_ACTS: SpiritualActType[] = [
  'terco_completo',
  'adoracao',
  'santa_missa',
  'comunhao',
  'confissao',
];

export function computeSpiritualMultiplier(
  spiritual: SpiritualState | undefined,
  logs: SpiritualLog[],
  todayStr = getLocalDateStr()
): MultiplierEvaluation {
  const effectiveGoals = getEffectiveSpiritualDailyGoals(spiritual, todayStr);
  const completedCoreCount = (
    Object.values(effectiveGoals) as boolean[]
  ).filter(Boolean).length;
  const hasSealOfCommunion = completedCoreCount === 4;

  const todayLogs = (logs || []).filter((l) => l.dateStr === todayStr);
  const hasSurpassingAct = todayLogs.some((l) => SURPASSING_ACTS.includes(l.actType));
  const isPmDutyActive = isPmDutyActiveToday(spiritual, todayStr);
  const pmBonusFactor: 1 | 2 = isPmDutyActive ? 2 : 1;

  if (hasSealOfCommunion && hasSurpassingAct) {
    const multiplier = (2 * pmBonusFactor) as 2 | 4;
    return {
      baseMultiplier: 2,
      multiplier,
      pmBonusFactor,
      isPmDutyActive,
      completedCoreCount,
      hasSealOfCommunion: true,
      hasSurpassingAct: true,
      label: isPmDutyActive ? '4.0x Graça Plena em Plantão' : '2.0x Graça Plena',
      nextHint: isPmDutyActive
        ? 'Plantão PMSE 24h dobra o multiplicador (2.0x → 4.0x) por orar no rigor do serviço.'
        : 'Selo de Comunhão ativo + devoção maior ou sacramento hoje.',
    };
  }

  if (hasSealOfCommunion) {
    const multiplier = (1.5 * pmBonusFactor) as 1.5 | 3;
    return {
      baseMultiplier: 1.5,
      multiplier,
      pmBonusFactor,
      isPmDutyActive,
      completedCoreCount,
      hasSealOfCommunion: true,
      hasSurpassingAct: false,
      label: isPmDutyActive ? '3.0x Comunhão em Plantão' : '1.5x Selo de Comunhão',
      nextHint: isPmDutyActive
        ? 'Plantão PMSE 24h ativo! Missa, Comunhão, Adoração ou Terço elevam para 4.0x.'
        : 'Cumpridas as 4 metas! Missa, Comunhão, Adoração, Confissão ou Terço Completo eleva para 2.0x.',
    };
  }

  const multiplier = (1 * pmBonusFactor) as 1 | 2;
  return {
    baseMultiplier: 1,
    multiplier,
    pmBonusFactor,
    isPmDutyActive,
    completedCoreCount,
    hasSealOfCommunion: false,
    hasSurpassingAct,
    label: isPmDutyActive ? '2.0x Fortitude no Plantão' : '1.0x Base',
    nextHint: isPmDutyActive
      ? `XP Espiritual dobrado (2x) no Plantão PMSE. Faltam ${4 - completedCoreCount} meta(s) para 3.0x.`
      : `Faltam ${4 - completedCoreCount} meta(s) diária(s) para o Selo de Comunhão (1.5x).`,
  };
}

export interface SoulWatchEvaluation {
  daysInactive: number;
  alertLevel: SpiritualAlertLevel;
  dailyPenaltyRate: number;
  pendingDecayXp: number;
  pmDutyGraceActive: boolean;
  strengthPct: number;
  rank: (typeof SPIRITUAL_RANKS)[number];
  title: string;
  message: string;
}

export function getSpiritualStrengthPercent(
  spiritualXp: number,
  daysInactive: number,
  completedCoreCount: number,
  hasSealOfCommunion: boolean
): number {
  const xpProgress = Math.min(72, Math.round((Math.max(0, spiritualXp) / 1500) * 72));
  const dailyBonus = completedCoreCount * 5 + (hasSealOfCommunion ? 8 : 0);
  const inactivityDrag =
    daysInactive >= 5 ? 45 : daysInactive >= 3 ? 28 : daysInactive >= 1 ? 12 : 0;
  return Math.max(4, Math.min(100, xpProgress + dailyBonus - inactivityDrag));
}

export function evaluateSoulWatchAlert(
  spiritual: SpiritualState | undefined,
  logs: SpiritualLog[],
  todayStr = getLocalDateStr()
): SoulWatchEvaluation {
  const xp = Math.max(0, spiritual?.spiritualXp || 0);
  const lastPrayer = spiritual?.lastPrayerDate || '';
  const hasEverPrayed = /^\d{4}-\d{2}-\d{2}$/.test(lastPrayer);
  const daysInactive = hasEverPrayed ? diffDaysIso(lastPrayer, todayStr) : 0;
  const isPmDutyToday = isPmDutyActiveToday(spiritual, todayStr);
  const yesterdayStr = getPreviousLocalDateStr(todayStr);
  const pmDutyGraceActive =
    hasEverPrayed && daysInactive === 1 && Boolean(yesterdayStr && spiritual?.pmDutyDate === yesterdayStr);

  const mult = computeSpiritualMultiplier(spiritual, logs, todayStr);
  const effectiveDragDays = pmDutyGraceActive ? 0 : daysInactive;
  const strengthPct = getSpiritualStrengthPercent(
    xp,
    effectiveDragDays,
    mult.completedCoreCount,
    mult.hasSealOfCommunion
  );

  let rank = SPIRITUAL_RANKS[0];
  for (const r of SPIRITUAL_RANKS) {
    if (strengthPct >= r.minStrength) rank = r;
  }

  let alertLevel: SpiritualAlertLevel = 'comunhao';
  let dailyPenaltyRate = 0;
  let title = isPmDutyToday
    ? 'Fortitude no Plantão (24h) · Luz Blindada'
    : 'Comunhão Ativa · Luz Preservada';
  let message = isPmDutyToday
    ? 'Modo Plantão PMSE ativo hoje: todas as orações e devoções recebem XP Espiritual em dobro (2x) no rigor do serviço.'
    : hasEverPrayed
      ? 'Sua lâmpada permanece acesa diante do altar hoje. Persevere nas pequenas fidelidades.'
      : 'Registre sua primeira oração ou ato sacramental para acender a lâmpada da Vigília da Alma.';

  if (pmDutyGraceActive) {
    alertLevel = 'vigilia';
    dailyPenaltyRate = 0;
    title = 'Escudo Pós-Plantão 24h · Chamado à Oração';
    message =
      'Plantão PMSE de ontem protegido contra decaimento (-0 XP). Retome sua oração hoje para honrar o descanso e manter a chama viva.';
  } else if (hasEverPrayed && daysInactive === 1) {
    alertLevel = 'vigilia';
    dailyPenaltyRate = 15;
    title = 'Vigília da Alma · 1 Dia fora do Plantão sem Registro';
    message =
      'Nenhuma oração registrada ontem fora de plantão. A constância é o escudo do lar — volte hoje à oração e à Novena de São José.';
  } else if (hasEverPrayed && daysInactive === 2) {
    alertLevel = 'vigilia';
    dailyPenaltyRate = 25;
    title = 'Chamado à Oração · 2 Dias sem Registro';
    message =
      'Dois dias fora do plantão sem registro espiritual reduzem gradualmente sua barra de Força Espiritual (-25 XP/dia).';
  } else if (hasEverPrayed && (daysInactive === 3 || daysInactive === 4)) {
    alertLevel = 'afastamento';
    dailyPenaltyRate = 45;
    title = `Alerta de Afastamento · ${daysInactive} Dias Distante`;
    message =
      'O ruído do combate tenta esfriar sua alma (-45 XP/dia). Reze ao menos uma Dezena ou faça a Lectio Divina agora.';
  } else if (hasEverPrayed && daysInactive >= 5) {
    alertLevel = 'critico';
    dailyPenaltyRate = 80;
    title = `Vigília Crítica da Alma · ${daysInactive} Dias sem Oração`;
    message =
      'Risco severo de afastamento espiritual (-80 XP/dia). Recomende-se imediatamente à Confissão, Santa Missa e oração.';
  }

  const alreadyDecayedToday = spiritual?.lastDecayDate === todayStr;
  const pendingDecayXp =
    hasEverPrayed && daysInactive >= 1 && !pmDutyGraceActive && !alreadyDecayedToday && xp > 0
      ? Math.min(xp, dailyPenaltyRate)
      : 0;

  return {
    daysInactive,
    alertLevel,
    dailyPenaltyRate,
    pendingDecayXp,
    pmDutyGraceActive,
    strengthPct,
    rank,
    title,
    message,
  };
}
