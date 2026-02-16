import { useEffect } from 'react';
import { useChartContext } from './ChartContext';

type LinePathProps = {
  data: Array<{ date: string; close: number }>;
  getX: (index: number) => number;
  getY: (price: number) => number;
  color?: string;
  lineWidth?: number;
  showDots?: boolean;
};

export const LinePath: React.FC<LinePathProps> = ({ 
  data, 
  getX, 
  getY,
  color = '#3b82f6',
  lineWidth = 2,
  showDots = true,
}) => {
  const { ctx, width, height, dpr, registerRender } = useChartContext();

  useEffect(() => {
    if (!ctx || data.length === 0) return;

    const render = () => {
      ctx.beginPath();
      ctx.moveTo(getX(0), getY(data[0].close));

      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, color);
      
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

      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = gradient;
      ctx.lineWidth = lineWidth * dpr;
      ctx.stroke();

      if (showDots) {
        data.forEach((point, i) => {
          const x = getX(i);
          const y = getY(point.close);

          ctx.beginPath();
          ctx.arc(x, y, 4 * dpr, 0, Math.PI * 2);
          
          ctx.shadowColor = `${color}33`;
          ctx.shadowBlur = 5;
          
          ctx.fillStyle = color;
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = dpr;
          
          ctx.fill();
          ctx.stroke();
          
          ctx.shadowBlur = 0;
        });
      }
    };

    return registerRender(render);
  }, [ctx, dpr, data, getX, getY, height, color, lineWidth, showDots, registerRender]);

  return null;
};