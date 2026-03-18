export class HudOverlay {
  readonly node: HTMLElement;
  private _fields: Map<string, HTMLElement> = new Map();
  private _visible = false;

  constructor() {
    this.node = document.createElement('div');
    this.node.className = 'hud-overlay hidden';

    const fields = ['FPS', 'UPS', 'Visible', 'Virtual', 'Cells/s', 'Timer'];
    for (const name of fields) {
      const row = document.createElement('div');
      row.className = 'hud-field';

      const label = document.createElement('span');
      label.className = 'hud-label';
      label.textContent = name;

      const value = document.createElement('span');
      value.className = 'hud-value';
      value.textContent = '--';

      row.appendChild(label);
      row.appendChild(value);
      this.node.appendChild(row);
      this._fields.set(name, value);
    }
  }

  setValue(name: string, value: string): void {
    const el = this._fields.get(name);
    if (el) el.textContent = value;
  }

  get visible(): boolean {
    return this._visible;
  }

  set visible(v: boolean) {
    this._visible = v;
    this.node.classList.toggle('hidden', !v);
  }

  toggle(): void {
    this.visible = !this._visible;
  }
}
