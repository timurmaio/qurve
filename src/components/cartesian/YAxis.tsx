import { useEffect } from 'react';
import { useChartContext } from '../chart/chartContext';
import type { DataKey } from '../chart/chartContext';

export interface YAxisProps {
  dataKey?: DataKey;
  yAxisKey?: string;
  type?: 'number' | 'category';
  domain?: [number, number] | 'auto';
  reversed?: boolean;
  position?: 'left' | 'right';
  allowDecimals?: boolean;
  tickCount?: number;
  tickFormatter?: (value: unknown) => string;
  stroke?: string;
  tick?: boolean;
  tickLine?: boolean;
  axisLine?: boolean;
  width?: number;
}

export function YAxis({
  dataKey,
  type = 'number',
  domain = 'auto',
  reversed = false,
  position = 'left',
  allowDecimals = true,
  tickCount = 5,
  tickFormatter,
  stroke = '#666',
  tick = true,
  tickLine = true,
  axisLine = true,
  width: axisWidth = 60,
}: YAxisProps) {
  const { setYAxis, margin, innerWidth, innerHeight, getYScale, registerRender, ctx } = useChartContext();

  useEffect(() => {
    const key = dataKey ?? ((d: Record<string, unknown>, i: number) => {
      const val = Object.values(d)[0];
      return typeof val === 'number' ? val : i;
    });
    
    setYAxis({
      dataKey: key,
      type,
      domain,
      reversed,
      tickFormatter,
    });

    return () => setYAxis(null);
  }, [setYAxis, dataKey, type, domain, reversed, tickFormatter]);

  useEffect(() => {
    if (!ctx) return;

    const scale = getYScale?.(dataKey);
    if (!scale) return;

    const domainMethod = (scale as any).domain;
    if (!domainMethod || typeof domainMethod !== 'function') return;
    
    const [min, max] = domainMethod.call(scale);
    
    const tickValues: number[] = [];
    const step = (max - min) / (tickCount - 1);
    for (let i = 0; i < tickCount; i++) {
      tickValues.push(min + step * i);
    }

    const x = position === 'left' ? margin.left : margin.left + innerWidth;
    const y = margin.top;

    const render = () => {
      if (!ctx) return;
      
      ctx.save();
      ctx.strokeStyle = stroke;
      ctx.fillStyle = stroke;
      ctx.font = '12px sans-serif';
      ctx.textAlign = position === 'left' ? 'right' : 'left';
      ctx.textBaseline = 'middle';

      if (axisLine) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + innerHeight);
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      if (tickLine || tick) {
        tickValues.forEach((tickValue) => {
          const yPos = y + scale(tickValue);

          if (tickLine) {
            ctx.beginPath();
            ctx.moveTo(x, yPos);
            ctx.lineTo(x + (position === 'left' ? 6 : -6), yPos);
            ctx.lineWidth = 1;
            ctx.stroke();
          }

          if (tick) {
            const label = tickFormatter ? tickFormatter(tickValue) : String(tickValue.toFixed(0));
            
            ctx.fillText(
              label, 
              x + (position === 'left' ? -8 : 8), 
              yPos
            );
          }
        });
      }

      ctx.restore();
    };

    return registerRender(render);
  }, [ctx, dataKey, margin, innerWidth, innerHeight, getYScale, position, tickCount, tickFormatter, stroke, tick, tickLine, axisLine, registerRender]);

  return null;
}
