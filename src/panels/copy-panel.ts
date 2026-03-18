import { TextRenderer, CellRenderer, DataGrid } from '@lumino/datagrid';
import { GridPanel } from './grid-panel';
import { CopyModel } from '../models/copy-model';
import { themeAwareTextColor } from '../theme';

export function createCopyPanel(seed: number): GridPanel {
  const model = new CopyModel(seed);

  const renderer = new TextRenderer({
    font: '12px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    textColor: () => themeAwareTextColor(),
    backgroundColor: (config: CellRenderer.CellConfig) =>
      config.row % 2 === 0 ? '#ffffff' : '#f8fafc',
    horizontalAlignment: (config: CellRenderer.CellConfig) => {
      // Right-align numeric columns (2-8)
      return config.column >= 2 && config.column <= 8 ? 'right' : 'left';
    },
    verticalAlignment: 'center',
  });

  const panel = new GridPanel({
    id: 'copy-grid',
    title: 'Copy to Clipboard',
    description: 'Select a range of cells, then press Ctrl+C (Cmd+C on Mac) to copy. Paste into a spreadsheet to verify tab-separated rectangular data.',
    model,
    defaultRenderer: renderer,
    selectionMode: 'cell',
  });

  // Set column widths
  const widths = [120, 100, 90, 90, 90, 90, 100, 80, 100, 90];
  for (let i = 0; i < widths.length; i++) {
    panel.grid.resizeColumn('body', i, widths[i]);
  }

  // Configure copy
  panel.grid.copyConfig = {
    separator: '\t',
    headers: 'all',
    format: (args: DataGrid.CopyFormatArgs) => String(args.value),
    warningThreshold: 1e8,
  };

  panel.setStatus('Rows: 100 | Select cells and Ctrl+C to copy');
  return panel;
}
