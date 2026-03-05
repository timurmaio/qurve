export function drawReferenceLine(params: {
  ctx: CanvasRenderingContext2D;
  orientation: 'horizontal' | 'vertical';
  value: number;
  scale: (v: number) => number;
  margin: { top: number; left: number };
  innerWidth: number;
  innerHeight: number;
  stroke?: string;
  strokeWidth?: number;
  strokeDasharray?: string;
}): void {
  const {
    ctx,
    orientation,
    value,
    scale,
    margin,
    innerWidth,
    innerHeight,
    stroke = '#666',
    strokeWidth = 1,
    strokeDasharray,
  } = params;

  const pos = scale(value);

  ctx.save();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = strokeWidth;
  if (strokeDasharray) {
    const parts = strokeDasharray.split(' ').map(Number).filter(Number.isFinite);
    if (parts.length >= 2) ctx.setLineDash(parts);
  }

  ctx.beginPath();
  if (orientation === 'horizontal') {
    const y = margin.top + pos;
    ctx.moveTo(margin.left, y);
    ctx.lineTo(margin.left + innerWidth, y);
  } else {
    const x = margin.left + pos;
    ctx.moveTo(x, margin.top);
    ctx.lineTo(x, margin.top + innerHeight);
  }
  ctx.stroke();
  ctx.restore();
}
