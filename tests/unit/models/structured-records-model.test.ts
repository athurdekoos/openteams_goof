import { describe, it, expect } from 'vitest';
import { StructuredRecordsModel } from '../../../src/models/structured-records-model';

describe('StructuredRecordsModel', () => {
  it('10,000 rows, 10 columns', () => {
    const model = new StructuredRecordsModel(42);
    expect(model.rowCount('body')).toBe(10_000);
    expect(model.columnCount('body')).toBe(10);
  });

  it('header counts are 1', () => {
    const model = new StructuredRecordsModel(42);
    expect(model.rowCount('column-header')).toBe(1);
    expect(model.columnCount('row-header')).toBe(1);
  });

  it('column headers match RECORD_COLUMNS names', () => {
    const model = new StructuredRecordsModel(42);
    const expected = ['ID', 'Name', 'Company', 'Email', 'Status', 'Category', 'Price', 'Date', 'Avatar', 'Website'];
    for (let c = 0; c < 10; c++) {
      expect(model.data('column-header', 0, c)).toBe(expected[c]);
    }
  });

  it('records have correct field types', () => {
    const model = new StructuredRecordsModel(42);
    // ID is a number
    expect(typeof model.data('body', 0, 0)).toBe('number');
    // Name is a string
    expect(typeof model.data('body', 0, 1)).toBe('string');
    // Email contains @
    expect(model.data('body', 0, 3)).toContain('@');
    // Price is a number
    expect(typeof model.data('body', 0, 6)).toBe('number');
    // Image is a data: URI
    expect(model.data('body', 0, 8)).toMatch(/^data:image\/svg\+xml,/);
    // Website starts with https://
    expect(model.data('body', 0, 9)).toMatch(/^https:\/\//);
  });

  it('lazy generation: accessing row 5000 works without prior access', () => {
    const model = new StructuredRecordsModel(42);
    const id = model.data('body', 5000, 0);
    expect(id).toBe(5001);
    const name = model.data('body', 5000, 1);
    expect(typeof name).toBe('string');
    expect(name.length).toBeGreaterThan(0);
  });

  it('LRU eviction: re-accessing row 0 after many accesses regenerates identical data', () => {
    const model = new StructuredRecordsModel(42);
    // Access row 0 first to get its data
    const originalName = model.data('body', 0, 1);

    // Access 6000+ different rows to force eviction of row 0
    for (let r = 1; r <= 6000; r++) {
      model.data('body', r, 0);
    }

    // Re-access row 0 — should regenerate identically
    const regeneratedName = model.data('body', 0, 1);
    expect(regeneratedName).toBe(originalName);
  });

  it('deterministic across instances with same seed', () => {
    const a = new StructuredRecordsModel(42);
    const b = new StructuredRecordsModel(42);
    for (let c = 0; c < 10; c++) {
      expect(a.data('body', 100, c)).toBe(b.data('body', 100, c));
    }
  });

  it('metadata returns type matching column schema', () => {
    const model = new StructuredRecordsModel(42);
    const meta0 = model.metadata('body', 0, 0);
    expect(meta0).toHaveProperty('type', 'number');

    const meta3 = model.metadata('body', 0, 3);
    expect(meta3).toHaveProperty('type', 'email');

    const meta8 = model.metadata('body', 0, 8);
    expect(meta8).toHaveProperty('type', 'image');
  });

  it('metadata for non-body is empty', () => {
    const model = new StructuredRecordsModel(42);
    expect(model.metadata('column-header', 0, 0)).toEqual({});
  });

  it('row header is 1-based row number', () => {
    const model = new StructuredRecordsModel(42);
    expect(model.data('row-header', 0, 0)).toBe('1');
    expect(model.data('row-header', 99, 0)).toBe('100');
  });
});
