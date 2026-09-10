/**
 * Time and 15-minute snapping utilities for Roamio 24-hour timeline
 */

export function timeToMinutes(timeStr: string): number {
  if (!timeStr || !timeStr.includes(':')) return 540; // default 09:00
  const [hoursStr, minutesStr] = timeStr.split(':');
  const hours = parseInt(hoursStr, 10) || 0;
  const minutes = parseInt(minutesStr, 10) || 0;
  return hours * 60 + minutes;
}

export function minutesToTime(totalMinutes: number): string {
  // Clamp between 0 and 1439 (23:59)
  const clamped = Math.max(0, Math.min(1439, totalMinutes));
  const hours = Math.floor(clamped / 60);
  const minutes = clamped % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

export function snapMinutesTo15(minutes: number): number {
  return Math.round(minutes / 15) * 15;
}

export function snapTimeTo15(timeStr: string): string {
  const mins = timeToMinutes(timeStr);
  const snapped = snapMinutesTo15(mins);
  return minutesToTime(snapped);
}

export function formatDuration(mins: number): string {
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  const remaining = mins % 60;
  if (remaining === 0) return `${hours}h`;
  return `${hours}h ${remaining}m`;
}

export function formatTime12(timeStr: string): string {
  if (!timeStr || !timeStr.includes(':')) return timeStr || '09:00 AM';
  const [hoursStr, minutesStr] = timeStr.split(':');
  const hours = parseInt(hoursStr, 10) || 0;
  const minutes = parseInt(minutesStr, 10) || 0;
  const period = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${hours12.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${period}`;
}

export function formatTimeRange(startStr: string, endStr: string): string {
  return `${formatTime12(startStr)} – ${formatTime12(endStr)}`;
}

export function getTimeSlotOptions(intervalMins = 15): { value: string; label: string }[] {
  const options: { value: string; label: string }[] = [];
  for (let m = 0; m < 1440; m += intervalMins) {
    const time24 = minutesToTime(m);
    const time12 = formatTime12(time24);
    options.push({ value: time24, label: `${time12} (${time24})` });
  }
  return options;
}

export function generateTransportEstimate(startMins: number, endMins: number): {
  mode: 'walk' | 'subway' | 'taxi' | 'bus';
  duration_mins: number;
  detail: string;
} {
  const gap = Math.max(0, startMins - endMins);
  if (gap <= 20) {
    return {
      mode: 'walk',
      duration_mins: Math.min(15, Math.max(5, gap)),
      detail: 'Scenic 10-min stroll'
    };
  } else if (gap <= 45) {
    return {
      mode: 'subway',
      duration_mins: 15,
      detail: 'Metro Line / Direct Tram'
    };
  } else {
    return {
      mode: 'taxi',
      duration_mins: 20,
      detail: 'Taxi / Rideshare transfer'
    };
  }
}
