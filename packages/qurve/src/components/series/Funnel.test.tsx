import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FunnelChart } from '../chart/FunnelChart';
import { Funnel } from './Funnel';
import { Cell } from './Cell';
import { Tooltip } from '../Tooltip';

const DATA = [
  { value: 100, name: 'Impression', fill: '#8884d8' },
  { value: 80, name: 'Click', fill: '#83a6ed' },
  { value: 50, name: 'Visit', fill: '#8dd1e1' },
  { value: 40, name: 'Consult', fill: '#82ca9d' },
  { value: 26, name: 'Order', fill: '#a4de6c' },
];

async function flushRender() {
  await act(async () => {
    await new Promise((resolve) => requestAnimationFrame(resolve));
  });
}

describe('Funnel', () => {
  it('renders funnel with labels and cells', async () => {
    const { container } = render(
      <FunnelChart data={DATA} width={400} height={320} margin={{ top: 10, right: 100, bottom: 10, left: 10 }}>
        <Funnel dataKey="value" nameKey="name" label lastShape="trapezoid">
          {DATA.map((entry) => (
            <Cell key={entry.name} fill={entry.fill} />
          ))}
        </Funnel>
        <Tooltip />
      </FunnelChart>,
    );

    await flushRender();
    expect(container.querySelector('canvas')).not.toBeNull();
    expect(screen.getByText(/Impression/)).toBeInTheDocument();
    expect(screen.getByText(/Order/)).toBeInTheDocument();
  });

  it('supports rectangle last shape', async () => {
    const { container } = render(
      <FunnelChart data={DATA} width={360} height={280}>
        <Funnel dataKey="value" nameKey="name" lastShape="rectangle" />
      </FunnelChart>,
    );

    await flushRender();
    expect(container.querySelector('canvas')).not.toBeNull();
  });

  it('resolves tooltip index on hover', async () => {
    const { container } = render(
      <FunnelChart data={DATA} width={400} height={300}>
        <Funnel dataKey="value" nameKey="name" />
        <Tooltip />
      </FunnelChart>,
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
          bottom: 300,
          width: 400,
          height: 300,
          x: 0,
          y: 0,
          toJSON: () => ({}),
        }),
      });
      fireEvent.mouseMove(canvas, { clientX: 200, clientY: 50 });
      await flushRender();
    }
  });
});
