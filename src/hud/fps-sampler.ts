export class FpsSampler {
  private _buffer: Float64Array;
  private _index = 0;
  private _count = 0;
  private _lastTime = 0;
  private _handle: number | null = null;
  private _running = false;

  constructor(bufferSize = 60) {
    this._buffer = new Float64Array(bufferSize);
  }

  start(): void {
    if (this._running) return;
    this._running = true;
    this._lastTime = performance.now();
    this._tick();
  }

  stop(): void {
    this._running = false;
    if (this._handle !== null) {
      cancelAnimationFrame(this._handle);
      this._handle = null;
    }
  }

  get fps(): number {
    if (this._count === 0) return 0;
    const n = Math.min(this._count, this._buffer.length);
    let sum = 0;
    for (let i = 0; i < n; i++) {
      sum += this._buffer[i];
    }
    const avgDelta = sum / n;
    return avgDelta > 0 ? 1000 / avgDelta : 0;
  }

  get isRunning(): boolean {
    return this._running;
  }

  private _tick = (): void => {
    if (!this._running) return;
    const now = performance.now();
    const delta = now - this._lastTime;
    this._lastTime = now;

    this._buffer[this._index] = delta;
    this._index = (this._index + 1) % this._buffer.length;
    this._count++;

    this._handle = requestAnimationFrame(this._tick);
  };
}
