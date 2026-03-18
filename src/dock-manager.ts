import { DockPanel, Widget } from '@lumino/widgets';
import { JSONValue } from '@lumino/coreutils';
import { SeededPRNG } from './prng';
import { TimerManager } from './timer-manager';
import { createExtremeVirtualizationPanel } from './panels/extreme-virtualization-panel';
import { createStreamingRowsPanel } from './panels/streaming-rows-panel';
import { createRandomTicksPanel } from './panels/random-ticks-panel';
import { createStructuredRecordsPanel } from './panels/structured-records-panel';
import { createEditableGridPanel } from './panels/editable-grid-panel';
import { createCopyPanel } from './panels/copy-panel';
import { createMergedCellsPanel } from './panels/merged-cells-panel';
import { GridPanel } from './panels/grid-panel';

export class DockManager {
  private _dock: DockPanel;
  private _panels = new Map<string, GridPanel>();
  private _seed: number;
  private _timerManager: TimerManager;

  constructor(dock: DockPanel, seed: number, timerManager: TimerManager) {
    this._dock = dock;
    this._seed = seed;
    this._timerManager = timerManager;
  }

  get panels(): Map<string, GridPanel> {
    return this._panels;
  }

  createAllPanels(): void {
    const s = this._seed;
    const tm = this._timerManager;

    this._panels.set('extreme-virtualization', createExtremeVirtualizationPanel(s));
    this._panels.set('streaming-rows', createStreamingRowsPanel(tm, s + 100));
    this._panels.set('random-ticks-1', createRandomTicksPanel(tm, s + 200, 'numeric'));
    this._panels.set('random-ticks-2', createRandomTicksPanel(tm, s + 300, 'heatmap'));
    this._panels.set('structured-records', createStructuredRecordsPanel(s + 400));
    this._panels.set('editable-grid', createEditableGridPanel(s + 500));
    this._panels.set('copy-grid', createCopyPanel(s + 600));
    this._panels.set('merged-cells', createMergedCellsPanel(s + 700));
  }

  buildDefaultLayout(): void {
    const p = this._panels;

    // Clear existing layout
    const widgets: Widget[] = [];
    for (const widget of this._dock.widgets()) {
      widgets.push(widget);
    }
    for (const widget of widgets) {
      widget.parent = null;
    }

    // 2x2 split with tabbed panels
    // Top-left: Extreme Virtualization (first tab) + Structured Records (tabbed)
    const ev = p.get('extreme-virtualization')!;
    const sr = p.get('structured-records')!;
    this._dock.addWidget(ev);
    this._dock.addWidget(sr, { mode: 'tab-after', ref: ev });

    // Top-right: Streaming Rows (first tab) + Editable Grid (tabbed)
    const stream = p.get('streaming-rows')!;
    const edit = p.get('editable-grid')!;
    this._dock.addWidget(stream, { mode: 'split-right', ref: ev });
    this._dock.addWidget(edit, { mode: 'tab-after', ref: stream });

    // Bottom-left: Random Ticks 1 (first tab) + Copy (tabbed)
    const ticks1 = p.get('random-ticks-1')!;
    const copy = p.get('copy-grid')!;
    this._dock.addWidget(ticks1, { mode: 'split-bottom', ref: ev });
    this._dock.addWidget(copy, { mode: 'tab-after', ref: ticks1 });

    // Bottom-right: Random Ticks 2 (first tab) + Merged Cells (tabbed)
    const ticks2 = p.get('random-ticks-2')!;
    const merged = p.get('merged-cells')!;
    this._dock.addWidget(ticks2, { mode: 'split-right', ref: ticks1 });
    this._dock.addWidget(merged, { mode: 'tab-after', ref: ticks2 });
  }

  getPanel(id: string): GridPanel | undefined {
    return this._panels.get(id);
  }

  saveLayout(): JSONValue {
    const layout = this._dock.saveLayout();
    return this._serializeLayout(layout);
  }

  restoreLayout(config: JSONValue): boolean {
    try {
      const layout = this._deserializeLayout(config);
      if (layout) {
        this._dock.restoreLayout(layout);
        return true;
      }
    } catch (e) {
      console.warn('Failed to restore layout:', e);
    }
    return false;
  }

  private _serializeLayout(layout: DockPanel.ILayoutConfig): JSONValue {
    return JSON.parse(JSON.stringify(layout, (key, value) => {
      if (key === 'widgets' && Array.isArray(value)) {
        return value.map((w: Widget | null) => (w && w.id) ? w.id : null);
      }
      return value;
    }));
  }

  private _deserializeLayout(config: JSONValue): DockPanel.ILayoutConfig | null {
    if (!config) return null;
    const resolved = JSON.parse(JSON.stringify(config), (key, value) => {
      if (key === 'widgets' && Array.isArray(value)) {
        return value.map((id: string) => {
          if (typeof id === 'string') {
            return this._panels.get(id) || null;
          }
          return null;
        });
      }
      return value;
    });
    return resolved;
  }
}
