import { useEffect } from 'react';
import { drawReferenceLine, LayerOrder } from '@qurve/core';
import { useChartLayoutContext, useChartRenderContext, useChartScaleContext } from '../chart/chartContext';

export interface ReferenceLineProps {
  x?: number | string;
  y?: number | string;
  stroke?: string;
  strokeWidth?: number;
  strokeDasharray?: string;
}

export function ReferenceLine({
  x,
  y,
  stroke = '#666',
  strokeWidth = 1,
  strokeDasharray,
}: ReferenceLineProps) {
  const { margin, innerWidth, innerHeight } = useChartLayoutContext();
  const { registerRender, ctx } = useChartRenderContext();
  const { getXScale, getYScale } = useChartScaleContext();

  useEffect(() => {
    if (!ctx) return;

    const xScale = getXScale?.();
    const yScale = getYScale?.();

    if (y !== undefined && yScale) {
      const numY = typeof y === 'string' ? parseFloat(y) : y;
      if (Number.isFinite(numY)) {
        const render = () => {
          drawReferenceLine({
            ctx,
            orientation: 'horizontal',
            value: numY,
            scale: yScale,
            margin,
            innerWidth,
            innerHeight,
            stroke,
            strokeWidth,
            strokeDasharray,
          });
        };
        return registerRender(render, { layer: LayerOrder.overlays });
      }
    }

    if (x !== undefined && xScale) {
      const numX = typeof x === 'string' ? parseFloat(x) : x;
      if (Number.isFinite(numX)) {
        const render = () => {
          drawReferenceLine({
            ctx,
            orientation: 'vertical',
            value: numX,
            scale: xScale,
            margin,
            innerWidth,
            innerHeight,
            stroke,
            strokeWidth,
            strokeDasharray,
          });
        };
        return registerRender(render, { layer: LayerOrder.overlays });
      }
    }

    return () => {};
  }, [ctx, x, y, margin, innerWidth, innerHeight, getXScale, getYScale, stroke, strokeWidth, strokeDasharray, registerRender]);

  return null;
}
