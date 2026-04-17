import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  CHAPTERS,
  DEFAULT_LEVEL_ID,
  getLevelById,
  getRequiredStarsForLevel,
  getUnlockedChapterIds,
  LEVEL_PACK_V1,
  MechanicTag
} from "./levels";

export { DEFAULT_LEVEL_ID };

const STORAGE_KEY = "precision_progression_v2";

export type MasteryTrack = "circle" | "corner" | "curve";

export type QuestProgress = {
  id: string;
  label: string;
  metric: "rounds" | "stars" | "xp" | "twoPlusStars" | "bossAttempts" | "highAccuracy" | "ladderPoints";
  target: number;
  value: number;
  rewardCoins: number;
  rewardGems?: number;
  claimed: boolean;
};

export type DailyBoardState = {
  key: string;
  quests: QuestProgress[];
  streakDays: number;
  lastCompletedKey: string | null;
  streakChestClaimed: boolean;
  streakChestAvailable: boolean;
};

export type WeeklyLadderState = {
  key: string;
  tiers: QuestProgress[];
  catchUpQuest: QuestProgress;
  points: number;
};

export type EventQuest = QuestProgress & {
  type: "rounds" | "stars" | "xp" | "boss" | "accuracy";
};

export type WeeklyEventState = {
  id: string;
  startKey: string;
  endKey: string;
  quests: EventQuest[];
  rewardChestClaimed: boolean;
};

export type SeasonPassState = {
  id: string;
  startKey: string;
  durationDays: number;
  premiumUnlocked: boolean;
  tierXp: number;
  claimedFreeTiers: number[];
  claimedPremiumTiers: number[];
};

export type MasteryUnlocks = {
  cosmetics: string[];
  badges: string[];
  specialChallenges: string[];
};

export type CollectionAlbumState = {
  piecesByChapter: Record<string, number>;
  completedSets: string[];
  unlockedFrames: string[];
};

export type PersonalBest = {
  accuracyPercent: number;
  durationMs: number;
  updatedAt: number;
};

export type EnergyState = {
  dailyKey: string;
  dailyCapBase: number;
  dailyMultiplier: number;
  current: number;
  consumedToday: number;
};

export type PremiumState = {
  isActive: boolean;
  adsDisabled: boolean;
  premiumCosmeticSetId: string | null;
  monthlySpecialItemId: string | null;
  monthlySpecialItemMonthKey: string | null;
  unlockedCosmeticItems: string[];
  selectedCosmeticItemId: string | null;
  selectedBrushId: string | null;
  selectedTrailId: string | null;
  selectedFrameId: string | null;
  activatedAt: number | null;
};

export type ProgressionState = {
  cumulativeXp: number;
  completedRounds: number;
  coins: number;
  gems: number;
  bestStarsByLevel: Record<string, 0 | 1 | 2 | 3>;
  unlockedLevels: string[];
  masteryXpByTrack: Record<MasteryTrack, number>;
  masteryUnlocks: MasteryUnlocks;
  dailyBoard: DailyBoardState;
  weeklyLadder: WeeklyLadderState;
  weeklyEvent: WeeklyEventState;
  seasonPass: SeasonPassState;
  collectionAlbum: CollectionAlbumState;
  personalBestByLevel: Record<string, PersonalBest>;
  energy: EnergyState;
  premium: PremiumState;
};

function dayKey(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10);
}

function weekKey(now: Date = new Date()): string {
  const d = new Date(now.getTime());
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() - day + 1);
  return d.toISOString().slice(0, 10);
}

