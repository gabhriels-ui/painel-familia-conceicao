import { useState } from 'react';
import { BookOpen, Check, Edit3, Plus, Scale, Trash2 } from 'lucide-react';
import { TCC_STAGES } from '../data/chroniclesData';
import type { MissionEntry, VocationalState } from '../types/chronicles';

interface ArsenalJuridicoCardProps {
  vocational: VocationalState;
  exams: MissionEntry[];
  onSaveTccTheme: (theme: string) => void;
  onToggleTccStage: (stageKey: string) => void;
  onAddExam: (data: {
    title: string;
    detail: string;
    dateStr: string;
    timeStr: string;
  }) => void;
  onToggleExam: (entryId: string, xpReward: number) => void;
  onDeleteExam: (entryId: string) => void;
}

function getDaysUntil(dateStr: string): number | null {
  if (!dateStr) return null;
  const target = new Date(`${dateStr}T12:00:00`);
  if (Number.isNaN(target.getTime())) return null;
  const now = new Date();
  const todayMid = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0);
  return Math.round((target.getTime() - todayMid.getTime()) / 86_400_000);
}

function formatShortDate(dateStr: string): string {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

export function ArsenalJuridicoCard({
  vocational,
  exams,
  onSaveTccTheme,
  onToggleTccStage,
  onAddExam,
  onToggleExam,
  onDeleteExam,
}: ArsenalJuridicoCardProps) {
  const [editingTheme, setEditingTheme] = useState(false);
  const [themeDraft, setThemeDraft] = useState(vocational.tccTheme);

  const [examTitle, setExamTitle] = useState('');
  const [examDetail, setExamDetail] = useState('');
  const [examDate, setExamDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [examTime, setExamTime] = useState('19:00');

  const stagesDone = TCC_STAGES.filter((s) => !!vocational.tccStages[s.key]).length;
  const tccProgressPct = Math.round((stagesDone / TCC_STAGES.length) * 100);

  const sortedExams = [...exams].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return `${a.dateStr} ${a.timeStr}`.localeCompare(`${b.dateStr} ${b.timeStr}`);
  });

  const handleSaveTheme = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = themeDraft.trim();
    if (!cleaned) return;
    onSaveTccTheme(cleaned);
    setEditingTheme(false);
  };

  const handleAddExamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examTitle.trim() || !examDate) return;
    onAddExam({
      title: examTitle.trim(),
      detail: examDetail.trim() || 'Avaliação / Prazo 8º Período · Faculdade AGES',
      dateStr: examDate,
      timeStr: examTime.trim() || '19:00',
    });
    setExamTitle('');
    setExamDetail('');
  };

  return (
    <section
      className="rpg-panel state-card p-5 sm:p-6 space-y-5"
      data-tilt-subtle="true"
    >
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#3a3f45] pb-4">
        <div className="flex items-start gap-3">
          <div className="depth-layer-3 w-10 h-10 rounded-lg bg-[#16191f] border border-[#eab308]/50 flex items-center justify-center shrink-0">
            <Scale className="w-5 h-5 text-[#eab308]" aria-hidden="true" />
          </div>
          <div>
            <span className="depth-layer-1 text-xs font-epic text-[#c59b27]">
              Faculdade AGES · 8º Período de Direito
            </span>
            <h2 className="depth-layer-2 font-epic text-xl text-[#f3ead6]">
              Arsenal Jurídico & TCC
            </h2>
          </div>
        </div>

        <div className="depth-layer-3 text-right">
          <div className="text-[11px] uppercase tracking-wider text-[#9e9380]">
            XP Acadêmico
          </div>
          <div className="font-mono-num text-lg font-bold text-[#fde047]">
            {(vocational.academicXp || 0).toLocaleString('pt-BR')} XP
          </div>
        </div>
      </div>

      {/* Tema e progresso do TCC em Segurança Pública */}
      <div className="parchment-box p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <div className="text-xs font-epic text-[#c59b27]">
              Monografia em Segurança Pública
            </div>
            {!editingTheme ? (
              <p className="text-sm font-semibold text-[#f3ead6] leading-snug">
                {vocational.tccTheme}
              </p>
            ) : (
              <form onSubmit={handleSaveTheme} className="flex flex-col sm:flex-row gap-2 pt-1">
                <input
                  type="text"
                  value={themeDraft}
                  onChange={(e) => setThemeDraft(e.target.value)}
                  maxLength={200}
                  aria-label="Tema do TCC em Segurança Pública"
                  className="flex-1 bg-[#111214] border border-[#c59b27]/70 rounded px-3 py-2 text-sm text-white focus:outline-none min-h-[40px]"
                />
                <button
                  type="submit"
                  className="rpg-btn-gold px-3.5 py-2 rounded text-xs font-epic cursor-pointer min-h-[40px]"
                >
                  Salvar Tema
                </button>
              </form>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              setThemeDraft(vocational.tccTheme);
              setEditingTheme((v) => !v);
            }}
            aria-label="Editar tema do TCC"
            className="rpg-btn-iron px-2.5 py-1.5 rounded text-xs font-semibold flex items-center gap-1 shrink-0 cursor-pointer min-h-[36px]"
          >
            <Edit3 className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{editingTheme ? 'Cancelar' : 'Editar'}</span>
          </button>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#a69982]">Avanço das Etapas do TCC</span>
            <span className="font-mono-num font-bold text-[#fde047]">
              {stagesDone} / {TCC_STAGES.length} ({tccProgressPct}%)
            </span>
          </div>
          <div
            className="w-full h-2.5 bg-[#111214] rounded-sm overflow-hidden border border-[#3a3f45]"
            role="progressbar"
            aria-valuenow={tccProgressPct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Progresso das etapas do TCC"
          >
            <div
              className="h-full bg-gradient-to-r from-[#b45309] via-[#eab308] to-[#10b981] transition-all duration-300"
              style={{ width: `${tccProgressPct}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          {TCC_STAGES.map((stage) => {
            const done = !!vocational.tccStages[stage.key];
            return (
              <button
                key={stage.key}
                type="button"
                onClick={() => onToggleTccStage(stage.key)}
                aria-pressed={done}
                className={`p-3 rounded-lg border text-left flex items-start justify-between gap-2.5 transition-colors cursor-pointer min-h-[56px] ${
                  done
                    ? 'bg-emerald-950/25 border-emerald-600/60'
                    : 'bg-[#121418] border-[#3a3f45] hover:border-[#eab308]/70'
                }`}
              >
                <div className="min-w-0">
                  <div
                    className={`text-xs sm:text-sm font-semibold leading-tight ${
                      done ? 'text-emerald-300' : 'text-[#efe3c8]'
                    }`}
                  >
                    {stage.title}
                  </div>
                  <div className="text-[11px] text-[#9e9380] mt-0.5 leading-snug">
                    {stage.detail}
                  </div>
                </div>
                <span
                  className={`w-6 h-6 rounded flex items-center justify-center shrink-0 border mt-0.5 ${
                    done
                      ? 'bg-emerald-700 border-emerald-400 text-white'
                      : 'bg-[#111214] border-[#525861] text-[#6f7279]'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" aria-hidden="true" />
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Cadastro de Provas e Prazos AGES */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#eab308]" aria-hidden="true" />
            <h3 className="font-epic text-sm text-[#f3ead6]">
              Prazos de Provas & Seminários (AGES)
            </h3>
          </div>
          <span className="font-mono-num text-xs text-[#9e9380]">
            {exams.filter((e) => !e.completed).length} pendentes
          </span>
        </div>

        <form
          onSubmit={handleAddExamSubmit}
          className="parchment-box p-3.5 grid grid-cols-1 sm:grid-cols-12 gap-2.5"
        >
          <div className="sm:col-span-5">
            <label htmlFor="ages-exam-title" className="sr-only">
              Disciplina ou Prova
            </label>
            <input
              id="ages-exam-title"
              type="text"
              value={examTitle}
              onChange={(e) => setExamTitle(e.target.value)}
              placeholder="Disciplina / Prova (ex: Direito Penal IV)"
              maxLength={140}
              className="w-full bg-[#111214] border border-[#3a3f45] focus:border-[#c59b27] focus:outline-none rounded px-3 py-2 text-sm text-white placeholder:text-[#6f7279] min-h-[42px]"
            />
          </div>
          <div className="sm:col-span-3">
            <label htmlFor="ages-exam-date" className="sr-only">
              Data da prova
            </label>
            <input
              id="ages-exam-date"
              type="date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              className="w-full bg-[#111214] border border-[#3a3f45] focus:border-[#c59b27] focus:outline-none rounded px-3 py-2 text-sm font-mono-num text-white min-h-[42px]"
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="ages-exam-time" className="sr-only">
              Horário da prova
            </label>
            <input
              id="ages-exam-time"
              type="time"
              value={examTime}
              onChange={(e) => setExamTime(e.target.value)}
              className="w-full bg-[#111214] border border-[#3a3f45] focus:border-[#c59b27] focus:outline-none rounded px-2.5 py-2 text-sm font-mono-num text-white min-h-[42px]"
            />
          </div>
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={!examTitle.trim()}
              className="rpg-btn-gold w-full px-3 py-2 rounded text-xs font-epic flex items-center justify-center gap-1 cursor-pointer min-h-[42px]"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              <span>Agendar</span>
            </button>
          </div>
          <div className="sm:col-span-12">
            <label htmlFor="ages-exam-detail" className="sr-only">
              Observações da prova
            </label>
            <input
              id="ages-exam-detail"
              type="text"
              value={examDetail}
              onChange={(e) => setExamDetail(e.target.value)}
              placeholder="Assunto, sala ou peso da nota (opcional)"
              maxLength={200}
              className="w-full bg-[#111214] border border-[#3a3f45] focus:border-[#c59b27] focus:outline-none rounded px-3 py-2 text-xs text-white placeholder:text-[#6f7279] min-h-[38px]"
            />
          </div>
        </form>

        <div className="space-y-2">
          {sortedExams.length === 0 ? (
            <div className="parchment-box p-4 text-center text-sm text-[#a69982]">
              Nenhuma prova ou prazo agendado no 8º período. Adicione acima para ganhar +90 XP ao concluir.
            </div>
          ) : (
            sortedExams.map((exam) => {
              const days = getDaysUntil(exam.dateStr);
              const urgencyText =
                exam.completed
                  ? 'Concluída'
                  : days === null
                  ? formatShortDate(exam.dateStr)
                  : days < 0
                  ? `Venceu há ${Math.abs(days)}d`
                  : days === 0
                  ? 'Hoje'
                  : days === 1
                  ? 'Amanhã'
                  : `Em ${days}d`;

              return (
                <article
                  key={exam.id}
                  className={`parchment-box p-3.5 flex flex-wrap items-center justify-between gap-3 ${
                    exam.completed ? 'opacity-75 border-emerald-700/50' : ''
                  }`}
                >
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-sm font-semibold ${
                          exam.completed
                            ? 'line-through text-emerald-300'
                            : 'text-[#f3ead6]'
                        }`}
                      >
                        {exam.title}
                      </span>
                      <span
                        className={`font-mono-num text-[11px] font-bold px-2 py-0.5 rounded border ${
                          exam.completed
                            ? 'bg-emerald-950/50 border-emerald-600/50 text-emerald-300'
                            : days !== null && days <= 3
                            ? 'bg-red-950/50 border-red-500/60 text-red-200'
                            : 'bg-[#111214] border-[#c59b27]/50 text-[#fde047]'
                        }`}
                      >
                        {urgencyText}
                      </span>
                    </div>
                    <div className="text-xs text-[#9e9380] font-mono-num">
                      {formatShortDate(exam.dateStr)}
                      {exam.timeStr ? ` · ${exam.timeStr}` : ''} — {exam.detail}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => onToggleExam(exam.id, 90)}
                      className={`px-3 py-2 rounded text-xs font-semibold cursor-pointer min-h-[38px] border transition-colors ${
                        exam.completed
                          ? 'rpg-btn-iron text-emerald-300 border-emerald-600/50'
                          : 'rpg-btn-gold'
                      }`}
                    >
                      {exam.completed ? 'Reabrir' : 'Concluir (+90 XP)'}
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteExam(exam.id)}
                      aria-label={`Remover prazo ${exam.title}`}
                      className="text-[#848890] hover:text-red-400 p-2 rounded cursor-pointer min-h-[38px]"
                    >
                      <Trash2 className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
