import type { ReactNode } from 'react';
import { Chart } from './chartContext';
import type { ChartData } from './chartContext';

export interface ComposedChartProps {
  data: ChartData;
  width?: number;
  height?: number;
  margin?: { top?: number; right?: number; bottom?: number; left?: number };
  backgroundColor?: string;
  colors?: string[];
  children: ReactNode;
}

/**
 * Convenience wrapper for composed charts (mix Line, Bar, Area, Scatter).
 * Same as Chart — alias for Recharts API familiarity.
 */
export function ComposedChart({
  data,
  width = 600,
  height = 300,
  margin,
  backgroundColor,
  colors,
  children,
}: ComposedChartProps) {
  return (
    <Chart
      data={data}
      width={width}
      height={height}
      margin={margin}
      backgroundColor={backgroundColor}
      colors={colors}
    >
      {children}
    </Chart>
  );
}
