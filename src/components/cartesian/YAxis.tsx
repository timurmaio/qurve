import { useEffect } from 'react';
import { useChartLayoutContext, useChartRenderContext, useChartScaleContext } from '../chart/chartContext';
import type { DataKey } from '../chart/chartContext';
import { drawYAxis } from '../chart/core/drawAxis';

export interface YAxisProps {
  dataKey?: DataKey;
  yAxisKey?: string;
  type?: 'number' | 'category';
  domain?: [number, number] | 'auto';
  reversed?: boolean;
  position?: 'left' | 'right';
  allowDecimals?: boolean;
  tickCount?: number;
  tickFormatter?: (value: unknown) => string;
  stroke?: string;
  tick?: boolean;
  tickLine?: boolean;
  axisLine?: boolean;
  width?: number;
}

export function YAxis({
  dataKey,
  type = 'number',
  domain = 'auto',
  reversed = false,
  position = 'left',
  allowDecimals = true,
  tickCount = 5,
  tickFormatter,
  stroke = '#666',
  tick = true,
  tickLine = true,
  axisLine = true,
  width: axisWidth = 60,
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
      tickFormatter,
    });

    return () => setYAxis(null);
  }, [setYAxis, dataKey, type, domain, reversed, tickFormatter]);

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
        tickFormatter,
      });
    };

    return registerRender(render);
  }, [ctx, dataKey, margin, innerWidth, innerHeight, getYScale, position, tickCount, tickFormatter, stroke, tick, tickLine, axisLine, registerRender]);

  return null;
}
