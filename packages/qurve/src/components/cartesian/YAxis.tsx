import { useEffect } from 'react';
import { drawYAxis, LayerOrder } from '@qurve/core';
import { useChartLayoutContext, useChartRenderContext, useChartScaleContext } from '../chart/chartContext';
import type { DataKey } from '../chart/chartContext';

export interface YAxisProps {
  dataKey?: DataKey;
  /** Bind this axis to series with the same `yAxisId`. Default `0`. */
  yAxisId?: string | number;
  /** @deprecated Use `yAxisId`. */
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
  /** Render prop for tick label. (value, index) => string. Overrides tickFormatter when both provided. */
  tickRenderer?: (value: unknown, index: number) => string;
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
  yAxisId,
  yAxisKey,
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
  tickRenderer: tickSlot,
  stroke,
  tick = true,
  tickLine = true,
  axisLine = true,
  width: axisWidth = 60,
  fontSize,
  fontFamily,
  fontWeight,
}: YAxisProps) {
  const { margin, innerWidth, innerHeight, theme } = useChartLayoutContext();
  const { registerRender, ctx } = useChartRenderContext();
  const effectiveStroke = stroke ?? theme?.axisStroke ?? '#666';
  const effectiveFontFamily = fontFamily ?? theme?.fontFamily;
  const { setYAxis, getYScale } = useChartScaleContext();
  const resolvedAxisId = yAxisId ?? yAxisKey ?? 0;

  useEffect(() => {
    const key = dataKey ?? ((d: Record<string, unknown>, i: number) => {
      const val = Object.values(d)[0];
      return typeof val === 'number' ? val : i;
    });

    setYAxis(
      {
        dataKey: key,
        type,
        domain,
        reversed,
        padding,
        tickFormatter,
      },
      resolvedAxisId,
    );

    return () => setYAxis(null, resolvedAxisId);
  }, [setYAxis, resolvedAxisId, dataKey, type, domain, reversed, padding, tickFormatter]);

  useEffect(() => {
    if (!ctx) return;

    const scale = getYScale?.(dataKey, resolvedAxisId);
    if (!scale) return;

    const domainMethod = (scale as { domain?: () => [number, number] }).domain;
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
        stroke: effectiveStroke,
        tick,
        tickLine,
        axisLine,
        tickCount,
        tickValues,
        interval,
        tickFormatter: tickSlot
          ? (value: unknown, index?: number) => tickSlot(value, index ?? 0)
          : tickFormatter,
        fontSize,
        fontFamily: effectiveFontFamily,
        fontWeight,
      });
    };

    return registerRender(render, { layer: LayerOrder.axes });
  }, [
    ctx,
    margin,
    innerWidth,
    innerHeight,
    getYScale,
    dataKey,
    resolvedAxisId,
    position,
    tickCount,
    tickValues,
    interval,
    allowDecimals,
    tickFormatter,
    tickSlot,
    stroke,
    effectiveStroke,
    effectiveFontFamily,
    tick,
    tickLine,
    axisLine,
    axisWidth,
    fontSize,
    fontFamily,
    fontWeight,
    registerRender,
    theme,
  ]);

  return null;
}
