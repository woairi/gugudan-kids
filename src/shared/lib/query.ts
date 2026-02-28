export function getQueryInt(key: string): number | null {
  if (typeof window === "undefined") return null;
  const url = new URL(window.location.href);
  const v = url.searchParams.get(key);
  if (v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}
