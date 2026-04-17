export type Point = {
  x: number;
  y: number;
  t?: number;
};

export type Difficulty = "easy" | "medium" | "hard";

export type ScoringVersion = "v1" | "v2";

export type RoundInput = {
  targetShape: string;
  points: Point[];
  timeLimitMs: number;
  startedAtMs: number;
  endedAtMs: number;
  difficulty: Difficulty;
};

export type AccuracyResult = {
  accuracyPercent: number;
  meanDeviation: number;
  samplesUsed: number;
};

export type ScoreResult = {
  stars: 0 | 1 | 2 | 3;
  xpGained: number;
  accuracyPercent: number;
};

export type ValidationResult = {
  valid: boolean;
  reasons: string[];
};
