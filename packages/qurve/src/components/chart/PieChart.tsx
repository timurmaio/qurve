import type { ReactNode } from 'react';
import { Chart } from './chartContext';
import type { ChartData } from './chartContext';

export interface PieChartProps {
  data: ChartData;
  width?: number;
  height?: number;
  margin?: { top?: number; right?: number; bottom?: number; left?: number };
  backgroundColor?: string;
  colors?: string[];
  children: ReactNode;
}

/**
 * Convenience wrapper for pie/donut charts.
 * Compose with Pie, Tooltip, Legend. Optional Cell children for per-slice colors.
 */
export function PieChart({
  data,
  width = 400,
  height = 400,
  margin = { top: 20, right: 20, bottom: 20, left: 20 },
  backgroundColor,
  colors,
  children,
}: PieChartProps) {
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
