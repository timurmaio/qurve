import { useEffect } from 'react';
import { useChartContext } from '../chart/chartContext';
import type { DataKey } from '../chart/chartContext';

export interface LineProps {
  dataKey: DataKey;
  type?: 'linear' | 'monotone' | 'step' | 'stepMiddle' | 'stepStart' | 'stepEnd';
  stroke?: string;
  strokeWidth?: number;
  dot?: boolean | { r?: number; fill?: string; stroke?: string };
  activeDot?: boolean | { r?: number; fill?: string; stroke?: string };
  fill?: string;
  fillOpacity?: number;
  isAnimationActive?: boolean;
}

export function Line({
  dataKey,
  type = 'linear',
  stroke = '#8884d8',
  strokeWidth = 2,
  dot = true,
  activeDot = true,
  fill = 'none',
  fillOpacity = 0,
  isAnimationActive = true,
}: LineProps) {
  const { data, margin, innerWidth, innerHeight, getXScale, getYScale, xAxis, registerRender, ctx } = useChartContext();

  useEffect(() => {
    if (!ctx || !data.length) return;

    const xScale = getXScale();
    const yScale = getYScale(dataKey);

    const x = margin.left;
    const y = margin.top;

    const points: { x: number; y: number; value: number }[] = [];

    data.forEach((item, index) => {
      const xValue = typeof xAxis?.dataKey === 'function'
        ? Number(xAxis.dataKey(item, index))
        : xAxis?.dataKey
          ? Number(item[xAxis.dataKey as string])
          : index;
      const yValue = typeof dataKey === 'function'
        ? Number(dataKey(item, index))
        : Number(item[dataKey as string]);

      const px = x + xScale(xValue);
      const py = y + yScale(yValue);
      
      points.push({ x: px, y: py, value: yValue });
    });

    const render = () => {
      ctx.save();
      ctx.strokeStyle = stroke;
      ctx.lineWidth = strokeWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (type === 'linear' || type === 'monotone') {
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        
        if (type === 'monotone') {
          for (let i = 0; i < points.length - 1; i++) {
            const x1 = points[i].x;
            const y1 = points[i].y;
            const x2 = points[i + 1].x;
            const y2 = points[i + 1].y;
            
            const cp1x = x1 + (x2 - x1) / 2;
            const cp1y = y1;
            const cp2x = x1 + (x2 - x1) / 2;
            const cp2y = y2;
            
            ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x2, y2);
          }
        } else {
          for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
          }
        }
        
        ctx.stroke();
      } else if (type === 'step') {
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        
        for (let i = 1; i < points.length; i++) {
          const prev = points[i - 1];
          const curr = points[i];
          
          ctx.lineTo(curr.x, prev.y);
          ctx.lineTo(curr.x, curr.y);
        }
        
        ctx.stroke();
      }

      const dotRadius = typeof dot === 'object' ? dot.r ?? 3 : dot ? 3 : 0;
      const dotFill = typeof dot === 'object' ? dot.fill ?? stroke : stroke;
      const dotStroke = typeof dot === 'object' ? dot.stroke ?? '#fff' : '#fff';
      
      if (dot && dotRadius > 0) {
        points.forEach((point) => {
          ctx.beginPath();
          ctx.arc(point.x, point.y, dotRadius, 0, Math.PI * 2);
          ctx.fillStyle = dotFill;
          ctx.fill();
          ctx.strokeStyle = dotStroke;
          ctx.lineWidth = 1;
          ctx.stroke();
        });
      }

      ctx.restore();
    };

    return registerRender(render);
  }, [ctx, data, margin, innerWidth, innerHeight, getXScale, getYScale, xAxis, dataKey, type, stroke, strokeWidth, dot, fill, fillOpacity, isAnimationActive, registerRender]);

  return null;
}
