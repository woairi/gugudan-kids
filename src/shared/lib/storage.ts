export function safeJsonParse(value: string | null): unknown {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

type Validator<T> = (value: unknown) => value is T;

export function lsGet<T>(key: string, validate?: Validator<T>): T | null {
  if (typeof window === "undefined") return null;
  const raw = safeJsonParse(window.localStorage.getItem(key));
  if (raw == null) return null;
  if (!validate) return raw as T;
  return validate(raw) ? raw : null;
}

export function lsSet(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore quota / privacy-mode failures for MVP
  }
}
