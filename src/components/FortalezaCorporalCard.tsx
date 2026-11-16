import { useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Check,
  CheckCircle2,
  ChevronUp,
  Dumbbell,
  Flame,
  Plus,
  Shield,
  Stethoscope,
  Trash2,
} from 'lucide-react';
import {
  BODY_AVATAR_TIERS,
  HEALTH_ROUTINE_ITEMS,
  MEDICAL_EXAM_TEMPLATES,
} from '../data/chroniclesData';
import type {
  MedicalExamEntry,
  MedicalExamStatus,
  MedicalExamType,
  MissionEntry,
  VocationalState,
} from '../types/chronicles';
import { CorporalAvatar3DCanvas } from './CorporalAvatar3DCanvas';
import { VolumetricHeart3DCanvas } from './VolumetricHeart3DCanvas';

interface FortalezaCorporalCardProps {
  vocational: VocationalState;
  workouts: MissionEntry[];
  medicalExams: MedicalExamEntry[];
  onLogWorkout: (data: {
    pullups: number;
    pushups: number;
    dips: number;
    dateStr: string;
  }) => void;
  onDeleteWorkout: (entryId: string) => void;
  onUpdatePullupTarget: (delta: number) => void;
  onTakeCreatineDose: () => void;
  onRefillCreatine: (grams: number) => void;
  onChangeCreatineDose: (doseGrams: number) => void;
  onToggleHealthCheck: (key: string) => void;
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
}

