import { useEffect } from 'react';
import {
  drawPolarGrid,
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

export interface PolarGridProps {
  stroke?: string;
  strokeWidth?: number;
  strokeDasharray?: string | number[];
  gridType?: 'polygon' | 'circle';
  /** Number of concentric rings. Defaults to PolarRadiusAxis tickCount or 5. */
  radialLines?: number;
}

export function PolarGrid({
  stroke,
  strokeWidth = 1,
  strokeDasharray,
  gridType = 'polygon',
  radialLines,
}: PolarGridProps) {
  const { data, width, height, margin, theme } = useChartLayoutContext();
  const { polarRadiusAxis } = useChartScaleContext();
  const { getRadarSeriesRegistrations, radarSeriesVersion } = useChartSeriesContext();
  const { registerRender, ctx } = useChartRenderContext();
  const effectiveStroke = stroke ?? theme.gridStroke ?? '#e5e7eb';

  useEffect(() => {
    if (!ctx || !data.length) return;

    const render = () => {
      const layout = getPolarLayout({ width, height, margin });
      const registrations = getRadarSeriesRegistrations();
      const dataKeys = registrations.map((r) => r.dataKey);
      if (polarRadiusAxis?.dataKey) dataKeys.push(polarRadiusAxis.dataKey);
      const domain = resolveRadiusDomain(
        data,
        dataKeys.length > 0 ? dataKeys : [(_, i) => i],
        polarRadiusAxis?.domain ?? 'auto',
      );

      drawPolarGrid({
        ctx,
        layout,
        angleCount: data.length,
        radiusDomain: domain,
        tickCount: radialLines ?? polarRadiusAxis?.tickCount ?? 5,
        stroke: effectiveStroke,
        strokeWidth,
        strokeDasharray,
        gridType,
      });
    };

    return registerRender(render, { layer: LayerOrder.grid });
  }, [
    ctx,
    data,
    width,
    height,
    margin,
    polarRadiusAxis,
    radialLines,
    effectiveStroke,
    strokeWidth,
    strokeDasharray,
    gridType,
    getRadarSeriesRegistrations,
    radarSeriesVersion,
    registerRender,
  ]);

  return null;
}
