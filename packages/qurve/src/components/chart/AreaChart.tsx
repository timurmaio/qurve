import type { ReactNode } from 'react';
import { Chart } from './chartContext';
import type { ChartData } from './chartContext';

export interface AreaChartProps {
  data: ChartData;
  width?: number;
  height?: number;
  margin?: { top?: number; right?: number; bottom?: number; left?: number };
  backgroundColor?: string;
  colors?: string[];
  children: ReactNode;
}

/**
 * Convenience wrapper for area charts. Renders Chart with typical composition.
 * Add XAxis, YAxis, Area, CartesianGrid, Tooltip, Legend as children.
 */
export function AreaChart({ data, width = 600, height = 300, margin, backgroundColor, colors, children }: AreaChartProps) {
  return (
    <Chart data={data} width={width} height={height} margin={margin} backgroundColor={backgroundColor} colors={colors}>
      {children}
    </Chart>
  );
}
