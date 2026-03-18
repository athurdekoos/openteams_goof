import { FpsSampler } from './fps-sampler';
import { MetricsCollector } from './metrics-collector';
import { HudOverlay } from './hud-overlay';
import { GridPanel } from '../panels/grid-panel';
import { TimerManager } from '../timer-manager';

interface GridRegistration {
  panel: GridPanel;
  collector: MetricsCollector;
}

export class HudManager {
  private _overlay: HudOverlay;
  private _fpsSampler: FpsSampler;
  private _registrations: GridRegistration[] = [];
  private _timerManager: TimerManager;
  private _updateHandle: ReturnType<typeof setInterval> | null = null;
  private _updateInterval: number;

  constructor(timerManager: TimerManager, updateInterval = 500) {
    this._timerManager = timerManager;
    this._updateInterval = updateInterval;
    this._overlay = new HudOverlay();
    this._fpsSampler = new FpsSampler();
  }

  get overlay(): HudOverlay {
    return this._overlay;
  }

  get visible(): boolean {
    return this._overlay.visible;
  }

  registerGrid(panel: GridPanel): void {
    const collector = new MetricsCollector(panel.model);
    this._registrations.push({ panel, collector });
  }

  show(): void {
    this._overlay.visible = true;
    this._fpsSampler.start();
    this._startUpdating();
  }

  hide(): void {
    this._overlay.visible = false;
    this._fpsSampler.stop();
    this._stopUpdating();
  }

  toggle(): void {
    if (this._overlay.visible) {
      this.hide();
    } else {
      this.show();
    }
  }

  attachTo(container: HTMLElement): void {
    container.style.position = 'relative';
    container.appendChild(this._overlay.node);
  }

  dispose(): void {
    this._stopUpdating();
    this._fpsSampler.stop();
    for (const reg of this._registrations) {
      reg.collector.dispose();
    }
    this._registrations = [];
  }

  private _startUpdating(): void {
    if (this._updateHandle) return;
    this._updateHandle = setInterval(() => this._update(), this._updateInterval);
  }

  private _stopUpdating(): void {
    if (this._updateHandle) {
      clearInterval(this._updateHandle);
      this._updateHandle = null;
    }
  }

  private _update(): void {
    // FPS
    this._overlay.setValue('FPS', this._fpsSampler.fps.toFixed(1));

    // Aggregate metrics from all registered grids
    let totalUPS = 0;
    let totalCPS = 0;
    let totalVirtualRows = 0;
    let totalVirtualCols = 0;

    for (const reg of this._registrations) {
      totalUPS += reg.collector.updatesPerSecond;
      totalCPS += reg.collector.cellsPerSecond;
      totalVirtualRows += reg.panel.model.rowCount('body');
      totalVirtualCols = Math.max(totalVirtualCols, reg.panel.model.columnCount('body'));
    }

    this._overlay.setValue('UPS', totalUPS.toFixed(1));
    this._overlay.setValue('Cells/s', this._formatNumber(totalCPS));
    this._overlay.setValue('Virtual', this._formatLarge(totalVirtualRows) + ' rows');
    this._overlay.setValue('Visible', `${this._registrations.length} grids`);
    this._overlay.setValue('Timer', this._timerManager.paused ? 'PAUSED' : 'RUNNING');
  }

  private _formatNumber(n: number): string {
    if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
    if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
    return n.toFixed(0);
  }

  private _formatLarge(n: number): string {
    if (n >= 1e12) return (n / 1e12).toFixed(0) + 'T';
    if (n >= 1e9) return (n / 1e9).toFixed(0) + 'B';
    if (n >= 1e6) return (n / 1e6).toFixed(0) + 'M';
    if (n >= 1e3) return (n / 1e3).toFixed(0) + 'K';
    return n.toFixed(0);
  }
}
