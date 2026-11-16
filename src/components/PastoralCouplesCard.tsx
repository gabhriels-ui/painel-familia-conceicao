import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Calendar,
  CalendarCheck2,
  Check,
  Clock,
  Edit3,
  HeartHandshake,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { MARRIAGE_PREP_TOPICS } from '../data/chroniclesData';
import type {
  MarriageCouple,
  MarriageCoupleStatus,
  MissionEntry,
} from '../types/chronicles';
import {
  detectCoupleScheduleConflicts,
  formatDateBr,
  getAllCoupleConflicts,
} from '../utils/scheduleConflicts';

interface PastoralCouplesCardProps {
  couples: MarriageCouple[];
  missionEntries: MissionEntry[];
  onAddCouple: (data: {
    coupleNames: string;
    scheduledDate: string;
    scheduledTime: string;
    topic: string;
    notes: string;
    status: MarriageCoupleStatus;
  }) => void;
  onUpdateCouple: (
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
  onDeleteCouple: (coupleId: string) => void;
  onOpenCalendar?: () => void;
}

type StatusFilter = 'todos' | MarriageCoupleStatus;

const STATUS_LABELS: Record<MarriageCoupleStatus, string> = {
  aguardando_data: 'Aguardando data',
  em_andamento: 'Em andamento',
  encontro_concluido: 'Encontro Concluído',
};

const STATUS_FILTER_OPTIONS: { id: StatusFilter; label: string }[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'aguardando_data', label: 'Aguardando Data' },
  { id: 'em_andamento', label: 'Em Andamento' },
  { id: 'encontro_concluido', label: 'Concluídos' },
];

function getStatusAccentClass(status: MarriageCoupleStatus): string {
  if (status === 'encontro_concluido') return 'text-emerald-300';
  if (status === 'aguardando_data') return 'text-amber-300';
  return 'text-[#fde047]';
}

