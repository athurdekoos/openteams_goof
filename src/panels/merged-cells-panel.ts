import { TextRenderer, CellRenderer } from '@lumino/datagrid';
import { GridPanel } from './grid-panel';
import { MergedCellsModel } from '../models/merged-cells-model';

export function createMergedCellsPanel(seed: number): GridPanel {
  const model = new MergedCellsModel(seed);

  const renderer = new TextRenderer({
    font: '11px "SF Mono", "Fira Code", Consolas, monospace',
    textColor: (config: CellRenderer.CellConfig) => {
      const val = String(config.value);
      return val.startsWith('M[') ? '#2563eb' : '#1a1a1a';
    },
    backgroundColor: (config: CellRenderer.CellConfig) => {
      const val = String(config.value);
      if (val.startsWith('M[')) return '#dbeafe';
      return config.row % 2 === 0 ? '#ffffff' : '#f8fafc';
    },
    horizontalAlignment: 'center',
    verticalAlignment: 'center',
  });

  const panel = new GridPanel({
    id: 'merged-cells',
    title: 'Merged Cells',
    description: 'Deterministic merge regions generated on a stride-3 grid. Blue cells indicate merge origins with span dimensions.',
    model,
    defaultRenderer: renderer,
  });

  panel.setStatus(`500×500 grid | ${model.mergeCount} merge regions`);
  return panel;
}
