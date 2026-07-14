import { act, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Chart } from './chart/chartContext';
import { XAxis } from './cartesian/XAxis';
import { YAxis } from './cartesian/YAxis';
import { Line } from './series/Line';
import { Bar } from './series/Bar';
import { Label } from './Label';
import { LabelList } from './LabelList';

async function flushRender() {
  await act(async () => {
    await new Promise((resolve) => requestAnimationFrame(resolve));
  });
}

describe('LabelList', () => {
  it('renders with Line without throwing', async () => {
    const { container } = render(
      <Chart
        data={[
          { x: 1, y: 10 },
          { x: 2, y: 20 },
        ]}
        width={280}
        height={160}
      >
        <XAxis dataKey="x" />
        <YAxis />
        <Line dataKey="y" />
        <LabelList dataKey="y" position="top" />
      </Chart>,
    );

    await flushRender();
    expect(container.querySelector('canvas')).not.toBeNull();
  });

  it('renders with Bar shape and formatter', async () => {
    const formatter = vi.fn((value: unknown) => `$${value}`);
    const { container } = render(
      <Chart
        data={[
          { x: 1, sales: 12 },
          { x: 2, sales: 18 },
        ]}
        width={280}
        height={160}
      >
        <XAxis dataKey="x" />
        <YAxis />
        <Bar dataKey="sales" />
        <LabelList dataKey="sales" shape="bar" position="inside" formatter={formatter} />
      </Chart>,
    );

    await flushRender();
    expect(container.querySelector('canvas')).not.toBeNull();
    expect(formatter).toHaveBeenCalled();
  });

  it('uses valueKey for label text when provided', async () => {
    const formatter = vi.fn((value: unknown) => String(value));
    render(
      <Chart
        data={[{ x: 1, y: 10, label: 'A' }]}
        width={280}
        height={160}
      >
        <XAxis dataKey="x" />
        <YAxis />
        <Line dataKey="y" />
        <LabelList dataKey="y" valueKey="label" formatter={formatter} />
      </Chart>,
    );

    await flushRender();
    expect(formatter).toHaveBeenCalledWith('A', expect.any(Object), 0);
  });
});

describe('Label', () => {
  it('renders chart title label', async () => {
    const { container } = render(
      <Chart
        data={[{ x: 1, y: 10 }]}
        width={280}
        height={160}
        margin={{ top: 36 }}
      >
        <Label value="Revenue" position="top" offset={8} />
        <XAxis dataKey="x" />
        <YAxis />
        <Line dataKey="y" />
      </Chart>,
    );

    await flushRender();
    expect(container.querySelector('canvas')).not.toBeNull();
  });

  it('accepts numeric value and angle', async () => {
    const { container } = render(
      <Chart
        data={[{ x: 1, y: 10 }]}
        width={280}
        height={160}
        margin={{ left: 48 }}
      >
        <Label value={2024} position="left" angle={-90} />
        <XAxis dataKey="x" />
        <YAxis />
        <Line dataKey="y" />
      </Chart>,
    );

    await flushRender();
    expect(container.querySelector('canvas')).not.toBeNull();
  });
});
