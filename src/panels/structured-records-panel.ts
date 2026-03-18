import { TextRenderer } from '@lumino/datagrid';
import { GridPanel } from './grid-panel';
import { StructuredRecordsModel } from '../models/structured-records-model';
import { RECORD_COLUMNS } from '../data/column-schemas';

export function createStructuredRecordsPanel(seed: number): GridPanel {
  const model = new StructuredRecordsModel(seed);

  const renderer = new TextRenderer({
    font: '12px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    textColor: '#1a1a1a',
    backgroundColor: (config) => config.row % 2 === 0 ? '#ffffff' : '#f8fafc',
    horizontalAlignment: (config) => {
      const col = RECORD_COLUMNS[config.column];
      return col?.type === 'number' ? 'right' : 'left';
    },
    verticalAlignment: 'center',
  });

  const panel = new GridPanel({
    id: 'structured-records',
    title: 'Structured Records',
    description: '10,000 business records with typed columns. Data is lazily generated and cached. Row-selection mode.',
    model,
    defaultRenderer: renderer,
    selectionMode: 'row',
  });

  // Set column widths
  for (let i = 0; i < RECORD_COLUMNS.length; i++) {
    const col = RECORD_COLUMNS[i];
    if (col.width) {
      panel.grid.resizeColumn('body', i, col.width);
    }
  }

  panel.setStatus(`Rows: 10,000 | Columns: ${RECORD_COLUMNS.length}`);
  return panel;
}
