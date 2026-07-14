import type { ReactNode } from 'react';
import { Chart } from '../chart/chartContext';
import type { ChartData } from '../chart/chartContext';

export interface TreemapChartProps {
  data: ChartData;
  width?: number;
  height?: number;
  margin?: { top?: number; right?: number; bottom?: number; left?: number };
  backgroundColor?: string;
  colors?: string[];
  children: ReactNode;
}

/**
 * Convenience wrapper for treemap charts.
 * Compose with Treemap, Tooltip, Legend. Optional Cell children for per-leaf colors.
 */
export function TreemapChart({
  data,
  width = 500,
  height = 400,
  margin = { top: 10, right: 10, bottom: 10, left: 10 },
  backgroundColor,
  colors,
  children,
}: TreemapChartProps) {
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
