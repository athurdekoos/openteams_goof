import { describe, it, expect } from 'vitest';
import { MergedCellsModel } from '../../../src/models/merged-cells-model';

describe('MergedCellsModel', () => {
  it('500×500 dimensions', () => {
    const model = new MergedCellsModel(42);
    expect(model.rowCount('body')).toBe(500);
    expect(model.columnCount('body')).toBe(500);
  });

  it('mergeCount > 0 and deterministic for same seed', () => {
    const a = new MergedCellsModel(42);
    const b = new MergedCellsModel(42);
    expect(a.mergeCount).toBeGreaterThan(0);
    expect(a.mergeCount).toBe(b.mergeCount);
  });

  it('no overlapping merge regions', () => {
    const model = new MergedCellsModel(42);
    const occupied = new Set<string>();
    for (let i = 0; i < model.groupCount('body'); i++) {
      const group = model.group('body', i)!;
      for (let r = group.r1; r <= group.r2; r++) {
        for (let c = group.c1; c <= group.c2; c++) {
          const key = `${r}:${c}`;
          expect(occupied.has(key)).toBe(false);
          occupied.add(key);
        }
      }
    }
  });

  it('merge origin data: M[rowSpan×colSpan] format', () => {
    const model = new MergedCellsModel(42);
    const group = model.group('body', 0)!;
    const val = model.data('body', group.r1, group.c1);
    const rowSpan = group.r2 - group.r1 + 1;
    const colSpan = group.c2 - group.c1 + 1;
    expect(val).toBe(`M[${rowSpan}×${colSpan}]`);
  });

  it('non-merge body data: numeric xx.x format', () => {
    const model = new MergedCellsModel(42);
    // Find a cell that is NOT a merge origin
    let val: string | null = null;
    for (let r = 0; r < 500; r++) {
      for (let c = 0; c < 500; c++) {
        const d = model.data('body', r, c) as string;
        if (!d.startsWith('M[')) {
          val = d;
          break;
        }
      }
      if (val) break;
    }
    expect(val).toMatch(/^\d+\.\d$/);
  });

  it('group() returns valid CellGroup with r2 >= r1, c2 >= c1', () => {
    const model = new MergedCellsModel(42);
    for (let i = 0; i < model.groupCount('body'); i++) {
      const group = model.group('body', i)!;
      expect(group.r2).toBeGreaterThanOrEqual(group.r1);
      expect(group.c2).toBeGreaterThanOrEqual(group.c1);
    }
  });

  it('groupCount for non-body is 0', () => {
    const model = new MergedCellsModel(42);
    expect(model.groupCount('column-header')).toBe(0);
    expect(model.groupCount('row-header')).toBe(0);
    expect(model.groupCount('corner-header')).toBe(0);
  });

  it('group() for non-body returns null', () => {
    const model = new MergedCellsModel(42);
    expect(model.group('column-header', 0)).toBeNull();
    expect(model.group('row-header', 0)).toBeNull();
  });

  it('all merge origins at stride-3 positions', () => {
    const model = new MergedCellsModel(42);
    for (let i = 0; i < model.groupCount('body'); i++) {
      const group = model.group('body', i)!;
      expect(group.r1 % 3).toBe(0);
      expect(group.c1 % 3).toBe(0);
    }
  });

  it('merge spans >= 2', () => {
    const model = new MergedCellsModel(42);
    for (let i = 0; i < model.groupCount('body'); i++) {
      const group = model.group('body', i)!;
      const rowSpan = group.r2 - group.r1 + 1;
      const colSpan = group.c2 - group.c1 + 1;
      expect(rowSpan).toBeGreaterThanOrEqual(2);
      expect(colSpan).toBeGreaterThanOrEqual(2);
    }
  });

  it('column header format', () => {
    const model = new MergedCellsModel(42);
    expect(model.data('column-header', 0, 5)).toBe('C5');
  });

  it('corner-header returns empty string', () => {
    const model = new MergedCellsModel(42);
    expect(model.data('corner-header', 0, 0)).toBe('');
  });
});
