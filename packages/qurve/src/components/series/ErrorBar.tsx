import { useEffect } from 'react';
import { drawErrorBars, LayerOrder } from '@qurve/core';
import { useChartContext } from '../chart/chartContext';
import type { DataKey } from '../chart/chartContext';

export interface ErrorBarProps {
  dataKey: DataKey;
  errorKey?: DataKey;
  direction?: 'x' | 'y';
  stroke?: string;
  strokeWidth?: number;
  width?: number;
}

/**
 * Renders error bars for Line, Bar, Area, or Scatter.
 * Data format: { x: 1, y: 10, errorY: 2 } or { errorY: [1, 3] } for asymmetric.
 * Use as sibling of the series component.
 */
export function ErrorBar({
  dataKey,
  errorKey,
  direction = 'y',
  stroke = '#333',
  strokeWidth = 1.5,
  width = 5,
}: ErrorBarProps) {
  const {
    data,
    margin,
    xAxis,
    getXScale,
    getYScale,
    registerRender,
    ctx,
  } = useChartContext();

  const resolvedErrorKey = errorKey ?? (typeof dataKey === 'string' ? `error${String(dataKey).charAt(0).toUpperCase()}${String(dataKey).slice(1)}` as DataKey : undefined);

  useEffect(() => {
    if (!ctx || !data.length) return;
    if (!resolvedErrorKey && typeof dataKey !== 'string') return;

    const render = () => {
      drawErrorBars({
        ctx,
        data,
        margin,
        xAxis,
        dataKey,
        errorKey: resolvedErrorKey ?? dataKey,
        getXScale,
        getYScale,
        direction,
        stroke,
        strokeWidth,
        width,
      });
    };

    return registerRender(render, { layer: LayerOrder.overlays });
  }, [ctx, data, margin, xAxis, dataKey, resolvedErrorKey, getXScale, getYScale, direction, stroke, strokeWidth, width, registerRender]);

  return null;
}
