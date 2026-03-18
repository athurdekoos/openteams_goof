import { DataModel } from '@lumino/datagrid';
import { SeededPRNG } from '../prng';

const TRILLION = 1_000_000_000_000;

export class ExtremeVirtualizationModel extends DataModel {
  private _seed: number;
  private _rowCount: number;
  private _colCount: number;

  constructor(seed: number, rowCount = TRILLION, colCount = TRILLION) {
    super();
    this._seed = seed;
    this._rowCount = rowCount;
    this._colCount = colCount;
  }

  rowCount(region: DataModel.RowRegion): number {
    return region === 'body' ? this._rowCount : 1;
  }

  columnCount(region: DataModel.ColumnRegion): number {
    return region === 'body' ? this._colCount : 1;
  }

  data(region: DataModel.CellRegion, row: number, column: number): any {
    if (region === 'column-header') {
      return `Col ${column.toLocaleString()}`;
    }
    if (region === 'row-header') {
      return `${row.toLocaleString()}`;
    }
    if (region === 'corner-header') {
      return '';
    }
    // Body cell: O(1) positional hash
    const val = SeededPRNG.positionalHash(this._seed, row, column);
    return (val * 10000).toFixed(2);
  }

  set seed(s: number) {
    this._seed = s;
    this.emitChanged({ type: 'model-reset' });
  }
}
