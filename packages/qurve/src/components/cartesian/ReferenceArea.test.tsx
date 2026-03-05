import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Chart } from '../chart/chartContext';
import { XAxis } from './XAxis';
import { YAxis } from './YAxis';
import { ReferenceArea } from './ReferenceArea';
import { Line } from '../series/Line';

describe('ReferenceArea', () => {
  it('renders horizontal reference area between y1 and y2', () => {
    const { container } = render(
      <Chart data={[{ x: 1, y: 10 }, { x: 2, y: 20 }, { x: 3, y: 15 }]} width={280} height={160}>
        <XAxis dataKey="x" />
        <YAxis />
        <Line dataKey="y" />
        <ReferenceArea y1={12} y2={18} fill="rgba(0,0,255,0.2)" />
      </Chart>,
    );

    expect(container.querySelector('canvas')).not.toBeNull();
  });

  it('renders vertical reference area between x1 and x2', () => {
    const { container } = render(
      <Chart data={[{ x: 1, y: 10 }, { x: 2, y: 20 }]} width={280} height={160}>
        <XAxis dataKey="x" />
        <YAxis />
        <Line dataKey="y" />
        <ReferenceArea x1={1.2} x2={1.8} />
      </Chart>,
    );

    expect(container.querySelector('canvas')).not.toBeNull();
  });
});
