import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getRelativePosition } from './canvasUtils';

describe('getRelativePosition', () => {
  const originalDevicePixelRatio = Object.getOwnPropertyDescriptor(window, 'devicePixelRatio');

  beforeEach(() => {
    Object.defineProperty(window, 'devicePixelRatio', { value: 1, configurable: true });
  });

  afterEach(() => {
    if (originalDevicePixelRatio) {
      Object.defineProperty(window, 'devicePixelRatio', originalDevicePixelRatio);
    }
  });

  it('maps client coords to canvas drawing coords when canvas and display match', () => {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 300;

    vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({
      left: 100,
      top: 50,
      width: 600,
      height: 300,
      right: 700,
      bottom: 350,
      x: 100,
      y: 50,
      toJSON: () => ({}),
    });

    const result = getRelativePosition(200, 100, canvas);
    expect(result.x).toBe(100);
    expect(result.y).toBe(50);
  });

  it('accounts for DPR when display size differs from buffer size', () => {
    Object.defineProperty(window, 'devicePixelRatio', { value: 2, configurable: true });

    const canvas = document.createElement('canvas');
    canvas.width = 1200; // 600 * 2
    canvas.height = 600; // 300 * 2

    vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      top: 0,
      width: 600,
      height: 300,
      right: 600,
      bottom: 300,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });

    const result = getRelativePosition(300, 150, canvas);
    expect(result.x).toBe(300);
    expect(result.y).toBe(150);
  });
});
