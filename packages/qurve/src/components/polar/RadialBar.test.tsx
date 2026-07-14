import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { RadialBarChart } from '../chart/RadialBarChart';
import { RadialBar } from './RadialBar';
import { Cell } from '../series/Cell';
import { Legend } from '../Legend';
import { Tooltip } from '../Tooltip';

const DATA = [
  { name: '18-24', uv: 31.47 },
  { name: '25-29', uv: 26.69 },
  { name: '30-34', uv: 15.69 },
  { name: '35-39', uv: 8.22 },
  { name: '40-49', uv: 8.63 },
  { name: '50+', uv: 2.63 },
];

async function flushRender() {
  await act(async () => {
    await new Promise((resolve) => requestAnimationFrame(resolve));
  });
}

function hoverCanvas(canvas: HTMLCanvasElement, clientX = 200, clientY = 100) {
  Object.defineProperty(canvas, 'getBoundingClientRect', {
    configurable: true,
    value: () => ({
      left: 0,
      top: 0,
      right: 400,
      bottom: 320,
      width: 400,
      height: 320,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    }),
  });
  fireEvent.mouseMove(canvas, { clientX, clientY });
}

describe('RadialBar', () => {
  it('renders gauge-style radial bars with background', async () => {
    const { container } = render(
      <RadialBarChart data={DATA} width={400} height={320}>
        <RadialBar
          dataKey="uv"
          nameKey="name"
          background
          innerRadius={20}
          outerRadius={120}
          startAngle={180}
          endAngle={0}
        />
        <Legend />
        <Tooltip />
      </RadialBarChart>,
    );

    await flushRender();
    expect(container.querySelector('canvas')).not.toBeNull();
    expect(screen.getByText('uv')).toBeInTheDocument();
  });

  it('supports Cell overrides and tooltip hover', async () => {
    const { container } = render(
      <RadialBarChart data={DATA.slice(0, 3)} width={400} height={320}>
        <RadialBar dataKey="uv" nameKey="name" fill="#8884d8">
          <Cell fill="#f97316" />
          <Cell fill="#22c55e" />
          <Cell fill="#3b82f6" />
        </RadialBar>
        <Tooltip />
      </RadialBarChart>,
    );

    await flushRender();
    const canvas =
      container.querySelector('[data-testid="chart-event-canvas"]') ??
      container.querySelector('canvas');
    expect(canvas).not.toBeNull();
    if (canvas) {
      hoverCanvas(canvas as HTMLCanvasElement, 200, 100);
      await flushRender();
    }
  });
});
