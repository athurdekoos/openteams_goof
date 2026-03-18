import { CellRenderer, GraphicsContext } from '@lumino/datagrid';

// Viridis-inspired color stops
const VIRIDIS: [number, number, number][] = [
  [68, 1, 84],      // 0.0 - deep purple
  [72, 36, 117],     // 0.1
  [65, 68, 135],     // 0.2
  [53, 95, 141],     // 0.3
  [42, 120, 142],    // 0.35
  [33, 145, 140],    // 0.45
  [34, 168, 132],    // 0.55
  [68, 191, 112],    // 0.65
  [122, 209, 81],    // 0.75
  [189, 223, 38],    // 0.85
  [253, 231, 37],    // 1.0 - bright yellow
];

function interpolateViridis(t: number): string {
  t = Math.max(0, Math.min(1, t));
  const idx = t * (VIRIDIS.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.min(lo + 1, VIRIDIS.length - 1);
  const frac = idx - lo;
  const r = Math.round(VIRIDIS[lo][0] + frac * (VIRIDIS[hi][0] - VIRIDIS[lo][0]));
  const g = Math.round(VIRIDIS[lo][1] + frac * (VIRIDIS[hi][1] - VIRIDIS[lo][1]));
  const b = Math.round(VIRIDIS[lo][2] + frac * (VIRIDIS[hi][2] - VIRIDIS[lo][2]));
  return `rgb(${r},${g},${b})`;
}

function contrastColor(t: number): string {
  // Use white text for darker colors (first 60%), black for brighter
  return t < 0.6 ? '#ffffff' : '#000000';
}

export class HeatMapRenderer extends CellRenderer {
  paint(gc: GraphicsContext, config: CellRenderer.CellConfig): void {
    const { x, y, width, height } = config;
    const value = typeof config.value === 'number' ? config.value : 0;
    const t = Math.max(0, Math.min(1, value));

    // Background
    gc.fillStyle = interpolateViridis(t);
    gc.fillRect(x, y, width, height);

    // Text
    const text = t.toFixed(3);
    gc.fillStyle = contrastColor(t);
    gc.font = '11px "SF Mono", "Fira Code", Consolas, monospace';
    gc.textAlign = 'center';
    gc.textBaseline = 'middle';
    gc.fillText(text, x + width / 2, y + height / 2);
  }
}
