import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Chart } from '../chart/chartContext';
import { Tooltip } from '../Tooltip';
import { Legend } from '../Legend';
import { Pie } from './Pie';

function hoverCanvas(canvas: HTMLCanvasElement, clientX = 180, clientY = 80) {
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

describe('Pie', () => {
  it('renders tooltip payload and supports legend toggle', async () => {
    const { container } = render(
      <Chart
        data={[
          { name: 'Alpha', value: 40 },
          { name: 'Beta', value: 60 },
        ]}
        width={280}
        height={160}
      >
        <Pie dataKey="value" nameKey="name" outerRadius={52} innerRadius={20} name="Distribution" />
        <Legend />
        <Tooltip />
      </Chart>,
    );

    const canvas = container.querySelector('canvas');
    expect(canvas).not.toBeNull();
    hoverCanvas(canvas as HTMLCanvasElement);

    expect(await screen.findByText('Alpha:')).toBeInTheDocument();
    expect(screen.getByText('40.00')).toBeInTheDocument();

    const legendButton = await screen.findByRole('button', { name: 'Distribution' });
    fireEvent.click(legendButton);
    expect(legendButton).toHaveStyle({ color: 'rgb(136, 136, 136)' });
  });
});
