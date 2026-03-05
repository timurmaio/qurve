import { useEffect } from 'react';
import { drawGrid, LayerOrder } from '@qurve/core';
import { useChartLayoutContext, useChartRenderContext } from '../chart/chartContext';

export interface CartesianGridProps {
  stroke?: string;
  horizontalStroke?: string;
  verticalStroke?: string;
  strokeDasharray?: string;
  horizontal?: boolean;
  vertical?: boolean;
  horizontalCount?: number;
  verticalCount?: number;
}

export function CartesianGrid({
  stroke,
  horizontalStroke,
  verticalStroke,
  strokeDasharray = '3 3',
  horizontal = true,
  vertical = true,
  horizontalCount = 5,
  verticalCount = 5,
}: CartesianGridProps) {
  const { margin, innerWidth, innerHeight, theme } = useChartLayoutContext();
  const { registerRender, ctx } = useChartRenderContext();
  const effectiveStroke = stroke ?? theme?.gridStroke ?? '#e5e5e5';

  useEffect(() => {
    if (!ctx) return;

    const render = () => {
      drawGrid({
        ctx,
        stroke: effectiveStroke,
        horizontalStroke,
        verticalStroke,
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
  }, [ctx, margin, innerWidth, innerHeight, stroke, horizontalStroke, verticalStroke, effectiveStroke, strokeDasharray, horizontal, vertical, horizontalCount, verticalCount, registerRender, theme]);

  return null;
}
