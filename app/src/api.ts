import { RoundInput, ScoreResult } from "../../src/core/types";

export type RoundSubmitPayload = RoundInput & {
  levelId?: string;
  userId: string;
  sessionId: string;
  gameMode: "standard" | "speed";
  streakBonus?: number;
  deviceInfo?: {
    os: "ios" | "android" | "web" | "unknown";
    version: string;
    model: string;
  };
  network?: "wifi" | "cellular" | "offline" | "unknown";
};

export type RoundSubmitResponse = {
  accepted: boolean;
  reasons?: string[];
  accuracyPercent?: number;
  stars?: 0 | 1 | 2 | 3;
  xpGained?: number;
  eventId?: string;
};

export type QuestClaimPayload = {
  userId: string;
  boardType: "daily" | "weekly";
  questId: string;
};

export type QuestClaimResponse = {
  accepted: boolean;
  reason?: string;
  rewardCoins?: number;
  coinsBalance?: number;
  boardType?: "daily" | "weekly";
  questId?: string;
};

export type SeasonClaimPayload = {
  userId: string;
  seasonId: string;
  tier: number;
};

export type SeasonClaimResponse = {
  accepted: boolean;
  reason?: string;
  seasonId?: string;
  tier?: number;
  rewardCoins?: number;
  coinsBalance?: number;
  unlockedTier?: number;
};

export type PurchaseVerifyPayload = {
  userId: string;
  productId: string;
  platform: "ios" | "android";
  purchaseToken?: string;
  receiptData?: string;
  sandbox?: boolean;
};

export type PurchaseVerifyResponse = {
  accepted: boolean;
  reason?: string;
  entitlement?: {
    premiumActive: boolean;
    adsDisabled: boolean;
    dailyEnergyMultiplier: number;
    premiumCosmeticSetId?: string | null;
    monthlySpecialItemId?: string | null;
    monthlySpecialItemMonthKey?: string | null;
    unlockedCosmeticItems?: string[];
    updatedAt?: number;
  };
};

export type EntitlementSyncPayload = {
  userId: string;
};

export type EntitlementSyncResponse = {
  accepted: boolean;
  entitlement?: {
    premiumActive: boolean;
    adsDisabled: boolean;
    dailyEnergyMultiplier: number;
    premiumCosmeticSetId?: string | null;
    monthlySpecialItemId?: string | null;
    monthlySpecialItemMonthKey?: string | null;
    unlockedCosmeticItems?: string[];
    updatedAt?: number;
  };
};

export async function submitRound(payload: RoundSubmitPayload): Promise<RoundSubmitResponse> {
  const runtime = globalThis as unknown as {
    process?: {
      env?: Record<string, string | undefined>;
    };
  };
  const endpoint = runtime.process?.env?.EXPO_PUBLIC_ROUND_SUBMIT_URL;
  if (!endpoint) {
    return {
      accepted: false,
      reasons: ["missing_endpoint"]
    };
  }

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const body = (await response.json()) as RoundSubmitResponse;
    if (!response.ok) {
      return {
        accepted: false,
        reasons: body.reasons?.length ? body.reasons : ["http_error"]
      };
    }

    return body;
  } catch {
    return {
      accepted: false,
      reasons: ["network_error"]
    };
  }
}

export function toRoundSubmitPayload(base: {
  round: RoundInput;
  userId: string;
  sessionId: string;
  gameMode: "standard" | "speed";
}): RoundSubmitPayload {
  return {
    ...base.round,
    userId: base.userId,
    sessionId: base.sessionId,
    gameMode: base.gameMode,
    streakBonus: 0,
    deviceInfo: {
      os: "unknown",
      version: "unknown",
      model: "unknown"
    },
    network: "unknown"
  };
}

export function fromScoreResult(score: ScoreResult) {
  return `Accuracy ${score.accuracyPercent}% | Stars ${score.stars} | XP ${score.xpGained}`;
}

