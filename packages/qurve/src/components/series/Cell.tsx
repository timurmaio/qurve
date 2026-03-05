import type { ReactNode } from 'react';

export interface CellProps {
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  children?: ReactNode;
}

/**
 * Cell provides per-segment styling for Bar and Pie.
 * Use as child: <Bar><Cell fill="red"/><Cell fill="blue"/></Bar>
 */
export function Cell(_props: CellProps): null {
  return null;
}

Cell.displayName = 'Cell';
