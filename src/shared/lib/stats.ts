import { KEYS } from "./keys";
import { lsGet, lsSet } from "./storage";
import { isItemStats } from "./validators";

export type ItemKey = `${number}x${number}`;

export type ItemStat = {
  attempts: number;
  wrong: number;
};

export type ItemStats = Record<ItemKey, ItemStat>;

export const ITEM_STATS_KEY = KEYS.ITEM_STATS;

export function getItemStats(): ItemStats {
  return lsGet<ItemStats>(ITEM_STATS_KEY, isItemStats) ?? {};
}

export function bumpItemStat(key: ItemKey, isCorrect: boolean): void {
  const stats = getItemStats();
  const prev = stats[key] ?? { attempts: 0, wrong: 0 };
  const next: ItemStat = {
    attempts: prev.attempts + 1,
    wrong: prev.wrong + (isCorrect ? 0 : 1),
  };
  stats[key] = next;
  lsSet(ITEM_STATS_KEY, stats);
}
