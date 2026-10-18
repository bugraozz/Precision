export type Point = {
  x: number;
  y: number;
  t?: number;
};

export type Difficulty = "easy" | "medium" | "hard";

export type ScoringVersion = "v1" | "v2";

export type MechanicTag = "speed" | "stability" | "symmetry" | "memory" | "none" | string;

export type ScoreOptions = {
  scoringVersion?: ScoringVersion;
  mechanicTag?: MechanicTag;
  timeTakenMs?: number;
  timeLimitMs?: number;
  canvasMinDim?: number;
};


export type RoundInput = {
  targetShape: string;
  points: Point[];
  timeLimitMs: number;
  startedAtMs: number;
  endedAtMs: number;
  difficulty: Difficulty;
  canvasMinDim?: number;
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
