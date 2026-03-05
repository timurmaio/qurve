import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Chart } from '../chart/chartContext';
import { XAxis } from './XAxis';
import { YAxis } from './YAxis';
import { ReferenceDot } from './ReferenceDot';
import { Line } from '../series/Line';

describe('ReferenceDot', () => {
  it('renders reference dot at (x, y)', () => {
    const { container } = render(
      <Chart data={[{ x: 1, y: 10 }, { x: 2, y: 20 }]} width={280} height={160}>
        <XAxis dataKey="x" />
        <YAxis />
        <Line dataKey="y" />
        <ReferenceDot x={1} y={10} />
      </Chart>,
    );

    expect(container.querySelector('canvas')).not.toBeNull();
  });
});
