function buildRoundCompletedEvent(payload) {
  return {
    schemaVersion: "1.0",
    eventType: "round_completed",
    userId: payload.userId,
    timestamp: new Date().toISOString(),
    sessionId: payload.sessionId,
    gameMode: payload.gameMode,
    arenaDifficulty: payload.difficulty,
    shapeName: payload.targetShape,
    accuracy: payload.accuracyPercent,
    timeSpentMs: payload.endedAtMs - payload.startedAtMs,
    stars: payload.stars,
    xpEarned: payload.xpGained,
    deviceInfo: payload.deviceInfo || {
      os: "unknown",
      version: "unknown",
      model: "unknown"
    },
    network: payload.network || "unknown"
  };
}

const SUPPORTED_SCHEMA_VERSION = "1.0";

const REQUIRED_FIELDS_BY_TYPE = {
  session_started: ["deviceInfo", "network"],
  session_ended: ["durationMs"],
  round_completed: [
    "gameMode",
    "arenaDifficulty",
    "shapeName",
    "accuracy",
    "timeSpentMs",
    "stars",
    "xpEarned",
    "deviceInfo",
    "network"
  ],
  ad_shown: ["placement"],
  premium_purchased: ["productId"],
  perf_marker: ["metricName", "value", "unit"],
  crash_report: ["message", "fatal"]
};

function validateAnalyticsEvent(event) {
  const missing = [];
  if (!event || typeof event !== "object") {
    return { valid: false, reasons: ["invalid_event"], missingFields: [] };
  }

  const requiredBase = ["schemaVersion", "eventType", "userId", "timestamp", "sessionId"];
  for (const field of requiredBase) {
    if (event[field] === undefined || event[field] === null || event[field] === "") {
      missing.push(field);
    }
  }

  if (missing.length > 0) {
    return { valid: false, reasons: ["missing_fields"], missingFields: missing };
  }

  if (event.schemaVersion !== SUPPORTED_SCHEMA_VERSION) {
    return { valid: false, reasons: ["unsupported_schema_version"], missingFields: [] };
  }

  const requiredForType = REQUIRED_FIELDS_BY_TYPE[event.eventType];
  if (!requiredForType) {
    return { valid: false, reasons: ["unknown_event_type"], missingFields: [] };
  }

  for (const field of requiredForType) {
    if (event[field] === undefined || event[field] === null || event[field] === "") {
      missing.push(field);
    }
  }

  if (missing.length > 0) {
    return { valid: false, reasons: ["missing_fields"], missingFields: missing };
  }

  return { valid: true, reasons: [], missingFields: [] };
}

module.exports = {
  SUPPORTED_SCHEMA_VERSION,
  buildRoundCompletedEvent,
  validateAnalyticsEvent
};
