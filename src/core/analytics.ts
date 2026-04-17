import { Difficulty } from "./types";

export type AnalyticsEventName =
  | "session_started"
  | "session_ended"
  | "round_completed"
  | "ad_shown"
  | "premium_purchased"
  | "perf_marker"
  | "crash_report";

export type DeviceInfo = {
  os: "ios" | "android" | "web" | "unknown";
  version: string;
  model: string;
};

export type AnalyticsBaseEvent = {
  schemaVersion: "1.0";
  eventType: AnalyticsEventName;
  userId: string;
  timestamp: string;
  sessionId: string;
};

export type SessionStartedEvent = AnalyticsBaseEvent & {
  eventType: "session_started";
  deviceInfo: DeviceInfo;
  network: "wifi" | "cellular" | "offline" | "unknown";
};

export type SessionEndedEvent = AnalyticsBaseEvent & {
  eventType: "session_ended";
  durationMs: number;
};

export type RoundCompletedEvent = AnalyticsBaseEvent & {
  eventType: "round_completed";
  gameMode: "standard" | "speed";
  arenaDifficulty: Difficulty;
  shapeName: string;
  accuracy: number;
  timeSpentMs: number;
  stars: 0 | 1 | 2 | 3;
  xpEarned: number;
  deviceInfo: DeviceInfo;
  network: "wifi" | "cellular" | "offline" | "unknown";
};

export type AdShownEvent = AnalyticsBaseEvent & {
  eventType: "ad_shown";
  placement: "retry_reward" | "post_round" | "other";
  rewardType: "extra_retry" | "none";
};

export type PremiumPurchasedEvent = AnalyticsBaseEvent & {
  eventType: "premium_purchased";
  productId: string;
  sandbox: boolean;
};

export type PerfMarkerEvent = AnalyticsBaseEvent & {
  eventType: "perf_marker";
  metricName: string;
  value: number;
  unit: "ms" | "count";
};

export type CrashReportEvent = AnalyticsBaseEvent & {
  eventType: "crash_report";
  message: string;
  fatal: boolean;
  stack?: string;
};

export function createRoundCompletedEvent(params: {
  userId: string;
  sessionId: string;
  gameMode: "standard" | "speed";
  arenaDifficulty: Difficulty;
  shapeName: string;
  accuracy: number;
  timeSpentMs: number;
  stars: 0 | 1 | 2 | 3;
  xpEarned: number;
  deviceInfo: DeviceInfo;
  network: "wifi" | "cellular" | "offline" | "unknown";
}): RoundCompletedEvent {
  return {
    schemaVersion: "1.0",
    eventType: "round_completed",
    userId: params.userId,
    timestamp: new Date().toISOString(),
    sessionId: params.sessionId,
    gameMode: params.gameMode,
    arenaDifficulty: params.arenaDifficulty,
    shapeName: params.shapeName,
    accuracy: Number(params.accuracy.toFixed(2)),
    timeSpentMs: params.timeSpentMs,
    stars: params.stars,
    xpEarned: params.xpEarned,
    deviceInfo: params.deviceInfo,
    network: params.network
  };
}

export function createSessionStartedEvent(params: {
  userId: string;
  sessionId: string;
  deviceInfo: DeviceInfo;
  network: "wifi" | "cellular" | "offline" | "unknown";
}): SessionStartedEvent {
  return {
    schemaVersion: "1.0",
    eventType: "session_started",
    userId: params.userId,
    timestamp: new Date().toISOString(),
    sessionId: params.sessionId,
    deviceInfo: params.deviceInfo,
    network: params.network
  };
}

export function createSessionEndedEvent(params: {
  userId: string;
  sessionId: string;
  durationMs: number;
}): SessionEndedEvent {
  return {
    schemaVersion: "1.0",
    eventType: "session_ended",
    userId: params.userId,
    timestamp: new Date().toISOString(),
    sessionId: params.sessionId,
    durationMs: Math.max(0, Math.round(params.durationMs))
  };
}

export function createAdShownEvent(params: {
  userId: string;
  sessionId: string;
  placement: "retry_reward" | "post_round" | "other";
  rewardType: "extra_retry" | "none";
}): AdShownEvent {
  return {
    schemaVersion: "1.0",
    eventType: "ad_shown",
    userId: params.userId,
    timestamp: new Date().toISOString(),
    sessionId: params.sessionId,
    placement: params.placement,
    rewardType: params.rewardType
  };
}

export function createPremiumPurchasedEvent(params: {
  userId: string;
  sessionId: string;
  productId: string;
  sandbox: boolean;
}): PremiumPurchasedEvent {
  return {
    schemaVersion: "1.0",
    eventType: "premium_purchased",
    userId: params.userId,
    timestamp: new Date().toISOString(),
    sessionId: params.sessionId,
    productId: params.productId,
    sandbox: params.sandbox
  };
}

export function createPerfMarkerEvent(params: {
  userId: string;
  sessionId: string;
  metricName: string;
  value: number;
  unit: "ms" | "count";
}): PerfMarkerEvent {
  return {
    schemaVersion: "1.0",
    eventType: "perf_marker",
    userId: params.userId,
    timestamp: new Date().toISOString(),
    sessionId: params.sessionId,
    metricName: params.metricName,
    value: Number(params.value.toFixed(2)),
    unit: params.unit
  };
}

export function createCrashReportEvent(params: {
  userId: string;
  sessionId: string;
  message: string;
  fatal: boolean;
  stack?: string;
}): CrashReportEvent {
  return {
    schemaVersion: "1.0",
    eventType: "crash_report",
    userId: params.userId,
    timestamp: new Date().toISOString(),
    sessionId: params.sessionId,
    message: params.message,
    fatal: params.fatal,
    stack: params.stack
  };
}
