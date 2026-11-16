import { useMemo, useState } from 'react';
import {
  BookOpen,
  Brain,
  Check,
  CheckCircle2,
  Plus,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { BRAIN_TIERS, READING_CATEGORIES } from '../data/chroniclesData';
import type { ReadingCategory, ReadingLog } from '../types/chronicles';
import { NeuralBrain3DCanvas } from './NeuralBrain3DCanvas';

interface MenteConexoesCardProps {
  brainXp: number;
  readingLogs: ReadingLog[];
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
}

function formatShortDate(dateStr: string): string {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function getCategoryAccent(cat: ReadingCategory): string {
  return READING_CATEGORIES.find((c) => c.key === cat)?.accent ?? '#fde047';
}

function getCategoryLabel(cat: ReadingCategory): string {
  return READING_CATEGORIES.find((c) => c.key === cat)?.label ?? 'Leitura';
}

export function MenteConexoesCard({
  brainXp,
  readingLogs,
  onAddReadingLog,
  onToggleReadingComplete,
  onDeleteReadingLog,
}: MenteConexoesCardProps) {
  const todayIso = new Date().toISOString().slice(0, 10);
  const [category, setCategory] = useState<ReadingCategory>('espiritual');
  const [title, setTitle] = useState('');
  const [authorOrSource, setAuthorOrSource] = useState('');
  const [pagesOrMinutes, setPagesOrMinutes] = useState('25');
  const [dateStr, setDateStr] = useState(todayIso);
  const [completed, setCompleted] = useState(false);
  const [notes, setNotes] = useState('');
  const [filterCat, setFilterCat] = useState<ReadingCategory | 'all'>('all');

  const currentTierIdx = useMemo(
    () => BRAIN_TIERS.reduce((acc, tier, idx) => (brainXp >= tier.minXp ? idx : acc), 0),
    [brainXp]
  );
  const currentTier = BRAIN_TIERS[currentTierIdx];
  const nextTier = BRAIN_TIERS[currentTierIdx + 1] ?? null;

  const tierProgressPct = useMemo(() => {
    if (!nextTier) return 100;
    const span = nextTier.minXp - currentTier.minXp;
    const earned = brainXp - currentTier.minXp;
    return Math.min(100, Math.max(0, Math.round((earned / Math.max(1, span)) * 100)));
  }, [brainXp, currentTier, nextTier]);

  const categoryCounts = useMemo(() => {
    const counts: Record<ReadingCategory, number> = {
      espiritual: 0,
      literatura: 0,
      tcc: 0,
      direito: 0,
    };
    readingLogs.forEach((log) => {
      counts[log.category] = (counts[log.category] || 0) + 1;
    });
    return counts;
  }, [readingLogs]);

  const completedBooksCount = useMemo(
    () => readingLogs.filter((l) => l.completed).length,
    [readingLogs]
  );
  const totalPagesOrMinutes = useMemo(
    () => readingLogs.reduce((acc, l) => acc + (l.pagesOrMinutes || 0), 0),
    [readingLogs]
  );

  const visibleLogs = useMemo(() => {
    if (filterCat === 'all') return readingLogs;
    return readingLogs.filter((l) => l.category === filterCat);
  }, [readingLogs, filterCat]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAddReadingLog({
      category,
      title: title.trim(),
      authorOrSource: authorOrSource.trim(),
      pagesOrMinutes: Math.max(0, Math.min(100000, Math.floor(Number(pagesOrMinutes) || 0))),
      notes: notes.trim(),
      dateStr: dateStr || todayIso,
      completed,
    });
    setTitle('');
    setAuthorOrSource('');
    setNotes('');
    setCompleted(false);
  };

  return (
    <section
      className="cathedral-glass state-card p-5 sm:p-6 space-y-5"
      data-tilt-subtle="true"
    >
      {/* Cabeçalho */}
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#7d5d28]/40 pb-4">
        <div className="flex items-start gap-3">
          <div className="depth-layer-3 w-10 h-10 rounded-lg bg-[#16191f] border border-[#eab308]/55 flex items-center justify-center shrink-0">
            <Brain className="w-5 h-5 text-[#fde047]" aria-hidden="true" />
          </div>
          <div>
            <span className="depth-layer-1 text-xs font-epic text-[#c59b27]">
              Desenvolvimento Cerebral · Sinapses &amp; Sabedoria
            </span>
            <h2 className="depth-layer-2 font-epic text-xl text-[#f3ead6]">
              Mente &amp; Conexões
            </h2>
          </div>
        </div>

        <div className="depth-layer-3 text-right">
          <div className="text-[11px] uppercase tracking-wider text-[#9e9380]">
            XP Cerebral
          </div>
          <div className="font-mono-num text-lg font-bold text-[#fde047]">
            {brainXp.toLocaleString('pt-BR')} XP
          </div>
        </div>
      </div>

      {/* Palco Visual 3D das Sinapses & Progresso Cognitivo */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        <div className="lg:col-span-7 parchment-box p-2.5 sm:p-3">
          <NeuralBrain3DCanvas brainXp={brainXp} categoryCounts={categoryCounts} />
        </div>

        <div className="lg:col-span-5 parchment-box p-4 space-y-3.5">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-[#c59b27] font-epic">
              Patente Neural Atual
            </div>
            <div className="font-epic text-lg text-[#fde047] flex items-center gap-2 mt-0.5">
              <Sparkles className="w-4 h-4 shrink-0 text-[#eab308]" aria-hidden="true" />
              <span>{currentTier.name}</span>
            </div>
            <p className="text-xs text-[#a89982] mt-0.5">{currentTier.desc}</p>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono-num">
              <span className="text-[#a89982]">
                {nextTier ? `Próxima fase: ${nextTier.name}` : 'Nível Máximo Alcançado'}
              </span>
              <span className="text-[#fde047] font-semibold">
                {nextTier ? `${brainXp}/${nextTier.minXp} XP` : `${tierProgressPct}%`}
              </span>
            </div>
            <div
              className="w-full h-2.5 bg-[#111214] rounded-sm overflow-hidden border border-[#3a3f45]"
              role="progressbar"
              aria-valuenow={tierProgressPct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Evolução neural cerebral"
            >
              <div
                className="h-full bg-gradient-to-r from-[#b45309] via-[#eab308] to-[#38bdf8] transition-all duration-500"
                style={{ width: `${tierProgressPct}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1 border-t border-white/10 text-center">
            <div>
              <div className="text-[11px] text-[#9e9380]">Sessões</div>
              <div className="font-mono-num text-sm font-bold text-[#f3ead6]">
                {readingLogs.length}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-[#9e9380]">Concluídas</div>
              <div className="font-mono-num text-sm font-bold text-emerald-300">
                {completedBooksCount}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-[#9e9380]">Págs/Min</div>
              <div className="font-mono-num text-sm font-bold text-sky-300">
                {totalPagesOrMinutes.toLocaleString('pt-BR')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Formulário de Registro de Leituras */}
      <form onSubmit={handleSubmit} className="parchment-box p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs font-epic text-[#c59b27]">
            Registrar Leitura ou Sessão de Estudo
          </div>
          <span className="text-[11px] font-mono-num text-[#a89982]">
            {completed ? '+90 XP Cerebral (Obra concluída)' : '+45 XP Cerebral (Sessão de leitura)'}
          </span>
        </div>

        {/* Seletor de Categoria */}
        <div
          className="grid grid-cols-2 sm:grid-cols-4 gap-2"
          role="group"
          aria-label="Categoria da leitura"
        >
          {READING_CATEGORIES.map((cat) => {
            const active = category === cat.key;
            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => setCategory(cat.key)}
                aria-pressed={active}
                className={`p-2.5 rounded border text-left cursor-pointer transition-colors min-h-[48px] ${
                  active
                    ? 'bg-[#1c1811] border-[#eab308] text-[#f3ead6]'
                    : 'bg-[#111214] border-[#2e333a] text-[#9e9380] hover:border-[#eab308]/50'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-semibold">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: cat.accent }}
                    aria-hidden="true"
                  />
                  <span className="truncate">{cat.label}</span>
                </div>
                <div className="text-[10px] text-[#8d8473] truncate mt-0.5">
                  {cat.subtitle}
                </div>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
          <div className="sm:col-span-5">
            <label htmlFor="mind-title" className="block text-[11px] text-[#9e9380] mb-1">
              Livro, Artigo ou Disciplina
            </label>
            <input
              id="mind-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Forja · Direito Constitucional · Doutrina TCC"
              className="w-full bg-[#111214] border border-[#3a3f45] focus:border-[#c59b27] focus:outline-none rounded px-3 py-2 text-sm text-white placeholder:text-[#6f7279] min-h-[40px]"
            />
          </div>

          <div className="sm:col-span-3">
            <label htmlFor="mind-author" className="block text-[11px] text-[#9e9380] mb-1">
              Autor / Fonte
            </label>
            <input
              id="mind-author"
              type="text"
              value={authorOrSource}
              onChange={(e) => setAuthorOrSource(e.target.value)}
              placeholder="Ex: São Josemaría / AGES"
              className="w-full bg-[#111214] border border-[#3a3f45] focus:border-[#c59b27] focus:outline-none rounded px-3 py-2 text-sm text-white placeholder:text-[#6f7279] min-h-[40px]"
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="mind-pages" className="block text-[11px] text-[#9e9380] mb-1">
              Págs / Min
            </label>
            <input
              id="mind-pages"
              type="number"
              min={0}
              max={100000}
              value={pagesOrMinutes}
              onChange={(e) => setPagesOrMinutes(e.target.value)}
              className="w-full bg-[#111214] border border-[#3a3f45] focus:border-[#c59b27] focus:outline-none rounded px-3 py-2 text-sm font-mono-num text-white min-h-[40px]"
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="mind-date" className="block text-[11px] text-[#9e9380] mb-1">
              Data
            </label>
            <input
              id="mind-date"
              type="date"
              value={dateStr}
              onChange={(e) => setDateStr(e.target.value)}
              className="w-full bg-[#111214] border border-[#3a3f45] focus:border-[#c59b27] focus:outline-none rounded px-2.5 py-2 text-xs font-mono-num text-white min-h-[40px]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
          <div className="sm:col-span-7">
            <label htmlFor="mind-notes" className="sr-only">
              Síntese ou anotação da leitura
            </label>
            <input
              id="mind-notes"
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Insights principais, citação ou capítulo estudado..."
              className="w-full bg-[#111214] border border-[#3a3f45] focus:border-[#c59b27] focus:outline-none rounded px-3 py-2 text-sm text-white placeholder:text-[#6f7279] min-h-[40px]"
            />
          </div>

          <div className="sm:col-span-5 flex flex-wrap sm:flex-nowrap items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setCompleted((v) => !v)}
              aria-pressed={completed}
              className={`px-3 py-2 rounded border text-xs font-semibold flex items-center gap-1.5 cursor-pointer min-h-[40px] whitespace-nowrap ${
                completed
                  ? 'bg-emerald-950/40 border-emerald-500/70 text-emerald-300'
                  : 'bg-[#111214] border-[#3a3f45] text-[#a89982] hover:border-[#eab308]/60'
              }`}
            >
              <Check className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Concluída</span>
            </button>

            <button
              type="submit"
              disabled={!title.trim()}
              className="rpg-btn-gold flex-1 sm:flex-none px-4 py-2 rounded text-xs font-epic flex items-center justify-center gap-1.5 cursor-pointer min-h-[40px] whitespace-nowrap"
            >
              <Plus className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Registrar (+{completed ? 90 : 45} XP)</span>
            </button>
          </div>
        </div>
      </form>

      {/* Histórico Filtrável de Leituras */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-epic text-[#c59b27]">
            <BookOpen className="w-4 h-4" aria-hidden="true" />
            <span>Diário de Leituras &amp; Conexões ({readingLogs.length})</span>
          </div>

          <div
            className="inline-flex flex-wrap gap-1 bg-[#101215] border border-white/10 rounded-lg p-1"
            role="group"
            aria-label="Filtrar leituras por categoria"
          >
            <button
              type="button"
              onClick={() => setFilterCat('all')}
              className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer ${
                filterCat === 'all'
                  ? 'bg-[#c59b27] text-[#101215]'
                  : 'text-[#9e9380] hover:text-white'
              }`}
            >
              Todos
            </button>
            {READING_CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                type="button"
                onClick={() => setFilterCat(cat.key)}
                className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer ${
                  filterCat === cat.key
                    ? 'bg-[#c59b27] text-[#101215]'
                    : 'text-[#9e9380] hover:text-white'
                }`}
              >
                {cat.label.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {visibleLogs.length === 0 ? (
          <div className="parchment-box p-4 text-center text-sm text-[#9e9380]">
            Nenhuma leitura registrada nesta frente ainda. Registre um livro espiritual, literatura, TCC ou estudo de Direito para iluminar novas sinapses.
          </div>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {visibleLogs.map((log) => {
              const accent = getCategoryAccent(log.category);
              return (
                <article
                  key={log.id}
                  className={`parchment-box p-3.5 flex items-start justify-between gap-3 border transition-colors ${
                    log.completed ? 'border-emerald-600/45 bg-emerald-950/15' : 'border-[#2c3138]'
                  }`}
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <button
                      type="button"
                      onClick={() => onToggleReadingComplete(log.id)}
                      aria-label={
                        log.completed
                          ? `Desmarcar conclusão de ${log.title}`
                          : `Concluir leitura ${log.title}`
                      }
                      title={
                        log.completed
                          ? 'Leitura concluída'
                          : 'Marcar como concluída (+45 XP bônus)'
                      }
                      className={`mt-0.5 w-6 h-6 rounded flex items-center justify-center border shrink-0 cursor-pointer transition-colors ${
                        log.completed
                          ? 'bg-emerald-700 border-emerald-400 text-white'
                          : 'bg-[#111214] border-[#525861] text-[#848890] hover:border-[#eab308]'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>

                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: accent }}
                          aria-hidden="true"
                        />
                        <h3 className="text-sm font-semibold text-[#f3ead6] truncate">
                          {log.title}
                        </h3>
                        {log.authorOrSource && (
                          <span className="text-xs text-[#a89982]">
                            · {log.authorOrSource}
                          </span>
                        )}
                      </div>

                      <div className="text-xs font-mono-num text-[#9e9380]">
                        <span style={{ color: accent }}>{getCategoryLabel(log.category)}</span>
                        {' · '}
                        {formatShortDate(log.dateStr)}
                        {log.pagesOrMinutes > 0 ? ` · ${log.pagesOrMinutes} págs/min` : ''}
                        {' · '}
                        <span className="text-[#fde047]">+{log.xpGranted} XP cerebral</span>
                      </div>

                      {log.notes && (
                        <p className="text-xs text-[#d6cbb7] leading-relaxed">
                          {log.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onDeleteReadingLog(log.id)}
                    aria-label={`Excluir leitura ${log.title}`}
                    className="text-[#848890] hover:text-red-400 p-1 rounded cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
