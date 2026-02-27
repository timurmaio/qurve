import { useEffect, useMemo, useRef } from 'react';
import { useChartContext } from '../chart/chartContext';
import type { DataKey, TooltipPayloadItem } from '../chart/chartContext';
import { drawArea, type AreaPoint } from '../chart/core/drawArea';
import { resolveXValue, resolveYValue } from '../chart/core/pointUtils';

const AREA_CONSTANTS = {
  DEFAULT_FILL: '#8884d8',
  DEFAULT_FILL_OPACITY: 0.25,
  DEFAULT_STROKE_WIDTH: 2,
  DEFAULT_HOVER_OPACITY: 0.55,
  RENDER_LAYER: 30,
  TOOLTIP_LAYER: 30,
};

interface AreaGeometry extends AreaPoint {
  value: number;
  index: number;
}

function getBaseValue(domain: [number, number]): number {
  const min = Math.min(domain[0], domain[1]);
  const max = Math.max(domain[0], domain[1]);
  if (min <= 0 && max >= 0) return 0;
  return min > 0 ? min : max;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function normalizeOpacity(value: number, fallback: number): number {
  if (!Number.isFinite(value)) return fallback;
  return clamp(value, 0, 1);
}

export interface AreaProps {
  dataKey: DataKey;
  stackId?: string | number;
  fill?: string;
  fillOpacity?: number;
  stroke?: string;
  strokeWidth?: number;
  hoverOpacity?: number;
  name?: string;
  tooltipName?: string;
  tooltipFormatter?: (value: number | null, name: string, item: TooltipPayloadItem) => React.ReactNode | [React.ReactNode, React.ReactNode];
}

export function Area({
  dataKey,
  stackId,
  fill = AREA_CONSTANTS.DEFAULT_FILL,
  fillOpacity = AREA_CONSTANTS.DEFAULT_FILL_OPACITY,
  stroke,
  strokeWidth = AREA_CONSTANTS.DEFAULT_STROKE_WIDTH,
  hoverOpacity = AREA_CONSTANTS.DEFAULT_HOVER_OPACITY,
  name,
  tooltipName,
  tooltipFormatter,
}: AreaProps) {
  const {
    data,
    margin,
    xAxis,
    getXScale,
    getYScale,
    registerRender,
    registerTooltipSeries,
    registerAreaSeries,
    getAreaSeriesRegistrations,
    areaSeriesVersion,
    registerLegendItem,
    isSeriesVisible,
    legendVersion,
    ctx,
    hoveredIndex,
    requestRender,
  } = useChartContext();

  const seriesId = useMemo(() => Symbol('area-series'), []);
  const areasRef = useRef<AreaGeometry[]>([]);
  const hoveredIndexRef = useRef<number | null>(null);
  const payloadDataKey = typeof dataKey === 'string' ? dataKey : 'value';
  const seriesName = tooltipName ?? name ?? (typeof dataKey === 'string' ? dataKey : 'value');
  const normalizedFillOpacity = normalizeOpacity(fillOpacity, AREA_CONSTANTS.DEFAULT_FILL_OPACITY);
  const normalizedHoverOpacity = normalizeOpacity(hoverOpacity, AREA_CONSTANTS.DEFAULT_HOVER_OPACITY);

  useEffect(() => {
    return registerLegendItem({
      id: seriesId,
      name: seriesName,
      color: stroke ?? fill,
      type: 'area',
    });
  }, [registerLegendItem, seriesId, seriesName, stroke, fill]);

  useEffect(() => {
    const getValue = (item: Record<string, unknown>, index: number): number => resolveYValue(item, index, dataKey);

    return registerAreaSeries({
      id: seriesId,
      stackId,
      getValue,
    });
  }, [registerAreaSeries, seriesId, stackId, dataKey]);

  useEffect(() => {
    if (!ctx || !data.length) {
      areasRef.current = [];
      requestRender();
      return;
    }

    const registrations = getAreaSeriesRegistrations();
    const ownIndex = registrations.findIndex((item) => item.id === seriesId);
    if (ownIndex < 0) {
      areasRef.current = [];
      requestRender();
      return;
    }

    const xScale = getXScale();
    const yScale = getYScale(dataKey);
    const scaleDomain = (yScale as { domain?: () => [number, number] }).domain?.();
    const domain: [number, number] = scaleDomain ?? [0, 100];
    const baseValue = getBaseValue(domain);

    const stackPredecessors = stackId === undefined
      ? []
      : registrations
          .slice(0, ownIndex)
          .filter((registration) => registration.stackId === stackId);

    const nextAreas: AreaGeometry[] = data.map((item, index) => {
      const value = resolveYValue(item, index, dataKey);
      const xValue = resolveXValue(item, index, xAxis);

      let start = baseValue;
      let end = value;

      if (stackId !== undefined) {
        let positiveStart = baseValue;
        let negativeStart = baseValue;

        for (const predecessor of stackPredecessors) {
          const previousValue = predecessor.getValue(item, index);
          if (previousValue >= 0) {
            positiveStart += previousValue;
          } else {
            negativeStart += previousValue;
          }
        }

        if (value >= 0) {
          start = positiveStart;
          end = positiveStart + value;
        } else {
          start = negativeStart;
          end = negativeStart + value;
        }
      }

      return {
        x: margin.left + xScale(xValue),
        y0: margin.top + yScale(start),
        y1: margin.top + yScale(end),
        value,
        index,
      };
    });

    areasRef.current = nextAreas;
    requestRender();
  }, [
    ctx,
    data,
    margin,
    xAxis,
    dataKey,
    stackId,
    getXScale,
    getYScale,
    getAreaSeriesRegistrations,
    areaSeriesVersion,
    seriesId,
    requestRender,
  ]);

  useEffect(() => {
    return registerTooltipSeries((index) => {
      if (!isSeriesVisible(seriesId)) return null;
      const area = areasRef.current[index];
      if (!area) return null;

      return {
        dataKey: payloadDataKey,
        name: seriesName,
        value: Number.isFinite(area.value) ? area.value : null,
        color: stroke ?? fill,
        formatter: tooltipFormatter,
      };
    }, { layer: AREA_CONSTANTS.TOOLTIP_LAYER });
  }, [registerTooltipSeries, payloadDataKey, seriesName, stroke, fill, tooltipFormatter, isSeriesVisible, seriesId, legendVersion]);

  useEffect(() => {
    hoveredIndexRef.current = hoveredIndex;
    requestRender();
  }, [hoveredIndex, requestRender]);

  useEffect(() => {
    if (!ctx || !data.length) return;

    const render = () => {
      const points = areasRef.current;
      if (points.length === 0) return;

      try {
        if (!isSeriesVisible(seriesId)) return;
        drawArea({
          ctx,
          points,
          fill,
          fillOpacity: normalizedFillOpacity,
          stroke,
          strokeWidth,
          hoveredIndex: hoveredIndexRef.current,
          hoverOpacity: normalizedHoverOpacity,
        });
      } catch (error) {
        console.error('Area render error:', error);
      }
    };

    return registerRender(render, { layer: AREA_CONSTANTS.RENDER_LAYER });
  }, [
    ctx,
    data,
    fill,
    normalizedFillOpacity,
    stroke,
    strokeWidth,
    normalizedHoverOpacity,
    registerRender,
    isSeriesVisible,
    seriesId,
    legendVersion,
  ]);

  return null;
}
