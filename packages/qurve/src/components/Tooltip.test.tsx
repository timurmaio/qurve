import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Chart } from './chart/chartContext';
import { XAxis } from './cartesian/XAxis';
import { YAxis } from './cartesian/YAxis';
import { Line } from './series/Line';
import { Bar } from './series/Bar';
import { Tooltip } from './Tooltip';

function hoverCanvas(canvas: HTMLCanvasElement, clientX = 10, clientY = 10) {
  Object.defineProperty(canvas, 'getBoundingClientRect', {
    configurable: true,
    value: () => ({
      left: 0,
      top: 0,
      right: 320,
      bottom: 160,
      width: 320,
      height: 160,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    }),
  });

  fireEvent.mouseMove(canvas, { clientX, clientY });
}

describe('Tooltip', () => {
  it('uses global formatter when series formatter is absent', async () => {
    const { container } = render(
      <Chart data={[{ x: 0, y: 10 }, { x: 1, y: 20 }]} width={320} height={160}>
        <XAxis dataKey="x" />
        <YAxis />
        <Line dataKey="y" name="Revenue" />
        <Tooltip formatter={(value) => `global:${String(value)}`} />
      </Chart>,
    );

    const canvas = container.querySelector('canvas');
    expect(canvas).not.toBeNull();
    hoverCanvas(canvas as HTMLCanvasElement, 300, 20);

    expect(await screen.findByText('global:20')).toBeInTheDocument();
  });

  it('prefers series formatter over global formatter', async () => {
    const { container } = render(
      <Chart data={[{ x: 0, y: 15 }]} width={320} height={160}>
        <XAxis dataKey="x" />
        <YAxis />
        <Bar
          dataKey="y"
          tooltipName="Orders"
          tooltipFormatter={(value) => `series:${String(value)}`}
        />
        <Tooltip formatter={(value) => `global:${String(value)}`} />
      </Chart>,
    );

    const canvas = container.querySelector('canvas');
    expect(canvas).not.toBeNull();
    hoverCanvas(canvas as HTMLCanvasElement, 20, 20);

    expect(await screen.findByText('series:15')).toBeInTheDocument();
    expect(screen.queryByText('global:15')).toBeNull();
  });

  it('formats time labels with Intl when x axis is time', async () => {
    const { container } = render(
      <Chart
        data={[
          { ts: new Date('2024-01-01T10:00:00.000Z').getTime(), y: 10 },
          { ts: new Date('2024-01-02T10:00:00.000Z').getTime(), y: 20 },
        ]}
        width={320}
        height={160}
      >
        <XAxis dataKey="ts" type="time" />
        <YAxis />
        <Line dataKey="y" name="Revenue" />
        <Tooltip />
      </Chart>,
    );

    const canvas = container.querySelector('canvas');
    expect(canvas).not.toBeNull();
    hoverCanvas(canvas as HTMLCanvasElement, 300, 20);

    const expected = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(
      new Date('2024-01-02T10:00:00.000Z').getTime(),
    );
    expect(await screen.findByText(expected)).toBeInTheDocument();
  });
});
