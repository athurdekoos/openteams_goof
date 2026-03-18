import { describe, it, expect, vi } from 'vitest';
import { EditableModel } from '../../../src/models/editable-model';

describe('EditableModel', () => {
  it('50 rows, 10 columns', () => {
    const model = new EditableModel(42);
    expect(model.rowCount('body')).toBe(50);
    expect(model.columnCount('body')).toBe(10);
  });

  it('initial ID = row + 1', () => {
    const model = new EditableModel(42);
    expect(model.data('body', 0, 0)).toBe(1);
    expect(model.data('body', 4, 0)).toBe(5);
  });

  it('setData on editable column returns true and persists', () => {
    const model = new EditableModel(42);
    // Column 1 = First Name (editable)
    const result = model.setData('body', 0, 1, 'NewName');
    expect(result).toBe(true);
    expect(model.data('body', 0, 1)).toBe('NewName');
  });

  it('setData on non-editable column (ID) returns false', () => {
    const model = new EditableModel(42);
    const result = model.setData('body', 0, 0, 999);
    expect(result).toBe(false);
  });

  it('setData on non-body region returns false', () => {
    const model = new EditableModel(42);
    expect(model.setData('column-header', 0, 1, 'X')).toBe(false);
  });

  it('valid email accepted', () => {
    const model = new EditableModel(42);
    // Column 3 = Email
    const result = model.setData('body', 0, 3, 'user@example.com');
    expect(result).toBe(true);
    expect(model.data('body', 0, 3)).toBe('user@example.com');
    expect(model.getError(0, 3)).toBeUndefined();
  });

  it('invalid email sets error', () => {
    const model = new EditableModel(42);
    const result = model.setData('body', 0, 3, 'not-an-email');
    expect(result).toBe(false);
    expect(model.getError(0, 3)).toBe('Invalid Email');
  });

  it('age boundary: 0 and 150 accepted', () => {
    const model = new EditableModel(42);
    // Column 4 = Age
    expect(model.setData('body', 0, 4, '0')).toBe(true);
    expect(model.setData('body', 1, 4, '150')).toBe(true);
  });

  it('age boundary: 151 and -1 rejected', () => {
    const model = new EditableModel(42);
    expect(model.setData('body', 0, 4, '151')).toBe(false);
    expect(model.getError(0, 4)).toBe('Invalid Age');
    expect(model.setData('body', 1, 4, '-1')).toBe(false);
    expect(model.getError(1, 4)).toBe('Invalid Age');
  });

  it('negative salary rejected', () => {
    const model = new EditableModel(42);
    // Column 5 = Salary
    expect(model.setData('body', 0, 5, '-100')).toBe(false);
    expect(model.getError(0, 5)).toBe('Invalid Salary');
  });

  it('date format validated', () => {
    const model = new EditableModel(42);
    // Column 7 = Start Date
    expect(model.setData('body', 0, 7, '2024-01-15')).toBe(true);
    expect(model.setData('body', 1, 7, '01/15/2024')).toBe(false);
    expect(model.getError(1, 7)).toBe('Invalid Start Date');
  });

  it('empty name rejected', () => {
    const model = new EditableModel(42);
    // Column 1 = First Name
    expect(model.setData('body', 0, 1, '')).toBe(false);
    expect(model.getError(0, 1)).toBe('Invalid First Name');
  });

  it('error cleared on subsequent valid edit', () => {
    const model = new EditableModel(42);
    // Set invalid then valid
    model.setData('body', 0, 3, 'bad');
    expect(model.getError(0, 3)).toBe('Invalid Email');
    model.setData('body', 0, 3, 'good@email.com');
    expect(model.getError(0, 3)).toBeUndefined();
  });

  it('isEdited and editCount track state', () => {
    const model = new EditableModel(42);
    expect(model.editCount).toBe(0);
    expect(model.isEdited(0, 1)).toBe(false);

    model.setData('body', 0, 1, 'NewName');
    expect(model.isEdited(0, 1)).toBe(true);
    expect(model.editCount).toBe(1);

    model.setData('body', 1, 1, 'Another');
    expect(model.editCount).toBe(2);
  });

  it('setData emits cells-changed with correct row/column/span', () => {
    const model = new EditableModel(42);
    const listener = vi.fn();
    model.changed.connect(listener);

    model.setData('body', 3, 1, 'Test');
    expect(listener).toHaveBeenCalled();
    const args = listener.mock.calls[0][1];
    expect(args.type).toBe('cells-changed');
    expect(args.region).toBe('body');
    expect(args.row).toBe(3);
    expect(args.column).toBe(1);
    expect(args.rowSpan).toBe(1);
    expect(args.columnSpan).toBe(1);
  });

  it('number type conversion for salary', () => {
    const model = new EditableModel(42);
    model.setData('body', 0, 5, '50000');
    const val = model.data('body', 0, 5);
    expect(typeof val).toBe('number');
    expect(val).toBe(50000);
  });

  it('metadata includes error and edited flags', () => {
    const model = new EditableModel(42);
    // Before edit
    let meta = model.metadata('body', 0, 1);
    expect(meta).toHaveProperty('editable', true);
    expect(meta).not.toHaveProperty('edited');
    expect(meta).not.toHaveProperty('error');

    // After valid edit
    model.setData('body', 0, 1, 'Updated');
    meta = model.metadata('body', 0, 1);
    expect(meta).toHaveProperty('edited', true);

    // After invalid edit
    model.setData('body', 1, 3, 'bad-email');
    meta = model.metadata('body', 1, 3);
    expect(meta).toHaveProperty('error', 'Invalid Email');
  });

  it('deterministic base values from seed', () => {
    const a = new EditableModel(42);
    const b = new EditableModel(42);
    for (let c = 0; c < 10; c++) {
      expect(a.data('body', 0, c)).toBe(b.data('body', 0, c));
    }
  });

  it('column headers match EDITABLE_COLUMNS names', () => {
    const model = new EditableModel(42);
    const expected = ['ID', 'First Name', 'Last Name', 'Email', 'Age', 'Salary', 'Department', 'Start Date', 'Status', 'Notes'];
    for (let c = 0; c < 10; c++) {
      expect(model.data('column-header', 0, c)).toBe(expected[c]);
    }
  });
});
