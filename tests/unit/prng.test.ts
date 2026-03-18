import { describe, it, expect } from 'vitest';
import { SeededPRNG } from '../../src/prng';

describe('SeededPRNG', () => {
  it('two instances with the same seed produce identical sequences', () => {
    const a = new SeededPRNG(42);
    const b = new SeededPRNG(42);
    for (let i = 0; i < 100; i++) {
      expect(a.next()).toBe(b.next());
    }
  });

  it('next() returns values in [0, 1)', () => {
    const prng = new SeededPRNG(12345);
    for (let i = 0; i < 10_000; i++) {
      const v = prng.next();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it('nextInt(min, max) stays in range', () => {
    const prng = new SeededPRNG(99);
    for (let i = 0; i < 1000; i++) {
      const v = prng.nextInt(10, 20);
      expect(v).toBeGreaterThanOrEqual(10);
      expect(v).toBeLessThan(20);
      expect(Number.isInteger(v)).toBe(true);
    }
  });

  it('nextInt(5, 6) always returns 5', () => {
    const prng = new SeededPRNG(7);
    for (let i = 0; i < 100; i++) {
      expect(prng.nextInt(5, 6)).toBe(5);
    }
  });

  it('pick() always returns an array member', () => {
    const prng = new SeededPRNG(55);
    const arr = ['a', 'b', 'c', 'd'] as const;
    for (let i = 0; i < 200; i++) {
      expect(arr).toContain(prng.pick(arr));
    }
  });

  it('positionalHash is deterministic', () => {
    const v1 = SeededPRNG.positionalHash(42, 100, 200);
    const v2 = SeededPRNG.positionalHash(42, 100, 200);
    expect(v1).toBe(v2);
  });

  it('positionalHash returns values in [0, 1)', () => {
    for (let r = 0; r < 100; r++) {
      for (let c = 0; c < 10; c++) {
        const v = SeededPRNG.positionalHash(42, r, c);
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThan(1);
      }
    }
  });

  it('positionalHash varies by position', () => {
    const v1 = SeededPRNG.positionalHash(42, 0, 0);
    const v2 = SeededPRNG.positionalHash(42, 0, 1);
    const v3 = SeededPRNG.positionalHash(42, 1, 0);
    expect(v1).not.toBe(v2);
    expect(v1).not.toBe(v3);
  });

  it('positionalHash varies by seed', () => {
    const v1 = SeededPRNG.positionalHash(1, 5, 5);
    const v2 = SeededPRNG.positionalHash(2, 5, 5);
    expect(v1).not.toBe(v2);
  });

  it('forPosition returns a deterministic PRNG', () => {
    const a = SeededPRNG.forPosition(42, 10, 20);
    const b = SeededPRNG.forPosition(42, 10, 20);
    for (let i = 0; i < 50; i++) {
      expect(a.next()).toBe(b.next());
    }
  });

  it('different seeds produce different sequences', () => {
    const a = new SeededPRNG(1);
    const b = new SeededPRNG(2);
    let different = false;
    for (let i = 0; i < 10; i++) {
      if (a.next() !== b.next()) {
        different = true;
        break;
      }
    }
    expect(different).toBe(true);
  });
});
