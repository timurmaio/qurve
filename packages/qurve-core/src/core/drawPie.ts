export interface PieSliceGeometry {
  index: number;
  value: number;
  name: string;
  color: string;
  startAngle: number;
  endAngle: number;
}

export interface PieDrawSlice extends PieSliceGeometry {
  cx: number;
  cy: number;
  innerRadius: number;
  outerRadius: number;
  stroke?: string;
  strokeWidth: number;
}

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

function drawSlicePath(ctx: CanvasRenderingContext2D, slice: PieDrawSlice): void {
  const start = toRadians(slice.startAngle);
  const end = toRadians(slice.endAngle);

  ctx.beginPath();
  ctx.moveTo(
    slice.cx + Math.cos(start) * slice.outerRadius,
    slice.cy + Math.sin(start) * slice.outerRadius,
  );
  ctx.arc(slice.cx, slice.cy, slice.outerRadius, start, end, false);

  if (slice.innerRadius > 0) {
    ctx.lineTo(
      slice.cx + Math.cos(end) * slice.innerRadius,
      slice.cy + Math.sin(end) * slice.innerRadius,
    );
    ctx.arc(slice.cx, slice.cy, slice.innerRadius, end, start, true);
  } else {
    ctx.lineTo(slice.cx, slice.cy);
  }

  ctx.closePath();
}

export function drawPieSlices(params: {
  ctx: CanvasRenderingContext2D;
  slices: PieDrawSlice[];
  hoveredIndex: number | null;
  hoverOpacity: number;
}): void {
  const { ctx, slices, hoveredIndex, hoverOpacity } = params;
  if (slices.length === 0) return;

  ctx.save();
  for (let index = 0; index < slices.length; index++) {
    const slice = slices[index];
    ctx.globalAlpha = hoveredIndex === null || hoveredIndex === index ? 1 : hoverOpacity;
    ctx.fillStyle = slice.color;

    drawSlicePath(ctx, slice);
    ctx.fill();

    if (slice.stroke && slice.strokeWidth > 0) {
      ctx.strokeStyle = slice.stroke;
      ctx.lineWidth = slice.strokeWidth;
      ctx.stroke();
    }
  }
  ctx.restore();
}
