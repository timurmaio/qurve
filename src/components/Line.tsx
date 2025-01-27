import { useEffect } from 'react';
import { useChartContext } from './ChartContext';

type LineProps = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color?: string;
  lineWidth?: number;
};

export const Line: React.FC<LineProps> = ({ x1, y1, x2, y2, color = '#000', lineWidth = 1 }) => {
  const { ctx } = useChartContext();

  useEffect(() => {
    if (ctx) {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
  }, [ctx, x1, y1, x2, y2, color, lineWidth]);

  return null;
};