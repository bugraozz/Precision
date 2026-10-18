import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  SafeAreaView,
  StatusBar
} from "react-native";
import { TamaguiProvider, Theme } from "tamagui";
import tamaguiConfig from "./tamagui.config";
import {
  createAdShownEvent,
  createCrashReportEvent,
  createPerfMarkerEvent,
  createPremiumPurchasedEvent,
  createRoundCompletedEvent,
  createSessionEndedEvent,
  createSessionStartedEvent
} from "../src/core/analytics";
import { preprocessStroke } from "../src/core/geometry";
import {
  computeAccuracyPercentByVersion,
  getScoringVersionFromEnvValue,
  minimumRequiredPoints,
  scoreRound,
  scoreRoundDetailed
} from "../src/core/scoring";
import { Point, RoundInput } from "../src/core/types";
import { flushAnalyticsQueue, logAnalyticsEvent } from "./src/analytics";
import {
  challengeGet,
  challengeSubmit,
  claimQuestReward,
  entitlementSync,
  leaderboardGet,
  duelCreate,
  duelGet,
  duelJoin,
  duelResolve,
  weeklyLadderGet,
  purchaseVerify,
  submitRound,
  toRoundSubmitPayload
} from "./src/api";
import type {
  ChallengeEntry,
  DuelEntry,
  WeeklyLadderEntry,
  LeaderboardEntry
} from "./src/api";
import { getCosmeticCatalogBySlot, getCosmeticVisualFromLoadout } from "./src/cosmetics";
import {
  getChapterForLevel,
  getLevelById,
  getLevelsForChapter,
  getNextLevelId,
  getRequiredStarsForLevel
} from "./src/levels";
import {
  getStartupDurationMs,
  installGlobalErrorHandler,
  logCrashlyticsMessage,
  recordCrashlyticsError,
  setCrashlyticsEnabled
} from "./src/instrumentation";
import { loadPremiumState, setPremiumNoAds } from "./src/monetization";
import { hasSeenTutorial, markTutorialSeen } from "./src/onboarding";
import {
  activatePremiumBenefits,
  applyDailyShapeResult,
  applyEntitlementSnapshot,
  applyRoundProgress,
  buyEnergyRefill,
  claimDailyStreakChest,
  consumeEnergyForPlay,
  DEFAULT_LEVEL_ID,
  DEFAULT_PROGRESSION,
  DAILY_SHAPE_REWARD_COINS,
  ENERGY_REFILL_COIN_COST,
  getChallengeBestStroke,
  getChapterUnlockProgress,
  getClaimableDailyQuests,
  getClaimableWeeklyQuests,
  getDailyShapeToday,
  getEnergySnapshot,
  getMechanicSummary,
  getMasteryLevels,
  markQuestClaimed,
  getQuestCompletionStats,
  getTotalBestStars,
  loadProgression,
  ProgressionState,
  refreshProgressionState,
  selectPremiumCosmeticItem,
  saveProgression,
  updateChallengeBest
} from "./src/progression";
import { getRewardedAdsConfig } from "./src/remoteConfig";
import { SPEED_PAR_RATIO } from "./src/constants/gameplay";
import type { RoundFeedback, HomePanelKey } from "./src/types/app";
import { targetShapePath } from "./src/utils/shapePreview";
import { applyMechanicPressure } from "./src/utils/mechanics";
import { normalizeClaimRewardResponse, getLocalQuestReward, isQuestClaimableLocally, isQuestAlreadyClaimedLocally } from "./src/utils/claimRewards";
import { useLanguage, t, tShape, TUTORIAL_STEPS_I18N, tChapterTitle } from "./src/i18n";
import type { Lang } from "./src/i18n";
import { PRECISION_COLORS } from "./src/theme/precisionTokens";
import { ScreenAmbience } from "./src/components/ui";
import MainScreen from "./src/screens/MainScreen";
import LevelsScreen from "./src/screens/LevelsScreen";
import PlayScreen from "./src/screens/PlayScreen";
import CompleteScreen from "./src/screens/CompleteScreen";
import TutorialOverlay from "./src/screens/TutorialOverlay";

const canScoreLocal = (points: Point[]) => points.length > 2;

