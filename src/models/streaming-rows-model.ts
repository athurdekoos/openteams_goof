import { DataModel } from '@lumino/datagrid';
import { BaseLiveModel } from './base-live-model';
import { SeededPRNG } from '../prng';
import { TimerManager } from '../timer-manager';

const MAX_ROWS = 500;
const MIN_ROWS = 4;
const NUM_COLS = 50;

export class StreamingRowsModel extends BaseLiveModel {
  private _rows: Float64Array[];
  private _prng: SeededPRNG;
  private _updateCount = 0;

  constructor(timerManager: TimerManager, seed: number, interval = 200) {
    super(timerManager, 'streaming-rows', interval);
    this._prng = new SeededPRNG(seed);
    this._rows = [];
    // Seed initial rows
    for (let i = 0; i < 50; i++) {
      this._rows.push(this._generateRow());
    }
  }

  private _generateRow(): Float64Array {
    const row = new Float64Array(NUM_COLS);
    for (let i = 0; i < NUM_COLS; i++) {
      row[i] = this._prng.next() * 1000;
    }
    return row;
  }

  rowCount(region: DataModel.RowRegion): number {
    return region === 'body' ? this._rows.length : 1;
  }

  columnCount(region: DataModel.ColumnRegion): number {
    return region === 'body' ? NUM_COLS : 1;
  }

  data(region: DataModel.CellRegion, row: number, column: number): any {
    if (region === 'column-header') return `C${column}`;
    if (region === 'row-header') return `${row}`;
    if (region === 'corner-header') return '';
    if (row >= this._rows.length) return '';
    return this._rows[row][column].toFixed(2);
  }

  get updateCount(): number { return this._updateCount; }

  protected tick(): void {
    this._updateCount++;
    const action = this._prng.next();

    if (action < 0.4 && this._rows.length < MAX_ROWS) {
      // Insert 1-3 rows at a random position
      const count = this._prng.nextInt(1, 4);
      const index = this._prng.nextInt(0, this._rows.length + 1);
      const newRows: Float64Array[] = [];
      for (let i = 0; i < count; i++) {
        newRows.push(this._generateRow());
      }
      this._rows.splice(index, 0, ...newRows);
      this.emitChanged({
        type: 'rows-inserted',
        region: 'body',
        index,
        span: count,
      });
    } else if (action < 0.8 && this._rows.length > MIN_ROWS) {
      // Remove 1-2 rows
      const count = Math.min(this._prng.nextInt(1, 3), this._rows.length - MIN_ROWS);
      const index = this._prng.nextInt(0, this._rows.length - count + 1);
      this._rows.splice(index, count);
      this.emitChanged({
        type: 'rows-removed',
        region: 'body',
        index,
        span: count,
      });
    } else {
      // Mutate a few cells and track bounding region
      const mutations = this._prng.nextInt(1, 6);
      let minRow = this._rows.length;
      let maxRow = 0;
      let minCol = NUM_COLS;
      let maxCol = 0;
      for (let i = 0; i < mutations; i++) {
        const r = this._prng.nextInt(0, this._rows.length);
        const c = this._prng.nextInt(0, NUM_COLS);
        this._rows[r][c] = this._prng.next() * 1000;
        if (r < minRow) minRow = r;
        if (r > maxRow) maxRow = r;
        if (c < minCol) minCol = c;
        if (c > maxCol) maxCol = c;
      }
      this.emitChanged({
        type: 'cells-changed',
        region: 'body',
        row: minRow,
        column: minCol,
        rowSpan: maxRow - minRow + 1,
        columnSpan: maxCol - minCol + 1,
      });
    }
  }
}
