import { renderHook, act } from '@testing-library/react';
import { usePWA } from './usePWA';
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('virtual:pwa-register/react', () => {
  return {
    useRegisterSW: () => ({
      needRefresh: [false, vi.fn()],
      updateServiceWorker: vi.fn(),
    }),
  };
});

describe('usePWA', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window.navigator, 'onLine', {
      value: true,
      writable: true,
    });
  });

  it('tracks online/offline status', () => {
    const { result } = renderHook(() => usePWA());
    
    expect(result.current.isOnline).toBe(true);

    act(() => {
      window.dispatchEvent(new Event('offline'));
    });
    
    expect(result.current.isOnline).toBe(false);

    act(() => {
      window.dispatchEvent(new Event('online'));
    });
    
    expect(result.current.isOnline).toBe(true);
  });
});
