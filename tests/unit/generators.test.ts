import { describe, it, expect } from 'vitest';
import { SeededPRNG } from '../../src/prng';
import {
  genFullName,
  genCompanyName,
  genEmail,
  genPrice,
  genDateString,
  genStatus,
  genCategory,
  genImagePlaceholder,
  genUrl,
  genRecord,
} from '../../src/data/generators';
import { STATUSES, CATEGORIES } from '../../src/data/word-lists';

describe('genFullName', () => {
  it('is deterministic', () => {
    const a = genFullName(new SeededPRNG(42));
    const b = genFullName(new SeededPRNG(42));
    expect(a).toBe(b);
  });

  it('returns "First Last" format', () => {
    const name = genFullName(new SeededPRNG(42));
    const parts = name.split(' ');
    expect(parts).toHaveLength(2);
    expect(parts[0].length).toBeGreaterThan(0);
    expect(parts[1].length).toBeGreaterThan(0);
  });
});

describe('genCompanyName', () => {
  it('returns "Word1Word2 Suffix" format', () => {
    const name = genCompanyName(new SeededPRNG(42));
    const parts = name.split(' ');
    expect(parts.length).toBeGreaterThanOrEqual(2);
  });
});

describe('genEmail', () => {
  it('returns a valid email format', () => {
    const email = genEmail(new SeededPRNG(42), 'John Doe');
    expect(email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  });

  it('uses name parts', () => {
    const email = genEmail(new SeededPRNG(42), 'Alice Smith');
    expect(email).toContain('alice');
    expect(email).toContain('smith');
  });
});

describe('genPrice', () => {
  it('returns a number in [0, 1000)', () => {
    const prng = new SeededPRNG(42);
    for (let i = 0; i < 100; i++) {
      const price = genPrice(prng);
      expect(price).toBeGreaterThanOrEqual(0);
      expect(price).toBeLessThan(1000);
    }
  });
});

describe('genDateString', () => {
  it('returns YYYY-MM-DD format', () => {
    const date = genDateString(new SeededPRNG(42));
    expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('year is in 2020-2026', () => {
    const prng = new SeededPRNG(42);
    for (let i = 0; i < 100; i++) {
      const date = genDateString(prng);
      const year = parseInt(date.split('-')[0], 10);
      expect(year).toBeGreaterThanOrEqual(2020);
      expect(year).toBeLessThanOrEqual(2026);
    }
  });
});

describe('genStatus', () => {
  it('returns a value from STATUSES', () => {
    const prng = new SeededPRNG(42);
    for (let i = 0; i < 50; i++) {
      expect(STATUSES).toContain(genStatus(prng));
    }
  });
});

describe('genCategory', () => {
  it('returns a value from CATEGORIES', () => {
    const prng = new SeededPRNG(42);
    for (let i = 0; i < 50; i++) {
      expect(CATEGORIES).toContain(genCategory(prng));
    }
  });
});

describe('genImagePlaceholder', () => {
  it('returns a data:image/svg+xml URI', () => {
    const uri = genImagePlaceholder(new SeededPRNG(42));
    expect(uri).toMatch(/^data:image\/svg\+xml,/);
  });
});

describe('genUrl', () => {
  it('starts with https://', () => {
    const url = genUrl(new SeededPRNG(42), 'Acme Corp');
    expect(url).toMatch(/^https:\/\//);
  });
});

describe('genRecord', () => {
  it('has all 10 fields', () => {
    const rec = genRecord(new SeededPRNG(42), 1);
    expect(rec).toHaveProperty('id', 1);
    expect(rec).toHaveProperty('name');
    expect(rec).toHaveProperty('company');
    expect(rec).toHaveProperty('email');
    expect(rec).toHaveProperty('status');
    expect(rec).toHaveProperty('category');
    expect(rec).toHaveProperty('price');
    expect(rec).toHaveProperty('date');
    expect(rec).toHaveProperty('image');
    expect(rec).toHaveProperty('website');
  });

  it('is deterministic', () => {
    const a = genRecord(new SeededPRNG(42), 1);
    const b = genRecord(new SeededPRNG(42), 1);
    expect(a).toEqual(b);
  });

  it('has correct types', () => {
    const rec = genRecord(new SeededPRNG(42), 5);
    expect(typeof rec.id).toBe('number');
    expect(typeof rec.name).toBe('string');
    expect(typeof rec.price).toBe('number');
    expect(rec.email).toContain('@');
    expect(rec.image).toMatch(/^data:image\/svg\+xml,/);
    expect(rec.website).toMatch(/^https:\/\//);
    expect(rec.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
