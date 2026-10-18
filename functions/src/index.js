const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");
const {
  getScoringVersionFromEnvValue,
  minimumRequiredPoints,
  preprocessStroke,
  validateRoundPayload,
  scoreRound,
  SHAPE_TEMPLATES
} = require("../../dist/index.js");
const { buildRoundCompletedEvent, validateAnalyticsEvent } = require("./analytics");
const { verifyPurchase } = require("./purchaseProviders");

if (!admin.apps.length) {
  admin.initializeApp();
}

const firestore = admin.firestore();

const REQUIRED_FIELDS = [
  "userId",
  "sessionId",
  "gameMode",
  "targetShape",
  "points",
  "timeLimitMs",
  "startedAtMs",
  "endedAtMs",
  "difficulty"
];

const PREMIUM_DAILY_ENERGY_MULTIPLIER = 3;
const PREMIUM_COSMETIC_SET_ID = "premium-founder-set-v1";
const KNOWN_MECHANIC_TAGS = new Set(["speed", "stability", "symmetry", "memory", "none"]);
const VALID_DIFFICULTIES = new Set(["easy", "medium", "hard"]);

/* Read an optional 0..4096 canvas min-dimension hint for stroke-size checks. */
function normalizeCanvasMinDim(raw) {
  const value = Number(raw);
  if (!Number.isFinite(value)) {
    return undefined;
  }
  if (value < 120 || value > 4096) {
    return undefined;
  }
  return value;
}
const PREMIUM_COSMETIC_ITEMS = [
  "premium-brush-aurora",
  "premium-trail-comet",
  "premium-frame-prism"
];
const PREMIUM_PRODUCT_IDS = new Set([
  "premium.bundle.v1",
  "premium.no_ads.monthly",
  "premium.no_ads.yearly"
]);

const DAILY_QUEST_POOL = [
  { id: "daily_rounds_4", type: "rounds", target: 4, rewardCoins: 45 },
  { id: "daily_stars_10", type: "stars", target: 10, rewardCoins: 55 },
  { id: "daily_two_plus_2", type: "two_plus_stars_levels", target: 2, rewardCoins: 50 },
  { id: "daily_boss_1", type: "boss_attempt", target: 1, rewardCoins: 60 },
  { id: "daily_xp_750", type: "xp", target: 750, rewardCoins: 70 },
  { id: "daily_highacc_2", type: "high_accuracy", target: 2, rewardCoins: 65 }
];

const WEEKLY_QUEST_POOL = [
  { id: "weekly_rounds_18", type: "rounds", target: 18, rewardCoins: 140 },
  { id: "weekly_stars_42", type: "stars", target: 42, rewardCoins: 170 },
  { id: "weekly_two_plus_10", type: "two_plus_stars_levels", target: 10, rewardCoins: 180 },
  { id: "weekly_boss_5", type: "boss_attempt", target: 5, rewardCoins: 210 },
  { id: "weekly_xp_4200", type: "xp", target: 4200, rewardCoins: 220 },
  { id: "weekly_highacc_8", type: "high_accuracy", target: 8, rewardCoins: 220 },
  { id: "weekly_ladder_320", type: "ladder_points", target: 320, rewardCoins: 260 },
  { id: "weekly_rounds_24", type: "rounds", target: 24, rewardCoins: 250 }
];

const WEEKLY_CATCHUP_POOL = [
  { id: "weekly_catchup_rounds_8", type: "rounds", target: 8, rewardCoins: 120 },
  { id: "weekly_catchup_xp_1500", type: "xp", target: 1500, rewardCoins: 130 },
  { id: "weekly_catchup_stars_16", type: "stars", target: 16, rewardCoins: 130 }
];

function utcDayKey(timestampMs = Date.now()) {
  return new Date(timestampMs).toISOString().slice(0, 10);
}

function utcWeekKey(timestampMs = Date.now()) {
  const d = new Date(timestampMs);
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() - day + 1);
  return d.toISOString().slice(0, 10);
}

function toNumber(value, fallback = 0) {
  return Number.isFinite(value) ? value : fallback;
}

function hashString(input) {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function seededRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pickQuestDefs(pool, count, key) {
  const rng = seededRandom(hashString(key));
  const copy = [...pool];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = copy[i];
    copy[i] = copy[j];
    copy[j] = tmp;
  }
  return copy.slice(0, Math.min(count, copy.length));
}

function getQuestDefsForBoard(boardType, boardKey) {
  if (boardType === "daily") {
    return pickQuestDefs(DAILY_QUEST_POOL, 3, `daily:${boardKey}`);
  }

  const tiers = pickQuestDefs(WEEKLY_QUEST_POOL, 5, `weekly:${boardKey}`);
  const catchUp = pickQuestDefs(WEEKLY_CATCHUP_POOL, 1, `weekly-catchup:${boardKey}`);
  return [...tiers, ...catchUp];
}

function utcMonthKey(timestampMs = Date.now()) {
  return new Date(timestampMs).toISOString().slice(0, 7);
}

function normalizeEntitlements(entitlements) {
  return {
    premiumActive: Boolean(entitlements?.premiumActive),
    adsDisabled: Boolean(entitlements?.adsDisabled),
    dailyEnergyMultiplier: Math.max(1, toNumber(entitlements?.dailyEnergyMultiplier, 1)),
    premiumCosmeticSetId:
      typeof entitlements?.premiumCosmeticSetId === "string" ? entitlements.premiumCosmeticSetId : null,
    monthlySpecialItemId:
      typeof entitlements?.monthlySpecialItemId === "string" ? entitlements.monthlySpecialItemId : null,
    monthlySpecialItemMonthKey:
      typeof entitlements?.monthlySpecialItemMonthKey === "string" ? entitlements.monthlySpecialItemMonthKey : null,
    unlockedCosmeticItems: Array.isArray(entitlements?.unlockedCosmeticItems)
      ? entitlements.unlockedCosmeticItems.filter((entry) => typeof entry === "string")
      : [],
    updatedAt: toNumber(entitlements?.updatedAt, 0)
  };
}

