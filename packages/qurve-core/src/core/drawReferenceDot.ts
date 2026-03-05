export function drawReferenceDot(params: {
  ctx: CanvasRenderingContext2D;
  x: number;
  y: number;
  r?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
}): void {
  const {
    ctx,
    x,
    y,
    r = 4,
    fill = '#333',
    stroke = '#fff',
    strokeWidth = 2,
  } = params;

  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
  if (stroke && strokeWidth > 0) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = strokeWidth;
    ctx.stroke();
  }
  ctx.restore();
}
