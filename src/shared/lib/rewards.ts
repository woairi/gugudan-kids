import { lsGet, lsSet } from "./storage";

export type BadgeId =
  | "first-quiz"
  | "perfect-10"
  | "dan-0"
  | "dan-1"
  | "dan-2"
  | "dan-3"
  | "dan-4"
  | "dan-5"
  | "dan-6"
  | "dan-7"
  | "dan-8"
  | "dan-9";

export type Badge = {
  id: BadgeId;
  title: string;
  desc: string;
  emoji: string;
};

export const BADGES: Badge[] = [
  { id: "first-quiz", title: "첫 퀴즈", desc: "처음으로 퀴즈를 끝냈어요!", emoji: "🎉" },
  { id: "perfect-10", title: "10문제 만점", desc: "10문제를 모두 맞혔어요!", emoji: "🏆" },
  { id: "dan-0", title: "0단 마스터", desc: "0단 퀴즈를 끝냈어요!", emoji: "🫧" },
  { id: "dan-1", title: "1단 마스터", desc: "1단 퀴즈를 끝냈어요!", emoji: "🌱" },
  { id: "dan-2", title: "2단 마스터", desc: "2단 퀴즈를 끝냈어요!", emoji: "🐣" },
  { id: "dan-3", title: "3단 마스터", desc: "3단 퀴즈를 끝냈어요!", emoji: "🐥" },
  { id: "dan-4", title: "4단 마스터", desc: "4단 퀴즈를 끝냈어요!", emoji: "🦊" },
  { id: "dan-5", title: "5단 마스터", desc: "5단 퀴즈를 끝냈어요!", emoji: "🐻" },
  { id: "dan-6", title: "6단 마스터", desc: "6단 퀴즈를 끝냈어요!", emoji: "🐼" },
  { id: "dan-7", title: "7단 마스터", desc: "7단 퀴즈를 끝냈어요!", emoji: "🦁" },
  { id: "dan-8", title: "8단 마스터", desc: "8단 퀴즈를 끝냈어요!", emoji: "🐯" },
  { id: "dan-9", title: "9단 마스터", desc: "9단 퀴즈를 끝냈어요!", emoji: "🐉" },
];

export type RewardState = {
  unlocked: Partial<Record<BadgeId, string>>; // ISO timestamp
};

export const REWARDS_KEY = "gugudan.rewards.v1";

export function getRewards(): RewardState {
  return lsGet<RewardState>(REWARDS_KEY) ?? { unlocked: {} };
}

export function unlockBadge(id: BadgeId, atIso: string): boolean {
  const state = getRewards();
  if (state.unlocked[id]) return false;
  state.unlocked[id] = atIso;
  lsSet(REWARDS_KEY, state);
  return true;
}
