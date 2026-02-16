import { createContext, useContext, useState, useCallback, useMemo, useRef, useEffect } from 'react';

export type ChartData = Record<string, unknown>[];
export type DataKey = string | ((data: Record<string, unknown>, index: number) => number | string);

export interface ChartContextValue {
  data: ChartData;
  width: number;
  height: number;
  dpr: number;
  margin: { top: number; right: number; bottom: number; left: number };
  innerWidth: number;
  innerHeight: number;
  
  // Canvas
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  ctx: CanvasRenderingContext2D | null;
  
  // Rendering
  registerRender: (fn: () => void) => () => void;
  
  // Axis registration
  xAxis: AxisConfig | null;
  yAxis: AxisConfig | null;
  setXAxis: (config: AxisConfig | null) => void;
  setYAxis: (config: AxisConfig | null) => void;
  
  // Scale helpers
  getXScale: () => ReturnType<typeof createLinearScale>;
  getYScale: (dataKey?: DataKey) => ReturnType<typeof createLinearScale>;
}

export interface AxisConfig {
  dataKey: DataKey;
  type?: 'number' | 'category' | 'band';
  domain?: [number, number] | 'auto';
  range?: [number, number];
  tickCount?: number;
  tickFormatter?: (value: unknown) => string;
  reversed?: boolean;
}

function createLinearScale(config: { domain: [number, number]; range: [number, number] }) {
  const { domain, range } = config;
  const scale = ((value: number) => {
    const [d0, d1] = domain;
    const [r0, r1] = range;
    if (d1 === d0) return r0;
    const ratio = (value - d0) / (d1 - d0);
    return r0 + ratio * (r1 - r0);
  }) as ((value: number) => number) & {
    domain: () => [number, number];
    range: () => [number, number];
  };

  scale.domain = () => domain;
  scale.range = () => range;

  return scale;
}

const ChartContext = createContext<ChartContextValue | null>(null);

export const useChartContext = () => {
  const context = useContext(ChartContext);
  if (!context) {
    throw new Error('Chart components must be used within a Chart');
  }
  return context;
};

export interface ChartProps {
  data: ChartData;
  width?: number;
  height?: number;
  margin?: { top?: number; right?: number; bottom?: number; left?: number };
  children: React.ReactNode;
}

export function Chart({
  data,
  width = 600,
  height = 300,
  margin: marginProp = { top: 0, right: 0, bottom: 0, left: 0 },
  children,
}: ChartProps) {
  const [xAxis, setXAxis] = useState<AxisConfig | null>(null);
  const [yAxis, setYAxis] = useState<AxisConfig | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderFnsRef = useRef<Set<() => void>>(new Set());
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [dpr, setDpr] = useState(1);

  useEffect(() => {
    setDpr(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1);
  }, []);

  useEffect(() => {
    const handleDprChange = () => {
      setDpr(window.devicePixelRatio || 1);
    };
    window.addEventListener('resize', handleDprChange);
    return () => window.removeEventListener('resize', handleDprChange);
  }, []);

  const margin = useMemo(() => ({
    top: marginProp.top ?? 0,
    right: marginProp.right ?? 0,
    bottom: marginProp.bottom ?? 0,
    left: marginProp.left ?? 0,
  }), [marginProp.bottom, marginProp.left, marginProp.right, marginProp.top]);

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const registerRender = useCallback((fn: () => void) => {
    renderFnsRef.current.add(fn);
    return () => {
      renderFnsRef.current.delete(fn);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Set canvas buffer to match DPR (for crisp rendering)
    // but keep CSS size the same (so no overflow)
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const context = canvas.getContext('2d');
    if (context) {
      setCtx(context);
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

      ctx.save();
      ctx.scale(dpr, dpr);

      renderFnsRef.current.forEach(fn => fn());
      ctx.restore();
    };

    requestAnimationFrame(render);
  }, [ctx, width, height, dpr, xAxis, yAxis, margin, innerWidth, innerHeight]);

  const getXScale = useCallback(() => {
    const xAxisKey = xAxis?.dataKey;
    let domain: [number, number] = [0, Math.max(0, data.length - 1)];

    if (xAxis?.domain && xAxis.domain !== 'auto') {
      domain = xAxis.domain;
    } else if (xAxisKey && data.length > 0) {
      const values: number[] = [];
      data.forEach((item, index) => {
        const raw = typeof xAxisKey === 'function' ? xAxisKey(item, index) : item[xAxisKey];
        const value = Number(raw);
        if (Number.isFinite(value)) {
          values.push(value);
        }
      });

      if (values.length > 0) {
        let min = values[0];
        let max = values[0];
        for (let i = 1; i < values.length; i++) {
          const current = values[i];
          if (current < min) min = current;
          if (current > max) max = current;
        }
        domain = min === max ? [min - 1, max + 1] : [min, max];
      }
    }

    const range: [number, number] = xAxis?.reversed ? [innerWidth, 0] : [0, innerWidth];
    return createLinearScale({ domain, range });
  }, [data, innerWidth, xAxis]);

  const getYScale = useCallback((dataKey?: DataKey) => {
    if (!data.length) {
      return createLinearScale({ domain: [0, 100], range: [innerHeight, 0] });
    }

    const yKey = dataKey ?? yAxis?.dataKey;

    if (yAxis?.domain && yAxis.domain !== 'auto') {
      const range: [number, number] = yAxis.reversed ? [0, innerHeight] : [innerHeight, 0];
      return createLinearScale({ domain: yAxis.domain, range });
    }
    
    let minVal = Infinity;
    let maxVal = -Infinity;
    
    for (let index = 0; index < data.length; index++) {
      const item = data[index];
      const raw = yKey
        ? (typeof yKey === 'function' ? yKey(item, index) : item[yKey])
        : Object.values(item).find((value) => typeof value === 'number');
      const value = Number(raw);
      if (Number.isFinite(value)) {
        if (value < minVal) minVal = value;
        if (value > maxVal) maxVal = value;
      }
    }
    
    if (!isFinite(minVal) || !isFinite(maxVal)) {
      return createLinearScale({ domain: [0, 100], range: [innerHeight, 0] });
    }
    
    const padding = (maxVal - minVal) * 0.1 || 10;
    const domain: [number, number] = [minVal - padding, maxVal + padding];
    const range: [number, number] = yAxis?.reversed ? [0, innerHeight] : [innerHeight, 0];
    
    return createLinearScale({ domain, range });
  }, [data, innerHeight, yAxis]);

  const value = useMemo(() => ({
    data,
    width,
    height,
    dpr,
    margin,
    innerWidth,
    innerHeight,
    canvasRef,
    ctx,
    registerRender,
    xAxis,
    yAxis,
    setXAxis,
    setYAxis,
    getXScale,
    getYScale,
  }), [data, width, height, dpr, margin, innerWidth, innerHeight, ctx, registerRender, xAxis, yAxis, getXScale, getYScale]);

  return (
    <ChartContext.Provider value={value}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{ width: `${width}px`, height: `${height}px`, display: 'block' }}
      />
      {children}
    </ChartContext.Provider>
  );
}
