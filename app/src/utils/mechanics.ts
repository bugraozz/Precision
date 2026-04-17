import { Point } from "../../../src/core/types";
import {
  SPEED_PAR_RATIO,
  SPEED_HEAVY_PENALTY_RATIO,
  STABILITY_WOBBLE_WARN,
  STABILITY_WOBBLE_HEAVY,
  SYMMETRY_WARN_ACCURACY,
  SYMMETRY_HEAVY_ACCURACY
} from "../constants/gameplay";
import { t } from "../i18n";

export function getMechanicDescription(tag: "speed" | "stability" | "symmetry" | "memory"): string {
  if (tag === "speed") {
    return "Speed: finish accurately under tighter time pressure.";
  }
  if (tag === "stability") {
    return "Stability: keep stroke smooth and avoid jitter.";
  }
  if (tag === "symmetry") {
    return "Symmetry: balance both sides of the target form.";
  }
  return "Memory: draw from memory with minimal visual guidance.";
}

export function clampRounded(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Math.round(value)));
}

export function computeStrokeWobble(points: Point[]): number {
  if (points.length < 3) {
    return 0;
  }

  let sum = 0;
  let count = 0;
  for (let i = 2; i < points.length; i += 1) {
    const p0 = points[i - 2];
    const p1 = points[i - 1];
    const p2 = points[i];
    const a1 = Math.atan2(p1.y - p0.y, p1.x - p0.x);
    const a2 = Math.atan2(p2.y - p1.y, p2.x - p1.x);
    let delta = Math.abs(a2 - a1);
    if (delta > Math.PI) {
      delta = 2 * Math.PI - delta;
    }
    sum += delta;
    count += 1;
  }

  return count > 0 ? sum / count : 0;
}

export function applyMechanicPressure(
  base: { stars: number; xpGained: number; accuracyPercent: number; durationMs: number; points: Point[] },
  activeMechanic: "speed" | "stability" | "symmetry" | "memory",
  speedParTimeMs: number,
  memoryTargetVisible: boolean
): { stars: 0 | 1 | 2 | 3; xpGained: number; note: string | null } {
  let stars = clampRounded(base.stars, 0, 3);
  let xp = Math.max(0, Math.round(base.xpGained));
  let note: string | null = null;

  if (activeMechanic === "speed" && base.durationMs > speedParTimeMs) {
    const heavyThreshold = Math.floor(speedParTimeMs * SPEED_HEAVY_PENALTY_RATIO);
    if (base.durationMs > heavyThreshold) {
      stars = Math.max(0, stars - 2);
      xp = Math.max(0, Math.round(xp * 0.55));
      note = t("speedNoteHeavy").replace("{actual}", String(base.durationMs)).replace("{limit}", String(heavyThreshold));
    } else {
      stars = Math.max(0, stars - 1);
      xp = Math.max(0, Math.round(xp * 0.72));
      note = t("speedNoteOver").replace("{par}", String(speedParTimeMs));
    }
  }

  if (activeMechanic === "stability") {
    const wobble = computeStrokeWobble(base.points);
    if (wobble > STABILITY_WOBBLE_HEAVY) {
      stars = Math.max(0, stars - 2);
      xp = Math.max(0, Math.round(xp * 0.62));
      note = t("stabilityNoteHeavy");
    } else if (wobble > STABILITY_WOBBLE_WARN) {
      stars = Math.max(0, stars - 1);
      xp = Math.max(0, Math.round(xp * 0.78));
      note = t("stabilityNoteWarn");
    }
  }

  if (activeMechanic === "symmetry") {
    if (base.accuracyPercent < SYMMETRY_HEAVY_ACCURACY) {
      stars = Math.max(0, stars - 2);
      xp = Math.max(0, Math.round(xp * 0.6));
      note = t("symmetryNoteHeavy").replace("{pct}", String(SYMMETRY_HEAVY_ACCURACY));
    } else if (base.accuracyPercent < SYMMETRY_WARN_ACCURACY) {
      stars = Math.max(0, stars - 1);
      xp = Math.max(0, Math.round(xp * 0.78));
      note = t("symmetryNoteWarn").replace("{pct}", String(SYMMETRY_WARN_ACCURACY));
    }
  }

  if (activeMechanic === "memory" && !memoryTargetVisible) {
    xp = Math.max(0, Math.round(xp * 1.05));
  }

  return {
    stars: clampRounded(stars, 0, 3) as 0 | 1 | 2 | 3,
    xpGained: xp,
    note
  };
}
