import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Chart } from '../chart/chartContext';
import { XAxis } from '../cartesian/XAxis';
import { YAxis } from '../cartesian/YAxis';
import { Tooltip } from '../Tooltip';
import { Legend } from '../Legend';
import { Scatter } from './Scatter';

function hoverCanvas(canvas: HTMLCanvasElement, clientX = 180, clientY = 90) {
  Object.defineProperty(canvas, 'getBoundingClientRect', {
    configurable: true,
    value: () => ({
      left: 0,
      top: 0,
      right: 280,
      bottom: 160,
      width: 280,
      height: 160,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    }),
  });

  fireEvent.mouseMove(canvas, { clientX, clientY });
}

describe('Scatter', () => {
  it('shows tooltip payload and supports legend toggle', async () => {
    const { container } = render(
      <Chart
        data={[
          { x: 10, y: 40 },
          { x: 20, y: 65 },
        ]}
        width={280}
        height={160}
      >
        <XAxis dataKey="x" domain={[0, 30]} />
        <YAxis dataKey="y" domain={[0, 100]} />
        <Scatter yKey="y" xKey="x" name="Observations" />
        <Legend />
        <Tooltip />
      </Chart>,
    );

    const canvas = container.querySelector('canvas');
    expect(canvas).not.toBeNull();
    hoverCanvas(canvas as HTMLCanvasElement);

    expect(await screen.findByText('Observations:')).toBeInTheDocument();

    const legendButton = await screen.findByRole('button', { name: 'Observations' });
    fireEvent.click(legendButton);
    expect(legendButton).toHaveStyle({ color: 'rgb(136, 136, 136)' });
  });
});
