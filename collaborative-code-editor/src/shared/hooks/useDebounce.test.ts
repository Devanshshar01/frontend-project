import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useDebounce } from './useDebounce';

/**
 * Test suite for useDebounce hook
 * Tests timing and debouncing behavior
 */

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 500));
    expect(result.current).toBe('initial');
  });

  it('debounces value changes', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 500 },
      }
    );

    expect(result.current).toBe('initial');

    // Update value
    rerender({ value: 'updated', delay: 500 });
    expect(result.current).toBe('initial'); // Still initial

    // Fast-forward time
    vi.advanceTimersByTime(500);

    await waitFor(() => {
      expect(result.current).toBe('updated');
    });
  });

  it('cancels previous timeout on rapid changes', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'first', delay: 500 },
      }
    );

    rerender({ value: 'second', delay: 500 });
    vi.advanceTimersByTime(250);

    rerender({ value: 'third', delay: 500 });
    vi.advanceTimersByTime(250);

    // Should still be first
    expect(result.current).toBe('first');

    // Fast-forward remaining time
    vi.advanceTimersByTime(250);

    await waitFor(() => {
      expect(result.current).toBe('third');
    });
  });

  it('works with different delay values', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 1000 },
      }
    );

    rerender({ value: 'updated', delay: 1000 });
    
    vi.advanceTimersByTime(999);
    expect(result.current).toBe('initial');

    vi.advanceTimersByTime(1);
    
    await waitFor(() => {
      expect(result.current).toBe('updated');
    });
  });

  it('works with non-string values', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 42, delay: 500 },
      }
    );

    expect(result.current).toBe(42);

    rerender({ value: 100, delay: 500 });
    vi.advanceTimersByTime(500);

    await waitFor(() => {
      expect(result.current).toBe(100);
    });
  });
});
