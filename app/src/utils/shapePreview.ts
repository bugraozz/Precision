import { normalizeToUnitBox } from "../../../src/core/geometry";
import { SHAPE_TEMPLATES } from "../../../src/core/shapeTemplates";
import { TARGET_PREVIEW_SIZE, TARGET_PREVIEW_PADDING } from "../constants/gameplay";

export function targetShapePath(shape: string, size?: number): string {
  const points = SHAPE_TEMPLATES[shape];
  if (!points || points.length === 0) {
    return "";
  }

  const previewSize = size ?? TARGET_PREVIEW_SIZE;
  const padding = Math.round(previewSize * (TARGET_PREVIEW_PADDING / TARGET_PREVIEW_SIZE));
  const normalized = normalizeToUnitBox(points);
  const drawSize = previewSize - padding * 2;
  const mapped = normalized.map((p) => ({
    x: padding + p.x * drawSize,
    y: padding + p.y * drawSize
  }));

  const [first, ...rest] = mapped;
  const path = rest.map((p) => `L ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(" ");
  return `M ${first.x.toFixed(2)} ${first.y.toFixed(2)} ${path}`;
}

