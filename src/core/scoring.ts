import { distance, normalizeToUnitBox, pathLength, resamplePath } from "./geometry";
import { SHAPE_TEMPLATES } from "./shapeTemplates";
import { AccuracyResult, Difficulty, Point, ScoreResult, ScoringVersion, ScoreOptions } from "./types";

const DIFFICULTY_MULTIPLIER: Record<Difficulty, number> = {
  easy: 1,
  medium: 1.25,
  hard: 1.6
};

export function computeAccuracyPercent(userPoints: Point[], targetShape: string, options?: ScoreOptions): AccuracyResult {
  const template = SHAPE_TEMPLATES[targetShape];
  if (!template) {
    throw new Error(`Unknown shape: ${targetShape}`);
  }

  if (userPoints.length < 2) {
    return {
      accuracyPercent: 0,
      meanDeviation: 1,
      samplesUsed: 0
    };
  }

  const sampleCount = 96;
  const sampledUser = resamplePath(normalizeToUnitBox(userPoints), sampleCount);
  const sampledTemplate = resamplePath(normalizeToUnitBox(template), sampleCount);

  const result = buildAccuracyResult(sampledUser, sampledTemplate, options);
  return {
    ...result,
    accuracyPercent: Number(
      applyStrokeSizeFactor(result.accuracyPercent, userPoints, options).toFixed(2)
    )
  };
}

/* Absolute size guard: normalized unit-box scoring is scale invariant, so a
 * 5px scribble would be graded like a full-screen drawing. When the caller
 * provides the canvas min dimension, strokes whose own bbox is much smaller
 * than the canvas get proportionally dampened accuracy. */
const MIN_STROKE_CANVAS_FRACTION = 0.3;

function strokeBboxMaxDim(points: Point[]): number {
  if (points.length === 0) {
    return 0;
  }
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const p of points) {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }
  return Math.max(0, maxX - minX, maxY - minY);
}

export function applyStrokeSizeFactor(
  accuracyPercent: number,
  userPoints: Point[],
  options?: ScoreOptions
): number {
  const canvasMinDim = options?.canvasMinDim;
  if (!canvasMinDim || canvasMinDim <= 0) {
    return accuracyPercent;
  }
  const sizeThreshold = Math.max(24, canvasMinDim * MIN_STROKE_CANVAS_FRACTION);
  const strokeSize = strokeBboxMaxDim(userPoints);
  if (strokeSize >= sizeThreshold) {
    return accuracyPercent;
  }
  const spread = Math.max(0, Math.min(1, strokeSize / sizeThreshold));
  const sizeFactor = 0.15 + 0.85 * Math.sqrt(spread);
  return Math.max(0, Math.min(100, accuracyPercent * sizeFactor));
}

function calculateSymmetryPenalty(points: Point[]): number {
  if (points.length === 0) return 0;
  let minX = Infinity, maxX = -Infinity;
  for (const p of points) {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
  }
  const centerX = (minX + maxX) / 2;

  let totalSymmetryDiff = 0;
  for (const p of points) {
    const mirroredX = 2 * centerX - p.x;
    let minDist = Infinity;
    for (const target of points) {
      const d = Math.hypot(target.x - mirroredX, target.y - p.y);
      if (d < minDist) minDist = d;
    }
    totalSymmetryDiff += minDist;
  }
  return totalSymmetryDiff / points.length;
}

function buildAccuracyResult(sampledUser: Point[], sampledTemplate: Point[], options?: ScoreOptions): AccuracyResult {
  const sampleCount = sampledTemplate.length;

  let totalDeviation = 0;
  for (let i = 0; i < sampleCount; i += 1) {
    totalDeviation += distance(sampledUser[i], sampledTemplate[i]);
  }

  const meanDeviation = totalDeviation / sampleCount;
  const profilePenalty = shapeProfilePenalty(sampledUser, sampledTemplate, options?.mechanicTag);
  const closurePenalty = closureDistancePenalty(sampledUser, sampledTemplate);
  const perimeterPenalty = perimeterRatioPenalty(sampledUser, sampledTemplate);
  
  let symmetryPenalty = 0;
  if (options?.mechanicTag === "symmetry") {
    symmetryPenalty = calculateSymmetryPenalty(sampledUser);
  }

  let combinedDeviation =
    meanDeviation * (1 + profilePenalty * 5.4) + closurePenalty * 0.16 + perimeterPenalty * 0.14 + symmetryPenalty * 2.5;

  if (options?.mechanicTag === "memory") {
    combinedDeviation *= 0.85;
  }

  const normalizedDeviation = Math.min(1, combinedDeviation / Math.SQRT2);
  const curved = Math.pow(Math.max(0, 1 - normalizedDeviation), 1.18);
  let accuracyPercent = Math.max(0, Math.min(100, curved * 100));

  if (options?.mechanicTag === "speed" && options.timeTakenMs && options.timeLimitMs) {
    const timeRatio = options.timeTakenMs / options.timeLimitMs;
    const speedMultiplier = Math.max(1.0, 1.20 - (0.20 * timeRatio));
    accuracyPercent = Math.min(100, accuracyPercent * speedMultiplier);
  }

  return {
    accuracyPercent: Number(accuracyPercent.toFixed(2)),
    meanDeviation: Number(combinedDeviation.toFixed(4)),
    samplesUsed: sampleCount
  };
}

