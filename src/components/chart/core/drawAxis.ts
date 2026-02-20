function createTicks(min: number, max: number, tickCount: number): number[] {
  const safeCount = Math.max(2, tickCount);
  const step = (max - min) / (safeCount - 1);
  const ticks: number[] = [];
  for (let i = 0; i < safeCount; i++) {
    ticks.push(min + step * i);
  }
  return ticks;
}

export function drawXAxis(params: {
  ctx: CanvasRenderingContext2D;
  scale: (value: number) => number;
  domain: [number, number];
  margin: { left: number; top: number };
  innerWidth: number;
  innerHeight: number;
  position: 'top' | 'bottom';
  stroke: string;
  tick: boolean;
  tickLine: boolean;
  axisLine: boolean;
  tickCount: number;
  tickFormatter?: (value: unknown) => string;
}): void {
  const {
    ctx,
    scale,
    domain,
    margin,
    innerWidth,
    innerHeight,
    position,
    stroke,
    tick,
    tickLine,
    axisLine,
    tickCount,
    tickFormatter,
  } = params;

  const [min, max] = domain;
  const ticks = createTicks(min, max, tickCount);
  const y = position === 'top' ? margin.top : margin.top + innerHeight;

  ctx.save();
  ctx.strokeStyle = stroke;
  ctx.fillStyle = stroke;
  ctx.font = '12px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = position === 'top' ? 'bottom' : 'top';

  if (axisLine) {
    ctx.beginPath();
    ctx.moveTo(margin.left, y);
    ctx.lineTo(margin.left + innerWidth, y);
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  if (tickLine || tick) {
    for (const tickValue of ticks) {
      const xPos = margin.left + scale(tickValue);
      if (tickLine) {
        ctx.beginPath();
        ctx.moveTo(xPos, y);
        ctx.lineTo(xPos, y + (position === 'top' ? 6 : -6));
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      if (tick) {
        const label = tickFormatter ? tickFormatter(tickValue) : String(tickValue);
        ctx.fillText(label, xPos, y + (position === 'top' ? -8 : 8));
      }
    }
  }

  ctx.restore();
}

export function drawYAxis(params: {
  ctx: CanvasRenderingContext2D;
  scale: (value: number) => number;
  domain: [number, number];
  margin: { left: number; top: number };
  innerWidth: number;
  innerHeight: number;
  position: 'left' | 'right';
  stroke: string;
  tick: boolean;
  tickLine: boolean;
  axisLine: boolean;
  tickCount: number;
  tickFormatter?: (value: unknown) => string;
}): void {
  const {
    ctx,
    scale,
    domain,
    margin,
    innerWidth,
    innerHeight,
    position,
    stroke,
    tick,
    tickLine,
    axisLine,
    tickCount,
    tickFormatter,
  } = params;

  const [min, max] = domain;
  const ticks = createTicks(min, max, tickCount);
  const x = position === 'left' ? margin.left : margin.left + innerWidth;

  ctx.save();
  ctx.strokeStyle = stroke;
  ctx.fillStyle = stroke;
  ctx.font = '12px sans-serif';
  ctx.textAlign = position === 'left' ? 'right' : 'left';
  ctx.textBaseline = 'middle';

  if (axisLine) {
    ctx.beginPath();
    ctx.moveTo(x, margin.top);
    ctx.lineTo(x, margin.top + innerHeight);
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  if (tickLine || tick) {
    for (const tickValue of ticks) {
      const yPos = margin.top + scale(tickValue);

      if (tickLine) {
        ctx.beginPath();
        ctx.moveTo(x, yPos);
        ctx.lineTo(x + (position === 'left' ? 6 : -6), yPos);
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      if (tick) {
        const label = tickFormatter ? tickFormatter(tickValue) : String(tickValue.toFixed(0));
        ctx.fillText(label, x + (position === 'left' ? -8 : 8), yPos);
      }
    }
  }

  ctx.restore();
}
