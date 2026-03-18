import { describe, it, expect } from 'vitest';
import { CopyModel } from '../../../src/models/copy-model';

describe('CopyModel', () => {
  it('100 rows, 10 columns', () => {
    const model = new CopyModel(42);
    expect(model.rowCount('body')).toBe(100);
    expect(model.columnCount('body')).toBe(10);
  });

  it('column headers are correct', () => {
    const model = new CopyModel(42);
    const expected = ['Product', 'Region', 'Q1 Sales', 'Q2 Sales', 'Q3 Sales', 'Q4 Sales', 'Total', 'Growth %', 'Target', 'Status'];
    for (let c = 0; c < 10; c++) {
      expect(model.data('column-header', 0, c)).toBe(expected[c]);
    }
  });

  it('all body cells are non-empty strings', () => {
    const model = new CopyModel(42);
    for (let r = 0; r < 100; r++) {
      for (let c = 0; c < 10; c++) {
        const val = model.data('body', r, c);
        expect(typeof val).toBe('string');
        expect(val.length).toBeGreaterThan(0);
      }
    }
  });

  it('Product from known list', () => {
    const products = ['Widget A', 'Widget B', 'Gadget X', 'Gadget Y', 'Tool Alpha', 'Tool Beta', 'Device Pro', 'Device Lite', 'Service Plus', 'Service Basic'];
    const model = new CopyModel(42);
    for (let r = 0; r < 100; r++) {
      expect(products).toContain(model.data('body', r, 0));
    }
  });

  it('Region from known list', () => {
    const regions = ['North', 'South', 'East', 'West', 'Central', 'International'];
    const model = new CopyModel(42);
    for (let r = 0; r < 100; r++) {
      expect(regions).toContain(model.data('body', r, 1));
    }
  });

  it('Status from known list', () => {
    const statuses = ['On Track', 'At Risk', 'Behind', 'Exceeded', 'New'];
    const model = new CopyModel(42);
    for (let r = 0; r < 100; r++) {
      expect(statuses).toContain(model.data('body', r, 9));
    }
  });

  it('Total = Q1 + Q2 + Q3 + Q4', () => {
    const model = new CopyModel(42);
    for (let r = 0; r < 10; r++) {
      const parseNum = (s: string) => parseInt(s.replace(/,/g, ''), 10);
      const q1 = parseNum(model.data('body', r, 2));
      const q2 = parseNum(model.data('body', r, 3));
      const q3 = parseNum(model.data('body', r, 4));
      const q4 = parseNum(model.data('body', r, 5));
      const total = parseNum(model.data('body', r, 6));
      expect(total).toBe(q1 + q2 + q3 + q4);
    }
  });

  it('Growth has % suffix', () => {
    const model = new CopyModel(42);
    for (let r = 0; r < 100; r++) {
      expect(model.data('body', r, 7)).toMatch(/%$/);
    }
  });

  it('deterministic from seed', () => {
    const a = new CopyModel(42);
    const b = new CopyModel(42);
    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 10; c++) {
        expect(a.data('body', r, c)).toBe(b.data('body', r, c));
      }
    }
  });

  it('rectangular structure: all rows have exactly 10 values', () => {
    const model = new CopyModel(42);
    for (let r = 0; r < 100; r++) {
      for (let c = 0; c < 10; c++) {
        expect(model.data('body', r, c)).not.toBe('');
      }
    }
  });
});
