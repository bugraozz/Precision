import { scoreRound } from "./scoring";
import { Difficulty, Point, ScoringVersion } from "./types";

export type DuelStatus = "waiting" | "active" | "finished";

export type DuelConfig = {
  duelId: string;
  targetShape: string;
  difficulty: Difficulty;
  timeLimitMs: number;
  scoringVersion: ScoringVersion;
};

export type DuelTurn = {
  userId: string;
  points: Point[];
  startedAtMs: number;
  endedAtMs: number;
};

export type DuelResolvedResult = {
  duelId: string;
  winnerUserId: string | null;
  scoreA: number;
  scoreB: number;
  accuracyA: number;
  accuracyB: number;
  starsA: number;
  starsB: number;
};

export function createDuelConfig(params: {
  duelId: string;
  targetShape: string;
  difficulty: Difficulty;
  timeLimitMs: number;
  scoringVersion?: ScoringVersion;
}): DuelConfig {
  return {
    duelId: params.duelId,
    targetShape: params.targetShape,
    difficulty: params.difficulty,
    timeLimitMs: params.timeLimitMs,
    scoringVersion: params.scoringVersion || "v1"
  };
}

export function resolveAsyncDuel(
  config: DuelConfig,
  turnA: DuelTurn,
  turnB: DuelTurn
): DuelResolvedResult {
  const resultA = scoreRound(turnA.points, config.targetShape, config.difficulty, 0, {
    scoringVersion: config.scoringVersion
  });
  const resultB = scoreRound(turnB.points, config.targetShape, config.difficulty, 0, {
    scoringVersion: config.scoringVersion
  });

  const scoreA = resultA.accuracyPercent + resultA.stars * 2;
  const scoreB = resultB.accuracyPercent + resultB.stars * 2;

  let winnerUserId: string | null = null;
  if (Math.abs(scoreA - scoreB) < 0.0001) {
    winnerUserId = null;
  } else {
    winnerUserId = scoreA > scoreB ? turnA.userId : turnB.userId;
  }

  return {
    duelId: config.duelId,
    winnerUserId,
    scoreA: Number(scoreA.toFixed(2)),
    scoreB: Number(scoreB.toFixed(2)),
    accuracyA: resultA.accuracyPercent,
    accuracyB: resultB.accuracyPercent,
    starsA: resultA.stars,
    starsB: resultB.stars
  };
}
