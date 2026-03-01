import { describe, expect, test, vi, beforeEach } from "vitest";
import { bumpToday, getToday, todayKey } from "./daily";

beforeEach(() => {
  // @ts-expect-error - test env
  globalThis.localStorage?.clear?.();
});

describe("daily", () => {
  test("todayKey formats YYYY-MM-DD", () => {
    const d = new Date("2026-03-01T10:00:00Z");
    expect(todayKey(d)).toBe("2026-03-01");
  });

  test("bumpToday accumulates solved/correct", () => {
    // Freeze time for stable key
    vi.setSystemTime(new Date("2026-03-01T00:00:00Z"));

    bumpToday(10, 7);
    bumpToday(5, 5);

    const t = getToday();
    expect(t.solved).toBe(15);
    expect(t.correct).toBe(12);

    vi.useRealTimers();
  });
});
