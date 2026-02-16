import { useEffect } from 'react';
import { useChartContext } from '../chart/chartContext';

export interface CartesianGridProps {
  stroke?: string;
  strokeDasharray?: string;
  horizontal?: boolean;
  vertical?: boolean;
  horizontalCount?: number;
  verticalCount?: number;
}

export function CartesianGrid({
  stroke = '#e5e5e5',
  strokeDasharray = '3 3',
  horizontal = true,
  vertical = true,
  horizontalCount = 5,
  verticalCount = 5,
}: CartesianGridProps) {
  const { margin, innerWidth, innerHeight, registerRender, ctx } = useChartContext();

  useEffect(() => {
    if (!ctx) return;

    const render = () => {
      ctx.save();
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 1;
      
      if (strokeDasharray) {
        const [dash, gap] = strokeDasharray.split(' ').map(Number);
        ctx.setLineDash([dash, gap]);
      }

      const x = margin.left;
      const y = margin.top;

      if (vertical) {
        const step = innerWidth / verticalCount;
        for (let i = 0; i <= verticalCount; i++) {
          const xPos = x + i * step;
          ctx.beginPath();
          ctx.moveTo(xPos, y);
          ctx.lineTo(xPos, y + innerHeight);
          ctx.stroke();
        }
      }

      if (horizontal) {
        const step = innerHeight / horizontalCount;
        for (let i = 0; i <= horizontalCount; i++) {
          const yPos = y + i * step;
          ctx.beginPath();
          ctx.moveTo(x, yPos);
          ctx.lineTo(x + innerWidth, yPos);
          ctx.stroke();
        }
      }

      ctx.restore();
    };

    return registerRender(render);
  }, [ctx, margin, innerWidth, innerHeight, stroke, strokeDasharray, horizontal, vertical, horizontalCount, verticalCount, registerRender]);

  return null;
}
