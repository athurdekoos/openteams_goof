import { describe, it, expect } from 'vitest';
import { HudOverlay } from '../../../src/hud/hud-overlay';

describe('HudOverlay', () => {
  it('creates DOM node with class hud-overlay', () => {
    const hud = new HudOverlay();
    expect(hud.node).toBeInstanceOf(HTMLElement);
    expect(hud.node.classList.contains('hud-overlay')).toBe(true);
  });

  it('initially hidden', () => {
    const hud = new HudOverlay();
    expect(hud.node.classList.contains('hidden')).toBe(true);
    expect(hud.visible).toBe(false);
  });

  it('has 6 fields: FPS, UPS, Visible, Virtual, Cells/s, Timer', () => {
    const hud = new HudOverlay();
    const labels = Array.from(hud.node.querySelectorAll('.hud-label')).map(
      (el) => el.textContent
    );
    expect(labels).toEqual(['FPS', 'UPS', 'Visible', 'Virtual', 'Cells/s', 'Timer']);
  });

  it('setValue updates the correct field textContent', () => {
    const hud = new HudOverlay();
    hud.setValue('FPS', '60');
    const fpsValue = hud.node.querySelector('.hud-field .hud-value');
    expect(fpsValue?.textContent).toBe('60');
  });

  it('setting visible=true removes hidden class', () => {
    const hud = new HudOverlay();
    hud.visible = true;
    expect(hud.node.classList.contains('hidden')).toBe(false);
    expect(hud.visible).toBe(true);
  });

  it('setting visible=false adds hidden class', () => {
    const hud = new HudOverlay();
    hud.visible = true;
    hud.visible = false;
    expect(hud.node.classList.contains('hidden')).toBe(true);
    expect(hud.visible).toBe(false);
  });

  it('toggle() flips visibility', () => {
    const hud = new HudOverlay();
    expect(hud.visible).toBe(false);
    hud.toggle();
    expect(hud.visible).toBe(true);
    hud.toggle();
    expect(hud.visible).toBe(false);
  });
});
