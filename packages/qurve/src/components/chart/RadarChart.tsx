import type { ReactNode } from 'react';
import { Chart } from '../chart/chartContext';
import type { ChartData } from '../chart/chartContext';

export interface RadarChartProps {
  data: ChartData;
  width?: number;
  height?: number;
  margin?: { top?: number; right?: number; bottom?: number; left?: number };
  backgroundColor?: string;
  colors?: string[];
  children: ReactNode;
}

/**
 * Convenience wrapper for radar charts.
 * Compose with PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip, Legend.
 */
export function RadarChart({
  data,
  width = 500,
  height = 400,
  margin = { top: 40, right: 40, bottom: 40, left: 40 },
  backgroundColor,
  colors,
  children,
}: RadarChartProps) {
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
