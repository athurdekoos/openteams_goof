import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TimerManager } from '../../src/timer-manager';

describe('TimerManager', () => {
  let tm: TimerManager;

  beforeEach(() => {
    vi.useFakeTimers();
    tm = new TimerManager();
  });

  afterEach(() => {
    tm.dispose();
    vi.useRealTimers();
  });

  it('register starts interval; callback fires on timer advance', () => {
    const cb = vi.fn();
    tm.register('t1', cb, 100);
    vi.advanceTimersByTime(100);
    expect(cb).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(200);
    expect(cb).toHaveBeenCalledTimes(3);
  });

  it('re-register with same ID replaces the timer', () => {
    const cb1 = vi.fn();
    const cb2 = vi.fn();
    tm.register('t1', cb1, 100);
    tm.register('t1', cb2, 100);
    vi.advanceTimersByTime(100);
    expect(cb1).not.toHaveBeenCalled();
    expect(cb2).toHaveBeenCalledTimes(1);
  });

  it('unregister stops callback', () => {
    const cb = vi.fn();
    tm.register('t1', cb, 100);
    tm.unregister('t1');
    vi.advanceTimersByTime(500);
    expect(cb).not.toHaveBeenCalled();
  });

  it('unregister ignores unknown IDs', () => {
    expect(() => tm.unregister('nonexistent')).not.toThrow();
  });

  it('pauseAll stops all callbacks and sets paused=true', () => {
    const cb = vi.fn();
    tm.register('t1', cb, 100);
    tm.pauseAll();
    expect(tm.paused).toBe(true);
    vi.advanceTimersByTime(500);
    expect(cb).not.toHaveBeenCalled();
  });

  it('pauseAll emits signal with true', () => {
    const listener = vi.fn();
    tm.pausedChanged.connect(listener);
    tm.pauseAll();
    expect(listener).toHaveBeenCalledWith(tm, true);
  });

  it('pauseAll is idempotent', () => {
    const listener = vi.fn();
    tm.pausedChanged.connect(listener);
    tm.pauseAll();
    tm.pauseAll();
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('resumeAll restarts callbacks and sets paused=false', () => {
    const cb = vi.fn();
    tm.register('t1', cb, 100);
    tm.pauseAll();
    tm.resumeAll();
    expect(tm.paused).toBe(false);
    vi.advanceTimersByTime(100);
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it('resumeAll emits signal with false', () => {
    const listener = vi.fn();
    tm.pausedChanged.connect(listener);
    tm.pauseAll();
    tm.resumeAll();
    expect(listener).toHaveBeenCalledWith(tm, false);
  });

  it('resumeAll is idempotent', () => {
    const listener = vi.fn();
    tm.pausedChanged.connect(listener);
    tm.resumeAll();
    expect(listener).not.toHaveBeenCalled();
  });

  it('togglePause flips state', () => {
    expect(tm.paused).toBe(false);
    tm.togglePause();
    expect(tm.paused).toBe(true);
    tm.togglePause();
    expect(tm.paused).toBe(false);
  });

  it('setGlobalFrequency adjusts intervals', () => {
    const cb = vi.fn();
    tm.register('t1', cb, 100);
    // Factor=0.5 → interval=50ms
    tm.setGlobalFrequency(0.5);
    vi.advanceTimersByTime(50);
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it('setGlobalFrequency clamps minimum to 16ms', () => {
    const cb = vi.fn();
    tm.register('t1', cb, 10);
    // Even with 0.1 factor → Math.max(16, 1) → 16ms
    tm.setGlobalFrequency(0.1);
    vi.advanceTimersByTime(16);
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it('setGlobalFrequency does not restart paused timers', () => {
    const cb = vi.fn();
    tm.register('t1', cb, 100);
    tm.pauseAll();
    tm.setGlobalFrequency(0.5);
    vi.advanceTimersByTime(500);
    expect(cb).not.toHaveBeenCalled();
  });

  it('dispose clears all timers', () => {
    const cb = vi.fn();
    tm.register('t1', cb, 100);
    tm.dispose();
    vi.advanceTimersByTime(500);
    expect(cb).not.toHaveBeenCalled();
  });

  it('timer registered while paused has null handle and starts on resume', () => {
    tm.pauseAll();
    const cb = vi.fn();
    tm.register('t1', cb, 100);
    vi.advanceTimersByTime(500);
    expect(cb).not.toHaveBeenCalled();

    tm.resumeAll();
    vi.advanceTimersByTime(100);
    expect(cb).toHaveBeenCalledTimes(1);
  });
});