function shapeTrackForShape(shape) {
  if (shape === "circle") {
    return "circle";
  }
  if (shape === "square" || shape === "triangle" || shape === "diamond" || shape === "star" || shape === "pentagon" || shape === "hexagon") {
    return "corner";
  }
  return "curve";
}

function emptyBoard(boardKey) {
  return {
    key: boardKey,
    rounds: 0,
    stars: 0,
    xp: 0,
    highAccuracyRounds: 0,
    twoPlusStarRounds: 0,
    bossAttempts: 0,
    ladderPoints: 0,
    shapeTrackRounds: {
      circle: 0,
      curve: 0,
      corner: 0,
      memory: 0
    },
    claimedQuestIds: []
  };
}

function normalizeBoard(board, boardKey) {
  if (!board || typeof board !== "object" || board.key !== boardKey) {
    return emptyBoard(boardKey);
  }

  return {
    key: boardKey,
    rounds: Math.max(0, toNumber(board.rounds, 0)),
    stars: Math.max(0, toNumber(board.stars, 0)),
    xp: Math.max(0, toNumber(board.xp, 0)),
    highAccuracyRounds: Math.max(0, toNumber(board.highAccuracyRounds, 0)),
    twoPlusStarRounds: Math.max(0, toNumber(board.twoPlusStarRounds, 0)),
    bossAttempts: Math.max(0, toNumber(board.bossAttempts, 0)),
    ladderPoints: Math.max(0, toNumber(board.ladderPoints, 0)),
    shapeTrackRounds: {
      circle: Math.max(0, toNumber(board.shapeTrackRounds?.circle, 0)),
      curve: Math.max(0, toNumber(board.shapeTrackRounds?.curve, 0)),
      corner: Math.max(0, toNumber(board.shapeTrackRounds?.corner, 0)),
      memory: Math.max(0, toNumber(board.shapeTrackRounds?.memory, 0))
    },
    claimedQuestIds: Array.isArray(board.claimedQuestIds)
      ? board.claimedQuestIds.filter((id) => typeof id === "string")
      : []
  };
}

function normalizeProgressionRecord(record) {
  const now = Date.now();
  const dailyKey = utcDayKey(now);
  const weeklyKey = utcWeekKey(now);

  return {
    coins: Math.max(0, toNumber(record?.coins, 0)),
    daily: normalizeBoard(record?.daily, dailyKey),
    weekly: normalizeBoard(record?.weekly, weeklyKey)
  };
}

function updateProgressionFromRound(existingProgression, payload, score) {
  const progression = normalizeProgressionRecord(existingProgression);
  const shapeTrack = shapeTrackForShape(payload.targetShape);
  const isBossAttempt =
    typeof payload.levelId === "string" && /-l10$/.test(payload.levelId);
  const xpForProgression = Math.max(0, Math.round(score.xpGained * (isBossAttempt ? 1.8 : 1)));
  const ladderGain = score.stars * 3 + (score.accuracyPercent >= 90 ? 3 : 0) + (isBossAttempt ? 6 : 0);

  progression.daily.rounds += 1;
  progression.daily.stars += score.stars;
  progression.daily.xp += xpForProgression;
  progression.daily.twoPlusStarRounds += score.stars >= 2 ? 1 : 0;
  progression.daily.bossAttempts += isBossAttempt ? 1 : 0;
  if (score.accuracyPercent >= 90) {
    progression.daily.highAccuracyRounds += 1;
  }
  progression.daily.shapeTrackRounds[shapeTrack] += 1;

  progression.weekly.rounds += 1;
  progression.weekly.stars += score.stars;
  progression.weekly.xp += xpForProgression;
  progression.weekly.twoPlusStarRounds += score.stars >= 2 ? 1 : 0;
  progression.weekly.bossAttempts += isBossAttempt ? 1 : 0;
  progression.weekly.ladderPoints += ladderGain;
  if (score.accuracyPercent >= 90) {
    progression.weekly.highAccuracyRounds += 1;
  }
  progression.weekly.shapeTrackRounds[shapeTrack] += 1;

  progression.coins += isBossAttempt ? 35 : 0;

  return progression;
}

function findQuestDef(boardType, boardKey, questId) {
  return getQuestDefsForBoard(boardType, boardKey).find((quest) => quest.id === questId) || null;
}

function getQuestProgressValue(board, questDef) {
  if (questDef.type === "rounds") {
    return board.rounds;
  }
  if (questDef.type === "stars") {
    return board.stars;
  }
  if (questDef.type === "xp") {
    return board.xp;
  }
  if (questDef.type === "two_plus_stars_levels") {
    return board.twoPlusStarRounds;
  }
  if (questDef.type === "boss_attempt") {
    return board.bossAttempts;
  }
  if (questDef.type === "ladder_points") {
    return board.ladderPoints;
  }
  if (questDef.type === "high_accuracy") {
    return board.highAccuracyRounds;
  }
  if (questDef.type === "shape_track") {
    return toNumber(board.shapeTrackRounds?.[questDef.scope], 0);
  }
  return 0;
}

function getMissingFields(payload) {
  return REQUIRED_FIELDS.filter((field) => payload[field] === undefined || payload[field] === null);
}

function hasInvalidCoordinates(points) {
  const limit = 10_000;
  return points.some((point) => {
    return (
      !Number.isFinite(point.x) ||
      !Number.isFinite(point.y) ||
      Math.abs(point.x) > limit ||
      Math.abs(point.y) > limit
    );
  });
}

