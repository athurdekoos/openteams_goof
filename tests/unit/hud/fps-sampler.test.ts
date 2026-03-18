import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { FpsSampler } from '../../../src/hud/fps-sampler';

describe('FpsSampler', () => {
  beforeEach(() => {
    vi.spyOn(globalThis, 'requestAnimationFrame').mockImplementation((cb) => {
      return setTimeout(cb, 16) as unknown as number;
    });
    vi.spyOn(globalThis, 'cancelAnimationFrame').mockImplementation((id) => {
      clearTimeout(id);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('initial FPS is 0 and isRunning is false', () => {
    const sampler = new FpsSampler();
    expect(sampler.fps).toBe(0);
    expect(sampler.isRunning).toBe(false);
  });

  it('start() sets isRunning to true', () => {
    const sampler = new FpsSampler();
    sampler.start();
    expect(sampler.isRunning).toBe(true);
    sampler.stop();
  });

  it('stop() sets isRunning to false', () => {
    const sampler = new FpsSampler();
    sampler.start();
    sampler.stop();
    expect(sampler.isRunning).toBe(false);
  });

  it('start() is idempotent', () => {
    const sampler = new FpsSampler();
    sampler.start();
    sampler.start(); // Should not throw
    expect(sampler.isRunning).toBe(true);
    sampler.stop();
  });
});
