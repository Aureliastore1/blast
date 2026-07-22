import { buildDelaySchedule } from "@/modules/queue/scheduler";

describe("buildDelaySchedule", () => {
  it("returns a schedule starting at 0", () => {
    const schedule = buildDelaySchedule(5, 5, 10, 120);
    expect(schedule[0]).toBe(0);
    expect(schedule).toHaveLength(5);
  });

  it("produces a strictly non-decreasing cumulative schedule", () => {
    const schedule = buildDelaySchedule(20, 1, 5, 120);
    for (let i = 1; i < schedule.length; i++) {
      expect(schedule[i]).toBeGreaterThanOrEqual(schedule[i - 1]);
    }
  });

  it("respects the per-hour cap by enforcing minimum spacing", () => {
    // maxPerHour=60 -> minimum spacing is 60s between messages even with a 1-2s random range
    const schedule = buildDelaySchedule(3, 1, 2, 60);
    const spacing = schedule[1] - schedule[0];
    expect(spacing).toBeGreaterThanOrEqual(60_000);
  });
});
