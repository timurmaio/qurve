import { useEffect } from 'react';
import { drawReferenceArea, LayerOrder } from '@qurve/core';
import { useChartLayoutContext, useChartRenderContext, useChartScaleContext } from '../chart/chartContext';

export interface ReferenceAreaProps {
  x1?: number | string;
  x2?: number | string;
  y1?: number | string;
  y2?: number | string;
  fill?: string;
  fillOpacity?: number;
}

export function ReferenceArea({
  x1,
  x2,
  y1,
  y2,
  fill = 'rgba(0, 0, 0, 0.1)',
  fillOpacity = 0.5,
}: ReferenceAreaProps) {
  const { margin, innerWidth, innerHeight } = useChartLayoutContext();
  const { registerRender, ctx } = useChartRenderContext();
  const { getXScale, getYScale } = useChartScaleContext();

  useEffect(() => {
    if (!ctx) return;

    const xScale = getXScale?.();
    const yScale = getYScale?.();

    if (y1 !== undefined && y2 !== undefined && yScale) {
      const numY1 = typeof y1 === 'string' ? parseFloat(y1) : y1;
      const numY2 = typeof y2 === 'string' ? parseFloat(y2) : y2;
      if (Number.isFinite(numY1) && Number.isFinite(numY2)) {
        const render = () => {
          drawReferenceArea({
            ctx,
            orientation: 'horizontal',
            startValue: numY1,
            endValue: numY2,
            scale: yScale,
            margin,
            innerWidth,
            innerHeight,
            fill,
            fillOpacity,
          });
        };
        return registerRender(render, { layer: LayerOrder.overlays });
      }
    }

    if (x1 !== undefined && x2 !== undefined && xScale) {
      const numX1 = typeof x1 === 'string' ? parseFloat(x1) : x1;
      const numX2 = typeof x2 === 'string' ? parseFloat(x2) : x2;
      if (Number.isFinite(numX1) && Number.isFinite(numX2)) {
        const render = () => {
          drawReferenceArea({
            ctx,
            orientation: 'vertical',
            startValue: numX1,
            endValue: numX2,
            scale: xScale,
            margin,
            innerWidth,
            innerHeight,
            fill,
            fillOpacity,
          });
        };
        return registerRender(render, { layer: LayerOrder.overlays });
      }
    }

    return () => {};
  }, [ctx, x1, x2, y1, y2, margin, innerWidth, innerHeight, getXScale, getYScale, fill, fillOpacity, registerRender]);

  return null;
}
