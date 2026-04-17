import { Point } from "./types";

function closePath(points: Point[]): Point[] {
  if (points.length === 0) {
    return points;
  }
  const first = points[0];
  const last = points[points.length - 1];
  if (first.x === last.x && first.y === last.y) {
    return points;
  }
  return [...points, { x: first.x, y: first.y }];
}

function generateCircle(segments: number): Point[] {
  const points = Array.from({ length: segments }, (_, i) => {
    const angle = (2 * Math.PI * i) / segments;
    return { x: Math.cos(angle), y: Math.sin(angle) };
  });
  return closePath(points);
}

function generateRegularPolygon(sides: number, rotationOffset: number = -Math.PI / 2): Point[] {
  const points = Array.from({ length: sides }, (_, i) => {
    const angle = rotationOffset + (2 * Math.PI * i) / sides;
    return { x: Math.cos(angle), y: Math.sin(angle) };
  });
  return closePath(points);
}

function generateStar(pointsCount: number, innerRadius: number = 0.46): Point[] {
  const vertices: Point[] = [];
  for (let i = 0; i < pointsCount * 2; i += 1) {
    const angle = -Math.PI / 2 + (Math.PI * i) / pointsCount;
    const radius = i % 2 === 0 ? 1 : innerRadius;
    vertices.push({ x: Math.cos(angle) * radius, y: Math.sin(angle) * radius });
  }
  return closePath(vertices);
}

function generateHeart(samples: number): Point[] {
  const points = Array.from({ length: samples }, (_, i) => {
    const t = (2 * Math.PI * i) / samples;
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    return {
      x: x / 18,
      y: -(y / 18)
    };
  });
  return closePath(points);
}

export const SHAPE_TEMPLATES: Record<string, Point[]> = {
  circle: generateCircle(128),
  triangle: generateRegularPolygon(3),
  square: generateRegularPolygon(4, -Math.PI / 4),
  diamond: generateRegularPolygon(4),
  pentagon: generateRegularPolygon(5),
  hexagon: generateRegularPolygon(6),
  star: generateStar(5),
  heart: generateHeart(128)
};
