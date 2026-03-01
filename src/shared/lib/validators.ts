import type { LastResult } from "./result-types";
import type { RewardState } from "./rewards";
import type { ItemStats } from "./stats";

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isRewardState(value: unknown): value is RewardState {
  if (!isRecord(value)) return false;
  const unlocked = (value as { unlocked?: unknown }).unlocked;
  if (unlocked === undefined) return true; // allow empty
  return isRecord(unlocked) && Object.values(unlocked).every((v) => typeof v === "string");
}

export function isItemStats(value: unknown): value is ItemStats {
  if (!isRecord(value)) return false;
  for (const [k, v] of Object.entries(value)) {
    if (typeof k !== "string") return false;
    if (!isRecord(v)) return false;
    const attempts = (v as { attempts?: unknown }).attempts;
    const wrong = (v as { wrong?: unknown }).wrong;
    if (typeof attempts !== "number" || typeof wrong !== "number") return false;
  }
  return true;
}


export function isLastResult(value: unknown): value is LastResult {
  if (!isRecord(value)) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === "string" &&
    typeof v.at === "string" &&
    typeof v.dan === "number" &&
    typeof v.total === "number" &&
    typeof v.correct === "number" &&
    typeof v.msTotal === "number" &&
    typeof v.perQuestionMsAvg === "number" &&
    Array.isArray(v.wrongItems)
  );
}

export function isLastResultArray(value: unknown): value is LastResult[] {
  return Array.isArray(value) && value.every(isLastResult);
}
