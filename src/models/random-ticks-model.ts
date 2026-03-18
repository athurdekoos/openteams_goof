import { DataModel } from '@lumino/datagrid';
import { BaseLiveModel } from './base-live-model';
import { SeededPRNG } from '../prng';
import { TimerManager } from '../timer-manager';

export class RandomTicksModel extends BaseLiveModel {
  private _data: Float64Array;
  private _rows: number;
  private _cols: number;
  private _prng: SeededPRNG;
  private _updateCount = 0;
  private _cellsPerTick: number;

  constructor(
    timerManager: TimerManager,
    timerId: string,
    seed: number,
    rows: number,
    cols: number,
    interval = 60,
    cellsPerTick = 50
  ) {
    super(timerManager, timerId, interval);
    this._rows = rows;
    this._cols = cols;
    this._cellsPerTick = cellsPerTick;
    this._prng = new SeededPRNG(seed);
    this._data = new Float64Array(rows * cols);
    // Initialize
    for (let i = 0; i < this._data.length; i++) {
      this._data[i] = this._prng.next();
    }
  }

  rowCount(region: DataModel.RowRegion): number {
    return region === 'body' ? this._rows : 1;
  }

  columnCount(region: DataModel.ColumnRegion): number {
    return region === 'body' ? this._cols : 1;
  }

  data(region: DataModel.CellRegion, row: number, column: number): any {
    if (region === 'column-header') return `C${column}`;
    if (region === 'row-header') return `${row}`;
    if (region === 'corner-header') return '';
    const idx = row * this._cols + column;
    if (idx < 0 || idx >= this._data.length) return 0;
    return this._data[idx];
  }

  get updateCount(): number { return this._updateCount; }
  get totalCells(): number { return this._rows * this._cols; }
  get cellsPerTick(): number { return this._cellsPerTick; }

  protected tick(): void {
    this._updateCount++;
    // Mutate random cells and track bounding region
    let minRow = this._rows;
    let maxRow = 0;
    let minCol = this._cols;
    let maxCol = 0;
    for (let i = 0; i < this._cellsPerTick; i++) {
      const idx = this._prng.nextInt(0, this._data.length);
      this._data[idx] = this._prng.next();
      const row = Math.floor(idx / this._cols);
      const col = idx % this._cols;
      if (row < minRow) minRow = row;
      if (row > maxRow) maxRow = row;
      if (col < minCol) minCol = col;
      if (col > maxCol) maxCol = col;
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
