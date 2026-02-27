import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Chart } from './chart/chartContext';
import { XAxis } from './cartesian/XAxis';
import { YAxis } from './cartesian/YAxis';
import { Line } from './series/Line';
import { Brush } from './Brush';

describe('Brush', () => {
  it('renders and emits range updates on drag', () => {
    const onChange = vi.fn();

    render(
      <Chart
        data={Array.from({ length: 20 }, (_, index) => ({ x: index, y: index * 2 }))}
        width={320}
        height={180}
        margin={{ bottom: 26 }}
      >
        <XAxis dataKey="x" />
        <YAxis />
        <Line dataKey="y" dot={false} />
        <Brush onChange={onChange} />
      </Chart>,
    );

    const root = screen.getByTestId('brush-root');
    const handleEnd = screen.getByTestId('brush-handle-end');

    Object.defineProperty(root, 'getBoundingClientRect', {
      configurable: true,
      value: () => ({
        left: 0,
        top: 0,
        right: 304,
        bottom: 22,
        width: 304,
        height: 22,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }),
    });

    fireEvent.mouseDown(handleEnd, { clientX: 200 });
    fireEvent.mouseMove(window, { clientX: 160 });
    fireEvent.mouseUp(window);

    expect(onChange).toHaveBeenCalled();
    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0] as { startIndex: number; endIndex: number };
    expect(lastCall.startIndex).toBeGreaterThanOrEqual(0);
    expect(lastCall.endIndex).toBeLessThanOrEqual(19);
    expect(lastCall.endIndex).toBeGreaterThanOrEqual(lastCall.startIndex);
  });

  it('supports wheel zoom and reset button', () => {
    const onChange = vi.fn();

    render(
      <Chart
        data={Array.from({ length: 20 }, (_, index) => ({ x: index, y: index * 2 }))}
        width={320}
        height={180}
        margin={{ bottom: 26 }}
      >
        <XAxis dataKey="x" />
        <YAxis />
        <Line dataKey="y" dot={false} />
        <Brush onChange={onChange} />
      </Chart>,
    );

    const root = screen.getByTestId('brush-root');
    Object.defineProperty(root, 'getBoundingClientRect', {
      configurable: true,
      value: () => ({
        left: 0,
        top: 0,
        right: 304,
        bottom: 22,
        width: 304,
        height: 22,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }),
    });

    fireEvent.wheel(root, { deltaY: -100, clientX: 152 });

    const reset = screen.getByTestId('brush-reset');
    expect(reset).toBeInTheDocument();

    fireEvent.click(reset);

    expect(onChange).toHaveBeenCalled();
  });

  it('supports touch drag and pinch zoom', () => {
    const onChange = vi.fn();

    render(
      <Chart
        data={Array.from({ length: 40 }, (_, index) => ({ x: index, y: index * 2 }))}
        width={320}
        height={180}
        margin={{ bottom: 26 }}
      >
        <XAxis dataKey="x" />
        <YAxis />
        <Line dataKey="y" dot={false} />
        <Brush onChange={onChange} />
      </Chart>,
    );

    const root = screen.getByTestId('brush-root');
    const selection = screen.getByTestId('brush-window-selection');

    Object.defineProperty(root, 'getBoundingClientRect', {
      configurable: true,
      value: () => ({
        left: 0,
        top: 0,
        right: 304,
        bottom: 22,
        width: 304,
        height: 22,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }),
    });

    fireEvent.touchStart(selection, {
      touches: [{ clientX: 140, clientY: 12 }],
    });
    fireEvent.touchMove(window, {
      touches: [{ clientX: 110, clientY: 12 }],
    });
    fireEvent.touchEnd(window);

    fireEvent.touchStart(root, {
      touches: [
        { clientX: 100, clientY: 10 },
        { clientX: 220, clientY: 10 },
      ],
    });
    fireEvent.touchMove(window, {
      touches: [
        { clientX: 120, clientY: 10 },
        { clientX: 200, clientY: 10 },
      ],
    });
    fireEvent.touchEnd(window);

    expect(onChange).toHaveBeenCalled();
    expect(onChange.mock.calls.length).toBeGreaterThan(1);
  });
});