function formatShortDate(dateStr: string): string {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function getStatusMeta(status: MedicalExamStatus): {
  label: string;
  textClass: string;
  borderClass: string;
  stroke: string;
} {
  if (status === 'atencao') {
    return {
      label: 'Atenção Médica',
      textClass: 'text-red-300',
      borderClass: 'border-red-500/55 bg-red-950/20',
      stroke: '#f87171',
    };
  }
  if (status === 'acompanhar') {
    return {
      label: 'Acompanhar',
      textClass: 'text-amber-300',
      borderClass: 'border-amber-500/55 bg-amber-950/20',
      stroke: '#fbbf24',
    };
  }
  return {
    label: 'Ótimo',
    textClass: 'text-emerald-300',
    borderClass: 'border-emerald-500/50 bg-emerald-950/20',
    stroke: '#34d399',
  };
}

function extractRestingBpm(exams: MedicalExamEntry[]): number {
  for (const exam of exams) {
    const joined = `${exam.resultSummary} ${exam.metricsDetail}`;
    const match = joined.match(/(?:FC\s*(?:m[eé]dia)?|bpm)\D{0,8}(\d{2,3})/i) || joined.match(/(\d{2,3})\s*bpm/i);
    if (match) {
      const parsed = Number(match[1]);
      if (parsed >= 40 && parsed <= 160) return parsed;
    }
  }
  return 60;
}

function ClinicalTelemetryPanel({
  medicalExams,
}: {
  medicalExams: MedicalExamEntry[];
}) {
  const latestExam = medicalExams[0] ?? null;
  const hasAttention = medicalExams.some((e) => e.status === 'atencao');
  const hasWatch = medicalExams.some((e) => e.status === 'acompanhar');
  const overallStatus: MedicalExamStatus = hasAttention
    ? 'atencao'
    : hasWatch
    ? 'acompanhar'
    : 'otimo';
  const statusMeta = getStatusMeta(overallStatus);
  const restingBpm = extractRestingBpm(medicalExams);

  return (
    <div className="bg-[#0e1013] border border-[#2d333c] rounded-lg p-3.5 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
      <div className="md:col-span-5">
        <VolumetricHeart3DCanvas status={overallStatus} bpm={restingBpm} />
      </div>

      <div className="md:col-span-7 space-y-3 min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="text-xs font-epic text-[#c59b27]">
              Monitor Cardiovascular 3D &amp; Biomarcadores
            </div>
            <div className={`text-xs font-semibold mt-0.5 ${statusMeta.textClass}`}>
              Status Geral: {medicalExams.length > 0 ? statusMeta.label : 'Aguardando Registro'}
            </div>
          </div>

          <svg
            viewBox="0 0 220 40"
            className="w-36 h-8 shrink-0"
            role="img"
            aria-label="Traçado animado de batimentos cardíacos ECG"
          >
            <path
              d="M0 22 L38 22 L46 16 L52 25 L60 7 L68 33 L74 19 L84 22 L126 22 L134 16 L140 25 L148 7 L156 33 L162 19 L172 22 L220 22"
              fill="none"
              stroke="#272c35"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M0 22 L38 22 L46 16 L52 25 L60 7 L68 33 L74 19 L84 22 L126 22 L134 16 L140 25 L148 7 L156 33 L162 19 L172 22 L220 22"
              fill="none"
              stroke={statusMeta.stroke}
              strokeWidth="2.1"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="ecg-wave-trace"
            />
          </svg>
        </div>

        {/* Grade compacta com os marcadores clínicos reais */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
          <div className="bg-[#13161b] border border-[#2a2f38] rounded p-2">
            <div className="text-[10px] text-[#9e9380]">Holter 24h</div>
            <div className="font-mono-num font-bold text-amber-300 mt-0.5">4.848 ESV</div>
            <div className="font-mono-num text-[10px] text-[#cbbda4]">658 EV · FC 60 bpm</div>
          </div>
          <div className="bg-[#13161b] border border-[#2a2f38] rounded p-2">
            <div className="text-[10px] text-[#9e9380]">Ecocardiograma</div>
            <div className="font-mono-num font-bold text-emerald-300 mt-0.5">FE 74%</div>
            <div className="text-[10px] text-[#cbbda4] truncate">Insuf. aórtica discreta</div>
          </div>
          <div className="bg-[#13161b] border border-[#2a2f38] rounded p-2">
            <div className="text-[10px] text-[#9e9380]">Glicemia &amp; HbA1c</div>
            <div className="font-mono-num font-bold text-emerald-300 mt-0.5">90 mg/dL</div>
            <div className="font-mono-num text-[10px] text-[#cbbda4]">HbA1c 5,5%</div>
          </div>
          <div className="bg-[#13161b] border border-[#2a2f38] rounded p-2">
            <div className="text-[10px] text-[#9e9380]">Perfil Lipídico</div>
            <div className="font-mono-num font-bold text-amber-300 mt-0.5">CT 204 mg/dL</div>
            <div className="font-mono-num text-[10px] text-[#cbbda4]">TG 172 mg/dL</div>
          </div>
          <div className="bg-[#13161b] border border-[#2a2f38] rounded p-2">
            <div className="text-[10px] text-[#9e9380]">Hormonal &amp; Vit. D</div>
            <div className="font-mono-num font-bold text-[#fde047] mt-0.5">Testo 498</div>
            <div className="font-mono-num text-[10px] text-[#cbbda4]">D 33,4 · B12 206</div>
          </div>
          <div className="bg-[#13161b] border border-[#2a2f38] rounded p-2">
            <div className="text-[10px] text-[#9e9380]">Hepático &amp; Renal</div>
            <div className="font-mono-num font-bold text-emerald-300 mt-0.5">Creat 0,9</div>
            <div className="font-mono-num text-[10px] text-[#cbbda4]">TGP 44 U/L</div>
          </div>
        </div>

        <div className="text-[11px] font-mono-num text-[#a89982] truncate">
          {latestExam
            ? `Mais recente: ${latestExam.examLabel} (${formatShortDate(latestExam.examDate)}) — ${latestExam.resultSummary}`
            : 'Adicione um novo exame abaixo para acompanhar a evolução.'}
        </div>
      </div>
    </div>
  );
}

export function FortalezaCorporalCard({
  vocational,
  workouts,
  medicalExams,
  onLogWorkout,
  onDeleteWorkout,
  onUpdatePullupTarget,
  onTakeCreatineDose,
  onRefillCreatine,
  onChangeCreatineDose,
  onToggleHealthCheck,
  onAddMedicalExam,
  onCycleExamStatus,
  onDeleteMedicalExam,
}: FortalezaCorporalCardProps) {
  const todayIso = new Date().toISOString().slice(0, 10);
  const [pullupsInput, setPullupsInput] = useState(String(vocational.pullupBest || 8));
  const [pushupsInput, setPushupsInput] = useState('40');
  const [dipsInput, setDipsInput] = useState('25');

  const [showExamForm, setShowExamForm] = useState(false);
  const [examType, setExamType] = useState<MedicalExamType>('holter');
  const [examLabel, setExamLabel] = useState('Holter 24h');
  const [examDate, setExamDate] = useState(todayIso);
  const [resultSummary, setResultSummary] = useState('');
  const [metricsDetail, setMetricsDetail] = useState('');
  const [examStatus, setExamStatus] = useState<MedicalExamStatus>('otimo');
  const [examNotes, setExamNotes] = useState('');

  const bodyXp = vocational.bodyXp || 0;
  const avatarTierIdx = useMemo(
    () => BODY_AVATAR_TIERS.reduce((acc, t, idx) => (bodyXp >= t.minXp ? idx : acc), 0),
    [bodyXp]
  );
  const currentTier = BODY_AVATAR_TIERS[avatarTierIdx];
  const nextTier = BODY_AVATAR_TIERS[avatarTierIdx + 1] ?? null;
  const tierProgressPct = useMemo(() => {
    if (!nextTier) return 100;
    const span = nextTier.minXp - currentTier.minXp;
    const earned = bodyXp - currentTier.minXp;
    return Math.min(100, Math.max(0, Math.round((earned / Math.max(1, span)) * 100)));
  }, [bodyXp, currentTier, nextTier]);

  const dose = vocational.creatineDailyDoseGrams || 5;
  const stock = Math.max(0, Math.round(vocational.creatineStockGrams || 0));
  const daysRemaining = dose > 0 ? Math.floor(stock / dose) : 0;
  const lowStock = daysRemaining <= 10;
  const takenToday = vocational.creatineLastTakenDate === todayIso;
  const pullupPct = Math.min(
    100,
    Math.round(((vocational.pullupBest || 0) / Math.max(1, vocational.pullupTarget || 15)) * 100)
  );

  const selectedTemplate =
    MEDICAL_EXAM_TEMPLATES.find((t) => t.type === examType) ?? MEDICAL_EXAM_TEMPLATES[0];

  const handleSelectExamType = (nextType: MedicalExamType) => {
    setExamType(nextType);
    const tpl = MEDICAL_EXAM_TEMPLATES.find((t) => t.type === nextType);
    if (tpl) {
      setExamLabel(tpl.type === 'outro' ? '' : tpl.label);
    }
  };

  const handleLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pullups = Math.max(0, Math.min(200, Math.floor(Number(pullupsInput) || 0)));
    const pushups = Math.max(0, Math.min(500, Math.floor(Number(pushupsInput) || 0)));
    const dips = Math.max(0, Math.min(300, Math.floor(Number(dipsInput) || 0)));
    if (pullups === 0 && pushups === 0 && dips === 0) return;

    onLogWorkout({
      pullups,
      pushups,
      dips,
      dateStr: todayIso,
    });
  };

  const handleExamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanSummary = resultSummary.trim();
    if (!cleanSummary) return;
    const cleanLabel = examLabel.trim() || selectedTemplate.label;
    onAddMedicalExam({
      examType,
      examLabel: cleanLabel,
      examDate: examDate || todayIso,
      resultSummary: cleanSummary,
      metricsDetail: metricsDetail.trim(),
      status: examStatus,
      notes: examNotes.trim(),
    });
    setResultSummary('');
    setMetricsDetail('');
    setExamNotes('');
    setShowExamForm(false);
  };

  return (
    <section
      className="rpg-panel state-card p-5 sm:p-6 space-y-5"
      data-tilt-subtle="true"
    >
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#3a3f45] pb-4">
        <div className="flex items-start gap-3">
          <div className="depth-layer-3 w-10 h-10 rounded-lg bg-[#16191f] border border-[#eab308]/50 flex items-center justify-center shrink-0">
            <Dumbbell className="w-5 h-5 text-[#eab308]" aria-hidden="true" />
          </div>
          <div>
            <span className="depth-layer-1 text-xs font-epic text-[#c59b27]">
              Corpo &amp; Vitalidade · Calistenia, Creatina &amp; Exames
            </span>
            <h2 className="depth-layer-2 font-epic text-xl text-[#f3ead6]">
              Fortaleza Corporal
            </h2>
          </div>
        </div>

        <div className="depth-layer-3 text-right">
          <div className="text-[11px] uppercase tracking-wider text-[#9e9380]">
            XP Corporal
          </div>
          <div className="font-mono-num text-lg font-bold text-[#fde047]">
            {bodyXp.toLocaleString('pt-BR')} XP
          </div>
        </div>
      </div>

      {/* Avatar 3D Evolutivo da Fortaleza Corporal */}
      <div className="parchment-box p-4 flex flex-col sm:flex-row items-center gap-4">
        <CorporalAvatar3DCanvas bodyXp={bodyXp} tierIdx={avatarTierIdx} />

        <div className="flex-1 w-full space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="text-[11px] font-epic text-[#c59b27]">
                Armadura &amp; Constituição Física
              </div>
              <div className="font-epic text-base sm:text-lg text-[#fde047] flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-[#eab308] shrink-0" aria-hidden="true" />
                <span>{currentTier.name}</span>
              </div>
            </div>
            <div className="font-mono-num text-xs text-[#a89982]">
              {vocational.workoutsTotal || 0} treinos · {medicalExams.length} exames
            </div>
          </div>

          <p className="text-xs text-[#cbbda4]">{currentTier.desc}</p>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-mono-num">
              <span className="text-[#9e9380]">
                {nextTier ? `Próximo grau: ${nextTier.name}` : 'Armadura Completa'}
              </span>
              <span className="text-[#fde047] font-semibold">
                {nextTier ? `${bodyXp}/${nextTier.minXp} XP` : `${tierProgressPct}%`}
              </span>
            </div>
            <div
              className="w-full h-2.5 bg-[#111214] rounded-sm overflow-hidden border border-[#3a3f45]"
              role="progressbar"
              aria-valuenow={tierProgressPct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Evolução da armadura corporal"
            >
              <div
                className="h-full bg-gradient-to-r from-[#b45309] via-[#eab308] to-[#34d399] transition-all duration-500"
                style={{ width: `${tierProgressPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Meta de Barra Fixa + Registro de Treino Calistênico */}
      <div className="parchment-box p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="text-xs font-epic text-[#c59b27]">
              Desafio da Barra Fixa (TAF &amp; Força)
            </div>
            <div className="font-mono-num text-base font-bold text-[#f3ead6]">
              Recorde: {vocational.pullupBest} reps{' '}
              <span className="text-xs font-normal text-[#9e9380]">
                / Meta {vocational.pullupTarget} reps
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onUpdatePullupTarget(-1)}
              aria-label="Reduzir meta de barra fixa"
              className="rpg-btn-iron px-2.5 py-1 rounded text-xs font-mono-num font-bold cursor-pointer min-h-[34px]"
            >
              -1
            </button>
            <button
              type="button"
              onClick={() => onUpdatePullupTarget(1)}
              aria-label="Aumentar meta de barra fixa"
              className="rpg-btn-iron px-2.5 py-1 rounded text-xs font-mono-num font-bold cursor-pointer min-h-[34px]"
            >
              +1
            </button>
          </div>
        </div>

        <div
          className="w-full h-2.5 bg-[#111214] rounded-sm overflow-hidden border border-[#3a3f45]"
          role="progressbar"
          aria-valuenow={pullupPct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Progresso na barra fixa"
        >
          <div
            className="h-full bg-gradient-to-r from-[#b45309] via-[#eab308] to-[#10b981] transition-all duration-300"
            style={{ width: `${pullupPct}%` }}
          />
        </div>

        <form onSubmit={handleLogSubmit} className="grid grid-cols-3 sm:grid-cols-12 gap-2 pt-1">
          <div className="sm:col-span-3">
            <label htmlFor="cal-pullups" className="block text-[11px] text-[#9e9380] mb-1">
              Barra Fixa
            </label>
            <input
              id="cal-pullups"
              type="number"
              min={0}
              max={200}
              value={pullupsInput}
              onChange={(e) => setPullupsInput(e.target.value)}
              className="w-full bg-[#111214] border border-[#3a3f45] focus:border-[#c59b27] focus:outline-none rounded px-2.5 py-2 text-sm font-mono-num text-white min-h-[40px]"
            />
          </div>
          <div className="sm:col-span-3">
            <label htmlFor="cal-pushups" className="block text-[11px] text-[#9e9380] mb-1">
              Flexões
            </label>
            <input
              id="cal-pushups"
              type="number"
              min={0}
              max={500}
              value={pushupsInput}
              onChange={(e) => setPushupsInput(e.target.value)}
              className="w-full bg-[#111214] border border-[#3a3f45] focus:border-[#c59b27] focus:outline-none rounded px-2.5 py-2 text-sm font-mono-num text-white min-h-[40px]"
            />
          </div>
          <div className="sm:col-span-3">
            <label htmlFor="cal-dips" className="block text-[11px] text-[#9e9380] mb-1">
              Paralelas
            </label>
            <input
              id="cal-dips"
              type="number"
              min={0}
              max={300}
              value={dipsInput}
              onChange={(e) => setDipsInput(e.target.value)}
              className="w-full bg-[#111214] border border-[#3a3f45] focus:border-[#c59b27] focus:outline-none rounded px-2.5 py-2 text-sm font-mono-num text-white min-h-[40px]"
            />
          </div>
          <div className="col-span-3 sm:col-span-3 flex items-end">
            <button
              type="submit"
              className="rpg-btn-gold w-full py-2 px-3 rounded text-xs font-epic flex items-center justify-center gap-1 cursor-pointer min-h-[40px]"
            >
              <Flame className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Registrar (+75 XP)</span>
            </button>
          </div>
        </form>

        {workouts.length > 0 && (
          <div className="space-y-1.5 pt-2 border-t border-[#3a3f45]/70">
            <div className="text-[11px] uppercase tracking-wider text-[#9e9380]">
              Últimos Treinos
            </div>
            {workouts.slice(0, 4).map((w) => (
              <div
                key={w.id}
                className="flex items-center justify-between gap-2 bg-[#111214] border border-[#2b2f36] rounded px-3 py-2 text-xs"
              >
                <div className="min-w-0 truncate">
                  <span className="font-semibold text-[#efe3c8]">{w.title}</span>
                  <span className="text-[#9e9380] font-mono-num">
                    {' '}
                    · {formatShortDate(w.dateStr)} — {w.detail}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onDeleteWorkout(w.id)}
                  aria-label={`Remover treino ${w.title}`}
                  className="text-[#848890] hover:text-red-400 p-1 rounded cursor-pointer shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Estoque de Creatina Monohydrate */}
      <div
        className={`parchment-box p-4 space-y-3 ${
          lowStock ? 'border-amber-500/70 bg-amber-950/15' : ''
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="text-xs font-epic text-[#c59b27]">
              Estoque de Creatina Monohydrate
            </div>
            <div className="font-mono-num text-lg font-bold text-[#f3ead6]">
              {stock}g restantes{' '}
              <span className="text-xs font-normal text-[#a69982]">
                ({daysRemaining} {daysRemaining === 1 ? 'dia' : 'dias'} de suprimento)
              </span>
            </div>
          </div>

          <div
            className="inline-flex rounded border border-[#3a3f45] bg-[#111214] p-0.5"
            role="group"
            aria-label="Dosagem diária de creatina"
          >
            {[3, 5].map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => onChangeCreatineDose(g)}
                className={`px-2.5 py-1 rounded text-xs font-mono-num font-bold cursor-pointer ${
                  dose === g
                    ? 'bg-[#c59b27] text-[#101215]'
                    : 'text-[#9e9380] hover:text-white'
                }`}
              >
                {g}g/dia
              </button>
            ))}
          </div>
        </div>

        {lowStock && (
          <div className="flex items-center gap-2 text-xs text-amber-300 bg-amber-950/40 border border-amber-500/40 rounded px-3 py-2">
            <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>
              Estoque abaixo de 10 dias. Programe a reposição sem furar o orçamento da Arca I.
            </span>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={takenToday || stock < dose}
            onClick={onTakeCreatineDose}
            className={`flex-1 py-2.5 px-3 rounded text-xs font-epic flex items-center justify-center gap-1.5 min-h-[40px] ${
              takenToday
                ? 'rpg-btn-iron text-emerald-300 border-emerald-600/50 cursor-default'
                : 'rpg-btn-gold cursor-pointer'
            }`}
          >
            <Check className="w-4 h-4" aria-hidden="true" />
            <span>
              {takenToday
                ? `Dose de ${dose}g Tomada Hoje`
                : stock < dose
                ? 'Estoque Esgotado'
                : `Tomar ${dose}g Hoje (+25 XP)`}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onRefillCreatine(300)}
            className="rpg-btn-iron px-3.5 py-2.5 rounded text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer min-h-[40px]"
          >
            <Plus className="w-3.5 h-3.5" aria-hidden="true" />
            <span>+300g Pote</span>
          </button>
        </div>
      </div>

      {/* Sub-card: Painel Clínico de Exames & Histórico Definitivo */}
      <div className="parchment-box p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-[#eab308]" aria-hidden="true" />
            <div>
              <h3 className="text-xs font-epic text-[#c59b27]">
                Histórico Clínico Definitivo &amp; Coração 3D
              </h3>
              <p className="text-[11px] font-mono-num text-[#9e9380]">
                {medicalExams.length} exames ativos · +60 XP corporal por novo check-up
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowExamForm((prev) => !prev)}
            aria-expanded={showExamForm}
            className={`px-3.5 py-2 rounded text-xs font-epic flex items-center gap-1.5 cursor-pointer min-h-[38px] ${
              showExamForm ? 'rpg-btn-iron' : 'rpg-btn-gold'
            }`}
          >
            {showExamForm ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Fechar Formulário</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                <span>+ Adicionar Novo Exame</span>
              </>
            )}
          </button>
        </div>

        <ClinicalTelemetryPanel medicalExams={medicalExams} />

        {showExamForm && (
          <form onSubmit={handleExamSubmit} className="space-y-2.5 p-3.5 rounded-lg bg-[#0d0f12] border border-[#eab308]/35">
          {/* Seletor rápido de tipo de exame */}
          <div
            className="flex flex-wrap gap-1.5"
            role="group"
            aria-label="Selecionar tipo de exame clínico"
          >
            {MEDICAL_EXAM_TEMPLATES.map((tpl) => {
              const active = examType === tpl.type;
              return (
                <button
                  key={tpl.type}
                  type="button"
                  onClick={() => handleSelectExamType(tpl.type)}
                  className={`px-2.5 py-1.5 rounded text-xs font-semibold border cursor-pointer transition-colors ${
                    active
                      ? 'bg-[#c59b27] text-[#101215] border-[#fde047]'
                      : 'bg-[#111214] text-[#9e9380] border-[#2e333a] hover:text-white'
                  }`}
                >
                  {tpl.label}
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
            <div className="sm:col-span-5">
              <label htmlFor="exam-label" className="block text-[11px] text-[#9e9380] mb-1">
                Nome do Exame
              </label>
              <input
                id="exam-label"
                type="text"
                required
                value={examLabel}
                onChange={(e) => setExamLabel(e.target.value)}
                placeholder={selectedTemplate.label}
                className="w-full bg-[#111214] border border-[#3a3f45] focus:border-[#c59b27] focus:outline-none rounded px-3 py-2 text-sm text-white placeholder:text-[#6f7279] min-h-[40px]"
              />
            </div>

            <div className="sm:col-span-4">
              <label htmlFor="exam-date" className="block text-[11px] text-[#9e9380] mb-1">
                Data do Exame
              </label>
              <input
                id="exam-date"
                type="date"
                required
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="w-full bg-[#111214] border border-[#3a3f45] focus:border-[#c59b27] focus:outline-none rounded px-2.5 py-2 text-xs font-mono-num text-white min-h-[40px]"
              />
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="exam-status" className="block text-[11px] text-[#9e9380] mb-1">
                Status Clínico
              </label>
              <select
                id="exam-status"
                value={examStatus}
                onChange={(e) => setExamStatus(e.target.value as MedicalExamStatus)}
                className="w-full bg-[#111214] border border-[#3a3f45] focus:border-[#c59b27] focus:outline-none rounded px-2.5 py-2 text-xs text-white min-h-[40px]"
              >
                <option value="otimo">Ótimo</option>
                <option value="acompanhar">Acompanhar</option>
                <option value="atencao">Atenção Médica</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
            <div className="sm:col-span-6">
              <label htmlFor="exam-summary" className="block text-[11px] text-[#9e9380] mb-1">
                Conclusão / Resultado Principal
              </label>
              <input
                id="exam-summary"
                type="text"
                required
                value={resultSummary}
                onChange={(e) => setResultSummary(e.target.value)}
                placeholder={selectedTemplate.defaultSummaryPlaceholder}
                className="w-full bg-[#111214] border border-[#3a3f45] focus:border-[#c59b27] focus:outline-none rounded px-3 py-2 text-sm text-white placeholder:text-[#6f7279] min-h-[40px]"
              />
            </div>

            <div className="sm:col-span-6">
              <label htmlFor="exam-metrics" className="block text-[11px] text-[#9e9380] mb-1">
                Parâmetros / Valores Numéricos
              </label>
              <input
                id="exam-metrics"
                type="text"
                value={metricsDetail}
                onChange={(e) => setMetricsDetail(e.target.value)}
                placeholder={selectedTemplate.metricsPlaceholder}
                className="w-full bg-[#111214] border border-[#3a3f45] focus:border-[#c59b27] focus:outline-none rounded px-3 py-2 text-sm font-mono-num text-white placeholder:text-[#6f7279] min-h-[40px]"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              aria-label="Observações médicas ou conduta"
              value={examNotes}
              onChange={(e) => setExamNotes(e.target.value)}
              placeholder="Conduta médica, observações de retorno ou recomendações..."
              className="flex-1 bg-[#111214] border border-[#3a3f45] focus:border-[#c59b27] focus:outline-none rounded px-3 py-2 text-sm text-white placeholder:text-[#6f7279] min-h-[40px]"
            />
            <button
              type="submit"
              disabled={!resultSummary.trim()}
              className="rpg-btn-gold px-4 py-2 rounded text-xs font-epic flex items-center justify-center gap-1.5 cursor-pointer min-h-[40px] whitespace-nowrap"
            >
              <Activity className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>Registrar Exame (+60 XP)</span>
            </button>
          </div>
        </form>
        )}

        {medicalExams.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-[#3a3f45]/70 max-h-80 overflow-y-auto pr-1">
            {medicalExams.map((exam) => {
              const meta = getStatusMeta(exam.status);
              return (
                <article
                  key={exam.id}
                  className={`rounded border p-3 flex items-start justify-between gap-2.5 ${meta.borderClass}`}
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <button
                        type="button"
                        onClick={() => onCycleExamStatus(exam.id)}
                        title="Alternar status clínico (Ótimo / Acompanhar / Atenção)"
                        className={`inline-flex items-center gap-1 text-xs font-semibold cursor-pointer ${meta.textClass}`}
                      >
                        {exam.status === 'atencao' ? (
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                        ) : exam.status === 'acompanhar' ? (
                          <Activity className="w-3.5 h-3.5 shrink-0 health-status-breath" aria-hidden="true" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0 health-status-breath" aria-hidden="true" />
                        )}
                        <span>{meta.label}</span>
                      </button>

                      <span className="text-sm font-semibold text-[#f3ead6]">
                        · {exam.examLabel}
                      </span>
                      <span className="text-xs font-mono-num text-[#9e9380]">
                        · {formatShortDate(exam.examDate)}
                      </span>
                    </div>

                    <div className="text-xs text-[#ece0c8] font-medium">
                      {exam.resultSummary}
                    </div>

                    {exam.metricsDetail && (
                      <div className="text-xs font-mono-num text-[#a89982]">
                        {exam.metricsDetail}
                      </div>
                    )}

                    {exam.notes && (
                      <div className="text-[11px] text-[#9e9380] italic">
                        {exam.notes}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => onDeleteMedicalExam(exam.id)}
                    aria-label={`Remover exame ${exam.examLabel}`}
                    className="text-[#848890] hover:text-red-400 p-1 rounded cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Rotina Diária de Saúde */}
      <div className="space-y-2">
        <div className="text-xs font-epic text-[#c59b27]">
          Rotina Diária de Saúde &amp; Recuperação
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {HEALTH_ROUTINE_ITEMS.map((item) => {
            const done = !!vocational.healthChecks[item.key];
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onToggleHealthCheck(item.key)}
                aria-pressed={done}
                className={`parchment-box p-3 text-left flex items-start justify-between gap-2 cursor-pointer min-h-[54px] transition-colors ${
                  done
                    ? 'border-emerald-600/60 bg-emerald-950/20'
                    : 'hover:border-[#eab308]/70'
                }`}
              >
                <div className="min-w-0">
                  <div
                    className={`text-xs font-semibold ${
                      done ? 'text-emerald-300' : 'text-[#efe3c8]'
                    }`}
                  >
                    {item.label}
                  </div>
                  <div className="text-[11px] text-[#9e9380] mt-0.5 leading-snug">
                    {item.detail}
                  </div>
                </div>
                <span
                  className={`w-5 h-5 rounded flex items-center justify-center shrink-0 border mt-0.5 ${
                    done
                      ? 'bg-emerald-700 border-emerald-400 text-white'
                      : 'bg-[#111214] border-[#525861] text-[#6f7279]'
                  }`}
                >
                  <Check className="w-3 h-3" aria-hidden="true" />
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
