export interface BarRect {
  x: number;
  y: number;
  width: number;
  height: number;
  radius?: number | [number, number, number, number];
}

function normalizeRadius(radius: number | [number, number, number, number] | undefined, width: number, height: number) {
  if (radius === undefined) return [0, 0, 0, 0] as const;

  const max = Math.max(0, Math.min(width / 2, height / 2));
  if (typeof radius === 'number') {
    const value = Math.max(0, Math.min(radius, max));
    return [value, value, value, value] as const;
  }

  return [
    Math.max(0, Math.min(radius[0], max)),
    Math.max(0, Math.min(radius[1], max)),
    Math.max(0, Math.min(radius[2], max)),
    Math.max(0, Math.min(radius[3], max)),
  ] as const;
}

function fillRoundedRect(ctx: CanvasRenderingContext2D, bar: BarRect): void {
  const [topLeft, topRight, bottomRight, bottomLeft] = normalizeRadius(bar.radius, bar.width, bar.height);
  const right = bar.x + bar.width;
  const bottom = bar.y + bar.height;

  ctx.beginPath();
  ctx.moveTo(bar.x + topLeft, bar.y);
  ctx.lineTo(right - topRight, bar.y);
  if (topRight > 0) ctx.quadraticCurveTo(right, bar.y, right, bar.y + topRight);
  ctx.lineTo(right, bottom - bottomRight);
  if (bottomRight > 0) ctx.quadraticCurveTo(right, bottom, right - bottomRight, bottom);
  ctx.lineTo(bar.x + bottomLeft, bottom);
  if (bottomLeft > 0) ctx.quadraticCurveTo(bar.x, bottom, bar.x, bottom - bottomLeft);
  ctx.lineTo(bar.x, bar.y + topLeft);
  if (topLeft > 0) ctx.quadraticCurveTo(bar.x, bar.y, bar.x + topLeft, bar.y);
  ctx.closePath();
  ctx.fill();
}

export function drawBars(params: {
  ctx: CanvasRenderingContext2D;
  bars: BarRect[];
  fill: string;
  stroke?: string;
  strokeWidth: number;
  hoveredIndex: number | null;
  hoverOpacity: number;
}): void {
  const { ctx, bars, fill, stroke, strokeWidth, hoveredIndex, hoverOpacity } = params;

  ctx.save();

  for (let index = 0; index < bars.length; index++) {
    const bar = bars[index];

    ctx.globalAlpha = hoveredIndex === null || hoveredIndex === index ? 1 : hoverOpacity;
    ctx.fillStyle = fill;
    fillRoundedRect(ctx, bar);

    if (stroke && strokeWidth > 0) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = strokeWidth;
      ctx.stroke();
    }
  }

  ctx.restore();
}
