export function drawReferenceArea(params: {
  ctx: CanvasRenderingContext2D;
  orientation: 'horizontal' | 'vertical';
  startValue: number;
  endValue: number;
  scale: (v: number) => number;
  margin: { top: number; left: number };
  innerWidth: number;
  innerHeight: number;
  fill?: string;
  fillOpacity?: number;
}): void {
  const {
    ctx,
    orientation,
    startValue,
    endValue,
    scale,
    margin,
    innerWidth,
    innerHeight,
    fill = 'rgba(0, 0, 0, 0.1)',
    fillOpacity = 1,
  } = params;

  const startPos = scale(startValue);
  const endPos = scale(endValue);
  const [p1, p2] = startPos <= endPos ? [startPos, endPos] : [endPos, startPos];

  ctx.save();
  ctx.globalAlpha = fillOpacity;
  ctx.fillStyle = fill;

  if (orientation === 'horizontal') {
    const top = margin.top + p1;
    const height = Math.max(1, p2 - p1);
    ctx.fillRect(margin.left, top, innerWidth, height);
  } else {
    const left = margin.left + p1;
    const width = Math.max(1, p2 - p1);
    ctx.fillRect(left, margin.top, width, innerHeight);
  }

  ctx.restore();
}
