import type { ReactNode } from 'react';
import type { SankeyData } from '@qurve/core';
import { Chart } from '../chart/chartContext';
import { SankeyDataContext } from '../series/Sankey';

export interface SankeyChartProps {
  data: SankeyData;
  width?: number;
  height?: number;
  margin?: { top?: number; right?: number; bottom?: number; left?: number };
  backgroundColor?: string;
  colors?: string[];
  children: ReactNode;
}

/**
 * Convenience wrapper for Sankey diagrams.
 * Pass `{ nodes, links }` as data; compose with Sankey, Tooltip, Legend, Cell.
 */
export function SankeyChart({
  data,
  width = 600,
  height = 400,
  margin = { top: 16, right: 80, bottom: 16, left: 16 },
  backgroundColor,
  colors,
  children,
}: SankeyChartProps) {
  return (
    <SankeyDataContext value={data}>
      <Chart
        data={data.nodes as Record<string, unknown>[]}
        width={width}
        height={height}
        margin={margin}
        backgroundColor={backgroundColor}
        colors={colors}
      >
        {children}
      </Chart>
    </SankeyDataContext>
  );
}