function normalizeAnalyticsRecord(event, fieldValue) {
  const eventDate = String(event.timestamp).slice(0, 10);
  return {
    schemaVersion: event.schemaVersion,
    eventType: event.eventType,
    userId: event.userId,
    sessionId: event.sessionId,
    eventTimestamp: event.timestamp,
    eventDate,
    ingestedAt: fieldValue.serverTimestamp(),
    payload: event
  };
}

async function roundSubmitHandler(req, res, deps = {}) {
  const activeDeps = {
    firestore,
    logger,
    fieldValue: admin.firestore.FieldValue,
    ...deps
  };

  if (req.method !== "POST") {
    res.status(405).json({ error: "method_not_allowed" });
    return;
  }

  const payload = req.body || {};
  const missing = getMissingFields(payload);
  if (missing.length > 0) {
    res.status(400).json({ error: "missing_fields", fields: missing });
    return;
  }

  if (hasInvalidCoordinates(payload.points)) {
    activeDeps.logger.warn("round_rejected", { userId: payload.userId, reasons: ["invalid_coordinates"] });
    res.status(422).json({ accepted: false, reasons: ["invalid_coordinates"] });
    return;
  }

  /* Fail fast on unknown shapes / difficulties instead of a 500 later. */
  if (!SHAPE_TEMPLATES[payload.targetShape]) {
    res.status(422).json({ accepted: false, reasons: ["invalid_target_shape"] });
    return;
  }
  if (!VALID_DIFFICULTIES.has(payload.difficulty)) {
    res.status(422).json({ accepted: false, reasons: ["invalid_difficulty"] });
    return;
  }

  const processedPoints = preprocessStroke(payload.points, {
    smoothingWindow: 2,
    minDistance: 1.5,
    minPoints: minimumRequiredPoints(payload.timeLimitMs)
  });

  const validation = validateRoundPayload({
    targetShape: payload.targetShape,
    points: processedPoints,
    timeLimitMs: payload.timeLimitMs,
    startedAtMs: payload.startedAtMs,
    endedAtMs: payload.endedAtMs,
    difficulty: payload.difficulty
  });

  if (!validation.valid) {
    activeDeps.logger.warn("round_rejected", { userId: payload.userId, reasons: validation.reasons });
    res.status(422).json({ accepted: false, reasons: validation.reasons });
    return;
  }

  const timeTakenMs = Number(payload.endedAtMs) - Number(payload.startedAtMs);
  const score = scoreRound(
    processedPoints,
    payload.targetShape,
    payload.difficulty,
    Number(payload.streakBonus || 0),
    {
      scoringVersion: getScoringVersionFromEnvValue(process.env.PRECISION_SCORING_VERSION),
      mechanicTag: KNOWN_MECHANIC_TAGS.has(payload.mechanicTag) ? payload.mechanicTag : "none",
      timeTakenMs: Number.isFinite(timeTakenMs) ? timeTakenMs : undefined,
      timeLimitMs: Number.isFinite(payload.timeLimitMs) ? payload.timeLimitMs : undefined,
      canvasMinDim: normalizeCanvasMinDim(payload.canvasMinDim)
    }
  );

  const roundEvent = buildRoundCompletedEvent({
    ...payload,
    ...score
  });

  try {
    const eventRef = activeDeps.firestore.collection("events").doc();
    const userRef = activeDeps.firestore.collection("users").doc(payload.userId);

    await activeDeps.firestore.runTransaction(async (txn) => {
      const userSnapshot = await txn.get(userRef);
      const userData = userSnapshot.exists ? userSnapshot.data() : {};
      const progression = updateProgressionFromRound(userData.progression, payload, score);

      txn.set(eventRef, roundEvent);
      txn.set(
        userRef,
        {
          lastSessionId: payload.sessionId,
          updatedAt: activeDeps.fieldValue.serverTimestamp(),
          totals: {
            rounds: activeDeps.fieldValue.increment(1),
            xp: activeDeps.fieldValue.increment(score.xpGained),
            stars: activeDeps.fieldValue.increment(score.stars)
          },
          progression
        },
        { merge: true }
      );

      // Update leaderboard — keep best accuracy per user per shape
      const leaderboardRef = activeDeps.firestore
        .collection("leaderboard")
        .doc(`${payload.userId}_${payload.targetShape}`);
      const lbSnap = await txn.get(leaderboardRef);
      const lbData = lbSnap.exists ? lbSnap.data() : null;

      if (!lbData || lbData.accuracyPercent < score.accuracyPercent) {
        txn.set(leaderboardRef, {
          userId: payload.userId,
          displayName: typeof payload.displayName === "string" ? payload.displayName.slice(0, 30) : "Player",
          targetShape: payload.targetShape,
          accuracyPercent: score.accuracyPercent,
          stars: score.stars,
          xpGained: score.xpGained,
          difficulty: payload.difficulty,
          submittedAt: activeDeps.fieldValue.serverTimestamp()
        });
      }

      // Update weekly ladder global leaderboard — upsert running weekly totals per user
      const now = Date.now();
      const weekKey = utcWeekKey(now);
      const ladderGain = score.stars * 3 + (score.accuracyPercent >= 90 ? 3 : 0) + (typeof payload.levelId === "string" && /-l10$/.test(payload.levelId) ? 6 : 0);
      const ladderRef = activeDeps.firestore.collection("weeklyLadder").doc(`${payload.userId}_${weekKey}`);
      txn.set(ladderRef, {
        userId: payload.userId,
        displayName: typeof payload.displayName === "string" ? payload.displayName.slice(0, 30) : "Player",
        weekKey,
        ladderPoints: activeDeps.fieldValue.increment(ladderGain),
        stars: activeDeps.fieldValue.increment(score.stars),
        rounds: activeDeps.fieldValue.increment(1),
        updatedAt: activeDeps.fieldValue.serverTimestamp()
      }, { merge: true });
    });

    res.status(200).json({
      accepted: true,
      accuracyPercent: score.accuracyPercent,
      stars: score.stars,
      xpGained: score.xpGained,
      eventId: eventRef.id
    });
  } catch (error) {
    activeDeps.logger.error("round_submit_failed", { error: String(error), userId: payload.userId });
    res.status(500).json({ error: "internal_error" });
  }
}

