import { useEffect } from 'react';
import { drawYAxis, LayerOrder } from '@qurve/core';
import { useChartLayoutContext, useChartRenderContext, useChartScaleContext } from '../chart/chartContext';
import type { DataKey } from '../chart/chartContext';

export interface YAxisProps {
  dataKey?: DataKey;
  yAxisKey?: string;
  type?: 'number' | 'category';
  domain?: [number, number] | 'auto';
  reversed?: boolean;
  position?: 'left' | 'right';
  allowDecimals?: boolean;
  tickCount?: number;
  tickValues?: number[];
  interval?: number;
  padding?: number | { top?: number; bottom?: number };
  tickFormatter?: (value: unknown) => string;
  stroke?: string;
  tick?: boolean;
  tickLine?: boolean;
  axisLine?: boolean;
  width?: number;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string | number;
}

export function YAxis({
  dataKey,
  type = 'number',
  domain = 'auto',
  reversed = false,
  position = 'left',
  allowDecimals = true,
  tickCount = 5,
  tickValues,
  interval = 0,
  padding,
  tickFormatter,
  stroke = '#666',
  tick = true,
  tickLine = true,
  axisLine = true,
  width: axisWidth = 60,
  fontSize,
  fontFamily,
  fontWeight,
}: YAxisProps) {
  const { margin, innerWidth, innerHeight } = useChartLayoutContext();
  const { registerRender, ctx } = useChartRenderContext();
  const { setYAxis, getYScale } = useChartScaleContext();

  useEffect(() => {
    const key = dataKey ?? ((d: Record<string, unknown>, i: number) => {
      const val = Object.values(d)[0];
      return typeof val === 'number' ? val : i;
    });
    
    setYAxis({
      dataKey: key,
      type,
      domain,
      reversed,
      padding,
      tickFormatter,
    });

    return () => setYAxis(null);
  }, [setYAxis, dataKey, type, domain, reversed, padding, tickFormatter]);

  useEffect(() => {
    if (!ctx) return;

    const scale = getYScale?.(dataKey);
    if (!scale) return;

    const domainMethod = (scale as any).domain;
    if (!domainMethod || typeof domainMethod !== 'function') return;
    
    const [min, max] = domainMethod.call(scale);

    const render = () => {
      if (!ctx) return;

      drawYAxis({
        ctx,
        scale,
        domain: [min, max],
        margin,
        innerWidth,
        innerHeight,
        position,
        stroke,
        tick,
        tickLine,
        axisLine,
        tickCount,
        tickValues,
        interval,
        tickFormatter,
        fontSize,
        fontFamily,
        fontWeight,
      });
    };

    return registerRender(render, { layer: LayerOrder.axes });
  }, [ctx, dataKey, margin, innerWidth, innerHeight, getYScale, position, tickCount, tickValues, interval, tickFormatter, stroke, tick, tickLine, axisLine, fontSize, fontFamily, fontWeight, registerRender]);

  return null;
}
