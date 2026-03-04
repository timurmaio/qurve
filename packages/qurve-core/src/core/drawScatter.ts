export interface ScatterPoint {
  x: number;
  y: number;
  radius: number;
}

export function drawScatterPoints(params: {
  ctx: CanvasRenderingContext2D;
  points: ScatterPoint[];
  fill: string;
  stroke?: string;
  strokeWidth: number;
  hoveredIndex: number | null;
  hoverOpacity: number;
}): void {
  const { ctx, points, fill, stroke, strokeWidth, hoveredIndex, hoverOpacity } = params;
  if (points.length === 0) return;

  ctx.save();
  for (let index = 0; index < points.length; index++) {
    const point = points[index];

    ctx.globalAlpha = hoveredIndex === null || hoveredIndex === index ? 1 : hoverOpacity;
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.arc(point.x, point.y, point.radius, 0, Math.PI * 2);
    ctx.fill();

    if (stroke && strokeWidth > 0) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = strokeWidth;
      ctx.stroke();
    }
  }
  ctx.restore();
}
