import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { RandomTicksModel } from '../../../src/models/random-ticks-model';
import { TimerManager } from '../../../src/timer-manager';

describe('RandomTicksModel', () => {
  let tm: TimerManager;

  beforeEach(() => {
    vi.useFakeTimers();
    tm = new TimerManager();
  });

  afterEach(() => {
    tm.dispose();
    vi.useRealTimers();
  });

  it('dimensions match constructor args', () => {
    const model = new RandomTicksModel(tm, 'rt1', 42, 100, 30);
    expect(model.rowCount('body')).toBe(100);
    expect(model.columnCount('body')).toBe(30);
  });

  it('header counts are 1', () => {
    const model = new RandomTicksModel(tm, 'rt1', 42, 100, 30);
    expect(model.rowCount('column-header')).toBe(1);
    expect(model.columnCount('row-header')).toBe(1);
  });

  it('all initial values in [0, 1)', () => {
    const model = new RandomTicksModel(tm, 'rt1', 42, 20, 10);
    for (let r = 0; r < 20; r++) {
      for (let c = 0; c < 10; c++) {
        const v = model.data('body', r, c) as number;
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThan(1);
      }
    }
  });

  it('tick mutates exactly cellsPerTick cells', () => {
    const rows = 20;
    const cols = 10;
    const cellsPerTick = 5;
    const model = new RandomTicksModel(tm, 'rt1', 42, rows, cols, 100, cellsPerTick);

    // Capture initial values
    const initial: number[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        initial.push(model.data('body', r, c));
      }
    }

    model.start();
    vi.advanceTimersByTime(100);

    // Count changes
    let changed = 0;
    let idx = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (model.data('body', r, c) !== initial[idx]) {
          changed++;
        }
        idx++;
      }
    }
    // Some cells may be mutated to same position twice, so changed <= cellsPerTick
    expect(changed).toBeLessThanOrEqual(cellsPerTick);
    expect(changed).toBeGreaterThan(0);
  });

  it('tick emits cells-changed with bounding region', () => {
    const model = new RandomTicksModel(tm, 'rt1', 42, 10, 10, 100);
    const listener = vi.fn();
    model.changed.connect(listener);
    model.start();
    vi.advanceTimersByTime(100);
    expect(listener).toHaveBeenCalled();
    const event = listener.mock.calls[0][1];
    expect(event.type).toBe('cells-changed');
    expect(event.region).toBe('body');
    expect(event.row).toBeGreaterThanOrEqual(0);
    expect(event.column).toBeGreaterThanOrEqual(0);
    expect(event.rowSpan).toBeGreaterThan(0);
    expect(event.columnSpan).toBeGreaterThan(0);
  });

  it('updateCount increments', () => {
    const model = new RandomTicksModel(tm, 'rt1', 42, 10, 10, 100);
    expect(model.updateCount).toBe(0);
    model.start();
    vi.advanceTimersByTime(300);
    expect(model.updateCount).toBe(3);
  });

  it('totalCells = rows × cols', () => {
    const model = new RandomTicksModel(tm, 'rt1', 42, 50, 30);
    expect(model.totalCells).toBe(1500);
  });

  it('deterministic initial state from seed', () => {
    const a = new RandomTicksModel(tm, 'rt1', 42, 10, 10);
    const b = new RandomTicksModel(tm, 'rt2', 42, 10, 10);
    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 10; c++) {
        expect(a.data('body', r, c)).toBe(b.data('body', r, c));
      }
    }
  });

  it('cellsPerTick getter returns configured value', () => {
    const model = new RandomTicksModel(tm, 'rt1', 42, 10, 10, 60, 25);
    expect(model.cellsPerTick).toBe(25);
  });
});
