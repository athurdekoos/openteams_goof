import { BoxPanel, Widget } from '@lumino/widgets';
import { DataGrid, DataModel, TextRenderer, BasicSelectionModel, CellRenderer } from '@lumino/datagrid';
import { themeAwareTextColor } from '../theme';

export interface GridPanelOptions {
  id: string;
  title: string;
  description: string;
  model: DataModel;
  defaultRenderer?: CellRenderer;
  selectionMode?: 'row' | 'column' | 'cell';
  headerVisibility?: DataGrid.HeaderVisibility;
  stretchLastColumn?: boolean;
}

export class GridPanel extends BoxPanel {
  readonly grid: DataGrid;
  readonly model: DataModel;
  private _statusNode: HTMLElement;

  constructor(options: GridPanelOptions) {
    super({ direction: 'top-to-bottom', spacing: 0 });
    this.addClass('grid-panel');
    this.id = options.id;
    this.title.label = options.title;
    this.title.closable = true;

    this.model = options.model;

    // Description bar
    const descWidget = new Widget();
    descWidget.addClass('grid-panel-description');
    descWidget.node.textContent = options.description;
    BoxPanel.setStretch(descWidget, 0);
    this.addWidget(descWidget);

    // DataGrid — it IS a Widget, so add it directly for proper layout
    const defaultRenderer = options.defaultRenderer || new TextRenderer({
      font: '12px "SF Mono", "Fira Code", Consolas, monospace',
      textColor: () => themeAwareTextColor(),
      backgroundColor: '',
      horizontalAlignment: 'left',
      verticalAlignment: 'center',
    });

    this.grid = new DataGrid({
      defaultRenderer,
      headerVisibility: options.headerVisibility ?? 'all',
      stretchLastColumn: options.stretchLastColumn ?? false,
    });
    this.grid.dataModel = options.model;
    this.grid.addClass('grid-panel-body');

    if (options.selectionMode) {
      const selModel = new BasicSelectionModel({
        dataModel: options.model,
        selectionMode: options.selectionMode,
      });
      this.grid.selectionModel = selModel;
    }

    BoxPanel.setStretch(this.grid, 1);
    this.addWidget(this.grid);

    // Status bar
    const statusWidget = new Widget();
    statusWidget.addClass('grid-panel-status');
    statusWidget.node.innerHTML = '<span class="status-info"></span>';
    this._statusNode = statusWidget.node;
    BoxPanel.setStretch(statusWidget, 0);
    this.addWidget(statusWidget);
  }

  setStatus(text: string): void {
    const info = this._statusNode.querySelector('.status-info');
    if (info) info.textContent = text;
  }

  dispose(): void {
    this.grid.dispose();
    super.dispose();
  }

  setStatusBadge(state: 'running' | 'paused'): void {
    const icon = state === 'running' ? '\u25b6' : '\u23f8';
    const label = state === 'running' ? 'Running' : 'Paused';
    const existing = this._statusNode.querySelector('.status-badge');
    if (existing) {
      existing.className = `status-badge ${state}`;
      existing.textContent = `${icon} ${label}`;
    } else {
      const badge = document.createElement('span');
      badge.className = `status-badge ${state}`;
      badge.textContent = `${icon} ${label}`;
      this._statusNode.prepend(badge);
    }
  }
}
