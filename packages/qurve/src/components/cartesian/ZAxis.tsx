import { useEffect } from 'react';
import { useChartScaleContext } from '../chart/chartContext';
import type { DataKey } from '../chart/chartContext';

export interface ZAxisProps {
  dataKey: DataKey;
  domain?: [number, number] | 'auto';
  /** Pixel radius range for bubble size. Default [2, 16]. */
  range?: [number, number];
  name?: string;
}

/**
 * Registers a Z scale for bubble Scatter charts.
 * Scatter points use `getZScale` when `zKey` matches (or when size is omitted and ZAxis is present).
 *
 * @example
 * <Chart data={data}>
 *   <XAxis dataKey="x" />
 *   <YAxis dataKey="y" />
 *   <ZAxis dataKey="z" range={[4, 24]} />
 *   <Scatter xKey="x" yKey="y" zKey="z" />
 * </Chart>
 */
export function ZAxis({
  dataKey,
  domain = 'auto',
  range = [2, 16],
  name,
}: ZAxisProps) {
  const { setZAxis } = useChartScaleContext();

  useEffect(() => {
    setZAxis({ dataKey, domain, range, name });
    return () => setZAxis(null);
  }, [setZAxis, dataKey, domain, range, name]);

  return null;
}
