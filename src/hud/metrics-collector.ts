import { DataModel } from '@lumino/datagrid';

export class MetricsCollector {
  private _updateCount = 0;
  private _cellsChanged = 0;
  private _lastResetTime = performance.now();
  private _model: DataModel;
  private _slotRef: (sender: DataModel, args: DataModel.ChangedArgs) => void;

  constructor(model: DataModel) {
    this._model = model;
    this._slotRef = this._onModelChanged.bind(this);
    model.changed.connect(this._slotRef);
  }

  get updatesPerSecond(): number {
    const elapsed = (performance.now() - this._lastResetTime) / 1000;
    return elapsed > 0 ? this._updateCount / elapsed : 0;
  }

  get cellsPerSecond(): number {
    const elapsed = (performance.now() - this._lastResetTime) / 1000;
    return elapsed > 0 ? this._cellsChanged / elapsed : 0;
  }

  get totalUpdates(): number {
    return this._updateCount;
  }

  reset(): void {
    this._updateCount = 0;
    this._cellsChanged = 0;
    this._lastResetTime = performance.now();
  }

  dispose(): void {
    this._model.changed.disconnect(this._slotRef);
  }

  private _onModelChanged(_sender: DataModel, args: DataModel.ChangedArgs): void {
    this._updateCount++;
    if (args.type === 'cells-changed') {
      this._cellsChanged += (args.rowSpan ?? 1) * (args.columnSpan ?? 1);
    } else if (args.type === 'model-reset') {
      // For model-reset, estimate based on visible cells (approximation)
      this._cellsChanged += 1000;
    }
  }
}
