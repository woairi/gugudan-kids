import { KEYS } from "./keys";
import { lsGet, lsSet } from "./storage";
import { isRecord } from "./validators";

export type DailyStat = {
  solved: number;
  correct: number;
};

export type DailyStats = Record<string, DailyStat>; // YYYY-MM-DD

export const DAILY_KEY = KEYS.DAILY;

function isDailyStat(v: unknown): v is DailyStat {
  if (!isRecord(v)) return false;
  const o = v as Record<string, unknown>;
  return typeof o.solved === "number" && typeof o.correct === "number";
}

function isDailyStats(v: unknown): v is DailyStats {
  if (!isRecord(v)) return false;
  return Object.values(v).every(isDailyStat);
}

export function todayKey(d = new Date()): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function getDailyStats(): DailyStats {
  return lsGet<DailyStats>(DAILY_KEY, isDailyStats) ?? {};
}

export function bumpToday(solvedDelta: number, correctDelta: number) {
  const stats = getDailyStats();
  const key = todayKey();
  const prev = stats[key] ?? { solved: 0, correct: 0 };
  stats[key] = {
    solved: prev.solved + solvedDelta,
    correct: prev.correct + correctDelta,
  };
  lsSet(DAILY_KEY, stats);
}

export function getToday(): DailyStat {
  const stats = getDailyStats();
  return stats[todayKey()] ?? { solved: 0, correct: 0 };
}
