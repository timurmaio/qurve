import { createContext, useContext, useState, useCallback, useMemo, useRef, useEffect, type Context } from 'react';

export type ChartData = Record<string, unknown>[];
export type DataKey = string | ((data: Record<string, unknown>, index: number) => number | string);

export interface ChartLayoutContextValue {
  data: ChartData;
  width: number;
  height: number;
  dpr: number;
  margin: { top: number; right: number; bottom: number; left: number };
  innerWidth: number;
  innerHeight: number;
}

export interface ChartRenderContextValue {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  ctx: CanvasRenderingContext2D | null;
  registerRender: (fn: () => void) => () => void;
  requestRender: () => void;
}

export interface ChartScaleContextValue {
  xAxis: AxisConfig | null;
  yAxis: AxisConfig | null;
  setXAxis: (config: AxisConfig | null) => void;
  setYAxis: (config: AxisConfig | null) => void;
  getXScale: () => ReturnType<typeof createLinearScale>;
  getYScale: (dataKey?: DataKey) => ReturnType<typeof createLinearScale>;
}

export interface ChartInteractionContextValue {
  hoveredIndex: number | null;
  setHoveredIndex: (index: number | null) => void;
  subscribeToMouse: (callback: (mouseX: number, mouseY: number) => void) => () => void;
  registerTooltipSeries: (resolver: (index: number) => TooltipPayloadItem | null) => () => void;
  getTooltipPayload: (index: number) => TooltipPayloadItem[];
}

export type ChartContextValue =
  ChartLayoutContextValue &
  ChartRenderContextValue &
  ChartScaleContextValue &
  ChartInteractionContextValue;

export interface TooltipPayloadItem {
  dataKey: string;
  name: string;
  value: number | null;
  color?: string;
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

const ChartLayoutContext = createContext<ChartLayoutContextValue | null>(null);
const ChartRenderContext = createContext<ChartRenderContextValue | null>(null);
const ChartScaleContext = createContext<ChartScaleContextValue | null>(null);
const ChartInteractionContext = createContext<ChartInteractionContextValue | null>(null);

function useRequiredContext<T>(context: Context<T | null>, errorMessage: string): T {
  const value = useContext(context);
  if (!value) {
    throw new Error(errorMessage);
  }
  return value;
}

export const useChartContext = (): ChartContextValue => {
  const layout = useChartLayoutContext();
  const render = useChartRenderContext();
  const scale = useChartScaleContext();
  const interaction = useChartInteractionContext();

  return {
    ...layout,
    ...render,
    ...scale,
    ...interaction,
  };
};

export const useChartLayoutContext = (): ChartLayoutContextValue =>
  useRequiredContext(ChartLayoutContext, 'Chart components must be used within a Chart');

export const useChartRenderContext = (): ChartRenderContextValue =>
  useRequiredContext(ChartRenderContext, 'Chart components must be used within a Chart');

export const useChartScaleContext = (): ChartScaleContextValue =>
  useRequiredContext(ChartScaleContext, 'Chart components must be used within a Chart');

export const useChartInteractionContext = (): ChartInteractionContextValue =>
  useRequiredContext(ChartInteractionContext, 'Chart components must be used within a Chart');

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
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  
  // Mouse event subscribers
  const mouseSubscribersRef = useRef<Set<(mouseX: number, mouseY: number) => void>>(new Set());
  const animationFrameRef = useRef<number | null>(null);
  const tooltipSeriesRef = useRef<Map<symbol, (index: number) => TooltipPayloadItem | null>>(new Map());

  useEffect(() => {
    setDpr(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1);
  }, []);

  useEffect(() => {
    const updateDpr = () => setDpr(window.devicePixelRatio || 1);
    
    // Listen for actual DPR changes via resolution media query
    try {
      const mediaQuery = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
      mediaQuery.addEventListener?.('change', updateDpr);
      return () => mediaQuery.removeEventListener?.('change', updateDpr);
    } catch {
      // Fallback for browsers that don't support resolution media queries
      window.addEventListener('resize', updateDpr);
      return () => window.removeEventListener('resize', updateDpr);
    }
  }, []);

  const margin = useMemo(() => ({
    top: marginProp.top ?? 0,
    right: marginProp.right ?? 0,
    bottom: marginProp.bottom ?? 0,
    left: marginProp.left ?? 0,
  }), [marginProp.bottom, marginProp.left, marginProp.right, marginProp.top]);

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const requestRender = useCallback(() => {
    if (animationFrameRef.current) return;
    
    animationFrameRef.current = requestAnimationFrame(() => {
      animationFrameRef.current = null;
      if (ctx && canvasRef.current) {
        const canvas = canvasRef.current;
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();

        ctx.save();
        ctx.scale(dpr, dpr);
        renderFnsRef.current.forEach(fn => fn());
        ctx.restore();
      }
    });
  }, [ctx, dpr]);

