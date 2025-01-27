import { useEffect } from 'react';
import { useChartContext } from './ChartContext';

type CircleProps = {
  x: number;
  y: number;
  radius: number;
  fill?: string;
  stroke?: string;
  lineWidth?: number;
};

export const Circle: React.FC<CircleProps> = ({
  x,
  y,
  radius,
  fill = 'transparent',
  stroke = '#000',
  lineWidth = 1,
}) => {
  const { ctx } = useChartContext();

  useEffect(() => {
    if (ctx) {
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      if (fill !== 'transparent') {
        ctx.fillStyle = fill;
        ctx.fill();
      }
      ctx.strokeStyle = stroke;
      ctx.lineWidth = lineWidth;
      ctx.stroke();
    }
  }, [ctx, x, y, radius, fill, stroke, lineWidth]);

  return null;
};