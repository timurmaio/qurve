import { useEffect } from 'react';
import { drawReferenceDot, LayerOrder } from '@qurve/core';
import { useChartLayoutContext, useChartRenderContext, useChartScaleContext } from '../chart/chartContext';

export interface ReferenceDotProps {
  x: number | string;
  y: number | string;
  r?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
}

export function ReferenceDot({
  x,
  y,
  r = 4,
  fill = '#333',
  stroke = '#fff',
  strokeWidth = 2,
}: ReferenceDotProps) {
  const { margin } = useChartLayoutContext();
  const { registerRender, ctx } = useChartRenderContext();
  const { getXScale, getYScale } = useChartScaleContext();

  useEffect(() => {
    if (!ctx) return;

    const xScale = getXScale?.();
    const yScale = getYScale?.();
    if (!xScale || !yScale) return;

    const numX = typeof x === 'string' ? parseFloat(x) : x;
    const numY = typeof y === 'string' ? parseFloat(y) : y;
    if (!Number.isFinite(numX) || !Number.isFinite(numY)) return;

    const render = () => {
      const xPx = margin.left + xScale(numX);
      const yPx = margin.top + yScale(numY);
      drawReferenceDot({
        ctx,
        x: xPx,
        y: yPx,
        r,
        fill,
        stroke,
        strokeWidth,
      });
    };

    return registerRender(render, { layer: LayerOrder.overlays });
  }, [ctx, x, y, margin, getXScale, getYScale, r, fill, stroke, strokeWidth, registerRender]);

  return null;
}
