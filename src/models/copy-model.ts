import { DataModel } from '@lumino/datagrid';
import { SeededPRNG } from '../prng';

const ROWS = 100;
const COLS = 10;

const COL_NAMES = ['Product', 'Region', 'Q1 Sales', 'Q2 Sales', 'Q3 Sales', 'Q4 Sales', 'Total', 'Growth %', 'Target', 'Status'];

const PRODUCTS = ['Widget A', 'Widget B', 'Gadget X', 'Gadget Y', 'Tool Alpha', 'Tool Beta', 'Device Pro', 'Device Lite', 'Service Plus', 'Service Basic'];
const REGIONS = ['North', 'South', 'East', 'West', 'Central', 'International'];
const COPY_STATUSES = ['On Track', 'At Risk', 'Behind', 'Exceeded', 'New'];

export class CopyModel extends DataModel {
  private _data: string[][];

  constructor(seed: number) {
    super();
    const prng = new SeededPRNG(seed);
    this._data = [];

    for (let r = 0; r < ROWS; r++) {
      const row: string[] = [];
      const product = prng.pick(PRODUCTS);
      const region = prng.pick(REGIONS);
      const q1 = Math.round(prng.next() * 50000);
      const q2 = Math.round(prng.next() * 50000);
      const q3 = Math.round(prng.next() * 50000);
      const q4 = Math.round(prng.next() * 50000);
      const total = q1 + q2 + q3 + q4;
      const growth = ((prng.next() * 40) - 10).toFixed(1);
      const target = Math.round(total * (0.8 + prng.next() * 0.4));

      row.push(product);          // Product
      row.push(region);           // Region
      row.push(String(q1));           // Q1
      row.push(String(q2));           // Q2
      row.push(String(q3));           // Q3
      row.push(String(q4));           // Q4
      row.push(String(total));        // Total
      row.push(`${growth}%`);     // Growth
      row.push(String(target));       // Target
      row.push(prng.pick(COPY_STATUSES)); // Status

      this._data.push(row);
    }
  }

  rowCount(region: DataModel.RowRegion): number {
    return region === 'body' ? ROWS : 1;
  }

  columnCount(region: DataModel.ColumnRegion): number {
    return region === 'body' ? COLS : 1;
  }

  data(region: DataModel.CellRegion, row: number, column: number): any {
    if (region === 'column-header') return COL_NAMES[column] ?? '';
    if (region === 'row-header') return `${row + 1}`;
    if (region === 'corner-header') return '';
    return this._data[row]?.[column] ?? '';
  }
}
