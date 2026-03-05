import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Chart } from '../chart/chartContext';
import { XAxis } from './XAxis';
import { YAxis } from './YAxis';
import { ReferenceLine } from './ReferenceLine';
import { Line } from '../series/Line';

describe('ReferenceLine', () => {
  it('renders horizontal reference line at y value', () => {
    const { container } = render(
      <Chart data={[{ x: 1, y: 10 }, { x: 2, y: 20 }, { x: 3, y: 15 }]} width={280} height={160}>
        <XAxis dataKey="x" />
        <YAxis />
        <Line dataKey="y" />
        <ReferenceLine y={15} stroke="#666" />
      </Chart>,
    );

    expect(container.querySelector('canvas')).not.toBeNull();
  });

  it('renders vertical reference line at x value', () => {
    const { container } = render(
      <Chart data={[{ x: 1, y: 10 }, { x: 2, y: 20 }]} width={280} height={160}>
        <XAxis dataKey="x" />
        <YAxis />
        <Line dataKey="y" />
        <ReferenceLine x={1.5} stroke="#f00" />
      </Chart>,
    );

    expect(container.querySelector('canvas')).not.toBeNull();
  });
});
