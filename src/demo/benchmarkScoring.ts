import fs from "node:fs";
import path from "node:path";
import { computeAccuracyPercent, computeAccuracyPercentV2 } from "../core/scoring";
import { SHAPE_TEMPLATES } from "../core/shapeTemplates";
import { Point } from "../core/types";

type BenchmarkCase = {
  name: string;
  targetShape: string;
  points: Point[];
};

function rotatePoints(points: Point[], radians: number): Point[] {
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  return points.map((p) => ({
    x: p.x * cos - p.y * sin,
    y: p.x * sin + p.y * cos
  }));
}

function translatePoints(points: Point[], tx: number, ty: number): Point[] {
  return points.map((p) => ({ x: p.x + tx, y: p.y + ty }));
}

function reversePoints(points: Point[]): Point[] {
  return points.slice().reverse();
}

function addDeterministicJitter(points: Point[], amplitude: number): Point[] {
  return points.map((p, index) => {
    const jx = Math.sin(index * 1.87) * amplitude;
    const jy = Math.cos(index * 2.11) * amplitude;
    return {
      x: p.x + jx,
      y: p.y + jy
    };
  });
}

function runCase(testCase: BenchmarkCase) {
  const v1 = computeAccuracyPercent(testCase.points, testCase.targetShape);
  const v2 = computeAccuracyPercentV2(testCase.points, testCase.targetShape);
  return {
    name: testCase.name,
    shape: testCase.targetShape,
    v1: v1.accuracyPercent,
    v2: v2.accuracyPercent,
    improvement: Number((v2.accuracyPercent - v1.accuracyPercent).toFixed(2))
  };
}

function buildCases(): BenchmarkCase[] {
  const circle = SHAPE_TEMPLATES.circle;
  const square = SHAPE_TEMPLATES.square;
  const triangle = SHAPE_TEMPLATES.triangle;

  return [
    {
      name: "circle-noisy",
      targetShape: "circle",
      points: addDeterministicJitter(circle, 0.03)
    },
    {
      name: "circle-reversed",
      targetShape: "circle",
      points: reversePoints(addDeterministicJitter(circle, 0.04))
    },
    {
      name: "square-rotated-45deg",
      targetShape: "square",
      points: addDeterministicJitter(rotatePoints(square, Math.PI / 4), 0.02)
    },
    {
      name: "triangle-rotated-120deg-reversed",
      targetShape: "triangle",
      points: reversePoints(addDeterministicJitter(rotatePoints(triangle, (2 * Math.PI) / 3), 0.01))
    },
    {
      name: "square-rotated-translated",
      targetShape: "square",
      points: translatePoints(addDeterministicJitter(rotatePoints(square, Math.PI / 6), 0.03), 0.35, -0.22)
    }
  ];
}

function writeReport(rows: Array<{ name: string; shape: string; v1: number; v2: number; improvement: number }>) {
  const averageImprovement = rows.reduce((sum, row) => sum + row.improvement, 0) / rows.length;
  const maxImprovement = rows.reduce((max, row) => Math.max(max, row.improvement), 0);

  const lines = [
    "# Scoring V2 Benchmark",
    "",
    `Date: ${new Date().toISOString()}`,
    "Scope: v1 vs v2 accuracy comparison on transformed template-like strokes",
    "",
    "| Case | Shape | v1 Accuracy | v2 Accuracy | Improvement |",
    "| --- | --- | --- | --- | --- |"
  ];

  for (const row of rows) {
    lines.push(
      `| ${row.name} | ${row.shape} | ${row.v1.toFixed(2)} | ${row.v2.toFixed(2)} | ${row.improvement.toFixed(2)} |`
    );
  }

  lines.push("");
  lines.push(`Average improvement: ${averageImprovement.toFixed(2)}`);
  lines.push(`Max improvement: ${maxImprovement.toFixed(2)}`);
  lines.push("");
  lines.push("Notes:");
  lines.push("- v2 adds rotation tolerance and draw-direction tolerance.");
  lines.push("- Translation/scale are still normalized as in v1.");

  const reportPath = path.resolve(__dirname, "../../docs/scoring-v2-benchmark.md");
  fs.writeFileSync(reportPath, `${lines.join("\n")}\n`, "utf8");
}

function main() {
  const rows = buildCases().map(runCase);
  writeReport(rows);

  for (const row of rows) {
    console.log(
      `${row.name}: v1=${row.v1.toFixed(2)} v2=${row.v2.toFixed(2)} improvement=${row.improvement.toFixed(2)}`
    );
  }
}

main();
