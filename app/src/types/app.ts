export type RoundFeedback = {
  source: "local" | "server";
  accuracyPercent: number;
  meanDeviation: number;
  stars: number;
  xpGained: number;
};

export type HomePanelKey = "overview" | "daily" | "weekly" | "collection" | "challenge" | "leaderboard" | "duel";

export type ClaimRewardNormalized = {
  accepted: boolean;
  reason?: string;
  rewardCoins: number;
  coinsBalance?: number;
};
