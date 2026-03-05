import type { ReactNode } from 'react';

/** Symbol for identifying Cell in children. Survives minification unlike displayName. */
export const CELL_TYPE = Symbol.for('qurve.Cell');

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

(Cell as unknown as { [CELL_TYPE]: boolean })[CELL_TYPE] = true;
