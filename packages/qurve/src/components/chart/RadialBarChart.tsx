import type { ReactNode } from 'react';
import { Chart } from '../chart/chartContext';
import type { ChartData } from '../chart/chartContext';

export interface RadialBarChartProps {
  data: ChartData;
  width?: number;
  height?: number;
  margin?: { top?: number; right?: number; bottom?: number; left?: number };
  backgroundColor?: string;
  colors?: string[];
  children: ReactNode;
}

/**
 * Convenience wrapper for radial bar / gauge charts.
 * Compose with RadialBar, PolarGrid, Tooltip, Legend.
 */
export function RadialBarChart({
  data,
  width = 500,
  height = 400,
  margin = { top: 20, right: 20, bottom: 20, left: 20 },
  backgroundColor,
  colors,
  children,
}: RadialBarChartProps) {
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
