export interface PanelConfig {
  id: string;
  title: string;
  description: string;
}

export interface TimerEntry {
  id: string;
  callback: () => void;
  interval: number;
  handle: ReturnType<typeof setInterval> | null;
  paused: boolean;
}

export interface WorkbenchState {
  version: number;
  theme: 'light' | 'dark';
  density: 'compact' | 'comfortable';
  seed: number;
  hudVisible: boolean;
  layout?: unknown;
  panelSettings?: Record<string, unknown>;
}

export interface ColumnSchema {
  name: string;
  type: 'string' | 'number' | 'date' | 'image' | 'url' | 'email' | 'status' | 'category';
  width?: number;
  editable?: boolean;
  validator?: (value: string) => boolean;
}
