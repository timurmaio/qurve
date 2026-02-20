import type { ProjectedPoint } from './pointUtils';

export interface CursorConfig {
  stroke?: string;
  strokeWidth?: number;
  strokeDasharray?: string;
}

export function drawCrosshair(params: {
  ctx: CanvasRenderingContext2D;
  point: ProjectedPoint;
  margin: { top: number; left: number };
  innerWidth: number;
  innerHeight: number;
  cursor: boolean | CursorConfig;
  defaults: { stroke: string; strokeWidth: number; strokeDasharray: string };
}): void {
  const { ctx, point, margin, innerWidth, innerHeight, cursor, defaults } = params;
  if (!cursor) return;

  const stroke = typeof cursor === 'object' ? cursor.stroke ?? defaults.stroke : defaults.stroke;
  const strokeWidth = typeof cursor === 'object' ? cursor.strokeWidth ?? defaults.strokeWidth : defaults.strokeWidth;
  const dash = typeof cursor === 'object' ? cursor.strokeDasharray ?? defaults.strokeDasharray : defaults.strokeDasharray;

  ctx.setLineDash(dash.split(' ').map(Number));
  ctx.strokeStyle = stroke;
  ctx.lineWidth = strokeWidth;

  ctx.beginPath();
  ctx.moveTo(point.x, margin.top);
  ctx.lineTo(point.x, margin.top + innerHeight);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(margin.left, point.y);
  ctx.lineTo(margin.left + innerWidth, point.y);
  ctx.stroke();

  ctx.setLineDash([]);
}
