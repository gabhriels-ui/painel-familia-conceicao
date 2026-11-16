import { useState } from 'react';
import { Award, Check, Plus, RotateCcw, Shield, Trash2 } from 'lucide-react';
import { CONCURSO_TRACKS, PM_EQUIPMENT_ITEMS } from '../data/chroniclesData';
import type { MissionEntry, VocationalState } from '../types/chronicles';

interface QuartelMissionsCardProps {
  vocational: VocationalState;
  shifts: MissionEntry[];
  onAddShift: (data: {
    title: string;
    detail: string;
    dateStr: string;
    timeStr: string;
  }) => void;
  onToggleShift: (entryId: string, xpReward: number) => void;
  onDeleteShift: (entryId: string) => void;
  onToggleEquipment: (eqKey: string) => void;
  onResetEquipment: () => void;
  onAddStudyHour: (track: 'cfo' | 'prf' | 'pf', label: string) => void;
}

const SHIFT_TYPES = [
  { label: 'Diurno (07h–19h)', defaultTime: '07:00' },
  { label: 'Noturno (19h–07h)', defaultTime: '19:00' },
  { label: 'Plantão 24h', defaultTime: '07:00' },
  { label: 'Operação / Extra', defaultTime: '08:00' },
];

function formatShortDate(dateStr: string): string {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

export function QuartelMissionsCard({
  vocational,
  shifts,
  onAddShift,
  onToggleShift,
  onDeleteShift,
  onToggleEquipment,
  onResetEquipment,
  onAddStudyHour,
}: QuartelMissionsCardProps) {
  const [shiftType, setShiftType] = useState(SHIFT_TYPES[0].label);
  const [shiftDate, setShiftDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [shiftTime, setShiftTime] = useState(SHIFT_TYPES[0].defaultTime);
  const [shiftDetail, setShiftDetail] = useState('2ª Cia / 11º BPM · Poço Verde');

  const eqReadyCount = PM_EQUIPMENT_ITEMS.filter((i) => !!vocational.pmEquipment[i.key]).length;

  const sortedShifts = [...shifts].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return `${a.dateStr} ${a.timeStr}`.localeCompare(`${b.dateStr} ${b.timeStr}`);
  });

  const nextPendingShift = sortedShifts.find((s) => !s.completed) || null;

  const handleSubmitShift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shiftDate) return;
    onAddShift({
      title: shiftType,
      detail: shiftDetail.trim() || '2ª Cia / 11º BPM · Poço Verde',
      dateStr: shiftDate,
      timeStr: shiftTime || '07:00',
    });
  };

  return (
    <section
      className="rpg-panel state-card p-5 sm:p-6 space-y-5"
      data-tilt-subtle="true"
    >
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#3a3f45] pb-4">
        <div className="flex items-start gap-3">
          <div className="depth-layer-3 w-10 h-10 rounded-lg bg-[#16191f] border border-[#eab308]/50 flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5 text-[#eab308]" aria-hidden="true" />
          </div>
          <div>
            <span className="depth-layer-1 text-xs font-epic text-[#c59b27]">
              PMSE · 2ª Cia do 11º BPM (Poço Verde)
            </span>
            <h2 className="depth-layer-2 font-epic text-xl text-[#f3ead6]">
              Quartel & Missões
            </h2>
          </div>
        </div>

        <div className="depth-layer-3 text-right">
          <div className="text-[11px] uppercase tracking-wider text-[#9e9380]">
            Apronto Tático
          </div>
          <div className="font-mono-num text-lg font-bold text-[#fde047]">
            {eqReadyCount} / {PM_EQUIPMENT_ITEMS.length}
          </div>
        </div>
      </div>

      {/* Destaque do Próximo Plantão */}
      <div className="parchment-box p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="text-xs font-epic text-[#c59b27]">
            Próximo Plantão Escalado
          </div>
          {nextPendingShift ? (
            <>
              <div className="text-sm sm:text-base font-bold text-[#f3ead6]">
                {nextPendingShift.title}
              </div>
              <div className="text-xs font-mono-num text-[#a69982]">
                {formatShortDate(nextPendingShift.dateStr)} · {nextPendingShift.timeStr} —{' '}
                {nextPendingShift.detail}
              </div>
            </>
          ) : (
            <div className="text-sm text-[#a69982]">
              Nenhum plantão pendente registrado na escala da 2ª Cia.
            </div>
          )}
        </div>
        {nextPendingShift && (
          <button
            type="button"
            onClick={() => onToggleShift(nextPendingShift.id, 100)}
            className="rpg-btn-gold px-3.5 py-2 rounded text-xs font-epic cursor-pointer min-h-[40px]"
          >
            Cumprir Plantão (+100 XP)
          </button>
        )}
      </div>

      {/* Escalas de Serviço */}
      <div className="space-y-3">
        <h3 className="font-epic text-sm text-[#f3ead6]">
          Escala de Plantões · 2ª Cia / 11º BPM
        </h3>

        <form
          onSubmit={handleSubmitShift}
          className="parchment-box p-3.5 grid grid-cols-1 sm:grid-cols-12 gap-2.5"
        >
          <div className="sm:col-span-4">
            <label htmlFor="pm-shift-type" className="sr-only">
              Tipo de escala
            </label>
            <select
              id="pm-shift-type"
              value={shiftType}
              onChange={(e) => {
                const chosen = SHIFT_TYPES.find((t) => t.label === e.target.value);
                setShiftType(e.target.value);
                if (chosen) setShiftTime(chosen.defaultTime);
              }}
              className="w-full bg-[#111214] border border-[#3a3f45] focus:border-[#c59b27] focus:outline-none rounded px-3 py-2 text-sm text-white min-h-[42px]"
            >
              {SHIFT_TYPES.map((t) => (
                <option key={t.label} value={t.label}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-3">
            <label htmlFor="pm-shift-date" className="sr-only">
              Data do plantão
            </label>
            <input
              id="pm-shift-date"
              type="date"
              value={shiftDate}
              onChange={(e) => setShiftDate(e.target.value)}
              className="w-full bg-[#111214] border border-[#3a3f45] focus:border-[#c59b27] focus:outline-none rounded px-3 py-2 text-sm font-mono-num text-white min-h-[42px]"
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="pm-shift-time" className="sr-only">
              Hora de início
            </label>
            <input
              id="pm-shift-time"
              type="time"
              value={shiftTime}
              onChange={(e) => setShiftTime(e.target.value)}
              className="w-full bg-[#111214] border border-[#3a3f45] focus:border-[#c59b27] focus:outline-none rounded px-2.5 py-2 text-sm font-mono-num text-white min-h-[42px]"
            />
          </div>
          <div className="sm:col-span-3">
            <button
              type="submit"
              className="rpg-btn-gold w-full px-3 py-2 rounded text-xs font-epic flex items-center justify-center gap-1 cursor-pointer min-h-[42px]"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              <span>Escalar</span>
            </button>
          </div>
          <div className="sm:col-span-12">
            <label htmlFor="pm-shift-detail" className="sr-only">
              Posto ou Viatura
            </label>
            <input
              id="pm-shift-detail"
              type="text"
              value={shiftDetail}
              onChange={(e) => setShiftDetail(e.target.value)}
              placeholder="Posto, VTR ou Setor em Poço Verde"
              maxLength={180}
              className="w-full bg-[#111214] border border-[#3a3f45] focus:border-[#c59b27] focus:outline-none rounded px-3 py-2 text-xs text-white placeholder:text-[#6f7279] min-h-[38px]"
            />
          </div>
        </form>

        {sortedShifts.length > 0 && (
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {sortedShifts.map((shift) => (
              <div
                key={shift.id}
                className={`parchment-box p-3 flex flex-wrap items-center justify-between gap-2.5 ${
                  shift.completed ? 'opacity-70 border-emerald-700/50' : ''
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div
                    className={`text-sm font-semibold ${
                      shift.completed
                        ? 'line-through text-emerald-300'
                        : 'text-[#f3ead6]'
                    }`}
                  >
                    {shift.title}
                  </div>
                  <div className="text-xs font-mono-num text-[#9e9380]">
                    {formatShortDate(shift.dateStr)} · {shift.timeStr} — {shift.detail}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => onToggleShift(shift.id, 100)}
                    className={`px-2.5 py-1.5 rounded text-xs font-semibold cursor-pointer min-h-[36px] border ${
                      shift.completed
                        ? 'rpg-btn-iron text-emerald-300 border-emerald-600/50'
                        : 'rpg-btn-gold'
                    }`}
                  >
                    {shift.completed ? 'Cumprido' : 'Cumprir (+100 XP)'}
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteShift(shift.id)}
                    aria-label={`Excluir escala ${shift.title}`}
                    className="text-[#848890] hover:text-red-400 p-1.5 rounded cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Checklist de Equipamentos Táticos */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-epic text-sm text-[#f3ead6]">
            Checklist de Equipamentos Operacionais
          </h3>
          {eqReadyCount > 0 && (
            <button
              type="button"
              onClick={onResetEquipment}
              className="rpg-btn-iron px-2.5 py-1.5 rounded text-xs font-semibold flex items-center gap-1 cursor-pointer min-h-[34px]"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Novo Serviço</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {PM_EQUIPMENT_ITEMS.map((item) => {
            const checked = !!vocational.pmEquipment[item.key];
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onToggleEquipment(item.key)}
                aria-pressed={checked}
                className={`parchment-box p-3 flex items-center justify-between gap-2.5 text-left cursor-pointer min-h-[54px] transition-colors ${
                  checked
                    ? 'border-emerald-600/60 bg-emerald-950/20'
                    : 'hover:border-[#eab308]/70'
                }`}
              >
                <div className="min-w-0">
                  <div
                    className={`text-xs sm:text-sm font-semibold ${
                      checked ? 'text-emerald-300' : 'text-[#efe3c8]'
                    }`}
                  >
                    {item.title}
                  </div>
                  <div className="text-[11px] text-[#9e9380] leading-snug">
                    {item.detail}
                  </div>
                </div>
                <span
                  className={`w-6 h-6 rounded flex items-center justify-center shrink-0 border ${
                    checked
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

      {/* Trilhas de Concursos de Alta Patente */}
      <div className="space-y-3 pt-1 border-t border-[#3a3f45]">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-[#eab308]" aria-hidden="true" />
          <h3 className="font-epic text-sm text-[#f3ead6]">
            Metas de Estudo · Alta Patente (CFO PMSE · PRF · PF)
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {CONCURSO_TRACKS.map((track) => {
            const hours = vocational.studyHours[track.key] || 0;
            const pct = Math.min(100, Math.round((hours / track.targetHours) * 100));
            return (
              <div key={track.key} className="parchment-box p-3.5 space-y-2.5 flex flex-col justify-between">
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-epic text-sm text-[#fde047]">{track.name}</span>
                    <span className="font-mono-num text-xs font-bold text-[#f3ead6]">
                      {hours}h / {track.targetHours}h
                    </span>
                  </div>
                  <p className="text-[11px] text-[#9e9380] leading-snug">
                    {track.subtitle}
                  </p>
                </div>

                <div className="space-y-2">
                  <div
                    className="w-full h-2 bg-[#111214] rounded-sm overflow-hidden border border-[#3a3f45]"
                    role="progressbar"
                    aria-valuenow={pct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`Horas estudadas para ${track.name}`}
                  >
                    <div
                      className="h-full bg-gradient-to-r from-[#b45309] via-[#eab308] to-[#10b981]"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => onAddStudyHour(track.key, track.name)}
                    className="rpg-btn-gold w-full py-2 rounded text-xs font-epic cursor-pointer min-h-[38px]"
                  >
                    +1h Estudo (+60 XP)
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
