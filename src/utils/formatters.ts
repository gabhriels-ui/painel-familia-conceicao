import type { AppState, RecurringCost, TransactionEntry, VaultId } from '../types/chronicles';

export function formatBRL(value: number): string {
  return Number(value || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export function parsePositiveAmount(raw: string): number | null {
  if (!raw) return null;
  const cleaned = raw.trim().replace(/\s+/g, '').replace(/R\$/gi, '');
  let normalized = cleaned;
  if (cleaned.includes(',') && cleaned.includes('.')) {
    normalized = cleaned.replace(/\./g, '').replace(',', '.');
  } else if (cleaned.includes(',')) {
    normalized = cleaned.replace(',', '.');
  }
  const num = Number(normalized);
  if (!Number.isFinite(num) || num < 0) return null;
  return Math.round(num * 100) / 100;
}

export function getLevelInfo(xp: number): {
  level: number;
  xpInLevel: number;
  xpPercent: number;
  xpToNext: number;
  rank: string;
} {
  const safeXp = Math.max(0, Math.floor(xp || 0));
  const level = Math.floor(safeXp / 500) + 1;
  const xpInLevel = safeXp % 500;
  const xpPercent = Math.min(100, Math.round((xpInLevel / 500) * 100));
  const xpToNext = 500 - xpInLevel;

  let rank = 'Recruta da Guarda';
  if (safeXp >= 7000) rank = 'Grão-Mestre Provedor';
  else if (safeXp >= 4000) rank = 'Paladino do Lar';
  else if (safeXp >= 2000) rank = 'Cavaleiro Templário';
  else if (safeXp >= 800) rank = 'Escudeiro Fiel';

  return { level, xpInLevel, xpPercent, xpToNext, rank };
}

export function calculateCountdown(targetIso: string): {
  days: number;
  hours: string;
  minutes: string;
  seconds: string;
  isArrived: boolean;
} {
  const nowMs = Date.now();
  const targetMs = new Date(targetIso).getTime();
  const diffMs = Math.max(0, targetMs - nowMs);
  const days = Math.floor(diffMs / 86400000);
  const hours = String(Math.floor((diffMs % 86400000) / 3600000)).padStart(2, '0');
  const minutes = String(Math.floor((diffMs % 3600000) / 60000)).padStart(2, '0');
  const seconds = String(Math.floor((diffMs % 60000) / 1000)).padStart(2, '0');
  return { days, hours, minutes, seconds, isArrived: diffMs === 0 };
}

export function getConqueredFeudsCount(state: AppState): {
  conquered: Record<number, boolean>;
  count: number;
} {
  const f1 = (state.box1 || 0) >= 6829;
  const f2 = (state.box2 || 0) >= 12000;
  const f3 =
    (state.feudChecklist?.feudo_3_enxoval && state.feudChecklist?.feudo_3_nascimento) ||
    false;
  const f4 =
    (state.feudChecklist?.feudo_4_ipva && state.feudChecklist?.feudo_4_emprestimo) ||
    false;
  const f5 = (state.box3 || 0) >= 45000;
  const f6 =
    (state.feudChecklist?.feudo_6_investimentos && state.feudChecklist?.feudo_6_quitacao_casa) ||
    false;

  const conquered: Record<number, boolean> = {
    1: f1,
    2: f2,
    3: f3,
    4: f4,
    5: f5,
    6: f6,
  };
  const count = Object.values(conquered).filter(Boolean).length;
  return { conquered, count };
}

export function getSuggestedMysteryIndex(date = new Date()): number {
  const day = date.getDay(); // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
  if (day === 0 || day === 3) return 0; // Gloriosos
  if (day === 1 || day === 6) return 1; // Gozosos
  if (day === 2 || day === 5) return 2; // Dolorosos
  return 3; // Luminosos
}

export interface ConquestProjection {
  status: 'achieved' | 'ready' | 'no-data' | 'stagnant';
  dateText: string;
  detailText: string;
}

export function estimateVaultConquest(
  vaultId: VaultId,
  currentVal: number,
  targetVal: number,
  transactions: TransactionEntry[]
): ConquestProjection {
  if (currentVal >= targetVal) {
    return {
      status: 'achieved',
      dateText: 'Meta já conquistada!',
      detailText: '100% do objetivo atingido',
    };
  }

  const allTxs = transactions || [];
  if (allTxs.length === 0) {
    return {
      status: 'no-data',
      dateText: 'Aguardando movimentações',
      detailText: 'Registre depósitos para projetar a data',
    };
  }

  const vaultTxs = allTxs.filter((tx) =>
    vaultId === 2 ? tx.vaultId === 2 || tx.vaultId === 'cdi' : tx.vaultId === vaultId
  );

  const usingGlobalFallback = vaultTxs.length === 0;
  const sourceTxs = usingGlobalFallback ? allTxs : vaultTxs;
  const lastFive = sourceTxs.slice(0, 5);

  const netSum = lastFive.reduce((sum, tx) => sum + Number(tx.difference || 0), 0);
  const avgGrowthPerTx = netSum / lastFive.length;

  if (avgGrowthPerTx <= 0) {
    return {
      status: 'stagnant',
      dateText: 'Ritmo estagnado',
      detailText: 'Faça novos aportes positivos para projetar',
    };
  }

  let dailyRate = avgGrowthPerTx;
  if (lastFive.length >= 2) {
    const newestMs = new Date(lastFive[0].dateIso).getTime();
    const oldestMs = new Date(lastFive[lastFive.length - 1].dateIso).getTime();
    const spanDays = Math.max(0, (newestMs - oldestMs) / 86400000);
    if (spanDays >= 1) {
      dailyRate = netSum / spanDays;
    }
  }

  if (dailyRate <= 0) {
    return {
      status: 'stagnant',
      dateText: 'Ritmo estagnado',
      detailText: 'Faça novos aportes positivos para projetar',
    };
  }

  const remaining = Math.max(0, targetVal - currentVal);
  const daysNeeded = Math.min(36500, Math.max(1, Math.ceil(remaining / dailyRate)));
  const projectedDate = new Date(Date.now() + daysNeeded * 86400000);
  const dateText = projectedDate.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const pluralDias = daysNeeded === 1 ? '1 dia' : `${daysNeeded} dias`;
  const scopeTag = usingGlobalFallback
    ? `ritmo geral · últ. ${lastFive.length} mov.`
    : `últ. ${lastFive.length} mov.`;

  return {
    status: 'ready',
    dateText,
    detailText: `em ${pluralDias} · ${formatBRL(dailyRate)}/dia (${scopeTag})`,
  };
}

export interface Arca1CostRisk {
  level: 'safe' | 'warning' | 'critical';
  activeCount: number;
  totalMonthly: number;
  remainingArca1: number;
  targetImpactPct: number;
  gapImpactPct: number;
  topCost: RecurringCost | null;
}

export const ARCA1_TARGET = 6829;

export function evaluateArca1CostRisk(
  box1: number,
  recurringCosts: RecurringCost[]
): Arca1CostRisk {
  const safeBox1 = Math.max(0, box1 || 0);
  const remainingArca1 = Math.max(0, ARCA1_TARGET - safeBox1);
  const activeCosts = (recurringCosts || []).filter((c) => c.active && c.amount > 0);
  const totalMonthly = Math.round(activeCosts.reduce((sum, c) => sum + c.amount, 0) * 100) / 100;
  const topCost = [...activeCosts].sort((a, b) => b.amount - a.amount)[0] || null;
  const targetImpactPct = Math.round((totalMonthly / ARCA1_TARGET) * 100);
  const gapImpactPct = remainingArca1 > 0 ? Math.round((totalMonthly / remainingArca1) * 100) : 0;

  if (activeCosts.length === 0 || remainingArca1 === 0) {
    return {
      level: 'safe',
      activeCount: activeCosts.length,
      totalMonthly,
      remainingArca1,
      targetImpactPct,
      gapImpactPct,
      topCost,
    };
  }

  let level: Arca1CostRisk['level'] = 'safe';
  if (
    totalMonthly >= remainingArca1 * 0.65 ||
    (safeBox1 > 0 && totalMonthly >= safeBox1 * 0.85) ||
    totalMonthly >= ARCA1_TARGET * 0.45
  ) {
    level = 'critical';
  } else if (
    totalMonthly >= remainingArca1 * 0.25 ||
    (safeBox1 > 0 && totalMonthly >= safeBox1 * 0.4) ||
    (topCost !== null && topCost.amount >= 1000)
  ) {
    level = 'warning';
  }

  return {
    level,
    activeCount: activeCosts.length,
    totalMonthly,
    remainingArca1,
    targetImpactPct,
    gapImpactPct,
    topCost,
  };
}

export function getLocalDateKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function recordDailyXp(
  history: Record<string, number> | undefined,
  delta: number,
  date = new Date()
): Record<string, number> {
  const safeDelta = Math.round(Number(delta) || 0);
  const base: Record<string, number> = { ...(history || {}) };
  const todayKey = getLocalDateKey(date);
  base[todayKey] = Math.max(0, (Number(base[todayKey]) || 0) + safeDelta);

  // Mantém no máximo os últimos 40 dias ordenados para manter documento enxuto
  const cutoffMs = date.getTime() - 40 * 86400000;
  const cutoffKey = getLocalDateKey(new Date(cutoffMs));
  const pruned: Record<string, number> = {};
  Object.keys(base)
    .filter((k) => /^\d{4}-\d{2}-\d{2}$/.test(k) && k >= cutoffKey)
    .sort()
    .slice(-40)
    .forEach((k) => {
      const val = Math.max(0, Math.round(Number(base[k]) || 0));
      if (val > 0 || k === todayKey) {
        pruned[k] = val;
      }
    });
  return pruned;
}

export interface XpDayPoint {
  dateKey: string;
  shortLabel: string;
  fullLabel: string;
  dailyXp: number;
  cumulativeXp: number;
}

export function buildXpSeries(
  xpHistory: Record<string, number> | undefined,
  days = 30
): {
  points: XpDayPoint[];
  totalXp: number;
  activeDays: number;
  avgDailyXp: number;
  bestDayXp: number;
  currentStreakDays: number;
} {
  const map = xpHistory || {};
  const today = new Date();
  today.setHours(12, 0, 0, 0);

  const points: XpDayPoint[] = [];
  let runningTotal = 0;
  let activeDays = 0;
  let bestDayXp = 0;

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today.getTime() - i * 86400000);
    const key = getLocalDateKey(d);
    const dailyXp = Math.max(0, Math.round(Number(map[key]) || 0));
    runningTotal += dailyXp;
    if (dailyXp > 0) activeDays += 1;
    if (dailyXp > bestDayXp) bestDayXp = dailyXp;

    const shortLabel = d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
    });
    const fullLabel = d.toLocaleDateString('pt-BR', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
    });

    points.push({
      dateKey: key,
      shortLabel,
      fullLabel,
      dailyXp,
      cumulativeXp: runningTotal,
    });
  }

  // Sequência de dias consecutivos ativos até hoje (ou ontem se hoje ainda não pontuou)
  let currentStreakDays = 0;
  let idx = points.length - 1;
  if (idx >= 0 && points[idx].dailyXp === 0) {
    idx -= 1;
  }
  while (idx >= 0 && points[idx].dailyXp > 0) {
    currentStreakDays += 1;
    idx -= 1;
  }

  const avgDailyXp = Math.round(runningTotal / Math.max(1, days));

  return {
    points,
    totalXp: runningTotal,
    activeDays,
    avgDailyXp,
    bestDayXp,
    currentStreakDays,
  };
}


