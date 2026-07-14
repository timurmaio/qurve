import type { PolarLayout, PolarPoint } from './polarMath';
import { createRadiusTicks, polarToCartesian } from './polarMath';

function buildFont(fontSize: number, fontFamily: string, fontWeight?: string | number): string {
  const weight = fontWeight != null ? String(fontWeight) : '';
  return [weight, `${fontSize}px`, fontFamily].filter(Boolean).join(' ');
}

export function drawPolarGrid(params: {
  ctx: CanvasRenderingContext2D;
  layout: PolarLayout;
  angleCount: number;
  radiusDomain: [number, number];
  tickCount?: number;
  stroke?: string;
  strokeWidth?: number;
  strokeDasharray?: string | number[];
  gridType?: 'polygon' | 'circle';
}): void {
  const {
    ctx,
    layout,
    angleCount,
    radiusDomain,
    tickCount = 5,
    stroke = '#e5e7eb',
    strokeWidth = 1,
    strokeDasharray,
    gridType = 'polygon',
  } = params;

  if (angleCount < 1 || layout.outerRadius <= 0) return;

  const radiusTicks = createRadiusTicks(radiusDomain, tickCount).slice(1); // skip center
  const angleStep = 360 / angleCount;

  ctx.save();
  try {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = strokeWidth;
    if (strokeDasharray) {
      const dashes = typeof strokeDasharray === 'string'
        ? strokeDasharray.split(/[\s,]+/).map(Number).filter((n) => Number.isFinite(n) && n > 0)
        : strokeDasharray;
      ctx.setLineDash(dashes);
    } else {
      ctx.setLineDash([]);
    }

    // Concentric rings
    for (const tick of radiusTicks) {
      const [min, max] = radiusDomain;
      const t = max === min ? 0 : (tick - min) / (max - min);
      const r = Math.max(0, t) * layout.outerRadius;
      if (r <= 0) continue;

      ctx.beginPath();
      if (gridType === 'circle') {
        ctx.arc(layout.cx, layout.cy, r, 0, Math.PI * 2);
      } else {
        for (let i = 0; i < angleCount; i++) {
          const { x, y } = polarToCartesian(layout.cx, layout.cy, r, i * angleStep);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
      }
      ctx.stroke();
    }

    // Radial spokes
    for (let i = 0; i < angleCount; i++) {
      const { x, y } = polarToCartesian(layout.cx, layout.cy, layout.outerRadius, i * angleStep);
      ctx.beginPath();
      ctx.moveTo(layout.cx, layout.cy);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  } finally {
    ctx.restore();
  }
}

export function drawPolarAngleAxis(params: {
  ctx: CanvasRenderingContext2D;
  layout: PolarLayout;
  labels: string[];
  stroke?: string;
  tick?: boolean;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string | number;
  fill?: string;
  labelOffset?: number;
}): void {
  const {
    ctx,
    layout,
    labels,
    stroke = '#94a3b8',
    tick = true,
    fontSize = 12,
    fontFamily = 'sans-serif',
    fontWeight,
    fill = '#374151',
    labelOffset = 14,
  } = params;

  if (labels.length === 0 || layout.outerRadius <= 0) return;
  const angleStep = 360 / labels.length;

  ctx.save();
  try {
    ctx.strokeStyle = stroke;
    ctx.fillStyle = fill;
    ctx.font = buildFont(fontSize, fontFamily, fontWeight);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (let i = 0; i < labels.length; i++) {
      const angle = i * angleStep;
      if (tick) {
        const inner = polarToCartesian(layout.cx, layout.cy, layout.outerRadius, angle);
        const outer = polarToCartesian(layout.cx, layout.cy, layout.outerRadius + 4, angle);
        ctx.beginPath();
        ctx.moveTo(inner.x, inner.y);
        ctx.lineTo(outer.x, outer.y);
        ctx.stroke();
      }

      const labelPos = polarToCartesian(
        layout.cx,
        layout.cy,
        layout.outerRadius + labelOffset,
        angle,
      );
      ctx.fillText(labels[i], labelPos.x, labelPos.y);
    }
  } finally {
    ctx.restore();
  }
}

export function drawPolarRadiusAxis(params: {
  ctx: CanvasRenderingContext2D;
  layout: PolarLayout;
  domain: [number, number];
  tickCount?: number;
  angle?: number;
  stroke?: string;
  tick?: boolean;
  tickFormatter?: (value: number) => string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string | number;
  fill?: string;
}): void {
  const {
    ctx,
    layout,
    domain,
    tickCount = 5,
    angle = 90,
    stroke = '#94a3b8',
    tick = true,
    tickFormatter,
    fontSize = 11,
    fontFamily = 'sans-serif',
    fontWeight,
    fill = '#6b7280',
  } = params;

  if (layout.outerRadius <= 0) return;
  const ticks = createRadiusTicks(domain, tickCount);

  ctx.save();
  try {
    ctx.strokeStyle = stroke;
    ctx.fillStyle = fill;
    ctx.font = buildFont(fontSize, fontFamily, fontWeight);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    // Axis line along the spoke
    const end = polarToCartesian(layout.cx, layout.cy, layout.outerRadius, angle);
    ctx.beginPath();
    ctx.moveTo(layout.cx, layout.cy);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();

    const [min, max] = domain;
    for (const value of ticks) {
      const t = max === min ? 0 : (value - min) / (max - min);
      const r = Math.max(0, t) * layout.outerRadius;
      const point = polarToCartesian(layout.cx, layout.cy, r, angle);

      if (tick && r > 0) {
        ctx.beginPath();
        ctx.moveTo(point.x - 3, point.y);
        ctx.lineTo(point.x + 3, point.y);
        ctx.stroke();
      }

      const label = tickFormatter ? tickFormatter(value) : String(Number.isInteger(value) ? value : value.toFixed(1));
      ctx.fillText(label, point.x + 6, point.y);
    }
  } finally {
    ctx.restore();
  }
}

export function drawRadarPolygon(params: {
  ctx: CanvasRenderingContext2D;
  points: PolarPoint[];
  stroke?: string;
  strokeWidth?: number;
  fill?: string;
  fillOpacity?: number;
  dot?: boolean | { r?: number; fill?: string; stroke?: string };
  hoveredIndex?: number | null;
}): void {
  const {
    ctx,
    points,
    stroke = '#8884d8',
    strokeWidth = 2,
    fill = '#8884d8',
    fillOpacity = 0.2,
    dot = false,
    hoveredIndex = null,
  } = params;

  if (points.length === 0) return;

  ctx.save();
  try {
    ctx.beginPath();
    for (let i = 0; i < points.length; i++) {
      const point = points[i];
      if (i === 0) ctx.moveTo(point.x, point.y);
      else ctx.lineTo(point.x, point.y);
    }
    ctx.closePath();

    if (fill && fillOpacity > 0) {
      ctx.globalAlpha = fillOpacity;
      ctx.fillStyle = fill;
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    ctx.strokeStyle = stroke;
    ctx.lineWidth = strokeWidth;
    ctx.stroke();

    const showDot = Boolean(dot);
    const dotRadius = typeof dot === 'object' ? (dot.r ?? 3) : 3;
    const dotFill = typeof dot === 'object' ? (dot.fill ?? stroke) : stroke;
    const dotStroke = typeof dot === 'object' ? (dot.stroke ?? '#fff') : '#fff';

    if (showDot || hoveredIndex !== null) {
      for (let i = 0; i < points.length; i++) {
        if (!showDot && i !== hoveredIndex) continue;
        const point = points[i];
        const r = i === hoveredIndex ? dotRadius + 2 : dotRadius;
        ctx.beginPath();
        ctx.arc(point.x, point.y, r, 0, Math.PI * 2);
        ctx.fillStyle = dotFill;
        ctx.fill();
        ctx.strokeStyle = dotStroke;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    }
  } finally {
    ctx.restore();
  }
}
