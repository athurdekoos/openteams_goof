import { CommandRegistry } from '@lumino/commands';
import { Widget } from '@lumino/widgets';

import { AppShell } from './app-shell';
import { SeededPRNG } from './prng';
import { TimerManager } from './timer-manager';
import { ToolbarWidget } from './toolbar';
import { DockManager } from './dock-manager';
import { HudManager } from './hud/hud-manager';
import { loadState, saveState, clearState, exportState, importState } from './persistence';
import { applyTheme, applyDensity, applyGridTheme, Theme, Density } from './theme';
import { WorkbenchState } from './types';

import '@lumino/default-theme/style/index.css';
import './styles/index.css';

const DEFAULT_SEED = 42;
const STATE_VERSION = 1;

function main(): void {
  // Load persisted state
  const saved = loadState();
  let seed = saved?.seed ?? DEFAULT_SEED;
  let theme: Theme = saved?.theme ?? 'light';
  let density: Density = saved?.density ?? 'comfortable';
  let hudVisible = saved?.hudVisible ?? false;

  const timerManager = new TimerManager();
  const commands = new CommandRegistry();

  // Build shell
  const shell = new AppShell(commands);

  // Create toolbar and attach
  const toolbar = new ToolbarWidget(commands);
  shell.setToolbar(toolbar);
  toolbar.setSeedValue(seed);

  // Mutable manager references
  let dockManager = new DockManager(shell.dock, seed, timerManager);
  dockManager.createAllPanels();

  let hudManager = new HudManager(timerManager);
  for (const panel of dockManager.panels.values()) {
    hudManager.registerGrid(panel);
  }

  // --- Helpers ---
  function currentState(): WorkbenchState {
    return {
      version: STATE_VERSION,
      theme,
      density,
      seed,
      hudVisible,
      layout: dockManager.saveLayout(),
    };
  }

  function persistState(): void {
    saveState(currentState());
  }

  function applyAllGridThemes(): void {
    for (const panel of dockManager.panels.values()) {
      applyGridTheme(panel.grid, theme, density);
    }
  }

  // Debounced auto-save on layout change
  let saveTimer: ReturnType<typeof setTimeout> | null = null;
  shell.dock.layoutModified.connect(() => {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(persistState, 1000);
  });

  // --- Register commands ---
  commands.addCommand('app:toggle-pause', {
    label: 'Toggle Pause',
    execute: () => {
      timerManager.togglePause();
      toolbar.updatePauseButton(timerManager.paused);
    },
  });

  commands.addCommand('app:set-seed', {
    label: 'Set Seed',
    execute: (args) => {
      seed = (args as any).seed ?? DEFAULT_SEED;
      timerManager.dispose();

      // Remove existing widgets
      const widgets: Widget[] = [];
      for (const w of shell.dock.widgets()) widgets.push(w);
      for (const w of widgets) w.parent = null;

      // Rebuild
      dockManager = new DockManager(shell.dock, seed, timerManager);
      dockManager.createAllPanels();
      dockManager.buildDefaultLayout();

      // Re-register HUD
      hudManager.dispose();
      hudManager = new HudManager(timerManager);
      for (const panel of dockManager.panels.values()) {
        hudManager.registerGrid(panel);
      }
      hudManager.attachTo(shell.dock.node);

      applyAllGridThemes();
      if (hudVisible) hudManager.show();
      toolbar.updatePauseButton(false);
      persistState();
    },
  });

  commands.addCommand('app:set-frequency', {
    label: 'Set Frequency',
    execute: (args) => {
      const value = (args as any).value ?? 50;
      // Map 1-100 slider: 1=slow(4x), 50=normal(1x), 100=fast(0.25x)
      const factor = Math.pow(2, (50 - value) / 25);
      timerManager.setGlobalFrequency(factor);
    },
  });

  commands.addCommand('app:toggle-theme', {
    label: 'Toggle Theme',
    execute: () => {
      theme = theme === 'light' ? 'dark' : 'light';
      applyTheme(theme);
      applyAllGridThemes();
      toolbar.updateThemeButton(theme);
      persistState();
    },
  });

  commands.addCommand('app:toggle-density', {
    label: 'Toggle Density',
    execute: () => {
      density = density === 'comfortable' ? 'compact' : 'comfortable';
      applyDensity(density);
      applyAllGridThemes();
      toolbar.updateDensityButton(density);
      persistState();
    },
  });

  commands.addCommand('app:toggle-hud', {
    label: 'Toggle HUD',
    execute: () => {
      hudManager.toggle();
      hudVisible = hudManager.visible;
      toolbar.updateHudButton(hudVisible);
      persistState();
    },
  });

  commands.addCommand('app:reset-layout', {
    label: 'Reset Layout',
    execute: () => {
      dockManager.buildDefaultLayout();
      theme = 'light';
      density = 'comfortable';
      applyTheme(theme);
      applyDensity(density);
      applyAllGridThemes();
      toolbar.updateThemeButton(theme);
      toolbar.updateDensityButton(density);
      clearState();
    },
  });

  commands.addCommand('app:export', {
    label: 'Export',
    execute: () => {
      exportState(currentState());
    },
  });

  commands.addCommand('app:import', {
    label: 'Import',
    execute: async () => {
      const state = await importState();
      if (state) {
        theme = state.theme;
        density = state.density;
        seed = state.seed;
        hudVisible = state.hudVisible;
        applyTheme(theme);
        applyDensity(density);
        applyAllGridThemes();
        toolbar.updateThemeButton(theme);
        toolbar.updateDensityButton(density);
        toolbar.updateHudButton(hudVisible);
        toolbar.setSeedValue(seed);
        if (state.layout) {
          dockManager.restoreLayout(state.layout);
        }
        if (hudVisible) hudManager.show();
        else hudManager.hide();
        persistState();
      }
    },
  });

  commands.addCommand('app:show-help', {
    label: 'Help',
    execute: () => {
      const existing = document.getElementById('help-modal');
      if (existing) {
        existing.classList.toggle('hidden');
        return;
      }
      const modal = document.createElement('div');
      modal.id = 'help-modal';
      modal.style.cssText = `
        position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
        background: var(--bg-secondary); color: var(--text-primary);
        border: 1px solid var(--border-color); border-radius: 8px;
        padding: 24px; max-width: 480px; z-index: 10000;
        box-shadow: 0 8px 32px rgba(0,0,0,0.3); font-size: 13px;
      `;
      modal.innerHTML = `
        <h3 style="margin: 0 0 16px 0; font-size: 16px;">Keyboard Shortcuts</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 4px 12px 4px 0; opacity: 0.7;">Space</td><td>Pause / Resume</td></tr>
          <tr><td style="padding: 4px 12px 4px 0; opacity: 0.7;">Ctrl+Shift+T</td><td>Toggle Theme</td></tr>
          <tr><td style="padding: 4px 12px 4px 0; opacity: 0.7;">Ctrl+Shift+H</td><td>Toggle HUD</td></tr>
          <tr><td style="padding: 4px 12px 4px 0; opacity: 0.7;">Ctrl+Shift+R</td><td>Reset Layout</td></tr>
          <tr><td style="padding: 4px 12px 4px 0; opacity: 0.7;">Ctrl+C</td><td>Copy Selection</td></tr>
          <tr><td style="padding: 4px 12px 4px 0; opacity: 0.7;">Enter</td><td>Commit Edit</td></tr>
          <tr><td style="padding: 4px 12px 4px 0; opacity: 0.7;">Escape</td><td>Cancel Edit / Close Help</td></tr>
        </table>
        <button id="help-close" style="
          margin-top: 16px; padding: 6px 16px; border: 1px solid var(--border-color);
          border-radius: 4px; background: var(--bg-tertiary); color: var(--text-primary);
          cursor: pointer;
        ">Close</button>
      `;
      document.body.appendChild(modal);
      modal.querySelector('#help-close')!.addEventListener('click', () => modal.classList.add('hidden'));
      const onKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          modal.classList.add('hidden');
          document.removeEventListener('keydown', onKey);
        }
      };
      document.addEventListener('keydown', onKey);
    },
  });

  // --- Keybindings ---
  commands.addKeyBinding({ command: 'app:toggle-pause', keys: ['Space'], selector: 'body' });
  commands.addKeyBinding({ command: 'app:toggle-theme', keys: ['Ctrl Shift T'], selector: 'body' });
  commands.addKeyBinding({ command: 'app:toggle-hud', keys: ['Ctrl Shift H'], selector: 'body' });
  commands.addKeyBinding({ command: 'app:reset-layout', keys: ['Ctrl Shift R'], selector: 'body' });

  // --- Apply initial state ---
  applyTheme(theme);
  applyDensity(density);

  // Build layout (try restore, fallback to default)
  if (saved?.layout) {
    if (!dockManager.restoreLayout(saved.layout)) {
      dockManager.buildDefaultLayout();
    }
  } else {
    dockManager.buildDefaultLayout();
  }

  applyAllGridThemes();
  toolbar.updateThemeButton(theme);
  toolbar.updateDensityButton(density);
  toolbar.updatePauseButton(false);

  // Attach shell to DOM
  Widget.attach(shell, document.body);

  // Attach HUD
  hudManager.attachTo(shell.dock.node);
  if (hudVisible) {
    hudManager.show();
    toolbar.updateHudButton(true);
  }

  // Handle window resize
  window.addEventListener('resize', () => shell.update());

  // Wire keyboard events to command registry
  document.addEventListener('keydown', (event) => commands.processKeydownEvent(event));
}

window.addEventListener('load', main);
