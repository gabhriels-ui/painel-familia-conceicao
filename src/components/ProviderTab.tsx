import { useState } from 'react';
import {
  Brain,
  Check,
  Cross,
  Dumbbell,
  Feather,
  Flame,
  HeartHandshake,
  Layers,
  RotateCcw,
  Scale,
  ScrollText,
  Shield,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { PROVIDER_TASKS, ROSARY_MYSTERIES } from '../data/chroniclesData';
import type {
  AppState,
  MarriageCoupleStatus,
  MedicalExamStatus,
  MedicalExamType,
  MissionEntryModule,
  ProviderFocusSection,
  ReadingCategory,
  SpiritualActType,
} from '../types/chronicles';
import { getSuggestedMysteryIndex } from '../utils/formatters';
import { ArsenalJuridicoCard } from './ArsenalJuridicoCard';
import { EspiritualModuleCard } from './EspiritualModuleCard';
import { FortalezaCorporalCard } from './FortalezaCorporalCard';
import { MenteConexoesCard } from './MenteConexoesCard';
import { MescScheduleCard } from './MescScheduleCard';
import { PastoralCouplesCard } from './PastoralCouplesCard';
import { QuartelMissionsCard } from './QuartelMissionsCard';

interface ProviderTabProps {
  state: AppState;
  focusSection: ProviderFocusSection;
  onChangeFocusSection: (section: ProviderFocusSection) => void;
  onToggleDuty: (index: number) => void;
  onResetMonthlyDuties: () => void;
  onPrayDecade: () => void;
  onSaveLetter: (title: string, body: string) => void;
  onDeleteLetter: (id: string) => void;
  onSaveTccTheme: (theme: string) => void;
  onToggleTccStage: (stageKey: string) => void;
  onToggleEquipment: (eqKey: string) => void;
  onResetEquipment: () => void;
  onAddStudyHour: (track: 'cfo' | 'prf' | 'pf', label: string) => void;
  onLogWorkout: (data: {
    pullups: number;
    pushups: number;
    dips: number;
    dateStr: string;
  }) => void;
  onUpdatePullupTarget: (delta: number) => void;
  onTakeCreatineDose: () => void;
  onRefillCreatine: (grams: number) => void;
  onChangeCreatineDose: (doseGrams: number) => void;
  onToggleHealthCheck: (key: string) => void;
  onAddMissionEntry: (
    module: MissionEntryModule,
    data: { title: string; detail: string; dateStr: string; timeStr: string },
    xpDelta?: number
  ) => void;
  onToggleMissionEntry: (entryId: string, xpReward: number) => void;
  onDeleteMissionEntry: (entryId: string) => void;
  onAddMarriageCouple: (data: {
    coupleNames: string;
    scheduledDate: string;
    scheduledTime: string;
    topic: string;
    notes: string;
    status: MarriageCoupleStatus;
  }) => void;
  onUpdateMarriageCouple: (
    coupleId: string,
    updates: {
      coupleNames: string;
      scheduledDate: string;
      scheduledTime: string;
      topic: string;
      notes: string;
      status: MarriageCoupleStatus;
    }
  ) => void;
  onDeleteMarriageCouple: (coupleId: string) => void;
  onAddReadingLog: (data: {
    category: ReadingCategory;
    title: string;
    authorOrSource: string;
    pagesOrMinutes: number;
    notes: string;
    dateStr: string;
    completed: boolean;
  }) => void;
  onToggleReadingComplete: (logId: string) => void;
  onDeleteReadingLog: (logId: string) => void;
  onAddMedicalExam: (data: {
    examType: MedicalExamType;
    examLabel: string;
    examDate: string;
    resultSummary: string;
    metricsDetail: string;
    status: MedicalExamStatus;
    notes: string;
  }) => void;
  onCycleExamStatus: (examId: string) => void;
  onDeleteMedicalExam: (examId: string) => void;
  onLogSpiritualAct: (data: {
    actType: SpiritualActType;
    dateStr: string;
    notes: string;
  }) => void;
  onDeleteSpiritualLog: (logId: string) => void;
  onTogglePmDutyMode: () => void;
  onOpenCalendar?: () => void;
}

const SECTION_FILTERS: {
  id: ProviderFocusSection;
  label: string;
  icon: typeof Layers;
}[] = [
  { id: 'all', label: 'Todos', icon: Layers },
  { id: 'espiritual', label: 'Força Espiritual', icon: Flame },
  { id: 'oficio', label: 'Oficina & Terço', icon: Sparkles },
  { id: 'mente', label: 'Mente & Conexões', icon: Brain },
  { id: 'juridico', label: 'Arsenal Jurídico', icon: Scale },
  { id: 'quartel', label: 'Quartel PMSE', icon: Shield },
  { id: 'corporal', label: 'Fortaleza Corporal', icon: Dumbbell },
  { id: 'mesc', label: 'Escalas MESC', icon: Cross },
  { id: 'pastoral', label: 'Pastoral Casais', icon: HeartHandshake },
];

export function ProviderTab({
  state,
  focusSection,
  onChangeFocusSection,
  onToggleDuty,
  onResetMonthlyDuties,
  onPrayDecade,
  onSaveLetter,
  onDeleteLetter,
  onSaveTccTheme,
  onToggleTccStage,
  onToggleEquipment,
  onResetEquipment,
  onAddStudyHour,
  onLogWorkout,
  onUpdatePullupTarget,
  onTakeCreatineDose,
  onRefillCreatine,
  onChangeCreatineDose,
  onToggleHealthCheck,
  onAddMissionEntry,
  onToggleMissionEntry,
  onDeleteMissionEntry,
  onAddMarriageCouple,
  onUpdateMarriageCouple,
  onDeleteMarriageCouple,
  onAddReadingLog,
  onToggleReadingComplete,
  onDeleteReadingLog,
  onAddMedicalExam,
  onCycleExamStatus,
  onDeleteMedicalExam,
  onLogSpiritualAct,
  onDeleteSpiritualLog,
  onTogglePmDutyMode,
  onOpenCalendar,
}: ProviderTabProps) {
  const [letterTitle, setLetterTitle] = useState('');
  const [letterBody, setLetterBody] = useState('');
  const [justSealedStamp, setJustSealedStamp] = useState(false);

  const dutiesDone = PROVIDER_TASKS.filter((_, idx) => !!state.providerDuties[idx]).length;
  const mystery = ROSARY_MYSTERIES[getSuggestedMysteryIndex()];
  const decades = state.rosaryDecades || 0;
  const completedRosaries = state.rosaryCompleted || 0;

  const entries = state.missionEntries || [];
  const exams = entries.filter((e) => e.module === 'exam');
  const pmShifts = entries.filter((e) => e.module === 'pm_shift');
  const workouts = entries.filter((e) => e.module === 'workout');
  const mescShifts = entries.filter((e) => e.module === 'mesc_shift');

  const showEspiritual = focusSection === 'all' || focusSection === 'espiritual';
  const showOficio = focusSection === 'all' || focusSection === 'oficio';
  const showMente = focusSection === 'all' || focusSection === 'mente';
  const showJuridico = focusSection === 'all' || focusSection === 'juridico';
  const showQuartel = focusSection === 'all' || focusSection === 'quartel';
  const showCorporal = focusSection === 'all' || focusSection === 'corporal';
  const showMesc = focusSection === 'all' || focusSection === 'mesc';
  const showPastoral = focusSection === 'all' || focusSection === 'pastoral';

  const handleLetterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!letterTitle.trim() || !letterBody.trim()) return;
    onSaveLetter(letterTitle.trim(), letterBody.trim());
    setLetterTitle('');
    setLetterBody('');
    setJustSealedStamp(true);
    window.setTimeout(() => setJustSealedStamp(false), 1200);
  };

  return (
    <div className="space-y-6">
      {/* Navegação segmentada das frentes do Provedor */}
      <div className="rpg-panel p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <span className="text-[11px] font-epic text-[#c59b27]">
            Frentes de Missão & Serviço
          </span>
          <h2 className="font-epic text-base sm:text-lg text-[#f3ead6]">
            Painel Integral do Provedor
          </h2>
        </div>

        <div
          className="inline-flex flex-wrap gap-1.5 p-1.5 rounded-lg bg-[#101215] border border-white/10"
          role="tablist"
          aria-label="Filtrar frentes do Provedor"
        >
          {SECTION_FILTERS.map((item) => {
            const Icon = item.icon;
            const active = focusSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onChangeFocusSection(item.id)}
                className={`px-3 py-2 rounded-md text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all min-h-[38px] whitespace-nowrap shrink-0 ${
                  active
                    ? 'bg-[#c59b27] text-[#101215] shadow-sm'
                    : 'text-[#9e9380] hover:text-[#f3ead6] hover:bg-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {showEspiritual && (
        <EspiritualModuleCard
          spiritual={state.spiritual}
          spiritualLogs={state.spiritualLogs || []}
          pmShiftDates={pmShifts.map((s) => s.dateStr)}
          onLogSpiritualAct={onLogSpiritualAct}
          onDeleteSpiritualLog={onDeleteSpiritualLog}
          onTogglePmDutyMode={onTogglePmDutyMode}
        />
      )}

      {showOficio && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <section className="rpg-panel state-card p-5 sm:p-6 space-y-4" data-tilt-subtle="true">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#3a3f45] pb-4">
              <div>
                <span className="depth-layer-1 text-xs font-epic text-[#c59b27]">
                  1 Timóteo 5:8 · Oficina de Nazaré
                </span>
                <h2 className="depth-layer-2 font-epic text-xl text-[#f3ead6]">
                  Deveres de São José
                </h2>
              </div>

              <div className="depth-layer-3 flex items-center gap-3">
                <span className="font-mono-num text-sm font-bold text-[#dfc168]">
                  {dutiesDone} / {PROVIDER_TASKS.length}
                </span>
                {dutiesDone > 0 && (
                  <button
                    type="button"
                    onClick={onResetMonthlyDuties}
                    title="Iniciar novo ciclo mensal de deveres"
                    className="rpg-btn-iron px-2.5 py-1.5 rounded text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Novo Mês</span>
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-2.5">
              {PROVIDER_TASKS.map((task, idx) => {
                const isDone = !!state.providerDuties[idx];
                return (
                  <button
                    key={task.title}
                    type="button"
                    onClick={() => onToggleDuty(idx)}
                    aria-pressed={isDone}
                    className={`w-full parchment-box state-card p-3.5 flex items-center justify-between gap-3 text-left transition-colors cursor-pointer min-h-[56px] ${
                      isDone
                        ? 'border-emerald-600/60 bg-emerald-950/20'
                        : 'hover:border-[#eab308]'
                    }`}
                  >
                    <div className="min-w-0">
                      <div
                        className={`depth-layer-2 text-sm sm:text-base font-semibold ${
                          isDone ? 'text-emerald-300' : 'text-[#efe3c8]'
                        }`}
                      >
                        {task.title}
                      </div>
                      <div className="depth-layer-1 text-xs text-[#a89982]">{task.detail}</div>
                    </div>

                    <span
                      className={`depth-layer-3 w-8 h-8 rounded flex items-center justify-center shrink-0 border transition-colors ${
                        isDone
                          ? 'bg-emerald-700 border-emerald-400 text-white'
                          : 'bg-[#111214] border-[#525861] text-[#6f7279]'
                      }`}
                    >
                      <Check className="w-4 h-4" aria-hidden="true" />
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="space-y-6">
            <div className="cathedral-glass state-card p-5 sm:p-6 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="depth-layer-1 text-xs font-epic text-[#c59b27]">
                    Oração Diária da Guarnição
                  </span>
                  <h2 className="depth-layer-2 font-epic text-xl text-[#f3ead6]">
                    Santo Terço pela Família
                  </h2>
                </div>
                <span className="depth-layer-3 font-mono-num text-sm font-semibold text-[#dfc168]">
                  {completedRosaries}{' '}
                  {completedRosaries === 1 ? 'Terço completo' : 'Terços completos'}
                </span>
              </div>

              <div className="parchment-box p-3.5 space-y-1">
                <div className="text-xs text-[#c59b27] font-semibold">
                  Sugestão de Hoje ({mystery.days}) · {mystery.name}
                </div>
                <div className="text-sm text-[#e4d7be]">{mystery.focus}</div>
              </div>

              <div className="grid grid-cols-5 gap-2" aria-label="Dezenas do terço">
                {[1, 2, 3, 4, 5].map((num) => {
                  const active = decades >= num;
                  const isNext = decades + 1 === num;
                  return (
                    <button
                      key={num}
                      type="button"
                      disabled={!isNext}
                      onClick={() => {
                        if (isNext) onPrayDecade();
                      }}
                      title={
                        isNext
                          ? `Meditar ${num}ª dezena agora`
                          : active
                          ? `${num}ª dezena meditada`
                          : `Aguardando ${num}ª dezena`
                      }
                      className={`py-2.5 rounded-lg text-center font-mono-num text-sm font-bold border transition-all min-h-[44px] ${
                        active
                          ? 'bg-[#c59b27] text-[#101215] border-[#ead38c] shadow-sm'
                          : isNext
                          ? 'bg-[#181b20] text-[#e4c770] border-[#c59b27]/70 hover:bg-[#c59b27]/15 cursor-pointer active:scale-95'
                          : 'bg-[#101215] text-[#6d7179] border-white/10 cursor-default'
                      }`}
                    >
                      {active ? `✠ ${num}ª` : `${num}ª`}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={onPrayDecade}
                className="rpg-btn-gold w-full py-3 rounded text-sm font-epic flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
              >
                <Sparkles className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>
                  {decades === 4
                    ? 'Concluir 5ª Dezena e Ofertar Terço (+240 XP)'
                    : `Meditar ${decades + 1}ª Dezena (+40 XP)`}
                </span>
              </button>
            </div>

            <div className="rpg-panel state-card p-5 sm:p-6 space-y-4" data-tilt-subtle="true">
              <div className="border-b border-[#3a3f45] pb-3">
                <span className="depth-layer-1 text-xs font-epic text-[#c59b27]">
                  Cápsula do Tempo · Parto 30/06/2027
                </span>
                <h2 className="depth-layer-2 font-epic text-xl text-[#f3ead6]">
                  Pergaminhos ao Herdeiro(a)
                </h2>
              </div>

              <form onSubmit={handleLetterSubmit} className="space-y-3">
                <div>
                  <label htmlFor="letter-title" className="sr-only">
                    Título do pergaminho
                  </label>
                  <input
                    id="letter-title"
                    type="text"
                    value={letterTitle}
                    onChange={(e) => setLetterTitle(e.target.value)}
                    placeholder="Título da carta (ex: Para quando você nascer)"
                    className="w-full bg-[#111214] border border-[#3a3f45] focus:border-[#c59b27] focus:outline-none rounded px-3.5 py-2.5 text-sm text-white placeholder:text-[#6f7279] min-h-[42px]"
                  />
                </div>

                <div>
                  <label htmlFor="letter-body" className="sr-only">
                    Mensagem para o herdeiro
                  </label>
                  <textarea
                    id="letter-body"
                    rows={3}
                    value={letterBody}
                    onChange={(e) => setLetterBody(e.target.value)}
                    placeholder="Escreva suas palavras de pai, conselhos de fé e memórias desta campanha..."
                    className="w-full bg-[#111214] border border-[#3a3f45] focus:border-[#c59b27] focus:outline-none rounded px-3.5 py-2.5 text-sm text-white placeholder:text-[#6f7279] resize-y"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!letterTitle.trim() || !letterBody.trim()}
                  className="rpg-btn-gold w-full py-2.5 rounded text-sm font-epic flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
                >
                  <Feather className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>Lacrar com Selo Real (+150 XP)</span>
                </button>
              </form>

              <div className="space-y-2.5 pt-2">
                {(state.letters || []).length === 0 ? (
                  <div className="parchment-box p-4 text-center text-sm text-[#a69982]">
                    Nenhum pergaminho lacrado ainda. Escreva a primeira carta para o dia 30/06/2027.
                  </div>
                ) : (
                  state.letters.map((letter, idx) => (
                    <article key={letter.id} className="parchment-box state-card p-4 space-y-2 relative overflow-hidden">
                      <div className="depth-layer-2 flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <ScrollText
                            className="w-4 h-4 text-[#eab308] shrink-0"
                            aria-hidden="true"
                          />
                          <h3 className="font-epic font-semibold text-[#fde047] truncate">
                            {letter.title}
                          </h3>
                        </div>
                        <button
                          type="button"
                          onClick={() => onDeleteLetter(letter.id)}
                          aria-label={`Excluir carta ${letter.title}`}
                          className="text-[#848890] hover:text-red-400 p-1 rounded cursor-pointer shrink-0"
                        >
                          <Trash2 className="w-4 h-4" aria-hidden="true" />
                        </button>
                      </div>
                      <p className="depth-layer-1 text-sm text-[#e4d7be] italic leading-relaxed whitespace-pre-line pr-10">
                        “{letter.body}”
                      </p>
                      <div className="flex items-center justify-between pt-1">
                        <div className="depth-layer-1 text-xs font-mono-num text-[#a89982]">
                          Lacrado em {letter.date}
                        </div>
                        <span
                          title="Selo de Cera Imperial"
                          className={`depth-layer-3 inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-[#991b1b] via-[#7f1d1d] to-[#3b0606] border border-[#eab308]/75 shadow-md text-[11px] font-epic text-[#fde047] ${
                            idx === 0 && justSealedStamp ? 'wax-seal-stamp' : ''
                          }`}
                        >
                          ✝
                        </span>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </div>
          </section>
        </div>
      )}

      {showMente && (
        <MenteConexoesCard
          brainXp={state.vocational?.brainXp || 0}
          readingLogs={state.readingLogs || []}
          onAddReadingLog={onAddReadingLog}
          onToggleReadingComplete={onToggleReadingComplete}
          onDeleteReadingLog={onDeleteReadingLog}
        />
      )}

      {(showJuridico || showQuartel) && (
        <div
          className={`grid grid-cols-1 ${
            showJuridico && showQuartel ? 'xl:grid-cols-2' : ''
          } gap-6 items-start`}
        >
          {showJuridico && (
            <ArsenalJuridicoCard
              vocational={state.vocational}
              exams={exams}
              onSaveTccTheme={onSaveTccTheme}
              onToggleTccStage={onToggleTccStage}
              onAddExam={(data) => onAddMissionEntry('exam', data)}
              onToggleExam={onToggleMissionEntry}
              onDeleteExam={onDeleteMissionEntry}
            />
          )}

          {showQuartel && (
            <QuartelMissionsCard
              vocational={state.vocational}
              shifts={pmShifts}
              onAddShift={(data) => onAddMissionEntry('pm_shift', data)}
              onToggleShift={onToggleMissionEntry}
              onDeleteShift={onDeleteMissionEntry}
              onToggleEquipment={onToggleEquipment}
              onResetEquipment={onResetEquipment}
              onAddStudyHour={onAddStudyHour}
            />
          )}
        </div>
      )}

      {(showCorporal || showMesc) && (
        <div
          className={`grid grid-cols-1 ${
            showCorporal && showMesc ? 'xl:grid-cols-2' : ''
          } gap-6 items-start`}
        >
          {showCorporal && (
            <FortalezaCorporalCard
              vocational={state.vocational}
              workouts={workouts}
              medicalExams={state.medicalExams || []}
              onLogWorkout={onLogWorkout}
              onDeleteWorkout={onDeleteMissionEntry}
              onUpdatePullupTarget={onUpdatePullupTarget}
              onTakeCreatineDose={onTakeCreatineDose}
              onRefillCreatine={onRefillCreatine}
              onChangeCreatineDose={onChangeCreatineDose}
              onToggleHealthCheck={onToggleHealthCheck}
              onAddMedicalExam={onAddMedicalExam}
              onCycleExamStatus={onCycleExamStatus}
              onDeleteMedicalExam={onDeleteMedicalExam}
            />
          )}

          {showMesc && (
            <MescScheduleCard
              shifts={mescShifts}
              onAddMescShift={(data) => onAddMissionEntry('mesc_shift', data)}
              onToggleMescShift={onToggleMissionEntry}
              onDeleteMescShift={onDeleteMissionEntry}
            />
          )}
        </div>
      )}

      {showPastoral && (
        <PastoralCouplesCard
          couples={state.marriageCouples || []}
          missionEntries={entries}
          onAddCouple={onAddMarriageCouple}
          onUpdateCouple={onUpdateMarriageCouple}
          onDeleteCouple={onDeleteMarriageCouple}
          onOpenCalendar={onOpenCalendar}
        />
      )}
    </div>
  );
}

