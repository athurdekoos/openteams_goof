import { WorkbenchState } from './types';

const STORAGE_KEY = 'datagrid-workbench';
const CURRENT_VERSION = 1;

export function loadState(): WorkbenchState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const state = JSON.parse(raw) as WorkbenchState;
    if (state.version !== CURRENT_VERSION) return null;
    return state;
  } catch {
    return null;
  }
}

export function saveState(state: WorkbenchState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Failed to save state:', e);
  }
}

export function clearState(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function exportState(state: WorkbenchState): void {
  const json = JSON.stringify(state, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `datagrid-workbench-${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function importState(): Promise<WorkbenchState | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.addEventListener('cancel', () => {
      resolve(null);
    });
    input.addEventListener('change', async () => {
      const file = input.files?.[0];
      if (!file) {
        resolve(null);
        return;
      }
      try {
        const text = await file.text();
        const state = JSON.parse(text) as WorkbenchState;
        if (state.version !== CURRENT_VERSION) {
          console.warn('Incompatible state version');
          resolve(null);
          return;
        }
        resolve(state);
      } catch {
        resolve(null);
      }
    });
    input.click();
  });
}