async function analyticsIngestHandler(req, res, deps = {}) {
  const activeDeps = {
    firestore,
    logger,
    fieldValue: admin.firestore.FieldValue,
    ...deps
  };

  if (req.method !== "POST") {
    res.status(405).json({ error: "method_not_allowed" });
    return;
  }

  const body = req.body || {};
  const events = Array.isArray(body.events) ? body.events : [];

  if (events.length === 0) {
    res.status(400).json({ error: "missing_events" });
    return;
  }

  if (events.length > 100) {
    res.status(413).json({ error: "batch_too_large", maxEvents: 100 });
    return;
  }

  const invalidEvents = [];
  for (let i = 0; i < events.length; i += 1) {
    const validation = validateAnalyticsEvent(events[i]);
    if (!validation.valid) {
      invalidEvents.push({
        index: i,
        reasons: validation.reasons,
        missingFields: validation.missingFields
      });
    }
  }

  if (invalidEvents.length > 0) {
    activeDeps.logger.warn("analytics_rejected", { count: invalidEvents.length });
    res.status(422).json({
      accepted: false,
      invalidEvents
    });
    return;
  }

  try {
    const batch = activeDeps.firestore.batch();
    const eventIds = [];

    for (const event of events) {
      const ref = activeDeps.firestore.collection("analytics_events").doc();
      batch.set(ref, normalizeAnalyticsRecord(event, activeDeps.fieldValue));
      eventIds.push(ref.id);
    }

    await batch.commit();
    res.status(200).json({
      accepted: true,
      acceptedCount: events.length,
      eventIds
    });
  } catch (error) {
    activeDeps.logger.error("analytics_ingest_failed", { error: String(error) });
    res.status(500).json({ error: "internal_error" });
  }
}

async function questClaimHandler(req, res, deps = {}) {
  const activeDeps = {
    firestore,
    logger,
    fieldValue: admin.firestore.FieldValue,
    ...deps
  };

  if (req.method !== "POST") {
    res.status(405).json({ error: "method_not_allowed" });
    return;
  }

  const payload = req.body || {};
  const userId = typeof payload.userId === "string" ? payload.userId : "";
  const boardType = payload.boardType === "weekly" ? "weekly" : payload.boardType === "daily" ? "daily" : "";
  const questId = typeof payload.questId === "string" ? payload.questId : "";

  if (!userId || !boardType || !questId) {
    res.status(400).json({ error: "missing_fields", fields: ["userId", "boardType", "questId"] });
    return;
  }

  try {
    const userRef = activeDeps.firestore.collection("users").doc(userId);
    let responsePayload = null;

    await activeDeps.firestore.runTransaction(async (txn) => {
      const userSnapshot = await txn.get(userRef);
      const userData = userSnapshot.exists ? userSnapshot.data() : {};
      const progression = normalizeProgressionRecord(userData.progression);
      const board = boardType === "weekly" ? progression.weekly : progression.daily;
      const questDef = findQuestDef(boardType, board.key, questId);

      if (!questDef) {
        responsePayload = { status: 422, body: { accepted: false, reason: "unknown_quest" } };
        return;
      }

      if (board.claimedQuestIds.includes(questId)) {
        responsePayload = { status: 409, body: { accepted: false, reason: "already_claimed" } };
        return;
      }

      const progressValue = getQuestProgressValue(board, questDef);
      if (progressValue < questDef.target) {
        responsePayload = {
          status: 422,
          body: {
            accepted: false,
            reason: "quest_not_completed",
            progress: progressValue,
            target: questDef.target
          }
        };
        return;
      }

      const nextProgression = {
        ...progression,
        coins: progression.coins + questDef.rewardCoins,
        [boardType]: {
          ...board,
          claimedQuestIds: [...board.claimedQuestIds, questId]
        }
      };

      txn.set(
        userRef,
        {
          progression: nextProgression,
          updatedAt: activeDeps.fieldValue.serverTimestamp()
        },
        { merge: true }
      );

      responsePayload = {
        status: 200,
        body: {
          accepted: true,
          rewardCoins: questDef.rewardCoins,
          coinsBalance: nextProgression.coins,
          boardType,
          questId
        }
      };
    });

    if (!responsePayload) {
      res.status(500).json({ error: "internal_error" });
      return;
    }

    res.status(responsePayload.status).json(responsePayload.body);
  } catch (error) {
    activeDeps.logger.error("quest_claim_failed", { error: String(error), userId, boardType, questId });
    res.status(500).json({ error: "internal_error" });
  }
}

