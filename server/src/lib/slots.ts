// Opening hours used for booking (local time of the customer's browser).
export const OPEN_HOUR = 9;
export const CLOSE_HOUR = 17;
export const SLOT_STEP_MINUTES = 30;

interface Busy {
  start: Date;
  end: Date;
}

/**
 * Start times (ISO strings) between opening and closing time on the day that
 * starts at `dayStartMs`, where a service of `durationMinutes` fits without
 * overlapping any existing booking and is still in the future.
 */
export function openSlots(dayStartMs: number, durationMinutes: number, busy: Busy[], now: Date): string[] {
  const slots: string[] = [];
  const duration = durationMinutes * 60_000;
  const close = dayStartMs + CLOSE_HOUR * 3600_000;
  for (let t = dayStartMs + OPEN_HOUR * 3600_000; t + duration <= close; t += SLOT_STEP_MINUTES * 60_000) {
    if (t <= now.getTime()) continue;
    const clash = busy.some((b) => t < b.end.getTime() && t + duration > b.start.getTime());
    if (!clash) slots.push(new Date(t).toISOString());
  }
  return slots;
}
