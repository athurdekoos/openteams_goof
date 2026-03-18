import { Widget } from '@lumino/widgets';
import { CommandRegistry } from '@lumino/commands';

export class ToolbarWidget extends Widget {
  private _commands: CommandRegistry;

  constructor(commands: CommandRegistry) {
    super();
    this._commands = commands;
    this.addClass('toolbar');
    this.id = 'main-toolbar';
    this.node.setAttribute('role', 'toolbar');
    this.node.setAttribute('aria-label', 'Workbench Toolbar');

    this._build();
  }

  private _build(): void {
    const n = this.node;
    n.innerHTML = '';

    // Title
    const title = document.createElement('span');
    title.className = 'toolbar-label';
    title.style.fontWeight = '600';
    title.style.fontSize = '13px';
    title.textContent = 'Data Grid Workbench';
    n.appendChild(title);

    this._addSeparator();

    // Pause/Resume
    this._addButton('pause-btn', '⏸ Pause', 'app:toggle-pause', 'Space');

    this._addSeparator();

    // Seed input
    this._addLabel('Seed:');
    const seedInput = document.createElement('input');
    seedInput.type = 'number';
    seedInput.className = 'toolbar-input';
    seedInput.id = 'seed-input';
    seedInput.value = '42';
    seedInput.setAttribute('aria-label', 'Random seed');
    seedInput.addEventListener('change', () => {
      this._commands.execute('app:set-seed', { seed: parseInt(seedInput.value, 10) || 42 });
    });
    n.appendChild(seedInput);

    // Frequency slider
    this._addLabel('Speed:');
    const freqSlider = document.createElement('input');
    freqSlider.type = 'range';
    freqSlider.className = 'toolbar-slider';
    freqSlider.id = 'freq-slider';
    freqSlider.min = '1';
    freqSlider.max = '100';
    freqSlider.value = '50';
    freqSlider.setAttribute('aria-label', 'Animation speed');
    freqSlider.addEventListener('input', () => {
      this._commands.execute('app:set-frequency', { value: parseInt(freqSlider.value, 10) });
    });
    n.appendChild(freqSlider);

    this._addSeparator();

    // Theme toggle
    this._addButton('theme-btn', '◐ Theme', 'app:toggle-theme', 'Ctrl+Shift+T');

    // Density toggle
    this._addButton('density-btn', '▤ Density', 'app:toggle-density');

    // HUD toggle
    this._addButton('hud-btn', '◫ HUD', 'app:toggle-hud', 'Ctrl+Shift+H');

    this._addSeparator();

    // Reset layout
    this._addButton('reset-btn', '↺ Reset', 'app:reset-layout', 'Ctrl+Shift+R');

    // Export/Import
    this._addButton('export-btn', '↓ Export', 'app:export');
    this._addButton('import-btn', '↑ Import', 'app:import');

    // Spacer
    const spacer = document.createElement('span');
    spacer.className = 'toolbar-spacer';
    n.appendChild(spacer);

    // Help
    this._addButton('help-btn', '? Help', 'app:show-help');
  }

  private _addButton(id: string, label: string, command: string, shortcut?: string): void {
    const btn = document.createElement('button');
    btn.className = 'toolbar-btn';
    btn.id = id;
    btn.textContent = label;
    btn.setAttribute('aria-label', label.replace(/^[^\w]+\s*/, ''));
    if (shortcut) {
      btn.title = `${label} (${shortcut})`;
    }
    btn.addEventListener('click', () => {
      if (this._commands.hasCommand(command)) {
        this._commands.execute(command);
      }
    });
    this.node.appendChild(btn);
  }

  private _addSeparator(): void {
    const sep = document.createElement('span');
    sep.className = 'toolbar-separator';
    this.node.appendChild(sep);
  }

  private _addLabel(text: string): void {
    const label = document.createElement('span');
    label.className = 'toolbar-label';
    label.textContent = text;
    this.node.appendChild(label);
  }

  updatePauseButton(paused: boolean): void {
    const btn = this.node.querySelector('#pause-btn') as HTMLButtonElement;
    if (btn) {
      btn.textContent = paused ? '▶ Resume' : '⏸ Pause';
      btn.classList.toggle('active', paused);
    }
  }

  updateThemeButton(theme: string): void {
    const btn = this.node.querySelector('#theme-btn') as HTMLButtonElement;
    if (btn) {
      btn.classList.toggle('active', theme === 'dark');
    }
  }

  updateHudButton(visible: boolean): void {
    const btn = this.node.querySelector('#hud-btn') as HTMLButtonElement;
    if (btn) {
      btn.classList.toggle('active', visible);
    }
  }

  updateDensityButton(density: string): void {
    const btn = this.node.querySelector('#density-btn') as HTMLButtonElement;
    if (btn) {
      btn.classList.toggle('active', density === 'compact');
    }
  }

  setSeedValue(seed: number): void {
    const input = this.node.querySelector('#seed-input') as HTMLInputElement;
    if (input) input.value = String(seed);
  }
}