async function purchaseVerifyHandler(req, res, deps = {}) {
  const activeDeps = {
    firestore,
    logger,
    fieldValue: admin.firestore.FieldValue,
    verifyPurchase,
    ...deps
  };

  if (req.method !== "POST") {
    res.status(405).json({ error: "method_not_allowed" });
    return;
  }

  const payload = req.body || {};
  const userId = typeof payload.userId === "string" ? payload.userId : "";
  const productId = typeof payload.productId === "string" ? payload.productId : "";
  const platform = payload.platform === "ios" || payload.platform === "android" ? payload.platform : "";

  if (!userId || !productId || !platform) {
    res.status(400).json({ accepted: false, reason: "missing_fields", fields: ["userId", "productId", "platform"] });
    return;
  }

  if (!PREMIUM_PRODUCT_IDS.has(productId)) {
    res.status(422).json({ accepted: false, reason: "unknown_product" });
    return;
  }

  const verification = await activeDeps.verifyPurchase({
    userId,
    productId,
    platform,
    purchaseToken: payload.purchaseToken,
    receiptData: payload.receiptData,
    sandbox: payload.sandbox
  });

  if (!verification.valid) {
    res.status(422).json({ accepted: false, reason: verification.reason || "verification_failed" });
    return;
  }

  try {
    const userRef = activeDeps.firestore.collection("users").doc(userId);
    const now = Date.now();
    const month = utcMonthKey(now);
    const monthlyItemId = `premium-monthly-${month.replace("-", "")}`;

    let entitlementResponse = null;

    await activeDeps.firestore.runTransaction(async (txn) => {
      const userSnapshot = await txn.get(userRef);
      const userData = userSnapshot.exists ? userSnapshot.data() : {};
      const current = normalizeEntitlements(userData.entitlements);

      const mergedItems = Array.from(new Set([
        ...current.unlockedCosmeticItems,
        ...PREMIUM_COSMETIC_ITEMS,
        monthlyItemId
      ]));

      const entitlements = {
        premiumActive: true,
        adsDisabled: true,
        dailyEnergyMultiplier: PREMIUM_DAILY_ENERGY_MULTIPLIER,
        premiumCosmeticSetId: PREMIUM_COSMETIC_SET_ID,
        monthlySpecialItemId: monthlyItemId,
        monthlySpecialItemMonthKey: month,
        unlockedCosmeticItems: mergedItems,
        updatedAt: now,
        sourceProductId: productId,
        sourcePlatform: platform,
        sourceTransactionId: verification.transactionId || null,
        sourceExpiresAtMs: verification.expiresAtMs || null
      };

      txn.set(
        userRef,
        {
          entitlements,
          updatedAt: activeDeps.fieldValue.serverTimestamp()
        },
        { merge: true }
      );

      entitlementResponse = entitlements;
    });

    res.status(200).json({
      accepted: true,
      entitlement: entitlementResponse
    });
  } catch (error) {
    activeDeps.logger.error("purchase_verify_failed", { error: String(error), userId, productId, platform });
    res.status(500).json({ error: "internal_error" });
  }
}

async function entitlementSyncHandler(req, res, deps = {}) {
  const activeDeps = {
    firestore,
    logger,
    ...deps
  };

  if (req.method !== "POST") {
    res.status(405).json({ error: "method_not_allowed" });
    return;
  }

  const payload = req.body || {};
  const userId = typeof payload.userId === "string" ? payload.userId : "";
  if (!userId) {
    res.status(400).json({ accepted: false, reason: "missing_fields", fields: ["userId"] });
    return;
  }

  try {
    const userRef = activeDeps.firestore.collection("users").doc(userId);
    const snapshot = await userRef.get();
    const data = snapshot.exists ? snapshot.data() : {};
    const entitlement = normalizeEntitlements(data.entitlements);

    res.status(200).json({
      accepted: true,
      entitlement
    });
  } catch (error) {
    activeDeps.logger.error("entitlement_sync_failed", { error: String(error), userId });
    res.status(500).json({ error: "internal_error" });
  }
}

// ─── Leaderboard ───────────────────────────────────────────────────────────────

async function leaderboardGetHandler(req, res, deps = {}) {
  const activeDeps = {
    firestore,
    logger,
    ...deps
  };

  if (req.method !== "POST") {
    res.status(405).json({ error: "method_not_allowed" });
    return;
  }

  const payload = req.body || {};
  const shape = typeof payload.shape === "string" ? payload.shape : "";
  const limit = Math.min(Math.max(1, toNumber(payload.limit, 50)), 100);

  try {
    let query = activeDeps.firestore
      .collection("leaderboard")
      .orderBy("accuracyPercent", "desc")
      .limit(limit);

    if (shape) {
      query = activeDeps.firestore
        .collection("leaderboard")
        .where("targetShape", "==", shape)
        .orderBy("accuracyPercent", "desc")
        .limit(limit);
    }

    const snapshot = await query.get();
    const entries = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      entries.push({
        id: doc.id,
        userId: data.userId,
        displayName: data.displayName || "Player",
        targetShape: data.targetShape,
        accuracyPercent: data.accuracyPercent,
        stars: data.stars,
        xpGained: data.xpGained,
        difficulty: data.difficulty,
        submittedAt: data.submittedAt
      });
    });

    res.status(200).json({ entries });
  } catch (error) {
    activeDeps.logger.error("leaderboard_get_failed", { error: String(error) });
    res.status(500).json({ error: "internal_error" });
  }
}

// ─── Challenges ────────────────────────────────────────────────────────────────

const CHALLENGE_SHAPES = ["circle", "square", "triangle", "diamond", "pentagon", "hexagon", "heart", "star"];

async function challengeGetHandler(req, res, deps = {}) {
  const activeDeps = {
    firestore,
    logger,
    ...deps
  };

  if (req.method !== "POST") {
    res.status(405).json({ error: "method_not_allowed" });
    return;
  }

  const payload = req.body || {};
  const shape = typeof payload.shape === "string" ? payload.shape : "";
  const limit = Math.min(Math.max(1, toNumber(payload.limit, 50)), 100);

  if (!shape || !CHALLENGE_SHAPES.includes(shape)) {
    res.status(400).json({ error: "invalid_shape", validShapes: CHALLENGE_SHAPES });
    return;
  }

  try {
    const snapshot = await activeDeps.firestore
      .collection("challenges")
      .doc(shape)
      .collection("entries")
      .orderBy("accuracyPercent", "desc")
      .limit(limit)
      .get();

    const entries = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      entries.push({
        userId: data.userId,
        displayName: data.displayName || "Player",
        targetShape: shape,
        accuracyPercent: data.accuracyPercent,
        stars: data.stars,
        xpGained: data.xpGained,
        points: Array.isArray(data.points) ? data.points.slice(0, 400) : [],
        submittedAt: data.submittedAt
      });
    });

    res.status(200).json({
      targetShape: shape,
      entries
    });
  } catch (error) {
    activeDeps.logger.error("challenge_get_failed", { error: String(error) });
    res.status(500).json({ error: "internal_error" });
  }
}

