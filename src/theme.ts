import { DataGrid } from '@lumino/datagrid';

export type Theme = 'light' | 'dark';
export type Density = 'compact' | 'comfortable';

const LIGHT_STYLE: DataGrid.Style = {
  ...DataGrid.defaultStyle,
  voidColor: '#f0f0f0',
  backgroundColor: '#ffffff',
  rowBackgroundColor: (i: number) => i % 2 === 0 ? '#ffffff' : '#f8fafc',
  headerBackgroundColor: '#e2e8f0',
  headerHorizontalGridLineColor: '#cbd5e1',
  headerVerticalGridLineColor: '#cbd5e1',
  gridLineColor: '#e0e0e0',
  selectionFillColor: 'rgba(37, 99, 235, 0.15)',
  selectionBorderColor: 'rgba(37, 99, 235, 0.5)',
  cursorFillColor: 'rgba(37, 99, 235, 0.3)',
  cursorBorderColor: 'rgba(37, 99, 235, 0.8)',
  scrollShadow: {
    size: 10,
    color1: 'rgba(0,0,0,0.12)',
    color2: 'rgba(0,0,0,0.05)',
    color3: 'rgba(0,0,0,0)',
  },
};

const DARK_STYLE: DataGrid.Style = {
  ...DataGrid.defaultStyle,
  voidColor: '#0f0f1e',
  backgroundColor: '#1e1e3a',
  rowBackgroundColor: (i: number) => i % 2 === 0 ? '#1e1e3a' : '#22224a',
  headerBackgroundColor: '#2a2a5a',
  headerHorizontalGridLineColor: '#333366',
  headerVerticalGridLineColor: '#333366',
  gridLineColor: '#333366',
  selectionFillColor: 'rgba(59, 130, 246, 0.25)',
  selectionBorderColor: 'rgba(59, 130, 246, 0.6)',
  cursorFillColor: 'rgba(59, 130, 246, 0.4)',
  cursorBorderColor: 'rgba(59, 130, 246, 0.9)',
  scrollShadow: {
    size: 10,
    color1: 'rgba(0,0,0,0.3)',
    color2: 'rgba(0,0,0,0.15)',
    color3: 'rgba(0,0,0,0)',
  },
};

const COMPACT_SIZES = {
  defaultRowHeight: 20,
  defaultColumnWidth: 80,
  defaultColumnHeaderHeight: 24,
  defaultRowHeaderWidth: 48,
};

const COMFORTABLE_SIZES = {
  defaultRowHeight: 30,
  defaultColumnWidth: 120,
  defaultColumnHeaderHeight: 32,
  defaultRowHeaderWidth: 56,
};

export function getGridStyle(theme: Theme): DataGrid.Style {
  return theme === 'dark' ? DARK_STYLE : LIGHT_STYLE;
}

export function getGridSizes(density: Density): {
  defaultRowHeight: number;
  defaultColumnWidth: number;
  defaultColumnHeaderHeight: number;
  defaultRowHeaderWidth: number;
} {
  return density === 'compact' ? COMPACT_SIZES : COMFORTABLE_SIZES;
}

export function applyTheme(theme: Theme): void {
  document.body.classList.remove('theme-light', 'theme-dark');
  document.body.classList.add(`theme-${theme}`);
}

export function applyDensity(density: Density): void {
  document.body.classList.remove('density-compact', 'density-comfortable');
  document.body.classList.add(`density-${density}`);
}

export function applyGridTheme(grid: DataGrid, theme: Theme, density: Density): void {
  grid.style = getGridStyle(theme);
  const sizes = getGridSizes(density);
  grid.defaultSizes = {
    rowHeight: sizes.defaultRowHeight,
    columnWidth: sizes.defaultColumnWidth,
    rowHeaderWidth: sizes.defaultRowHeaderWidth,
    columnHeaderHeight: sizes.defaultColumnHeaderHeight,
  };
}
