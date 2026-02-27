import { useEffect, useMemo, useRef } from 'react';
import { useChartContext } from '../chart/chartContext';
import type { DataKey, TooltipPayloadItem } from '../chart/chartContext';
import { drawScatterPoints, type ScatterPoint } from '../chart/core/drawScatter';
import { resolveXValue, resolveYValue } from '../chart/core/pointUtils';

const SCATTER_CONSTANTS = {
  DEFAULT_FILL: '#3b82f6',
  DEFAULT_SIZE: 4,
  DEFAULT_STROKE_WIDTH: 0,
  DEFAULT_HOVER_OPACITY: 0.5,
  RENDER_LAYER: 60,
  TOOLTIP_LAYER: 60,
};

interface ScatterGeometry extends ScatterPoint {
  index: number;
  value: number;
}

export interface ScatterProps {
  dataKey?: DataKey;
  xKey?: DataKey;
  yKey?: DataKey;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  size?: number;
  hoverOpacity?: number;
  name?: string;
  tooltipName?: string;
  tooltipFormatter?: (value: number | null, name: string, item: TooltipPayloadItem) => React.ReactNode | [React.ReactNode, React.ReactNode];
}

function clamp01(value: number, fallback: number): number {
  if (!Number.isFinite(value)) return fallback;
  return Math.max(0, Math.min(1, value));
}

function normalizeRadius(size: number): number {
  if (!Number.isFinite(size)) return SCATTER_CONSTANTS.DEFAULT_SIZE;
  return Math.max(1, size);
}

export function Scatter({
  dataKey,
  xKey,
  yKey,
  fill = SCATTER_CONSTANTS.DEFAULT_FILL,
  stroke,
  strokeWidth = SCATTER_CONSTANTS.DEFAULT_STROKE_WIDTH,
  size = SCATTER_CONSTANTS.DEFAULT_SIZE,
  hoverOpacity = SCATTER_CONSTANTS.DEFAULT_HOVER_OPACITY,
  name,
  tooltipName,
  tooltipFormatter,
}: ScatterProps) {
  const {
    data,
    margin,
    xAxis,
    getXScale,
    getYScale,
    registerRender,
    registerTooltipSeries,
    registerLegendItem,
    isSeriesVisible,
    legendVersion,
    hoveredIndex,
    requestRender,
    ctx,
  } = useChartContext();

  const seriesId = useMemo(() => Symbol('scatter-series'), []);
  const pointsRef = useRef<ScatterGeometry[]>([]);
  const yDataKey = yKey ?? dataKey;
  const payloadDataKey = typeof yDataKey === 'string' ? yDataKey : 'value';
  const seriesName = tooltipName ?? name ?? (typeof payloadDataKey === 'string' ? payloadDataKey : 'Scatter');
  const pointRadius = normalizeRadius(size);
  const normalizedHoverOpacity = clamp01(hoverOpacity, SCATTER_CONSTANTS.DEFAULT_HOVER_OPACITY);

  useEffect(() => {
    return registerLegendItem({
      id: seriesId,
      name: seriesName,
      color: fill,
      type: 'scatter',
    });
  }, [registerLegendItem, seriesId, seriesName, fill]);

  useEffect(() => {
    if (!ctx || !data.length) {
      pointsRef.current = [];
      requestRender();
      return;
    }

    const xScale = getXScale();
    const yScale = getYScale(yDataKey);

    const points: ScatterGeometry[] = data.map((item, index) => {
      const xValue = xKey
        ? resolveXValue(item, index, { dataKey: xKey })
        : resolveXValue(item, index, xAxis);
      const yValue = resolveYValue(item, index, yDataKey);

      return {
        x: margin.left + xScale(xValue),
        y: margin.top + yScale(yValue),
        radius: pointRadius,
        index,
        value: yValue,
      };
    });

    pointsRef.current = points;
    requestRender();
  }, [ctx, data, margin, xAxis, xKey, yDataKey, getXScale, getYScale, pointRadius, requestRender]);

  useEffect(() => {
    return registerTooltipSeries((index) => {
      if (!isSeriesVisible(seriesId)) return null;
      const point = pointsRef.current[index];
      if (!point) return null;

      return {
        dataKey: payloadDataKey,
        name: seriesName,
        value: Number.isFinite(point.value) ? point.value : null,
        color: fill,
        formatter: tooltipFormatter,
      };
    }, { layer: SCATTER_CONSTANTS.TOOLTIP_LAYER });
  }, [registerTooltipSeries, payloadDataKey, seriesName, fill, tooltipFormatter, isSeriesVisible, seriesId, legendVersion]);

  useEffect(() => {
    if (!ctx || !data.length) return;

    const render = () => {
      if (!isSeriesVisible(seriesId)) return;
      drawScatterPoints({
        ctx,
        points: pointsRef.current,
        fill,
        stroke,
        strokeWidth,
        hoveredIndex,
        hoverOpacity: normalizedHoverOpacity,
      });
    };

    return registerRender(render, { layer: SCATTER_CONSTANTS.RENDER_LAYER });
  }, [ctx, data, fill, stroke, strokeWidth, hoveredIndex, normalizedHoverOpacity, registerRender, isSeriesVisible, seriesId, legendVersion]);

  return null;
}
