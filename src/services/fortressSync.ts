import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  type Unsubscribe,
} from 'firebase/firestore';
import { DEFAULT_STATE } from '../data/chroniclesData';
import { db, handleFirestoreError, OperationType } from '../firebase';
import type {
  AppState,
  FeudChecklistState,
  Letter,
  MarriageCouple,
  MarriageCoupleStatus,
  MedicalExamEntry,
  MedicalExamStatus,
  MedicalExamType,
  MissionEntry,
  MissionEntryModule,
  ReadingCategory,
  ReadingLog,
  RecurringCost,
  RecurringCostCategory,
  SpiritualActType,
  SpiritualLog,
  SpiritualState,
  TabId,
  TacticalExpenseClassification,
  TacticalExpenseEntry,
  TransactionEntry,
  VaultId,
  VocationalState,
} from '../types/chronicles';

const VALID_TABS: TabId[] = ['comando', 'rota', 'corolla', 'provedor', 'cronicas'];

function sanitizeNumber(val: unknown, max = 1_000_000_000): number {
  const n = Number(val);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.min(max, Math.round(n * 100) / 100);
}

function sanitizeInt(val: unknown, max = 1_000_000): number {
  const n = Math.floor(Number(val) || 0);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.min(max, n);
}

function sanitizeTab(tab: unknown): TabId {
  return VALID_TABS.includes(tab as TabId) ? (tab as TabId) : 'comando';
}

function sanitizeDuties(raw: Record<number, boolean> | undefined): Record<string, boolean> {
  const out: Record<string, boolean> = {};
  if (!raw || typeof raw !== 'object') return out;
  Object.entries(raw)
    .slice(0, 16)
    .forEach(([k, v]) => {
      out[String(k).slice(0, 24)] = Boolean(v);
    });
  return out;
}

function sanitizeMilestones(raw: Record<string, boolean> | undefined): Record<string, boolean> {
  const out: Record<string, boolean> = {};
  if (!raw || typeof raw !== 'object') return out;
  Object.entries(raw)
    .slice(0, 32)
    .forEach(([k, v]) => {
      out[String(k).slice(0, 48)] = Boolean(v);
    });
  return out;
}

function sanitizeChecklist(raw: Partial<FeudChecklistState> | undefined): FeudChecklistState {
  return {
    feudo_3_enxoval: Boolean(raw?.feudo_3_enxoval),
    feudo_3_nascimento: Boolean(raw?.feudo_3_nascimento),
    feudo_4_ipva: Boolean(raw?.feudo_4_ipva),
    feudo_4_emprestimo: Boolean(raw?.feudo_4_emprestimo),
    feudo_6_investimentos: Boolean(raw?.feudo_6_investimentos),
    feudo_6_quitacao_casa: Boolean(raw?.feudo_6_quitacao_casa),
  };
}

function sanitizeXpHistory(raw: Record<string, number> | undefined): Record<string, number> {
  const out: Record<string, number> = {};
  if (!raw || typeof raw !== 'object') return out;
  Object.keys(raw)
    .filter((k) => /^\d{4}-\d{2}-\d{2}$/.test(k))
    .sort()
    .slice(-40)
    .forEach((k) => {
      const val = sanitizeInt(raw[k], 1_000_000);
      if (val > 0) out[k] = val;
    });
  return out;
}

function sanitizeBoolMap(
  raw: Record<string, boolean> | undefined,
  defaults: Record<string, boolean>,
  maxKeys = 10
): Record<string, boolean> {
  const out: Record<string, boolean> = { ...defaults };
  if (!raw || typeof raw !== 'object') return out;
  Object.entries(raw)
    .slice(0, maxKeys)
    .forEach(([k, v]) => {
      const cleanKey = String(k).slice(0, 32);
      if (cleanKey in out || Object.keys(out).length < maxKeys) {
        out[cleanKey] = Boolean(v);
      }
    });
  return out;
}

export function sanitizeVocationalState(raw?: Partial<VocationalState>): VocationalState {
  const def = DEFAULT_STATE.vocational;
  const theme = String(raw?.tccTheme || def.tccTheme).trim().slice(0, 200);
  return {
    tccTheme: theme || def.tccTheme,
    tccStages: sanitizeBoolMap(raw?.tccStages, def.tccStages, 10),
    academicXp: sanitizeInt(raw?.academicXp ?? def.academicXp, 100_000_000),
    brainXp: sanitizeInt(raw?.brainXp ?? def.brainXp, 100_000_000),
    bodyXp: sanitizeInt(raw?.bodyXp ?? def.bodyXp, 100_000_000),
    pmEquipment: sanitizeBoolMap(raw?.pmEquipment, def.pmEquipment, 10),
    studyHours: {
      cfo: sanitizeNumber(raw?.studyHours?.cfo ?? def.studyHours.cfo, 50_000),
      prf: sanitizeNumber(raw?.studyHours?.prf ?? def.studyHours.prf, 50_000),
      pf: sanitizeNumber(raw?.studyHours?.pf ?? def.studyHours.pf, 50_000),
    },
    pullupBest: sanitizeInt(raw?.pullupBest ?? def.pullupBest, 500),
    pullupTarget: sanitizeInt(raw?.pullupTarget ?? def.pullupTarget, 500),
    workoutsTotal: sanitizeInt(raw?.workoutsTotal ?? def.workoutsTotal, 100_000),
    creatineStockGrams: sanitizeNumber(
      raw?.creatineStockGrams ?? def.creatineStockGrams,
      50_000
    ),
    creatineDailyDoseGrams: sanitizeNumber(
      raw?.creatineDailyDoseGrams ?? def.creatineDailyDoseGrams,
      100
    ),
    creatineLastTakenDate: String(raw?.creatineLastTakenDate || '').slice(0, 32),
    healthChecks: sanitizeBoolMap(raw?.healthChecks, def.healthChecks, 10),
  };
}

export function sanitizeSpiritualState(raw?: Partial<SpiritualState>): SpiritualState {
  const def = DEFAULT_STATE.spiritual;
  return {
    spiritualXp: sanitizeInt(raw?.spiritualXp ?? def.spiritualXp, 100_000_000),
    lastPrayerDate: String(raw?.lastPrayerDate || '').slice(0, 16),
    lastDecayDate: String(raw?.lastDecayDate || '').slice(0, 16),
    novenaStreak: sanitizeInt(raw?.novenaStreak ?? def.novenaStreak, 10_000),
    novenaLastDate: String(raw?.novenaLastDate || '').slice(0, 16),
    dailyGoalDate: String(raw?.dailyGoalDate || '').slice(0, 16),
    dailyGoals: {
      oracao: Boolean(raw?.dailyGoals?.oracao),
      dezena: Boolean(raw?.dailyGoals?.dezena),
      lectio: Boolean(raw?.dailyGoals?.lectio),
      novena: Boolean(raw?.dailyGoals?.novena),
    },
    decayedXpTotal: sanitizeInt(raw?.decayedXpTotal ?? def.decayedXpTotal, 100_000_000),
    pmDutyDate: String(raw?.pmDutyDate || '').slice(0, 16),
  };
}

