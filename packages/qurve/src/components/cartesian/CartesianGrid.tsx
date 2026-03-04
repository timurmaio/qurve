import { useEffect } from 'react';
import { drawGrid } from '@qurve/core';
import { useChartLayoutContext, useChartRenderContext } from '../chart/chartContext';

export interface CartesianGridProps {
  stroke?: string;
  strokeDasharray?: string;
  horizontal?: boolean;
  vertical?: boolean;
  horizontalCount?: number;
  verticalCount?: number;
}

const GRID_RENDER_LAYER = 10;

export function CartesianGrid({
  stroke = '#e5e5e5',
  strokeDasharray = '3 3',
  horizontal = true,
  vertical = true,
  horizontalCount = 5,
  verticalCount = 5,
}: CartesianGridProps) {
  const { margin, innerWidth, innerHeight } = useChartLayoutContext();
  const { registerRender, ctx } = useChartRenderContext();

  useEffect(() => {
    if (!ctx) return;

    const render = () => {
      drawGrid({
        ctx,
        stroke,
        strokeDasharray,
        horizontal,
        vertical,
        horizontalCount,
        verticalCount,
        margin,
        innerWidth,
        innerHeight,
      });
    };

    return registerRender(render, { layer: GRID_RENDER_LAYER });
  }, [ctx, margin, innerWidth, innerHeight, stroke, strokeDasharray, horizontal, vertical, horizontalCount, verticalCount, registerRender]);

  return null;
}
