import { useEffect, useRef } from 'react';
import { useChartContext } from '../chart/chartContext';
import type { DataKey } from '../chart/chartContext';
import { drawActiveDot, drawLineDots, drawLinePath } from '../chart/core/drawLine';
import { projectPoints } from '../chart/core/pointUtils';

// Constants for consistent styling
const LINE_CONSTANTS = {
  DEFAULT_DOT_RADIUS: 3,
  DEFAULT_ACTIVE_DOT_RADIUS: 6,
  DEFAULT_DOT_STROKE: '#fff',
  DEFAULT_STROKE: '#8884d8',
  DEFAULT_STROKE_WIDTH: 2,
};

export interface LineProps {
  dataKey: DataKey;
  type?: 'linear' | 'monotone' | 'step';
  stroke?: string;
  strokeWidth?: number;
  dot?: boolean | { r?: number; fill?: string; stroke?: string };
  activeDot?: boolean | { r?: number; fill?: string; stroke?: string };
  name?: string;
}

interface Point {
  x: number;
  y: number;
  value: number;
  index: number;
}

export function Line({
  dataKey,
  type = 'linear',
  stroke = LINE_CONSTANTS.DEFAULT_STROKE,
  strokeWidth = LINE_CONSTANTS.DEFAULT_STROKE_WIDTH,
  dot = false,
  activeDot = true,
  name,
}: LineProps) {
  const {
    data,
    margin,
    getXScale,
    getYScale,
    xAxis,
    registerRender,
    registerTooltipSeries,
    ctx,
    hoveredIndex,
    requestRender,
  } = useChartContext();
  const pointsRef = useRef<Point[]>([]);
  const hoveredIndexRef = useRef<number | null>(null);
  const seriesName = name ?? (typeof dataKey === 'string' ? dataKey : 'value');
  const payloadDataKey = typeof dataKey === 'string' ? dataKey : 'value';

  // Cache points when data changes
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
      getYScale,
    });

    pointsRef.current = newPoints;
    requestRender();
  }, [ctx, data, margin, getXScale, getYScale, xAxis, dataKey, requestRender]);

  useEffect(() => {
    return registerTooltipSeries((index) => {
      const point = pointsRef.current[index];
      if (!point) return null;
      return {
        dataKey: payloadDataKey,
        name: seriesName,
        value: Number.isFinite(point.value) ? point.value : null,
        color: stroke,
      };
    });
  }, [registerTooltipSeries, payloadDataKey, seriesName, stroke]);

  // Sync hoveredIndex to ref - avoids re-registering render function
  useEffect(() => {
    hoveredIndexRef.current = hoveredIndex;
    requestRender();
  }, [hoveredIndex, requestRender]);

  // Main render function for line and dots
  useEffect(() => {
    if (!ctx || !data.length) return;

    const points = pointsRef.current;
    if (points.length === 0) return;

    const render = () => {
      try {
        ctx.save();
        drawLinePath({ ctx, points, type, stroke, strokeWidth });

        // Draw regular dots
        const dotRadius = typeof dot === 'object' ? dot.r ?? LINE_CONSTANTS.DEFAULT_DOT_RADIUS : dot ? LINE_CONSTANTS.DEFAULT_DOT_RADIUS : 0;
        const dotFill = typeof dot === 'object' ? dot.fill ?? stroke : stroke;
        const dotStroke = typeof dot === 'object' ? dot.stroke ?? LINE_CONSTANTS.DEFAULT_DOT_STROKE : LINE_CONSTANTS.DEFAULT_DOT_STROKE;

        if (dot && dotRadius > 0) {
          drawLineDots({ ctx, points, radius: dotRadius, fill: dotFill, stroke: dotStroke });
        }

        // Draw active dot if hovering - read from ref to avoid re-subscription
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

    return registerRender(render);
  }, [ctx, data, margin, getXScale, getYScale, xAxis, dataKey, type, stroke, strokeWidth, dot, registerRender, activeDot]);

  return null;
}
