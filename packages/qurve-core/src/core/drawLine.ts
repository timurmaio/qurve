import type { ProjectedPoint } from '../types';
import { appendCurve, type CurveType } from './curvePath';
import { isDefinedPoint, splitDefinedSegments } from './pointUtils';

export type { CurveType };

function strokeSegment(
  ctx: CanvasRenderingContext2D,
  points: ProjectedPoint[],
  type: CurveType,
): void {
  if (points.length === 0) return;

  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  appendCurve(ctx, points, type);
  ctx.stroke();
}

export function drawLinePath(params: {
  ctx: CanvasRenderingContext2D;
  points: ProjectedPoint[];
  type: CurveType;
  stroke: string;
  strokeWidth: number;
  /** When false (default), null values break the line into segments. */
  connectNulls?: boolean;
}): void {
  const { ctx, points, type, stroke, strokeWidth, connectNulls = false } = params;
  if (points.length === 0) return;

  ctx.save();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = strokeWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const segments = splitDefinedSegments(points, connectNulls);
  for (const segment of segments) {
    if (segment.length === 1) {
      // Single point: draw a short stub so isolated values remain visible.
      ctx.beginPath();
      ctx.moveTo(segment[0].x, segment[0].y);
      ctx.lineTo(segment[0].x + 0.01, segment[0].y);
      ctx.stroke();
      continue;
    }
    strokeSegment(ctx, segment, type);
  }
  ctx.restore();
}

export function drawLineDots(params: {
  ctx: CanvasRenderingContext2D;
  points: ProjectedPoint[];
  radius: number;
  fill: string;
  stroke: string;
}): void {
  const { ctx, points, radius, fill, stroke } = params;
  if (radius <= 0) return;

  ctx.save();
  ctx.fillStyle = fill;
  ctx.strokeStyle = stroke;
  for (const point of points) {
    if (!isDefinedPoint(point)) continue;
    ctx.beginPath();
    ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
    ctx.fill();
    if (stroke) ctx.stroke();
  }
  ctx.restore();
}

export function drawActiveDot(params: {
  ctx: CanvasRenderingContext2D;
  point: ProjectedPoint;
  radius: number;
  fill: string;
  stroke: string;
  lineWidth?: number;
}): void {
  const { ctx, point, radius, fill, stroke, lineWidth = 2 } = params;
  if (!isDefinedPoint(point) || radius <= 0) return;

  ctx.save();
  ctx.beginPath();
  ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = lineWidth;
  ctx.stroke();
  ctx.restore();
}
