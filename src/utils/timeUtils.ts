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
