/**
 * Computes a cumulative delay schedule (ms, relative to "now") for a batch
 * of messages given a random delay range and a maximum-messages-per-hour
 * cap. This is what keeps sending "bertahap" (staged) instead of blasting
 * everything at once, following WhatsApp best-practice guidance.
 */
export function buildDelaySchedule(count: number, minDelaySec: number, maxDelaySec: number, maxPerHour: number): number[] {
  const schedule: number[] = [];
  let cumulativeMs = 0;

  // The floor on average spacing needed to respect the per-hour cap.
  const minSpacingForRateMs = maxPerHour > 0 ? Math.ceil(3_600_000 / maxPerHour) : 0;

  for (let i = 0; i < count; i++) {
    if (i > 0) {
      const randomDelaySec = randomInt(minDelaySec, maxDelaySec);
      const randomDelayMs = randomDelaySec * 1000;
      cumulativeMs += Math.max(randomDelayMs, minSpacingForRateMs);
    }
    schedule.push(cumulativeMs);
  }

  return schedule;
}

function randomInt(min: number, max: number): number {
  const lo = Math.min(min, max);
  const hi = Math.max(min, max);
  return Math.floor(Math.random() * (hi - lo + 1)) + lo;
}

export const DELAY_PRESET_RANGES: Record<string, { min: number; max: number }> = {
  RANGE_1_5: { min: 1, max: 5 },
  RANGE_5_10: { min: 5, max: 10 },
  RANGE_10_20: { min: 10, max: 20 },
  RANGE_20_45: { min: 20, max: 45 },
  RANGE_45_90: { min: 45, max: 90 },
};
