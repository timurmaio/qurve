export interface AreaPoint {
  x: number;
  y0: number;
  y1: number;
}

function traceLinear(points: AreaPoint[], readY: (p: AreaPoint) => number, reversed = false): [number, number][] {
  const source = reversed ? [...points].reverse() : points;
  return source.map((point) => [point.x, readY(point)]);
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
}): void {
  const { ctx, points, fill, fillOpacity, stroke, strokeWidth, hoveredIndex, hoverOpacity } = params;
  if (points.length === 0) return;

  const top = traceLinear(points, (point) => point.y1);
  const bottom = traceLinear(points, (point) => point.y0, true);

  ctx.save();
  ctx.globalAlpha = hoveredIndex === null ? 1 : hoverOpacity;

  ctx.beginPath();
  ctx.moveTo(top[0][0], top[0][1]);
  for (let index = 1; index < top.length; index++) {
    ctx.lineTo(top[index][0], top[index][1]);
  }
  for (let index = 0; index < bottom.length; index++) {
    ctx.lineTo(bottom[index][0], bottom[index][1]);
  }
  ctx.closePath();

  ctx.globalAlpha = (hoveredIndex === null ? 1 : hoverOpacity) * fillOpacity;
  ctx.fillStyle = fill;
  ctx.fill();

  if (stroke && strokeWidth > 0) {
    ctx.globalAlpha = hoveredIndex === null ? 1 : hoverOpacity;
    ctx.strokeStyle = stroke;
    ctx.lineWidth = strokeWidth;
    ctx.beginPath();
    ctx.moveTo(top[0][0], top[0][1]);
    for (let index = 1; index < top.length; index++) {
      ctx.lineTo(top[index][0], top[index][1]);
    }
    ctx.stroke();
  }

  ctx.restore();
}
