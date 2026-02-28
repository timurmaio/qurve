import { fireEvent, render, screen, waitFor } from '@testing-library/react';
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

    const legendButton = await screen.findByRole('button', { name: 'Distribution, visible' });
    fireEvent.click(legendButton);
    expect(legendButton).toHaveStyle({ color: 'rgb(136, 136, 136)' });
  });

  it('renders labels with formatter output', async () => {
    render(
      <Chart
        data={[
          { name: 'Alpha', value: 40 },
          { name: 'Beta', value: 60 },
        ]}
        width={280}
        height={160}
      >
        <Pie
          dataKey="value"
          nameKey="name"
          outerRadius={52}
          innerRadius={20}
          label
          labelFormatter={(value, name, percent) => `${name} ${value} (${Math.round(percent * 100)}%)`}
        />
      </Chart>,
    );

    expect(await screen.findByText('Alpha 40 (40%)')).toBeInTheDocument();
    expect(await screen.findByText('Beta 60 (60%)')).toBeInTheDocument();
  });

  it('uses slice palette colors in tooltip formatter item', async () => {
    const { container } = render(
      <Chart
        data={[
          { name: 'Alpha', value: 40 },
          { name: 'Beta', value: 60 },
        ]}
        width={280}
        height={160}
      >
        <Pie
          dataKey="value"
          nameKey="name"
          outerRadius={52}
          innerRadius={20}
          colors={['#111111', '#222222']}
          tooltipFormatter={(value, name, item) => [String(item.color), `${name} color`]}
        />
        <Tooltip />
      </Chart>,
    );

    const canvas = container.querySelector('canvas');
    expect(canvas).not.toBeNull();
    hoverCanvas(canvas as HTMLCanvasElement);

    expect(await screen.findByText('Alpha color:')).toBeInTheDocument();
    expect(screen.getByText('#111111')).toBeInTheDocument();
  });

  it('supports labelMode and custom label render function context', async () => {
    render(
      <Chart
        data={[
          { name: 'Alpha', value: 40 },
          { name: 'Beta', value: 60 },
        ]}
        width={280}
        height={160}
      >
        <Pie
          dataKey="value"
          nameKey="name"
          outerRadius={52}
          innerRadius={20}
          label
          labelMode="valuePercent"
          colors={['#111111', '#222222']}
        />
      </Chart>,
    );

    expect(await screen.findByText('40 (40%)')).toBeInTheDocument();
    expect(await screen.findByText('60 (60%)')).toBeInTheDocument();

    render(
      <Chart
        data={[{ name: 'Alpha', value: 100 }]}
        width={200}
        height={120}
      >
        <Pie
          dataKey="value"
          nameKey="name"
          outerRadius={40}
          label={(slice) => `${slice.name} ${slice.color}`}
          colors={['#abc123']}
        />
      </Chart>,
    );

    expect(await screen.findByText('Alpha #abc123')).toBeInTheDocument();
  });

  it('keeps labels in sync with legend visibility toggles', async () => {
    render(
      <Chart
        data={[
          { name: 'Alpha', value: 40 },
          { name: 'Beta', value: 60 },
        ]}
        width={280}
        height={160}
      >
        <Pie
          dataKey="value"
          nameKey="name"
          name="Traffic"
          outerRadius={52}
          innerRadius={20}
          label
          labelLine
        />
        <Legend />
      </Chart>,
    );

    expect(await screen.findByText('Alpha 40%')).toBeInTheDocument();

    const legendButton = await screen.findByRole('button', { name: 'Traffic, visible' });
    fireEvent.click(legendButton);

    await waitFor(() => {
      expect(screen.queryByText('Alpha 40%')).not.toBeInTheDocument();
      expect(screen.queryByText('Beta 60%')).not.toBeInTheDocument();
    });

    fireEvent.click(legendButton);

    expect(await screen.findByText('Alpha 40%')).toBeInTheDocument();
    expect(await screen.findByText('Beta 60%')).toBeInTheDocument();
  });

  it('renders dense labels with configured minimum gaps on both sides', async () => {
    const data = Array.from({ length: 20 }, (_, index) => ({
      name: `Slice ${index + 1}`,
      value: 5 + (index % 4),
    }));

    render(
      <Chart data={data} width={280} height={170} margin={{ top: 6, right: 8, left: 8, bottom: 24 }}>
        <Pie
          dataKey="value"
          nameKey="name"
          innerRadius={20}
          outerRadius={48}
          startAngle={210}
          endAngle={-150}
          label
          labelLine
          labelMode="name"
          labelOffset={16}
          labelMinGap={10}
        />
      </Chart>,
    );

    expect(await screen.findByText('Slice 1')).toBeInTheDocument();
    expect(await screen.findByText('Slice 20')).toBeInTheDocument();

    const labelElements = data
      .map((item) => screen.getByText(item.name))
      .map((element) => {
        return {
          top: Number.parseFloat(element.getAttribute('style')?.match(/top:\s*([^;]+)/)?.[1] ?? '0'),
          side: element.getAttribute('style')?.includes('text-align: right') ? 'right' : 'left',
        };
      });

    expect(labelElements.length).toBe(20);

    const assertMinGap = (side: 'left' | 'right') => {
      const tops = labelElements
        .filter((item) => item.side === side)
        .map((item) => item.top)
        .sort((a, b) => a - b);

      for (let index = 1; index < tops.length; index++) {
        expect(tops[index] - tops[index - 1]).toBeGreaterThanOrEqual(9.5);
      }
    };

    assertMinGap('left');
    assertMinGap('right');
  });
});
