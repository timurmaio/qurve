import { createContext, useContext, useReducer, useCallback, useMemo, useRef, useEffect, useSyncExternalStore, type Context } from 'react';

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

export interface BarSeriesRegistration {
  id: symbol;
  stackId?: string | number;
  getValue: (item: Record<string, unknown>, index: number) => number;
}

export interface AreaSeriesRegistration {
  id: symbol;
  stackId?: string | number;
  getValue: (item: Record<string, unknown>, index: number) => number;
}

export interface ChartSeriesContextValue {
  registerBarSeries: (registration: BarSeriesRegistration) => () => void;
  getBarSeriesRegistrations: () => BarSeriesRegistration[];
  barSeriesVersion: number;
  registerAreaSeries: (registration: AreaSeriesRegistration) => () => void;
  getAreaSeriesRegistrations: () => AreaSeriesRegistration[];
  areaSeriesVersion: number;
  registerLegendItem: (item: LegendItemRegistration) => () => void;
  getLegendItems: () => LegendItemRegistration[];
  legendVersion: number;
  isSeriesVisible: (id: symbol) => boolean;
  setSeriesVisible: (id: symbol, visible: boolean) => void;
}

export interface LegendItemRegistration {
  id: symbol;
  name: string;
  color: string;
  type: 'line' | 'bar' | 'area' | 'pie';
}

export interface ChartInteractionContextValue {
  hoveredIndex: number | null;
  setHoveredIndex: (index: number | null) => void;
  subscribeToMouse: (callback: (mouseX: number, mouseY: number) => void) => () => void;
  registerTooltipSeries: (resolver: (index: number) => TooltipPayloadItem | null) => () => void;
  getTooltipPayload: (index: number) => TooltipPayloadItem[];
  registerTooltipIndexResolver: (resolver: (mouseX: number, mouseY: number) => number | null) => () => void;
  getTooltipIndexFromMouse: (mouseX: number, mouseY: number) => number | null;
}

export type ChartContextValue =
  ChartLayoutContextValue &
  ChartRenderContextValue &
  ChartScaleContextValue &
  ChartInteractionContextValue &
  ChartSeriesContextValue;

export interface TooltipPayloadItem {
  dataKey: string;
  name: string;
  value: number | null;
  color?: string;
  formatter?: (value: number | null, name: string, item: TooltipPayloadItem) => React.ReactNode | [React.ReactNode, React.ReactNode];
}

export interface AxisConfig {
  dataKey: DataKey;
  type?: 'number' | 'category' | 'band';
  domain?: [number, number] | 'auto';
  range?: [number, number];
  tickCount?: number;
  tickValues?: number[];
  interval?: number;
  padding?: number | { left?: number; right?: number; top?: number; bottom?: number };
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

function applyDomainPadding(
  domain: [number, number],
  padding: AxisConfig['padding'],
  axis: 'x' | 'y',
): [number, number] {
  if (padding === undefined) return domain;
  if (typeof padding === 'number') {
    return [domain[0] - padding, domain[1] + padding];
  }

  if (axis === 'x') {
    return [domain[0] - (padding.left ?? 0), domain[1] + (padding.right ?? 0)];
  }

  return [domain[0] - (padding.bottom ?? 0), domain[1] + (padding.top ?? 0)];
}

const ChartLayoutContext = createContext<ChartLayoutContextValue | null>(null);
const ChartRenderContext = createContext<ChartRenderContextValue | null>(null);
const ChartScaleContext = createContext<ChartScaleContextValue | null>(null);
const ChartInteractionContext = createContext<ChartInteractionContextValue | null>(null);
const ChartSeriesContext = createContext<ChartSeriesContextValue | null>(null);

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
  const series = useChartSeriesContext();