function addDays(key: string, days: number): string {
  const d = new Date(`${key}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function monthKey(now: Date = new Date()): string {
  return now.toISOString().slice(0, 7);
}

const FREE_DAILY_CAP = 10;
const PREMIUM_DAILY_MULTIPLIER = 3;
export const ENERGY_REFILL_COIN_COST = 120;
export const ENERGY_REFILL_AMOUNT = 3;
const PREMIUM_COSMETIC_SET_ID = "premium-founder-set-v1";
const PREMIUM_COSMETIC_ITEMS = [
  "premium-brush-aurora",
  "premium-brush-obsidian",
  "premium-brush-solar",
  "premium-trail-comet",
  "premium-trail-prism",
  "premium-trail-ember",
  "premium-frame-prism",
  "premium-frame-obsidian",
  "premium-frame-royal"
];

type QuestTemplate = Omit<QuestProgress, "value" | "claimed">;

const DAILY_QUEST_POOL: QuestTemplate[] = [
  { id: "daily_rounds_4", label: "4 round tamamla", metric: "rounds", target: 4, rewardCoins: 45 },
  { id: "daily_stars_10", label: "Toplam 10 yildiz kazan", metric: "stars", target: 10, rewardCoins: 55 },
  { id: "daily_two_plus_2", label: "2 leveli 2+ yildizla bitir", metric: "twoPlusStars", target: 2, rewardCoins: 50 },
  { id: "daily_boss_1", label: "1 boss round dene", metric: "bossAttempts", target: 1, rewardCoins: 60 },
  { id: "daily_xp_750", label: "Toplam 750 XP kazan", metric: "xp", target: 750, rewardCoins: 70 },
  { id: "daily_highacc_2", label: "2 round >90%", metric: "highAccuracy", target: 2, rewardCoins: 65 }
];

const WEEKLY_QUEST_POOL: QuestTemplate[] = [
  { id: "weekly_rounds_18", label: "18 round tamamla", metric: "rounds", target: 18, rewardCoins: 140 },
  { id: "weekly_stars_42", label: "42 yildiz kazan", metric: "stars", target: 42, rewardCoins: 170, rewardGems: 1 },
  { id: "weekly_two_plus_10", label: "10 leveli 2+ yildizla bitir", metric: "twoPlusStars", target: 10, rewardCoins: 180, rewardGems: 1 },
  { id: "weekly_boss_5", label: "5 boss denemesi", metric: "bossAttempts", target: 5, rewardCoins: 210, rewardGems: 2 },
  { id: "weekly_xp_4200", label: "4200 XP kazan", metric: "xp", target: 4200, rewardCoins: 220, rewardGems: 2 },
  { id: "weekly_highacc_8", label: "8 round >90%", metric: "highAccuracy", target: 8, rewardCoins: 220, rewardGems: 2 },
  { id: "weekly_ladder_320", label: "Ladder 320 puana ulas", metric: "ladderPoints", target: 320, rewardCoins: 260, rewardGems: 3 },
  { id: "weekly_rounds_24", label: "24 round tamamla", metric: "rounds", target: 24, rewardCoins: 250, rewardGems: 3 }
];

const WEEKLY_CATCHUP_POOL: QuestTemplate[] = [
  { id: "weekly_catchup_rounds_8", label: "Catch-up: 8 round tamamla", metric: "rounds", target: 8, rewardCoins: 120, rewardGems: 1 },
  { id: "weekly_catchup_xp_1500", label: "Catch-up: 1500 XP kazan", metric: "xp", target: 1500, rewardCoins: 130, rewardGems: 1 },
  { id: "weekly_catchup_stars_16", label: "Catch-up: 16 yildiz kazan", metric: "stars", target: 16, rewardCoins: 130, rewardGems: 1 }
];

function buildEnergyState(now: Date = new Date(), dailyMultiplier: number = 1): EnergyState {
  const safeMultiplier = Math.max(1, Math.floor(dailyMultiplier));
  const cap = FREE_DAILY_CAP * safeMultiplier;
  return {
    dailyKey: dayKey(now),
    dailyCapBase: FREE_DAILY_CAP,
    dailyMultiplier: safeMultiplier,
    current: cap,
    consumedToday: 0
  };
}

function buildPremiumState(): PremiumState {
  return {
    isActive: false,
    adsDisabled: false,
    premiumCosmeticSetId: null,
    monthlySpecialItemId: null,
    monthlySpecialItemMonthKey: null,
    unlockedCosmeticItems: [],
    selectedCosmeticItemId: null,
    selectedBrushId: null,
    selectedTrailId: null,
    selectedFrameId: null,
    activatedAt: null
  };
}

function cosmeticSlotForItem(itemId: string): "brush" | "trail" | "frame" {
  if (itemId.includes("brush")) {
    return "brush";
  }
  if (itemId.includes("trail")) {
    return "trail";
  }
  return "frame";
}

function hashString(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pickQuestTemplates(pool: QuestTemplate[], count: number, key: string): QuestTemplate[] {
  const rng = seededRandom(hashString(key));
  const copy = [...pool];

  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    const temp = copy[i];
    copy[i] = copy[j];
    copy[j] = temp;
  }

  return copy.slice(0, Math.min(count, copy.length));
}

function toQuestProgress(template: QuestTemplate): QuestProgress {
  return {
    ...template,
    value: 0,
    claimed: false
  };
}

function buildDailyBoard(key: string): DailyBoardState {
  const quests = pickQuestTemplates(DAILY_QUEST_POOL, 3, `daily:${key}`).map(toQuestProgress);
  return {
    key,
    quests,
    streakDays: 0,
    lastCompletedKey: null,
    streakChestClaimed: false,
    streakChestAvailable: false
  };
}

function buildWeeklyLadder(key: string): WeeklyLadderState {
  const tiers = pickQuestTemplates(WEEKLY_QUEST_POOL, 5, `weekly:${key}`).map(toQuestProgress);
  const catchUpQuest = toQuestProgress(pickQuestTemplates(WEEKLY_CATCHUP_POOL, 1, `weekly-catchup:${key}`)[0]);
  return {
    key,
    tiers,
    catchUpQuest,
    points: 0
  };
}

function buildWeeklyEvent(startKey: string): WeeklyEventState {
  return {
    id: `event-${startKey}`,
    startKey,
    endKey: addDays(startKey, 6),
    rewardChestClaimed: false,
    quests: [
      { id: "ev_q1", label: "3 round oyna", type: "rounds", metric: "rounds", target: 3, value: 0, rewardCoins: 35, claimed: false },
      { id: "ev_q2", label: "8 round oyna", type: "rounds", metric: "rounds", target: 8, value: 0, rewardCoins: 70, claimed: false },
      { id: "ev_q3", label: "15 yildiz kazan", type: "stars", metric: "stars", target: 15, value: 0, rewardCoins: 75, claimed: false },
      { id: "ev_q4", label: "30 yildiz kazan", type: "stars", metric: "stars", target: 30, value: 0, rewardCoins: 120, rewardGems: 1, claimed: false },
      { id: "ev_q5", label: "1200 XP kazan", type: "xp", metric: "xp", target: 1200, value: 0, rewardCoins: 85, claimed: false },
      { id: "ev_q6", label: "2500 XP kazan", type: "xp", metric: "xp", target: 2500, value: 0, rewardCoins: 140, rewardGems: 1, claimed: false },
      { id: "ev_q7", label: "2 boss denemesi", type: "boss", metric: "bossAttempts", target: 2, value: 0, rewardCoins: 90, claimed: false },
      { id: "ev_q8", label: "4 boss denemesi", type: "boss", metric: "bossAttempts", target: 4, value: 0, rewardCoins: 140, rewardGems: 2, claimed: false },
      { id: "ev_q9", label: "2 round >90%", type: "accuracy", metric: "highAccuracy", target: 2, value: 0, rewardCoins: 70, claimed: false },
      { id: "ev_q10", label: "5 round >90%", type: "accuracy", metric: "highAccuracy", target: 5, value: 0, rewardCoins: 120, claimed: false },
      { id: "ev_q11", label: "12 round oyna", type: "rounds", metric: "rounds", target: 12, value: 0, rewardCoins: 110, claimed: false },
      { id: "ev_q12", label: "45 yildiz kazan", type: "stars", metric: "stars", target: 45, value: 0, rewardCoins: 180, rewardGems: 3, claimed: false }
    ]
  };
}

function buildSeasonPass(startKey: string): SeasonPassState {
  return {
    id: `season-${startKey}`,
    startKey,
    durationDays: 28,
    premiumUnlocked: false,
    tierXp: 0,
    claimedFreeTiers: [],
    claimedPremiumTiers: []
  };
}

export const DEFAULT_PROGRESSION: ProgressionState = {
  cumulativeXp: 0,
  completedRounds: 0,
  coins: 0,
  gems: 0,
  bestStarsByLevel: {},
  unlockedLevels: [DEFAULT_LEVEL_ID],
  masteryXpByTrack: {
    circle: 0,
    corner: 0,
    curve: 0
  },
  masteryUnlocks: {
    cosmetics: [],
    badges: [],
    specialChallenges: []
  },
  dailyBoard: buildDailyBoard(dayKey()),
  weeklyLadder: buildWeeklyLadder(weekKey()),
  weeklyEvent: buildWeeklyEvent(weekKey()),
  seasonPass: buildSeasonPass(dayKey()),
  collectionAlbum: {
    piecesByChapter: {},
    completedSets: [],
    unlockedFrames: []
  },
  personalBestByLevel: {},
  energy: buildEnergyState(),
  premium: buildPremiumState()
};

function isValidStars(value: unknown): value is 0 | 1 | 2 | 3 {
  return value === 0 || value === 1 || value === 2 || value === 3;
}

function masteryTrackForShape(shape: string): MasteryTrack {
  if (shape === "circle") {
    return "circle";
  }
  if (shape === "square" || shape === "triangle" || shape === "diamond" || shape === "star" || shape === "pentagon" || shape === "hexagon") {
    return "corner";
  }
  return "curve";
}

function ensureDayWeekResets(state: ProgressionState): ProgressionState {
  const today = dayKey();
  const week = weekKey();
  const month = monthKey();
  const multiplier = state.premium.isActive ? PREMIUM_DAILY_MULTIPLIER : 1;
  const cap = FREE_DAILY_CAP * multiplier;

  const previousEnergy = state.energy || buildEnergyState(new Date(), multiplier);
  const energy: EnergyState =
    previousEnergy.dailyKey === today
      ? {
          ...previousEnergy,
          dailyCapBase: FREE_DAILY_CAP,
          dailyMultiplier: multiplier,
          current: Math.min(cap, Math.max(0, previousEnergy.current))
        }
      : {
          dailyKey: today,
          dailyCapBase: FREE_DAILY_CAP,
          dailyMultiplier: multiplier,
          current: cap,
          consumedToday: 0
        };

  const premiumBase = state.premium || buildPremiumState();
  let premium = premiumBase;
  if (premiumBase.isActive && premiumBase.monthlySpecialItemMonthKey !== month) {
    const monthlyItemId = `premium-monthly-${month.replace("-", "")}`;
    premium = {
      ...premiumBase,
      monthlySpecialItemId: monthlyItemId,
      monthlySpecialItemMonthKey: month,
      unlockedCosmeticItems: Array.from(new Set([...premiumBase.unlockedCosmeticItems, monthlyItemId]))
    };
  }

  return {
    ...state,
    dailyBoard: state.dailyBoard.key === today ? state.dailyBoard : buildDailyBoard(today),
    weeklyLadder: state.weeklyLadder.key === week ? state.weeklyLadder : buildWeeklyLadder(week),
    weeklyEvent: state.weeklyEvent.startKey === week ? state.weeklyEvent : buildWeeklyEvent(week),
    energy,
    premium
  };
}

function sanitizeProgression(value: unknown): ProgressionState {
  if (!value || typeof value !== "object") {
    return DEFAULT_PROGRESSION;
  }

  const raw = value as Partial<ProgressionState>;
  const unlockedLevels = Array.isArray(raw.unlockedLevels)
    ? raw.unlockedLevels.filter((entry): entry is string => typeof entry === "string" && entry.length > 0)
    : [];

  const bestStarsByLevel: Record<string, 0 | 1 | 2 | 3> = {};
  if (raw.bestStarsByLevel && typeof raw.bestStarsByLevel === "object") {
    for (const [key, stars] of Object.entries(raw.bestStarsByLevel)) {
      if (typeof key === "string" && key.length > 0 && isValidStars(stars)) {
        bestStarsByLevel[key] = stars;
      }
    }
  }

  const merged: ProgressionState = {
    ...DEFAULT_PROGRESSION,
    ...raw,
    cumulativeXp: typeof raw.cumulativeXp === "number" ? Math.max(0, raw.cumulativeXp) : 0,
    completedRounds: typeof raw.completedRounds === "number" ? Math.max(0, raw.completedRounds) : 0,
    coins: typeof raw.coins === "number" ? Math.max(0, raw.coins) : 0,
    gems: typeof raw.gems === "number" ? Math.max(0, raw.gems) : 0,
    bestStarsByLevel,
    unlockedLevels: Array.from(new Set([DEFAULT_LEVEL_ID, ...unlockedLevels])),
    masteryXpByTrack: {
      circle: typeof raw.masteryXpByTrack?.circle === "number" ? Math.max(0, raw.masteryXpByTrack.circle) : 0,
      corner: typeof raw.masteryXpByTrack?.corner === "number" ? Math.max(0, raw.masteryXpByTrack.corner) : 0,
      curve: typeof raw.masteryXpByTrack?.curve === "number" ? Math.max(0, raw.masteryXpByTrack.curve) : 0
    },
    masteryUnlocks: {
      cosmetics: Array.isArray(raw.masteryUnlocks?.cosmetics) ? raw.masteryUnlocks.cosmetics : [],
      badges: Array.isArray(raw.masteryUnlocks?.badges) ? raw.masteryUnlocks.badges : [],
      specialChallenges: Array.isArray(raw.masteryUnlocks?.specialChallenges)
        ? raw.masteryUnlocks.specialChallenges
        : []
    },
    dailyBoard:
      raw.dailyBoard && typeof raw.dailyBoard.key === "string"
        ? {
            ...buildDailyBoard(raw.dailyBoard.key),
            ...raw.dailyBoard,
            quests: Array.isArray(raw.dailyBoard.quests) ? raw.dailyBoard.quests : buildDailyBoard(raw.dailyBoard.key).quests
          }
        : buildDailyBoard(dayKey()),
    weeklyLadder:
      raw.weeklyLadder && typeof raw.weeklyLadder.key === "string"
        ? {
            ...buildWeeklyLadder(raw.weeklyLadder.key),
            ...raw.weeklyLadder,
            tiers: Array.isArray(raw.weeklyLadder.tiers) ? raw.weeklyLadder.tiers : buildWeeklyLadder(raw.weeklyLadder.key).tiers
          }
        : buildWeeklyLadder(weekKey()),
    weeklyEvent:
      raw.weeklyEvent && typeof raw.weeklyEvent.startKey === "string"
        ? {
            ...buildWeeklyEvent(raw.weeklyEvent.startKey),
            ...raw.weeklyEvent,
            quests: Array.isArray(raw.weeklyEvent.quests) ? raw.weeklyEvent.quests : buildWeeklyEvent(raw.weeklyEvent.startKey).quests
          }
        : buildWeeklyEvent(weekKey()),
    seasonPass:
      raw.seasonPass && typeof raw.seasonPass.startKey === "string"
        ? {
            ...buildSeasonPass(raw.seasonPass.startKey),
            ...raw.seasonPass,
            claimedFreeTiers: Array.isArray(raw.seasonPass.claimedFreeTiers) ? raw.seasonPass.claimedFreeTiers : [],
            claimedPremiumTiers: Array.isArray(raw.seasonPass.claimedPremiumTiers) ? raw.seasonPass.claimedPremiumTiers : []
          }
        : buildSeasonPass(dayKey()),
    collectionAlbum: {
      piecesByChapter: raw.collectionAlbum?.piecesByChapter || {},
      completedSets: Array.isArray(raw.collectionAlbum?.completedSets) ? raw.collectionAlbum.completedSets : [],
      unlockedFrames: Array.isArray(raw.collectionAlbum?.unlockedFrames) ? raw.collectionAlbum.unlockedFrames : []
    },
    personalBestByLevel: raw.personalBestByLevel || {},
    energy:
      raw.energy && typeof raw.energy.dailyKey === "string"
        ? {
            dailyKey: raw.energy.dailyKey,
            dailyCapBase: typeof raw.energy.dailyCapBase === "number" ? Math.max(1, raw.energy.dailyCapBase) : FREE_DAILY_CAP,
            dailyMultiplier: typeof raw.energy.dailyMultiplier === "number" ? Math.max(1, Math.floor(raw.energy.dailyMultiplier)) : 1,
            current: typeof raw.energy.current === "number" ? Math.max(0, Math.floor(raw.energy.current)) : FREE_DAILY_CAP,
            consumedToday:
              typeof raw.energy.consumedToday === "number" ? Math.max(0, Math.floor(raw.energy.consumedToday)) : 0
          }
        : buildEnergyState(),
    premium:
      raw.premium && typeof raw.premium === "object"
        ? {
            isActive: Boolean(raw.premium.isActive),
            adsDisabled: Boolean(raw.premium.adsDisabled),
            premiumCosmeticSetId:
              typeof raw.premium.premiumCosmeticSetId === "string" ? raw.premium.premiumCosmeticSetId : null,
            monthlySpecialItemId:
              typeof raw.premium.monthlySpecialItemId === "string" ? raw.premium.monthlySpecialItemId : null,
            monthlySpecialItemMonthKey:
              typeof raw.premium.monthlySpecialItemMonthKey === "string" ? raw.premium.monthlySpecialItemMonthKey : null,
            unlockedCosmeticItems: Array.isArray(raw.premium.unlockedCosmeticItems)
              ? raw.premium.unlockedCosmeticItems.filter((entry): entry is string => typeof entry === "string")
              : [],
            selectedCosmeticItemId:
              typeof raw.premium.selectedCosmeticItemId === "string" ? raw.premium.selectedCosmeticItemId : null,
            selectedBrushId:
              typeof raw.premium.selectedBrushId === "string" ? raw.premium.selectedBrushId : null,
            selectedTrailId:
              typeof raw.premium.selectedTrailId === "string" ? raw.premium.selectedTrailId : null,
            selectedFrameId:
              typeof raw.premium.selectedFrameId === "string" ? raw.premium.selectedFrameId : null,
            activatedAt: typeof raw.premium.activatedAt === "number" ? raw.premium.activatedAt : null
          }
        : buildPremiumState()
  };

  return ensureDayWeekResets(merged);
}

export async function loadProgression(): Promise<ProgressionState> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return DEFAULT_PROGRESSION;
    }
    return sanitizeProgression(JSON.parse(raw));
  } catch {
    return DEFAULT_PROGRESSION;
  }
}

export async function saveProgression(state: ProgressionState): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function metricIncrement(
  quest: QuestProgress,
  args: { rounds: number; stars: number; xpGained: number; isBoss: boolean; highAccuracy: boolean; ladderPointsGain: number }
): number {
  if (quest.metric === "rounds") {
    return args.rounds;
  }
  if (quest.metric === "stars") {
    return args.stars;
  }
  if (quest.metric === "xp") {
    return args.xpGained;
  }
  if (quest.metric === "twoPlusStars") {
    return args.stars >= 2 ? 1 : 0;
  }
  if (quest.metric === "bossAttempts") {
    return args.isBoss ? 1 : 0;
  }
  if (quest.metric === "highAccuracy") {
    return args.highAccuracy ? 1 : 0;
  }
  if (quest.metric === "ladderPoints") {
    return args.ladderPointsGain;
  }
  return 0;
}

function updateDailyQuestValues(
  state: DailyBoardState,
  args: { stars: number; xpGained: number; isBoss: boolean; accuracyPercent: number; ladderPointsGain: number }
): DailyBoardState {
  const quests = state.quests.map((quest) => ({
    ...quest,
    value: Math.min(
      quest.target,
      quest.value +
        metricIncrement(quest, {
          rounds: 1,
          stars: args.stars,
          xpGained: args.xpGained,
          isBoss: args.isBoss,
          highAccuracy: args.accuracyPercent >= 90,
          ladderPointsGain: args.ladderPointsGain
        })
    )
  }));

  const allComplete = quests.every((q) => q.value >= q.target);
  return {
    ...state,
    quests,
    streakChestAvailable: allComplete
  };
}

function updateWeeklyLadderValues(state: WeeklyLadderState, args: { stars: number; accuracyPercent: number; isBoss: boolean; xpGained: number }): WeeklyLadderState {
  const pointsGain = args.stars * 3 + (args.accuracyPercent >= 90 ? 3 : 0) + (args.isBoss ? 6 : 0);
  const points = state.points + pointsGain;

  const tiers = state.tiers.map((tier) => ({
    ...tier,
    value: Math.min(
      tier.target,
      tier.value +
        metricIncrement(tier, {
          rounds: 1,
          stars: args.stars,
          xpGained: args.xpGained,
          isBoss: args.isBoss,
          highAccuracy: args.accuracyPercent >= 90,
          ladderPointsGain: pointsGain
        })
    )
  }));

  const catchUpQuest = {
    ...state.catchUpQuest,
    value: Math.min(
      state.catchUpQuest.target,
      state.catchUpQuest.value +
        metricIncrement(state.catchUpQuest, {
          rounds: 1,
          stars: args.stars,
          xpGained: args.xpGained,
          isBoss: args.isBoss,
          highAccuracy: args.accuracyPercent >= 90,
          ladderPointsGain: pointsGain
        })
    )
  };

  return {
    ...state,
    points,
    tiers,
    catchUpQuest
  };
}

function updateEventQuests(state: WeeklyEventState, args: { rounds: number; stars: number; xp: number; isBoss: boolean; highAccuracy: boolean }): WeeklyEventState {
  return {
    ...state,
    quests: state.quests.map((quest) => {
      if (quest.type === "rounds") {
        return { ...quest, value: Math.min(quest.target, quest.value + args.rounds) };
      }
      if (quest.type === "stars") {
        return { ...quest, value: Math.min(quest.target, quest.value + args.stars) };
      }
      if (quest.type === "xp") {
        return { ...quest, value: Math.min(quest.target, quest.value + args.xp) };
      }
      if (quest.type === "boss") {
        return { ...quest, value: Math.min(quest.target, quest.value + (args.isBoss ? 1 : 0)) };
      }
      if (quest.type === "accuracy") {
        return { ...quest, value: Math.min(quest.target, quest.value + (args.highAccuracy ? 1 : 0)) };
      }
      return quest;
    })
  };
}

function unlockMasteryRewards(state: ProgressionState): ProgressionState {
  const levels = getMasteryLevels(state);
  const cosmetics = new Set(state.masteryUnlocks.cosmetics);
  const badges = new Set(state.masteryUnlocks.badges);
  const specialChallenges = new Set(state.masteryUnlocks.specialChallenges);

  if (levels.circle >= 4) {
    cosmetics.add("circle-neon-skin");
  }
  if (levels.corner >= 4) {
    badges.add("badge-corner-ace");
  }
  if (levels.curve >= 4) {
    specialChallenges.add("challenge-curve-rush");
  }
  if (levels.circle >= 7) {
    cosmetics.add("orbit-frame");
  }
  if (levels.corner >= 7) {
    specialChallenges.add("challenge-corner-iron");
  }
  if (levels.curve >= 7) {
    badges.add("badge-curve-artist");
  }

  return {
    ...state,
    masteryUnlocks: {
      cosmetics: Array.from(cosmetics),
      badges: Array.from(badges),
      specialChallenges: Array.from(specialChallenges)
    }
  };
}

function updateCollectionAlbum(
  album: CollectionAlbumState,
  chapterId: string,
  stars: number
): CollectionAlbumState {
  if (stars < 1) {
    return album;
  }

  const nextPiecesByChapter = {
    ...album.piecesByChapter,
    [chapterId]: Math.min(8, (album.piecesByChapter[chapterId] || 0) + 1)
  };

  const completedSets = new Set(album.completedSets);
  const unlockedFrames = new Set(album.unlockedFrames);
  if (nextPiecesByChapter[chapterId] >= 8) {
    completedSets.add(chapterId);
    unlockedFrames.add(`frame-${chapterId}`);
  }

  return {
    piecesByChapter: nextPiecesByChapter,
    completedSets: Array.from(completedSets),
    unlockedFrames: Array.from(unlockedFrames)
  };
}

export function applyRoundProgress(
  current: ProgressionState,
  args: {
    levelId: string;
    stars: 0 | 1 | 2 | 3;
    xpGained: number;
    accuracyPercent: number;
    targetShape: string;
    durationMs?: number;
    nextLevelId?: string | null;
  }
): ProgressionState {
  const normalized = ensureDayWeekResets(current);
  const level = getLevelById(args.levelId);
  const effectiveXp = Math.max(0, Math.round(args.xpGained * level.rewardMultiplier));
  const bossCoinBonus = level.isBoss ? 35 : 0;

  const previousBest = normalized.bestStarsByLevel[args.levelId] ?? 0;
  const nextBest = args.stars > previousBest ? args.stars : previousBest;
  const bestStarsByLevel = {
    ...normalized.bestStarsByLevel,
    [args.levelId]: nextBest
  };

  let unlockedLevels = Array.from(new Set([...normalized.unlockedLevels, args.levelId]));
  if (args.nextLevelId && args.stars >= 1) {
    const requiredStars = getRequiredStarsForLevel(args.nextLevelId);
    const projectedStars = getTotalBestStars({ ...normalized, bestStarsByLevel });
    if (projectedStars >= requiredStars) {
      unlockedLevels = Array.from(new Set([...unlockedLevels, args.nextLevelId]));
    }
  }

  const chapterUnlockedLevels = LEVEL_PACK_V1.filter((candidate) => {
    const projectedStars = getTotalBestStars({ ...normalized, bestStarsByLevel });
    const chapterUnlocked = getUnlockedChapterIds(projectedStars);
    return chapterUnlocked.includes(candidate.chapterId);
  }).map((candidate) => candidate.id);

  unlockedLevels = Array.from(new Set([...unlockedLevels, ...chapterUnlockedLevels]));

  const masteryTrack = masteryTrackForShape(args.targetShape);
  const masteryXpByTrack = {
    ...normalized.masteryXpByTrack,
    [masteryTrack]: normalized.masteryXpByTrack[masteryTrack] + effectiveXp
  };

  const dailyBoard = updateDailyQuestValues(normalized.dailyBoard, {
    stars: args.stars,
    xpGained: effectiveXp,
    isBoss: level.isBoss,
    accuracyPercent: args.accuracyPercent,
    ladderPointsGain: args.stars * 3 + (args.accuracyPercent >= 90 ? 3 : 0) + (level.isBoss ? 6 : 0)
  });

  const weeklyLadder = updateWeeklyLadderValues(normalized.weeklyLadder, {
    stars: args.stars,
    accuracyPercent: args.accuracyPercent,
    isBoss: level.isBoss,
    xpGained: effectiveXp
  });

  const weeklyEvent = updateEventQuests(normalized.weeklyEvent, {
    rounds: 1,
    stars: args.stars,
    xp: effectiveXp,
    isBoss: level.isBoss,
    highAccuracy: args.accuracyPercent >= 90
  });

  const seasonPass = {
    ...normalized.seasonPass,
    tierXp: normalized.seasonPass.tierXp + effectiveXp + args.stars * 6
  };

  const personalBest = normalized.personalBestByLevel[args.levelId];
  const candidateBest: PersonalBest = {
    accuracyPercent: args.accuracyPercent,
    durationMs: Math.max(0, args.durationMs || 0),
    updatedAt: Date.now()
  };
  const shouldReplaceBest =
    !personalBest ||
    candidateBest.accuracyPercent > personalBest.accuracyPercent ||
    (candidateBest.accuracyPercent === personalBest.accuracyPercent && candidateBest.durationMs < personalBest.durationMs);

  const personalBestByLevel = shouldReplaceBest
    ? {
        ...normalized.personalBestByLevel,
        [args.levelId]: candidateBest
      }
    : normalized.personalBestByLevel;

  const nextState: ProgressionState = {
    ...normalized,
    cumulativeXp: normalized.cumulativeXp + effectiveXp,
    completedRounds: normalized.completedRounds + 1,
    coins: normalized.coins + bossCoinBonus,
    bestStarsByLevel,
    unlockedLevels,
    masteryXpByTrack,
    dailyBoard,
    weeklyLadder,
    weeklyEvent,
    seasonPass,
    collectionAlbum: updateCollectionAlbum(normalized.collectionAlbum, level.chapterId, args.stars),
    personalBestByLevel
  };

  return unlockMasteryRewards(nextState);
}

export function markQuestClaimed(
  state: ProgressionState,
  boardType: "daily" | "weekly",
  questId: string,
  rewardCoins: number,
  rewardGems: number = 0
): ProgressionState {
  if (boardType === "daily") {
    return {
      ...state,
      coins: state.coins + rewardCoins,
      gems: state.gems + rewardGems,
      dailyBoard: {
        ...state.dailyBoard,
        quests: state.dailyBoard.quests.map((quest) =>
          quest.id === questId ? { ...quest, claimed: true } : quest
        )
      }
    };
  }

  const updatedTiers = state.weeklyLadder.tiers.map((tier) =>
    tier.id === questId ? { ...tier, claimed: true } : tier
  );
  const updatedCatchUp =
    state.weeklyLadder.catchUpQuest.id === questId
      ? { ...state.weeklyLadder.catchUpQuest, claimed: true }
      : state.weeklyLadder.catchUpQuest;

  return {
    ...state,
    coins: state.coins + rewardCoins,
    gems: state.gems + rewardGems,
    weeklyLadder: {
      ...state.weeklyLadder,
      tiers: updatedTiers,
      catchUpQuest: updatedCatchUp
    }
  };
}

export function markSeasonTierClaimed(
  state: ProgressionState,
  tier: number,
  rewardCoins: number,
  premiumTrack: boolean
): ProgressionState {
  const target = premiumTrack ? state.seasonPass.claimedPremiumTiers : state.seasonPass.claimedFreeTiers;
  if (target.includes(tier)) {
    return state;
  }

  return {
    ...state,
    coins: state.coins + rewardCoins,
    seasonPass: {
      ...state.seasonPass,
      claimedFreeTiers: premiumTrack ? state.seasonPass.claimedFreeTiers : [...state.seasonPass.claimedFreeTiers, tier],
      claimedPremiumTiers: premiumTrack
        ? [...state.seasonPass.claimedPremiumTiers, tier]
        : state.seasonPass.claimedPremiumTiers
    }
  };
}

export function claimDailyStreakChest(state: ProgressionState): ProgressionState {
  if (!state.dailyBoard.streakChestAvailable || state.dailyBoard.streakChestClaimed) {
    return state;
  }

  const nowKey = dayKey();
  const streakDays = state.dailyBoard.lastCompletedKey === nowKey ? state.dailyBoard.streakDays : state.dailyBoard.streakDays + 1;

  return {
    ...state,
    coins: state.coins + 90,
    gems: state.gems + (streakDays % 3 === 0 ? 1 : 0),
    dailyBoard: {
      ...state.dailyBoard,
      streakDays,
      lastCompletedKey: nowKey,
      streakChestClaimed: true
    }
  };
}

export function getTotalBestStars(state: ProgressionState): number {
  return Object.values(state.bestStarsByLevel).reduce<number>((sum, stars) => sum + stars, 0);
}

function masteryLevelFromXp(xp: number): number {
  return Math.floor(Math.sqrt(Math.max(0, xp) / 170)) + 1;
}

export function getMasteryLevels(state: ProgressionState): Record<MasteryTrack, number> {
  return {
    circle: masteryLevelFromXp(state.masteryXpByTrack.circle),
    corner: masteryLevelFromXp(state.masteryXpByTrack.corner),
    curve: masteryLevelFromXp(state.masteryXpByTrack.curve)
  };
}

export function getQuestCompletionStats(board: { quests: QuestProgress[] }): { done: number; total: number } {
  const done = board.quests.filter((q) => q.value >= q.target).length;
  return {
    done,
    total: board.quests.length
  };
}

export function getChapterUnlockProgress(state: ProgressionState): Array<{
  id: string;
  title: string;
  requiredStars: number;
  unlocked: boolean;
}> {
  const stars = getTotalBestStars(state);
  return CHAPTERS.map((chapter) => ({
    id: chapter.id,
    title: chapter.title,
    requiredStars: chapter.requiredStars,
    unlocked: stars >= chapter.requiredStars
  }));
}

export function getSeasonTier(state: ProgressionState): number {
  return Math.floor(state.seasonPass.tierXp / 300) + 1;
}

export function getClaimableDailyQuests(state: ProgressionState): QuestProgress[] {
  return state.dailyBoard.quests.filter((quest) => quest.value >= quest.target && !quest.claimed);
}

export function getClaimableWeeklyQuests(state: ProgressionState): QuestProgress[] {
  const tiers = state.weeklyLadder.tiers.filter((tier) => tier.value >= tier.target && !tier.claimed);
  const catchup =
    state.weeklyLadder.catchUpQuest.value >= state.weeklyLadder.catchUpQuest.target && !state.weeklyLadder.catchUpQuest.claimed
      ? [state.weeklyLadder.catchUpQuest]
      : [];
  return [...tiers, ...catchup];
}

export function getClaimableSeasonTiers(state: ProgressionState): number[] {
  const currentTier = getSeasonTier(state);
  const claimable: number[] = [];
  for (let tier = 1; tier <= currentTier; tier += 1) {
    if (!state.seasonPass.claimedFreeTiers.includes(tier)) {
      claimable.push(tier);
    }
  }
  return claimable;
}

export function getMechanicSummary(levelId: string): { tag: MechanicTag; isBoss: boolean } {
  const level = getLevelById(levelId);
  return {
    tag: level.mechanicTag,
    isBoss: level.isBoss
  };
}

export function refreshProgressionState(state: ProgressionState): ProgressionState {
  return ensureDayWeekResets(state);
}

export function consumeEnergyForPlay(state: ProgressionState): {
  accepted: boolean;
  nextState: ProgressionState;
  remaining: number;
} {
  const normalized = ensureDayWeekResets(state);
  if (normalized.energy.current <= 0) {
    return {
      accepted: false,
      nextState: normalized,
      remaining: 0
    };
  }

  const nextEnergy: EnergyState = {
    ...normalized.energy,
    current: Math.max(0, normalized.energy.current - 1),
    consumedToday: normalized.energy.consumedToday + 1
  };

  const nextState: ProgressionState = {
    ...normalized,
    energy: nextEnergy
  };

  return {
    accepted: true,
    nextState,
    remaining: nextEnergy.current
  };
}

export function buyEnergyRefill(state: ProgressionState): {
  accepted: boolean;
  reason?: "insufficient_coins" | "energy_full";
  nextState: ProgressionState;
  spentCoins: number;
  gainedEnergy: number;
} {
  const normalized = ensureDayWeekResets(state);
  const cap = normalized.energy.dailyCapBase * normalized.energy.dailyMultiplier;
  if (normalized.energy.current >= cap) {
    return {
      accepted: false,
      reason: "energy_full",
      nextState: normalized,
      spentCoins: 0,
      gainedEnergy: 0
    };
  }

  if (normalized.coins < ENERGY_REFILL_COIN_COST) {
    return {
      accepted: false,
      reason: "insufficient_coins",
      nextState: normalized,
      spentCoins: 0,
      gainedEnergy: 0
    };
  }

  const gainedEnergy = Math.max(0, Math.min(ENERGY_REFILL_AMOUNT, cap - normalized.energy.current));
  return {
    accepted: true,
    nextState: {
      ...normalized,
      coins: normalized.coins - ENERGY_REFILL_COIN_COST,
      energy: {
        ...normalized.energy,
        current: normalized.energy.current + gainedEnergy
      }
    },
    spentCoins: ENERGY_REFILL_COIN_COST,
    gainedEnergy
  };
}

export function activatePremiumBenefits(state: ProgressionState, now: Date = new Date()): ProgressionState {
  const normalized = ensureDayWeekResets(state);
  const month = monthKey(now);
  const monthlyItemId = `premium-monthly-${month.replace("-", "")}`;
  const upgradedCap = FREE_DAILY_CAP * PREMIUM_DAILY_MULTIPLIER;
  const energyDelta = upgradedCap - normalized.energy.current;

  return {
    ...normalized,
    energy: {
      ...normalized.energy,
      dailyMultiplier: PREMIUM_DAILY_MULTIPLIER,
      current: Math.max(0, normalized.energy.current + Math.max(0, energyDelta))
    },
    premium: {
      isActive: true,
      adsDisabled: true,
      premiumCosmeticSetId: PREMIUM_COSMETIC_SET_ID,
      monthlySpecialItemId: monthlyItemId,
      monthlySpecialItemMonthKey: month,
      unlockedCosmeticItems: Array.from(new Set([...normalized.premium.unlockedCosmeticItems, ...PREMIUM_COSMETIC_ITEMS, monthlyItemId])),
      selectedCosmeticItemId:
        normalized.premium.selectedCosmeticItemId ||
        normalized.premium.monthlySpecialItemId ||
        PREMIUM_COSMETIC_ITEMS[0],
      selectedBrushId: normalized.premium.selectedBrushId || "premium-brush-aurora",
      selectedTrailId: normalized.premium.selectedTrailId || "premium-trail-comet",
      selectedFrameId: normalized.premium.selectedFrameId || monthlyItemId,
      activatedAt: normalized.premium.activatedAt || now.getTime()
    },
    seasonPass: {
      ...normalized.seasonPass,
      premiumUnlocked: true
    }
  };
}

export function selectPremiumCosmeticItem(state: ProgressionState, itemId: string): ProgressionState {
  if (!state.premium.unlockedCosmeticItems.includes(itemId)) {
    return state;
  }

  const slot = cosmeticSlotForItem(itemId);

  return {
    ...state,
    premium: {
      ...state.premium,
      selectedCosmeticItemId: itemId,
      selectedBrushId: slot === "brush" ? itemId : state.premium.selectedBrushId,
      selectedTrailId: slot === "trail" ? itemId : state.premium.selectedTrailId,
      selectedFrameId: slot === "frame" ? itemId : state.premium.selectedFrameId
    }
  };
}

export function applyEntitlementSnapshot(
  state: ProgressionState,
  snapshot: {
    premiumActive: boolean;
    adsDisabled: boolean;
    dailyEnergyMultiplier: number;
    premiumCosmeticSetId?: string | null;
    monthlySpecialItemId?: string | null;
    monthlySpecialItemMonthKey?: string | null;
    unlockedCosmeticItems?: string[];
  }
): ProgressionState {
  if (!snapshot.premiumActive) {
    return state;
  }

  const mergedItems = Array.from(new Set([...(state.premium.unlockedCosmeticItems || []), ...(snapshot.unlockedCosmeticItems || [])]));
  const multiplier = Math.max(1, Math.floor(snapshot.dailyEnergyMultiplier || 1));
  const cap = FREE_DAILY_CAP * multiplier;

  return {
    ...state,
    energy: {
      ...state.energy,
      dailyMultiplier: multiplier,
      current: Math.min(cap, Math.max(state.energy.current, cap))
    },
    premium: {
      ...state.premium,
      isActive: true,
      adsDisabled: snapshot.adsDisabled,
      premiumCosmeticSetId: snapshot.premiumCosmeticSetId || state.premium.premiumCosmeticSetId,
      monthlySpecialItemId: snapshot.monthlySpecialItemId || state.premium.monthlySpecialItemId,
      monthlySpecialItemMonthKey: snapshot.monthlySpecialItemMonthKey || state.premium.monthlySpecialItemMonthKey,
      unlockedCosmeticItems: mergedItems,
      selectedCosmeticItemId: state.premium.selectedCosmeticItemId || mergedItems[0] || null,
      selectedBrushId: state.premium.selectedBrushId || mergedItems.find((item) => cosmeticSlotForItem(item) === "brush") || null,
      selectedTrailId: state.premium.selectedTrailId || mergedItems.find((item) => cosmeticSlotForItem(item) === "trail") || null,
      selectedFrameId: state.premium.selectedFrameId || mergedItems.find((item) => cosmeticSlotForItem(item) === "frame") || null,
      activatedAt: state.premium.activatedAt || Date.now()
    }
  };
}

export function getEnergySnapshot(state: ProgressionState): {
  current: number;
  cap: number;
  multiplier: number;
  isPremium: boolean;
} {
  const normalized = ensureDayWeekResets(state);
  return {
    current: normalized.energy.current,
    cap: normalized.energy.dailyCapBase * normalized.energy.dailyMultiplier,
    multiplier: normalized.energy.dailyMultiplier,
    isPremium: normalized.premium.isActive
  };
}
