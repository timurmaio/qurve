import { appendCurve, type CurveType } from './curvePath';

export interface AreaPoint {
  x: number;
  y0: number;
  y1: number;
}

export function drawArea(params: {
  ctx: CanvasRenderingContext2D;
  points: AreaPoint[];
  fill: string;
  fillOpacity: number;
  stroke?: string;
  strokeWidth: number;
  hoveredIndex: number | null;
  hoverOpacity: number;
  /** Curve type for the top edge (and bottom when closing). Default linear. */
  type?: CurveType;
}): void {
  const {
    ctx,
    points,
    fill,
    fillOpacity,
    stroke,
    strokeWidth,
    hoveredIndex,
    hoverOpacity,
    type = 'linear',
  } = params;
  if (points.length === 0) return;

  const top = points.map((p) => ({ x: p.x, y: p.y1 }));
  const bottom = [...points].reverse().map((p) => ({ x: p.x, y: p.y0 }));

  ctx.save();
  ctx.globalAlpha = hoveredIndex === null ? 1 : hoverOpacity;

  ctx.beginPath();
  ctx.moveTo(top[0].x, top[0].y);
  appendCurve(ctx, top, type);
  ctx.lineTo(bottom[0].x, bottom[0].y);
  appendCurve(ctx, bottom, type);
  ctx.closePath();

  ctx.globalAlpha = (hoveredIndex === null ? 1 : hoverOpacity) * fillOpacity;
  ctx.fillStyle = fill;
  ctx.fill();

  if (stroke && strokeWidth > 0) {
    ctx.globalAlpha = hoveredIndex === null ? 1 : hoverOpacity;
    ctx.strokeStyle = stroke;
    ctx.lineWidth = strokeWidth;
    ctx.beginPath();
    ctx.moveTo(top[0].x, top[0].y);
    appendCurve(ctx, top, type);
    ctx.stroke();
  }

  ctx.restore();
}
