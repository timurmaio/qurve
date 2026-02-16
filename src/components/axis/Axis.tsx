import { useEffect } from 'react';
import { useChartContext } from '../ChartContext';
import { useScale } from '../scales';
import type { LinearScale } from '../scales/types';

export interface AxisProps {
  scaleName?: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  scale?: LinearScale;
  tickCount?: number;
  tickFormat?: (value: number) => string;
  tickSize?: number;
  tickPadding?: number;
  label?: string;
  labelOffset?: number;
  color?: string;
}

export function Axis({
  scaleName = 'y',
  position,
  scale: scaleProp,
  tickCount = 5,
  tickFormat,
  tickSize = 6,
  tickPadding = 8,
  label,
  labelOffset = 40,
  color = '#666',
}: AxisProps) {
  const { ctx, width, height, dpr, registerRender } = useChartContext();
  const scaleFromContext = useScale(scaleName);
  
  const scale = scaleProp || scaleFromContext as LinearScale | undefined;

  useEffect(() => {
    if (!ctx || !scale) return;

    const render = () => {
      ctx.save();
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.font = `${12 * dpr}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const ticks = scale.ticks(tickCount);
      const [range0, range1] = scale.range();

      if (position === 'bottom') {
        const y = height - 0.5;
        ctx.beginPath();
        ctx.moveTo(0.5, y);
        ctx.lineTo(width - 0.5, y);
        ctx.lineWidth = dpr;
        ctx.stroke();

        ticks.forEach(tick => {
          const x = scale(tick) + 0.5;
          
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x, y + tickSize * dpr);
          ctx.lineWidth = dpr;
          ctx.stroke();

          const label = tickFormat ? tickFormat(tick) : String(tick);
          ctx.fillText(label, x, y + tickSize * dpr + tickPadding * dpr);
        });

        if (label) {
          ctx.textAlign = 'center';
          ctx.fillText(label, width / 2, y + tickSize * dpr + tickPadding * dpr + labelOffset * dpr);
        }
      } else if (position === 'left') {
        const x = 0.5;
        ctx.beginPath();
        ctx.moveTo(x, 0.5);
        ctx.lineTo(x, height - 0.5);
        ctx.lineWidth = dpr;
        ctx.stroke();

        ticks.forEach(tick => {
          const y = scale(tick) + 0.5;
          
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x - tickSize * dpr, y);
          ctx.lineWidth = dpr;
          ctx.stroke();

          const label = tickFormat ? tickFormat(tick) : String(tick);
          ctx.textAlign = 'right';
          ctx.fillText(label, x - tickSize * dpr - tickPadding * dpr, y);
        });

        if (label) {
          ctx.textAlign = 'center';
          ctx.save();
          ctx.translate(x - tickSize * dpr - tickPadding * dpr - labelOffset * dpr, height / 2);
          ctx.rotate(-Math.PI / 2);
          ctx.fillText(label, 0, 0);
          ctx.restore();
        }
      } else if (position === 'right') {
        const x = width - 0.5;
        ctx.beginPath();
        ctx.moveTo(x, 0.5);
        ctx.lineTo(x, height - 0.5);
        ctx.lineWidth = dpr;
        ctx.stroke();

        ticks.forEach(tick => {
          const y = scale(tick) + 0.5;
          
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + tickSize * dpr, y);
          ctx.lineWidth = dpr;
          ctx.stroke();

          const label = tickFormat ? tickFormat(tick) : String(tick);
          ctx.textAlign = 'left';
          ctx.fillText(label, x + tickSize * dpr + tickPadding * dpr, y);
        });

        if (label) {
          ctx.textAlign = 'center';
          ctx.save();
          ctx.translate(x + tickSize * dpr + tickPadding * dpr + labelOffset * dpr, height / 2);
          ctx.rotate(Math.PI / 2);
          ctx.fillText(label, 0, 0);
          ctx.restore();
        }
      } else if (position === 'top') {
        const y = 0.5;
        ctx.beginPath();
        ctx.moveTo(0.5, y);
        ctx.lineTo(width - 0.5, y);
        ctx.lineWidth = dpr;
        ctx.stroke();

        ticks.forEach(tick => {
          const x = scale(tick) + 0.5;
          
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x, y - tickSize * dpr);
          ctx.lineWidth = dpr;
          ctx.stroke();

          const label = tickFormat ? tickFormat(tick) : String(tick);
          ctx.fillText(label, x, y - tickSize * dpr - tickPadding * dpr);
        });

        if (label) {
          ctx.textAlign = 'center';
          ctx.fillText(label, width / 2, y - tickSize * dpr - tickPadding * dpr - labelOffset * dpr);
        }
      }

      ctx.restore();
    };

    return registerRender(render);
  }, [ctx, width, height, dpr, scale, position, tickCount, tickFormat, tickSize, tickPadding, label, labelOffset, color, registerRender]);

  return null;
}
