import type { ClaimRewardNormalized } from "../types/app";
import { ProgressionState } from "../progression";

export function normalizeClaimRewardResponse(raw: {
  accepted?: boolean;
  reason?: string;
  error?: string;
  rewardCoins?: number;
  rewardGems?: number;
  coinsBalance?: number;
}): ClaimRewardNormalized {
  const rewardCoins = Number.isFinite(raw.rewardCoins) ? Number(raw.rewardCoins) : 0;
  const rewardGems = Number.isFinite(raw.rewardGems) ? Number(raw.rewardGems) : 0;
  const coinsBalance = Number.isFinite(raw.coinsBalance) ? Number(raw.coinsBalance) : undefined;

  return {
    accepted: Boolean(raw.accepted),
    reason: typeof raw.reason === "string" ? raw.reason : typeof raw.error === "string" ? raw.error : undefined,
    rewardCoins: Math.max(0, rewardCoins),
    rewardGems: Math.max(0, rewardGems),
    coinsBalance,
  };
}

export function getLocalQuestReward(
  state: ProgressionState,
  boardType: "daily" | "weekly",
  questId: string
): { rewardCoins: number; rewardGems: number } | null {
  const source =
    boardType === "daily"
      ? state.dailyBoard.quests
      : [...state.weeklyLadder.tiers, state.weeklyLadder.catchUpQuest];
  const quest = source.find((entry) => entry.id === questId);
  if (!quest) {
    return null;
  }

  return {
    rewardCoins: Math.max(0, Number(quest.rewardCoins || 0)),
    rewardGems: Math.max(0, Number(quest.rewardGems || 0))
  };
}

export function isQuestClaimableLocally(
  state: ProgressionState,
  boardType: "daily" | "weekly",
  questId: string
): boolean {
  const source =
    boardType === "daily"
      ? state.dailyBoard.quests
      : [...state.weeklyLadder.tiers, state.weeklyLadder.catchUpQuest];
  const quest = source.find((entry) => entry.id === questId);
  if (!quest) {
    return false;
  }

  return quest.value >= quest.target && !quest.claimed;
}

export function isQuestAlreadyClaimedLocally(
  state: ProgressionState,
  boardType: "daily" | "weekly",
  questId: string
): boolean {
  const source =
    boardType === "daily"
      ? state.dailyBoard.quests
      : [...state.weeklyLadder.tiers, state.weeklyLadder.catchUpQuest];
  const quest = source.find((entry) => entry.id === questId);
  return Boolean(quest?.claimed);
}
