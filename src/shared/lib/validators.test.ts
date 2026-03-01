import { describe, expect, test } from "vitest";
import { isLastResult, isLastResultArray } from "./validators";

describe("validators", () => {
  test("isLastResult accepts minimal shape", () => {
    const obj = {
      id: "x",
      at: new Date().toISOString(),
      dan: 7,
      total: 10,
      correct: 8,
      msTotal: 1234,
      perQuestionMsAvg: 123,
      wrongItems: [],
    };
    expect(isLastResult(obj)).toBe(true);
  });

  test("isLastResultArray rejects invalid items", () => {
    expect(isLastResultArray([{} as any])).toBe(false);
  });
});
