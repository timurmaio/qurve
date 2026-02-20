import type { ProjectedPoint } from './pointUtils';

export function drawLinePath(params: {
  ctx: CanvasRenderingContext2D;
  points: ProjectedPoint[];
  type: 'linear' | 'monotone' | 'step';
  stroke: string;
  strokeWidth: number;
}): void {
  const { ctx, points, type, stroke, strokeWidth } = params;
  if (points.length === 0) return;

  ctx.strokeStyle = stroke;
  ctx.lineWidth = strokeWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);

  if (type === 'monotone') {
    for (let i = 0; i < points.length - 1; i++) {
      const x1 = points[i].x;
      const y1 = points[i].y;
      const x2 = points[i + 1].x;
      const y2 = points[i + 1].y;
      const cp1x = x1 + (x2 - x1) / 2;
      const cp2x = cp1x;
      ctx.bezierCurveTo(cp1x, y1, cp2x, y2, x2, y2);
    }
  } else if (type === 'step') {
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      ctx.lineTo(curr.x, prev.y);
      ctx.lineTo(curr.x, curr.y);
    }
  } else {
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
  }

  ctx.stroke();
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

  for (const point of points) {
    ctx.beginPath();
    ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 1;
    ctx.stroke();
  }
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
  if (radius <= 0) return;

  ctx.beginPath();
  ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = lineWidth;
  ctx.stroke();
}
