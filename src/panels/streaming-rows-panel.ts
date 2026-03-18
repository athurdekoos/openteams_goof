import { TextRenderer } from '@lumino/datagrid';
import { GridPanel } from './grid-panel';
import { StreamingRowsModel } from '../models/streaming-rows-model';
import { TimerManager } from '../timer-manager';
import { themeAwareTextColor } from '../theme';

export function createStreamingRowsPanel(timerManager: TimerManager, seed: number): GridPanel {
  const model = new StreamingRowsModel(timerManager, seed, 200);

  const renderer = new TextRenderer({
    font: '12px "SF Mono", "Fira Code", Consolas, monospace',
    textColor: () => themeAwareTextColor(),
    backgroundColor: '',
    horizontalAlignment: 'right',
    verticalAlignment: 'center',
  });

  const panel = new GridPanel({
    id: 'streaming-rows',
    title: 'Streaming Rows',
    description: 'Rows are inserted and removed by a timer. Watch the row count change in the status bar.',
    model,
    defaultRenderer: renderer,
  });

  model.start();
  panel.setStatusBadge('running');

  // Update status periodically
  const statusInterval = setInterval(() => {
    const rows = model.rowCount('body');
    panel.setStatus(`Rows: ${rows} | Updates: ${model.updateCount}`);
  }, 500);

  // Listen for pause/resume
  timerManager.pausedChanged.connect((_, paused) => {
    panel.setStatusBadge(paused ? 'paused' : 'running');
  });

  return panel;
}
