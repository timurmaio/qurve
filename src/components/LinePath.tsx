import { Line } from './Line';
import { Circle } from './Circle';
import { useEffect } from 'react';
import { useChartContext } from './ChartContext';

type LinePathProps = {
  data: Array<{ date: string; close: number }>;
  getX: (index: number) => number;
  getY: (price: number) => number;
};

export const LinePath: React.FC<LinePathProps> = ({ data, getX, getY }) => {
  const { ctx, width, height } = useChartContext();

  useEffect(() => {
    if (!ctx || data.length === 0) return;

    requestAnimationFrame(() => {
      ctx.beginPath();
      ctx.moveTo(getX(0), getY(data[0].close));

      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, '#2196F3');
      gradient.addColorStop(1, '#03A9F4');
      
      for (let i = 0; i < data.length - 1; i++) {
        const x1 = getX(i);
        const y1 = getY(data[i].close);
        const x2 = getX(i + 1);
        const y2 = getY(data[i + 1].close);
        
        const cp1x = x1 + (x2 - x1) / 2;
        const cp1y = y1;
        const cp2x = x1 + (x2 - x1) / 2;
        const cp2y = y2;
        
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x2, y2);
      }

      // Настраиваем качество линий
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Рисуем точки
      data.forEach((point, i) => {
        const x = getX(i);
        const y = getY(point.close);

        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        
        ctx.shadowColor = 'rgba(33, 150, 243, 0.2)';
        ctx.shadowBlur = 5;
        
        ctx.fillStyle = '#2196F3';
        ctx.strokeStyle = '#FFF';
        ctx.lineWidth = 1;
        
        ctx.fill();
        ctx.stroke();
        
        ctx.shadowBlur = 0;
      });
    })
  }, [ctx, data, getX, getY, height]);

  return null;
};