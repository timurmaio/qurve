import { useEffect, useRef } from 'react';
import { drawActiveDot, drawLineDots, drawLinePath, projectPoints, LayerOrder } from '@qurve/core';
import {
  useChartInteractionContext,
  useChartLayoutContext,
  useChartRenderContext,
  useChartScaleContext,
  useChartSeriesContext,
} from '../chart/chartContext';
import type { DataKey } from '../chart/chartContext';

const LINE_CONSTANTS = {
  DEFAULT_DOT_RADIUS: 3,
  DEFAULT_ACTIVE_DOT_RADIUS: 6,
  DEFAULT_DOT_STROKE: '#fff',
  DEFAULT_STROKE_WIDTH: 2,
};

export interface LineProps {
  dataKey: DataKey;
  type?: 'linear' | 'monotone' | 'step';
  stroke?: string;
  strokeWidth?: number;
  /** When false (default), missing y values break the line. When true, skip gaps and connect. */
  connectNulls?: boolean;
  /** Bind to a YAxis with the same id. Default `0`. */
  yAxisId?: string | number;
  dot?: boolean | { r?: number; fill?: string; stroke?: string };
  activeDot?: boolean | { r?: number; fill?: string; stroke?: string };
  name?: string;
}

interface Point {
  x: number;
  y: number;
  value: number | null;
  index: number;
}

export function Line({
  dataKey,
  type = 'linear',
  stroke: strokeProp,
  strokeWidth = LINE_CONSTANTS.DEFAULT_STROKE_WIDTH,
  connectNulls = false,
  yAxisId = 0,
  dot = false,
  activeDot = true,
  name,
}: LineProps) {
  const { data, margin, getSeriesColor } = useChartLayoutContext();
  const { getXScale, getYScale, xAxis } = useChartScaleContext();
  const { registerRender, ctx, requestRender } = useChartRenderContext();
  const { registerTooltipSeries, hoveredIndex } = useChartInteractionContext();
  const { registerLegendItem, isSeriesVisible, legendVersion } = useChartSeriesContext();
  const stroke = strokeProp ?? getSeriesColor();
  const seriesIdRef = useRef(Symbol('line-series'));
  const pointsRef = useRef<Point[]>([]);
  const hoveredIndexRef = useRef<number | null>(null);
  const seriesName = name ?? (typeof dataKey === 'string' ? dataKey : 'value');
  const payloadDataKey = typeof dataKey === 'string' ? dataKey : 'value';

  useEffect(() => {
    return registerLegendItem({
      id: seriesIdRef.current,
      name: seriesName,
      color: stroke,
      type: 'line',
    });
  }, [registerLegendItem, seriesName, stroke]);

  useEffect(() => {
    if (!ctx || !data.length) {
      pointsRef.current = [];
      requestRender();
      return;
    }

    const newPoints = projectPoints({
      data,
      margin,
      xAxis,
      dataKey,
      getXScale,
      getYScale: (key) => getYScale(key, yAxisId),
    });

    pointsRef.current = newPoints;
    requestRender();
  }, [ctx, data, margin, getXScale, getYScale, yAxisId, xAxis, dataKey, requestRender]);

  useEffect(() => {
    return registerTooltipSeries((index) => {
      if (!isSeriesVisible(seriesIdRef.current)) return null;
      const point = pointsRef.current[index];
      if (!point || point.value == null) return null;
      return {
        dataKey: payloadDataKey,
        name: seriesName,
        value: point.value,
        color: stroke,
        anchor: { x: point.x, y: point.y },
      };
    }, { layer: LayerOrder.line });
  }, [registerTooltipSeries, payloadDataKey, seriesName, stroke, isSeriesVisible, legendVersion]);

  useEffect(() => {
    hoveredIndexRef.current = hoveredIndex;
    requestRender();
  }, [hoveredIndex, requestRender]);

  useEffect(() => {
    if (!ctx || !data.length) return;

    const points = pointsRef.current;
    if (points.length === 0) return;

    const render = () => {
      try {
        if (!isSeriesVisible(seriesIdRef.current)) return;
        ctx.save();
        drawLinePath({ ctx, points, type, stroke, strokeWidth, connectNulls });

        const dotRadius = typeof dot === 'object' ? dot.r ?? LINE_CONSTANTS.DEFAULT_DOT_RADIUS : dot ? LINE_CONSTANTS.DEFAULT_DOT_RADIUS : 0;
        const dotFill = typeof dot === 'object' ? dot.fill ?? stroke : stroke;
        const dotStroke = typeof dot === 'object' ? dot.stroke ?? LINE_CONSTANTS.DEFAULT_DOT_STROKE : LINE_CONSTANTS.DEFAULT_DOT_STROKE;

        if (dot && dotRadius > 0) {
          drawLineDots({ ctx, points, radius: dotRadius, fill: dotFill, stroke: dotStroke });
        }

        const currentHoveredIndex = hoveredIndexRef.current;
        if (currentHoveredIndex !== null && activeDot && points[currentHoveredIndex]) {
          const point = points[currentHoveredIndex];
          const activeDotRadius = typeof activeDot === 'object' ? activeDot.r ?? LINE_CONSTANTS.DEFAULT_ACTIVE_DOT_RADIUS : LINE_CONSTANTS.DEFAULT_ACTIVE_DOT_RADIUS;
          const activeDotFill = typeof activeDot === 'object' ? activeDot.fill ?? LINE_CONSTANTS.DEFAULT_DOT_STROKE : LINE_CONSTANTS.DEFAULT_DOT_STROKE;
          const activeDotStroke = typeof activeDot === 'object' ? activeDot.stroke ?? stroke : stroke;

          drawActiveDot({ ctx, point, radius: activeDotRadius, fill: activeDotFill, stroke: activeDotStroke, lineWidth: 2 });
        }

        ctx.restore();
      } catch (error) {
        console.error('Line render error:', error);
      }
    };

    return registerRender(render, { layer: LayerOrder.line });
  }, [ctx, data, margin, getXScale, getYScale, xAxis, dataKey, type, stroke, strokeWidth, connectNulls, dot, registerRender, activeDot, isSeriesVisible, legendVersion]);

  return null;
}