function closureDistancePenalty(userPoints: Point[], templatePoints: Point[]): number {
  if (userPoints.length < 2 || templatePoints.length < 2) {
    return 0;
  }

  const templateClosure = distance(templatePoints[0], templatePoints[templatePoints.length - 1]);
  if (templateClosure > 0.08) {
    return 0;
  }

  const userClosure = distance(userPoints[0], userPoints[userPoints.length - 1]);
  return Math.min(1, userClosure / 0.22);
}

function perimeterRatioPenalty(userPoints: Point[], templatePoints: Point[]): number {
  const userPerimeter = pathLength(userPoints);
  const templatePerimeter = pathLength(templatePoints);
  if (templatePerimeter <= 1e-6) {
    return 0;
  }

  const ratio = userPerimeter / templatePerimeter;
  return Math.min(1, Math.abs(1 - ratio) / 0.28);
}

function absoluteTurnAngles(points: Point[]): number[] {
  if (points.length < 3) {
    return [];
  }

  const turns: number[] = [];
  for (let i = 1; i < points.length - 1; i += 1) {
    const prev = points[i - 1];
    const curr = points[i];
    const next = points[i + 1];
    const a1 = Math.atan2(curr.y - prev.y, curr.x - prev.x);
    const a2 = Math.atan2(next.y - curr.y, next.x - curr.x);
    let delta = a2 - a1;
    while (delta > Math.PI) {
      delta -= 2 * Math.PI;
    }
    while (delta < -Math.PI) {
      delta += 2 * Math.PI;
    }
    turns.push(Math.abs(delta));
  }

  return turns;
}

function countCornerRuns(turns: number[], threshold: number): number {
  let runs = 0;
  let inRun = false;
  for (const value of turns) {
    if (value >= threshold) {
      if (!inRun) {
        runs += 1;
        inRun = true;
      }
    } else {
      inRun = false;
    }
  }
  return runs;
}

function turnProfile(points: Point[]): { mean: number; stdev: number; cornerRatio: number; cornerRuns: number } {
  const turns = absoluteTurnAngles(points);
  if (turns.length === 0) {
    return { mean: 0, stdev: 0, cornerRatio: 0, cornerRuns: 0 };
  }

  const mean = turns.reduce((sum, value) => sum + value, 0) / turns.length;
  const variance = turns.reduce((sum, value) => sum + (value - mean) * (value - mean), 0) / turns.length;
  const stdev = Math.sqrt(variance);
  const cornerThreshold = 0.55;
  const corners = turns.filter((value) => value >= cornerThreshold).length;
  const cornerRatio = corners / turns.length;
  const cornerRuns = countCornerRuns(turns, cornerThreshold);

  return { mean, stdev, cornerRatio, cornerRuns };
}

