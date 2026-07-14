import { useEffect } from 'react';
import { drawChartLabel, LayerOrder } from '@qurve/core';
import type { ChartLabelPosition } from '@qurve/core';
import { useChartLayoutContext, useChartRenderContext } from './chart/chartContext';

const LABEL_CONSTANTS = {
  DEFAULT_OFFSET: 0,
  DEFAULT_FILL: '#374151',
  DEFAULT_FONT_SIZE: 14,
  DEFAULT_FONT_FAMILY: 'sans-serif',
};

export interface LabelProps {
  /** Text content. Numbers are stringified. */
  value?: string | number;
  /** Placement relative to the plot area. */
  position?: ChartLabelPosition;
  offset?: number;
  fill?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string | number;
  /** Rotation in degrees (e.g. -90 for vertical Y-axis titles). */
  angle?: number;
}

/**
 * Draws a single chart-level label (title / axis caption) on the canvas.
 *
 * @example
 * <Chart data={data} margin={{ top: 36 }}>
 *   <Label value="Revenue" position="top" offset={8} />
 *   <XAxis dataKey="x" />
 *   <YAxis />
 *   <Line dataKey="y" />
 * </Chart>
 */
export function Label({
  value,
  position = 'top',
  offset = LABEL_CONSTANTS.DEFAULT_OFFSET,
  fill = LABEL_CONSTANTS.DEFAULT_FILL,
  fontSize = LABEL_CONSTANTS.DEFAULT_FONT_SIZE,
  fontFamily,
  fontWeight,
  angle = 0,
}: LabelProps) {
  const { margin, innerWidth, innerHeight, theme } = useChartLayoutContext();
  const { registerRender, ctx } = useChartRenderContext();
  const resolvedFontFamily = fontFamily ?? theme.fontFamily ?? LABEL_CONSTANTS.DEFAULT_FONT_FAMILY;
  const text = value == null ? '' : String(value);

  useEffect(() => {
    if (!ctx || !text) return;

    const render = () => {
      drawChartLabel({
        ctx,
        value: text,
        margin,
        innerWidth,
        innerHeight,
        position,
        offset,
        fill,
        fontSize,
        fontFamily: resolvedFontFamily,
        fontWeight,
        angle,
      });
    };

    return registerRender(render, { layer: LayerOrder.labels });
  }, [
    ctx,
    text,
    margin,
    innerWidth,
    innerHeight,
    position,
    offset,
    fill,
    fontSize,
    resolvedFontFamily,
    fontWeight,
    angle,
    registerRender,
  ]);

  return null;
}
