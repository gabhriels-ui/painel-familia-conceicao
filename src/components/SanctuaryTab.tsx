import { useMemo, useState } from 'react';
import {
  BookOpen,
  Brain,
  ChevronLeft,
  ChevronRight,
  Cross,
  Dumbbell,
  Flame,
  HeartHandshake,
  Scale,
  Shield,
  Swords,
  TimerReset,
} from 'lucide-react';
import {
  JACULATORIAS,
  ORACLE_QUOTES,
  PROVIDER_TASKS,
  RELICS,
  TCC_STAGES,
} from '../data/chroniclesData';
import type {
  AppState,
  OracleBook,
  ProviderFocusSection,
  TabId,
  TacticalExpenseEntry,
} from '../types/chronicles';
import { formatBRL } from '../utils/formatters';
import { CathedralRoseWindowSvg, VaultChestSvg, WatchTorchHourglassSvg } from './Crests';
import saintJosephImg from '../assets/images/saint_joseph_retable_1794834103921.jpg';
import saintJosemariaImg from '../assets/images/saint_josemaria_retable_1794834116537.jpg';
import { FleetLifespanCard } from './FleetLifespanCard';
import { MescCommandWidget } from './MescCommandWidget';
import { PaternalPregnancyMonitor } from './PaternalPregnancyMonitor';
import { TacticalCouncilCard } from './TacticalCouncilCard';
import { TacticalExpenseChat } from './TacticalExpenseChat';
import { TacticalOperationalCalendar } from './TacticalOperationalCalendar';
import { XpHistoryChart } from './XpHistoryChart';
import { getAllCoupleConflicts } from '../utils/scheduleConflicts';
import { computeSpiritualMultiplier, evaluateSoulWatchAlert } from '../utils/spiritual';

interface SanctuaryTabProps {
  state: AppState;
  shieldSecondsLeft: number | null;
  enemyFrontBanner: TacticalExpenseEntry | null;
  onDismissEnemyFront: () => void;
  onRecordTacticalExpense: (entry: TacticalExpenseEntry) => void;
  onDeleteTacticalExpense: (id: string) => void;
  onPrevQuote: (poolLength: number) => void;
  onNextQuote: (poolLength: number) => void;
  onStartShield: () => void;
  onCancelShield: () => void;
  onOpenArena: () => void;
  onNavigateTab: (tab: TabId) => void;
  onOpenProviderFocus: (focus: ProviderFocusSection) => void;
  onAddMescShift: (data: {
    title: string;
    detail: string;
    dateStr: string;
    timeStr: string;
  }) => void;
  onToggleMescShift: (entryId: string, xpReward: number) => void;
}

const BOOK_FILTERS: OracleBook[] = ['Todos', 'Caminho', 'Sulco', 'Forja', 'Santos'];

