import fs from "node:fs";
import path from "node:path";
import { preprocessStroke, resamplePath } from "../core/geometry";
import { computeAccuracyPercentByVersion, minimumRequiredPoints, scoreRound } from "../core/scoring";
import { SHAPE_TEMPLATES } from "../core/shapeTemplates";
import { Difficulty, Point } from "../core/types";

type ScenarioName = "perfect" | "good" | "rough" | "wrong-shape" | "open-stroke";

type CalibrationCase = {
  targetShape: string;
  scenario: ScenarioName;
  points: Point[];
  difficulty: Difficulty;
  timeLimitMs: number;
};

type CalibrationRow = {
  shape: string;
  scenario: ScenarioName;
  accuracy: number;
  meanDeviation: number;
  stars: number;
  xp: number;
  expected: string;
  inRange: boolean;
};

function rotatePoints(points: Point[], radians: number): Point[] {
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  return points.map((p) => ({
    x: p.x * cos - p.y * sin,
    y: p.x * sin + p.y * cos
  }));
}

function toCanvasPoints(points: Point[], size: number = 320, scale: number = 112): Point[] {
  const cx = size / 2;
  const cy = size / 2;
  return points.map((p) => ({
    x: cx + p.x * scale,
    y: cy + p.y * scale
  }));
}

function addDeterministicJitter(points: Point[], amplitude: number): Point[] {
  return points.map((p, idx) => {
    const nx = Math.sin((idx + 1) * 1.23) * amplitude;
    const ny = Math.cos((idx + 1) * 1.71) * amplitude;
    return { x: p.x + nx, y: p.y + ny };
  });
}

function keepPrefix(points: Point[], ratio: number): Point[] {
  const count = Math.max(4, Math.floor(points.length * ratio));
  return points.slice(0, count);
}

function distort(points: Point[], noise: number, rotateRad: number): Point[] {
  return addDeterministicJitter(rotatePoints(points, rotateRad), noise);
}

function expectedRange(scenario: ScenarioName): [number, number] {
  switch (scenario) {
    case "perfect":
      return [90, 100];
    case "good":
      return [70, 98];
    case "rough":
      return [25, 90];
    case "wrong-shape":
      return [0, 65];
    case "open-stroke":
      return [0, 60];
  }
}

function buildCases(): CalibrationCase[] {
  const shapes = ["circle", "square", "triangle", "diamond", "pentagon", "hexagon", "star", "heart"];
  const otherShape: Record<string, string> = {
    circle: "square",
    square: "circle",
    triangle: "circle",
    diamond: "heart",
    pentagon: "circle",
    hexagon: "star",
    star: "circle",
    heart: "triangle"
  };

  const cases: CalibrationCase[] = [];

  for (const shape of shapes) {
    const base = resamplePath(SHAPE_TEMPLATES[shape], 160);
    if (!base) {
      continue;
    }

    const goodNoiseByShape: Record<string, number> = {
      circle: 0.028,
      square: 0.018,
      triangle: 0.02,
      diamond: 0.018,
      pentagon: 0.02,
      hexagon: 0.02,
      star: 0.018,
      heart: 0.028
    };
    const roughNoiseByShape: Record<string, number> = {
      circle: 0.065,
      square: 0.05,
      triangle: 0.055,
      diamond: 0.05,
      pentagon: 0.055,
      hexagon: 0.055,
      star: 0.05,
      heart: 0.07
    };

    cases.push(
      {
        targetShape: shape,
        scenario: "perfect",
        points: toCanvasPoints(base),
        difficulty: "easy",
        timeLimitMs: 6500
      },
      {
        targetShape: shape,
        scenario: "good",
        points: toCanvasPoints(distort(base, goodNoiseByShape[shape] ?? 0.02, Math.PI / 12)),
        difficulty: "medium",
        timeLimitMs: 5600
      },
      {
        targetShape: shape,
        scenario: "rough",
        points: toCanvasPoints(distort(base, roughNoiseByShape[shape] ?? 0.055, Math.PI / 8)),
        difficulty: "medium",
        timeLimitMs: 5200
      },
      {
        targetShape: shape,
        scenario: "wrong-shape",
        points: toCanvasPoints(
          distort(resamplePath(SHAPE_TEMPLATES[otherShape[shape]] || SHAPE_TEMPLATES.circle, 160), 0.035, Math.PI / 7)
        ),
        difficulty: "hard",
        timeLimitMs: 5000
      },
      {
        targetShape: shape,
        scenario: "open-stroke",
        points: toCanvasPoints(keepPrefix(distort(base, 0.045, Math.PI / 9), 0.72)),
        difficulty: "hard",
        timeLimitMs: 5000
      }
    );
  }

  return cases;
}

function evaluateCase(entry: CalibrationCase): CalibrationRow {
  const processed = preprocessStroke(entry.points, {
    smoothingWindow: 2,
    minDistance: 1.5,
    minPoints: minimumRequiredPoints(entry.timeLimitMs)
  });

  const accuracy = computeAccuracyPercentByVersion(processed, entry.targetShape, "v2");
  const score = scoreRound(processed, entry.targetShape, entry.difficulty, 0, { scoringVersion: "v2" });

  const [min, max] = expectedRange(entry.scenario);
  const inRange = accuracy.accuracyPercent >= min && accuracy.accuracyPercent <= max;

  return {
    shape: entry.targetShape,
    scenario: entry.scenario,
    accuracy: accuracy.accuracyPercent,
    meanDeviation: accuracy.meanDeviation,
    stars: score.stars,
    xp: score.xpGained,
    expected: `${min}-${max}`,
    inRange
  };
}

function writeReport(rows: CalibrationRow[]): void {
  const outPath = path.resolve(__dirname, "../../docs/scoring-calibration-report.md");
  const failures = rows.filter((r) => !r.inRange);

  const lines: string[] = [
    "# Scoring Calibration Report",
    "",
    `Date: ${new Date().toISOString()}`,
    "Scoring version: v2",
    "",
    "| Shape | Scenario | Accuracy | Mean Dev | Stars | XP | Expected Band | Status |",
    "| --- | --- | --- | --- | --- | --- | --- | --- |"
  ];

  for (const row of rows) {
    lines.push(
      `| ${row.shape} | ${row.scenario} | ${row.accuracy.toFixed(2)} | ${row.meanDeviation.toFixed(4)} | ${row.stars} | ${row.xp} | ${row.expected} | ${row.inRange ? "PASS" : "TUNE"} |`
    );
  }

  lines.push("");
  lines.push(`Total cases: ${rows.length}`);
  lines.push(`Out-of-band cases: ${failures.length}`);
  lines.push("");
  lines.push("Calibration notes:");
  lines.push("- perfect should stay near 100.");
  lines.push("- good should score high but below near-perfect.");
  lines.push("- rough/open-stroke should not receive premium-like scores.");
  lines.push("- wrong-shape should remain clearly low.");

  fs.writeFileSync(outPath, `${lines.join("\n")}\n`, "utf8");
}

function main(): void {
  const rows = buildCases().map(evaluateCase);
  writeReport(rows);

  const outOfBand = rows.filter((r) => !r.inRange);
  for (const row of rows) {
    console.log(
      `${row.shape.padEnd(8)} | ${row.scenario.padEnd(11)} | acc=${row.accuracy
        .toFixed(2)
        .padStart(6)} | band=${row.expected} | ${row.inRange ? "PASS" : "TUNE"}`
    );
  }

  console.log(`\nOut-of-band: ${outOfBand.length}/${rows.length}`);
}

main();
