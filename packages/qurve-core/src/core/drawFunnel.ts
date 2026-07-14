import type { CellOverride } from './drawBar';

export interface FunnelTrapezoid {
  index: number;
  value: number;
  name: string;
  color: string;
  /** Centered trapezoid geometry in canvas coords. */
  x: number;
  y: number;
  topWidth: number;
  bottomWidth: number;
  height: number;
  stroke?: string;
  strokeWidth: number;
}

export function buildFunnelTrapezoids(params: {
  data: Record<string, unknown>[];
  values: number[];
  names: string[];
  colors: string[];
  cellOverrides?: CellOverride[];
  plotX: number;
  plotY: number;
  plotWidth: number;
  plotHeight: number;
  stroke?: string;
  strokeWidth?: number;
  lastShape?: 'trapezoid' | 'rectangle';
}): FunnelTrapezoid[] {
  const {
    data,
    values,
    names,
    colors,
    cellOverrides,
    plotX,
    plotY,
    plotWidth,
    plotHeight,
    stroke,
    strokeWidth = 0,
    lastShape = 'trapezoid',
  } = params;

  const n = data.length;
  if (n === 0 || plotWidth <= 0 || plotHeight <= 0) return [];

  const maxValue = Math.max(...values.map((v) => Math.abs(v)), 0);
  if (maxValue <= 0) return [];

  const segmentHeight = plotHeight / n;
  const centerX = plotX + plotWidth / 2;
  const widths = values.map((v) => (Math.abs(v) / maxValue) * plotWidth);

  const trapezoids: FunnelTrapezoid[] = [];
  for (let index = 0; index < n; index++) {
    const topWidth = widths[index];
    const isLast = index === n - 1;
    const bottomWidth = isLast
      ? (lastShape === 'rectangle' ? topWidth : Math.max(plotWidth * 0.08, topWidth * 0.35))
      : widths[index + 1];
    const cell = cellOverrides?.[index];

    trapezoids.push({
      index,
      value: values[index],
      name: names[index] ?? `Step ${index + 1}`,
      color: cell?.fill ?? colors[index % colors.length],
      x: centerX - topWidth / 2,
      y: plotY + index * segmentHeight,
      topWidth,
      bottomWidth,
      height: segmentHeight,
      stroke: cell?.stroke ?? stroke,
      strokeWidth: cell?.strokeWidth ?? strokeWidth,
    });
  }

  return trapezoids;
}

export function drawFunnel(params: {
  ctx: CanvasRenderingContext2D;
  trapezoids: FunnelTrapezoid[];
  hoveredIndex: number | null;
  hoverOpacity: number;
}): void {
  const { ctx, trapezoids, hoveredIndex, hoverOpacity } = params;
  if (trapezoids.length === 0) return;

  ctx.save();
  try {
    for (const trap of trapezoids) {
      const centerX = trap.x + trap.topWidth / 2;
      const topLeft = centerX - trap.topWidth / 2;
      const topRight = centerX + trap.topWidth / 2;
      const bottomLeft = centerX - trap.bottomWidth / 2;
      const bottomRight = centerX + trap.bottomWidth / 2;
      const bottom = trap.y + trap.height;

      ctx.globalAlpha = hoveredIndex === null || hoveredIndex === trap.index ? 1 : hoverOpacity;
      ctx.fillStyle = trap.color;
      ctx.beginPath();
      ctx.moveTo(topLeft, trap.y);
      ctx.lineTo(topRight, trap.y);
      ctx.lineTo(bottomRight, bottom);
      ctx.lineTo(bottomLeft, bottom);
      ctx.closePath();
      ctx.fill();

      if (trap.stroke && trap.strokeWidth > 0) {
        ctx.strokeStyle = trap.stroke;
        ctx.lineWidth = trap.strokeWidth;
        ctx.stroke();
      }
    }
  } finally {
    ctx.restore();
  }
}

/** Hit-test funnel by Y band. */
export function findFunnelIndex(
  trapezoids: FunnelTrapezoid[],
  mouseY: number,
): number | null {
  for (const trap of trapezoids) {
    if (mouseY >= trap.y && mouseY <= trap.y + trap.height) {
      return trap.index;
    }
  }
  return null;
}
