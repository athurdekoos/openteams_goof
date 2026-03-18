import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { StreamingRowsModel } from '../../../src/models/streaming-rows-model';
import { TimerManager } from '../../../src/timer-manager';

describe('StreamingRowsModel', () => {
  let tm: TimerManager;

  beforeEach(() => {
    vi.useFakeTimers();
    tm = new TimerManager();
  });

  afterEach(() => {
    tm.dispose();
    vi.useRealTimers();
  });

  it('initial state: 50 rows, 50 columns', () => {
    const model = new StreamingRowsModel(tm, 42);
    expect(model.rowCount('body')).toBe(50);
    expect(model.columnCount('body')).toBe(50);
  });

  it('header counts are 1', () => {
    const model = new StreamingRowsModel(tm, 42);
    expect(model.rowCount('column-header')).toBe(1);
    expect(model.columnCount('row-header')).toBe(1);
  });

  it('body data format: string with 2 decimal places', () => {
    const model = new StreamingRowsModel(tm, 42);
    const val = model.data('body', 0, 0);
    expect(val).toMatch(/^\d+\.\d{2}$/);
  });

  it('after many ticks, row count stays in [4, 500]', () => {
    const model = new StreamingRowsModel(tm, 42, 100);
    model.start();
    // Run 500 ticks
    vi.advanceTimersByTime(50_000);
    const rows = model.rowCount('body');
    expect(rows).toBeGreaterThanOrEqual(4);
    expect(rows).toBeLessThanOrEqual(500);
  });

  it('updateCount increments per tick', () => {
    const model = new StreamingRowsModel(tm, 42, 100);
    expect(model.updateCount).toBe(0);
    model.start();
    vi.advanceTimersByTime(100);
    expect(model.updateCount).toBe(1);
    vi.advanceTimersByTime(200);
    expect(model.updateCount).toBe(3);
  });

  it('ticks emit change events', () => {
    const model = new StreamingRowsModel(tm, 42, 100);
    const listener = vi.fn();
    model.changed.connect(listener);
    model.start();
    vi.advanceTimersByTime(100);
    expect(listener).toHaveBeenCalled();
    const args = listener.mock.calls[0][1];
    expect(['rows-inserted', 'rows-removed', 'model-reset']).toContain(args.type);
  });

  it('out-of-range row returns empty string', () => {
    const model = new StreamingRowsModel(tm, 42);
    expect(model.data('body', 9999, 0)).toBe('');
  });

  it('same seed → same initial data', () => {
    const a = new StreamingRowsModel(tm, 42);
    const b = new StreamingRowsModel(tm, 42);
    for (let c = 0; c < 10; c++) {
      expect(a.data('body', 0, c)).toBe(b.data('body', 0, c));
    }
  });

  it('column header format', () => {
    const model = new StreamingRowsModel(tm, 42);
    expect(model.data('column-header', 0, 3)).toBe('C3');
  });

  it('row header format', () => {
    const model = new StreamingRowsModel(tm, 42);
    expect(model.data('row-header', 5, 0)).toBe('5');
  });
});
