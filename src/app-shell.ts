import { BoxPanel, DockPanel, Widget } from '@lumino/widgets';
import { CommandRegistry } from '@lumino/commands';

export class AppShell extends BoxPanel {
  readonly dock: DockPanel;
  private _toolbarPlaceholder: Widget;

  constructor(commands: CommandRegistry) {
    super({ direction: 'top-to-bottom', spacing: 0 });
    this.addClass('app-shell');
    this.id = 'app-shell';

    // Placeholder toolbar until Phase 6
    this._toolbarPlaceholder = new Widget();
    this._toolbarPlaceholder.addClass('toolbar');
    this._toolbarPlaceholder.id = 'toolbar';
    this._toolbarPlaceholder.node.setAttribute('role', 'toolbar');
    this._toolbarPlaceholder.node.setAttribute('aria-label', 'Workbench Toolbar');
    this._toolbarPlaceholder.node.innerHTML = '<span class="toolbar-label">Data Grid Workbench</span><span class="toolbar-spacer"></span>';

    this.dock = new DockPanel();
    this.dock.id = 'dock-panel';

    BoxPanel.setStretch(this._toolbarPlaceholder, 0);
    BoxPanel.setStretch(this.dock, 1);

    this.addWidget(this._toolbarPlaceholder);
    this.addWidget(this.dock);
  }

  get toolbarNode(): HTMLElement {
    return this._toolbarPlaceholder.node;
  }

  setToolbar(toolbar: Widget): void {
    if (this._toolbarPlaceholder.parent === this) {
      this._toolbarPlaceholder.parent = null;
    }
    BoxPanel.setStretch(toolbar, 0);
    this.insertWidget(0, toolbar);
    this._toolbarPlaceholder = toolbar;
  }
}
