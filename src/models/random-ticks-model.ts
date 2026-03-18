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
    return this._data[row * this._cols + column];
  }

  get updateCount(): number { return this._updateCount; }
  get totalCells(): number { return this._rows * this._cols; }
  get cellsPerTick(): number { return this._cellsPerTick; }

  protected tick(): void {
    this._updateCount++;
    // Mutate random cells
    for (let i = 0; i < this._cellsPerTick; i++) {
      const idx = this._prng.nextInt(0, this._data.length);
      this._data[idx] = this._prng.next();
    }
    this.emitChanged({ type: 'model-reset' });
  }
}
