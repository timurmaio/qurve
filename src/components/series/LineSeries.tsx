import { useEffect, useMemo } from 'react';
import { useChartContext } from '../ChartContext';
import { useScale } from '../scales';
import { createLinearScale } from '../scales/linearScale';
import type { LinearScale } from '../scales/types';

export interface LineSeriesProps {
  data: Array<{ date: string; close: number }>;
  dataKey?: string;
  xScaleName?: string;
  yScaleName?: string;
  xKey?: (d: { date: string; close: number }, i: number) => number;
  yKey?: (d: { date: string; close: number }) => number;
  color?: string;
  lineWidth?: number;
  showDots?: boolean;
  dotRadius?: number;
}

export function LineSeries({
  data,
  xScaleName = 'x',
  yScaleName = 'y',
  xKey,
  yKey,
  color = '#3b82f6',
  lineWidth = 2,
  showDots = true,
  dotRadius = 4,
}: LineSeriesProps) {
  const { ctx, width, height, dpr, registerRender } = useChartContext();
  const xScaleFromContext = useScale(xScaleName) as LinearScale | undefined;
  const yScaleFromContext = useScale(yScaleName) as LinearScale | undefined;

  const xScale = xScaleFromContext || useMemo(() => 
    createLinearScale({ domain: [0, data.length - 1], range: [0, width] }),
    [data.length, width]
  );
  
  const yScale = yScaleFromContext || useMemo(() => {
    const values = data.map(d => d.close);
    const min = Math.min(...values);
    const max = Math.max(...values);
    return createLinearScale({ domain: [min, max], range: [height, 0] });
  }, [data, height]);

  useEffect(() => {
    if (!ctx || data.length === 0) return;

    const render = () => {
      ctx.save();
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = lineWidth * dpr;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      
      const getX = xKey || ((_: { date: string }, i: number) => xScale(i));
      const getY = yKey || ((d: { date: string; close: number }) => yScale(d.close));
      
      const firstX = getX(data[0], 0);
      const firstY = getY(data[0]);
      ctx.moveTo(firstX, firstY);

      for (let i = 1; i < data.length; i++) {
        const x = getX(data[i], i);
        const y = getY(data[i]);
        ctx.lineTo(x, y);
      }

      ctx.stroke();

      if (showDots) {
        for (let i = 0; i < data.length; i++) {
          const x = getX(data[i], i);
          const y = getY(data[i]);

          ctx.beginPath();
          ctx.arc(x, y, dotRadius * dpr, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.fill();
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = dpr;
          ctx.stroke();
        }
      }

      ctx.restore();
    };

    return registerRender(render);
  }, [ctx, dpr, data, xScale, yScale, xKey, yKey, color, lineWidth, showDots, dotRadius, registerRender, width, height]);

  return null;
}
