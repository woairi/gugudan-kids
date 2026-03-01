import { describe, expect, test } from "vitest";
import { pickWeakRights } from "./weak";

describe("weak", () => {
  test("returns total unique rights within range", () => {
    const rights = pickWeakRights({
      dan: 7,
      maxRight: 12,
      total: 10,
      stats: {},
    });

    expect(rights).toHaveLength(10);
    expect(new Set(rights).size).toBe(10);
    expect(Math.min(...rights)).toBeGreaterThanOrEqual(0);
    expect(Math.max(...rights)).toBeLessThanOrEqual(12);
  });
});