export default function App() {
  const MEMORY_PEEK_LIMIT = 2;  const [lang, setLang] = useLanguage();
  const [sessionId] = useState(() => `session-${Date.now()}`);
  const sessionStartedAtRef = useRef(Date.now());
  const [screen, setScreen] = useState<"main" | "home" | "play" | "complete">("main");
  const [playMode, setPlayMode] = useState<"level" | "challenge">("level");
  const [statusText, setStatusText] = useState(t("ready"));
  const [drawnPoints, setDrawnPoints] = useState<Point[]>([]);
  const [startedAtMs, setStartedAtMs] = useState<number>(Date.now());
  const [endedAtMs, setEndedAtMs] = useState<number>(Date.now());
  const [missionStartedAtMs, setMissionStartedAtMs] = useState<number>(Date.now());
  const [playClockMs, setPlayClockMs] = useState(0);
  const [canvasResetKey, setCanvasResetKey] = useState(0);
  const [feedback, setFeedback] = useState<RoundFeedback | null>(null);
  const [progression, setProgression] = useState<ProgressionState>(DEFAULT_PROGRESSION);
  const [progressionLoaded, setProgressionLoaded] = useState(false);
  const [awardedForCurrentStroke, setAwardedForCurrentStroke] = useState(false);
  const [selectedLevelId, setSelectedLevelId] = useState(DEFAULT_LEVEL_ID);
  const [selectedChapterId, setSelectedChapterId] = useState("chapter-1");
  const [homePanel, setHomePanel] = useState<HomePanelKey>("challenge");
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [rewardedAdsShownCount, setRewardedAdsShownCount] = useState(0);
  const [lastRewardedAdAt, setLastRewardedAdAt] = useState(0);
  const [isShowingRewardedAd, setIsShowingRewardedAd] = useState(false);
  const [hasPremiumNoAds, setHasPremiumNoAds] = useState(false);
  const [claimingRewardKeys, setClaimingRewardKeys] = useState<Record<string, boolean>>({});
  const [lastClaimRewardText, setLastClaimRewardText] = useState<string | null>(null);
  const [memoryTargetVisible, setMemoryTargetVisible] = useState(true);
  const [memoryPeeksUsed, setMemoryPeeksUsed] = useState(0);
  const [canvasMinDim, setCanvasMinDim] = useState(360);
  const [ghostPoints, setGhostPoints] = useState<Point[]>([]);
  const [challengeShape, setChallengeShape] = useState("circle");
  const [challengeEntries, setChallengeEntries] = useState<ChallengeEntry[]>([]);
  const [challengeLoading, setChallengeLoading] = useState(false);
  const [challengeDrawing, setChallengeDrawing] = useState(false);
  const [challengeDrawnPoints, setChallengeDrawnPoints] = useState<Point[]>([]);
  const [challengeResult, setChallengeResult] = useState<{ accuracyPercent: number; stars: number; xpGained: number } | null>(null);

  // ─── Leaderboard State ───────────────────────────────────────────────────
  const [leaderboardEntries, setLeaderboardEntries] = useState<LeaderboardEntry[]>([]);
  const [leaderboardShapeFilter, setLeaderboardShapeFilter] = useState<string>("");
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);

  // ─── Weekly Ladder Global State ──────────────────────────────────────────
  const [ladderEntries, setLadderEntries] = useState<WeeklyLadderEntry[]>([]);
  const [ladderLoading, setLadderLoading] = useState(false);

  // ─── Duel State ──────────────────────────────────────────────────────────
  const [duelEntries, setDuelEntries] = useState<DuelEntry[]>([]);
  const [duelLoading, setDuelLoading] = useState(false);
  const [activeDuel, setActiveDuel] = useState<{ duelId: string; shape: string; difficulty: string } | null>(null);
  const [duelJoinInput, setDuelJoinInput] = useState("");
  const [duelCreateShape, setDuelCreateShape] = useState("circle");
  const claimInFlightRef = useRef<Set<string>>(new Set());
  const homeAnimValues = useRef(Array.from({ length: 5 }, () => new Animated.Value(0))).current;
  const playAnim = useRef(new Animated.Value(0)).current;
  const homePanelAnim = useRef(new Animated.Value(1)).current;
  const ctaSheenAnim = useRef(new Animated.Value(0)).current;
  const playCtaPulseAnim = useRef(new Animated.Value(0)).current;
  const claimRewardPopAnim = useRef(new Animated.Value(0)).current;

  const runtime = globalThis as unknown as {
    process?: {
      env?: Record<string, string | undefined>;
    };
  };

  const scoringVersion = getScoringVersionFromEnvValue(runtime.process?.env?.EXPO_PUBLIC_SCORING_VERSION);
  const crashlyticsEnabled = String(runtime.process?.env?.EXPO_PUBLIC_FEATURE_CRASHLYTICS || "true") !== "false";
  const rewardedAdsConfig = getRewardedAdsConfig();
  const rewardedAdsRemaining = Math.max(0, rewardedAdsConfig.maxPerSession - rewardedAdsShownCount);
  const rewardedAdOnCooldown = Date.now() - lastRewardedAdAt < rewardedAdsConfig.cooldownMs;
  const canShowRewardedRetry =
    rewardedAdsConfig.enabled &&
    !hasPremiumNoAds &&
    !isShowingRewardedAd &&
    rewardedAdsRemaining > 0 &&
    !rewardedAdOnCooldown;
  const selectedLevel = getLevelById(selectedLevelId);
  const activeMechanic = getMechanicSummary(selectedLevelId).tag;
  const speedParTimeMs = useMemo(() => Math.floor(selectedLevel.timeLimitMs * SPEED_PAR_RATIO), [selectedLevel.timeLimitMs]);
  const totalBestStars = getTotalBestStars(progression);
  const chapterStatus = getChapterUnlockProgress(progression);
  const masteryLevels = getMasteryLevels(progression);
  const energySnapshot = getEnergySnapshot(progression);
  const premiumCosmeticCount = progression.premium.unlockedCosmeticItems.length;
  const dailyStats = getQuestCompletionStats(progression.dailyBoard);
  const weeklyStats = getQuestCompletionStats({ quests: progression.weeklyLadder.tiers });
  const claimableDaily = getClaimableDailyQuests(progression);
  const claimableWeekly = getClaimableWeeklyQuests(progression);
  const cosmeticVisual = getCosmeticVisualFromLoadout({
    selectedBrushId: progression.premium.selectedBrushId,
    selectedTrailId: progression.premium.selectedTrailId,
    selectedFrameId: progression.premium.selectedFrameId,
    fallbackItemId: progression.premium.selectedCosmeticItemId
  });
  const brushInventory = getCosmeticCatalogBySlot("brush", progression.premium.unlockedCosmeticItems);
  const trailInventory = getCosmeticCatalogBySlot("trail", progression.premium.unlockedCosmeticItems);
  const frameInventory = getCosmeticCatalogBySlot("frame", progression.premium.unlockedCosmeticItems);
  const nextLevelId = getNextLevelId(selectedLevelId);
  const canGoNextLevel = Boolean(nextLevelId) && progression.unlockedLevels.includes(nextLevelId || "");
  const nextLevelLabel = !nextLevelId
    ? t("packComplete")
    : canGoNextLevel
      ? `${t("nextLabel")}: L${getLevelById(nextLevelId).index}`
      : t("needOneStar");
  const targetPreviewPath = useMemo(() => targetShapePath(selectedLevel.targetShape, 120), [selectedLevel.targetShape]);
  const chapterLevels = useMemo(() => getLevelsForChapter(selectedChapterId), [selectedChapterId]);

  useEffect(() => {
    const boot = async () => {
      const stored = refreshProgressionState(await loadProgression());
      const seenTutorial = await hasSeenTutorial();
      const premiumState = await loadPremiumState();

      await logAnalyticsEvent(
        createSessionStartedEvent({
          userId: "local-user",
          sessionId,
          deviceInfo: { os: "unknown", version: "dev", model: "expo" },
          network: "unknown"
        })
      );
      await flushAnalyticsQueue();

      await setCrashlyticsEnabled(crashlyticsEnabled);
      logCrashlyticsMessage("session_started");

      void logAnalyticsEvent(
        createPerfMarkerEvent({
          userId: "local-user",
          sessionId,
          metricName: "app_startup_ms",
          value: getStartupDurationMs(),
          unit: "ms"
        })
      );
      await flushAnalyticsQueue();

      let upgraded = premiumState.noAds && !stored.premium.isActive ? activatePremiumBenefits(stored) : stored;

      const entitlementResponse = await entitlementSync({ userId: "local-user" });
      if (entitlementResponse.accepted && entitlementResponse.entitlement) {
        upgraded = applyEntitlementSnapshot(upgraded, entitlementResponse.entitlement);
      }

      if (upgraded !== stored || (entitlementResponse.accepted && entitlementResponse.entitlement)) {
        await saveProgression(upgraded);
      }

      setProgression(upgraded);
      setHasPremiumNoAds(upgraded.premium.adsDisabled || premiumState.noAds);
      if (!upgraded.unlockedLevels.includes(selectedLevelId)) {
        setSelectedLevelId(upgraded.unlockedLevels[0] || DEFAULT_LEVEL_ID);
      }
      const initialLevelId = upgraded.unlockedLevels[0] || DEFAULT_LEVEL_ID;
      const initialChapter = getChapterForLevel(initialLevelId);
      if (initialChapter?.id) {
        setSelectedChapterId(initialChapter.id);
      }
      setShowTutorial(!seenTutorial);
      setProgressionLoaded(true);
    };

    void boot();

    return () => {
      const durationMs = Date.now() - sessionStartedAtRef.current;
      void logAnalyticsEvent(
        createSessionEndedEvent({
          userId: "local-user",
          sessionId,
          durationMs
        })
      ).then(() => flushAnalyticsQueue());
    };
  }, []);

  useEffect(() => {
    const uninstall = installGlobalErrorHandler((error, isFatal) => {
      recordCrashlyticsError(error);
      void logAnalyticsEvent(
        createCrashReportEvent({
          userId: "local-user",
          sessionId,
          message: error.message || "unknown_error",
          stack: error.stack,
          fatal: isFatal
        })
      );
      void flushAnalyticsQueue();
    });

    return uninstall;
  }, [sessionId]);

  useEffect(() => {
    if (screen === "main" || screen === "home") {
      homeAnimValues.forEach((value) => value.setValue(0));
      Animated.stagger(
        90,
        homeAnimValues.map((value) =>
          Animated.timing(value, {
            toValue: 1,
            duration: 460,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true
          })
        )
      ).start();
    }

    if (screen === "play" || screen === "complete") {
      playAnim.setValue(0);
      Animated.timing(playAnim, {
        toValue: 1,
        duration: 360,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true
      }).start();
    }
  }, [screen, homeAnimValues, playAnim]);

  useEffect(() => {
    if (screen !== "main") {
      return;
    }
    homePanelAnim.setValue(0);
    Animated.timing(homePanelAnim, {
      toValue: 1,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true
    }).start();
  }, [homePanel, screen, homePanelAnim]);

  useEffect(() => {
    if (screen !== "play" || activeMechanic !== "memory") {
      return;
    }

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(playCtaPulseAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true
        }),
        Animated.timing(playCtaPulseAnim, {
          toValue: 0,
          duration: 1200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true
        })
      ])
    );

    pulseLoop.start();
    return () => pulseLoop.stop();
  }, [screen, playCtaPulseAnim]);

  useEffect(() => {
    if (screen !== "play") {
      setPlayClockMs(0);
      return;
    }

    const timer = setInterval(() => {
      setPlayClockMs(Date.now() - missionStartedAtMs);
    }, 120);

    return () => clearInterval(timer);
  }, [screen, missionStartedAtMs]);

  /* Speed mode: hard time limit — round auto-ends when the clock runs out. */
  useEffect(() => {
    if (screen !== "play" || playMode !== "level" || activeMechanic !== "speed" || feedback) {
      return;
    }
    if (playClockMs < selectedLevel.timeLimitMs) {
      return;
    }
    if (canScoreLocal(drawnPoints)) {
      handleLocalScore();
      return;
    }
    setFeedback({
      source: "local",
      accuracyPercent: 0,
      meanDeviation: 1,
      stars: 0,
      xpGained: 0
    });
    void awardProgression(0, 0, 0, selectedLevel.timeLimitMs);
    setScreen("complete");
    setStatusText(`${t("speedTimeUp")}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playClockMs, screen, playMode, activeMechanic, feedback, drawnPoints]);

  useEffect(() => {
    if (screen !== "play") {
      setMemoryTargetVisible(true);
      return;
    }

    if (activeMechanic !== "memory") {
      setMemoryTargetVisible(true);
      return;
    }

    if (memoryPeeksUsed >= MEMORY_PEEK_LIMIT) {
      setMemoryTargetVisible(false);
      return;
    }

    setMemoryTargetVisible(true);
    const timeout = setTimeout(() => {
      setMemoryTargetVisible(false);
    }, 1800);
    return () => clearTimeout(timeout);
  }, [screen, activeMechanic, selectedLevelId, canvasResetKey, memoryPeeksUsed]);

  const handlePremiumPurchase = async () => {
    if (hasPremiumNoAds || progression.premium.isActive) {
      setStatusText(t("premiumAlreadyActive"));
      return;
    }

    try {
      const verifyResponse = await purchaseVerify({
        userId: "local-user",
        productId: "premium.bundle.v1",
        platform: "android",
        purchaseToken: `sandbox-${Date.now()}`,
        sandbox: true
      });

      let upgraded = activatePremiumBenefits(progression);
      if (verifyResponse.accepted && verifyResponse.entitlement) {
        upgraded = applyEntitlementSnapshot(upgraded, verifyResponse.entitlement);
      }

      await setPremiumNoAds(true);
      await saveProgression(upgraded);
      setProgression(upgraded);
      setHasPremiumNoAds(true);
      logCrashlyticsMessage("premium_activated_sandbox");

      void logAnalyticsEvent(
        createPremiumPurchasedEvent({
          userId: "local-user",
          sessionId,
          productId: "premium.no_ads.v1",
          sandbox: true
        })
      );
      void flushAnalyticsQueue();

      setStatusText(t("premiumUnlockedFull"));
    } catch {
      // Server unavailable â€” activate locally
      const upgraded = activatePremiumBenefits(progression);
      await setPremiumNoAds(true);
      await saveProgression(upgraded);
      setProgression(upgraded);
      setHasPremiumNoAds(true);
      setStatusText(t("premiumUnlockedLocal"));
    }
  };

  const loadChallenge = useCallback(async (shape: string) => {
    setChallengeLoading(true);
    const res = await challengeGet({ shape });
    setChallengeEntries(res.entries);
    setChallengeLoading(false);
  }, []);

  const loadLeaderboard = useCallback(async (shape?: string) => {
    setLeaderboardLoading(true);
    const res = await leaderboardGet({ shape: shape || undefined, limit: 50 });
    setLeaderboardEntries(res.entries || []);
    setLeaderboardLoading(false);
  }, []);

  const loadWeeklyLadder = useCallback(async () => {
    setLadderLoading(true);
    const res = await weeklyLadderGet({ limit: 50 });
    setLadderEntries(res.entries || []);
    setLadderLoading(false);
  }, []);

  const loadDuels = useCallback(async () => {
    setDuelLoading(true);
    const res = await duelGet({ userId: "local-user", limit: 20 });
    setDuelEntries(res.duels || []);
    setDuelLoading(false);
  }, []);

  const handleCreateDuel = useCallback(async (shape: string, difficulty: "easy" | "medium" | "hard") => {
    setDuelLoading(true);
    const res = await duelCreate({ userId: "local-user", displayName: "Player", shape, difficulty });
    if (res.accepted && res.duelId) {
      setActiveDuel({ duelId: res.duelId, shape: res.shape || shape, difficulty: res.difficulty || difficulty });
      void loadDuels();
    }
    setDuelLoading(false);
    return res;
  }, [loadDuels]);

  const handleJoinDuel = useCallback(async (duelId: string, points: { x: number; y: number }[]) => {
    setDuelLoading(true);
    const res = await duelJoin({ duelId, userId: "local-user", displayName: "Player", points });
    if (res.accepted) {
      void loadDuels();
    }
    setDuelLoading(false);
    return res;
  }, [loadDuels]);

  const handleCheckDuelResult = useCallback(async (duelId: string) => {
    const res = await duelResolve({ duelId });
    void loadDuels();
    return res;
  }, [loadDuels]);

  const startChallengePlay = (shapeOverride?: string) => {
    const shape = shapeOverride || challengeShape;
    setPlayMode("challenge");
    setMemoryPeeksUsed(0);
    setGhostPoints([]);
    resetRound();
    setMissionStartedAtMs(Date.now());
    setScreen("play");
    setStatusText(`${t("challengeDraw")} ${tShape(shape)}`);
  };

  const startDailyShape = () => {
    setChallengeShape(progression.dailyShape.shape);
    startChallengePlay(progression.dailyShape.shape);
  };

  const handleChallengeServerSubmit = async () => {
    if (!canScore) {
      setStatusText(t("drawOnCanvasFirst"));
      return;
    }
    setChallengeLoading(true);
    const processed = preprocessStroke(drawnPoints, {
      smoothingWindow: 2,
      minDistance: 1.5,
      minPoints: 10
    });

    /* Ghost + daily bookkeeping, local-first so they work offline too. */
    setGhostPoints(getChallengeBestStroke(progression, challengeShape)?.points || []);

    const res = await challengeSubmit({
      userId: "local-user",
      displayName: "Player",
      shape: challengeShape,
      points: processed.map(p => ({ x: p.x, y: p.y })),
      canvasMinDim
    });
    if (res.accepted) {
      const acc = res.accuracyPercent ?? 0;
      const stars = (res.stars ?? 0) as 0 | 1 | 2 | 3;
      const xp = res.xpGained ?? 0;
      setChallengeResult({ accuracyPercent: acc, stars, xpGained: xp });
      setFeedback({
        source: "server",
        accuracyPercent: acc,
        meanDeviation: 0,
        stars,
        xpGained: xp
      });
      await recordChallengeOutcomes(challengeShape, processed, acc, stars);
      setScreen("complete");
      setStatusText(`${t("challengeAccepted")} ${t("accuracy")} ${acc.toFixed(1)}% | ${t("stars")} ${stars} | ${t("xp")} ${xp}`);
      void loadChallenge(challengeShape);
    } else {
      // Server unavailable â€” score locally
      const scoreOptions = {
        scoringVersion,
        mechanicTag: "none" as const,
        canvasMinDim
      };
      const score = scoreRound(processed, challengeShape, "medium", 0, scoreOptions);
      const acc = score.accuracyPercent;
      const stars = score.stars as 0 | 1 | 2 | 3;
      const xp = score.xpGained;
      setChallengeResult({ accuracyPercent: acc, stars, xpGained: xp });
      setFeedback({
        source: "local",
        accuracyPercent: acc,
        meanDeviation: 0,
        stars,
        xpGained: xp
      });
      await recordChallengeOutcomes(challengeShape, processed, acc, stars);
      setScreen("complete");
      setStatusText(`${t("challengeScoredLocally")} | ${t("accuracy")} ${acc.toFixed(1)}% | ${t("stars")} ${stars} | ${t("xp")} ${xp}`);
    }
    setChallengeLoading(false);
  };

  const recordChallengeOutcomes = async (shape: string, points: Point[], acc: number, stars: number) => {
    if (points.length < 3) {
      return;
    }
    const daily = applyDailyShapeResult(progression, {
      accuracyPercent: acc,
      shape
    });
    const bestResult = updateChallengeBest(daily.next, { shape, points, accuracyPercent: acc });
    let next = bestResult.next;
    await saveProgression(next);
    setProgression(next);
    if (daily.applied) {
      playClaimRewardPop();
      setStatusText(
        `${t("dailyShapeDone")} +${DAILY_SHAPE_REWARD_COINS} ${t("coinsLabel")} | ${t("dailyStreakLabel")} ${next.dailyShape.streak}`
      );
    }
  };

  useEffect(() => {
    if (homePanel === "challenge") {
      void loadChallenge(challengeShape);
    }
    if (homePanel === "leaderboard") {
      void loadLeaderboard(leaderboardShapeFilter || undefined);
    }
    if (homePanel === "weekly") {
      void loadWeeklyLadder();
    }
    if (homePanel === "duel") {
      void loadDuels();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [homePanel, challengeShape, leaderboardShapeFilter]);

  const handleSelectPremiumCosmetic = async (itemId: string) => {
    const next = selectPremiumCosmeticItem(progression, itemId);
    if (next === progression) {
      return;
    }
    await saveProgression(next);
    setProgression(next);
    setStatusText(`${t("cosmeticEquipped")}: ${itemId}`);
  };

  const advanceTutorial = async () => {
    if (tutorialStep < TUTORIAL_STEPS_I18N.en.length - 1) {
      setTutorialStep((step) => step + 1);
      return;
    }

    await markTutorialSeen();
    setShowTutorial(false);
    setStatusText(t("tutorialComplete"));
  };

  const skipTutorial = async () => {
    await markTutorialSeen();
    setShowTutorial(false);
    setStatusText(t("tutorialSkipped"));
  };

  const applyAndPersistProgression = async (next: ProgressionState, status?: string) => {
    setProgression(next);
    await saveProgression(next);
    if (status) {
      setStatusText(status);
    }
  };

  const playClaimRewardPop = () => {
    claimRewardPopAnim.setValue(0);
    Animated.sequence([
      Animated.timing(claimRewardPopAnim, {
        toValue: 1,
        duration: 150,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true
      }),
      Animated.timing(claimRewardPopAnim, {
        toValue: 0,
        duration: 220,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true
      })
    ]).start();
  };

  const markClaimPending = (key: string, pending: boolean) => {
    setClaimingRewardKeys((prev) => {
      const next = { ...prev };
      if (pending) {
        next[key] = true;
      } else {
        delete next[key];
      }
      return next;
    });
  };

  const beginClaimOperation = (key: string): boolean => {
    if (claimInFlightRef.current.has(key)) {
      return false;
    }
    claimInFlightRef.current.add(key);
    markClaimPending(key, true);
    return true;
  };

  const endClaimOperation = (key: string) => {
    claimInFlightRef.current.delete(key);
    markClaimPending(key, false);
  };

  const applyClaimRewardFeedback = (rewardCoins: number) => {
    const rewardSegments = [];
    if (rewardCoins > 0) {
      rewardSegments.push(`+${rewardCoins} ${t("coinsLabel")}`);
    }
    const summary = rewardSegments.length > 0 ? rewardSegments.join(" | ") : t("noReward");
    setLastClaimRewardText(`${t("claimedLabel")} ${summary}`);
    playClaimRewardPop();
  };

  const handleQuestClaim = async (boardType: "daily" | "weekly", questId: string) => {
    const claimKey = `${boardType}:${questId}`;
    if (!beginClaimOperation(claimKey)) {
      return;
    }
    try {
      const response = await claimQuestReward({
        userId: "local-user",
        boardType,
        questId
      });
      const normalized = normalizeClaimRewardResponse(response);

      if (!normalized.accepted) {
        if (normalized.reason === "already_claimed") {
          if (!isQuestAlreadyClaimedLocally(progression, boardType, questId)) {
            const synced = markQuestClaimed(progression, boardType, questId);
            await applyAndPersistProgression(synced, t("claimAlreadyProcessed"));
          } else {
            setStatusText(t("claimAlreadyProcessed"));
          }
          return;
        }

        const canFallbackToLocal =
          normalized.reason === "missing_endpoint" ||
          normalized.reason === "quest_not_completed" ||
          normalized.reason === "unknown_quest";
        const localClaimable = isQuestClaimableLocally(progression, boardType, questId);
        const localReward = getLocalQuestReward(progression, boardType, questId);

        if (canFallbackToLocal && localClaimable && localReward) {
          const fallbackNext = markQuestClaimed(
            progression,
            boardType,
            questId
          );
          await applyAndPersistProgression(
            fallbackNext,
            `${t("claimedLabel")} +${localReward.rewardCoins} ${t("coinsLabel")}`
          );
          applyClaimRewardFeedback(localReward.rewardCoins);
          return;
        }

        setStatusText(t("claimFailed"));
        return;
      }

      const next = markQuestClaimed(
        progression,
        boardType,
        questId
      );
      const merged =
        typeof normalized.coinsBalance === "number"
          ? {
              ...next,
              coins: Math.max(0, normalized.coinsBalance)
            }
          : next;
      await applyAndPersistProgression(merged, `${t("claimedLabel")} +${normalized.rewardCoins} ${t("coinsLabel")}`);
      applyClaimRewardFeedback(normalized.rewardCoins);
    } finally {
      endClaimOperation(claimKey);
    }
  };

  const handleDailyStreakChest = async () => {
    const claimKey = "daily:streak_chest";
    if (!beginClaimOperation(claimKey)) {
      return;
    }

    try {
      const next = claimDailyStreakChest(progression);
      if (next === progression) {
        setStatusText(t("dailyStreakChestUnavailable"));
        return;
      }
      await applyAndPersistProgression(next, t("dailyStreakChestClaimed"));
      playClaimRewardPop();
    } finally {
      endClaimOperation(claimKey);
    }
  };

  const handleBuyEnergyRefill = async () => {
    const result = buyEnergyRefill(progression);
    if (!result.accepted) {
      if (result.reason === "energy_full") {
        setStatusText(t("energyAlreadyFull"));
        return;
      }
      setStatusText(`${t("notEnoughCoins")} ${ENERGY_REFILL_COIN_COST} ${t("coinsLabel")}.`);
      return;
    }

    await applyAndPersistProgression(
      result.nextState,
      t("spentCoinsRestoredEnergy").replace("{coins}", String(result.spentCoins)).replace("{energy}", String(result.gainedEnergy))
    );
  };

  const awardProgression = async (
    stars: 0 | 1 | 2 | 3,
    xpGained: number,
    accuracyPercent: number,
    durationMs: number
  ) => {
    if (awardedForCurrentStroke) {
      return;
    }

    const next = applyRoundProgress(progression, {
      levelId: selectedLevelId,
      stars,
      xpGained,
      accuracyPercent,
      targetShape: selectedLevel.targetShape,
      durationMs,
      nextLevelId: getNextLevelId(selectedLevelId)
    });
    setProgression(next);
    setAwardedForCurrentStroke(true);
    await saveProgression(next);
  };

  const round: RoundInput = useMemo(
    () => ({
      targetShape: selectedLevel.targetShape,
      points: drawnPoints,
      timeLimitMs: selectedLevel.timeLimitMs,
      startedAtMs,
      endedAtMs,
      difficulty: selectedLevel.difficulty
    }),
    [drawnPoints, selectedLevel, startedAtMs, endedAtMs]
  );

  const canScore = drawnPoints.length > 2;

  const handleStrokeCommitted = (points: Point[], strokeStartedAtMs: number, strokeEndedAtMs: number) => {
    const processedPoints = preprocessStroke(points, {
      smoothingWindow: 2,
      minDistance: 1.5,
      minPoints: minimumRequiredPoints(round.timeLimitMs)
    });
    setDrawnPoints(processedPoints);
    setStartedAtMs(strokeStartedAtMs);
    setEndedAtMs(strokeEndedAtMs);
    setFeedback(null);
    setAwardedForCurrentStroke(false);
    setStatusText(`${t("strokeCaptured")}: ${points.length} -> ${processedPoints.length}`);
  };

  const resetRound = () => {
    setDrawnPoints([]);
    setStartedAtMs(Date.now());
    setEndedAtMs(Date.now());
    setFeedback(null);
    setAwardedForCurrentStroke(false);
    setCanvasResetKey((key) => key + 1);
    if (screen === "play" && playMode === "level" && activeMechanic === "memory") {
      setMemoryPeeksUsed((used) => used + 1);
      setStatusText(t("canvasReset"));
    } else {
      setStatusText(t("canvasReset"));
    }
  };

  const handleLevelSelect = (levelId: string) => {
    if (!progression.unlockedLevels.includes(levelId)) {
      return;
    }
    setSelectedLevelId(levelId);
    const chapter = getChapterForLevel(levelId);
    if (chapter?.id) {
      setSelectedChapterId(chapter.id);
    }
    resetRound();
    const level = getLevelById(levelId);
    setStatusText(`${t("selectedLevel")} L${level.index}: ${tShape(level.targetShape)}`);
  };

  const handleNextLevel = () => {
    if (!nextLevelId) {
      setStatusText(t("allLevelsComplete"));
      return;
    }

    if (!progression.unlockedLevels.includes(nextLevelId)) {
      setStatusText(t("nextLevelLocked"));
      return;
    }

    const requiredStars = getRequiredStarsForLevel(nextLevelId);
    if (totalBestStars < requiredStars) {
      setStatusText(`${t("chapterLocked")} ${requiredStars} ${t("totalStars")}.`);
      return;
    }

    setSelectedLevelId(nextLevelId);
    const chapter = getChapterForLevel(nextLevelId);
    if (chapter?.id) {
      setSelectedChapterId(chapter.id);
    }
    resetRound();
    const level = getLevelById(nextLevelId);
    setStatusText(`${t("nextLevelLabel")}: L${level.index} ${tShape(level.targetShape)}`);
  };

  const tryStartMission = async (source: "levels" | "retry" | "next"): Promise<boolean> => {
    const result = consumeEnergyForPlay(progression);
    if (!result.accepted) {
      setStatusText(t("noEnergyForToday"));
      setScreen("main");
      return false;
    }

    await saveProgression(result.nextState);
    setProgression(result.nextState);
    setMissionStartedAtMs(Date.now());
    setMemoryPeeksUsed(0);
    resetRound();
    setScreen("play");
    setStatusText(`${t("missionStarted")} (${source}) | ${t("energy")} ${result.remaining}/${result.nextState.energy.dailyCapBase * result.nextState.energy.dailyMultiplier}`);
    return true;
  };

  const handleRetryFromComplete = () => {
    void tryStartMission("retry");
  };

  const handleNextFromComplete = () => {
    handleNextLevel();
    if (canGoNextLevel) {
      void tryStartMission("next");
    }
  };

  const handleRewardedRetry = async () => {
    if (!rewardedAdsConfig.enabled || !canShowRewardedRetry) {
      setStatusText(t("rewardedRetryUnavailableMsg"));
      return;
    }

    setIsShowingRewardedAd(true);
    setStatusText(t("showingRewardedAd"));
    await new Promise((resolve) => setTimeout(resolve, 900));

    setLastRewardedAdAt(Date.now());
    setRewardedAdsShownCount((count) => count + 1);
    setIsShowingRewardedAd(false);

    void logAnalyticsEvent(
      createAdShownEvent({
        userId: "local-user",
        sessionId,
        placement: "retry_reward",
        rewardType: "extra_retry"
      })
    );

    resetRound();
    setMemoryPeeksUsed(0);
    setMissionStartedAtMs(Date.now());
    setScreen("play");
    setStatusText(t("rewardUnlocked"));
  };

  const handleLocalScore = () => {
    if (!canScore) {
      setStatusText(t("drawOnCanvasFirst"));
      return;
    }

    const missionDurationMs = round.endedAtMs - missionStartedAtMs;
    const scoreOptions = {
      scoringVersion,
      mechanicTag: activeMechanic,
      timeTakenMs: missionDurationMs,
      timeLimitMs: round.timeLimitMs,
      canvasMinDim
    };
    /* One pass: score + accuracy come from the same computation. */
    const { score, accuracy } = scoreRoundDetailed(round.points, round.targetShape, round.difficulty, 4, scoreOptions);
    const pressured = applyMechanicPressure({
      stars: score.stars,
      xpGained: score.xpGained,
      accuracyPercent: score.accuracyPercent,
      durationMs: missionDurationMs,
      points: round.points
    }, activeMechanic, speedParTimeMs, memoryTargetVisible);
    void logAnalyticsEvent(
      createRoundCompletedEvent({
        userId: "local-user",
        sessionId,
        gameMode: "standard",
        arenaDifficulty: round.difficulty,
        shapeName: round.targetShape,
        accuracy: accuracy.accuracyPercent,
        timeSpentMs: missionDurationMs,
        stars: pressured.stars,
        xpEarned: pressured.xpGained,
        deviceInfo: { os: "unknown", version: "dev", model: "expo" },
        network: "unknown"
      })
    );

    setFeedback({
      source: "local",
      accuracyPercent: score.accuracyPercent,
      meanDeviation: accuracy.meanDeviation,
      stars: pressured.stars,
      xpGained: pressured.xpGained
    });
    void awardProgression(
      pressured.stars,
      pressured.xpGained,
      score.accuracyPercent,
      missionDurationMs
    );
    setScreen("complete");
    const localStatus = `${t("accuracy")} ${score.accuracyPercent}% | ${t("stars")} ${pressured.stars} | ${t("xp")} ${pressured.xpGained}`;
    setStatusText(pressured.note ? `${localStatus} | ${pressured.note}` : localStatus);
  };

  const handleServerSubmit = async () => {
    if (!canScore) {
      setStatusText(t("drawOnCanvasFirst"));
      return;
    }

    const payload = toRoundSubmitPayload({
      round,
      userId: "local-user",
      sessionId,
      gameMode: "standard"
    });
    payload.levelId = selectedLevelId;
    (payload as Record<string, unknown>).displayName = "Player";
    (payload as Record<string, unknown>).mechanicTag = activeMechanic;
    (payload as Record<string, unknown>).canvasMinDim = canvasMinDim;

    const result = await submitRound(payload);
    if (!result.accepted) {
      const reasons = result.reasons || ["unknown"];
      if (reasons.includes("missing_endpoint") || reasons.includes("network_error") || reasons.includes("http_error")) {
        setStatusText(t("serverUnavailable"));
        handleLocalScore();
      } else {
        setFeedback(null);
        setStatusText(`${t("serverRejected")}: ${reasons.join(",")}`);
      }
      return;
    }

    const serverMissionDurationMs = round.endedAtMs - missionStartedAtMs;
    const scoreOptions = {
      scoringVersion,
      mechanicTag: activeMechanic,
      timeTakenMs: serverMissionDurationMs,
      timeLimitMs: round.timeLimitMs,
      canvasMinDim
    };
    const { score: localScore, accuracy } = scoreRoundDetailed(round.points, round.targetShape, round.difficulty, 4, scoreOptions);
    const resolvedAccuracy = result.accuracyPercent || localScore.accuracyPercent;
    const resolvedStars = (result.stars || localScore.stars) as 0 | 1 | 2 | 3;
    const resolvedXp = result.xpGained || localScore.xpGained;
    const pressured = applyMechanicPressure({
      stars: resolvedStars,
      xpGained: resolvedXp,
      accuracyPercent: resolvedAccuracy,
      durationMs: serverMissionDurationMs,
      points: round.points
    }, activeMechanic, speedParTimeMs, memoryTargetVisible);

    const nextFeedback: RoundFeedback = {
      source: "server",
      accuracyPercent: resolvedAccuracy,
      meanDeviation: accuracy.meanDeviation,
      stars: pressured.stars,
      xpGained: pressured.xpGained
    };
    setFeedback(nextFeedback);
    void awardProgression(pressured.stars, pressured.xpGained, resolvedAccuracy, serverMissionDurationMs);

    setScreen("complete");
    setStatusText(
      pressured.note
        ? `${t("server")} | ${t("accuracy")} ${resolvedAccuracy}% | ${t("stars")} ${pressured.stars} | ${t("xp")} ${pressured.xpGained} | ${pressured.note}`
        : `${t("server")} | ${t("accuracy")} ${resolvedAccuracy}% | ${t("stars")} ${pressured.stars} | ${t("xp")} ${pressured.xpGained}`
    );
  };

  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme="precision_dark">
      <Theme name="precision_dark">
    <SafeAreaView style={{ flex: 1, backgroundColor: PRECISION_COLORS.bg }}>
      <ScreenAmbience />

      {screen === "main" ? (
        <MainScreen
          homeAnimValues={homeAnimValues}
          homePanelAnim={homePanelAnim}
          ctaSheenAnim={ctaSheenAnim}
          progression={progression}
          selectedLevel={selectedLevel}
          totalBestStars={totalBestStars}
          energySnapshot={energySnapshot}
          statusText={statusText}
          challengeShape={challengeShape}
          challengeEntries={challengeEntries}
          challengeLoading={challengeLoading}
          challengeResult={challengeResult}
          dailyShapeState={progression.dailyShape}
          onStartDaily={startDailyShape}
          setScreen={setScreen}
          setHomePanel={setHomePanel}
          handlePremiumPurchase={handlePremiumPurchase}
          handleBuyEnergyRefill={handleBuyEnergyRefill}
          setChallengeShape={setChallengeShape}
          startChallengePlay={() => startChallengePlay()}
          leaderboardEntries={leaderboardEntries}
          leaderboardShapeFilter={leaderboardShapeFilter}
          setLeaderboardShapeFilter={setLeaderboardShapeFilter}
          ladderEntries={ladderEntries}
          lang={lang}
          setLang={setLang}
        />
      ) : screen === "home" ? (
        <LevelsScreen
          homeAnimValues={homeAnimValues}
          ctaSheenAnim={ctaSheenAnim}
          progression={progression}
          selectedLevel={selectedLevel}
          selectedLevelId={selectedLevelId}
          selectedChapterId={selectedChapterId}
          chapterLevels={chapterLevels}
          chapterStatus={chapterStatus}
          energySnapshot={energySnapshot}
          statusText={statusText}
          setScreen={setScreen}
          setSelectedChapterId={setSelectedChapterId}
          setSelectedLevelId={setSelectedLevelId}
          setStatusText={setStatusText}
          setPlayMode={setPlayMode}
          handleLevelSelect={handleLevelSelect}
          tryStartMission={tryStartMission}
          lang={lang}
        />
      ) : screen === "play" ? (
        <PlayScreen
          playAnim={playAnim}
          playCtaPulseAnim={playCtaPulseAnim}
          playMode={playMode}
          selectedLevel={selectedLevel}
          activeMechanic={activeMechanic}
          speedParTimeMs={speedParTimeMs}
          playClockMs={playClockMs}
          memoryTargetVisible={memoryTargetVisible}
          memoryPeeksLeft={Math.max(0, MEMORY_PEEK_LIMIT - memoryPeeksUsed)}
          onCanvasLayout={setCanvasMinDim}
          challengeShape={challengeShape}
          challengeLoading={challengeLoading}
          canScore={canScore}
          canvasResetKey={canvasResetKey}
          statusText={statusText}
          progression={progression}
          targetPreviewPath={targetPreviewPath}
          cosmeticVisual={cosmeticVisual}
          setScreen={setScreen}
          resetRound={resetRound}
          handleStrokeCommitted={handleStrokeCommitted}
          handleLocalScore={handleLocalScore}
          handleChallengeServerSubmit={handleChallengeServerSubmit}
          lang={lang}
        />
      ) : (
        <CompleteScreen
          playAnim={playAnim}
          playMode={playMode}
          feedback={feedback}
          round={round}
          drawnPoints={drawnPoints}
          challengeShape={challengeShape}
          ghostPoints={ghostPoints}
          flawless={Boolean(feedback && feedback.accuracyPercent >= 97)}
          canGoNextLevel={canGoNextLevel}
          nextLevelLabel={nextLevelLabel}
          hasPremiumNoAds={hasPremiumNoAds}
          canShowRewardedRetry={canShowRewardedRetry}
          rewardedAdsEnabled={rewardedAdsConfig.enabled}
          rewardedAdOnCooldown={rewardedAdOnCooldown}
          rewardedAdsRemaining={rewardedAdsRemaining}
          cosmeticVisual={cosmeticVisual}
          setScreen={setScreen}
          setPlayMode={setPlayMode}
          handleRetryFromComplete={handleRetryFromComplete}
          handleNextFromComplete={handleNextFromComplete}
          handleRewardedRetry={handleRewardedRetry}
          startChallengePlay={() => startChallengePlay()}
          lang={lang}
        />
      )}

      {showTutorial ? (
        <TutorialOverlay
          tutorialStep={tutorialStep}
          advanceTutorial={advanceTutorial}
          skipTutorial={skipTutorial}
          lang={lang}
        />
      ) : null}

      <StatusBar barStyle="light-content" />
    </SafeAreaView>
      </Theme>
    </TamaguiProvider>
  );
}

