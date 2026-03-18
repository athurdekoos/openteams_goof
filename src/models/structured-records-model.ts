import { DataModel } from '@lumino/datagrid';
import { SeededPRNG } from '../prng';
import { genRecord, RecordRow } from '../data/generators';
import { RECORD_COLUMNS } from '../data/column-schemas';

const TOTAL_ROWS = 10_000;
const CACHE_SIZE = 5000;

export class StructuredRecordsModel extends DataModel {
  private _seed: number;
  private _cache = new Map<number, RecordRow>();
  private _accessOrder = new Map<number, number>();
  private _accessSeq = 0;

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
      // Update access order (O(1))
      this._accessOrder.set(row, ++this._accessSeq);
      return record;
    }

    // Generate
    const prng = SeededPRNG.forPosition(this._seed, row, 0);
    record = genRecord(prng, row + 1);
    this._cache.set(row, record);
    this._accessOrder.set(row, ++this._accessSeq);

    // Evict if over capacity
    while (this._cache.size > CACHE_SIZE) {
      let oldestRow = -1;
      let oldestSeq = Infinity;
      for (const [r, seq] of this._accessOrder) {
        if (seq < oldestSeq) {
          oldestSeq = seq;
          oldestRow = r;
        }
      }
      if (oldestRow !== -1) {
        this._cache.delete(oldestRow);
        this._accessOrder.delete(oldestRow);
      }
    }

    return record;
  }
}