export function PastoralCouplesCard({
  couples,
  missionEntries,
  onAddCouple,
  onUpdateCouple,
  onDeleteCouple,
  onOpenCalendar,
}: PastoralCouplesCardProps) {
  // Estado do formulário de criação
  const [coupleNames, setCoupleNames] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('19:30');
  const [topic, setTopic] = useState(MARRIAGE_PREP_TOPICS[0]);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<MarriageCoupleStatus>('aguardando_data');

  // Filtros e busca
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('todos');
  const [searchQuery, setSearchQuery] = useState('');

  // Estado de edição inline (qualquer campo editável a qualquer momento)
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNames, setEditNames] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editTopic, setEditTopic] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editStatus, setEditStatus] = useState<MarriageCoupleStatus>('em_andamento');

  const createDraftConflicts = useMemo(
    () => detectCoupleScheduleConflicts(scheduledDate, scheduledTime, missionEntries),
    [scheduledDate, scheduledTime, missionEntries]
  );

  const editDraftConflicts = useMemo(
    () =>
      editingId
        ? detectCoupleScheduleConflicts(editDate, editTime, missionEntries)
        : [],
    [editingId, editDate, editTime, missionEntries]
  );

  const allConflicts = useMemo(
    () => getAllCoupleConflicts(couples, missionEntries),
    [couples, missionEntries]
  );

  const concludedCount = couples.filter(
    (c) => c.status === 'encontro_concluido'
  ).length;
  const activeCount = couples.length - concludedCount;

  const filteredCouples = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return [...couples]
      .filter((c) => {
        if (statusFilter !== 'todos' && c.status !== statusFilter) return false;
        if (!q) return true;
        return (
          c.coupleNames.toLowerCase().includes(q) ||
          c.topic.toLowerCase().includes(q) ||
          c.notes.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        // Prioriza em andamento / agendados primeiro, depois concluídos
        const rank = (s: MarriageCoupleStatus) =>
          s === 'em_andamento' ? 0 : s === 'aguardando_data' ? 1 : 2;
        if (rank(a.status) !== rank(b.status)) return rank(a.status) - rank(b.status);
        if (a.scheduledDate && b.scheduledDate) {
          return `${a.scheduledDate} ${a.scheduledTime}`.localeCompare(
            `${b.scheduledDate} ${b.scheduledTime}`
          );
        }
        if (a.scheduledDate && !b.scheduledDate) return -1;
        if (!a.scheduledDate && b.scheduledDate) return 1;
        return b.updatedAtIso.localeCompare(a.updatedAtIso);
      });
  }, [couples, statusFilter, searchQuery]);

  const startEditing = (couple: MarriageCouple) => {
    setEditingId(couple.id);
    setEditNames(couple.coupleNames);
    setEditDate(couple.scheduledDate);
    setEditTime(couple.scheduledTime);
    setEditTopic(couple.topic);
    setEditNotes(couple.notes);
    setEditStatus(couple.status);
  };

  const cancelEditing = () => {
    setEditingId(null);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNames = coupleNames.trim();
    if (!cleanNames) return;

    const resolvedStatus: MarriageCoupleStatus =
      scheduledDate && status === 'aguardando_data' ? 'em_andamento' : status;

    onAddCouple({
      coupleNames: cleanNames,
      scheduledDate: scheduledDate.trim(),
      scheduledTime: scheduledDate.trim() ? scheduledTime.trim() : '',
      topic: topic.trim() || MARRIAGE_PREP_TOPICS[0],
      notes: notes.trim(),
      status: resolvedStatus,
    });

    setCoupleNames('');
    setScheduledDate('');
    setScheduledTime('19:30');
    setNotes('');
    setStatus('aguardando_data');
  };

  const handleSaveEdit = (coupleId: string) => {
    const cleanNames = editNames.trim();
    if (!cleanNames) return;
    onUpdateCouple(coupleId, {
      coupleNames: cleanNames,
      scheduledDate: editDate.trim(),
      scheduledTime: editDate.trim() ? editTime.trim() : '',
      topic: editTopic.trim(),
      notes: editNotes.trim(),
      status: editStatus,
    });
    setEditingId(null);
  };

  const handleQuickStatusChange = (
    couple: MarriageCouple,
    nextStatus: MarriageCoupleStatus
  ) => {
    onUpdateCouple(couple.id, {
      coupleNames: couple.coupleNames,
      scheduledDate: couple.scheduledDate,
      scheduledTime: couple.scheduledTime,
      topic: couple.topic,
      notes: couple.notes,
      status: nextStatus,
    });
  };

  return (
    <section
      className="cathedral-glass state-card p-5 sm:p-6 space-y-5"
      data-tilt-subtle="true"
      aria-labelledby="pastoral-couples-heading"
    >
      {/* Cabeçalho Medieval 3D */}
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#7d5d28]/35 pb-4">
        <div className="flex items-start gap-3">
          <div className="depth-layer-3 w-10 h-10 rounded-lg bg-[#16191f] border border-[#eab308]/60 flex items-center justify-center shrink-0">
            <HeartHandshake className="w-5 h-5 text-[#fde047]" aria-hidden="true" />
          </div>
          <div>
            <span className="depth-layer-1 text-xs font-epic text-[#c59b27]">
              Pastoral Familiar · Preparação ao Matrimônio
            </span>
            <h2
              id="pastoral-couples-heading"
              className="depth-layer-2 font-epic text-xl text-[#f3ead6]"
            >
              Acompanhamento de Casais
            </h2>
          </div>
        </div>

        <div className="depth-layer-3 flex items-center gap-4 text-right">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-[#9e9380]">
              Em Orientação
            </div>
            <div className="font-mono-num text-lg font-bold text-[#fde047]">
              {activeCount}
            </div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider text-[#9e9380]">
              Concluídos
            </div>
            <div className="font-mono-num text-lg font-bold text-emerald-300">
              {concludedCount}
            </div>
          </div>
        </div>
      </div>

      {/* Faixa de Sincronização com o Calendário Tático */}
      <div className="parchment-box border-[#eab308]/50 p-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-start gap-2.5 min-w-0">
          <CalendarCheck2
            className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5"
            aria-hidden="true"
          />
          <div className="text-xs sm:text-sm text-[#e4d7be] leading-snug">
            <span className="font-semibold text-[#fde047]">
              Sincronizado com o Calendário Tático:
            </span>{' '}
            datas salvas aqui aparecem automaticamente no calendário mensal e cruzam horários com os plantões da PMSE e escalas do MESC.
          </div>
        </div>

        {onOpenCalendar && (
          <button
            type="button"
            onClick={onOpenCalendar}
            className="rpg-btn-iron px-3 py-1.5 rounded text-xs font-epic whitespace-nowrap shrink-0 cursor-pointer min-h-[36px]"
          >
            Ver no Calendário
          </button>
        )}
      </div>

      {/* Radar de Choques de Horário detectados */}
      {allConflicts.length > 0 && (
        <div
          role="alert"
          className="rounded-lg border border-amber-500/70 bg-amber-950/35 p-3.5 space-y-2"
        >
          <div className="flex items-center gap-2 text-xs font-epic text-amber-300">
            <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>
              Atenção · {allConflicts.length}{' '}
              {allConflicts.length === 1
                ? 'encontro coincide com PMSE ou MESC'
                : 'encontros coincidem com PMSE ou MESC'}
            </span>
          </div>
          <div className="space-y-1.5">
            {allConflicts.map(({ couple, conflicts }) => (
              <div
                key={`alert-${couple.id}`}
                className="flex flex-wrap items-center justify-between gap-2 text-xs text-amber-100/90"
              >
                <div className="min-w-0">
                  <strong className="text-[#fde047]">{couple.coupleNames}</strong> (
                  <span className="font-mono-num">
                    {formatDateBr(couple.scheduledDate)}
                    {couple.scheduledTime ? ` às ${couple.scheduledTime}` : ''}
                  </span>
                  ): {conflicts.map((c) => c.reason).join(' ')}
                </div>
                <button
                  type="button"
                  onClick={() => startEditing(couple)}
                  className="rpg-btn-iron px-2.5 py-1 rounded text-[11px] font-semibold cursor-pointer whitespace-nowrap shrink-0"
                >
                  Reagendar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Formulário para adicionar novo casal (totalmente flexível mesmo sem data fixa) */}
      <form onSubmit={handleCreateSubmit} className="parchment-box p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-epic text-[#c59b27]">
            Registrar Novo Casal / Encontro
          </span>
          <span className="text-[11px] text-[#9e9380]">
            Data opcional — edite a qualquer momento quando definirem o dia
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
          <div className="sm:col-span-5">
            <label htmlFor="pastoral-couple-names" className="block text-[11px] text-[#a69982] mb-1">
              Nome do Casal
            </label>
            <input
              id="pastoral-couple-names"
              type="text"
              value={coupleNames}
              onChange={(e) => setCoupleNames(e.target.value)}
              placeholder="Ex: Lucas & Mariana"
              maxLength={120}
              required
              className="w-full bg-[#111214] border border-[#3a3f45] focus:border-[#c59b27] focus:outline-none rounded px-3 py-2 text-sm text-white placeholder:text-[#6f7279] min-h-[42px]"
            />
          </div>

          <div className="sm:col-span-4">
            <label htmlFor="pastoral-date" className="block text-[11px] text-[#a69982] mb-1">
              Data do Encontro (Opcional)
            </label>
            <div className="flex items-center gap-1.5">
              <input
                id="pastoral-date"
                type="date"
                value={scheduledDate}
                onChange={(e) => {
                  const val = e.target.value;
                  setScheduledDate(val);
                  if (val && status === 'aguardando_data') {
                    setStatus('em_andamento');
                  } else if (!val && status === 'em_andamento') {
                    setStatus('aguardando_data');
                  }
                }}
                className="w-full bg-[#111214] border border-[#3a3f45] focus:border-[#c59b27] focus:outline-none rounded px-2.5 py-2 text-sm font-mono-num text-white min-h-[42px]"
              />
              {scheduledDate && (
                <button
                  type="button"
                  onClick={() => {
                    setScheduledDate('');
                    if (status === 'em_andamento') setStatus('aguardando_data');
                  }}
                  title="Deixar data em aberto"
                  aria-label="Limpar data"
                  className="rpg-btn-iron p-2 rounded min-h-[42px] cursor-pointer shrink-0"
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                </button>
              )}
            </div>
          </div>

          <div className="sm:col-span-3">
            <label htmlFor="pastoral-time" className="block text-[11px] text-[#a69982] mb-1">
              Horário Previsto
            </label>
            <input
              id="pastoral-time"
              type="time"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              disabled={!scheduledDate}
              className="w-full bg-[#111214] border border-[#3a3f45] focus:border-[#c59b27] focus:outline-none rounded px-2.5 py-2 text-sm font-mono-num text-white disabled:opacity-45 min-h-[42px]"
            />
          </div>

          <div className="sm:col-span-7">
            <label htmlFor="pastoral-topic" className="block text-[11px] text-[#a69982] mb-1">
              Tema / Etapa da Preparação
            </label>
            <input
              id="pastoral-topic"
              type="text"
              list="pastoral-topics-list"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Ex: Encontro I · Vocação Cristã ao Matrimônio"
              maxLength={160}
              className="w-full bg-[#111214] border border-[#3a3f45] focus:border-[#c59b27] focus:outline-none rounded px-3 py-2 text-sm text-white placeholder:text-[#6f7279] min-h-[42px]"
            />
            <datalist id="pastoral-topics-list">
              {MARRIAGE_PREP_TOPICS.map((preset) => (
                <option key={preset} value={preset} />
              ))}
            </datalist>
          </div>

          <div className="sm:col-span-5">
            <label htmlFor="pastoral-status" className="block text-[11px] text-[#a69982] mb-1">
              Status Inicial
            </label>
            <select
              id="pastoral-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as MarriageCoupleStatus)}
              className="w-full bg-[#111214] border border-[#3a3f45] focus:border-[#c59b27] focus:outline-none rounded px-3 py-2 text-sm text-white min-h-[42px]"
            >
              <option value="aguardando_data">Aguardando data</option>
              <option value="em_andamento">Em andamento</option>
              <option value="encontro_concluido">Encontro Concluído</option>
            </select>
          </div>

          <div className="sm:col-span-12">
            <label htmlFor="pastoral-notes" className="block text-[11px] text-[#a69982] mb-1">
              Anotações de Progresso
            </label>
            <textarea
              id="pastoral-notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={1500}
              placeholder="Registre observações pastorais, temas já conversados, disponibilidade do casal ou próximos passos..."
              className="w-full bg-[#111214] border border-[#3a3f45] focus:border-[#c59b27] focus:outline-none rounded px-3 py-2 text-sm text-white placeholder:text-[#6f7279] resize-y"
            />
          </div>
        </div>

        {/* Detector ao vivo de choque durante o cadastro */}
        {createDraftConflicts.length > 0 && (
          <div className="rounded border border-amber-500/75 bg-amber-950/40 px-3 py-2 text-xs text-amber-200 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
            <div className="space-y-0.5">
              {createDraftConflicts.map((c) => (
                <div key={c.shiftId}>{c.reason}</div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!coupleNames.trim()}
            className="rpg-btn-gold px-4 py-2.5 rounded text-xs sm:text-sm font-epic flex items-center gap-2 cursor-pointer min-h-[42px] disabled:opacity-50"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>Adicionar Casal</span>
          </button>
        </div>
      </form>

      {/* Barra de Filtros e Busca */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
        <div
          className="inline-flex flex-wrap gap-1 p-1 rounded-lg bg-[#101215] border border-white/10"
          role="group"
          aria-label="Filtrar casais por status"
        >
          {STATUS_FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setStatusFilter(opt.id)}
              className={`px-2.5 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-colors whitespace-nowrap shrink-0 min-h-[34px] ${
                statusFilter === opt.id
                  ? 'bg-[#c59b27] text-[#101215]'
                  : 'text-[#9e9380] hover:text-[#f3ead6]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="relative sm:w-60">
          <Search
            className="w-3.5 h-3.5 text-[#848890] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar casal ou anotação..."
            aria-label="Buscar casal ou anotação"
            className="w-full bg-[#111214] border border-[#3a3f45] focus:border-[#c59b27] focus:outline-none rounded-md pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-[#6f7279] min-h-[36px]"
          />
        </div>
      </div>

      {/* Lista de Casais Editáveis */}
      <div className="space-y-3">
        {filteredCouples.length === 0 ? (
          <div className="parchment-box p-5 text-center text-sm text-[#a69982]">
            {couples.length === 0
              ? 'Nenhum casal registrado ainda. Adicione acima os casais que vocês estão acompanhando para o matrimônio.'
              : 'Nenhum casal corresponde ao filtro ou busca atual.'}
          </div>
        ) : (
          filteredCouples.map((couple) => {
            const isEditing = editingId === couple.id;
            const itemConflicts = couple.scheduledDate
              ? detectCoupleScheduleConflicts(
                  couple.scheduledDate,
                  couple.scheduledTime,
                  missionEntries
                )
              : [];
            const hasHardConflict = itemConflicts.some((c) => c.severity === 'conflict');

            if (isEditing) {
              return (
                <article
                  key={couple.id}
                  className="parchment-box border-[#eab308]/85 p-4 space-y-3 bg-[#19160f]"
                >
                  <div className="flex items-center justify-between gap-2 pb-2 border-b border-white/10">
                    <span className="text-xs font-epic text-[#fde047]">
                      Editando Registro do Casal
                    </span>
                    <button
                      type="button"
                      onClick={cancelEditing}
                      className="text-xs text-[#9e9380] hover:text-white cursor-pointer"
                    >
                      Cancelar
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                    <div className="sm:col-span-5">
                      <label className="block text-[11px] text-[#a69982] mb-1">
                        Nome do Casal
                      </label>
                      <input
                        type="text"
                        value={editNames}
                        onChange={(e) => setEditNames(e.target.value)}
                        maxLength={120}
                        className="w-full bg-[#111214] border border-[#3a3f45] focus:border-[#c59b27] focus:outline-none rounded px-3 py-2 text-sm text-white min-h-[40px]"
                      />
                    </div>

                    <div className="sm:col-span-4">
                      <label className="block text-[11px] text-[#a69982] mb-1">
                        Data Agendada
                      </label>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="date"
                          value={editDate}
                          onChange={(e) => setEditDate(e.target.value)}
                          className="w-full bg-[#111214] border border-[#3a3f45] focus:border-[#c59b27] focus:outline-none rounded px-2.5 py-2 text-sm font-mono-num text-white min-h-[40px]"
                        />
                        {editDate && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditDate('');
                              setEditTime('');
                            }}
                            title="Remover data fixa"
                            aria-label="Remover data fixa"
                            className="rpg-btn-iron p-2 rounded min-h-[40px] cursor-pointer shrink-0"
                          >
                            <X className="w-4 h-4" aria-hidden="true" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-[11px] text-[#a69982] mb-1">
                        Horário
                      </label>
                      <input
                        type="time"
                        value={editTime}
                        onChange={(e) => setEditTime(e.target.value)}
                        disabled={!editDate}
                        className="w-full bg-[#111214] border border-[#3a3f45] focus:border-[#c59b27] focus:outline-none rounded px-2.5 py-2 text-sm font-mono-num text-white disabled:opacity-45 min-h-[40px]"
                      />
                    </div>

                    <div className="sm:col-span-7">
                      <label className="block text-[11px] text-[#a69982] mb-1">
                        Tema / Etapa
                      </label>
                      <input
                        type="text"
                        list="pastoral-topics-list"
                        value={editTopic}
                        onChange={(e) => setEditTopic(e.target.value)}
                        maxLength={160}
                        className="w-full bg-[#111214] border border-[#3a3f45] focus:border-[#c59b27] focus:outline-none rounded px-3 py-2 text-sm text-white min-h-[40px]"
                      />
                    </div>

                    <div className="sm:col-span-5">
                      <label className="block text-[11px] text-[#a69982] mb-1">
                        Status
                      </label>
                      <select
                        value={editStatus}
                        onChange={(e) =>
                          setEditStatus(e.target.value as MarriageCoupleStatus)
                        }
                        className="w-full bg-[#111214] border border-[#3a3f45] focus:border-[#c59b27] focus:outline-none rounded px-3 py-2 text-sm text-white min-h-[40px]"
                      >
                        <option value="aguardando_data">Aguardando data</option>
                        <option value="em_andamento">Em andamento</option>
                        <option value="encontro_concluido">Encontro Concluído</option>
                      </select>
                    </div>

                    <div className="sm:col-span-12">
                      <label className="block text-[11px] text-[#a69982] mb-1">
                        Anotações de Progresso
                      </label>
                      <textarea
                        rows={3}
                        value={editNotes}
                        onChange={(e) => setEditNotes(e.target.value)}
                        maxLength={1500}
                        className="w-full bg-[#111214] border border-[#3a3f45] focus:border-[#c59b27] focus:outline-none rounded px-3 py-2 text-sm text-white resize-y"
                      />
                    </div>
                  </div>

                  {editDraftConflicts.length > 0 && (
                    <div className="rounded border border-amber-500/75 bg-amber-950/40 px-3 py-2 text-xs text-amber-200 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
                      <div className="space-y-0.5">
                        {editDraftConflicts.map((c) => (
                          <div key={c.shiftId}>{c.reason}</div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={cancelEditing}
                      className="rpg-btn-iron px-3.5 py-2 rounded text-xs font-semibold cursor-pointer min-h-[38px]"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveEdit(couple.id)}
                      disabled={!editNames.trim()}
                      className="rpg-btn-gold px-4 py-2 rounded text-xs font-epic flex items-center gap-1.5 cursor-pointer min-h-[38px] disabled:opacity-50"
                    >
                      <Check className="w-4 h-4" aria-hidden="true" />
                      <span>Salvar Alterações</span>
                    </button>
                  </div>
                </article>
              );
            }

            return (
              <article
                key={couple.id}
                className={`parchment-box p-4 space-y-2.5 ${
                  hasHardConflict
                    ? 'border-amber-500/75 bg-[#1b1510]'
                    : couple.status === 'encontro_concluido'
                    ? 'border-emerald-700/50 bg-[#101815]'
                    : ''
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-epic text-base text-[#f3ead6] truncate">
                        {couple.coupleNames}
                      </h3>
                      <span aria-hidden="true" className="text-[#6f7279]">
                        ·
                      </span>
                      <span
                        className={`text-xs font-semibold ${getStatusAccentClass(
                          couple.status
                        )}`}
                      >
                        {STATUS_LABELS[couple.status]}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-mono-num text-[#dfc168]">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                        <span>
                          {couple.scheduledDate
                            ? formatDateBr(couple.scheduledDate)
                            : 'Data a definir'}
                        </span>
                      </span>
                      {couple.scheduledDate && couple.scheduledTime && (
                        <span className="inline-flex items-center gap-1 text-[#c7b8a0]">
                          <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                          <span>{couple.scheduledTime}</span>
                        </span>
                      )}
                      {couple.topic && (
                        <span className="font-sans text-[#c7b8a0]">
                          · {couple.topic}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                    <select
                      aria-label={`Alterar status de ${couple.coupleNames}`}
                      value={couple.status}
                      onChange={(e) =>
                        handleQuickStatusChange(
                          couple,
                          e.target.value as MarriageCoupleStatus
                        )
                      }
                      className="bg-[#111214] border border-[#3a3f45] focus:border-[#c59b27] rounded px-2 py-1.5 text-xs text-[#efe3c8] min-h-[36px] cursor-pointer"
                    >
                      <option value="aguardando_data">Aguardando data</option>
                      <option value="em_andamento">Em andamento</option>
                      <option value="encontro_concluido">Encontro Concluído</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => startEditing(couple)}
                      aria-label={`Editar registro de ${couple.coupleNames}`}
                      className="rpg-btn-iron px-2.5 py-1.5 rounded text-xs font-semibold inline-flex items-center gap-1 cursor-pointer min-h-[36px]"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-[#dfc168]" aria-hidden="true" />
                      <span>Editar</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteCouple(couple.id)}
                      aria-label={`Excluir registro de ${couple.coupleNames}`}
                      className="text-[#848890] hover:text-red-400 p-2 rounded cursor-pointer min-h-[36px]"
                    >
                      <Trash2 className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>

                {couple.notes && (
                  <p className="text-xs sm:text-sm text-[#d5c7b0] leading-relaxed whitespace-pre-line border-t border-white/10 pt-2">
                    {couple.notes}
                  </p>
                )}

                {itemConflicts.length > 0 && (
                  <div className="rounded border border-amber-500/65 bg-amber-950/35 px-3 py-2 text-xs text-amber-200 flex items-start gap-2">
                    <AlertTriangle
                      className="w-4 h-4 text-amber-400 shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                    <div className="space-y-0.5">
                      {itemConflicts.map((c) => (
                        <div key={c.shiftId}>
                          <strong>{c.moduleLabel}:</strong> {c.reason}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}