export async function claimQuestReward(payload: QuestClaimPayload): Promise<QuestClaimResponse> {
  const runtime = globalThis as unknown as {
    process?: {
      env?: Record<string, string | undefined>;
    };
  };
  const endpoint = runtime.process?.env?.EXPO_PUBLIC_QUEST_CLAIM_URL;
  if (!endpoint) {
    return {
      accepted: false,
      reason: "missing_endpoint"
    };
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  return (await response.json()) as QuestClaimResponse;
}

export async function claimSeasonReward(payload: SeasonClaimPayload): Promise<SeasonClaimResponse> {
  const runtime = globalThis as unknown as {
    process?: {
      env?: Record<string, string | undefined>;
    };
  };
  const endpoint = runtime.process?.env?.EXPO_PUBLIC_SEASON_CLAIM_URL;
  if (!endpoint) {
    return {
      accepted: false,
      reason: "missing_endpoint"
    };
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  return (await response.json()) as SeasonClaimResponse;
}

export async function purchaseVerify(payload: PurchaseVerifyPayload): Promise<PurchaseVerifyResponse> {
  const runtime = globalThis as unknown as {
    process?: {
      env?: Record<string, string | undefined>;
    };
  };
  const endpoint = runtime.process?.env?.EXPO_PUBLIC_PURCHASE_VERIFY_URL;
  if (!endpoint) {
    return {
      accepted: false,
      reason: "missing_endpoint"
    };
  }

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    return (await response.json()) as PurchaseVerifyResponse;
  } catch {
    return {
      accepted: false,
      reason: "network_error"
    };
  }
}

export async function entitlementSync(payload: EntitlementSyncPayload): Promise<EntitlementSyncResponse> {
  const runtime = globalThis as unknown as {
    process?: {
      env?: Record<string, string | undefined>;
    };
  };
  const endpoint = runtime.process?.env?.EXPO_PUBLIC_ENTITLEMENT_SYNC_URL;
  if (!endpoint) {
    return {
      accepted: false
    };
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  return (await response.json()) as EntitlementSyncResponse;
}

// ─── Leaderboard ───────────────────────────────────────────────────────────────

export type LeaderboardEntry = {
  id?: string;
  userId: string;
  displayName: string;
  targetShape: string;
  accuracyPercent: number;
  stars: number;
  xpGained: number;
  difficulty?: string;
  submittedAt?: unknown;
};

export type LeaderboardGetPayload = {
  shape?: string;
  limit?: number;
};

export type LeaderboardGetResponse = {
  entries: LeaderboardEntry[];
};

export async function leaderboardGet(payload: LeaderboardGetPayload = {}): Promise<LeaderboardGetResponse> {
  const runtime = globalThis as unknown as {
    process?: {
      env?: Record<string, string | undefined>;
    };
  };
  const endpoint = runtime.process?.env?.EXPO_PUBLIC_LEADERBOARD_GET_URL;
  if (!endpoint) {
    return { entries: [] };
  }

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    return (await response.json()) as LeaderboardGetResponse;
  } catch {
    return { entries: [] };
  }
}

// ─── Challenges ────────────────────────────────────────────────────────────────

export const CHALLENGE_SHAPES = ["circle", "square", "triangle", "diamond", "pentagon", "hexagon", "heart", "star"] as const;

export type ChallengeEntry = {
  userId: string;
  displayName: string;
  targetShape: string;
  accuracyPercent: number;
  stars: number;
  xpGained: number;
  submittedAt?: unknown;
};

export type ChallengeGetPayload = {
  shape: string;
  limit?: number;
};

export type ChallengeGetResponse = {
  targetShape: string;
  entries: ChallengeEntry[];
};

export type ChallengeSubmitPayload = {
  userId: string;
  displayName?: string;
  shape: string;
  points: { x: number; y: number }[];
};

export type ChallengeSubmitResponse = {
  accepted: boolean;
  accuracyPercent?: number;
  stars?: number;
  xpGained?: number;
  targetShape?: string;
};

export async function challengeGet(payload: ChallengeGetPayload): Promise<ChallengeGetResponse> {
  const runtime = globalThis as unknown as {
    process?: {
      env?: Record<string, string | undefined>;
    };
  };

  const localFallback: ChallengeGetResponse = { targetShape: payload.shape, entries: [] };

  const endpoint = runtime.process?.env?.EXPO_PUBLIC_CHALLENGE_GET_URL;
  if (!endpoint) {
    return localFallback;
  }

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shape: payload.shape, limit: payload.limit })
    });
    const data = (await response.json()) as ChallengeGetResponse;
    if (!data.targetShape) {
      return localFallback;
    }
    return data;
  } catch {
    return localFallback;
  }
}

export async function challengeSubmit(payload: ChallengeSubmitPayload): Promise<ChallengeSubmitResponse> {
  const runtime = globalThis as unknown as {
    process?: {
      env?: Record<string, string | undefined>;
    };
  };
  const endpoint = runtime.process?.env?.EXPO_PUBLIC_CHALLENGE_SUBMIT_URL;
  if (!endpoint) {
    return { accepted: false };
  }

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    return (await response.json()) as ChallengeSubmitResponse;
  } catch {
    return { accepted: false };
  }
}
