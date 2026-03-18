import { DataModel } from '@lumino/datagrid';
import { CellGroup } from '@lumino/datagrid';
import { SeededPRNG } from '../prng';

const ROWS = 500;
const COLS = 500;

interface MergeRegion {
  row: number;
  column: number;
  rowSpan: number;
  columnSpan: number;
}

export class MergedCellsModel extends DataModel {
  private _seed: number;
  private _mergeRegions: MergeRegion[] = [];
  private _mergeMap = new Map<string, MergeRegion>();

  constructor(seed: number) {
    super();
    this._seed = seed;
    this._generateMergeRegions();
  }

  rowCount(region: DataModel.RowRegion): number {
    return region === 'body' ? ROWS : 1;
  }

  columnCount(region: DataModel.ColumnRegion): number {
    return region === 'body' ? COLS : 1;
  }

  data(region: DataModel.CellRegion, row: number, column: number): any {
    if (region === 'column-header') return `C${column}`;
    if (region === 'row-header') return `${row}`;
    if (region === 'corner-header') return '';

    // Check if this cell is part of a merge region
    const merge = this._mergeMap.get(`${row}:${column}`);
    if (merge && merge.row === row && merge.column === column) {
      // Origin cell of merge
      return `M[${merge.rowSpan}×${merge.columnSpan}]`;
    }

    const val = SeededPRNG.positionalHash(this._seed, row, column);
    return (val * 100).toFixed(1);
  }

  groupCount(region: DataModel.CellRegion): number {
    if (region !== 'body') return 0;
    return this._mergeRegions.length;
  }

  group(region: DataModel.CellRegion, groupIndex: number): CellGroup | null {
    if (region !== 'body') return null;
    const merge = this._mergeRegions[groupIndex];
    if (!merge) return null;
    return {
      r1: merge.row,
      c1: merge.column,
      r2: merge.row + merge.rowSpan - 1,
      c2: merge.column + merge.columnSpan - 1,
    };
  }

  get mergeCount(): number {
    return this._mergeRegions.length;
  }

  private _generateMergeRegions(): void {
    const prng = new SeededPRNG(this._seed);
    const occupied = new Set<string>();

    // Walk a stride-3 grid and probabilistically create merges
    for (let r = 0; r < ROWS - 3; r += 3) {
      for (let c = 0; c < COLS - 3; c += 3) {
        if (prng.next() < 0.15) {
          // Create a merge region
          const rowSpan = prng.nextInt(2, 5);
          const colSpan = prng.nextInt(2, 5);
          const maxR = Math.min(r + rowSpan, ROWS);
          const maxC = Math.min(c + colSpan, COLS);
          const actualRowSpan = maxR - r;
          const actualColSpan = maxC - c;

          // Check no overlap
          let overlap = false;
          for (let dr = 0; dr < actualRowSpan && !overlap; dr++) {
            for (let dc = 0; dc < actualColSpan && !overlap; dc++) {
              if (occupied.has(`${r + dr}:${c + dc}`)) {
                overlap = true;
              }
            }
          }

          if (!overlap) {
            const merge: MergeRegion = {
              row: r,
              column: c,
              rowSpan: actualRowSpan,
              columnSpan: actualColSpan,
            };
            this._mergeRegions.push(merge);

            // Mark cells as occupied
            for (let dr = 0; dr < actualRowSpan; dr++) {
              for (let dc = 0; dc < actualColSpan; dc++) {
                const key = `${r + dr}:${c + dc}`;
                occupied.add(key);
                this._mergeMap.set(key, merge);
              }
            }
          }
        }
      }
    }
  }
}
