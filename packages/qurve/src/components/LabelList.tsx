import { useEffect } from 'react';
import {
  drawLabelList,
  getBaseValue,
  projectPoints,
  LayerOrder,
} from '@qurve/core';
import type { LabelListPosition } from '@qurve/core';
import {
  useChartLayoutContext,
  useChartRenderContext,
  useChartScaleContext,
} from './chart/chartContext';
import type { DataKey } from './chart/chartContext';

const LABEL_LIST_CONSTANTS = {
  DEFAULT_OFFSET: 5,
  DEFAULT_FILL: '#374151',
  DEFAULT_FONT_SIZE: 12,
  DEFAULT_FONT_FAMILY: 'sans-serif',
  DEFAULT_BAND_RATIO: 0.72,
  DEFAULT_SINGLE_BAR_RATIO: 0.62,
};

export interface LabelListProps {
  /** Series data key used for Y positioning (and label text when valueKey is omitted). */
  dataKey: DataKey;
  /** Field used for label text. Defaults to dataKey. */
  valueKey?: DataKey;
  position?: LabelListPosition;
  offset?: number;
  fill?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string | number;
  formatter?: (value: unknown, entry: Record<string, unknown>, index: number) => string;
  /**
   * `point` — anchor at projected series points (Line, Area, Scatter).
   * `bar` — estimate bar rects for inside/center placement relative to the bar.
   */
  shape?: 'point' | 'bar';
}

function resolveLabelValue(
  item: Record<string, unknown>,
  index: number,
  key: DataKey,
): unknown {
  if (typeof key === 'function') return key(item, index);
  return item[key];
}

function formatLabelValue(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'number') {
    return Number.isFinite(value) ? String(value) : '';
  }
  return String(value);
}

/**
 * Renders per-point (or per-bar) labels for a cartesian series.
 * Use as a sibling of Line, Bar, Area, or Scatter — same pattern as ErrorBar.
 *
 * @example
 * <Chart data={data}>
 *   <XAxis dataKey="x" />
 *   <YAxis />
 *   <Bar dataKey="sales" />
 *   <LabelList dataKey="sales" position="top" shape="bar" />
 * </Chart>
 */
export function LabelList({
  dataKey,
  valueKey,
  position = 'top',
  offset = LABEL_LIST_CONSTANTS.DEFAULT_OFFSET,
  fill = LABEL_LIST_CONSTANTS.DEFAULT_FILL,
  fontSize = LABEL_LIST_CONSTANTS.DEFAULT_FONT_SIZE,
  fontFamily,
  fontWeight,
  formatter,
  shape = 'point',
}: LabelListProps) {
  const { data, margin, innerWidth, theme } = useChartLayoutContext();
  const { getXScale, getYScale, xAxis } = useChartScaleContext();
  const { registerRender, ctx } = useChartRenderContext();
  const resolvedFontFamily = fontFamily ?? theme.fontFamily ?? LABEL_LIST_CONSTANTS.DEFAULT_FONT_FAMILY;
  const textKey = valueKey ?? dataKey;

  useEffect(() => {
    if (!ctx || !data.length) return;

    const render = () => {
      const points = projectPoints({
        data,
        margin,
        xAxis,
        dataKey,
        getXScale,
        getYScale,
      });

      if (points.length === 0) return;

      let barWidth = 0;
      let baseY = 0;

      if (shape === 'bar') {
        const yScale = getYScale(dataKey);
        const scaleDomain = (yScale as { domain?: () => [number, number] }).domain?.();
        const domain: [number, number] = scaleDomain ?? [0, 100];
        const baseValue = getBaseValue(domain);
        baseY = margin.top + yScale(baseValue);

        let spacing = innerWidth;
        if (points.length > 1) {
          let minDelta = Infinity;
          for (let index = 1; index < points.length; index++) {
            const delta = Math.abs(points[index].x - points[index - 1].x);
            if (delta > 0 && delta < minDelta) minDelta = delta;
          }
          if (Number.isFinite(minDelta)) spacing = minDelta;
        }

        const bandWidth = points.length > 1
          ? spacing * LABEL_LIST_CONSTANTS.DEFAULT_BAND_RATIO
          : innerWidth * LABEL_LIST_CONSTANTS.DEFAULT_SINGLE_BAR_RATIO;
        barWidth = Math.max(1, bandWidth * 0.88);
      }

      const items = points.map((point) => {
        const entry = data[point.index] ?? {};
        const raw = resolveLabelValue(entry, point.index, textKey);
        const text = formatter
          ? formatter(raw, entry, point.index)
          : formatLabelValue(raw);

        if (shape === 'bar') {
          const top = Math.min(point.y, baseY);
          const bottom = Math.max(point.y, baseY);
          const height = Math.max(1, bottom - top);
          return {
            x: point.x - barWidth / 2,
            y: top,
            width: barWidth,
            height,
            text,
          };
        }

        return { x: point.x, y: point.y, text };
      });

      drawLabelList({
        ctx,
        items,
        position,
        offset,
        fill,
        fontSize,
        fontFamily: resolvedFontFamily,
        fontWeight,
      });
    };

    return registerRender(render, { layer: LayerOrder.labels });
  }, [
    ctx,
    data,
    margin,
    innerWidth,
    xAxis,
    dataKey,
    textKey,
    getXScale,
    getYScale,
    position,
    offset,
    fill,
    fontSize,
    resolvedFontFamily,
    fontWeight,
    formatter,
    shape,
    registerRender,
  ]);

  return null;
}
