import type { ChartData, DataKey } from '../types';
import { projectPoints, resolveXValue, resolveYValue } from './pointUtils';
import type { AxisConfig } from '../types';

function resolveError(
  item: Record<string, unknown>,
  index: number,
  errorKey: DataKey,
): [number, number] | null {
  const raw = typeof errorKey === 'function'
    ? errorKey(item, index)
    : errorKey
      ? item[errorKey as string]
      : undefined;

  if (raw === undefined || raw === null) return null;
  if (Array.isArray(raw)) {
    const lo = Number(raw[0]);
    const hi = Number(raw[1]);
    if (Number.isFinite(lo) && Number.isFinite(hi)) return [lo, hi];
  }
  const v = Number(raw);
  if (Number.isFinite(v) && v >= 0) return [v, v];
  return null;
}

export function drawErrorBars(params: {
  ctx: CanvasRenderingContext2D;
  data: ChartData;
  margin: { left: number; top: number };
  xAxis: AxisConfig | null;
  dataKey: DataKey;
  errorKey: DataKey;
  getXScale: () => (value: number) => number;
  getYScale: (dataKey?: DataKey) => (value: number) => number;
  direction?: 'x' | 'y';
  stroke?: string;
  strokeWidth?: number;
  width?: number;
}): void {
  const {
    ctx,
    data,
    margin,
    xAxis,
    dataKey,
    errorKey,
    getXScale,
    getYScale,
    direction = 'y',
    stroke = '#333',
    strokeWidth = 1.5,
    width = 5,
  } = params;

  const points = projectPoints({ data, margin, xAxis, dataKey, getXScale, getYScale });
  const yScale = getYScale(dataKey);

  ctx.save();
  try {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = strokeWidth;

    for (let i = 0; i < points.length; i++) {
      const point = points[i];
      const item = data[i] ?? {};
      const err = resolveError(item, i, errorKey);
      if (!err) continue;

      const [errLo, errHi] = err;
      const yVal = resolveYValue(item, i, dataKey);

      if (direction === 'y') {
        const yLow = margin.top + yScale(yVal - errLo);
        const yHigh = margin.top + yScale(yVal + errHi);
        const x = point.x;

        ctx.beginPath();
        ctx.moveTo(x, yLow);
        ctx.lineTo(x, yHigh);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x - width / 2, yLow);
        ctx.lineTo(x + width / 2, yLow);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x - width / 2, yHigh);
        ctx.lineTo(x + width / 2, yHigh);
        ctx.stroke();
      } else {
        const xScale = getXScale();
        const xVal = resolveXValue(item, i, xAxis);
        const xLow = margin.left + xScale(xVal - errLo);
        const xHigh = margin.left + xScale(xVal + errHi);
        const y = point.y;

        ctx.beginPath();
        ctx.moveTo(xLow, y);
        ctx.lineTo(xHigh, y);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(xLow, y - width / 2);
        ctx.lineTo(xLow, y + width / 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(xHigh, y - width / 2);
        ctx.lineTo(xHigh, y + width / 2);
        ctx.stroke();
      }
    }
  } finally {
    ctx.restore();
  }
}