  return {
    ...layout,
    ...render,
    ...scale,
    ...interaction,
    ...series,
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

export const useChartSeriesContext = (): ChartSeriesContextValue =>
  useRequiredContext(ChartSeriesContext, 'Chart components must be used within a Chart');

export interface ChartProps {
  data: ChartData;
  width?: number;
  height?: number;
  margin?: { top?: number; right?: number; bottom?: number; left?: number };
  children: React.ReactNode;
}

interface ChartState {
  xAxis: AxisConfig | null;
  yAxis: AxisConfig | null;
  ctx: CanvasRenderingContext2D | null;
  hoveredIndex: number | null;
  barSeriesVersion: number;
  areaSeriesVersion: number;
  legendVersion: number;
}

type ChartAction =
  | { type: 'setXAxis'; payload: AxisConfig | null }
  | { type: 'setYAxis'; payload: AxisConfig | null }
  | { type: 'setCtx'; payload: CanvasRenderingContext2D | null }
  | { type: 'setHoveredIndex'; payload: number | null }
  | { type: 'bumpBarSeriesVersion' }
  | { type: 'bumpAreaSeriesVersion' }
  | { type: 'bumpLegendVersion' };

const initialChartState: ChartState = {
  xAxis: null,
  yAxis: null,
  ctx: null,
  hoveredIndex: null,
  barSeriesVersion: 0,
  areaSeriesVersion: 0,
  legendVersion: 0,
};

function chartReducer(state: ChartState, action: ChartAction): ChartState {
  switch (action.type) {
    case 'setXAxis':
      return { ...state, xAxis: action.payload };
    case 'setYAxis':
      return { ...state, yAxis: action.payload };
    case 'setCtx':
      return { ...state, ctx: action.payload };
    case 'setHoveredIndex':
      return { ...state, hoveredIndex: action.payload };
    case 'bumpBarSeriesVersion':
      return { ...state, barSeriesVersion: state.barSeriesVersion + 1 };
    case 'bumpAreaSeriesVersion':
      return { ...state, areaSeriesVersion: state.areaSeriesVersion + 1 };
    case 'bumpLegendVersion':
      return { ...state, legendVersion: state.legendVersion + 1 };
    default:
      return state;
  }
}

function subscribeToDpr(onStoreChange: () => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const handler = () => onStoreChange();
  window.addEventListener('resize', handler);
  return () => {
    window.removeEventListener('resize', handler);
  };
}

function getDprSnapshot(): number {
  return typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
}

function getDprServerSnapshot(): number {
  return 1;
}

function useDevicePixelRatio(): number {
  return useSyncExternalStore(subscribeToDpr, getDprSnapshot, getDprServerSnapshot);
}

function useChartModel(params: {
  data: ChartData;
  width: number;
  height: number;
  marginProp: { top?: number; right?: number; bottom?: number; left?: number };
}) {
  const { data, width, height, marginProp } = params;
  const [state, dispatch] = useReducer(chartReducer, initialChartState);
  const { xAxis, yAxis, ctx, hoveredIndex, barSeriesVersion, areaSeriesVersion, legendVersion } = state;
  const dpr = useDevicePixelRatio();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderFnsRef = useRef<Set<() => void>>(new Set());
  const mouseSubscribersRef = useRef<Set<(mouseX: number, mouseY: number) => void>>(new Set());
  const animationFrameRef = useRef<number | null>(null);
  const tooltipSeriesRef = useRef<Map<symbol, (index: number) => TooltipPayloadItem | null>>(new Map());
  const tooltipIndexResolversRef = useRef<Map<symbol, (mouseX: number, mouseY: number) => number | null>>(new Map());
  const barSeriesRef = useRef<Map<symbol, BarSeriesRegistration>>(new Map());
  const areaSeriesRef = useRef<Map<symbol, AreaSeriesRegistration>>(new Map());
  const legendItemsRef = useRef<Map<symbol, LegendItemRegistration>>(new Map());
  const seriesVisibilityRef = useRef<Map<symbol, boolean>>(new Map());

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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !ctx) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      mouseSubscribersRef.current.forEach(callback => {
        try {
          callback(mouseX, mouseY);
        } catch (error) {
          console.error('Mouse subscriber error:', error);
        }
      });
    };

    const handleMouseLeave = () => {
      dispatch({ type: 'setHoveredIndex', payload: null });
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

  const registerTooltipIndexResolver = useCallback((resolver: (mouseX: number, mouseY: number) => number | null) => {
    const id = Symbol('tooltip-index-resolver');
    tooltipIndexResolversRef.current.set(id, resolver);
    return () => {
      tooltipIndexResolversRef.current.delete(id);
    };
  }, []);

  const getTooltipIndexFromMouse = useCallback((mouseX: number, mouseY: number): number | null => {
    for (const resolver of tooltipIndexResolversRef.current.values()) {
      const index = resolver(mouseX, mouseY);
      if (index !== null && Number.isFinite(index) && index >= 0) {
        return index;
      }
    }
    return null;
  }, []);

  const registerBarSeries = useCallback((registration: BarSeriesRegistration) => {
    barSeriesRef.current.set(registration.id, registration);
    dispatch({ type: 'bumpBarSeriesVersion' });

    return () => {
      barSeriesRef.current.delete(registration.id);
      dispatch({ type: 'bumpBarSeriesVersion' });
    };
  }, []);

  const getBarSeriesRegistrations = useCallback((): BarSeriesRegistration[] => {
    return Array.from(barSeriesRef.current.values());
  }, []);

  const registerAreaSeries = useCallback((registration: AreaSeriesRegistration) => {
    areaSeriesRef.current.set(registration.id, registration);
    dispatch({ type: 'bumpAreaSeriesVersion' });

    return () => {
      areaSeriesRef.current.delete(registration.id);
      dispatch({ type: 'bumpAreaSeriesVersion' });
    };
  }, []);

  const getAreaSeriesRegistrations = useCallback((): AreaSeriesRegistration[] => {
    return Array.from(areaSeriesRef.current.values());
  }, []);

  const registerLegendItem = useCallback((item: LegendItemRegistration) => {
    legendItemsRef.current.set(item.id, item);
    if (!seriesVisibilityRef.current.has(item.id)) {
      seriesVisibilityRef.current.set(item.id, true);
    }
    dispatch({ type: 'bumpLegendVersion' });

    return () => {
      legendItemsRef.current.delete(item.id);
      seriesVisibilityRef.current.delete(item.id);
      dispatch({ type: 'bumpLegendVersion' });
    };
  }, []);

  const getLegendItems = useCallback((): LegendItemRegistration[] => {
    return Array.from(legendItemsRef.current.values());
  }, []);

  const isSeriesVisible = useCallback((id: symbol): boolean => {
    return seriesVisibilityRef.current.get(id) ?? true;
  }, []);

  const setSeriesVisible = useCallback((id: symbol, visible: boolean) => {
    seriesVisibilityRef.current.set(id, visible);
    dispatch({ type: 'bumpLegendVersion' });
    requestRender();
  }, [requestRender]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const context = canvas.getContext('2d');
    if (context) {
      dispatch({ type: 'setCtx', payload: context });
    }

    return () => {
      if (context) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        dispatch({ type: 'setCtx', payload: null });
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [width, height, dpr]);

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
    return createLinearScale({ domain: applyDomainPadding(domain, xAxis?.padding, 'x'), range });
  }, [data, innerWidth, xAxis]);

