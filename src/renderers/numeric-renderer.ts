import { TextRenderer, CellRenderer } from '@lumino/datagrid';

function formatFixed(value: any): string {
  if (typeof value === 'number') {
    return value.toFixed(4);
  }
  return String(value ?? '');
}

function colorByValue(config: CellRenderer.CellConfig): string {
  const value = typeof config.value === 'number' ? config.value : 0;
  if (value < 0.33) return '#1a1a1a';
  if (value < 0.66) return '#dc2626';
  return '#16a34a';
}

function bgByRow(config: CellRenderer.CellConfig): string {
  return config.row % 2 === 0 ? '#ffffff' : '#f8fafc';
}

export class NumericRenderer extends TextRenderer {
  constructor() {
    super({
      font: '12px "SF Mono", "Fira Code", Consolas, monospace',
      textColor: colorByValue,
      backgroundColor: bgByRow,
      horizontalAlignment: 'right',
      verticalAlignment: 'center',
      format: formatFixed,
    });
  }
}
