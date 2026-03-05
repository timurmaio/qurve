import { useEffect } from 'react';
import { drawGrid, LayerOrder } from '@qurve/core';
import { useChartLayoutContext, useChartRenderContext } from '../chart/chartContext';

export interface CartesianGridProps {
  stroke?: string;
  strokeDasharray?: string;
  horizontal?: boolean;
  vertical?: boolean;
  horizontalCount?: number;
  verticalCount?: number;
}

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

    return registerRender(render, { layer: LayerOrder.grid });
  }, [ctx, margin, innerWidth, innerHeight, stroke, strokeDasharray, horizontal, vertical, horizontalCount, verticalCount, registerRender]);

  return null;
}
