export type TabId = 'comando' | 'rota' | 'corolla' | 'provedor' | 'cronicas';

export type VaultId = 1 | 2 | 3 | 4;

export type FeudId = 'feudo_1' | 'feudo_2' | 'feudo_3' | 'feudo_4' | 'feudo_5' | 'feudo_6';

export interface Letter {
  id: string;
  title: string;
  body: string;
  date: string;
  author?: string;
}

export interface LedgerEntry {
  id: string;
  vaultId: VaultId | 'cdi';
  label: string;
  amount: number;
  mode: 'deposit' | 'set' | 'cdi';
  dateIso: string;
}

export interface TransactionEntry {
  id: string;
  vaultId: VaultId | 'cdi';
  vaultName: string;
  previousValue: number;
  newValue: number;
  difference: number;
  dateIso: string;
}

export interface FeudChecklistState {
  feudo_3_enxoval: boolean;
  feudo_3_nascimento: boolean;
  feudo_4_ipva: boolean;
  feudo_4_emprestimo: boolean;
  feudo_6_investimentos: boolean;
  feudo_6_quitacao_casa: boolean;
}

export type RecurringCostCategory = 'mercado' | 'educacao' | 'lar' | 'transporte' | 'outros';

export interface RecurringCost {
  id: string;
  name: string;
  amount: number;
  category: RecurringCostCategory;
  dueDay: number;
  active: boolean;
}

export type TacticalExpenseClassification = 'impulso' | 'suprimento' | 'comum';

export interface TacticalExpenseEntry {
  id: string;
  userReport: string;
  classification: TacticalExpenseClassification;
  categoryLabel: string;
  itemDescription: string;
  amount: number;
  xpDelta: number;
  streakReset: boolean;
  tacticalReply: string;
  dateIso: string;
}

export type ProviderFocusSection =
  | 'all'
  | 'espiritual'
  | 'oficio'
  | 'mente'
  | 'juridico'
  | 'quartel'
  | 'corporal'
  | 'mesc'
  | 'pastoral';

export type SpiritualActType =
  | 'manha_noite'
  | 'dezena'
  | 'lectio_divina'
  | 'novena_sao_jose'
  | 'comunhao'
  | 'adoracao'
  | 'terco_completo'
  | 'santa_missa'
  | 'confissao';

export type SpiritualDailyGoalKey = 'oracao' | 'dezena' | 'lectio' | 'novena';

export type SpiritualAlertLevel = 'comunhao' | 'vigilia' | 'afastamento' | 'critico';

export interface SpiritualState {
  spiritualXp: number;
  lastPrayerDate: string;
  lastDecayDate: string;
  novenaStreak: number;
  novenaLastDate: string;
  dailyGoalDate: string;
  dailyGoals: Record<SpiritualDailyGoalKey, boolean>;
  decayedXpTotal: number;
  pmDutyDate?: string;
}

export interface SpiritualLog {
  id: string;
  actType: SpiritualActType;
  actLabel: string;
  dateStr: string;
  notes: string;
  baseXp: number;
  multiplierApplied: number;
  xpGranted: number;
  createdAtIso: string;
}

export interface VocationalState {
  tccTheme: string;
  tccStages: Record<string, boolean>;
  academicXp: number;
  brainXp: number;
  bodyXp: number;
  pmEquipment: Record<string, boolean>;
  studyHours: {
    cfo: number;
    prf: number;
    pf: number;
  };
  pullupBest: number;
  pullupTarget: number;
  workoutsTotal: number;
  creatineStockGrams: number;
  creatineDailyDoseGrams: number;
  creatineLastTakenDate: string;
  healthChecks: Record<string, boolean>;
}

export type ReadingCategory = 'espiritual' | 'literatura' | 'tcc' | 'direito';

export interface ReadingLog {
  id: string;
  category: ReadingCategory;
  title: string;
  authorOrSource: string;
  pagesOrMinutes: number;
  notes: string;
  dateStr: string;
  completed: boolean;
  xpGranted: number;
  createdAtIso: string;
}

export type MedicalExamType =
  | 'holter'
  | 'ecocardiograma'
  | 'perfil_lipidico'
  | 'hemograma'
  | 'outro';

export type MedicalExamStatus = 'otimo' | 'acompanhar' | 'atencao';

export interface MedicalExamEntry {
  id: string;
  examType: MedicalExamType;
  examLabel: string;
  examDate: string;
  resultSummary: string;
  metricsDetail: string;
  status: MedicalExamStatus;
  notes: string;
  createdAtIso: string;
}

export type MissionEntryModule = 'exam' | 'pm_shift' | 'workout' | 'mesc_shift';

export interface MissionEntry {
  id: string;
  module: MissionEntryModule;
  title: string;
  detail: string;
  dateStr: string;
  timeStr: string;
  completed: boolean;
  createdAtIso: string;
}

export type MarriageCoupleStatus =
  | 'aguardando_data'
  | 'em_andamento'
  | 'encontro_concluido';

export interface MarriageCouple {
  id: string;
  coupleNames: string;
  scheduledDate: string;
  scheduledTime: string;
  topic: string;
  notes: string;
  status: MarriageCoupleStatus;
  updatedAtIso: string;
  createdAtIso: string;
}

export interface AppState {
  box1: number;
  box2: number;
  box3: number;
  box4: number;
  currentCarValue: number;
  xp: number;
  streak: number;
  arenaWins: number;
  activeTab: TabId;
  oracleIdx: number;
  rosaryDecades: number;
  rosaryCompleted: number;
  providerDuties: Record<number, boolean>;
  letters: Letter[];
  cdiTotal: number;
  ledger: LedgerEntry[];
  transactions: TransactionEntry[];
  recurringCosts: RecurringCost[];
  tacticalExpenses: TacticalExpenseEntry[];
  xpHistory: Record<string, number>;
  unlockedMilestones: Record<string, boolean>;
  feudChecklist: FeudChecklistState;
  soundEnabled: boolean;
  spiritual: SpiritualState;
  spiritualLogs: SpiritualLog[];
  vocational: VocationalState;
  missionEntries: MissionEntry[];
  marriageCouples: MarriageCouple[];
  readingLogs: ReadingLog[];
  medicalExams: MedicalExamEntry[];
}

export type OracleBook = 'Todos' | 'Caminho' | 'Sulco' | 'Forja' | 'Santos';

export interface OracleQuote {
  book: Exclude<OracleBook, 'Todos'>;
  saint: string;
  work: string;
  text: string;
}

export interface VaultConfig {
  id: VaultId;
  roman: string;
  title: string;
  subtitle: string;
  target: number;
  isLongTerm?: boolean;
  priorityLabel: string;
}

export interface EnemyConfig {
  id: 'rotativo' | 'impulso' | 'inflacao' | 'procrastinacao';
  name: string;
  title: string;
  maxHp: number;
  attackPower: number;
  heavyAttackPower: number;
  attackName: string;
  heavyAttackName: string;
  xpReward: number;
  description: string;
}

export interface RelicDefinition {
  id: string;
  name: string;
  requirement: string;
  isUnlocked: (state: AppState) => boolean;
}

export interface ToastItem {
  id: string;
  title: string;
  message: string;
  tone: 'gold' | 'emerald' | 'red';
}

export interface VictoryModalData {
  kicker: string;
  title: string;
  description: string;
  celebration?: 'default' | 'divine-confetti';
  relicId?: string;
  unlockedRelics?: { id: string; name: string }[];
}
