import { render, screen, act, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { ResponsiveContainer } from './ResponsiveContainer';

function Probe(props: { width?: number; height?: number }) {
  return (
    <div data-testid="probe">
      {props.width}x{props.height}
    </div>
  );
}

describe('ResponsiveContainer', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

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

  it('renders with string width', () => {
    const { container } = render(
      <ResponsiveContainer width="100%" height={180}>
        <Probe />
      </ResponsiveContainer>,
    );

    const div = container.querySelector('div');
    expect(div).toHaveStyle({ width: '100%' });
  });

  it('renders with string height', () => {
    const { container } = render(
      <ResponsiveContainer width={320} height="50%">
        <Probe />
      </ResponsiveContainer>,
    );

    const div = container.querySelector('div');
    expect(div).toHaveStyle({ height: '50%' });
  });

  it('renders with aspect ratio', async () => {
    const { container } = render(
      <ResponsiveContainer width={200} aspect={2}>
        <Probe />
      </ResponsiveContainer>,
    );

    // With aspect=2 and width=200, height should be 100
    expect(screen.getByTestId('probe')).toHaveTextContent('200x100');
  });

  it('renders with minWidth', () => {
    const { container } = render(
      <ResponsiveContainer width={50} minWidth={100} height={100}>
        <Probe />
      </ResponsiveContainer>,
    );

    const div = container.querySelector('div');
    expect(div).toHaveStyle({ minWidth: '100px' });
  });

  it('renders with minHeight', () => {
    const { container } = render(
      <ResponsiveContainer width={100} height={50} minHeight={100}>
        <Probe />
      </ResponsiveContainer>,
    );

    const div = container.querySelector('div');
    expect(div).toHaveStyle({ minHeight: '100px' });
  });

  it('does not render child when width is 0', () => {
    render(
      <ResponsiveContainer width={0} height={100}>
        <Probe />
      </ResponsiveContainer>,
    );

    expect(screen.queryByTestId('probe')).toBeNull();
  });

  it('does not render child when height is 0', () => {
    render(
      <ResponsiveContainer width={100} height={0}>
        <Probe />
      </ResponsiveContainer>,
    );

    expect(screen.queryByTestId('probe')).toBeNull();
  });

  it('does not render child when both dimensions are 0', () => {
    render(
      <ResponsiveContainer width={0} height={0}>
        <Probe />
      </ResponsiveContainer>,
    );

    expect(screen.queryByTestId('probe')).toBeNull();
  });

  it('renders with default 100% dimensions', () => {
    const { container } = render(
      <ResponsiveContainer>
        <Probe />
      </ResponsiveContainer>,
    );

    const div = container.querySelector('div');
    expect(div).toHaveStyle({ width: '100%', height: '100%' });
  });

  it('clamps negative minWidth to 0', () => {
    const { container } = render(
      <ResponsiveContainer width={100} height={100} minWidth={-10}>
        <Probe />
      </ResponsiveContainer>,
    );

    const div = container.querySelector('div');
    expect(div).toHaveStyle({ minWidth: '0px' });
  });

  it('clamps negative minHeight to 0', () => {
    const { container } = render(
      <ResponsiveContainer width={100} height={100} minHeight={-10}>
        <Probe />
      </ResponsiveContainer>,
    );

    const div = container.querySelector('div');
    expect(div).toHaveStyle({ minHeight: '0px' });
  });

  it('handles aspect=0 as disabled', () => {
    render(
      <ResponsiveContainer width={200} aspect={0} height={100}>
        <Probe />
      </ResponsiveContainer>,
    );

    // aspect=0 should be treated as disabled, use height as-is
    expect(screen.getByTestId('probe')).toHaveTextContent('200x100');
  });

  it('handles negative aspect as disabled', () => {
    render(
      <ResponsiveContainer width={200} aspect={-1} height={100}>
        <Probe />
      </ResponsiveContainer>,
    );

    // negative aspect should be treated as disabled
    expect(screen.getByTestId('probe')).toHaveTextContent('200x100');
  });
});
