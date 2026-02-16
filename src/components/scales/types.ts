export interface LinearScaleOptions {
  domain: [number, number];
  range: [number, number];
}

export interface TimeScaleOptions {
  domain: [Date, Date];
  range: [number, number];
}

export interface BandScaleOptions {
  domain: string[];
  range: [number, number];
  padding?: number;
  align?: 'start' | 'center' | 'end';
}

export type AnyScale = LinearScale | TimeScale | BandScale;

export interface LinearScale {
  (value: number): number;
  domain: () => [number, number];
  range: () => [number, number];
  invert: (pixel: number) => number;
  ticks: (count: number) => number[];
  copy: () => LinearScale;
  nice: (count?: number) => LinearScale;
}

export interface TimeScale {
  (value: Date): number;
  domain: () => [Date, Date];
  range: () => [number, number];
  invert: (pixel: number) => Date;
  ticks: (count: number) => Date[];
  copy: () => TimeScale;
  nice: () => TimeScale;
}

export interface BandScale {
  (value: string): number | undefined;
  domain: () => string[];
  range: () => [number, number];
  bandwidth: () => number;
  step: () => number;
  copy: () => BandScale;
}

export type ScaleType = 'linear' | 'time' | 'band';

export interface ScaleConfig {
  name: string;
  type: ScaleType;
  domain: [number, number] | [Date, Date] | string[];
  range: [number, number];
  nice?: boolean;
  padding?: number;
}

export type ScaleInput = number | Date | string;
