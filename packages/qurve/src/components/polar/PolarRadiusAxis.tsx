import { useEffect } from 'react';
import {
  drawPolarRadiusAxis,
  getPolarLayout,
  resolveRadiusDomain,
  LayerOrder,
} from '@qurve/core';
import {
  useChartLayoutContext,
  useChartRenderContext,
  useChartScaleContext,
  useChartSeriesContext,
} from '../chart/chartContext';
import type { DataKey } from '../chart/chartContext';

export interface PolarRadiusAxisProps {
  dataKey?: DataKey;
  domain?: [number, number] | 'auto';
  tickCount?: number;
  /** Spoke angle for ticks/labels (degrees). Default 90. */
  angle?: number;
  tick?: boolean;
  tickFormatter?: (value: number) => string;
  stroke?: string;
  fill?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string | number;
}

export function PolarRadiusAxis({
  dataKey,
  domain = 'auto',
  tickCount = 5,
  angle = 90,
  tick = true,
  tickFormatter,
  stroke,
  fill,
  fontSize = 11,
  fontFamily,
  fontWeight,
}: PolarRadiusAxisProps) {
  const { data, width, height, margin, theme } = useChartLayoutContext();
  const { setPolarRadiusAxis } = useChartScaleContext();
  const { getRadarSeriesRegistrations, radarSeriesVersion } = useChartSeriesContext();
  const { registerRender, ctx } = useChartRenderContext();
  const effectiveStroke = stroke ?? theme.axisStroke ?? '#94a3b8';
  const effectiveFill = fill ?? '#6b7280';
  const effectiveFontFamily = fontFamily ?? theme.fontFamily ?? 'sans-serif';

  useEffect(() => {
    setPolarRadiusAxis({ dataKey, domain, tickCount, angle, tickFormatter });
    return () => setPolarRadiusAxis(null);
  }, [setPolarRadiusAxis, dataKey, domain, tickCount, angle, tickFormatter]);

  useEffect(() => {
    if (!ctx || !data.length) return;

    const render = () => {
      const layout = getPolarLayout({ width, height, margin });
      const registrations = getRadarSeriesRegistrations();
      const dataKeys = registrations.map((r) => r.dataKey);
      if (dataKey) dataKeys.push(dataKey);
      const resolvedDomain = resolveRadiusDomain(
        data,
        dataKeys.length > 0 ? dataKeys : [(_, i) => i],
        domain,
      );

      drawPolarRadiusAxis({
        ctx,
        layout,
        domain: resolvedDomain,
        tickCount,
        angle,
        stroke: effectiveStroke,
        tick,
        tickFormatter,
        fontSize,
        fontFamily: effectiveFontFamily,
        fontWeight,
        fill: effectiveFill,
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
    domain,
    tickCount,
    angle,
    tick,
    tickFormatter,
    effectiveStroke,
    effectiveFill,
    fontSize,
    effectiveFontFamily,
    fontWeight,
    getRadarSeriesRegistrations,
    radarSeriesVersion,
    registerRender,
  ]);

  return null;
}
