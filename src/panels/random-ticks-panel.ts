import { GridPanel } from './grid-panel';
import { RandomTicksModel } from '../models/random-ticks-model';
import { HeatMapRenderer } from '../renderers/heat-map-renderer';
import { NumericRenderer } from '../renderers/numeric-renderer';
import { TimerManager } from '../timer-manager';

export function createRandomTicksPanel(
  timerManager: TimerManager,
  seed: number,
  variant: 'numeric' | 'heatmap'
): GridPanel {
  const isHeatmap = variant === 'heatmap';
  const rows = isHeatmap ? 500 : 200;
  const cols = isHeatmap ? 30 : 20;
  const timerId = isHeatmap ? 'random-ticks-2' : 'random-ticks-1';
  const title = isHeatmap ? 'Random Ticks (Heat Map)' : 'Random Ticks (Numeric)';
  const id = isHeatmap ? 'random-ticks-2' : 'random-ticks-1';

  const model = new RandomTicksModel(timerManager, timerId, seed + (isHeatmap ? 1 : 0), rows, cols, 60, 50);

  const renderer = isHeatmap ? new HeatMapRenderer() : new NumericRenderer();

  const panel = new GridPanel({
    id,
    title,
    description: isHeatmap
      ? 'Rapid cell mutations with viridis heat-map rendering. Each cell value maps to a color gradient.'
      : 'Rapid cell mutations with color-coded numeric rendering. Red = mid range, green = high values.',
    model,
    defaultRenderer: renderer as any,
  });

  model.start();
  panel.setStatusBadge('running');

  // Update status
  setInterval(() => {
    panel.setStatus(`${rows}×${cols} | Updates: ${model.updateCount} | ${model.cellsPerTick} cells/tick`);
  }, 500);

  timerManager.pausedChanged.connect((_, paused) => {
    panel.setStatusBadge(paused ? 'paused' : 'running');
  });

  return panel;
}
