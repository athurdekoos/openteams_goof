import { DataModel } from '@lumino/datagrid';
import { TimerManager } from '../timer-manager';

export abstract class BaseLiveModel extends DataModel {
  protected _timerManager: TimerManager;
  protected _timerId: string;
  protected _interval: number;

  constructor(timerManager: TimerManager, timerId: string, interval: number) {
    super();
    this._timerManager = timerManager;
    this._timerId = timerId;
    this._interval = interval;
  }

  start(): void {
    this._timerManager.register(this._timerId, () => this.tick(), this._interval);
  }

  stop(): void {
    this._timerManager.unregister(this._timerId);
  }

  protected abstract tick(): void;
}
