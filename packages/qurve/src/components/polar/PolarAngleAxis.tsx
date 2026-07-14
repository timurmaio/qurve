import { useEffect } from 'react';
import {
  drawPolarAngleAxis,
  getPolarLayout,
  resolveAngleLabel,
  LayerOrder,
} from '@qurve/core';
import {
  useChartLayoutContext,
  useChartRenderContext,
  useChartScaleContext,
} from '../chart/chartContext';
import type { DataKey } from '../chart/chartContext';

export interface PolarAngleAxisProps {
  dataKey?: DataKey;
  tick?: boolean;
  tickFormatter?: (value: unknown, index: number) => string;
  stroke?: string;
  fill?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string | number;
  labelOffset?: number;
}

export function PolarAngleAxis({
  dataKey,
  tick = true,
  tickFormatter,
  stroke,
  fill,
  fontSize = 12,
  fontFamily,
  fontWeight,
  labelOffset = 14,
}: PolarAngleAxisProps) {
  const { data, width, height, margin, theme } = useChartLayoutContext();
  const { setPolarAngleAxis } = useChartScaleContext();
  const { registerRender, ctx } = useChartRenderContext();
  const effectiveStroke = stroke ?? theme.axisStroke ?? '#94a3b8';
  const effectiveFill = fill ?? '#374151';
  const effectiveFontFamily = fontFamily ?? theme.fontFamily ?? 'sans-serif';

  useEffect(() => {
    setPolarAngleAxis({ dataKey, tickFormatter });
    return () => setPolarAngleAxis(null);
  }, [setPolarAngleAxis, dataKey, tickFormatter]);

  useEffect(() => {
    if (!ctx || !data.length) return;

    const render = () => {
      const layout = getPolarLayout({ width, height, margin });
      const labels = data.map((item, index) => {
        const raw = resolveAngleLabel(item, index, dataKey);
        return tickFormatter ? tickFormatter(raw, index) : raw;
      });

      drawPolarAngleAxis({
        ctx,
        layout,
        labels,
        stroke: effectiveStroke,
        tick,
        fontSize,
        fontFamily: effectiveFontFamily,
        fontWeight,
        fill: effectiveFill,
        labelOffset,
      });
    };

    return registerRender(render, { layer: LayerOrder.axes });
  }, [
    ctx,
    data,
    width,
    height,
    margin,
    dataKey,
    tickFormatter,
    tick,
    effectiveStroke,
    effectiveFill,
    fontSize,
    effectiveFontFamily,
    fontWeight,
    labelOffset,
    registerRender,
  ]);

  return null;
}
