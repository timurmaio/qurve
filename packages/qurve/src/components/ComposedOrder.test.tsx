import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Chart } from './chart/chartContext';
import { XAxis } from './cartesian/XAxis';
import { YAxis } from './cartesian/YAxis';
import { Area } from './series/Area';
import { Bar } from './series/Bar';
import { Line } from './series/Line';
import { Scatter } from './series/Scatter';
import { Tooltip } from './Tooltip';

function hoverCanvas(canvas: HTMLCanvasElement, clientX = 20, clientY = 20) {
  Object.defineProperty(canvas, 'getBoundingClientRect', {
    configurable: true,
    value: () => ({
      left: 0,
      top: 0,
      right: 320,
      bottom: 180,
      width: 320,
      height: 180,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    }),
  });

  fireEvent.mouseMove(canvas, { clientX, clientY });
}

describe('composed ordering', () => {
  it('uses deterministic tooltip payload order by series layer', async () => {
    const { container } = render(
      <Chart data={[{ x: 0, v: 10 }]} width={320} height={180}>
        <XAxis dataKey="x" />
        <YAxis />
        <Line dataKey="v" name="Line" />
        <Scatter xKey="x" yKey="v" name="Scatter" />
        <Bar dataKey="v" name="Bar" />
        <Area dataKey="v" name="Area" />
        <Tooltip
          content={({ payload }) => (
            <div data-testid="payload-order">
              {(payload ?? []).map((item) => item.name).join('|')}
            </div>
          )}
        />
      </Chart>,
    );

    const canvas = container.querySelector('canvas');
    expect(canvas).not.toBeNull();
    hoverCanvas(canvas as HTMLCanvasElement);

    expect(await screen.findByTestId('payload-order')).toHaveTextContent('Area|Bar|Line|Scatter');
  });
});
