import { describe, it, expect, beforeEach, vi } from 'vitest';
import { loadState, saveState, clearState, exportState } from '../../src/persistence';
import { WorkbenchState } from '../../src/types';

const sampleState: WorkbenchState = {
  version: 1,
  theme: 'dark',
  density: 'compact',
  seed: 99,
  hudVisible: true,
};

describe('persistence', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('saveState → loadState round-trip preserves all fields', () => {
    saveState(sampleState);
    const loaded = loadState();
    expect(loaded).toEqual(sampleState);
  });

  it('loadState returns null when storage is empty', () => {
    expect(loadState()).toBeNull();
  });

  it('loadState returns null for wrong version', () => {
    const bad = { ...sampleState, version: 999 };
    localStorage.setItem('datagrid-workbench', JSON.stringify(bad));
    expect(loadState()).toBeNull();
  });

  it('loadState returns null for corrupted JSON', () => {
    localStorage.setItem('datagrid-workbench', '{not valid json');
    expect(loadState()).toBeNull();
  });

  it('clearState removes data', () => {
    saveState(sampleState);
    clearState();
    expect(loadState()).toBeNull();
  });

  it('uses correct storage key', () => {
    saveState(sampleState);
    expect(localStorage.getItem('datagrid-workbench')).not.toBeNull();
  });

  it('exportState creates a download link', () => {
    const clickSpy = vi.fn();
    const createElementOrig = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      const el = createElementOrig(tag);
      if (tag === 'a') {
        vi.spyOn(el as HTMLAnchorElement, 'click').mockImplementation(clickSpy);
      }
      return el;
    });
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

    exportState(sampleState);

    expect(clickSpy).toHaveBeenCalled();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:test');

    vi.restoreAllMocks();
  });
});
