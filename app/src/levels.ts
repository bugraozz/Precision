import { Difficulty } from "../../src/core/types";
import { SHAPE_TEMPLATES } from "../../src/core/shapeTemplates";

type TargetShape = keyof typeof SHAPE_TEMPLATES;

export type MechanicTag = "speed" | "stability" | "symmetry" | "memory";

export type ChapterConfig = {
  id: string;
  index: number;
  title: string;
  requiredStars: number;
  hook: string;
  levelCount: number;
};

export type LevelConfig = {
  id: string;
  index: number;
  chapterId: string;
  chapterIndex: number;
  title: string;
  focusHint: string;
  targetShape: TargetShape;
  difficulty: Difficulty;
  timeLimitMs: number;
  modeHint: "free" | "trace";
  isBoss: boolean;
  mechanicTag: MechanicTag;
  rewardMultiplier: number;
};

export const CHAPTERS: ChapterConfig[] = [
  { id: "chapter-1", index: 1, title: "Foundations", requiredStars: 0, hook: "Core shape control", levelCount: 10 },
  { id: "chapter-2", index: 2, title: "Control", requiredStars: 18, hook: "Stability and rhythm", levelCount: 10 },
  { id: "chapter-3", index: 3, title: "Patterns", requiredStars: 36, hook: "Symmetry mastery", levelCount: 10 },
  { id: "chapter-4", index: 4, title: "Pressure", requiredStars: 54, hook: "Speed under pressure", levelCount: 10 },
  { id: "chapter-5", index: 5, title: "Mastery", requiredStars: 72, hook: "Mixed constraints", levelCount: 10 }
];

const SHAPE_ROTATION: TargetShape[] = [
  "circle",
  "square",
  "triangle",
  "diamond",
  "pentagon",
  "hexagon",
  "heart",
  "star"
];

const CHAPTER_MECHANIC_PLAN: Record<number, MechanicTag[]> = {
  1: ["speed", "speed", "stability", "stability", "symmetry", "symmetry", "memory", "memory", "stability", "memory"],
  2: ["stability", "stability", "stability", "speed", "stability", "symmetry", "stability", "memory", "stability", "memory"],
  3: ["symmetry", "symmetry", "symmetry", "stability", "symmetry", "memory", "symmetry", "speed", "symmetry", "memory"],
  4: ["speed", "speed", "speed", "stability", "speed", "symmetry", "speed", "memory", "speed", "memory"],
  5: ["memory", "speed", "stability", "symmetry", "memory", "speed", "stability", "symmetry", "speed", "memory"]
};

function difficultyFor(chapterIndex: number, levelInChapter: number, isBoss: boolean): Difficulty {
  if (isBoss) {
    return chapterIndex <= 2 ? "medium" : "hard";
  }
  if (chapterIndex <= 2 && levelInChapter <= 4) {
    return "easy";
  }
  if (chapterIndex <= 4 && levelInChapter <= 7) {
    return "medium";
  }
  return "hard";
}

function timeLimitFor(
  chapterIndex: number,
  levelInChapter: number,
  isBoss: boolean,
  mechanicTag: MechanicTag
): number {
  const chapterBase = 6400 - chapterIndex * 420;
  const levelPenalty = levelInChapter * 120;
  const bossPenalty = isBoss ? 850 : 0;

  const mechanicAdjustment =
    mechanicTag === "speed"
      ? -460
      : mechanicTag === "stability"
        ? 260
        : mechanicTag === "symmetry"
          ? 120
          : -160;

  return Math.max(2600, chapterBase - levelPenalty - bossPenalty + mechanicAdjustment);
}

function mechanicFor(chapterIndex: number, levelInChapter: number, isBoss: boolean): MechanicTag {
  if (isBoss) {
    return "memory";
  }

  const plan = CHAPTER_MECHANIC_PLAN[chapterIndex] || CHAPTER_MECHANIC_PLAN[1];
  return plan[levelInChapter - 1] || "memory";
}

function focusHintFor(mechanicTag: MechanicTag): string {
  if (mechanicTag === "speed") {
    return "Beat par time while keeping clean accuracy.";
  }
  if (mechanicTag === "stability") {
    return "Keep one smooth stroke and avoid wobble.";
  }
  if (mechanicTag === "symmetry") {
    return "Balance both sides and keep proportions centered.";
  }
  return "Memorize the target quickly, then draw from recall.";
}

function createCampaignLevels(): LevelConfig[] {
  const levels: LevelConfig[] = [];
  let globalIndex = 1;

  for (const chapter of CHAPTERS) {
    for (let levelInChapter = 1; levelInChapter <= chapter.levelCount; levelInChapter += 1) {
      const isBoss = levelInChapter === chapter.levelCount;
      const mechanicTag = mechanicFor(chapter.index, levelInChapter, isBoss);
      const shape = isBoss
        ? SHAPE_ROTATION[(chapter.index * 2 + levelInChapter) % SHAPE_ROTATION.length]
        : SHAPE_ROTATION[(globalIndex + chapter.index) % SHAPE_ROTATION.length];

      levels.push({
        id: `c${chapter.index}-l${levelInChapter}`,
        index: globalIndex,
        chapterId: chapter.id,
        chapterIndex: chapter.index,
        title: isBoss ? `${chapter.title} Boss Round` : `${chapter.title} ${levelInChapter}`,
        focusHint: focusHintFor(mechanicTag),
        targetShape: shape,
        difficulty: difficultyFor(chapter.index, levelInChapter, isBoss),
        timeLimitMs: timeLimitFor(chapter.index, levelInChapter, isBoss, mechanicTag),
        modeHint: globalIndex % 2 === 0 ? "trace" : "free",
        isBoss,
        mechanicTag,
        rewardMultiplier: isBoss ? 1.8 : 1
      });

      globalIndex += 1;
    }
  }

  return levels;
}

export const LEVEL_PACK_V1: LevelConfig[] = createCampaignLevels();

export const DEFAULT_LEVEL_ID = LEVEL_PACK_V1[0]?.id || "c1-l1";

export function getLevelById(levelId: string): LevelConfig {
  return LEVEL_PACK_V1.find((level) => level.id === levelId) || LEVEL_PACK_V1[0];
}

export function getNextLevelId(levelId: string): string | null {
  const index = LEVEL_PACK_V1.findIndex((level) => level.id === levelId);
  if (index < 0 || index >= LEVEL_PACK_V1.length - 1) {
    return null;
  }
  return LEVEL_PACK_V1[index + 1].id;
}

export function getChapterById(chapterId: string): ChapterConfig | undefined {
  return CHAPTERS.find((chapter) => chapter.id === chapterId);
}

export function getChapterForLevel(levelId: string): ChapterConfig | undefined {
  const level = getLevelById(levelId);
  return getChapterById(level.chapterId);
}

export function getLevelsForChapter(chapterId: string): LevelConfig[] {
  return LEVEL_PACK_V1.filter((level) => level.chapterId === chapterId);
}

export function getRequiredStarsForLevel(levelId: string): number {
  const chapter = getChapterForLevel(levelId);
  return chapter?.requiredStars ?? 0;
}

export function getUnlockedChapterIds(totalBestStars: number): string[] {
  return CHAPTERS.filter((chapter) => totalBestStars >= chapter.requiredStars).map((chapter) => chapter.id);
}
