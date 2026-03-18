import { DataModel } from '@lumino/datagrid';
import { SeededPRNG } from '../prng';
import { genRecord, RecordRow } from '../data/generators';
import { RECORD_COLUMNS } from '../data/column-schemas';

const TOTAL_ROWS = 10_000;
const CACHE_SIZE = 5000;

export class StructuredRecordsModel extends DataModel {
  private _seed: number;
  private _cache = new Map<number, RecordRow>();
  private _accessOrder: number[] = [];

  constructor(seed: number) {
    super();
    this._seed = seed;
  }

  rowCount(region: DataModel.RowRegion): number {
    return region === 'body' ? TOTAL_ROWS : 1;
  }

  columnCount(region: DataModel.ColumnRegion): number {
    return region === 'body' ? RECORD_COLUMNS.length : 1;
  }

  data(region: DataModel.CellRegion, row: number, column: number): any {
    if (region === 'column-header') {
      return RECORD_COLUMNS[column]?.name ?? '';
    }
    if (region === 'row-header') return `${row + 1}`;
    if (region === 'corner-header') return '';

    const record = this._getRecord(row);
    const col = RECORD_COLUMNS[column];
    if (!col) return '';
    const key = col.name.toLowerCase().replace(/\s+/g, '') as keyof RecordRow;
    // Map column names to record keys
    switch (column) {
      case 0: return record.id;
      case 1: return record.name;
      case 2: return record.company;
      case 3: return record.email;
      case 4: return record.status;
      case 5: return record.category;
      case 6: return record.price;
      case 7: return record.date;
      case 8: return record.image;
      case 9: return record.website;
      default: return '';
    }
  }

  metadata(region: DataModel.CellRegion, row: number, column: number): DataModel.Metadata {
    if (region !== 'body') return {};
    const col = RECORD_COLUMNS[column];
    return col ? { type: col.type } : {};
  }

  private _getRecord(row: number): RecordRow {
    let record = this._cache.get(row);
    if (record) {
      // Move to end of access order
      const idx = this._accessOrder.indexOf(row);
      if (idx !== -1) this._accessOrder.splice(idx, 1);
      this._accessOrder.push(row);
      return record;
    }

    // Generate
    const prng = SeededPRNG.forPosition(this._seed, row, 0);
    record = genRecord(prng, row + 1);
    this._cache.set(row, record);
    this._accessOrder.push(row);

    // Evict if over capacity
    while (this._cache.size > CACHE_SIZE) {
      const evict = this._accessOrder.shift()!;
      this._cache.delete(evict);
    }

    return record;
  }
}