async function challengeSubmitHandler(req, res, deps = {}) {
  const activeDeps = {
    firestore,
    logger,
    fieldValue: admin.firestore.FieldValue,
    ...deps
  };

  if (req.method !== "POST") {
    res.status(405).json({ error: "method_not_allowed" });
    return;
  }

  const payload = req.body || {};
  const userId = typeof payload.userId === "string" ? payload.userId : "";
  const displayName = typeof payload.displayName === "string" ? payload.displayName.slice(0, 30) : "Player";
  const shape = typeof payload.shape === "string" ? payload.shape : "";

  if (!userId) {
    res.status(400).json({ error: "missing_fields", fields: ["userId"] });
    return;
  }

  if (!shape || !CHALLENGE_SHAPES.includes(shape)) {
    res.status(400).json({ error: "invalid_shape", validShapes: CHALLENGE_SHAPES });
    return;
  }

  if (!Array.isArray(payload.points) || payload.points.length < 2) {
    res.status(400).json({ error: "missing_fields", fields: ["points"] });
    return;
  }

  if (hasInvalidCoordinates(payload.points)) {
    res.status(422).json({ accepted: false, reasons: ["invalid_coordinates"] });
    return;
  }

  const difficulty = "medium";

  const processedPoints = preprocessStroke(payload.points, {
    smoothingWindow: 2,
    minDistance: 1.5,
    minPoints: 24
  });

  const score = scoreRound(
    processedPoints,
    shape,
    difficulty,
    0,
    {
      scoringVersion: getScoringVersionFromEnvValue(process.env.PRECISION_SCORING_VERSION),
      mechanicTag: "none",
      canvasMinDim: normalizeCanvasMinDim(payload.canvasMinDim)
    }
  );

  try {
    const entryRef = activeDeps.firestore
      .collection("challenges")
      .doc(shape)
      .collection("entries")
      .doc(userId);

    await activeDeps.firestore.runTransaction(async (txn) => {
      const existing = await txn.get(entryRef);
      const existingData = existing.exists ? existing.data() : null;

      // Only update if new score is better
      if (existingData && existingData.accuracyPercent >= score.accuracyPercent) {
        return;
      }

      txn.set(entryRef, {
        userId,
        displayName,
        targetShape: shape,
        accuracyPercent: score.accuracyPercent,
        stars: score.stars,
        xpGained: score.xpGained,
        difficulty,
        /* Ghost replay support: persist the actual winning stroke. */
        points: processedPoints.slice(0, 400),
        submittedAt: activeDeps.fieldValue.serverTimestamp()
      });
    });

    res.status(200).json({
      accepted: true,
      accuracyPercent: score.accuracyPercent,
      stars: score.stars,
      xpGained: score.xpGained,
      targetShape: shape
    });
  } catch (error) {
    activeDeps.logger.error("challenge_submit_failed", { error: String(error), userId });
    res.status(500).json({ error: "internal_error" });
  }
}

exports.round_submit = onRequest({ cors: true, region: "europe-west1" }, async (req, res) => {
  await roundSubmitHandler(req, res);
});

exports.analytics_ingest = onRequest({ cors: true, region: "europe-west1" }, async (req, res) => {
  await analyticsIngestHandler(req, res);
});

exports.quest_claim = onRequest({ cors: true, region: "europe-west1" }, async (req, res) => {
  await questClaimHandler(req, res);
});

exports.purchase_verify = onRequest({ cors: true, region: "europe-west1" }, async (req, res) => {
  await purchaseVerifyHandler(req, res);
});

exports.entitlement_sync = onRequest({ cors: true, region: "europe-west1" }, async (req, res) => {
  await entitlementSyncHandler(req, res);
});

exports.leaderboard_get = onRequest({ cors: true, region: "europe-west1" }, async (req, res) => {
  await leaderboardGetHandler(req, res);
});

exports.challenge_get = onRequest({ cors: true, region: "europe-west1" }, async (req, res) => {
  await challengeGetHandler(req, res);
});

exports.challenge_submit = onRequest({ cors: true, region: "europe-west1" }, async (req, res) => {
  await challengeSubmitHandler(req, res);
});

// ─── Duel System ───────────────────────────────────────────────────────────────

const DUEL_SHAPES = ["circle", "square", "triangle", "diamond", "pentagon", "hexagon", "heart", "star"];
const DUEL_TIMEOUT_MS = 24 * 60 * 60 * 1000; // 24 hours to complete your turn

async function duelCreateHandler(req, res, deps = {}) {
  const activeDeps = { firestore, logger, fieldValue: admin.firestore.FieldValue, ...deps };
  if (req.method !== "POST") { res.status(405).json({ error: "method_not_allowed" }); return; }

  const payload = req.body || {};
  const userId = typeof payload.userId === "string" ? payload.userId : "";
  const displayName = typeof payload.displayName === "string" ? payload.displayName.slice(0, 30) : "Player";
  const shape = typeof payload.shape === "string" ? payload.shape : "";
  const difficulty = ["easy", "medium", "hard"].includes(payload.difficulty) ? payload.difficulty : "medium";

  if (!userId || !shape || !DUEL_SHAPES.includes(shape)) {
    res.status(400).json({ error: "missing_or_invalid_fields", fields: ["userId", "shape"] });
    return;
  }

  try {
    const duelRef = activeDeps.firestore.collection("duels").doc();
    const now = Date.now();
    const expiresAt = now + DUEL_TIMEOUT_MS;
    const duelDoc = {
      status: "waiting",
      shape,
      difficulty,
      createdAt: activeDeps.fieldValue.serverTimestamp(),
      expiresAt,
      creatorId: userId,
      creatorName: displayName,
      creatorTurn: null,
      challengerId: null,
      challengerName: null,
      challengerTurn: null,
      winnerUserId: null,
      resolvedAt: null
    };
    await duelRef.set(duelDoc);
    res.status(200).json({ accepted: true, duelId: duelRef.id, shape, difficulty, expiresAt });
  } catch (error) {
    activeDeps.logger.error("duel_create_failed", { error: String(error), userId });
    res.status(500).json({ error: "internal_error" });
  }
}

