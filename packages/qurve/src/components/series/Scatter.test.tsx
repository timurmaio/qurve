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
  it('renders without crashing', () => {
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
      </Chart>,
    );

    const canvas = container.querySelector('canvas');
    expect(canvas).not.toBeNull();
  });

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

    const legendButton = await screen.findByRole('button', { name: 'Observations, visible' });
    fireEvent.click(legendButton);
    expect(legendButton).toHaveStyle({ color: 'rgb(136, 136, 136)' });
  });

  it('renders with custom fill and stroke', () => {
    const { container } = render(
      <Chart data={[{ x: 10, y: 40 }]} width={280} height={160}>
        <XAxis dataKey="x" domain={[0, 30]} />
        <YAxis dataKey="y" domain={[0, 100]} />
        <Scatter yKey="y" xKey="x" fill="#ff0000" stroke="#0000ff" strokeWidth={2} />
      </Chart>,
    );

    expect(container.querySelector('canvas')).not.toBeNull();
  });

  it('handles empty data', () => {
    const { container } = render(
      <Chart data={[]} width={280} height={160}>
        <XAxis dataKey="x" domain={[0, 30]} />
        <YAxis dataKey="y" domain={[0, 100]} />
        <Scatter yKey="y" xKey="x" />
      </Chart>,
    );

    expect(container.querySelector('canvas')).not.toBeNull();
  });

  it('handles negative values', () => {
    const { container } = render(
      <Chart
        data={[
          { x: -10, y: -40 },
          { x: 20, y: 65 },
        ]}
        width={280}
        height={160}
      >
        <XAxis dataKey="x" domain={[-20, 30]} />
        <YAxis dataKey="y" domain={[-50, 100]} />
        <Scatter yKey="y" xKey="x" />
        <Tooltip />
      </Chart>,
    );

    expect(container.querySelector('canvas')).not.toBeNull();
  });

  it('handles floating point values', () => {
    const { container } = render(
      <Chart
        data={[
          { x: 1.5, y: 3.14 },
          { x: 2.7, y: 2.71 },
        ]}
        width={280}
        height={160}
      >
        <XAxis dataKey="x" domain={[0, 5]} />
        <YAxis dataKey="y" domain={[0, 10]} />
        <Scatter yKey="y" xKey="x" />
        <Tooltip />
      </Chart>,
    );

    expect(container.querySelector('canvas')).not.toBeNull();
  });

  it('renders with multiple scatter series', () => {
    const { container } = render(
      <Chart
        data={[
          { x: 10, y: 40, z: 20 },
          { x: 20, y: 65, z: 35 },
        ]}
        width={280}
        height={160}
      >
        <XAxis dataKey="x" domain={[0, 30]} />
        <YAxis dataKey="y" domain={[0, 100]} />
        <Scatter yKey="y" xKey="x" name="Series A" />
        <Scatter yKey="z" xKey="x" name="Series B" />
        <Legend />
        <Tooltip />
      </Chart>,
    );

    expect(container.querySelector('canvas')).not.toBeNull();
  });

  it('supports custom dataKey for y values', () => {
    const { container } = render(
      <Chart data={[{ value: 40 }, { value: 65 }]} width={280} height={160}>
        <XAxis />
        <YAxis domain={[0, 100]} />
        <Scatter dataKey="value" name="Values" />
        <Tooltip />
      </Chart>,
    );

    expect(container.querySelector('canvas')).not.toBeNull();
  });

  it('renders with custom point size', () => {
    const { container } = render(
      <Chart data={[{ x: 10, y: 40 }]} width={280} height={160}>
        <XAxis dataKey="x" domain={[0, 30]} />
        <YAxis dataKey="y" domain={[0, 100]} />
        <Scatter yKey="y" xKey="x" size={12} />
      </Chart>,
    );

    expect(container.querySelector('canvas')).not.toBeNull();
  });
});