function shapeProfilePenalty(userPoints: Point[], templatePoints: Point[], mechanicTag?: string): number {
  const user = turnProfile(userPoints);
  const template = turnProfile(templatePoints);
  const radialUser = radialProfile(userPoints);
  const radialTemplate = radialProfile(templatePoints);
  const areaUser = polygonAreaRatio(userPoints);
  const areaTemplate = polygonAreaRatio(templatePoints);

  const meanDiff = Math.abs(user.mean - template.mean) / Math.PI;
  const stdevDiff = Math.abs(user.stdev - template.stdev) / Math.PI;
  const cornerDiff = Math.abs(user.cornerRatio - template.cornerRatio);
  const cornerRunDiff =
    Math.abs(user.cornerRuns - template.cornerRuns) / Math.max(1, template.cornerRuns || 1);
  const radialStdDiff = Math.abs(radialUser.stdev - radialTemplate.stdev);
  const radialRangeDiff = Math.abs(radialUser.range - radialTemplate.range);
  const areaDiff = Math.abs(areaUser - areaTemplate);

  const isStability = mechanicTag === "stability";
  const cornerDiffW = isStability ? 4.0 : 1.55;
  const cornerRunDiffW = isStability ? 3.5 : 1.35;
  const radialStdDiffW = isStability ? 5.0 : 2.1;

  return Math.min(
    1,
    meanDiff * 0.35 +
      stdevDiff * 0.35 +
      cornerDiff * cornerDiffW +
      cornerRunDiff * cornerRunDiffW +
      radialStdDiff * radialStdDiffW +
      radialRangeDiff * 1.45 +
      areaDiff * 1.7
  );
}

function polygonAreaRatio(points: Point[]): number {
  if (points.length < 3) {
    return 0;
  }

  let sum = 0;
  for (let i = 0; i < points.length; i += 1) {
    const p1 = points[i];
    const p2 = points[(i + 1) % points.length];
    sum += p1.x * p2.y - p2.x * p1.y;
  }

  return Math.abs(sum) / 2;
}

function radialProfile(points: Point[]): { stdev: number; range: number } {
  if (points.length === 0) {
    return { stdev: 0, range: 0 };
  }

  const center = points.reduce(
    (acc, point) => ({ x: acc.x + point.x, y: acc.y + point.y }),
    { x: 0, y: 0 }
  );
  center.x /= points.length;
  center.y /= points.length;

  const radii = points.map((point) => Math.hypot(point.x - center.x, point.y - center.y));
  const mean = radii.reduce((sum, value) => sum + value, 0) / radii.length;
  const variance = radii.reduce((sum, value) => sum + (value - mean) * (value - mean), 0) / radii.length;
  const stdev = Math.sqrt(variance);
  const min = Math.min(...radii);
  const max = Math.max(...radii);
  const range = mean > 1e-9 ? (max - min) / mean : 0;

  return { stdev, range };
}

function rotateAroundCenter(points: Point[], radians: number): Point[] {
  const cx = 0.5;
  const cy = 0.5;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);

  return points.map((p) => {
    const dx = p.x - cx;
    const dy = p.y - cy;
    return {
      x: cx + dx * cos - dy * sin,
      y: cy + dx * sin + dy * cos,
      t: p.t
    };
  });
}

function findBestAlignedAccuracy(sampledUser: Point[], sampledTemplate: Point[], options?: ScoreOptions): AccuracyResult {
  const candidates: Point[][] = [sampledUser, sampledUser.slice().reverse()];
  const angleSteps = 36;
  const shiftStep = 2;
  let best: AccuracyResult | null = null;

  const shiftedTemplate = (template: Point[], shift: number): Point[] => {
    const n = template.length;
    const closed = n > 2 && distance(template[0], template[n - 1]) < 1e-6;
    const cycleLength = closed ? n - 1 : n;

    const out: Point[] = new Array(n);
    for (let i = 0; i < n; i += 1) {
      if (closed && i === n - 1) {
        out[i] = out[0];
        continue;
      }
      out[i] = template[(i + shift) % cycleLength];
    }
    return out;
  };

  const closed =
    sampledTemplate.length > 2 && distance(sampledTemplate[0], sampledTemplate[sampledTemplate.length - 1]) < 1e-6;
  const shiftUpperBound = closed ? sampledTemplate.length - 1 : sampledTemplate.length;

  for (const candidate of candidates) {
    for (let i = 0; i < angleSteps; i += 1) {
      const angle = (2 * Math.PI * i) / angleSteps;
      const rotated = rotateAroundCenter(candidate, angle);
      for (let shift = 0; shift < shiftUpperBound; shift += shiftStep) {
        const current = buildAccuracyResult(rotated, shiftedTemplate(sampledTemplate, shift), options);
        if (!best || current.meanDeviation < best.meanDeviation) {
          best = current;
        }
      }
    }
  }

  return best || buildAccuracyResult(sampledUser, sampledTemplate, options);
}

