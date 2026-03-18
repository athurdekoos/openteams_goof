import { describe, it, expect, vi } from 'vitest';
import { ExtremeVirtualizationModel } from '../../../src/models/extreme-virtualization-model';

describe('ExtremeVirtualizationModel', () => {
  it('row/column count is 1 trillion for body, 1 for headers', () => {
    const model = new ExtremeVirtualizationModel(42);
    expect(model.rowCount('body')).toBe(1_000_000_000_000);
    expect(model.rowCount('column-header')).toBe(1);
    expect(model.columnCount('body')).toBe(1_000_000_000_000);
    expect(model.columnCount('row-header')).toBe(1);
  });

  it('column header returns "Col N" format', () => {
    const model = new ExtremeVirtualizationModel(42);
    const header = model.data('column-header', 0, 5);
    expect(header).toBe(`Col ${(5).toLocaleString()}`);
  });

  it('row header returns locale-formatted number', () => {
    const model = new ExtremeVirtualizationModel(42);
    const header = model.data('row-header', 1000, 0);
    expect(header).toBe(`${(1000).toLocaleString()}`);
  });

  it('body cell returns numeric string format d+.dd', () => {
    const model = new ExtremeVirtualizationModel(42);
    const val = model.data('body', 0, 0);
    expect(val).toMatch(/^\d+\.\d{2}$/);
  });

  it('deterministic: same seed/position → same value', () => {
    const a = new ExtremeVirtualizationModel(42);
    const b = new ExtremeVirtualizationModel(42);
    expect(a.data('body', 100, 200)).toBe(b.data('body', 100, 200));
    expect(a.data('body', 0, 0)).toBe(b.data('body', 0, 0));
  });

  it('varies by position', () => {
    const model = new ExtremeVirtualizationModel(42);
    const v1 = model.data('body', 0, 0);
    const v2 = model.data('body', 0, 1);
    const v3 = model.data('body', 1, 0);
    expect(v1).not.toBe(v2);
    expect(v1).not.toBe(v3);
  });

  it('seed setter emits model-reset', () => {
    const model = new ExtremeVirtualizationModel(42);
    const listener = vi.fn();
    model.changed.connect(listener);
    model.seed = 99;
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener.mock.calls[0][1]).toEqual({ type: 'model-reset' });
  });

  it('extreme positions return valid values without error', () => {
    const model = new ExtremeVirtualizationModel(42);
    const val = model.data('body', 999_999_999_999, 999_999_999_999);
    expect(val).toMatch(/^\d+\.\d{2}$/);
  });

  it('corner-header returns empty string', () => {
    const model = new ExtremeVirtualizationModel(42);
    expect(model.data('corner-header', 0, 0)).toBe('');
  });

  it('performance: 1000 random accesses < 100ms', () => {
    const model = new ExtremeVirtualizationModel(42);
    const start = performance.now();
    for (let i = 0; i < 1000; i++) {
      const row = Math.floor(Math.random() * 1_000_000_000_000);
      const col = Math.floor(Math.random() * 1_000_000_000_000);
      model.data('body', row, col);
    }
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(100);
  });
});
