import React, { createContext, useContext, useRef, useEffect, useState, useCallback } from 'react';
import { ScaleProvider } from './scales/ScaleContext';

type ChartContextType = {
  ctx: CanvasRenderingContext2D | null;
  width: number;
  height: number;
  dpr: number;
  canvas: HTMLCanvasElement | null;
  registerRender: (fn: () => void) => void;
};

const ChartContext = createContext<ChartContextType>({ 
  ctx: null, 
  width: 0, 
  height: 0, 
  dpr: 1,
  canvas: null,
  registerRender: () => {},
});

export const useChartContext = () => useContext(ChartContext);

export const ChartProvider: React.FC<{
  children: React.ReactNode;
  width: number;
  height: number;
}> = ({ children, width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const renderFnsRef = useRef<Set<() => void>>(new Set());
  const mountedRef = useRef(false);

  const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;

  const registerRender = useCallback((fn: () => void) => {
    renderFnsRef.current.add(fn);
    return () => {
      renderFnsRef.current.delete(fn);
    };
  }, []);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d', {
        alpha: false,
        antialias: true,
      }) as CanvasRenderingContext2D | null;

      if (context) {
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);

        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = 'high';

        context.setTransform(dpr, 0, 0, dpr, 0, 0);

        setCtx(context);
      }
    }
  }, [width, height, dpr]);

  useEffect(() => {
    if (!ctx) return;

    const render = () => {
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, width * dpr, height * dpr);
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, width * dpr, height * dpr);
      ctx.restore();

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      renderFnsRef.current.forEach(fn => fn());
    };

    if (!mountedRef.current) {
      mountedRef.current = true;
      requestAnimationFrame(render);
    } else {
      requestAnimationFrame(render);
    }
  }, [ctx, width, height, dpr, children]);

  return (
    <ScaleProvider>
      <ChartContext.Provider value={{ 
        ctx, 
        width,
        height,
        dpr,
        canvas: canvasRef.current,
        registerRender,
      }}>
        <canvas
          ref={canvasRef}
          style={{
            display: 'block',
          }}
        />
        {children}
      </ChartContext.Provider>
    </ScaleProvider>
  );
};