  const registerRender = useCallback((fn: () => void) => {
    renderFnsRef.current.add(fn);
    requestRender();
    return () => {
      renderFnsRef.current.delete(fn);
    };
  }, [requestRender]);

  // Centralized mouse event handling
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !ctx) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Notify all subscribers
      mouseSubscribersRef.current.forEach(callback => {
        try {
          callback(mouseX, mouseY);
        } catch (error) {
          console.error('Mouse subscriber error:', error);
        }
      });
    };

    const handleMouseLeave = () => {
      setHoveredIndex(null);
    };

    canvas.addEventListener('mousemove', handleMouseMove, { passive: true });
    canvas.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [ctx]);

  const subscribeToMouse = useCallback((callback: (mouseX: number, mouseY: number) => void) => {
    mouseSubscribersRef.current.add(callback);
    return () => {
      mouseSubscribersRef.current.delete(callback);
    };
  }, []);

  const registerTooltipSeries = useCallback((resolver: (index: number) => TooltipPayloadItem | null) => {
    const id = Symbol('tooltip-series');
    tooltipSeriesRef.current.set(id, resolver);
    return () => {
      tooltipSeriesRef.current.delete(id);
    };
  }, []);

  const getTooltipPayload = useCallback((index: number): TooltipPayloadItem[] => {
    const items: TooltipPayloadItem[] = [];
    tooltipSeriesRef.current.forEach((resolver) => {
      const item = resolver(index);
      if (item) {
        items.push(item);
      }
    });
    return items;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas buffer to match DPR (for crisp rendering)
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const context = canvas.getContext('2d');
    if (context) {
      setCtx(context);
    }

    // Cleanup on unmount
    return () => {
      if (context) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        setCtx(null);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [width, height, dpr]);

  // Main render effect - only re-run when canvas context or size changes
  useEffect(() => {
    if (!ctx) return;

    const render = () => {
      try {
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
      } catch (error) {
        console.error('Chart render error:', error);
      }
    };

    requestAnimationFrame(render);
  }, [ctx, width, height, dpr]);

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

    if (!isFinite(minVal) || !isFinite(maxVal) || minVal === maxVal) {
      return createLinearScale({ domain: [0, 100], range: [innerHeight, 0] });
    }

    const padding = (maxVal - minVal) * 0.1 || 10;
    const domain: [number, number] = [minVal - padding, maxVal + padding];
    const range: [number, number] = yAxis?.reversed ? [0, innerHeight] : [innerHeight, 0];

    return createLinearScale({ domain, range });
  }, [data, innerHeight, yAxis]);

  // Stable setter functions - don't need to be in dependencies
  const setXAxisStable = useCallback((config: AxisConfig | null) => setXAxis(config), []);
  const setYAxisStable = useCallback((config: AxisConfig | null) => setYAxis(config), []);
  const setHoveredIndexStable = useCallback((index: number | null) => setHoveredIndex(index), []);

  const layoutValue = useMemo<ChartLayoutContextValue>(() => ({
    data,
    width,
    height,
    dpr,
    margin,
    innerWidth,
    innerHeight,
  }), [data, width, height, dpr, margin, innerWidth, innerHeight]);

  const renderValue = useMemo<ChartRenderContextValue>(() => ({
    canvasRef,
    ctx,
    registerRender,
    requestRender,
  }), [canvasRef, ctx, registerRender, requestRender]);

  const scaleValue = useMemo<ChartScaleContextValue>(() => ({
    xAxis,
    yAxis,
    setXAxis: setXAxisStable,
    setYAxis: setYAxisStable,
    getXScale,
    getYScale,
  }), [xAxis, yAxis, setXAxisStable, setYAxisStable, getXScale, getYScale]);

  const interactionValue = useMemo<ChartInteractionContextValue>(() => ({
    hoveredIndex,
    setHoveredIndex: setHoveredIndexStable,
    subscribeToMouse,
    registerTooltipSeries,
    getTooltipPayload,
  }), [hoveredIndex, setHoveredIndexStable, subscribeToMouse, registerTooltipSeries, getTooltipPayload]);

  return (
    <ChartLayoutContext.Provider value={layoutValue}>
      <ChartRenderContext.Provider value={renderValue}>
        <ChartScaleContext.Provider value={scaleValue}>
          <ChartInteractionContext.Provider value={interactionValue}>
            <div style={{ position: 'relative', width: `${width}px`, height: `${height}px`, display: 'inline-block' }}>
              <canvas
                ref={canvasRef}
                width={width}
                height={height}
                style={{ width: `${width}px`, height: `${height}px`, display: 'block' }}
              />
              {children}
            </div>
          </ChartInteractionContext.Provider>
        </ChartScaleContext.Provider>
      </ChartRenderContext.Provider>
    </ChartLayoutContext.Provider>
  );
}
