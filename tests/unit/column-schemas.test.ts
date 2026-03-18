import { describe, it, expect } from 'vitest';
import { RECORD_COLUMNS, EDITABLE_COLUMNS } from '../../src/data/column-schemas';

describe('RECORD_COLUMNS', () => {
  it('has 10 entries', () => {
    expect(RECORD_COLUMNS).toHaveLength(10);
  });

  it('has correct column names', () => {
    const names = RECORD_COLUMNS.map((c) => c.name);
    expect(names).toEqual([
      'ID', 'Name', 'Company', 'Email', 'Status',
      'Category', 'Price', 'Date', 'Avatar', 'Website',
    ]);
  });
});

describe('EDITABLE_COLUMNS', () => {
  it('has 10 entries', () => {
    expect(EDITABLE_COLUMNS).toHaveLength(10);
  });

  it('ID column is not editable', () => {
    expect(EDITABLE_COLUMNS[0].name).toBe('ID');
    expect(EDITABLE_COLUMNS[0].editable).toBe(false);
  });

  it('all other columns are editable', () => {
    for (let i = 1; i < EDITABLE_COLUMNS.length; i++) {
      expect(EDITABLE_COLUMNS[i].editable).toBe(true);
    }
  });

  describe('validators', () => {
    it('empty name is rejected', () => {
      const nameCol = EDITABLE_COLUMNS.find((c) => c.name === 'First Name')!;
      expect(nameCol.validator!('')).toBe(false);
      expect(nameCol.validator!('  ')).toBe(false);
      expect(nameCol.validator!('Alice')).toBe(true);
    });

    it('valid email accepted, invalid rejected', () => {
      const emailCol = EDITABLE_COLUMNS.find((c) => c.name === 'Email')!;
      expect(emailCol.validator!('user@example.com')).toBe(true);
      expect(emailCol.validator!('not-an-email')).toBe(false);
      expect(emailCol.validator!('')).toBe(false);
    });

    it('age boundary: 0 and 150 accepted, -1 and 151 rejected', () => {
      const ageCol = EDITABLE_COLUMNS.find((c) => c.name === 'Age')!;
      expect(ageCol.validator!('0')).toBe(true);
      expect(ageCol.validator!('150')).toBe(true);
      expect(ageCol.validator!('-1')).toBe(false);
      expect(ageCol.validator!('151')).toBe(false);
    });

    it('negative salary rejected', () => {
      const salaryCol = EDITABLE_COLUMNS.find((c) => c.name === 'Salary')!;
      expect(salaryCol.validator!('-1')).toBe(false);
      expect(salaryCol.validator!('0')).toBe(true);
      expect(salaryCol.validator!('50000')).toBe(true);
    });

    it('date format YYYY-MM-DD validated', () => {
      const dateCol = EDITABLE_COLUMNS.find((c) => c.name === 'Start Date')!;
      expect(dateCol.validator!('2024-01-15')).toBe(true);
      expect(dateCol.validator!('01/15/2024')).toBe(false);
      expect(dateCol.validator!('2024-1-5')).toBe(false);
    });
  });
});
