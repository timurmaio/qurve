import { useEffect } from 'react';
import { useChartContext } from '../chart/chartContext';
import type { DataKey } from '../chart/chartContext';

export interface XAxisProps {
  dataKey?: DataKey;
  xAxisKey?: string;
  type?: 'number' | 'category' | 'band';
  domain?: [number, number] | 'auto';
  reversed?: boolean;
  position?: 'top' | 'bottom';
  allowDecimals?: boolean;
  tickCount?: number;
  tickFormatter?: (value: unknown) => string;
  stroke?: string;
  tick?: boolean;
  tickLine?: boolean;
  axisLine?: boolean;
}

export function XAxis({
  dataKey,
  type = 'number',
  domain = 'auto',
  reversed = false,
  position = 'bottom',
  allowDecimals = true,
  tickCount = 5,
  tickFormatter,
  stroke = '#666',
  tick = true,
  tickLine = true,
  axisLine = true,
}: XAxisProps) {
  const { setXAxis, margin, innerWidth, innerHeight, getXScale, registerRender, ctx } = useChartContext();

  useEffect(() => {
    setXAxis({
      dataKey: dataKey ?? ((d, i) => i),
      type,
      domain,
      reversed,
      tickFormatter,
    });

    return () => setXAxis(null);
  }, [setXAxis, dataKey, type, domain, reversed, tickFormatter]);

  useEffect(() => {
    if (!ctx) return;

    const scale = getXScale?.();
    if (!scale) return;

    const domainMethod = (scale as any).domain;
    if (!domainMethod || typeof domainMethod !== 'function') return;
    
    const [min, max] = domainMethod.call(scale);
    const tickValues: number[] = [];
    const step = (max - min) / (tickCount - 1);
    for (let i = 0; i < tickCount; i++) {
      tickValues.push(min + step * i);
    }

    const y = position === 'top' ? margin.top : margin.top + innerHeight;
    const x = margin.left;

    const render = () => {
      if (!ctx) return;
      
      ctx.save();
      ctx.strokeStyle = stroke;
      ctx.fillStyle = stroke;
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = position === 'top' ? 'bottom' : 'top';

      if (axisLine) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + innerWidth, y);
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      if (tickLine || tick) {
        tickValues.forEach((tickValue) => {
          const xPos = x + scale(tickValue);

          if (tickLine) {
            ctx.beginPath();
            ctx.moveTo(xPos, y);
            ctx.lineTo(xPos, y + (position === 'top' ? 6 : -6));
            ctx.lineWidth = 1;
            ctx.stroke();
          }

          if (tick) {
            let label: string;
            if (tickFormatter) {
              label = tickFormatter(tickValue);
            } else {
              label = String(tickValue);
            }
            
            ctx.fillText(label, xPos, y + (position === 'top' ? -8 : 8));
          }
        });
      }

      ctx.restore();
    };

    return registerRender(render);
  }, [ctx, margin, innerWidth, innerHeight, getXScale, position, tickCount, tickFormatter, stroke, tick, tickLine, axisLine, registerRender]);

  return null;
}