const VALID_SPIRITUAL_ACTS: SpiritualActType[] = [
  'manha_noite',
  'dezena',
  'lectio_divina',
  'novena_sao_jose',
  'comunhao',
  'adoracao',
  'terco_completo',
  'santa_missa',
  'confissao',
];

function sanitizeSpiritualActType(raw: unknown): SpiritualActType {
  return VALID_SPIRITUAL_ACTS.includes(raw as SpiritualActType)
    ? (raw as SpiritualActType)
    : 'manha_noite';
}

function buildSpiritualLogFields(uid: string, log: SpiritualLog) {
  const safeLabel = String(log.actLabel || 'Oração').trim().slice(0, 120) || 'Oração';
  const safeDate =
    String(log.dateStr || new Date().toISOString().slice(0, 10)).trim().slice(0, 16) ||
    new Date().toISOString().slice(0, 10);
  const safeNotes = String(log.notes || '').slice(0, 800);
  const nowIso = new Date().toISOString();
  const safeMult = Math.max(1, Math.min(5, Number(log.multiplierApplied) || 1));
  return {
    ownerId: uid,
    actType: sanitizeSpiritualActType(log.actType),
    actLabel: safeLabel,
    dateStr: safeDate,
    notes: safeNotes,
    baseXp: sanitizeInt(log.baseXp, 5000),
    multiplierApplied: Math.round(safeMult * 100) / 100,
    xpGranted: sanitizeInt(log.xpGranted, 10_000),
    createdAtIso: String(log.createdAtIso || nowIso).slice(0, 40),
  };
}

const VALID_MISSION_MODULES: MissionEntryModule[] = [
  'exam',
  'pm_shift',
  'workout',
  'mesc_shift',
];

function sanitizeMissionModule(raw: unknown): MissionEntryModule {
  return VALID_MISSION_MODULES.includes(raw as MissionEntryModule)
    ? (raw as MissionEntryModule)
    : 'exam';
}

const VALID_MARRIAGE_STATUSES: MarriageCoupleStatus[] = [
  'aguardando_data',
  'em_andamento',
  'encontro_concluido',
];

function sanitizeMarriageStatus(raw: unknown): MarriageCoupleStatus {
  return VALID_MARRIAGE_STATUSES.includes(raw as MarriageCoupleStatus)
    ? (raw as MarriageCoupleStatus)
    : 'em_andamento';
}

function buildMarriageCoupleFields(uid: string, couple: MarriageCouple) {
  const safeNames = String(couple.coupleNames || 'Casal').trim().slice(0, 120) || 'Casal';
  const safeDate = String(couple.scheduledDate || '').trim().slice(0, 16);
  const safeTime = String(couple.scheduledTime || '').trim().slice(0, 16);
  const safeTopic = String(couple.topic || '').trim().slice(0, 160);
  const safeNotes = String(couple.notes || '').slice(0, 1500);
  const nowIso = new Date().toISOString();
  return {
    ownerId: uid,
    coupleNames: safeNames,
    scheduledDate: safeDate,
    scheduledTime: safeTime,
    topic: safeTopic,
    notes: safeNotes,
    status: sanitizeMarriageStatus(couple.status),
    createdAtIso: String(couple.createdAtIso || nowIso).slice(0, 40),
    updatedAtIso: String(couple.updatedAtIso || nowIso).slice(0, 40),
  };
}

const VALID_READING_CATEGORIES: ReadingCategory[] = [
  'espiritual',
  'literatura',
  'tcc',
  'direito',
];

function sanitizeReadingCategory(raw: unknown): ReadingCategory {
  return VALID_READING_CATEGORIES.includes(raw as ReadingCategory)
    ? (raw as ReadingCategory)
    : 'espiritual';
}

function buildReadingLogFields(uid: string, log: ReadingLog) {
  const safeTitle = String(log.title || 'Leitura').trim().slice(0, 160) || 'Leitura';
  const safeAuthor = String(log.authorOrSource || '').trim().slice(0, 120);
  const safeNotes = String(log.notes || '').slice(0, 800);
  const safeDate =
    String(log.dateStr || new Date().toISOString().slice(0, 10)).trim().slice(0, 16) ||
    new Date().toISOString().slice(0, 10);
  const nowIso = new Date().toISOString();
  return {
    ownerId: uid,
    category: sanitizeReadingCategory(log.category),
    title: safeTitle,
    authorOrSource: safeAuthor,
    pagesOrMinutes: sanitizeInt(log.pagesOrMinutes, 100_000),
    notes: safeNotes,
    dateStr: safeDate,
    completed: Boolean(log.completed),
    xpGranted: sanitizeInt(log.xpGranted, 5000),
    createdAtIso: String(log.createdAtIso || nowIso).slice(0, 40),
  };
}

const VALID_EXAM_TYPES: MedicalExamType[] = [
  'holter',
  'ecocardiograma',
  'perfil_lipidico',
  'hemograma',
  'outro',
];

function sanitizeExamType(raw: unknown): MedicalExamType {
  return VALID_EXAM_TYPES.includes(raw as MedicalExamType)
    ? (raw as MedicalExamType)
    : 'outro';
}

const VALID_EXAM_STATUSES: MedicalExamStatus[] = ['otimo', 'acompanhar', 'atencao'];

function sanitizeExamStatus(raw: unknown): MedicalExamStatus {
  return VALID_EXAM_STATUSES.includes(raw as MedicalExamStatus)
    ? (raw as MedicalExamStatus)
    : 'otimo';
}

function buildMedicalExamFields(uid: string, exam: MedicalExamEntry) {
  const safeLabel = String(exam.examLabel || 'Exame Clínico').trim().slice(0, 120) || 'Exame Clínico';
  const safeDate =
    String(exam.examDate || new Date().toISOString().slice(0, 10)).trim().slice(0, 16) ||
    new Date().toISOString().slice(0, 10);
  const safeSummary =
    String(exam.resultSummary || 'Sem alterações relevantes').trim().slice(0, 240) ||
    'Sem alterações relevantes';
  const safeMetrics = String(exam.metricsDetail || '').trim().slice(0, 800);
  const safeNotes = String(exam.notes || '').slice(0, 800);
  const nowIso = new Date().toISOString();
  return {
    ownerId: uid,
    examType: sanitizeExamType(exam.examType),
    examLabel: safeLabel,
    examDate: safeDate,
    resultSummary: safeSummary,
    metricsDetail: safeMetrics,
    status: sanitizeExamStatus(exam.status),
    notes: safeNotes,
    createdAtIso: String(exam.createdAtIso || nowIso).slice(0, 40),
  };
}

