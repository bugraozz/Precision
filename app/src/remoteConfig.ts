type Runtime = {
  process?: {
    env?: Record<string, string | undefined>;
  };
};

export type RewardedAdsConfig = {
  enabled: boolean;
  cooldownMs: number;
  maxPerSession: number;
};

function parseBoolean(input: string | undefined, fallback: boolean): boolean {
  if (!input) {
    return fallback;
  }
  const normalized = input.trim().toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "yes";
}

function parseNumber(input: string | undefined, fallback: number): number {
  const value = Number(input);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

export function getRewardedAdsConfig(): RewardedAdsConfig {
  const runtime = globalThis as unknown as Runtime;
  const env = runtime.process?.env || {};

  return {
    enabled: parseBoolean(env.EXPO_PUBLIC_FEATURE_REWARDED_ADS, false),
    cooldownMs: parseNumber(env.EXPO_PUBLIC_REWARDED_AD_COOLDOWN_MS, 90_000),
    maxPerSession: Math.floor(parseNumber(env.EXPO_PUBLIC_REWARDED_AD_MAX_PER_SESSION, 3))
  };
}
