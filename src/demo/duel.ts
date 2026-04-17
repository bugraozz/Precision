import { createDuelConfig, resolveAsyncDuel } from "../core/duel";
import { Point } from "../core/types";

function buildNoisyLine(seed: number, count: number): Point[] {
  return Array.from({ length: count }, (_, i) => {
    const t = i / Math.max(1, count - 1);
    return {
      x: t,
      y: 0.5 + Math.sin((t + seed) * 9) * 0.06
    };
  });
}

const duel = createDuelConfig({
  duelId: "duel-demo-1",
  targetShape: "circle",
  difficulty: "medium",
  timeLimitMs: 5000,
  scoringVersion: "v2"
});

const result = resolveAsyncDuel(
  duel,
  {
    userId: "player_a",
    points: buildNoisyLine(0.1, 64),
    startedAtMs: 1000,
    endedAtMs: 4300
  },
  {
    userId: "player_b",
    points: buildNoisyLine(0.3, 64),
    startedAtMs: 1000,
    endedAtMs: 4400
  }
);

console.log("Duel Result:", result);
