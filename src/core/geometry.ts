import { Point } from "./types";

export function distance(a: Point, b: Point): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.hypot(dx, dy);
}

export function pathLength(points: Point[]): number {
  if (points.length < 2) {
    return 0;
  }

  let sum = 0;
  for (let i = 1; i < points.length; i += 1) {
    sum += distance(points[i - 1], points[i]);
  }
  return sum;
}

export function normalizeToUnitBox(points: Point[]): Point[] {
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);

  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  const width = Math.max(1e-9, maxX - minX);
  const height = Math.max(1e-9, maxY - minY);

  return points.map((p) => ({
    x: (p.x - minX) / width,
    y: (p.y - minY) / height,
    t: p.t
  }));
}

export function resamplePath(points: Point[], sampleCount: number): Point[] {
  if (points.length === 0 || sampleCount <= 0) {
    return [];
  }

  if (points.length === 1) {
    return Array.from({ length: sampleCount }, () => ({ ...points[0] }));
  }

  const totalLength = pathLength(points);
  if (totalLength <= 1e-9) {
    return Array.from({ length: sampleCount }, () => ({ ...points[0] }));
  }

  const interval = totalLength / (sampleCount - 1);
  const sampled: Point[] = [{ ...points[0] }];

  let targetDistance = interval;
  let traversed = 0;

  for (let i = 1; i < points.length && sampled.length < sampleCount - 1; i += 1) {
    const prev = points[i - 1];
    const curr = points[i];
    const segmentLen = distance(prev, curr);

    while (traversed + segmentLen >= targetDistance && sampled.length < sampleCount - 1) {
      const ratio = (targetDistance - traversed) / segmentLen;
      sampled.push({
        x: prev.x + (curr.x - prev.x) * ratio,
        y: prev.y + (curr.y - prev.y) * ratio
      });
      targetDistance += interval;
    }

    traversed += segmentLen;
  }

  sampled.push({ ...points[points.length - 1] });

  while (sampled.length < sampleCount) {
    sampled.push({ ...points[points.length - 1] });
  }

  return sampled;
}

export type StrokePreprocessOptions = {
  smoothingWindow?: number;
  minDistance?: number;
  minPoints?: number;
};

export function smoothPath(points: Point[], windowSize: number = 2): Point[] {
  if (points.length <= 2 || windowSize <= 0) {
    return points.slice();
  }

  const clampedWindow = Math.max(1, Math.floor(windowSize));
  return points.map((_, index) => {
    const start = Math.max(0, index - clampedWindow);
    const end = Math.min(points.length - 1, index + clampedWindow);

    let sumX = 0;
    let sumY = 0;
    let count = 0;
    for (let i = start; i <= end; i += 1) {
      sumX += points[i].x;
      sumY += points[i].y;
      count += 1;
    }

    return {
      x: sumX / count,
      y: sumY / count,
      t: points[index].t
    };
  });
}

export function decimatePath(points: Point[], minDistance: number = 1.5, minPoints: number = 0): Point[] {
  if (points.length <= 2) {
    return points.slice();
  }

  const threshold = Math.max(0, minDistance);
  const decimated: Point[] = [points[0]];

  for (let i = 1; i < points.length - 1; i += 1) {
    if (distance(points[i], decimated[decimated.length - 1]) >= threshold) {
      decimated.push(points[i]);
    }
  }

  decimated.push(points[points.length - 1]);

  if (minPoints > 0 && decimated.length < minPoints) {
    return resamplePath(points, minPoints);
  }

  return decimated;
}

export function preprocessStroke(points: Point[], options: StrokePreprocessOptions = {}): Point[] {
  if (points.length <= 2) {
    return points.slice();
  }

  const smoothed = smoothPath(points, options.smoothingWindow ?? 2);
  return decimatePath(smoothed, options.minDistance ?? 1.5, options.minPoints ?? 0);
}
