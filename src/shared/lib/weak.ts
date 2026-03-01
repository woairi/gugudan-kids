import type { ItemStats } from "./stats";

export const MIN_ATTEMPTS_FOR_WEAK = 2;
export const UNSEEN_MIX_COUNT = 2;

export function pickWeakRights(opts: {
  maxRight: number;
  total: number;
  stats: ItemStats;
  dan: number;
}): number[] {
  const { maxRight, total, stats, dan } = opts;

  const candidates = Array.from({ length: maxRight + 1 }, (_, right) => {
    const key = `${dan}x${right}`;
    const s = stats[key as keyof ItemStats] as any;
    const wrong = (s?.wrong as number | undefined) ?? 0;
    const attempts = (s?.attempts as number | undefined) ?? 0;
    const score = attempts < MIN_ATTEMPTS_FOR_WEAK ? -1 : wrong / attempts;
    return { right, score, wrong, attempts };
  });

  candidates.sort((a, b) => {
    if (a.score === -1 && b.score !== -1) return 1;
    if (b.score === -1 && a.score !== -1) return -1;
    if (b.score !== a.score) return b.score - a.score;
    return b.wrong - a.wrong;
  });

  const picked: number[] = [];

  // 1) known-weak
  for (const c of candidates) {
    if (picked.length >= total) break;
    if (c.score === -1) break;
    picked.push(c.right);
  }

  // 2) unseen mix
  const unseen = candidates.filter((c) => c.score === -1).map((c) => c.right);
  for (const r of shuffle(unseen).slice(0, UNSEEN_MIX_COUNT)) {
    if (picked.length >= total) break;
    if (!picked.includes(r)) picked.push(r);
  }

  // 3) fill remaining
  const pool = shuffle(Array.from({ length: maxRight + 1 }, (_, i) => i));
  for (const r of pool) {
    if (picked.length >= total) break;
    if (!picked.includes(r)) picked.push(r);
  }

  return picked;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
