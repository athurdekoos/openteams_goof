import { TextRenderer, CellRenderer, DataModel } from '@lumino/datagrid';
import { GridPanel } from './grid-panel';
import { EditableModel } from '../models/editable-model';
import { EDITABLE_COLUMNS } from '../data/column-schemas';
import { themeAwareTextColor } from '../theme';

function editableBg(config: CellRenderer.CellConfig): string {
  const col = EDITABLE_COLUMNS[config.column];
  const baseBg = config.row % 2 === 0 ? '#ffffff' : '#f8fafc';
  if (!col?.editable) return baseBg;
  // Editable cells get a subtle blue tint
  return config.row % 2 === 0 ? '#f0f7ff' : '#e8f2ff';
}

export function createEditableGridPanel(seed: number): GridPanel {
  const model = new EditableModel(seed);

  const renderer = new TextRenderer({
    font: '12px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    textColor: (config) => {
      const meta = model.metadata('body', config.row, config.column) as DataModel.Metadata & { error?: string; edited?: boolean };
      if (meta.error) return '#dc2626';
      if (meta.edited) return '#2563eb';
      return themeAwareTextColor();
    },
    backgroundColor: editableBg,
    horizontalAlignment: (config) => {
      const col = EDITABLE_COLUMNS[config.column];
      return col?.type === 'number' ? 'right' : 'left';
    },
    verticalAlignment: 'center',
  });

  const panel = new GridPanel({
    id: 'editable-grid',
    title: 'Editable Grid',
    description: 'Click a cell to edit. Blue-tinted cells are editable. Validation enforced: names required, valid email format, age 0-150. Enter to commit, Escape to cancel.',
    model,
    defaultRenderer: renderer,
    selectionMode: 'cell',
  });

  // Enable editing
  panel.grid.editingEnabled = true;

  // Set column widths
  for (let i = 0; i < EDITABLE_COLUMNS.length; i++) {
    const col = EDITABLE_COLUMNS[i];
    if (col.width) {
      panel.grid.resizeColumn('body', i, col.width);
    }
  }

  // Update status on model changes
  model.changed.connect(() => {
    panel.setStatus(`Rows: 50 | Edits: ${model.editCount}`);
  });

  panel.setStatus('Rows: 50 | Edits: 0');
  return panel;
}
