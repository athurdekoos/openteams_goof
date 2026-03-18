import { ISignal, Signal } from '@lumino/signaling';

interface TimerEntry {
  callback: () => void;
  baseInterval: number;
  interval: number;
  handle: ReturnType<typeof setInterval> | null;
}

export class TimerManager {
  private _timers = new Map<string, TimerEntry>();
  private _paused = false;
  private _pausedChanged = new Signal<this, boolean>(this);
  private _frequencyFactor = 1;

  get paused(): boolean {
    return this._paused;
  }

  get pausedChanged(): ISignal<this, boolean> {
    return this._pausedChanged;
  }

  register(id: string, callback: () => void, interval: number): void {
    this.unregister(id);
    const actualInterval = Math.max(16, Math.round(interval * this._frequencyFactor));
    const entry: TimerEntry = {
      callback,
      baseInterval: interval,
      interval: actualInterval,
      handle: null,
    };
    this._timers.set(id, entry);
    if (!this._paused) {
      entry.handle = setInterval(callback, actualInterval);
    }
  }

  unregister(id: string): void {
    const entry = this._timers.get(id);
    if (entry) {
      if (entry.handle !== null) clearInterval(entry.handle);
      this._timers.delete(id);
    }
  }

  pauseAll(): void {
    if (this._paused) return;
    this._paused = true;
    for (const entry of this._timers.values()) {
      if (entry.handle !== null) {
        clearInterval(entry.handle);
        entry.handle = null;
      }
    }
    this._pausedChanged.emit(true);
  }

  resumeAll(): void {
    if (!this._paused) return;
    this._paused = false;
    for (const entry of this._timers.values()) {
      entry.handle = setInterval(entry.callback, entry.interval);
    }
    this._pausedChanged.emit(false);
  }

  togglePause(): void {
    if (this._paused) this.resumeAll();
    else this.pauseAll();
  }

  setGlobalFrequency(factor: number): void {
    this._frequencyFactor = factor;
    for (const [, entry] of this._timers) {
      const newInterval = Math.max(16, Math.round(entry.baseInterval * factor));
      entry.interval = newInterval;
      if (entry.handle !== null) {
        clearInterval(entry.handle);
        entry.handle = setInterval(entry.callback, newInterval);
      }
    }
  }

  dispose(): void {
    for (const entry of this._timers.values()) {
      if (entry.handle !== null) clearInterval(entry.handle);
    }
    this._timers.clear();
    this._paused = false;
    this._frequencyFactor = 1;
  }
}
