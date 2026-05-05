export const SLA_HOURS_DEFAULT = 24;

export function getSlaDeadline(createdAt: Date, slaHours = SLA_HOURS_DEFAULT): Date {
  return new Date(createdAt.getTime() + slaHours * 60 * 60 * 1000);
}

export function getRemainingMs(deadline: Date, now = new Date()): number {
  return Math.max(0, deadline.getTime() - now.getTime());
}

export function formatCountdown(remainingMs: number): string {
  const totalSeconds = Math.floor(remainingMs / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export type SlaZone = 'safe' | 'warning' | 'critical' | 'breached';

export function getSlaZone(remainingMs: number): SlaZone {
  const hours = remainingMs / (1000 * 60 * 60);
  if (hours <= 0) return 'breached';
  if (hours <= 1) return 'critical';
  if (hours <= 4) return 'warning';
  return 'safe';
}
