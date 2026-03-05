import type { ReactNode } from 'react';
import { Chart } from './chartContext';
import type { ChartData } from './chartContext';

export interface LineChartProps {
  data: ChartData;
  width?: number;
  height?: number;
  margin?: { top?: number; right?: number; bottom?: number; left?: number };
  backgroundColor?: string;
  colors?: string[];
  children: ReactNode;
}

/**
 * Convenience wrapper for line charts. Renders Chart with typical composition.
 * Add XAxis, YAxis, Line, CartesianGrid, Tooltip, Legend as children.
 */
export function LineChart({ data, width = 600, height = 300, margin, backgroundColor, colors, children }: LineChartProps) {
  return (
    <Chart data={data} width={width} height={height} margin={margin} backgroundColor={backgroundColor} colors={colors}>
      {children}
    </Chart>
  );
}
