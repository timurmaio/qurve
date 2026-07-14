import type { ReactNode } from 'react';
import { Chart } from '../chart/chartContext';
import type { ChartData } from '../chart/chartContext';

export interface FunnelChartProps {
  data: ChartData;
  width?: number;
  height?: number;
  margin?: { top?: number; right?: number; bottom?: number; left?: number };
  backgroundColor?: string;
  colors?: string[];
  children: ReactNode;
}

/**
 * Convenience wrapper for funnel charts.
 * Compose with Funnel, Tooltip, Legend. Optional Cell children for per-step colors.
 */
export function FunnelChart({
  data,
  width = 500,
  height = 400,
  margin = { top: 20, right: 80, bottom: 20, left: 20 },
  backgroundColor,
  colors,
  children,
}: FunnelChartProps) {
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
