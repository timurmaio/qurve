import type { TimeFormatMode } from './core/timeUtils';
// Re-export for consumers
export type { TimeFormatMode } from './core/timeUtils';

export type ChartData = Record<string, unknown>[];

export type DataKey = string | ((data: Record<string, unknown>, index: number) => number | string);

export interface AxisConfig {
  dataKey: DataKey;
  type?: 'number' | 'category' | 'band' | 'time';
  domain?: [number | Date, number | Date] | 'auto';
  range?: [number, number];
  tickCount?: number;
  tickValues?: Array<number | Date>;
  interval?: number;
  padding?: number | { left?: number; right?: number; top?: number; bottom?: number };
  tickFormatter?: (value: unknown) => string;
  locale?: string;
  timeZone?: string;
  timeFormat?: TimeFormatMode;
  reversed?: boolean;
}

/**
 * Formatter result - framework-agnostic (React.ReactNode, Vue.VNode, or plain value)
 */
export type FormatterResult = unknown;

export interface TooltipPayloadItem {
  dataKey: string;
  name: string;
  value: number | null;
  color?: string;
  formatter?: (value: number | null, name: string, item: TooltipPayloadItem) => FormatterResult | [FormatterResult, FormatterResult];
  anchor?: { x: number; y: number };
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

export interface LegendItemRegistration {
  id: symbol;
  name: string;
  color: string;
  type: 'line' | 'bar' | 'area' | 'pie' | 'scatter' | 'radar';
}

export interface PolarAngleAxisConfig {
  dataKey?: DataKey;
  tickCount?: number;
  tickFormatter?: (value: unknown, index: number) => string;
}

export interface PolarRadiusAxisConfig {
  dataKey?: DataKey;
  domain?: [number, number] | 'auto';
  tickCount?: number;
  /** Spoke angle (degrees) where radius ticks are drawn. Default 90 (3 o'clock). */
  angle?: number;
  tickFormatter?: (value: number) => string;
}

export interface ZAxisConfig {
  dataKey: DataKey;
  domain?: [number, number] | 'auto';
  /** Pixel radius range for bubble size. Default [2, 16]. */
  range?: [number, number];
  name?: string;
}

export interface ProjectedPoint {
  x: number;
  y: number;
  value: number;
  index: number;
}
