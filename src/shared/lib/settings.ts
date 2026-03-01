import { KEYS } from "./keys";
import { lsGet, lsSet } from "./storage";
import { isRecord } from "./validators";

export type Settings = {
  soundOn: boolean;
  quizCount: 10 | 20;
  maxRight: 9 | 12;
};

export const SETTINGS_KEY = KEYS.SETTINGS;

function isSettings(value: unknown): value is Settings {
  if (!isRecord(value)) return false;
  const v = value as Record<string, unknown>;
  const soundOn = v.soundOn;
  const quizCount = v.quizCount;
  return (
    typeof soundOn === "boolean" &&
    (quizCount === 10 || quizCount === 20) && (v.maxRight === 9 || v.maxRight === 12)
  );
}

export function getSettings(): Settings {
  return lsGet<Settings>(SETTINGS_KEY, isSettings) ?? { soundOn: false, quizCount: 10, maxRight: 9 };
}

export function setSettings(next: Settings) {
  lsSet(SETTINGS_KEY, next);
}
