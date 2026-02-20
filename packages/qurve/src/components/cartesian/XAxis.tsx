import { useEffect } from 'react';
import { useChartLayoutContext, useChartRenderContext, useChartScaleContext } from '../chart/chartContext';
import type { DataKey } from '../chart/chartContext';
import { drawXAxis } from '../chart/core/drawAxis';

export interface XAxisProps {
  dataKey?: DataKey;
  xAxisKey?: string;
  type?: 'number' | 'category' | 'band';
  domain?: [number, number] | 'auto';
  reversed?: boolean;
  position?: 'top' | 'bottom';
  allowDecimals?: boolean;
  tickCount?: number;
  tickFormatter?: (value: unknown) => string;
  stroke?: string;
  tick?: boolean;
  tickLine?: boolean;
  axisLine?: boolean;
}

export function XAxis({
  dataKey,
  type = 'number',
  domain = 'auto',
  reversed = false,
  position = 'bottom',
  allowDecimals = true,
  tickCount = 5,
  tickFormatter,
  stroke = '#666',
  tick = true,
  tickLine = true,
  axisLine = true,
}: XAxisProps) {
  const { margin, innerWidth, innerHeight } = useChartLayoutContext();
  const { registerRender, ctx } = useChartRenderContext();
  const { setXAxis, getXScale } = useChartScaleContext();

  useEffect(() => {
    setXAxis({
      dataKey: dataKey ?? ((d, i) => i),
      type,
      domain,
      reversed,
      tickFormatter,
    });

    return () => setXAxis(null);
  }, [setXAxis, dataKey, type, domain, reversed, tickFormatter]);

  useEffect(() => {
    if (!ctx) return;

    const scale = getXScale?.();
    if (!scale) return;

    const domainMethod = (scale as any).domain;
    if (!domainMethod || typeof domainMethod !== 'function') return;
    
    const [min, max] = domainMethod.call(scale);

    const render = () => {
      if (!ctx) return;

      drawXAxis({
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
  }, [ctx, margin, innerWidth, innerHeight, getXScale, position, tickCount, tickFormatter, stroke, tick, tickLine, axisLine, registerRender]);

  return null;
}
