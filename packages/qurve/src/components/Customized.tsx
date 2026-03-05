import { useEffect } from 'react';
import { LayerOrder } from '@qurve/core';
import { useChartContext } from './chart/chartContext';

export interface CustomizedDrawProps {
  ctx: CanvasRenderingContext2D;
  margin: { top: number; right: number; bottom: number; left: number };
  innerWidth: number;
  innerHeight: number;
  width: number;
  height: number;
  data: Record<string, unknown>[];
  getXScale: () => (value: number) => number;
  getYScale: (dataKey?: string) => (value: number) => number;
}

export interface CustomizedProps {
  /** Custom draw function. Receives ctx and chart layout. Use registerRender internally — this component handles it. */
  draw?: (props: CustomizedDrawProps) => void;
  /** Layer order. Default: LayerOrder.overlays (80). Use lower for background, higher for on-top. */
  layer?: number;
}

/**
 * Allows custom canvas drawing within the chart. Use for annotations, highlights, or any custom graphics.
 * @example
 * <Customized draw={(props) => {
 *   const { ctx, margin, innerWidth, innerHeight } = props;
 *   ctx.fillStyle = 'rgba(255,0,0,0.2)';
 *   ctx.fillRect(margin.left, margin.top, innerWidth, innerHeight);
 * }} layer={LayerOrder.overlays} />
 */
export function Customized({ draw, layer = LayerOrder.overlays }: CustomizedProps) {
  const {
    ctx,
    margin,
    innerWidth,
    innerHeight,
    width,
    height,
    data,
    getXScale,
    getYScale,
    registerRender,
  } = useChartContext();

  useEffect(() => {
    if (!ctx || !draw) return;

    const render = () => {
      draw({
        ctx,
        margin,
        innerWidth,
        innerHeight,
        width,
        height,
        data,
        getXScale,
        getYScale,
      });
    };

    return registerRender(render, { layer });
  }, [ctx, draw, margin, innerWidth, innerHeight, width, height, data, getXScale, getYScale, registerRender, layer]);

  return null;
}
