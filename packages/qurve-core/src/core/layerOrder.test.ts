import { describe, expect, it } from 'vitest';
import { LayerOrder } from './layerOrder';

describe('LayerOrder', () => {
  it('exports layer constants with correct order (lower draws first)', () => {
    expect(LayerOrder.background).toBe(0);
    expect(LayerOrder.grid).toBe(10);
    expect(LayerOrder.axes).toBe(20);
    expect(LayerOrder.area).toBe(30);
    expect(LayerOrder.bar).toBe(40);
    expect(LayerOrder.line).toBe(50);
    expect(LayerOrder.pie).toBe(45);
    expect(LayerOrder.pieLabels).toBe(46);
    expect(LayerOrder.scatter).toBe(60);
    expect(LayerOrder.overlays).toBe(80);
    expect(LayerOrder.cursor).toBe(90);
    expect(LayerOrder.tooltip).toBe(100);
  });
});