function buildFortressMutablePayload(state: AppState) {
  return {
    box1: sanitizeNumber(state.box1),
    box2: sanitizeNumber(state.box2),
    box3: sanitizeNumber(state.box3),
    box4: sanitizeNumber(state.box4),
    currentCarValue: sanitizeNumber(state.currentCarValue),
    xp: sanitizeInt(state.xp, 1_000_000_000),
    streak: sanitizeInt(state.streak),
    arenaWins: sanitizeInt(state.arenaWins),
    activeTab: sanitizeTab(state.activeTab),
    oracleIdx: sanitizeInt(state.oracleIdx, 10_000),
    rosaryDecades: sanitizeInt(state.rosaryDecades, 5),
    rosaryCompleted: sanitizeInt(state.rosaryCompleted),
    cdiTotal: sanitizeNumber(state.cdiTotal),
    soundEnabled: Boolean(state.soundEnabled),
    providerDuties: sanitizeDuties(state.providerDuties),
    unlockedMilestones: sanitizeMilestones(state.unlockedMilestones),
    feudChecklist: sanitizeChecklist(state.feudChecklist),
    xpHistory: sanitizeXpHistory(state.xpHistory),
    spiritual: sanitizeSpiritualState(state.spiritual),
    vocational: sanitizeVocationalState(state.vocational),
    updatedAt: serverTimestamp(),
  };
}

function sanitizeDocId(rawId: string): string {
  const cleaned = String(rawId || '')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .slice(0, 120);
  return cleaned || `id_${Date.now()}`;
}

