export function drawGrid(params: {
  ctx: CanvasRenderingContext2D;
  stroke?: string;
  horizontalStroke?: string;
  verticalStroke?: string;
  strokeDasharray?: string;
  horizontal?: boolean;
  vertical?: boolean;
  horizontalCount?: number;
  verticalCount?: number;
  margin: { top: number; left: number };
  innerWidth: number;
  innerHeight: number;
}): void {
  const {
    ctx,
    stroke = '#e5e5e5',
    horizontalStroke,
    verticalStroke,
    strokeDasharray = '3 3',
    horizontal = true,
    vertical = true,
    horizontalCount = 5,
    verticalCount = 5,
    margin,
    innerWidth,
    innerHeight,
  } = params;

  const hStroke = horizontalStroke ?? stroke;
  const vStroke = verticalStroke ?? stroke;

  ctx.save();
  ctx.lineWidth = 1;

  if (strokeDasharray) {
    const parts = strokeDasharray.split(' ').map(Number).filter(Number.isFinite);
    if (parts.length >= 2) {
      ctx.setLineDash(parts);
    }
  }

  if (vertical) {
    ctx.strokeStyle = vStroke;
    const step = innerWidth / verticalCount;
    for (let i = 0; i <= verticalCount; i++) {
      const xPos = margin.left + i * step;
      ctx.beginPath();
      ctx.moveTo(xPos, margin.top);
      ctx.lineTo(xPos, margin.top + innerHeight);
      ctx.stroke();
    }
  }

  if (horizontal) {
    ctx.strokeStyle = hStroke;
    const step = innerHeight / horizontalCount;
    for (let i = 0; i <= horizontalCount; i++) {
      const yPos = margin.top + i * step;
      ctx.beginPath();
      ctx.moveTo(margin.left, yPos);
      ctx.lineTo(margin.left + innerWidth, yPos);
      ctx.stroke();
    }
  }

  ctx.restore();
}