async function duelJoinHandler(req, res, deps = {}) {
  const activeDeps = { firestore, logger, fieldValue: admin.firestore.FieldValue, ...deps };
  if (req.method !== "POST") { res.status(405).json({ error: "method_not_allowed" }); return; }

  const payload = req.body || {};
  const duelId = typeof payload.duelId === "string" ? payload.duelId : "";
  const userId = typeof payload.userId === "string" ? payload.userId : "";
  const displayName = typeof payload.displayName === "string" ? payload.displayName.slice(0, 30) : "Player";

  if (!duelId || !userId || !Array.isArray(payload.points) || payload.points.length < 2) {
    res.status(400).json({ error: "missing_fields", fields: ["duelId", "userId", "points"] });
    return;
  }

  if (hasInvalidCoordinates(payload.points)) {
    res.status(422).json({ accepted: false, reasons: ["invalid_coordinates"] });
    return;
  }

  try {
    const duelRef = activeDeps.firestore.collection("duels").doc(duelId);
    let responsePayload = null;

    await activeDeps.firestore.runTransaction(async (txn) => {
      const snap = await txn.get(duelRef);
      if (!snap.exists) {
        responsePayload = { status: 404, body: { accepted: false, reason: "duel_not_found" } };
        return;
      }
      const duel = snap.data();

      if (duel.expiresAt && Date.now() > duel.expiresAt) {
        responsePayload = { status: 410, body: { accepted: false, reason: "duel_expired" } };
        return;
      }

      if (duel.status === "finished") {
        responsePayload = { status: 409, body: { accepted: false, reason: "duel_already_finished" } };
        return;
      }

      const processedPoints = preprocessStroke(payload.points, { smoothingWindow: 2, minDistance: 1.5, minPoints: 24 });
      const score = scoreRound(processedPoints, duel.shape, duel.difficulty, 0, {
        scoringVersion: getScoringVersionFromEnvValue(process.env.PRECISION_SCORING_VERSION),
        mechanicTag: "none",
        canvasMinDim: normalizeCanvasMinDim(payload.canvasMinDim)
      });

      const turnData = {
        userId,
        displayName,
        accuracyPercent: score.accuracyPercent,
        stars: score.stars,
        xpGained: score.xpGained,
        duelScore: score.accuracyPercent + score.stars * 2,
        submittedAt: activeDeps.fieldValue.serverTimestamp()
      };

      const isCreator = duel.creatorId === userId;
      const isNewChallenger = !duel.challengerId && !isCreator;

      if (isCreator) {
        if (duel.creatorTurn) {
          responsePayload = { status: 409, body: { accepted: false, reason: "already_submitted" } };
          return;
        }
        txn.update(duelRef, { creatorTurn: turnData });
      } else if (isNewChallenger) {
        txn.update(duelRef, {
          challengerId: userId,
          challengerName: displayName,
          challengerTurn: turnData,
          status: "active"
        });
      } else if (duel.challengerId === userId) {
        if (duel.challengerTurn) {
          responsePayload = { status: 409, body: { accepted: false, reason: "already_submitted" } };
          return;
        }
        txn.update(duelRef, { challengerTurn: turnData });
      } else {
        responsePayload = { status: 403, body: { accepted: false, reason: "duel_full" } };
        return;
      }

      responsePayload = {
        status: 200,
        body: {
          accepted: true,
          duelId,
          accuracyPercent: score.accuracyPercent,
          stars: score.stars,
          xpGained: score.xpGained,
          duelScore: turnData.duelScore
        }
      };
    });

    if (!responsePayload) { res.status(500).json({ error: "internal_error" }); return; }
    res.status(responsePayload.status).json(responsePayload.body);
  } catch (error) {
    activeDeps.logger.error("duel_join_failed", { error: String(error), userId, duelId });
    res.status(500).json({ error: "internal_error" });
  }
}