export function SanctuaryTab({
  state,
  shieldSecondsLeft,
  enemyFrontBanner,
  onDismissEnemyFront,
  onRecordTacticalExpense,
  onDeleteTacticalExpense,
  onPrevQuote,
  onNextQuote,
  onStartShield,
  onCancelShield,
  onOpenArena,
  onNavigateTab,
  onOpenProviderFocus,
  onAddMescShift,
  onToggleMescShift,
}: SanctuaryTabProps) {
  const [selectedBook, setSelectedBook] = useState<OracleBook>('Todos');
  const [josephImgError, setJosephImgError] = useState(false);
  const [josemariaImgError, setJosemariaImgError] = useState(false);

  const filteredQuotes = useMemo(() => {
    if (selectedBook === 'Todos') return ORACLE_QUOTES;
    return ORACLE_QUOTES.filter((q) => q.book === selectedBook);
  }, [selectedBook]);

  const quoteIndex = state.oracleIdx % filteredQuotes.length;
  const quote = filteredQuotes[quoteIndex];

  const isShieldActive = shieldSecondsLeft !== null && shieldSecondsLeft > 0;
  const shieldProgress = isShieldActive
    ? Math.round(((60 - shieldSecondsLeft) / 60) * 100)
    : 0;

  const activeJaculatoria = isShieldActive
    ? JACULATORIAS[Math.floor((60 - shieldSecondsLeft) / 15) % JACULATORIAS.length]
    : JACULATORIAS[0];

  const dutiesDone = Object.values(state.providerDuties || {}).filter(Boolean).length;
  const unlockedRelicsCount = RELICS.filter((r) => r.isUnlocked(state)).length;

  const vocational = state.vocational;
  const missionEntries = state.missionEntries || [];
  const tccStagesDone = TCC_STAGES.filter((s) => !!vocational?.tccStages?.[s.key]).length;
  const pendingExams = missionEntries.filter((e) => e.module === 'exam' && !e.completed).length;
  const pendingPmShifts = missionEntries.filter((e) => e.module === 'pm_shift' && !e.completed).length;
  const totalStudyHours =
    (vocational?.studyHours?.cfo || 0) +
    (vocational?.studyHours?.prf || 0) +
    (vocational?.studyHours?.pf || 0);
  const creatineDose = vocational?.creatineDailyDoseGrams || 5;
  const creatineDays =
    creatineDose > 0 ? Math.floor((vocational?.creatineStockGrams || 0) / creatineDose) : 0;
  const pendingMesc = missionEntries.filter((e) => e.module === 'mesc_shift' && !e.completed).length;
  const doneMesc = missionEntries.filter((e) => e.module === 'mesc_shift' && e.completed).length;
  const marriageCouples = state.marriageCouples || [];
  const activeCouplesCount = marriageCouples.filter(
    (c) => c.status !== 'encontro_concluido'
  ).length;
  const coupleConflictsCount = getAllCoupleConflicts(marriageCouples, missionEntries).length;
  const brainXp = vocational?.brainXp || 0;
  const bodyXp = vocational?.bodyXp || 0;
  const readingLogsCount = (state.readingLogs || []).length;
  const medicalExamsCount = (state.medicalExams || []).length;
  const soulWatch = evaluateSoulWatchAlert(state.spiritual, state.spiritualLogs || []);
  const spiritualMult = computeSpiritualMultiplier(
    state.spiritual,
    state.spiritualLogs || []
  );

  let priorityVaultId: 1 | 2 | 3 | 4 = 1;
  let priorityTitle = 'Arca I · Cartão Mercado Pago';
  let priorityRemaining = Math.max(0, 6829 - (state.box1 || 0));
  if (priorityRemaining === 0 && (state.box2 || 0) < 12000) {
    priorityVaultId = 2;
    priorityTitle = 'Arca II · Muralha da Família';
    priorityRemaining = Math.max(0, 12000 - (state.box2 || 0));
  } else if (priorityRemaining === 0 && (state.box3 || 0) < 45000) {
    priorityVaultId = 3;
    priorityTitle = 'Arca III · Corolla XEi 2017';
    priorityRemaining = Math.max(0, 45000 - (state.box3 || 0));
  } else if (priorityRemaining === 0) {
    priorityVaultId = 4;
    priorityTitle = 'Arca IV · Legado & Tesouro IPCA+';
    priorityRemaining = Math.max(0, 50000 - (state.box4 || 0));
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <article className="cathedral-glass state-card p-6 flex flex-col justify-between gap-5">
          <div className="space-y-4">
            <div className="depth-layer-1 flex flex-wrap items-center justify-between gap-2 text-xs text-[#c59b27]">
              <span className="font-epic tracking-wider">Oráculo da Capela de Campanha</span>
              <span className="font-mono-num text-[#a69982]">
                {quoteIndex + 1} / {filteredQuotes.length}
              </span>
            </div>

            <div
              className="depth-layer-2 inline-flex flex-wrap gap-1 p-1 rounded-lg bg-[#101215] border border-white/10"
              role="group"
              aria-label="Filtrar por livro de São Josemaría"
            >
              {BOOK_FILTERS.map((book) => (
                <button
                  key={book}
                  type="button"
                  onClick={() => setSelectedBook(book)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-all min-h-[36px] whitespace-nowrap shrink-0 ${
                    selectedBook === book
                      ? 'bg-[#c59b27] text-[#101215] shadow-sm'
                      : 'text-[#9e9380] hover:text-[#f3ead6]'
                  }`}
                >
                  {book}
                </button>
              ))}
            </div>

            {/* Galeria dos Santos Guerreiros — Retábulo Medieval 3D em Relevo */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => setSelectedBook(selectedBook === 'Santos' ? 'Todos' : 'Santos')}
                aria-pressed={selectedBook === 'Santos'}
                title="Filtrar Oráculo por Santos Patronos"
                className={`state-card parchment-box p-3 flex flex-col items-center text-center gap-2.5 cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#eab308] ${
                  selectedBook === 'Santos'
                    ? 'border-[#eab308] ring-1 ring-[#eab308]/40'
                    : 'hover:border-[#eab308]/60'
                }`}
              >
                <div className="depth-layer-3 saint-retable-oval w-20 h-24 sm:w-24 sm:h-28">
                  <div className="saint-retable-oval-inner w-full h-full flex items-center justify-center">
                    {!josephImgError ? (
                      <img
                        src={saintJosephImg}
                        alt="Pintura clássica de São José com lírios e esquadro de carpinteiro"
                        referrerPolicy="no-referrer"
                        onError={() => setJosephImgError(true)}
                        className="w-full h-full object-cover object-top scale-[1.04]"
                      />
                    ) : (
                      <CathedralRoseWindowSvg className="w-12 h-12" />
                    )}
                  </div>
                </div>
                <div className="depth-layer-2 space-y-0.5 min-w-0">
                  <div className="font-epic text-xs sm:text-sm text-[#fde047] tracking-wide truncate">
                    São José
                  </div>
                  <div className="text-[11px] text-[#a69982] leading-tight">
                    Terror dos Demônios · Provedor
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() =>
                  setSelectedBook(
                    selectedBook === 'Caminho' || selectedBook === 'Sulco' || selectedBook === 'Forja'
                      ? 'Todos'
                      : 'Caminho'
                  )
                }
                aria-pressed={
                  selectedBook === 'Caminho' || selectedBook === 'Sulco' || selectedBook === 'Forja'
                }
                title="Filtrar Oráculo pelas obras de São Josemaria Escrivá"
                className={`state-card parchment-box p-3 flex flex-col items-center text-center gap-2.5 cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#eab308] ${
                  selectedBook === 'Caminho' || selectedBook === 'Sulco' || selectedBook === 'Forja'
                    ? 'border-[#eab308] ring-1 ring-[#eab308]/40'
                    : 'hover:border-[#eab308]/60'
                }`}
              >
                <div className="depth-layer-3 saint-retable-oval w-20 h-24 sm:w-24 sm:h-28">
                  <div className="saint-retable-oval-inner w-full h-full flex items-center justify-center">
                    {!josemariaImgError ? (
                      <img
                        src={saintJosemariaImg}
                        alt="Retrato clássico de São Josemaria Escrivá à luz de vela"
                        referrerPolicy="no-referrer"
                        onError={() => setJosemariaImgError(true)}
                        className="w-full h-full object-cover object-center scale-[1.18]"
                      />
                    ) : (
                      <CathedralRoseWindowSvg className="w-12 h-12" />
                    )}
                  </div>
                </div>
                <div className="depth-layer-2 space-y-0.5 min-w-0">
                  <div className="font-epic text-xs sm:text-sm text-[#fde047] tracking-wide truncate">
                    São Josemaria Escrivá
                  </div>
                  <div className="text-[11px] text-[#a69982] leading-tight">
                    Caminho · Sulco · Forja
                  </div>
                </div>
              </button>
            </div>

            <div className="flex items-start gap-3.5 pt-1">
              <div className="depth-layer-3 shrink-0 hidden sm:block">
                <CathedralRoseWindowSvg className="w-12 h-12 sacred-glow" />
              </div>
              <div className="depth-layer-2 space-y-2 min-w-0">
                <div className="text-sm font-semibold text-[#dfc168]">
                  {quote.saint} · <span className="text-[#a69982] font-normal">{quote.work}</span>
                </div>
                <blockquote className="text-base sm:text-lg leading-relaxed text-[#f0e5ce] italic">
                  {quote.text}
                </blockquote>
              </div>
            </div>
          </div>

          <div className="depth-layer-2 pt-4 border-t border-[#7d5d28]/35 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => onPrevQuote(filteredQuotes.length)}
              className="rpg-btn-iron px-3.5 py-2 rounded text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer min-h-[40px]"
            >
              <ChevronLeft className="w-4 h-4" aria-hidden="true" />
              <span>Anterior</span>
            </button>

            <button
              type="button"
              onClick={() => onNextQuote(filteredQuotes.length)}
              className="rpg-btn-gold px-4 py-2 rounded text-xs sm:text-sm font-epic flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer min-h-[40px]"
            >
              <BookOpen className="w-4 h-4" aria-hidden="true" />
              <span>Próximo Ponto (+50 XP)</span>
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </article>

        <article
          className={`rpg-panel state-card p-6 flex flex-col justify-between gap-5 ${
            isShieldActive ? 'border-[#c59b27]' : ''
          }`}
        >
          <div className="space-y-3">
            <div className="depth-layer-1 flex items-center justify-between gap-2">
              <span className="text-xs font-epic text-[#c59b27]">
                Cerco Contra Gastos por Impulso
              </span>
              <span
                className={`text-xs font-mono-num font-semibold ${
                  isShieldActive ? 'text-amber-300' : 'text-[#a69982]'
                }`}
              >
                {isShieldActive ? 'Tocha em Vigília' : 'Guarnição Pronta'}
              </span>
            </div>

            <h2 className="depth-layer-2 font-epic text-xl text-[#f3ead6]">Escudo de 60 Segundos</h2>
            <p className="depth-layer-1 text-sm sm:text-base text-[#d5c7b0] leading-relaxed">
              Antes de ceder a qualquer compra fora do plano, erga o escudo na muralha e reze a jaculatória até o cerco cessar.
            </p>

            <div className="depth-layer-2 parchment-box p-4 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="depth-layer-3 shrink-0">
                    <WatchTorchHourglassSvg
                      secondsLeft={shieldSecondsLeft}
                      active={isShieldActive}
                    />
                  </div>
                  <div className="depth-layer-3">
                    <div className="text-xs text-[#a69982]">Tempo de Guarda</div>
                    <div className="font-mono-num text-3xl font-bold text-[#dfc168]">
                      {isShieldActive ? `${shieldSecondsLeft}s` : '60s'}
                    </div>
                  </div>
                </div>
                <p className="text-xs sm:text-sm italic text-[#e4d7be] text-right max-w-[220px] leading-snug">
                  “{activeJaculatoria}”
                </p>
              </div>
              <div
                className="w-full h-2.5 bg-[#111214] rounded-sm overflow-hidden border border-[#3a3f45]"
                role="progressbar"
                aria-valuenow={shieldProgress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Progresso da vigília de 60 segundos"
              >
                <div
                  className="h-full bg-gradient-to-r from-[#b45309] via-[#c59b27] to-[#10b981] transition-all duration-300"
                  style={{ width: `${shieldProgress}%` }}
                />
              </div>
            </div>
          </div>

          <div className="depth-layer-2 flex flex-wrap items-center gap-3 pt-1">
            {!isShieldActive ? (
              <button
                type="button"
                onClick={onStartShield}
                className="rpg-btn-gold flex-1 px-4 py-2.5 rounded text-sm font-epic flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer min-h-[44px]"
              >
                <Shield className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Erguer Escudo (60s)</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onCancelShield}
                className="rpg-btn-iron flex-1 px-4 py-2.5 rounded text-sm font-semibold flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer min-h-[44px]"
              >
                <TimerReset className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Recolher Guarda</span>
              </button>
            )}

            <button
              type="button"
              onClick={onOpenArena}
              className="rpg-btn-crimson flex-1 px-4 py-2.5 rounded text-sm font-epic flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer min-h-[44px]"
            >
              <Swords className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Enfrentar Chefe</span>
            </button>
          </div>
        </article>
      </div>

      <TacticalCouncilCard
        state={state}
        shieldSecondsLeft={shieldSecondsLeft}
        onNavigateTab={onNavigateTab}
        onStartShield={onStartShield}
        onOpenArena={onOpenArena}
        onNextOracleQuote={() => onNextQuote(filteredQuotes.length)}
      />

      <div id="calendario-tatico" className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <TacticalOperationalCalendar
          missionEntries={missionEntries}
          marriageCouples={marriageCouples}
          onOpenPastoral={() => onOpenProviderFocus('pastoral')}
          onOpenMesc={() => onOpenProviderFocus('mesc')}
          onOpenQuartel={() => onOpenProviderFocus('quartel')}
        />
        <PaternalPregnancyMonitor />
      </div>

      <MescCommandWidget
        shifts={missionEntries.filter((e) => e.module === 'mesc_shift')}
        onAddMescShift={onAddMescShift}
        onToggleMescShift={onToggleMescShift}
        onOpenMescPanel={() => onOpenProviderFocus('mesc')}
      />

      <TacticalExpenseChat
        state={state}
        enemyFrontBanner={enemyFrontBanner}
        onDismissEnemyFront={onDismissEnemyFront}
        onRecordExpense={onRecordTacticalExpense}
        onDeleteExpense={onDeleteTacticalExpense}
      />

      <FleetLifespanCard state={state} onNavigateTab={onNavigateTab} />

      <XpHistoryChart xpHistory={state.xpHistory} totalXp={state.xp} />

      <section className="rpg-panel p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-white/10">
          <div>
            <h2 className="font-epic text-base sm:text-lg text-[#f3ead6]">
              Panorama da Campanha
            </h2>
            <p className="text-sm text-[#9e9380]">
              Relatório imediato das frentes financeira, familiar e das relíquias forjadas.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          <button
            type="button"
            onClick={() => onNavigateTab('rota')}
            className="parchment-box state-card p-4 text-left hover:border-[#c59b27]/70 cursor-pointer group"
          >
            <div className="depth-layer-1 flex items-center justify-between gap-2 text-xs text-[#c59b27] font-semibold">
              <span>Foco Financeiro Prioritário</span>
              <ChevronRight className="w-3.5 h-3.5 opacity-60 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
            </div>
            <div className="flex items-center gap-3 mt-1.5">
              <div className="depth-layer-3 shrink-0">
                <VaultChestSvg vaultId={priorityVaultId} className="w-9 h-9" />
              </div>
              <div className="depth-layer-2 min-w-0">
                <div className="text-base font-bold text-[#f3ead6] truncate">{priorityTitle}</div>
                <div className="text-sm font-mono-num text-[#9e9380]">
                  {priorityRemaining === 0
                    ? 'Meta atingida · Avance no Tesouro'
                    : `Falta ${formatBRL(priorityRemaining)}`}
                </div>
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('provedor')}
            className="parchment-box state-card p-4 text-left hover:border-[#c59b27]/70 cursor-pointer group"
          >
            <div className="depth-layer-1 flex items-center justify-between gap-2 text-xs text-[#c59b27] font-semibold">
              <span>Oficina de São José</span>
              <ChevronRight className="w-3.5 h-3.5 opacity-60 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
            </div>
            <div className="depth-layer-3 text-base font-bold text-[#f3ead6] mt-1">
              {dutiesDone} de {PROVIDER_TASKS.length} deveres cumpridos
            </div>
            <div className="depth-layer-2 text-sm font-mono-num text-[#9e9380] mt-1">
              {state.rosaryCompleted} terços · {state.rosaryDecades}/5 dezenas hoje
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('cronicas')}
            className="parchment-box state-card p-4 text-left hover:border-[#c59b27]/70 cursor-pointer group"
          >
            <div className="depth-layer-1 flex items-center justify-between gap-2 text-xs text-[#c59b27] font-semibold">
              <span>Sala de Troféus e Relíquias</span>
              <ChevronRight className="w-3.5 h-3.5 opacity-60 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
            </div>
            <div className="depth-layer-3 text-base font-bold text-[#f3ead6] mt-1">
              {unlockedRelicsCount} de {RELICS.length} relíquias forjadas
            </div>
            <div className="depth-layer-2 text-sm font-mono-num text-[#9e9380] mt-1">
              Inspecionar Mapa Militar e Relíquias
            </div>
          </button>
        </div>

        <div className="pt-5 mt-5 border-t border-white/10 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-[11px] font-epic text-[#c59b27]">
                Frentes Ativas · Direito, Quartel, Corpo, MESC &amp; Pastoral
              </span>
              <h3 className="font-epic text-sm sm:text-base text-[#f3ead6]">
                Acesso Direto às Missões do Comandante
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onOpenProviderFocus('all')}
              className="rpg-btn-iron px-3 py-1.5 rounded text-xs font-semibold cursor-pointer"
            >
              Ver Painel Completo
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => onOpenProviderFocus('espiritual')}
              className={`parchment-box state-card p-3.5 text-left hover:border-[#eab308] cursor-pointer group space-y-1.5 sm:col-span-2 lg:col-span-3 ${
                soulWatch.alertLevel === 'afastamento' || soulWatch.alertLevel === 'critico'
                  ? 'border-red-500/70 bg-red-950/20'
                  : 'border-[#eab308]/55'
              }`}
            >
              <div className="depth-layer-1 flex items-center justify-between gap-2 text-xs text-[#fde047] font-semibold">
                <span className="flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Pilar Central · Força Espiritual &amp; Conexão com Deus</span>
                </span>
                <span className="inline-flex items-center gap-1.5 font-mono-num text-[#dfc168]">
                  {spiritualMult.isPmDutyActive && (
                    <span className="text-[11px] font-epic text-amber-200 border border-[#eab308]/50 bg-[#eab308]/15 px-1.5 py-0.5 rounded">
                      Plantão PMSE 2x
                    </span>
                  )}
                  <span>{soulWatch.strengthPct}%</span>
                  <ChevronRight className="w-3.5 h-3.5 opacity-75 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="depth-layer-3 text-sm font-bold font-mono-num text-[#f3ead6]">
                  {soulWatch.rank.title} · {(state.spiritual?.spiritualXp || 0).toLocaleString('pt-BR')} XP Espiritual · {spiritualMult.multiplier.toFixed(1)}x ({spiritualMult.completedCoreCount}/4 metas hoje)
                </div>
                <div className="depth-layer-2 text-xs text-[#d5c7b0]">
                  {soulWatch.title} · Novena de São José: {state.spiritual?.novenaStreak || 0}d
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => onOpenProviderFocus('mente')}
              className="parchment-box state-card p-3.5 text-left hover:border-[#c59b27]/70 cursor-pointer group space-y-1"
            >
              <div className="depth-layer-1 flex items-center justify-between gap-2 text-xs text-[#c59b27] font-semibold">
                <span className="flex items-center gap-1.5">
                  <Brain className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Mente &amp; Conexões</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5 opacity-60 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
              </div>
              <div className="depth-layer-3 text-sm font-bold font-mono-num text-[#f3ead6]">
                {readingLogsCount} {readingLogsCount === 1 ? 'leitura' : 'leituras'} · {brainXp} XP
              </div>
              <div className="depth-layer-2 text-xs text-[#9e9380]">
                Sinapses · Espiritual, TCC &amp; Direito
              </div>
            </button>

            <button
              type="button"
              onClick={() => onOpenProviderFocus('juridico')}
              className="parchment-box state-card p-3.5 text-left hover:border-[#c59b27]/70 cursor-pointer group space-y-1"
            >
              <div className="depth-layer-1 flex items-center justify-between gap-2 text-xs text-[#c59b27] font-semibold">
                <span className="flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Arsenal Jurídico (AGES)</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5 opacity-60 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
              </div>
              <div className="depth-layer-3 text-sm font-bold font-mono-num text-[#f3ead6]">
                TCC {tccStagesDone}/{TCC_STAGES.length} · {pendingExams}{' '}
                {pendingExams === 1 ? 'prova' : 'provas'}
              </div>
              <div className="depth-layer-2 text-xs font-mono-num text-[#9e9380]">
                {(vocational?.academicXp || 0).toLocaleString('pt-BR')} XP acadêmico
              </div>
            </button>

            <button
              type="button"
              onClick={() => onOpenProviderFocus('quartel')}
              className="parchment-box state-card p-3.5 text-left hover:border-[#c59b27]/70 cursor-pointer group space-y-1"
            >
              <div className="depth-layer-1 flex items-center justify-between gap-2 text-xs text-[#c59b27] font-semibold">
                <span className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Quartel · 2ª Cia / 11º BPM</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5 opacity-60 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
              </div>
              <div className="depth-layer-3 text-sm font-bold font-mono-num text-[#f3ead6]">
                {pendingPmShifts} {pendingPmShifts === 1 ? 'plantão' : 'plantões'} · {totalStudyHours}h estudo
              </div>
              <div className="depth-layer-2 text-xs text-[#9e9380]">
                Poço Verde · CFO, PRF e PF
              </div>
            </button>

            <button
              type="button"
              onClick={() => onOpenProviderFocus('corporal')}
              className="parchment-box state-card p-3.5 text-left hover:border-[#c59b27]/70 cursor-pointer group space-y-1"
            >
              <div className="depth-layer-1 flex items-center justify-between gap-2 text-xs text-[#c59b27] font-semibold">
                <span className="flex items-center gap-1.5">
                  <Dumbbell className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Fortaleza Corporal</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5 opacity-60 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
              </div>
              <div className="depth-layer-3 text-sm font-bold font-mono-num text-[#f3ead6]">
                {bodyXp} XP · Creatina {creatineDays}d · {medicalExamsCount}{' '}
                {medicalExamsCount === 1 ? 'exame' : 'exames'}
              </div>
              <div className="depth-layer-2 text-xs font-mono-num text-[#9e9380]">
                Barra {vocational?.pullupBest || 0}/{vocational?.pullupTarget || 15} ·{' '}
                {vocational?.workoutsTotal || 0} treinos
              </div>
            </button>

            <button
              type="button"
              onClick={() => onOpenProviderFocus('mesc')}
              className="parchment-box state-card p-3.5 text-left hover:border-[#c59b27]/70 cursor-pointer group space-y-1"
            >
              <div className="depth-layer-1 flex items-center justify-between gap-2 text-xs text-[#c59b27] font-semibold">
                <span className="flex items-center gap-1.5">
                  <Cross className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Escalas MESC</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5 opacity-60 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
              </div>
              <div className="depth-layer-3 text-sm font-bold font-mono-num text-[#f3ead6]">
                {pendingMesc} {pendingMesc === 1 ? 'escala ativa' : 'escalas ativas'}
              </div>
              <div className="depth-layer-2 text-xs font-mono-num text-[#9e9380]">
                {doneMesc} {doneMesc === 1 ? 'serviço prestado' : 'serviços prestados'}
              </div>
            </button>

            <button
              type="button"
              onClick={() => onOpenProviderFocus('pastoral')}
              className="parchment-box state-card p-3.5 text-left hover:border-[#c59b27]/70 cursor-pointer group space-y-1"
            >
              <div className="depth-layer-1 flex items-center justify-between gap-2 text-xs text-[#c59b27] font-semibold">
                <span className="flex items-center gap-1.5">
                  <HeartHandshake className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Pastoral Matrimônio</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5 opacity-60 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
              </div>
              <div className="depth-layer-3 text-sm font-bold font-mono-num text-[#f3ead6]">
                {activeCouplesCount} {activeCouplesCount === 1 ? 'casal ativo' : 'casais ativos'}
              </div>
              <div
                className={`depth-layer-2 text-xs font-mono-num ${
                  coupleConflictsCount > 0 ? 'text-amber-300 font-semibold' : 'text-[#9e9380]'
                }`}
              >
                {coupleConflictsCount > 0
                  ? `${coupleConflictsCount} choque(s) com PMSE/MESC`
                  : `${marriageCouples.length} no acompanhamento`}
              </div>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
