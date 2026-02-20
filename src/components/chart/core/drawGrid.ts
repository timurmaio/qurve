export function drawGrid(params: {
  ctx: CanvasRenderingContext2D;
  stroke: string;
  strokeDasharray: string;
  horizontal: boolean;
  vertical: boolean;
  horizontalCount: number;
  verticalCount: number;
  margin: { top: number; left: number };
  innerWidth: number;
  innerHeight: number;
}): void {
  const {
    ctx,
    stroke,
    strokeDasharray,
    horizontal,
    vertical,
    horizontalCount,
    verticalCount,
    margin,
    innerWidth,
    innerHeight,
  } = params;

  ctx.save();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 1;

  if (strokeDasharray) {
    const [dash, gap] = strokeDasharray.split(' ').map(Number);
    ctx.setLineDash([dash, gap]);
  }

  if (vertical) {
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
