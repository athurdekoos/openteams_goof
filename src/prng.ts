/**
 * Mulberry32 seeded PRNG with positional hashing.
 * Used for deterministic data generation across the workbench.
 */
export class SeededPRNG {
  private state: number;

  constructor(seed: number) {
    this.state = seed | 0;
  }

  /** Returns a float in [0, 1) */
  next(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /** Returns integer in [min, max) */
  nextInt(min: number, max: number): number {
    return min + Math.floor(this.next() * (max - min));
  }

  /** Pick random element from array */
  pick<T>(arr: readonly T[]): T {
    return arr[this.nextInt(0, arr.length)];
  }

  /** Positional hash: O(1) deterministic value for (row, col) */
  static positionalHash(seed: number, row: number, col: number): number {
    let h = seed | 0;
    // Boost-style hash_combine
    h ^= (row * 0x9e3779b9 + (h << 6) + (h >> 2)) | 0;
    h ^= (col * 0x9e3779b9 + (h << 6) + (h >> 2)) | 0;
    // Mulberry32 finalizer
    let t = (h + 0x6d2b79f5) | 0;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /** Create a new PRNG forked from a positional seed */
  static forPosition(seed: number, row: number, col: number): SeededPRNG {
    const h = SeededPRNG.positionalHash(seed, row, col);
    return new SeededPRNG((h * 4294967296) | 0);
  }
}
