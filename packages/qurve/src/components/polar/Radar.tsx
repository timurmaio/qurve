import { useEffect, useMemo, useRef } from 'react';
import {
  drawRadarPolygon,
  findClosestRadarIndex,
  getPolarLayout,
  projectRadarPoints,
  resolveRadiusDomain,
  LayerOrder,
} from '@qurve/core';
import type { PolarPoint } from '@qurve/core';
import {
  useChartInteractionContext,
  useChartLayoutContext,
  useChartRenderContext,
  useChartScaleContext,
  useChartSeriesContext,
} from '../chart/chartContext';
import type { DataKey, TooltipPayloadItem } from '../chart/chartContext';

export interface RadarProps {
  dataKey: DataKey;
  stroke?: string;
  strokeWidth?: number;
  fill?: string;
  fillOpacity?: number;
  dot?: boolean | { r?: number; fill?: string; stroke?: string };
  name?: string;
  tooltipName?: string;
  tooltipFormatter?: (
    value: number | null,
    name: string,
    item: TooltipPayloadItem,
  ) => React.ReactNode | [React.ReactNode, React.ReactNode];
}

export function Radar({
  dataKey,
  stroke: strokeProp,
  strokeWidth = 2,
  fill: fillProp,
  fillOpacity = 0.2,
  dot = false,
  name,
  tooltipName,
  tooltipFormatter,
}: RadarProps) {
  const { data, width, height, margin, getSeriesColor } = useChartLayoutContext();
  const { polarRadiusAxis } = useChartScaleContext();
  const { registerRender, ctx, requestRender } = useChartRenderContext();
  const {
    registerTooltipSeries,
    registerTooltipIndexResolver,
    hoveredIndex,
  } = useChartInteractionContext();
  const {
    registerRadarSeries,
    registerLegendItem,
    isSeriesVisible,
    legendVersion,
    getRadarSeriesRegistrations,
    radarSeriesVersion,
  } = useChartSeriesContext();

  const stroke = strokeProp ?? getSeriesColor();
  const fill = fillProp ?? stroke;
  const seriesId = useMemo(() => Symbol('radar-series'), []);
  const pointsRef = useRef<PolarPoint[]>([]);
  const layoutRef = useRef(getPolarLayout({ width, height, margin }));
  const seriesName = tooltipName ?? name ?? (typeof dataKey === 'string' ? dataKey : 'value');
  const payloadDataKey = typeof dataKey === 'string' ? dataKey : 'value';

  useEffect(() => {
    return registerLegendItem({
      id: seriesId,
      name: seriesName,
      color: stroke,
      type: 'radar',
    });
  }, [registerLegendItem, seriesId, seriesName, stroke]);

  useEffect(() => {
    return registerRadarSeries({ id: seriesId, dataKey });
  }, [registerRadarSeries, seriesId, dataKey]);

  useEffect(() => {
    if (!ctx || !data.length) {
      pointsRef.current = [];
      requestRender();
      return;
    }

    const layout = getPolarLayout({ width, height, margin });
    layoutRef.current = layout;
    const registrations = getRadarSeriesRegistrations();
    const dataKeys = registrations.map((r) => r.dataKey);
    if (polarRadiusAxis?.dataKey) dataKeys.push(polarRadiusAxis.dataKey);
    const domain = resolveRadiusDomain(
      data,
      dataKeys.length > 0 ? dataKeys : [dataKey],
      polarRadiusAxis?.domain ?? 'auto',
    );

    pointsRef.current = projectRadarPoints({ data, dataKey, layout, domain });
    requestRender();
  }, [
    ctx,
    data,
    width,
    height,
    margin,
    dataKey,
    polarRadiusAxis,
    getRadarSeriesRegistrations,
    radarSeriesVersion,
    requestRender,
  ]);

  useEffect(() => {
    return registerTooltipIndexResolver((mouseX, mouseY) => {
      return findClosestRadarIndex(pointsRef.current, layoutRef.current, mouseX, mouseY);
    });
  }, [registerTooltipIndexResolver]);

  useEffect(() => {
    return registerTooltipSeries((index) => {
      if (!isSeriesVisible(seriesId)) return null;
      const point = pointsRef.current[index];
      if (!point) return null;
      return {
        dataKey: payloadDataKey,
        name: seriesName,
        value: Number.isFinite(point.value) ? point.value : null,
        color: stroke,
        formatter: tooltipFormatter,
        anchor: { x: point.x, y: point.y },
      };
    }, { layer: LayerOrder.radar });
  }, [
    registerTooltipSeries,
    payloadDataKey,
    seriesName,
    stroke,
    tooltipFormatter,
    isSeriesVisible,
    seriesId,
    legendVersion,
  ]);

  useEffect(() => {
    if (!ctx || !data.length) return;

    const render = () => {
      if (!isSeriesVisible(seriesId)) return;
      drawRadarPolygon({
        ctx,
        points: pointsRef.current,
        stroke,
        strokeWidth,
        fill,
        fillOpacity,
        dot,
        hoveredIndex,
      });
    };

    return registerRender(render, { layer: LayerOrder.radar });
  }, [
    ctx,
    data,
    stroke,
    strokeWidth,
    fill,
    fillOpacity,
    dot,
    hoveredIndex,
    registerRender,
    isSeriesVisible,
    seriesId,
    legendVersion,
  ]);

  return null;
}
