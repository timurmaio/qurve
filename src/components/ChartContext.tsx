import React, { createContext, useContext, useRef, useEffect } from 'react';

type ChartContextType = {
  ctx: CanvasRenderingContext2D | null;
  width: number;
  height: number;
};

const ChartContext = createContext<ChartContextType>({ ctx: null, width: 0, height: 0 });

export const useChartContext = () => useContext(ChartContext);

export const ChartProvider: React.FC<{
  children: React.ReactNode;
  width: number;
  height: number;
}> = ({ children, width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ctx, setCtx] = React.useState<CanvasRenderingContext2D | null>(null);
  
  const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;

  useEffect(() => {
    if (canvasRef.current) {
      // Получаем контекст с включенным сглаживанием
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d', {
        alpha: false,
        antialias: true,
      }) as CanvasRenderingContext2D | null;
      
      if (context) {
        // Устанавливаем размеры с учетом DPR
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        
        // Устанавливаем реальные размеры буфера
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
        
        // Конфигурируем контекст
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = 'high';
        
        // Масштабируем контекст
        context.setTransform(dpr, 0, 0, dpr, 0, 0);
        
        setCtx(context);
      }
    }
  }, [width, height, dpr]);

  useEffect(() => {
    if (ctx) {
      // Очищаем канвас
      ctx.save();
      ctx.resetTransform();
      ctx.clearRect(0, 0, width * dpr, height * dpr);
      ctx.restore();
      
      // Заполняем фон
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, width, height);
    }
  }, [ctx, width, height, children, dpr]);

  return (
    <ChartContext.Provider value={{ 
      ctx, 
      width,
      height
    }}>
      <canvas
        ref={canvasRef}
        style={{
          border: '1px solid #ccc',
          imageRendering: 'crisp-edges',
          // Добавляем дополнительные CSS свойства для лучшего рендеринга
          WebkitFontSmoothing: 'antialiased',
          backfaceVisibility: 'hidden',
        } as React.CSSProperties}
      />
      {children}
    </ChartContext.Provider>
  );
};