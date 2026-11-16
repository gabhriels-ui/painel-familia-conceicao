import { useState } from 'react';
import { Calendar, Check, Cross, Plus, Trash2 } from 'lucide-react';
import type { MissionEntry } from '../types/chronicles';

interface MescScheduleCardProps {
  shifts: MissionEntry[];
  onAddMescShift: (data: {
    title: string;
    detail: string;
    dateStr: string;
    timeStr: string;
  }) => void;
  onToggleMescShift: (entryId: string, xpReward: number) => void;
  onDeleteMescShift: (entryId: string) => void;
}

const MESC_ROLES = [
  'Distribuição Eucarística',
  'Comunhão aos Enfermos',
  'Adoração ao Santíssimo',
  'Missa Dominical',
];

function formatShortDate(dateStr: string): string {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function getDaysUntil(dateStr: string): number | null {
  if (!dateStr) return null;
  const target = new Date(`${dateStr}T12:00:00`);
  if (Number.isNaN(target.getTime())) return null;
  const now = new Date();
  const todayMid = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0);
  return Math.round((target.getTime() - todayMid.getTime()) / 86_400_000);
}

export function MescScheduleCard({
  shifts,
  onAddMescShift,
  onToggleMescShift,
  onDeleteMescShift,
}: MescScheduleCardProps) {
  const [dateStr, setDateStr] = useState(() => new Date().toISOString().slice(0, 10));
  const [timeStr, setTimeStr] = useState('19:00');
  const [parish, setParish] = useState('Igreja Matriz · Paróquia');
  const [role, setRole] = useState(MESC_ROLES[0]);

  const sortedShifts = [...shifts].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return `${a.dateStr} ${a.timeStr}`.localeCompare(`${b.dateStr} ${b.timeStr}`);
  });

  const nextShift = sortedShifts.find((s) => !s.completed) || null;
  const fulfilledCount = shifts.filter((s) => s.completed).length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dateStr) return;
    onAddMescShift({
      title: role,
      detail: parish.trim() || 'Comunidade / Paróquia',
      dateStr,
      timeStr: timeStr || '19:00',
    });
  };

  return (
    <section
      className="cathedral-glass state-card p-5 sm:p-6 space-y-5"
      data-tilt-subtle="true"
    >
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#7d5d28]/35 pb-4">
        <div className="flex items-start gap-3">
          <div className="depth-layer-3 w-10 h-10 rounded-lg bg-[#16191f] border border-[#eab308]/60 flex items-center justify-center shrink-0">
            <Cross className="w-5 h-5 text-[#fde047]" aria-hidden="true" />
          </div>
          <div>
            <span className="depth-layer-1 text-xs font-epic text-[#c59b27]">
              Ministério Litúrgico · MESC
            </span>
            <h2 className="depth-layer-2 font-epic text-xl text-[#f3ead6]">
              Escalas dos Ministros da Eucaristia
            </h2>
          </div>
        </div>

        <div className="depth-layer-3 text-right">
          <div className="text-[11px] uppercase tracking-wider text-[#9e9380]">
            Serviços Prestados
          </div>
          <div className="font-mono-num text-lg font-bold text-[#fde047]">
            {fulfilledCount}
          </div>
        </div>
      </div>

      {/* Destaque automático do próximo plantão litúrgico */}
      <div className="parchment-box border-[#eab308]/60 p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 text-xs font-epic text-[#fde047]">
            <Calendar className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>Próximo Plantão Litúrgico</span>
          </div>
          {nextShift ? (
            <>
              <div className="text-base font-bold text-[#f3ead6] truncate">
                {nextShift.title} · {nextShift.detail}
              </div>
              <div className="text-xs font-mono-num text-[#dfc168]">
                {formatShortDate(nextShift.dateStr)} às {nextShift.timeStr}
                {(() => {
                  const d = getDaysUntil(nextShift.dateStr);
                  if (d === null) return '';
                  if (d === 0) return ' (Hoje)';
                  if (d === 1) return ' (Amanhã)';
                  if (d > 1) return ` (em ${d} dias)`;
                  return ` (há ${Math.abs(d)}d)`;
                })()}
              </div>
            </>
          ) : (
            <div className="text-sm text-[#a69982]">
              Nenhuma escala futura cadastrada. Registre abaixo sua próxima missa ou adoração.
            </div>
          )}
        </div>

        {nextShift && (
          <button
            type="button"
            onClick={() => onToggleMescShift(nextShift.id, 80)}
            className="rpg-btn-gold px-4 py-2 rounded text-xs font-epic flex items-center gap-1.5 cursor-pointer min-h-[40px]"
          >
            <Check className="w-4 h-4" aria-hidden="true" />
            <span>Serviço Prestado (+80 XP)</span>
          </button>
        )}
      </div>

      {/* Formulário de registro de escala MESC */}
      <form
        onSubmit={handleSubmit}
        className="parchment-box p-3.5 grid grid-cols-1 sm:grid-cols-12 gap-2.5"
      >
        <div className="sm:col-span-4">
          <label htmlFor="mesc-role" className="sr-only">
            Função litúrgica
          </label>
          <select
            id="mesc-role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full bg-[#111214] border border-[#3a3f45] focus:border-[#c59b27] focus:outline-none rounded px-3 py-2 text-sm text-white min-h-[42px]"
          >
            {MESC_ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-3">
          <label htmlFor="mesc-date" className="sr-only">
            Data da missa ou serviço
          </label>
          <input
            id="mesc-date"
            type="date"
            value={dateStr}
            onChange={(e) => setDateStr(e.target.value)}
            className="w-full bg-[#111214] border border-[#3a3f45] focus:border-[#c59b27] focus:outline-none rounded px-3 py-2 text-sm font-mono-num text-white min-h-[42px]"
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="mesc-time" className="sr-only">
            Horário da missa
          </label>
          <input
            id="mesc-time"
            type="time"
            value={timeStr}
            onChange={(e) => setTimeStr(e.target.value)}
            className="w-full bg-[#111214] border border-[#3a3f45] focus:border-[#c59b27] focus:outline-none rounded px-2.5 py-2 text-sm font-mono-num text-white min-h-[42px]"
          />
        </div>

        <div className="sm:col-span-3">
          <button
            type="submit"
            className="rpg-btn-gold w-full px-3 py-2 rounded text-xs font-epic flex items-center justify-center gap-1 cursor-pointer min-h-[42px]"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>Agendar Escala</span>
          </button>
        </div>

        <div className="sm:col-span-12">
          <label htmlFor="mesc-parish" className="sr-only">
            Comunidade ou Igreja
          </label>
          <input
            id="mesc-parish"
            type="text"
            value={parish}
            onChange={(e) => setParish(e.target.value)}
            placeholder="Comunidade / Igreja (ex: Igreja Matriz, Capela São José)"
            maxLength={180}
            className="w-full bg-[#111214] border border-[#3a3f45] focus:border-[#c59b27] focus:outline-none rounded px-3 py-2 text-xs text-white placeholder:text-[#6f7279] min-h-[38px]"
          />
        </div>
      </form>

      {/* Lista de escalas litúrgicas */}
      <div className="space-y-2">
        {sortedShifts.length === 0 ? (
          <div className="parchment-box p-4 text-center text-sm text-[#a69982]">
            Nenhuma escala MESC cadastrada no momento.
          </div>
        ) : (
          sortedShifts.map((shift) => {
            const isNext = nextShift?.id === shift.id;
            return (
              <article
                key={shift.id}
                className={`parchment-box p-3.5 flex flex-wrap items-center justify-between gap-3 ${
                  shift.completed
                    ? 'opacity-75 border-emerald-700/50'
                    : isNext
                    ? 'border-[#eab308]/80 bg-[#1c1a14]'
                    : ''
                }`}
              >
                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-sm font-semibold ${
                        shift.completed
                          ? 'line-through text-emerald-300'
                          : 'text-[#f3ead6]'
                      }`}
                    >
                      {shift.title}
                    </span>
                    {isNext && !shift.completed && (
                      <span className="text-[11px] font-epic px-2 py-0.5 rounded bg-[#c59b27]/20 border border-[#eab308]/60 text-[#fde047]">
                        Próximo Plantão
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-mono-num text-[#9e9380]">
                    {formatShortDate(shift.dateStr)} · {shift.timeStr} — {shift.detail}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => onToggleMescShift(shift.id, 80)}
                    className={`px-3 py-2 rounded text-xs font-semibold cursor-pointer min-h-[38px] border ${
                      shift.completed
                        ? 'rpg-btn-iron text-emerald-300 border-emerald-600/50'
                        : 'rpg-btn-gold'
                    }`}
                  >
                    {shift.completed ? 'Registrado' : 'Prestado (+80 XP)'}
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteMescShift(shift.id)}
                    aria-label={`Remover escala ${shift.title}`}
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
    </section>
  );
}
