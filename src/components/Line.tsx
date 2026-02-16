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
  const { ctx, dpr, registerRender } = useChartContext();

  useEffect(() => {
    if (!ctx) return;

    const render = () => {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth * dpr;
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    };

    return registerRender(render);
  }, [ctx, dpr, x1, y1, x2, y2, color, lineWidth, registerRender]);

  return null;
};