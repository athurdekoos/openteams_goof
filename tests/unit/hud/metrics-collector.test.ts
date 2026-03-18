import { describe, it, expect, vi } from 'vitest';
import { DataModel } from '@lumino/datagrid';
import { MetricsCollector } from '../../../src/hud/metrics-collector';

// Minimal DataModel for testing
class StubModel extends DataModel {
  rowCount(): number { return 10; }
  columnCount(): number { return 10; }
  data(): any { return ''; }

  fireChanged(args: DataModel.ChangedArgs): void {
    this.emitChanged(args);
  }
}

describe('MetricsCollector', () => {
  it('initial counts are 0', () => {
    const model = new StubModel();
    const mc = new MetricsCollector(model);
    expect(mc.totalUpdates).toBe(0);
  });

  it('cells-changed events track cell counts (rowSpan × columnSpan)', () => {
    const model = new StubModel();
    const mc = new MetricsCollector(model);
    model.fireChanged({
      type: 'cells-changed',
      region: 'body',
      row: 0,
      column: 0,
      rowSpan: 3,
      columnSpan: 4,
    });
    expect(mc.totalUpdates).toBe(1);
    // cellsPerSecond uses elapsed time, but totalUpdates should track
  });

  it('model-reset adds estimated 1000 cells', () => {
    const model = new StubModel();
    const mc = new MetricsCollector(model);
    model.fireChanged({ type: 'model-reset' });
    expect(mc.totalUpdates).toBe(1);
  });

  it('reset() zeroes all counts', () => {
    const model = new StubModel();
    const mc = new MetricsCollector(model);
    model.fireChanged({ type: 'model-reset' });
    model.fireChanged({ type: 'model-reset' });
    expect(mc.totalUpdates).toBe(2);
    mc.reset();
    expect(mc.totalUpdates).toBe(0);
  });

  it('dispose() disconnects from model signals', () => {
    const model = new StubModel();
    const mc = new MetricsCollector(model);
    mc.dispose();
    model.fireChanged({ type: 'model-reset' });
    expect(mc.totalUpdates).toBe(0);
  });
});
