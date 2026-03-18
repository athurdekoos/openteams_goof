export interface PanelConfig {
  id: string;
  title: string;
  description: string;
}

export interface WorkbenchState {
  version: number;
  theme: 'light' | 'dark';
  density: 'compact' | 'comfortable';
  seed: number;
  hudVisible: boolean;
  layout?: import('@lumino/coreutils').JSONValue;
  panelSettings?: Record<string, unknown>;
}

export interface ColumnSchema {
  name: string;
  type: 'string' | 'number' | 'date' | 'image' | 'url' | 'email' | 'status' | 'category';
  width?: number;
  editable?: boolean;
  validator?: (value: string) => boolean;
}
