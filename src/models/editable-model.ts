import { MutableDataModel, DataModel } from '@lumino/datagrid';
import { SeededPRNG } from '../prng';
import { EDITABLE_COLUMNS } from '../data/column-schemas';
import { FIRST_NAMES, LAST_NAMES, STATUSES } from '../data/word-lists';

const TOTAL_ROWS = 50;
const DEPARTMENTS = ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance', 'Legal', 'Support', 'Product'];

export class EditableModel extends MutableDataModel {
  private _seed: number;
  private _edits = new Map<string, any>();
  private _errors = new Map<string, string>();
  private _cache = new Map<number, any[]>();

  constructor(seed: number) {
    super();
    this._seed = seed;
  }

  rowCount(region: DataModel.RowRegion): number {
    return region === 'body' ? TOTAL_ROWS : 1;
  }

  columnCount(region: DataModel.ColumnRegion): number {
    return region === 'body' ? EDITABLE_COLUMNS.length : 1;
  }

  data(region: DataModel.CellRegion, row: number, column: number): any {
    if (region === 'column-header') {
      return EDITABLE_COLUMNS[column]?.name ?? '';
    }
    if (region === 'row-header') return `${row + 1}`;
    if (region === 'corner-header') return '';

    // Check edit overlay first
    const key = `${row}:${column}`;
    if (this._edits.has(key)) {
      return this._edits.get(key);
    }

    return this._getBaseValue(row, column);
  }

  metadata(region: DataModel.CellRegion, row: number, column: number): DataModel.Metadata {
    if (region !== 'body') return {};
    const col = EDITABLE_COLUMNS[column];
    const key = `${row}:${column}`;
    const result: any = {
      type: col?.type ?? 'string',
      editable: col?.editable ?? false,
    };
    if (this._errors.has(key)) {
      result.error = this._errors.get(key);
    }
    if (this._edits.has(key)) {
      result.edited = true;
    }
    return result;
  }

  setData(region: DataModel.CellRegion, row: number, column: number, value: any): boolean {
    if (region !== 'body') return false;
    const col = EDITABLE_COLUMNS[column];
    if (!col || !col.editable) return false;

    const key = `${row}:${column}`;
    const strValue = String(value);

    // Validate
    if (col.validator && !col.validator(strValue)) {
      this._errors.set(key, `Invalid ${col.name}`);
      this.emitChanged({
        type: 'cells-changed',
        region: 'body',
        row,
        column,
        rowSpan: 1,
        columnSpan: 1,
      });
      return false;
    }

    // Clear any previous error
    this._errors.delete(key);

    // Convert to appropriate type
    let finalValue: any = strValue;
    if (col.type === 'number') {
      finalValue = Number(strValue);
    }

    this._edits.set(key, finalValue);
    this.emitChanged({
      type: 'cells-changed',
      region: 'body',
      row,
      column,
      rowSpan: 1,
      columnSpan: 1,
    });
    return true;
  }

  getError(row: number, column: number): string | undefined {
    return this._errors.get(`${row}:${column}`);
  }

  isEdited(row: number, column: number): boolean {
    return this._edits.has(`${row}:${column}`);
  }

  get editCount(): number {
    return this._edits.size;
  }

  private _getBaseValue(row: number, column: number): any {
    let rowData = this._cache.get(row);
    if (!rowData) {
      rowData = this._generateRow(row);
      this._cache.set(row, rowData);
    }
    return rowData[column];
  }

  private _generateRow(row: number): any[] {
    const prng = SeededPRNG.forPosition(this._seed, row, 0);
    const firstName = prng.pick(FIRST_NAMES);
    const lastName = prng.pick(LAST_NAMES);
    return [
      row + 1,                                    // ID
      firstName,                                  // First Name
      lastName,                                   // Last Name
      `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.fake`, // Email
      prng.nextInt(20, 65),                       // Age
      Math.round(prng.next() * 150000) / 100,     // Salary
      prng.pick(DEPARTMENTS),                     // Department
      `${prng.nextInt(2018, 2026)}-${String(prng.nextInt(1, 13)).padStart(2, '0')}-${String(prng.nextInt(1, 29)).padStart(2, '0')}`, // Start Date
      prng.pick(STATUSES),                        // Status
      '',                                         // Notes
    ];
  }
}
