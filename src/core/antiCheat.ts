import { isPathTooShort, minimumRequiredPoints } from "./scoring";
import { RoundInput, ValidationResult } from "./types";

const MAX_ROUND_MS = 120_000;
const MIN_ROUND_MS = 500;

export function validateRoundPayload(input: RoundInput): ValidationResult {
  const reasons: string[] = [];

  const elapsed = input.endedAtMs - input.startedAtMs;

  if (elapsed < MIN_ROUND_MS) {
    reasons.push("round_too_fast");
  }

  if (elapsed > MAX_ROUND_MS) {
    reasons.push("round_too_long");
  }

  if (input.points.length < minimumRequiredPoints(input.timeLimitMs)) {
    reasons.push("insufficient_points");
  }

  if (isPathTooShort(input.points)) {
    reasons.push("path_too_short");
  }

  const hasOutOfRangeCoordinates = input.points.some((point) => {
    const limit = 10_000;
    return (
      !Number.isFinite(point.x) ||
      !Number.isFinite(point.y) ||
      Math.abs(point.x) > limit ||
      Math.abs(point.y) > limit
    );
  });

  if (hasOutOfRangeCoordinates) {
    reasons.push("invalid_coordinates");
  }

  return {
    valid: reasons.length === 0,
    reasons
  };
}
