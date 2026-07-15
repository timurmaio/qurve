import type { CellOverride } from './drawBar';

export interface RadialBarSector {
  index: number;
  value: number;
  name: string;
  color: string;
  cx: number;
  cy: number;
  innerRadius: number;
  outerRadius: number;
  startAngle: number;
  endAngle: number;
  backgroundEndAngle?: number;
  stroke?: string;
  strokeWidth: number;
}

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

function drawSectorPath(
  ctx: CanvasRenderingContext2D,
  sector: Pick<RadialBarSector, 'cx' | 'cy' | 'innerRadius' | 'outerRadius' | 'startAngle' | 'endAngle'>,
): void {
  const start = toRadians(sector.startAngle);
  const end = toRadians(sector.endAngle);
  const anticlockwise = sector.endAngle < sector.startAngle;

  ctx.beginPath();
  ctx.moveTo(
    sector.cx + Math.cos(start) * sector.outerRadius,
    sector.cy + Math.sin(start) * sector.outerRadius,
  );
  ctx.arc(sector.cx, sector.cy, sector.outerRadius, start, end, anticlockwise);

  if (sector.innerRadius > 0) {
    ctx.lineTo(
      sector.cx + Math.cos(end) * sector.innerRadius,
      sector.cy + Math.sin(end) * sector.innerRadius,
    );
    ctx.arc(sector.cx, sector.cy, sector.innerRadius, end, start, !anticlockwise);
  } else {
    ctx.lineTo(sector.cx, sector.cy);
  }

  ctx.closePath();
}

export function drawRadialBars(params: {
  ctx: CanvasRenderingContext2D;
  sectors: RadialBarSector[];
  hoveredIndex: number | null;
  hoverOpacity: number;
  background?: boolean | { fill?: string };
  backgroundFill?: string;
}): void {
  const {
    ctx,
    sectors,
    hoveredIndex,
    hoverOpacity,
    background = false,
    backgroundFill = 'rgba(148, 163, 184, 0.2)',
  } = params;

  if (sectors.length === 0) return;

  const bgFill = typeof background === 'object' && background.fill
    ? background.fill
    : backgroundFill;

  ctx.save();
  try {
    if (background) {
      for (const sector of sectors) {
        if (sector.backgroundEndAngle == null) continue;
        ctx.globalAlpha = 1;
        ctx.fillStyle = bgFill;
        drawSectorPath(ctx, {
          ...sector,
          endAngle: sector.backgroundEndAngle,
        });
        ctx.fill();
      }
    }

    for (let index = 0; index < sectors.length; index++) {
      const sector = sectors[index];
      if (sector.startAngle === sector.endAngle) continue;

      ctx.globalAlpha = hoveredIndex === null || hoveredIndex === index ? 1 : hoverOpacity;
      ctx.fillStyle = sector.color;
      drawSectorPath(ctx, sector);
      ctx.fill();

      if (sector.stroke && sector.strokeWidth > 0) {
        ctx.strokeStyle = sector.stroke;
        ctx.lineWidth = sector.strokeWidth;
        ctx.stroke();
      }
    }
  } finally {
    ctx.restore();
  }
}

export function buildRadialBarSectors(params: {
  data: Record<string, unknown>[];
  values: number[];
  names: string[];
  colors: string[];
  cellOverrides?: CellOverride[];
  cx: number;
  cy: number;
  innerRadius: number;
  outerRadius: number;
  startAngle: number;
  endAngle: number;
  barSize?: number;
  maxValue?: number;
  stroke?: string;
  strokeWidth?: number;
}): RadialBarSector[] {
  const {
    data,
    values,
    names,
    colors,
    cellOverrides,
    cx,
    cy,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    barSize,
    maxValue,
    stroke,
    strokeWidth = 0,
  } = params;

  const n = data.length;
  if (n === 0) return [];

  const span = endAngle - startAngle;
  const domainMax = maxValue != null && maxValue > 0
    ? maxValue
    : Math.max(...values.map((v) => Math.abs(v)), 0);
  if (domainMax <= 0) return [];

  const band = (outerRadius - innerRadius) / n;
  const gap = barSize != null ? Math.max(0, band - barSize) : band * 0.15;
  const thickness = Math.max(1, band - gap);

  const sectors: RadialBarSector[] = [];
  for (let index = 0; index < n; index++) {
    const value = values[index];
    if (!Number.isFinite(value)) continue;

    const ringInner = innerRadius + index * band + gap / 2;
    const ringOuter = ringInner + thickness;
    const valueRatio = Math.max(0, Math.min(1, Math.abs(value) / domainMax));
    const valueEnd = startAngle + span * valueRatio;
    const cell = cellOverrides?.[index];

    sectors.push({
      index,
      value,
      name: names[index] ?? `Item ${index + 1}`,
      color: cell?.fill ?? colors[index % colors.length],
      cx,
      cy,
      innerRadius: ringInner,
      outerRadius: ringOuter,
      startAngle,
      endAngle: valueEnd,
      backgroundEndAngle: endAngle,
      stroke: cell?.stroke ?? stroke,
      strokeWidth: cell?.strokeWidth ?? strokeWidth,
    });
  }

  return sectors;
}

/** True if `angle` lies on the numeric sweep from start→end (same span as drawing). */
function isAngleInSweep(angle: number, start: number, end: number): boolean {
  const span = end - start;
  if (Math.abs(span) >= 360 - 1e-9) return true;
  if (Math.abs(span) < 1e-9) return false;

  let delta = angle - start;
  if (span > 0) {
    while (delta < 0) delta += 360;
    while (delta > 360) delta -= 360;
    return delta <= span + 1e-9;
  }

  while (delta > 0) delta -= 360;
  while (delta < -360) delta += 360;
  return delta >= span - 1e-9;
}

/** Hit-test: ring by radius and angle along the drawn sweep. */
export function findRadialBarIndex(
  sectors: RadialBarSector[],
  mouseX: number,
  mouseY: number,
): number | null {
  if (sectors.length === 0) return null;
  const { cx, cy } = sectors[0];
  const dx = mouseX - cx;
  const dy = mouseY - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

  // Prefer outermost ring first (higher index) so overlapping edges resolve stably.
  for (let i = sectors.length - 1; i >= 0; i--) {
    const sector = sectors[i];
    if (dist < sector.innerRadius || dist > sector.outerRadius) continue;
    if (isAngleInSweep(angle, sector.startAngle, sector.endAngle)) {
      return sector.index;
    }
  }
  return null;
}