  const getYScale = useCallback((dataKey?: DataKey) => {
    if (!data.length) {
      return createLinearScale({ domain: [0, 100], range: [innerHeight, 0] });
    }

    const yKey = dataKey ?? yAxis?.dataKey;

    if (yAxis?.domain && yAxis.domain !== 'auto') {
      const range: [number, number] = yAxis.reversed ? [0, innerHeight] : [innerHeight, 0];
      return createLinearScale({ domain: applyDomainPadding(yAxis.domain, yAxis.padding, 'y'), range });
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

    return createLinearScale({ domain: applyDomainPadding(domain, yAxis?.padding, 'y'), range });
  }, [data, innerHeight, yAxis]);

  const setXAxisStable = useCallback((config: AxisConfig | null) => {
    dispatch({ type: 'setXAxis', payload: config });
  }, []);
  const setYAxisStable = useCallback((config: AxisConfig | null) => {
    dispatch({ type: 'setYAxis', payload: config });
  }, []);
  const setHoveredIndexStable = useCallback((index: number | null) => {
    dispatch({ type: 'setHoveredIndex', payload: index });
  }, []);

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
    registerTooltipIndexResolver,
    getTooltipIndexFromMouse,
  }), [
    hoveredIndex,
    setHoveredIndexStable,
    subscribeToMouse,
    registerTooltipSeries,
    getTooltipPayload,
    registerTooltipIndexResolver,
    getTooltipIndexFromMouse,
  ]);

  const seriesValue = useMemo<ChartSeriesContextValue>(() => ({
    registerBarSeries,
    getBarSeriesRegistrations,
    barSeriesVersion,
    registerAreaSeries,
    getAreaSeriesRegistrations,
    areaSeriesVersion,
    registerLegendItem,
    getLegendItems,
    legendVersion,
    isSeriesVisible,
    setSeriesVisible,
  }), [
    registerBarSeries,
    getBarSeriesRegistrations,
    barSeriesVersion,
    registerAreaSeries,
    getAreaSeriesRegistrations,
    areaSeriesVersion,
    registerLegendItem,
    getLegendItems,
    legendVersion,
    isSeriesVisible,
    setSeriesVisible,
  ]);

  return {
    canvasRef,
    layoutValue,
    renderValue,
    scaleValue,
    interactionValue,
    seriesValue,
  };
}

export function Chart({
  data,
  width = 600,
  height = 300,
  margin: marginProp = { top: 0, right: 0, bottom: 0, left: 0 },
  children,
}: ChartProps) {
  const {
    canvasRef,
    layoutValue,
    renderValue,
    scaleValue,
    interactionValue,
    seriesValue,
  } = useChartModel({ data, width, height, marginProp });

  return (
    <ChartLayoutContext.Provider value={layoutValue}>
      <ChartRenderContext.Provider value={renderValue}>
        <ChartScaleContext.Provider value={scaleValue}>
          <ChartInteractionContext.Provider value={interactionValue}>
            <ChartSeriesContext.Provider value={seriesValue}>
              <div style={{ position: 'relative', width: `${width}px`, height: `${height}px`, display: 'inline-block' }}>
                <canvas
                  ref={canvasRef}
                  width={width}
                  height={height}
                  style={{ width: `${width}px`, height: `${height}px`, display: 'block' }}
                />
                {children}
              </div>
            </ChartSeriesContext.Provider>
          </ChartInteractionContext.Provider>
        </ChartScaleContext.Provider>
      </ChartRenderContext.Provider>
    </ChartLayoutContext.Provider>
  );
}
