import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { TreemapChart } from '../chart/TreemapChart';
import { Treemap } from './Treemap';
import { Cell } from './Cell';
import { Tooltip } from '../Tooltip';

const DATA = [
  { name: 'A', value: 100, fill: '#8884d8' },
  { name: 'B', value: 50, fill: '#83a6ed' },
  {
    name: 'group',
    children: [
      { name: 'C', value: 30, fill: '#8dd1e1' },
      { name: 'D', value: 20, fill: '#82ca9d' },
    ],
  },
];

async function flushRender() {
  await act(async () => {
    await new Promise((resolve) => requestAnimationFrame(resolve));
  });
}

describe('Treemap', () => {
  it('renders treemap with labels and cells', async () => {
    const { container } = render(
      <TreemapChart data={DATA} width={400} height={280}>
        <Treemap dataKey="value" nameKey="name" label>
          <Cell fill="#8884d8" />
          <Cell fill="#83a6ed" />
          <Cell fill="#8dd1e1" />
          <Cell fill="#82ca9d" />
        </Treemap>
        <Tooltip />
      </TreemapChart>,
    );

    await flushRender();
    expect(container.querySelector('canvas')).not.toBeNull();
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('resolves tooltip index on hover', async () => {
    const { container } = render(
      <TreemapChart data={DATA} width={400} height={280}>
        <Treemap dataKey="value" />
        <Tooltip />
      </TreemapChart>,
    );

    await flushRender();
    const canvas =
      container.querySelector('[data-testid="chart-event-canvas"]') ??
      container.querySelector('canvas');
    expect(canvas).not.toBeNull();
    if (canvas) {
      Object.defineProperty(canvas, 'getBoundingClientRect', {
        configurable: true,
        value: () => ({
          left: 0,
          top: 0,
          right: 400,
          bottom: 280,
          width: 400,
          height: 280,
          x: 0,
          y: 0,
          toJSON: () => ({}),
        }),
      });
      fireEvent.mouseMove(canvas, { clientX: 40, clientY: 40 });
    }
  });
});
