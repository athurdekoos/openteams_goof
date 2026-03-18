import { describe, it, expect, beforeEach } from 'vitest';
import { getGridStyle, getGridSizes, applyTheme, applyDensity } from '../../src/theme';

describe('theme', () => {
  describe('getGridStyle', () => {
    it('light style has white background', () => {
      const style = getGridStyle('light');
      expect(style.backgroundColor).toBe('#ffffff');
    });

    it('dark style has dark background', () => {
      const style = getGridStyle('dark');
      expect(style.backgroundColor).toBe('#1e1e3a');
    });
  });

  describe('getGridSizes', () => {
    it('compact has row height 20', () => {
      const sizes = getGridSizes('compact');
      expect(sizes.defaultRowHeight).toBe(20);
    });

    it('comfortable has row height 30', () => {
      const sizes = getGridSizes('comfortable');
      expect(sizes.defaultRowHeight).toBe(30);
    });
  });

  describe('applyTheme', () => {
    beforeEach(() => {
      document.body.className = '';
    });

    it('toggles body CSS classes for light', () => {
      applyTheme('light');
      expect(document.body.classList.contains('theme-light')).toBe(true);
      expect(document.body.classList.contains('theme-dark')).toBe(false);
    });

    it('toggles body CSS classes for dark', () => {
      applyTheme('dark');
      expect(document.body.classList.contains('theme-dark')).toBe(true);
      expect(document.body.classList.contains('theme-light')).toBe(false);
    });

    it('switching theme removes old class', () => {
      applyTheme('light');
      applyTheme('dark');
      expect(document.body.classList.contains('theme-light')).toBe(false);
      expect(document.body.classList.contains('theme-dark')).toBe(true);
    });
  });

  describe('applyDensity', () => {
    beforeEach(() => {
      document.body.className = '';
    });

    it('toggles body CSS classes for compact', () => {
      applyDensity('compact');
      expect(document.body.classList.contains('density-compact')).toBe(true);
      expect(document.body.classList.contains('density-comfortable')).toBe(false);
    });

    it('toggles body CSS classes for comfortable', () => {
      applyDensity('comfortable');
      expect(document.body.classList.contains('density-comfortable')).toBe(true);
      expect(document.body.classList.contains('density-compact')).toBe(false);
    });
  });
});
