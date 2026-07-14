import type { ReactNode } from 'react';
import { Chart } from './chartContext';
import type { ChartData } from './chartContext';

export interface ScatterChartProps {
  data: ChartData;
  width?: number;
  height?: number;
  margin?: { top?: number; right?: number; bottom?: number; left?: number };
  backgroundColor?: string;
  colors?: string[];
  children: ReactNode;
}

/**
 * Convenience wrapper for scatter / bubble charts.
 * Compose with Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, Legend.
 */
export function ScatterChart({
  data,
  width = 600,
  height = 400,
  margin = { top: 20, right: 20, bottom: 30, left: 40 },
  backgroundColor,
  colors,
  children,
}: ScatterChartProps) {
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
