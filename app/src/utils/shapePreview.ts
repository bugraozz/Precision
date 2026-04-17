import { normalizeToUnitBox } from "../../../src/core/geometry";
import { SHAPE_TEMPLATES } from "../../../src/core/shapeTemplates";
import { TARGET_PREVIEW_SIZE, TARGET_PREVIEW_PADDING } from "../constants/gameplay";

export function targetShapePath(shape: string): string {
  const points = SHAPE_TEMPLATES[shape];
  if (!points || points.length === 0) {
    return "";
  }

  const normalized = normalizeToUnitBox(points);
  const drawSize = TARGET_PREVIEW_SIZE - TARGET_PREVIEW_PADDING * 2;
  const mapped = normalized.map((p) => ({
    x: TARGET_PREVIEW_PADDING + p.x * drawSize,
    y: TARGET_PREVIEW_PADDING + p.y * drawSize
  }));

  const [first, ...rest] = mapped;
  const path = rest.map((p) => `L ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(" ");
  return `M ${first.x.toFixed(2)} ${first.y.toFixed(2)} ${path}`;
}