export function computeAccuracyPercentV2(userPoints: Point[], targetShape: string, options?: ScoreOptions): AccuracyResult {
  const template = SHAPE_TEMPLATES[targetShape];
  if (!template) {
    throw new Error(`Unknown shape: ${targetShape}`);
  }

  if (userPoints.length < 2) {
    return {
      accuracyPercent: 0,
      meanDeviation: 1,
      samplesUsed: 0
    };
  }

  const sampleCount = 96;
  const sampledUser = resamplePath(normalizeToUnitBox(userPoints), sampleCount);
  const sampledTemplate = resamplePath(normalizeToUnitBox(template), sampleCount);
  const aligned = findBestAlignedAccuracy(sampledUser, sampledTemplate, options);
  return {
    ...aligned,
    accuracyPercent: Number(
      applyStrokeSizeFactor(aligned.accuracyPercent, userPoints, options).toFixed(2)
    )
  };
}

export function getScoringVersionFromEnvValue(value: unknown): ScoringVersion {
  const normalized = String(value || "").toLowerCase();
  if (normalized === "v1" || normalized === "0" || normalized === "false") {
    return "v1";
  }
  if (normalized === "v2" || normalized === "1" || normalized === "true" || normalized === "") {
    return "v2";
  }
  return "v2";
}

export function computeAccuracyPercentByVersion(
  userPoints: Point[],
  targetShape: string,
  options?: ScoreOptions
): AccuracyResult {
  return options?.scoringVersion === "v1"
    ? computeAccuracyPercent(userPoints, targetShape, options)
    : computeAccuracyPercentV2(userPoints, targetShape, options);
}

export function starsFromAccuracy(accuracyPercent: number): 0 | 1 | 2 | 3 {
  if (accuracyPercent >= 95) {
    return 3;
  }
  if (accuracyPercent >= 85) {
    return 2;
  }
  if (accuracyPercent >= 70) {
    return 1;
  }
  return 0;
}

export function calculateXp(
  accuracyPercent: number,
  difficulty: Difficulty,
  streakBonus: number = 0,
  stars: 0 | 1 | 2 | 3 = 0
): number {
  const normalizedAccuracy = Math.max(0, Math.min(100, accuracyPercent)) / 100;
  const baseXp = Math.pow(normalizedAccuracy, 1.5) * 150;
  const starBonus = stars * 20;
  const total = (baseXp + starBonus) * DIFFICULTY_MULTIPLIER[difficulty] + streakBonus;
  return Math.max(0, Math.round(total));
}

export function scoreRound(
  userPoints: Point[],
  targetShape: string,
  difficulty: Difficulty,
  streakBonus: number = 0,
  options?: ScoreOptions
): ScoreResult {
  const finalOptions = {
    ...options,
    scoringVersion: options?.scoringVersion || "v2"
  };
  
  const accuracy = computeAccuracyPercentByVersion(
    userPoints,
    targetShape,
    finalOptions
  );
  
  const stars = starsFromAccuracy(accuracy.accuracyPercent);
  
  return {
    stars,
    xpGained: calculateXp(accuracy.accuracyPercent, difficulty, streakBonus, stars),
    accuracyPercent: accuracy.accuracyPercent
  };
}

/* Single-pass scoring: computes accuracy once and derives stars/xp from the
 * same result. Use this instead of calling computeAccuracyPercentByVersion
 * and scoreRound back to back (which doubled the alignment search cost). */
export function scoreRoundDetailed(
  userPoints: Point[],
  targetShape: string,
  difficulty: Difficulty,
  streakBonus: number = 0,
  options?: ScoreOptions
): { score: ScoreResult; accuracy: AccuracyResult } {
  const finalOptions = {
    ...options,
    scoringVersion: options?.scoringVersion || "v2"
  };
  const accuracy = computeAccuracyPercentByVersion(userPoints, targetShape, finalOptions);
  const stars = starsFromAccuracy(accuracy.accuracyPercent);
  const score: ScoreResult = {
    stars,
    xpGained: calculateXp(accuracy.accuracyPercent, difficulty, streakBonus, stars),
    accuracyPercent: accuracy.accuracyPercent
  };
  return { score, accuracy };
}

export function minimumRequiredPoints(timeLimitMs: number): number {
  if (timeLimitMs <= 3000) {
    return 24;
  }
  if (timeLimitMs <= 5000) {
    return 30;
  }
  return 36;
}

export function isPathTooShort(points: Point[]): boolean {
  return pathLength(points) < 0.2;
}
