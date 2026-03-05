import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Chart } from '../chart/chartContext';
import { XAxis } from '../cartesian/XAxis';
import { YAxis } from '../cartesian/YAxis';
import { Line } from './Line';
import { ErrorBar } from './ErrorBar';

describe('ErrorBar', () => {
  it('renders with errorY data', () => {
    const { container } = render(
      <Chart
        data={[
          { x: 1, y: 10, errorY: 2 },
          { x: 2, y: 20, errorY: 3 },
        ]}
        width={280}
        height={160}
      >
        <XAxis dataKey="x" />
        <YAxis />
        <Line dataKey="y" />
        <ErrorBar dataKey="y" errorKey="errorY" />
      </Chart>,
    );

    expect(container.querySelector('canvas')).not.toBeNull();
  });

  it('renders with default errorKey derived from dataKey', () => {
    const { container } = render(
      <Chart
        data={[{ x: 1, y: 10, errorY: 1 }]}
        width={280}
        height={160}
      >
        <XAxis dataKey="x" />
        <YAxis />
        <Line dataKey="y" />
        <ErrorBar dataKey="y" />
      </Chart>,
    );

    expect(container.querySelector('canvas')).not.toBeNull();
  });
});
