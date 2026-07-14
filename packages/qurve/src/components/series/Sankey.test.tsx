import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SankeyChart } from '../chart/SankeyChart';
import { Sankey } from './Sankey';
import { Cell } from './Cell';
import { Tooltip } from '../Tooltip';

const DATA = {
  nodes: [{ name: 'Visit' }, { name: 'Direct' }, { name: 'Search' }, { name: 'Order' }],
  links: [
    { source: 0, target: 1, value: 40 },
    { source: 0, target: 2, value: 60 },
    { source: 1, target: 3, value: 30 },
    { source: 2, target: 3, value: 40 },
  ],
};

async function flushRender() {
  await act(async () => {
    await new Promise((resolve) => requestAnimationFrame(resolve));
  });
}

describe('Sankey', () => {
  it('renders sankey with labels and cells', async () => {
    const { container } = render(
      <SankeyChart data={DATA} width={480} height={280}>
        <Sankey label>
          <Cell fill="#8884d8" />
          <Cell fill="#83a6ed" />
          <Cell fill="#8dd1e1" />
          <Cell fill="#82ca9d" />
        </Sankey>
        <Tooltip />
      </SankeyChart>,
    );

    await flushRender();
    expect(container.querySelector('canvas')).not.toBeNull();
    expect(screen.getByText('Visit')).toBeInTheDocument();
    expect(screen.getByText('Order')).toBeInTheDocument();
  });

  it('resolves tooltip index on node hover', async () => {
    const { container } = render(
      <SankeyChart data={DATA} width={480} height={280}>
        <Sankey />
        <Tooltip />
      </SankeyChart>,
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
          right: 480,
          bottom: 280,
          width: 480,
          height: 280,
          x: 0,
          y: 0,
          toJSON: () => ({}),
        }),
      });
      fireEvent.mouseMove(canvas, { clientX: 30, clientY: 80 });
    }
  });
});
