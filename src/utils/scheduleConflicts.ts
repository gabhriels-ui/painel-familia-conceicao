import type { MarriageCouple, MissionEntry } from '../types/chronicles';

export interface ScheduleConflictItem {
  shiftId: string;
  module: 'pm_shift' | 'mesc_shift';
  moduleLabel: string;
  shiftTitle: string;
  shiftDetail: string;
  dateStr: string;
  timeStr: string;
  severity: 'conflict' | 'attention';
  reason: string;
}

export function formatDateBr(dateStr: string): string {
  if (!dateStr) return 'Data a definir';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

export function parseTimeToMinutes(timeStr: string): number | null {
  if (!timeStr) return null;
  const match = /^(\d{1,2}):(\d{2})$/.exec(timeStr.trim());
  if (!match) return null;
  const hh = Number(match[1]);
  const mm = Number(match[2]);
  if (hh < 0 || hh > 23 || mm < 0 || mm > 59) return null;
  return hh * 60 + mm;
}

/**
 * Detecta choques entre um encontro pastoral de casais e os plantões da PMSE
 * ou escalas de Ministro da Eucaristia (MESC) na mesma data.
 */
export function detectCoupleScheduleConflicts(
  scheduledDate: string,
  scheduledTime: string,
  missionEntries: MissionEntry[]
): ScheduleConflictItem[] {
  if (!scheduledDate) return [];

  const coupleMinutes = parseTimeToMinutes(scheduledTime);
  const relevantShifts = missionEntries.filter(
    (entry) =>
      (entry.module === 'pm_shift' || entry.module === 'mesc_shift') &&
      entry.dateStr === scheduledDate
  );

  return relevantShifts.map((shift) => {
    const isPm = shift.module === 'pm_shift';
    const moduleLabel = isPm ? 'Plantão PMSE' : 'Escala MESC';
    const shiftMinutes = parseTimeToMinutes(shift.timeStr);

    let severity: 'conflict' | 'attention' = 'attention';
    let reason = `Mesmo dia de ${moduleLabel} (${shift.timeStr || 'horário livre'}).`;

    if (coupleMinutes === null || shiftMinutes === null) {
      severity = 'conflict';
      reason = `Mesma data de ${moduleLabel}${
        shift.timeStr ? ` às ${shift.timeStr}` : ''
      } — defina horário compatível para evitar choque.`;
    } else if (isPm) {
      // Plantão policial costuma cobrir turno de 12h+ a partir do horário de início
      const endWindow = shiftMinutes + 720;
      if (coupleMinutes >= shiftMinutes - 60 && coupleMinutes <= endWindow) {
        severity = 'conflict';
        reason = `Choque de horário com ${moduleLabel} iniciado às ${shift.timeStr}.`;
      } else {
        severity = 'attention';
        reason = `Há ${moduleLabel} nesta data às ${shift.timeStr} — confirme margem de deslocamento.`;
      }
    } else {
      // Escala MESC: janela de choque de ±120 minutos em torno do horário da celebração
      if (Math.abs(coupleMinutes - shiftMinutes) <= 120) {
        severity = 'conflict';
        reason = `Choque de horário com ${moduleLabel} às ${shift.timeStr}.`;
      } else {
        severity = 'attention';
        reason = `Há ${moduleLabel} no mesmo dia às ${shift.timeStr} — verifique intervalos.`;
      }
    }

    return {
      shiftId: shift.id,
      module: isPm ? 'pm_shift' : 'mesc_shift',
      moduleLabel,
      shiftTitle: shift.title,
      shiftDetail: shift.detail,
      dateStr: shift.dateStr,
      timeStr: shift.timeStr,
      severity,
      reason,
    };
  });
}

export function getAllCoupleConflicts(
  couples: MarriageCouple[],
  missionEntries: MissionEntry[]
): { couple: MarriageCouple; conflicts: ScheduleConflictItem[] }[] {
  const result: { couple: MarriageCouple; conflicts: ScheduleConflictItem[] }[] = [];
  for (const couple of couples) {
    if (!couple.scheduledDate) continue;
    const conflicts = detectCoupleScheduleConflicts(
      couple.scheduledDate,
      couple.scheduledTime,
      missionEntries
    );
    if (conflicts.length > 0) {
      result.push({ couple, conflicts });
    }
  }
  return result;
}
