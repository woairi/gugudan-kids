import { lsGet, lsSet } from "./storage";
import { isRecord } from "./validators";

export type Settings = {
  soundOn: boolean;
  quizCount: 10 | 20;
};

export const SETTINGS_KEY = "gugudan.settings.v1";

function isSettings(value: unknown): value is Settings {
  if (!isRecord(value)) return false;
  const v = value as Record<string, unknown>;
  const soundOn = v.soundOn;
  const quizCount = v.quizCount;
  return (
    typeof soundOn === "boolean" &&
    (quizCount === 10 || quizCount === 20)
  );
}

export function getSettings(): Settings {
  return lsGet<Settings>(SETTINGS_KEY, isSettings) ?? { soundOn: false, quizCount: 10 };
}

export function setSettings(next: Settings) {
  lsSet(SETTINGS_KEY, next);
}
