import { scoreRound } from "../core/scoring";
import { validateRoundPayload } from "../core/antiCheat";
import { Point, RoundInput } from "../core/types";

function buildNoisyCircle(samples: number, noise: number): Point[] {
  return Array.from({ length: samples }, (_, i) => {
    const a = (2 * Math.PI * i) / samples;
    const nx = (Math.random() - 0.5) * noise;
    const ny = (Math.random() - 0.5) * noise;
    return {
      x: Math.cos(a) + nx,
      y: Math.sin(a) + ny
    };
  });
}

const userPoints = buildNoisyCircle(140, 0.08);
const roundInput: RoundInput = {
  targetShape: "circle",
  points: userPoints,
  timeLimitMs: 5000,
  startedAtMs: Date.now() - 4200,
  endedAtMs: Date.now(),
  difficulty: "medium"
};

const validation = validateRoundPayload(roundInput);
if (!validation.valid) {
  console.log("Round rejected:", validation.reasons);
  process.exit(0);
}

const result = scoreRound(userPoints, roundInput.targetShape, roundInput.difficulty, 8);
console.log("Round accepted");
console.log(`Accuracy: ${result.accuracyPercent}%`);
console.log(`Stars: ${result.stars}`);
console.log(`XP: ${result.xpGained}`);