async function duelResolveHandler(req, res, deps = {}) {
  const activeDeps = { firestore, logger, fieldValue: admin.firestore.FieldValue, ...deps };
  if (req.method !== "POST") { res.status(405).json({ error: "method_not_allowed" }); return; }

  const payload = req.body || {};
  const duelId = typeof payload.duelId === "string" ? payload.duelId : "";
  if (!duelId) { res.status(400).json({ error: "missing_fields", fields: ["duelId"] }); return; }

  try {
    const duelRef = activeDeps.firestore.collection("duels").doc(duelId);
    let responsePayload = null;

    await activeDeps.firestore.runTransaction(async (txn) => {
      const snap = await txn.get(duelRef);
      if (!snap.exists) {
        responsePayload = { status: 404, body: { error: "duel_not_found" } };
        return;
      }
      const duel = snap.data();

      if (duel.status === "finished") {
        // Already resolved — just return the result
        responsePayload = {
          status: 200,
          body: {
            duelId,
            status: "finished",
            winnerUserId: duel.winnerUserId,
            creatorTurn: duel.creatorTurn,
            challengerTurn: duel.challengerTurn,
            shape: duel.shape,
            difficulty: duel.difficulty
          }
        };
        return;
      }

      if (!duel.creatorTurn || !duel.challengerTurn) {
        responsePayload = {
          status: 200,
          body: {
            duelId,
            status: duel.status,
            waiting: true,
            creatorSubmitted: Boolean(duel.creatorTurn),
            challengerSubmitted: Boolean(duel.challengerTurn),
            shape: duel.shape
          }
        };
        return;
      }

      // Both turns submitted — resolve winner
      const scoreA = duel.creatorTurn.duelScore || 0;
      const scoreB = duel.challengerTurn.duelScore || 0;
      const diff = Math.abs(scoreA - scoreB);
      const winnerUserId = diff < 0.0001 ? null : (scoreA > scoreB ? duel.creatorId : duel.challengerId);

      txn.update(duelRef, {
        status: "finished",
        winnerUserId,
        resolvedAt: activeDeps.fieldValue.serverTimestamp()
      });

      responsePayload = {
        status: 200,
        body: {
          duelId,
          status: "finished",
          winnerUserId,
          creatorTurn: duel.creatorTurn,
          challengerTurn: duel.challengerTurn,
          shape: duel.shape,
          difficulty: duel.difficulty
        }
      };
    });

    if (!responsePayload) { res.status(500).json({ error: "internal_error" }); return; }
    res.status(responsePayload.status).json(responsePayload.body);
  } catch (error) {
    activeDeps.logger.error("duel_resolve_failed", { error: String(error), duelId });
    res.status(500).json({ error: "internal_error" });
  }
}

async function duelGetHandler(req, res, deps = {}) {
  const activeDeps = { firestore, logger, ...deps };
  if (req.method !== "POST") { res.status(405).json({ error: "method_not_allowed" }); return; }

  const payload = req.body || {};
  const userId = typeof payload.userId === "string" ? payload.userId : "";
  const limit = Math.min(Math.max(1, toNumber(payload.limit, 20)), 50);

  if (!userId) { res.status(400).json({ error: "missing_fields", fields: ["userId"] }); return; }

  try {
    const duelsRef = activeDeps.firestore.collection("duels");
    const [asCreator, asChallenger] = await Promise.all([
      duelsRef.where("creatorId", "==", userId).orderBy("createdAt", "desc").limit(limit).get(),
      duelsRef.where("challengerId", "==", userId).orderBy("createdAt", "desc").limit(limit).get()
    ]);

    const seen = new Set();
    const duels = [];
    for (const snap of [...asCreator.docs, ...asChallenger.docs]) {
      if (seen.has(snap.id)) continue;
      seen.add(snap.id);
      const d = snap.data();
      duels.push({
        duelId: snap.id,
        status: d.status,
        shape: d.shape,
        difficulty: d.difficulty,
        creatorId: d.creatorId,
        creatorName: d.creatorName,
        challengerId: d.challengerId,
        challengerName: d.challengerName,
        winnerUserId: d.winnerUserId,
        creatorSubmitted: Boolean(d.creatorTurn),
        challengerSubmitted: Boolean(d.challengerTurn),
        expiresAt: d.expiresAt
      });
    }
    duels.sort((a, b) => (b.expiresAt || 0) - (a.expiresAt || 0));
    res.status(200).json({ duels: duels.slice(0, limit) });
  } catch (error) {
    activeDeps.logger.error("duel_get_failed", { error: String(error), userId });
    res.status(500).json({ error: "internal_error" });
  }
}

// ─── Weekly Ladder Global Leaderboard ─────────────────────────────────────────

async function weeklyLadderGetHandler(req, res, deps = {}) {
  const activeDeps = { firestore, logger, ...deps };
  if (req.method !== "POST") { res.status(405).json({ error: "method_not_allowed" }); return; }

  const limit = Math.min(Math.max(1, toNumber((req.body || {}).limit, 50)), 100);
  const weekKey = utcWeekKey();

  try {
    const snapshot = await activeDeps.firestore
      .collection("weeklyLadder")
      .where("weekKey", "==", weekKey)
      .orderBy("ladderPoints", "desc")
      .limit(limit)
      .get();

    const entries = [];
    snapshot.forEach((doc) => {
      const d = doc.data();
      entries.push({
        userId: d.userId,
        displayName: d.displayName || "Player",
        ladderPoints: d.ladderPoints,
        stars: d.stars,
        rounds: d.rounds,
        weekKey: d.weekKey
      });
    });

    res.status(200).json({ weekKey, entries });
  } catch (error) {
    activeDeps.logger.error("weekly_ladder_get_failed", { error: String(error) });
    res.status(500).json({ error: "internal_error" });
  }
}

exports.duel_create = onRequest({ cors: true, region: "europe-west1" }, async (req, res) => {
  await duelCreateHandler(req, res);
});

exports.duel_join = onRequest({ cors: true, region: "europe-west1" }, async (req, res) => {
  await duelJoinHandler(req, res);
});

exports.duel_resolve = onRequest({ cors: true, region: "europe-west1" }, async (req, res) => {
  await duelResolveHandler(req, res);
});

exports.duel_get = onRequest({ cors: true, region: "europe-west1" }, async (req, res) => {
  await duelGetHandler(req, res);
});

exports.weekly_ladder_get = onRequest({ cors: true, region: "europe-west1" }, async (req, res) => {
  await weeklyLadderGetHandler(req, res);
});

exports.__test = {
  REQUIRED_FIELDS,
  getMissingFields,
  roundSubmitHandler,
  analyticsIngestHandler,
  normalizeAnalyticsRecord,
  questClaimHandler,
  updateProgressionFromRound,
  normalizeProgressionRecord,
  getQuestDefsForBoard,
  findQuestDef,
  getQuestProgressValue,
  shapeTrackForShape,
  purchaseVerifyHandler,
  entitlementSyncHandler,
  normalizeEntitlements,
  leaderboardGetHandler,
  challengeGetHandler,
  challengeSubmitHandler,
  CHALLENGE_SHAPES
};
