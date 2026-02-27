import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ResponsiveContainer } from './ResponsiveContainer';

function Probe(props: { width?: number; height?: number }) {
  return (
    <div data-testid="probe">
      {props.width}x{props.height}
    </div>
  );
}

describe('ResponsiveContainer', () => {
  it('injects numeric width and height into child', () => {
    render(
      <ResponsiveContainer width={320} height={180}>
        <Probe />
      </ResponsiveContainer>,
    );

    expect(screen.getByTestId('probe')).toHaveTextContent('320x180');
  });

  it('respects min dimensions for rendering', () => {
    render(
      <ResponsiveContainer width={10} height={12} minWidth={40} minHeight={50}>
        <Probe />
      </ResponsiveContainer>,
    );

    expect(screen.getByTestId('probe')).toHaveTextContent('40x50');
  });
});
