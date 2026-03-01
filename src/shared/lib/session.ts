import { KEYS } from "./keys";
import { lsGet, lsSet } from "./storage";
import { isRecord } from "./validators";

export type QuizSession = {
  id: string;
  dan: number;
  mode: "dan" | "weak";
  total: number;
  index: number;
  correct: number;
  // store only the rights in order to rebuild questions deterministically
  rights: number[];
  wrongItems: Array<{ dan: number; right: number; answer: number; picked: number }>;
  startedAt: number;
};

export const SESSION_KEY = KEYS.ACTIVE_SESSION;
export const SESSION_MAX_AGE_MS = 24 * 60 * 60 * 1000;

function isNumberArray(v: unknown): v is number[] {
  return Array.isArray(v) && v.every((x) => typeof x === "number");
}

export function isQuizSession(value: unknown): value is QuizSession {
  if (!isRecord(value)) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === "string" &&
    typeof v.dan === "number" &&
    (v.mode === "dan" || v.mode === "weak") &&
    typeof v.total === "number" &&
    typeof v.index === "number" &&
    typeof v.correct === "number" &&
    isNumberArray(v.rights) &&
    Array.isArray(v.wrongItems) &&
    typeof v.startedAt === "number"
  );
}

export function getActiveSession(): QuizSession | null {
  const s = lsGet<QuizSession>(SESSION_KEY, isQuizSession);
  if (!s) return null;
  if (Date.now() - s.startedAt > SESSION_MAX_AGE_MS) return null;
  return s;
}

export function setActiveSession(session: QuizSession) {
  lsSet(SESSION_KEY, session);
}

export function clearActiveSession() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(SESSION_KEY);
  } catch {
    // ignore
  }
}