export async function ensureInitialCloudFortress(
  uid: string,
  localState: AppState
): Promise<void> {
  const fortressPath = `fortresses/${uid}`;
  const fortressRef = doc(db, 'fortresses', uid);

  let snap;
  try {
    snap = await getDoc(fortressRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, fortressPath);
  }

  if (snap.exists()) {
    return;
  }

  // Primeira conexão deste Comandante na nuvem: migra dados locais com segurança
  const batch = writeBatch(db);
  batch.set(fortressRef, {
    ownerId: uid,
    ...buildFortressMutablePayload(localState),
    createdAt: serverTimestamp(),
  });

  const txs = (localState.transactions || []).slice(0, 100);
  for (const tx of txs) {
    const safeId = sanitizeDocId(tx.id);
    const txRef = doc(db, 'fortresses', uid, 'transactions', safeId);
    batch.set(txRef, {
      ownerId: uid,
      vaultId: String(tx.vaultId),
      vaultName: String(tx.vaultName || 'Arca').slice(0, 120),
      previousValue: sanitizeNumber(tx.previousValue),
      newValue: sanitizeNumber(tx.newValue),
      difference: Math.max(-1_000_000_000, Math.min(1_000_000_000, Number(tx.difference) || 0)),
      dateIso: String(tx.dateIso || new Date().toISOString()).slice(0, 40),
      createdAt: serverTimestamp(),
    });
  }

  const letters = (localState.letters || []).slice(0, 100);
  for (const letter of letters) {
    const safeId = sanitizeDocId(letter.id);
    const letterRef = doc(db, 'fortresses', uid, 'letters', safeId);
    batch.set(letterRef, {
      ownerId: uid,
      title: String(letter.title || 'Pergaminho').slice(0, 160),
      body: String(letter.body || ' ').slice(0, 5000),
      date: String(letter.date || new Date().toLocaleDateString('pt-BR')).slice(0, 32),
      createdAt: serverTimestamp(),
    });
  }

  const costs = (localState.recurringCosts || []).slice(0, 50);
  for (const cost of costs) {
    const safeId = sanitizeDocId(cost.id);
    const costRef = doc(db, 'fortresses', uid, 'recurringCosts', safeId);
    batch.set(costRef, {
      ownerId: uid,
      name: String(cost.name || 'Custo').slice(0, 80),
      amount: sanitizeNumber(cost.amount),
      category: sanitizeCostCategory(cost.category),
      dueDay: Math.max(1, Math.min(31, Math.floor(Number(cost.dueDay) || 1))),
      active: Boolean(cost.active),
      createdAt: serverTimestamp(),
    });
  }

  const expenses = (localState.tacticalExpenses || []).slice(0, 40);
  for (const exp of expenses) {
    const safeId = sanitizeDocId(exp.id);
    const expRef = doc(db, 'fortresses', uid, 'tacticalExpenses', safeId);
    batch.set(expRef, {
      ownerId: uid,
      userReport: String(exp.userReport || 'Relatório').slice(0, 600),
      classification: sanitizeTacticalClassification(exp.classification),
      categoryLabel: String(exp.categoryLabel || 'Registro').slice(0, 80),
      itemDescription: String(exp.itemDescription || 'Gasto').slice(0, 160),
      amount: sanitizeNumber(exp.amount),
      xpDelta: Math.max(-10000, Math.min(10000, Math.round(Number(exp.xpDelta) || 0))),
      streakReset: Boolean(exp.streakReset),
      tacticalReply: String(exp.tacticalReply || 'Registrado.').slice(0, 1000),
      dateIso: String(exp.dateIso || new Date().toISOString()).slice(0, 40),
      createdAt: serverTimestamp(),
    });
  }

  const missionEntries = (localState.missionEntries || []).slice(0, 80);
  for (const entry of missionEntries) {
    const safeId = sanitizeDocId(entry.id);
    const entryRef = doc(db, 'fortresses', uid, 'missionEntries', safeId);
    batch.set(entryRef, {
      ownerId: uid,
      module: sanitizeMissionModule(entry.module),
      title: String(entry.title || 'Registro').slice(0, 160),
      detail: String(entry.detail || 'Missão').slice(0, 240),
      dateStr: String(entry.dateStr || new Date().toISOString().slice(0, 10)).slice(0, 16),
      timeStr: String(entry.timeStr || '').slice(0, 16),
      completed: Boolean(entry.completed),
      createdAtIso: String(entry.createdAtIso || new Date().toISOString()).slice(0, 40),
      createdAt: serverTimestamp(),
    });
  }

  const couples = (localState.marriageCouples || []).slice(0, 60);
  for (const couple of couples) {
    const safeId = sanitizeDocId(couple.id);
    const coupleRef = doc(db, 'fortresses', uid, 'marriageCouples', safeId);
    batch.set(coupleRef, {
      ...buildMarriageCoupleFields(uid, couple),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  const readings = (localState.readingLogs || []).slice(0, 100);
  for (const log of readings) {
    const safeId = sanitizeDocId(log.id);
    const logRef = doc(db, 'fortresses', uid, 'readingLogs', safeId);
    batch.set(logRef, {
      ...buildReadingLogFields(uid, log),
      createdAt: serverTimestamp(),
    });
  }

  const exams = (localState.medicalExams || []).slice(0, 80);
  for (const exam of exams) {
    const safeId = sanitizeDocId(exam.id);
    const examRef = doc(db, 'fortresses', uid, 'medicalExams', safeId);
    batch.set(examRef, {
      ...buildMedicalExamFields(uid, exam),
      createdAt: serverTimestamp(),
    });
  }

  const spiritualLogs = (localState.spiritualLogs || []).slice(0, 120);
  for (const sLog of spiritualLogs) {
    const safeId = sanitizeDocId(sLog.id);
    const sRef = doc(db, 'fortresses', uid, 'spiritualLogs', safeId);
    batch.set(sRef, {
      ...buildSpiritualLogFields(uid, sLog),
      createdAt: serverTimestamp(),
    });
  }

  try {
    await batch.commit();
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, fortressPath);
  }
}

const VALID_TACTICAL_CLASSES: TacticalExpenseClassification[] = [
  'impulso',
  'suprimento',
  'comum',
];

function sanitizeTacticalClassification(raw: unknown): TacticalExpenseClassification {
  return VALID_TACTICAL_CLASSES.includes(raw as TacticalExpenseClassification)
    ? (raw as TacticalExpenseClassification)
    : 'comum';
}

const VALID_COST_CATEGORIES: RecurringCostCategory[] = [
  'mercado',
  'educacao',
  'lar',
  'transporte',
  'outros',
];

function sanitizeCostCategory(cat: unknown): RecurringCostCategory {
  return VALID_COST_CATEGORIES.includes(cat as RecurringCostCategory)
    ? (cat as RecurringCostCategory)
    : 'outros';
}

export async function syncFortressFields(uid: string, state: AppState): Promise<void> {
  const path = `fortresses/${uid}`;
  const ref = doc(db, 'fortresses', uid);
  try {
    await updateDoc(ref, buildFortressMutablePayload(state));
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function addCloudTransaction(uid: string, tx: TransactionEntry): Promise<void> {
  const safeId = sanitizeDocId(tx.id);
  const path = `fortresses/${uid}/transactions/${safeId}`;
  const ref = doc(db, 'fortresses', uid, 'transactions', safeId);
  try {
    await setDoc(ref, {
      ownerId: uid,
      vaultId: String(tx.vaultId),
      vaultName: String(tx.vaultName || 'Arca').slice(0, 120),
      previousValue: sanitizeNumber(tx.previousValue),
      newValue: sanitizeNumber(tx.newValue),
      difference: Math.max(-1_000_000_000, Math.min(1_000_000_000, Number(tx.difference) || 0)),
      dateIso: String(tx.dateIso || new Date().toISOString()).slice(0, 40),
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function deleteCloudTransaction(uid: string, txId: string): Promise<void> {
  const safeId = sanitizeDocId(txId);
  const path = `fortresses/${uid}/transactions/${safeId}`;
  const ref = doc(db, 'fortresses', uid, 'transactions', safeId);
  try {
    await deleteDoc(ref);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export async function addCloudLetter(uid: string, letter: Letter): Promise<void> {
  const safeId = sanitizeDocId(letter.id);
  const path = `fortresses/${uid}/letters/${safeId}`;
  const ref = doc(db, 'fortresses', uid, 'letters', safeId);
  try {
    await setDoc(ref, {
      ownerId: uid,
      title: String(letter.title || 'Pergaminho').slice(0, 160),
      body: String(letter.body || ' ').slice(0, 5000),
      date: String(letter.date || new Date().toLocaleDateString('pt-BR')).slice(0, 32),
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function deleteCloudLetter(uid: string, letterId: string): Promise<void> {
  const safeId = sanitizeDocId(letterId);
  const path = `fortresses/${uid}/letters/${safeId}`;
  const ref = doc(db, 'fortresses', uid, 'letters', safeId);
  try {
    await deleteDoc(ref);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export async function addCloudRecurringCost(uid: string, cost: RecurringCost): Promise<void> {
  const safeId = sanitizeDocId(cost.id);
  const path = `fortresses/${uid}/recurringCosts/${safeId}`;
  const ref = doc(db, 'fortresses', uid, 'recurringCosts', safeId);
  try {
    await setDoc(ref, {
      ownerId: uid,
      name: String(cost.name || 'Custo').slice(0, 80),
      amount: sanitizeNumber(cost.amount),
      category: sanitizeCostCategory(cost.category),
      dueDay: Math.max(1, Math.min(31, Math.floor(Number(cost.dueDay) || 1))),
      active: Boolean(cost.active),
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function toggleCloudRecurringCost(
  uid: string,
  costId: string,
  active: boolean
): Promise<void> {
  const safeId = sanitizeDocId(costId);
  const path = `fortresses/${uid}/recurringCosts/${safeId}`;
  const ref = doc(db, 'fortresses', uid, 'recurringCosts', safeId);
  try {
    await updateDoc(ref, { active: Boolean(active) });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function deleteCloudRecurringCost(uid: string, costId: string): Promise<void> {
  const safeId = sanitizeDocId(costId);
  const path = `fortresses/${uid}/recurringCosts/${safeId}`;
  const ref = doc(db, 'fortresses', uid, 'recurringCosts', safeId);
  try {
    await deleteDoc(ref);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export async function addCloudTacticalExpense(
  uid: string,
  exp: TacticalExpenseEntry
): Promise<void> {
  const safeId = sanitizeDocId(exp.id);
  const path = `fortresses/${uid}/tacticalExpenses/${safeId}`;
  const ref = doc(db, 'fortresses', uid, 'tacticalExpenses', safeId);
  try {
    await setDoc(ref, {
      ownerId: uid,
      userReport: String(exp.userReport || 'Relatório').slice(0, 600),
      classification: sanitizeTacticalClassification(exp.classification),
      categoryLabel: String(exp.categoryLabel || 'Registro').slice(0, 80),
      itemDescription: String(exp.itemDescription || 'Gasto').slice(0, 160),
      amount: sanitizeNumber(exp.amount),
      xpDelta: Math.max(-10000, Math.min(10000, Math.round(Number(exp.xpDelta) || 0))),
      streakReset: Boolean(exp.streakReset),
      tacticalReply: String(exp.tacticalReply || 'Registrado.').slice(0, 1000),
      dateIso: String(exp.dateIso || new Date().toISOString()).slice(0, 40),
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function deleteCloudTacticalExpense(
  uid: string,
  expenseId: string
): Promise<void> {
  const safeId = sanitizeDocId(expenseId);
  const path = `fortresses/${uid}/tacticalExpenses/${safeId}`;
  const ref = doc(db, 'fortresses', uid, 'tacticalExpenses', safeId);
  try {
    await deleteDoc(ref);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export async function addCloudMissionEntry(
  uid: string,
  entry: MissionEntry
): Promise<void> {
  const safeId = sanitizeDocId(entry.id);
  const path = `fortresses/${uid}/missionEntries/${safeId}`;
  const ref = doc(db, 'fortresses', uid, 'missionEntries', safeId);
  try {
    await setDoc(ref, {
      ownerId: uid,
      module: sanitizeMissionModule(entry.module),
      title: String(entry.title || 'Registro').slice(0, 160),
      detail: String(entry.detail || 'Missão').slice(0, 240),
      dateStr: String(entry.dateStr || new Date().toISOString().slice(0, 10)).slice(0, 16),
      timeStr: String(entry.timeStr || '').slice(0, 16),
      completed: Boolean(entry.completed),
      createdAtIso: String(entry.createdAtIso || new Date().toISOString()).slice(0, 40),
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function toggleCloudMissionEntry(
  uid: string,
  entryId: string,
  completed: boolean
): Promise<void> {
  const safeId = sanitizeDocId(entryId);
  const path = `fortresses/${uid}/missionEntries/${safeId}`;
  const ref = doc(db, 'fortresses', uid, 'missionEntries', safeId);
  try {
    await updateDoc(ref, { completed: Boolean(completed) });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function deleteCloudMissionEntry(uid: string, entryId: string): Promise<void> {
  const safeId = sanitizeDocId(entryId);
  const path = `fortresses/${uid}/missionEntries/${safeId}`;
  const ref = doc(db, 'fortresses', uid, 'missionEntries', safeId);
  try {
    await deleteDoc(ref);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export async function addCloudMarriageCouple(
  uid: string,
  couple: MarriageCouple
): Promise<void> {
  const safeId = sanitizeDocId(couple.id);
  const path = `fortresses/${uid}/marriageCouples/${safeId}`;
  const ref = doc(db, 'fortresses', uid, 'marriageCouples', safeId);
  try {
    await setDoc(ref, {
      ...buildMarriageCoupleFields(uid, couple),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function updateCloudMarriageCouple(
  uid: string,
  couple: MarriageCouple
): Promise<void> {
  const safeId = sanitizeDocId(couple.id);
  const path = `fortresses/${uid}/marriageCouples/${safeId}`;
  const ref = doc(db, 'fortresses', uid, 'marriageCouples', safeId);
  const fields = buildMarriageCoupleFields(uid, couple);
  try {
    await updateDoc(ref, {
      coupleNames: fields.coupleNames,
      scheduledDate: fields.scheduledDate,
      scheduledTime: fields.scheduledTime,
      topic: fields.topic,
      notes: fields.notes,
      status: fields.status,
      updatedAtIso: fields.updatedAtIso,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function deleteCloudMarriageCouple(uid: string, coupleId: string): Promise<void> {
  const safeId = sanitizeDocId(coupleId);
  const path = `fortresses/${uid}/marriageCouples/${safeId}`;
  const ref = doc(db, 'fortresses', uid, 'marriageCouples', safeId);
  try {
    await deleteDoc(ref);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export async function addCloudReadingLog(uid: string, log: ReadingLog): Promise<void> {
  const safeId = sanitizeDocId(log.id);
  const path = `fortresses/${uid}/readingLogs/${safeId}`;
  const ref = doc(db, 'fortresses', uid, 'readingLogs', safeId);
  try {
    await setDoc(ref, {
      ...buildReadingLogFields(uid, log),
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function updateCloudReadingLog(uid: string, log: ReadingLog): Promise<void> {
  const safeId = sanitizeDocId(log.id);
  const path = `fortresses/${uid}/readingLogs/${safeId}`;
  const ref = doc(db, 'fortresses', uid, 'readingLogs', safeId);
  const fields = buildReadingLogFields(uid, log);
  try {
    await updateDoc(ref, {
      completed: fields.completed,
      xpGranted: fields.xpGranted,
      pagesOrMinutes: fields.pagesOrMinutes,
      notes: fields.notes,
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function deleteCloudReadingLog(uid: string, logId: string): Promise<void> {
  const safeId = sanitizeDocId(logId);
  const path = `fortresses/${uid}/readingLogs/${safeId}`;
  const ref = doc(db, 'fortresses', uid, 'readingLogs', safeId);
  try {
    await deleteDoc(ref);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export async function addCloudMedicalExam(uid: string, exam: MedicalExamEntry): Promise<void> {
  const safeId = sanitizeDocId(exam.id);
  const path = `fortresses/${uid}/medicalExams/${safeId}`;
  const ref = doc(db, 'fortresses', uid, 'medicalExams', safeId);
  try {
    await setDoc(ref, {
      ...buildMedicalExamFields(uid, exam),
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function updateCloudMedicalExam(
  uid: string,
  exam: MedicalExamEntry
): Promise<void> {
  const safeId = sanitizeDocId(exam.id);
  const path = `fortresses/${uid}/medicalExams/${safeId}`;
  const ref = doc(db, 'fortresses', uid, 'medicalExams', safeId);
  const fields = buildMedicalExamFields(uid, exam);
  try {
    await updateDoc(ref, {
      examDate: fields.examDate,
      resultSummary: fields.resultSummary,
      metricsDetail: fields.metricsDetail,
      status: fields.status,
      notes: fields.notes,
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function deleteCloudMedicalExam(uid: string, examId: string): Promise<void> {
  const safeId = sanitizeDocId(examId);
  const path = `fortresses/${uid}/medicalExams/${safeId}`;
  const ref = doc(db, 'fortresses', uid, 'medicalExams', safeId);
  try {
    await deleteDoc(ref);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export async function replaceCloudFortress(uid: string, targetState: AppState): Promise<void> {
  const fortressPath = `fortresses/${uid}`;
  const txCollPath = `fortresses/${uid}/transactions`;
  const lettersCollPath = `fortresses/${uid}/letters`;
  const costsCollPath = `fortresses/${uid}/recurringCosts`;
  const expCollPath = `fortresses/${uid}/tacticalExpenses`;
  const missionCollPath = `fortresses/${uid}/missionEntries`;
  const couplesCollPath = `fortresses/${uid}/marriageCouples`;
  const readingsCollPath = `fortresses/${uid}/readingLogs`;
  const examsCollPath = `fortresses/${uid}/medicalExams`;
  const spiritualCollPath = `fortresses/${uid}/spiritualLogs`;

  try {
    const [
      txSnap,
      lettersSnap,
      costsSnap,
      expSnap,
      missionSnap,
      couplesSnap,
      readingsSnap,
      examsSnap,
      spiritualSnap,
    ] = await Promise.all([
      getDocs(query(collection(db, 'fortresses', uid, 'transactions'), where('ownerId', '==', uid))),
      getDocs(query(collection(db, 'fortresses', uid, 'letters'), where('ownerId', '==', uid))),
      getDocs(query(collection(db, 'fortresses', uid, 'recurringCosts'), where('ownerId', '==', uid))),
      getDocs(query(collection(db, 'fortresses', uid, 'tacticalExpenses'), where('ownerId', '==', uid))),
      getDocs(query(collection(db, 'fortresses', uid, 'missionEntries'), where('ownerId', '==', uid))),
      getDocs(query(collection(db, 'fortresses', uid, 'marriageCouples'), where('ownerId', '==', uid))),
      getDocs(query(collection(db, 'fortresses', uid, 'readingLogs'), where('ownerId', '==', uid))),
      getDocs(query(collection(db, 'fortresses', uid, 'medicalExams'), where('ownerId', '==', uid))),
      getDocs(query(collection(db, 'fortresses', uid, 'spiritualLogs'), where('ownerId', '==', uid))),
    ]);

    const batch = writeBatch(db);
    txSnap.docs.forEach((d) => batch.delete(d.ref));
    lettersSnap.docs.forEach((d) => batch.delete(d.ref));
    costsSnap.docs.forEach((d) => batch.delete(d.ref));
    expSnap.docs.forEach((d) => batch.delete(d.ref));
    missionSnap.docs.forEach((d) => batch.delete(d.ref));
    couplesSnap.docs.forEach((d) => batch.delete(d.ref));
    readingsSnap.docs.forEach((d) => batch.delete(d.ref));
    examsSnap.docs.forEach((d) => batch.delete(d.ref));
    spiritualSnap.docs.forEach((d) => batch.delete(d.ref));

    batch.update(doc(db, 'fortresses', uid), buildFortressMutablePayload(targetState));

    for (const tx of (targetState.transactions || []).slice(0, 100)) {
      const safeId = sanitizeDocId(tx.id);
      batch.set(doc(db, 'fortresses', uid, 'transactions', safeId), {
        ownerId: uid,
        vaultId: String(tx.vaultId),
        vaultName: String(tx.vaultName || 'Arca').slice(0, 120),
        previousValue: sanitizeNumber(tx.previousValue),
        newValue: sanitizeNumber(tx.newValue),
        difference: Math.max(-1_000_000_000, Math.min(1_000_000_000, Number(tx.difference) || 0)),
        dateIso: String(tx.dateIso || new Date().toISOString()).slice(0, 40),
        createdAt: serverTimestamp(),
      });
    }

    for (const letter of (targetState.letters || []).slice(0, 100)) {
      const safeId = sanitizeDocId(letter.id);
      batch.set(doc(db, 'fortresses', uid, 'letters', safeId), {
        ownerId: uid,
        title: String(letter.title || 'Pergaminho').slice(0, 160),
        body: String(letter.body || ' ').slice(0, 5000),
        date: String(letter.date || new Date().toLocaleDateString('pt-BR')).slice(0, 32),
        createdAt: serverTimestamp(),
      });
    }

    for (const cost of (targetState.recurringCosts || []).slice(0, 50)) {
      const safeId = sanitizeDocId(cost.id);
      batch.set(doc(db, 'fortresses', uid, 'recurringCosts', safeId), {
        ownerId: uid,
        name: String(cost.name || 'Custo').slice(0, 80),
        amount: sanitizeNumber(cost.amount),
        category: sanitizeCostCategory(cost.category),
        dueDay: Math.max(1, Math.min(31, Math.floor(Number(cost.dueDay) || 1))),
        active: Boolean(cost.active),
        createdAt: serverTimestamp(),
      });
    }

    for (const exp of (targetState.tacticalExpenses || []).slice(0, 40)) {
      const safeId = sanitizeDocId(exp.id);
      batch.set(doc(db, 'fortresses', uid, 'tacticalExpenses', safeId), {
        ownerId: uid,
        userReport: String(exp.userReport || 'Relatório').slice(0, 600),
        classification: sanitizeTacticalClassification(exp.classification),
        categoryLabel: String(exp.categoryLabel || 'Registro').slice(0, 80),
        itemDescription: String(exp.itemDescription || 'Gasto').slice(0, 160),
        amount: sanitizeNumber(exp.amount),
        xpDelta: Math.max(-10000, Math.min(10000, Math.round(Number(exp.xpDelta) || 0))),
        streakReset: Boolean(exp.streakReset),
        tacticalReply: String(exp.tacticalReply || 'Registrado.').slice(0, 1000),
        dateIso: String(exp.dateIso || new Date().toISOString()).slice(0, 40),
        createdAt: serverTimestamp(),
      });
    }

    for (const entry of (targetState.missionEntries || []).slice(0, 80)) {
      const safeId = sanitizeDocId(entry.id);
      batch.set(doc(db, 'fortresses', uid, 'missionEntries', safeId), {
        ownerId: uid,
        module: sanitizeMissionModule(entry.module),
        title: String(entry.title || 'Registro').slice(0, 160),
        detail: String(entry.detail || 'Missão').slice(0, 240),
        dateStr: String(entry.dateStr || new Date().toISOString().slice(0, 10)).slice(0, 16),
        timeStr: String(entry.timeStr || '').slice(0, 16),
        completed: Boolean(entry.completed),
        createdAtIso: String(entry.createdAtIso || new Date().toISOString()).slice(0, 40),
        createdAt: serverTimestamp(),
      });
    }

    for (const couple of (targetState.marriageCouples || []).slice(0, 60)) {
      const safeId = sanitizeDocId(couple.id);
      batch.set(doc(db, 'fortresses', uid, 'marriageCouples', safeId), {
        ...buildMarriageCoupleFields(uid, couple),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    for (const log of (targetState.readingLogs || []).slice(0, 100)) {
      const safeId = sanitizeDocId(log.id);
      batch.set(doc(db, 'fortresses', uid, 'readingLogs', safeId), {
        ...buildReadingLogFields(uid, log),
        createdAt: serverTimestamp(),
      });
    }

    for (const exam of (targetState.medicalExams || []).slice(0, 80)) {
      const safeId = sanitizeDocId(exam.id);
      batch.set(doc(db, 'fortresses', uid, 'medicalExams', safeId), {
        ...buildMedicalExamFields(uid, exam),
        createdAt: serverTimestamp(),
      });
    }

    for (const sLog of (targetState.spiritualLogs || []).slice(0, 120)) {
      const safeId = sanitizeDocId(sLog.id);
      batch.set(doc(db, 'fortresses', uid, 'spiritualLogs', safeId), {
        ...buildSpiritualLogFields(uid, sLog),
        createdAt: serverTimestamp(),
      });
    }

    await batch.commit();
  } catch (err) {
    handleFirestoreError(
      err,
      OperationType.WRITE,
      `${fortressPath} | ${txCollPath} | ${lettersCollPath} | ${costsCollPath} | ${expCollPath} | ${missionCollPath} | ${couplesCollPath} | ${readingsCollPath} | ${examsCollPath} | ${spiritualCollPath}`
    );
  }
}

export async function addCloudSpiritualLog(uid: string, log: SpiritualLog): Promise<void> {
  const safeId = sanitizeDocId(log.id);
  const path = `fortresses/${uid}/spiritualLogs/${safeId}`;
  const ref = doc(db, 'fortresses', uid, 'spiritualLogs', safeId);
  try {
    await setDoc(ref, {
      ...buildSpiritualLogFields(uid, log),
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function deleteCloudSpiritualLog(uid: string, logId: string): Promise<void> {
  const safeId = sanitizeDocId(logId);
  const path = `fortresses/${uid}/spiritualLogs/${safeId}`;
  const ref = doc(db, 'fortresses', uid, 'spiritualLogs', safeId);
  try {
    await deleteDoc(ref);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export function subscribeFortressCloud(
  uid: string,
  callbacks: {
    onFortressData: (partial: Partial<AppState>) => void;
    onTransactionsData: (transactions: TransactionEntry[]) => void;
    onLettersData: (letters: Letter[]) => void;
    onRecurringCostsData: (recurringCosts: RecurringCost[]) => void;
    onTacticalExpensesData: (tacticalExpenses: TacticalExpenseEntry[]) => void;
    onMissionEntriesData?: (missionEntries: MissionEntry[]) => void;
    onMarriageCouplesData?: (marriageCouples: MarriageCouple[]) => void;
    onReadingLogsData?: (readingLogs: ReadingLog[]) => void;
    onMedicalExamsData?: (medicalExams: MedicalExamEntry[]) => void;
    onSpiritualLogsData?: (spiritualLogs: SpiritualLog[]) => void;
  }
): Unsubscribe {
  const fortressPath = `fortresses/${uid}`;
  const txPath = `fortresses/${uid}/transactions`;
  const lettersPath = `fortresses/${uid}/letters`;

  const unsubFortress = onSnapshot(
    doc(db, 'fortresses', uid),
    (snapshot) => {
      if (!snapshot.exists()) return;
      const d = snapshot.data();
      const rawDuties = (d.providerDuties || {}) as Record<string, boolean>;
      const duties: Record<number, boolean> = {};
      Object.entries(rawDuties).forEach(([k, v]) => {
        const numKey = Number(k);
        if (!Number.isNaN(numKey)) duties[numKey] = Boolean(v);
      });

      callbacks.onFortressData({
        box1: Number(d.box1 ?? DEFAULT_STATE.box1),
        box2: Number(d.box2 ?? DEFAULT_STATE.box2),
        box3: Number(d.box3 ?? DEFAULT_STATE.box3),
        box4: Number(d.box4 ?? DEFAULT_STATE.box4),
        currentCarValue: Number(d.currentCarValue ?? DEFAULT_STATE.currentCarValue),
        xp: Number(d.xp ?? DEFAULT_STATE.xp),
        streak: Number(d.streak ?? DEFAULT_STATE.streak),
        arenaWins: Number(d.arenaWins ?? DEFAULT_STATE.arenaWins),
        activeTab: sanitizeTab(d.activeTab),
        oracleIdx: Number(d.oracleIdx ?? DEFAULT_STATE.oracleIdx),
        rosaryDecades: Number(d.rosaryDecades ?? DEFAULT_STATE.rosaryDecades),
        rosaryCompleted: Number(d.rosaryCompleted ?? DEFAULT_STATE.rosaryCompleted),
        cdiTotal: Number(d.cdiTotal ?? DEFAULT_STATE.cdiTotal),
        soundEnabled: typeof d.soundEnabled === 'boolean' ? d.soundEnabled : true,
        providerDuties: duties,
        unlockedMilestones: (d.unlockedMilestones as Record<string, boolean>) || {},
        feudChecklist: sanitizeChecklist(d.feudChecklist as Partial<FeudChecklistState>),
        xpHistory: sanitizeXpHistory(d.xpHistory as Record<string, number> | undefined),
        spiritual: sanitizeSpiritualState(d.spiritual as Partial<SpiritualState> | undefined),
        vocational: sanitizeVocationalState(d.vocational as Partial<VocationalState> | undefined),
      });
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, fortressPath);
    }
  );

  const txQuery = query(
    collection(db, 'fortresses', uid, 'transactions'),
    where('ownerId', '==', uid)
  );
  const unsubTx = onSnapshot(
    txQuery,
    (snapshot) => {
      const items: TransactionEntry[] = snapshot.docs.map((docSnap) => {
        const d = docSnap.data();
        const rawVid = String(d.vaultId ?? '1');
        const vaultId: VaultId | 'cdi' =
          rawVid === 'cdi' ? 'cdi' : ((Number(rawVid) || 1) as VaultId);
        return {
          id: docSnap.id,
          vaultId,
          vaultName: String(d.vaultName || ''),
          previousValue: Number(d.previousValue || 0),
          newValue: Number(d.newValue || 0),
          difference: Number(d.difference || 0),
          dateIso: String(d.dateIso || new Date().toISOString()),
        };
      });
      items.sort((a, b) => new Date(b.dateIso).getTime() - new Date(a.dateIso).getTime());
      callbacks.onTransactionsData(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, txPath);
    }
  );

  const lettersQuery = query(
    collection(db, 'fortresses', uid, 'letters'),
    where('ownerId', '==', uid)
  );
  const unsubLetters = onSnapshot(
    lettersQuery,
    (snapshot) => {
      const withOrder = snapshot.docs.map((docSnap) => {
        const d = docSnap.data();
        const createdMillis =
          d.createdAt && typeof d.createdAt.toMillis === 'function'
            ? Number(d.createdAt.toMillis())
            : Number(String(docSnap.id).split('_')[0]) || 0;
        return {
          createdMillis,
          entry: {
            id: docSnap.id,
            title: String(d.title || ''),
            body: String(d.body || ''),
            date: String(d.date || ''),
          } satisfies Letter,
        };
      });
      withOrder.sort((a, b) => b.createdMillis - a.createdMillis);
      callbacks.onLettersData(withOrder.map((x) => x.entry));
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, lettersPath);
    }
  );

  const costsPath = `fortresses/${uid}/recurringCosts`;
  const costsQuery = query(
    collection(db, 'fortresses', uid, 'recurringCosts'),
    where('ownerId', '==', uid)
  );
  const unsubCosts = onSnapshot(
    costsQuery,
    (snapshot) => {
      const withOrder = snapshot.docs.map((docSnap) => {
        const d = docSnap.data();
        const createdMillis =
          d.createdAt && typeof d.createdAt.toMillis === 'function'
            ? Number(d.createdAt.toMillis())
            : Number(String(docSnap.id).split('_')[0]) || 0;
        return {
          createdMillis,
          entry: {
            id: docSnap.id,
            name: String(d.name || ''),
            amount: Number(d.amount || 0),
            category: sanitizeCostCategory(d.category),
            dueDay: Math.max(1, Math.min(31, Number(d.dueDay || 1))),
            active: typeof d.active === 'boolean' ? d.active : true,
          } satisfies RecurringCost,
        };
      });
      withOrder.sort((a, b) => b.createdMillis - a.createdMillis);
      callbacks.onRecurringCostsData(withOrder.map((x) => x.entry));
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, costsPath);
    }
  );

  const expensesPath = `fortresses/${uid}/tacticalExpenses`;
  const expensesQuery = query(
    collection(db, 'fortresses', uid, 'tacticalExpenses'),
    where('ownerId', '==', uid)
  );
  const unsubExpenses = onSnapshot(
    expensesQuery,
    (snapshot) => {
      const items: TacticalExpenseEntry[] = snapshot.docs.map((docSnap) => {
        const d = docSnap.data();
        return {
          id: docSnap.id,
          userReport: String(d.userReport || ''),
          classification: sanitizeTacticalClassification(d.classification),
          categoryLabel: String(d.categoryLabel || ''),
          itemDescription: String(d.itemDescription || ''),
          amount: Number(d.amount || 0),
          xpDelta: Number(d.xpDelta || 0),
          streakReset: Boolean(d.streakReset),
          tacticalReply: String(d.tacticalReply || ''),
          dateIso: String(d.dateIso || new Date().toISOString()),
        };
      });
      items.sort((a, b) => new Date(b.dateIso).getTime() - new Date(a.dateIso).getTime());
      callbacks.onTacticalExpensesData(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, expensesPath);
    }
  );

  const missionsPath = `fortresses/${uid}/missionEntries`;
  const missionsQuery = query(
    collection(db, 'fortresses', uid, 'missionEntries'),
    where('ownerId', '==', uid)
  );
  const unsubMissions = onSnapshot(
    missionsQuery,
    (snapshot) => {
      const items: MissionEntry[] = snapshot.docs.map((docSnap) => {
        const d = docSnap.data();
        return {
          id: docSnap.id,
          module: sanitizeMissionModule(d.module),
          title: String(d.title || ''),
          detail: String(d.detail || ''),
          dateStr: String(d.dateStr || ''),
          timeStr: String(d.timeStr || ''),
          completed: Boolean(d.completed),
          createdAtIso: String(d.createdAtIso || new Date().toISOString()),
        };
      });
      items.sort(
        (a, b) =>
          new Date(b.createdAtIso).getTime() - new Date(a.createdAtIso).getTime()
      );
      callbacks.onMissionEntriesData?.(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, missionsPath);
    }
  );

  const couplesPath = `fortresses/${uid}/marriageCouples`;
  const couplesQuery = query(
    collection(db, 'fortresses', uid, 'marriageCouples'),
    where('ownerId', '==', uid)
  );
  const unsubCouples = onSnapshot(
    couplesQuery,
    (snapshot) => {
      const items: MarriageCouple[] = snapshot.docs.map((docSnap) => {
        const d = docSnap.data();
        return {
          id: docSnap.id,
          coupleNames: String(d.coupleNames || ''),
          scheduledDate: String(d.scheduledDate || ''),
          scheduledTime: String(d.scheduledTime || ''),
          topic: String(d.topic || ''),
          notes: String(d.notes || ''),
          status: sanitizeMarriageStatus(d.status),
          createdAtIso: String(d.createdAtIso || new Date().toISOString()),
          updatedAtIso: String(d.updatedAtIso || d.createdAtIso || new Date().toISOString()),
        };
      });
      items.sort(
        (a, b) =>
          new Date(b.updatedAtIso || b.createdAtIso).getTime() -
          new Date(a.updatedAtIso || a.createdAtIso).getTime()
      );
      callbacks.onMarriageCouplesData?.(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, couplesPath);
    }
  );

  const readingsPath = `fortresses/${uid}/readingLogs`;
  const readingsQuery = query(
    collection(db, 'fortresses', uid, 'readingLogs'),
    where('ownerId', '==', uid)
  );
  const unsubReadings = onSnapshot(
    readingsQuery,
    (snapshot) => {
      const items: ReadingLog[] = snapshot.docs.map((docSnap) => {
        const d = docSnap.data();
        return {
          id: docSnap.id,
          category: sanitizeReadingCategory(d.category),
          title: String(d.title || ''),
          authorOrSource: String(d.authorOrSource || ''),
          pagesOrMinutes: Number(d.pagesOrMinutes || 0),
          notes: String(d.notes || ''),
          dateStr: String(d.dateStr || ''),
          completed: Boolean(d.completed),
          xpGranted: Number(d.xpGranted || 0),
          createdAtIso: String(d.createdAtIso || new Date().toISOString()),
        };
      });
      items.sort(
        (a, b) =>
          new Date(b.createdAtIso).getTime() - new Date(a.createdAtIso).getTime()
      );
      callbacks.onReadingLogsData?.(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, readingsPath);
    }
  );

  const examsPath = `fortresses/${uid}/medicalExams`;
  const examsQuery = query(
    collection(db, 'fortresses', uid, 'medicalExams'),
    where('ownerId', '==', uid)
  );
  const unsubExams = onSnapshot(
    examsQuery,
    (snapshot) => {
      const items: MedicalExamEntry[] = snapshot.docs.map((docSnap) => {
        const d = docSnap.data();
        return {
          id: docSnap.id,
          examType: sanitizeExamType(d.examType),
          examLabel: String(d.examLabel || ''),
          examDate: String(d.examDate || ''),
          resultSummary: String(d.resultSummary || ''),
          metricsDetail: String(d.metricsDetail || ''),
          status: sanitizeExamStatus(d.status),
          notes: String(d.notes || ''),
          createdAtIso: String(d.createdAtIso || new Date().toISOString()),
        };
      });
      items.sort((a, b) => {
        const byDate = (b.examDate || '').localeCompare(a.examDate || '');
        if (byDate !== 0) return byDate;
        return new Date(b.createdAtIso).getTime() - new Date(a.createdAtIso).getTime();
      });
      callbacks.onMedicalExamsData?.(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, examsPath);
    }
  );

  const spiritualLogsPath = `fortresses/${uid}/spiritualLogs`;
  const spiritualLogsQuery = query(
    collection(db, 'fortresses', uid, 'spiritualLogs'),
    where('ownerId', '==', uid)
  );
  const unsubSpiritualLogs = onSnapshot(
    spiritualLogsQuery,
    (snapshot) => {
      const items: SpiritualLog[] = snapshot.docs.map((docSnap) => {
        const d = docSnap.data();
        return {
          id: docSnap.id,
          actType: sanitizeSpiritualActType(d.actType),
          actLabel: String(d.actLabel || ''),
          dateStr: String(d.dateStr || ''),
          notes: String(d.notes || ''),
          baseXp: Number(d.baseXp || 0),
          multiplierApplied: Number(d.multiplierApplied || 1),
          xpGranted: Number(d.xpGranted || 0),
          createdAtIso: String(d.createdAtIso || new Date().toISOString()),
        };
      });
      items.sort((a, b) => {
        const byDate = (b.dateStr || '').localeCompare(a.dateStr || '');
        if (byDate !== 0) return byDate;
        return new Date(b.createdAtIso).getTime() - new Date(a.createdAtIso).getTime();
      });
      callbacks.onSpiritualLogsData?.(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, spiritualLogsPath);
    }
  );

  return () => {
    unsubFortress();
    unsubTx();
    unsubLetters();
    unsubCosts();
    unsubExpenses();
    unsubMissions();
    unsubCouples();
    unsubReadings();
    unsubExams();
    unsubSpiritualLogs();
  };
}
