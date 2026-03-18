import { TextRenderer } from '@lumino/datagrid';
import { GridPanel } from './grid-panel';
import { ExtremeVirtualizationModel } from '../models/extreme-virtualization-model';
import { themeAwareTextColor } from '../theme';

export function createExtremeVirtualizationPanel(seed: number): GridPanel {
  const model = new ExtremeVirtualizationModel(seed);

  const renderer = new TextRenderer({
    font: '12px "SF Mono", "Fira Code", Consolas, monospace',
    textColor: () => themeAwareTextColor(),
    backgroundColor: '',
    horizontalAlignment: 'right',
    verticalAlignment: 'center',
  });

  const panel = new GridPanel({
    id: 'extreme-virtualization',
    title: 'Extreme Virtualization',
    description: 'Trillion-row \u00d7 trillion-column grid. Data is computed on-the-fly via positional hashing \u2014 no materialization. Scroll anywhere.',
    model,
    defaultRenderer: renderer,
  });

  panel.setStatus(`Rows: 1T \u00d7 Cols: 1T | Seed: ${seed}`);
  return panel;
}
