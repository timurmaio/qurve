import { useEffect } from 'react';
import { useChartLayoutContext, useChartRenderContext, useChartScaleContext } from '../chart/chartContext';
import type { DataKey } from '../chart/chartContext';
import { drawXAxis } from '../chart/core/drawAxis';
import { createTimeTicks, formatTimeTick, toTimeNumber, type TimeFormatMode } from '../chart/core/timeUtils';

export interface XAxisProps {
  dataKey?: DataKey;
  xAxisKey?: string;
  type?: 'number' | 'category' | 'band' | 'time';
  domain?: [number | Date, number | Date] | 'auto';
  reversed?: boolean;
  position?: 'top' | 'bottom';
  allowDecimals?: boolean;
  tickCount?: number;
  tickValues?: Array<number | Date>;
  interval?: number;
  padding?: number | { left?: number; right?: number };
  tickFormatter?: (value: unknown) => string;
  locale?: string;
  timeZone?: string;
  timeFormat?: TimeFormatMode;
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
  tickValues,
  interval = 0,
  padding,
  tickFormatter,
  locale,
  timeZone,
  timeFormat,
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
      padding,
      tickFormatter,
      locale,
      timeZone,
      timeFormat,
    });

    return () => setXAxis(null);
  }, [setXAxis, dataKey, type, domain, reversed, padding, tickFormatter, locale, timeZone, timeFormat]);

  useEffect(() => {
    if (!ctx) return;

    const scale = getXScale?.();
    if (!scale) return;

    const domainMethod = (scale as any).domain;
    if (!domainMethod || typeof domainMethod !== 'function') return;
    
    const [min, max] = domainMethod.call(scale);
    const axisDomain: [number, number] = [Number(min), Number(max)];
    const numericTickValues = type === 'time'
      ? (tickValues
          ?.map((value) => toTimeNumber(value))
          .filter((value): value is number => value !== null) ?? createTimeTicks(axisDomain, tickCount))
      : (tickValues as number[] | undefined);
    const resolvedTickFormatter = tickFormatter
      ?? (type === 'time'
        ? (value: unknown) => formatTimeTick(Number(value), axisDomain, { locale, timeZone, timeFormat })
        : undefined);

    const render = () => {
      if (!ctx) return;

      drawXAxis({
        ctx,
        scale,
        domain: axisDomain,
        margin,
        innerWidth,
        innerHeight,
        position,
        stroke,
        tick,
        tickLine,
        axisLine,
        tickCount,
        tickValues: numericTickValues,
        interval,
        tickFormatter: resolvedTickFormatter,
      });
    };

    return registerRender(render);
  }, [ctx, margin, innerWidth, innerHeight, getXScale, position, tickCount, tickValues, interval, tickFormatter, stroke, tick, tickLine, axisLine, registerRender, type, locale, timeZone, timeFormat]);

  return null;
}
