import { renderHook } from '@testing-library/react';
import { useKeyboardShortcuts } from './useKeyboardShortcuts';
import { vi, describe, it, expect } from 'vitest';

describe('useKeyboardShortcuts', () => {
  it('registers and handles keyboard shortcuts', () => {
    const handlers = {
      onNewFile: vi.fn(),
      onOpenFile: vi.fn(),
      onSave: vi.fn(),
      onSaveAs: vi.fn(),
      onCloseTab: vi.fn(),
      onFind: vi.fn(),
      onReplace: vi.fn(),
      onGoToLine: vi.fn(),
      onNextTab: vi.fn(),
      onPreviousTab: vi.fn(),
      onSwitchToTab: vi.fn(),
      onToggleCommandPalette: vi.fn(),
    };

    renderHook(() => useKeyboardShortcuts(handlers));

    const triggerShortcut = (key: string, ctrlKey = true, shiftKey = false) => {
      window.dispatchEvent(
        new KeyboardEvent('keydown', { key, ctrlKey, shiftKey, bubbles: true })
      );
    };

    triggerShortcut('n');
    expect(handlers.onNewFile).toHaveBeenCalled();

    triggerShortcut('o');
    expect(handlers.onOpenFile).toHaveBeenCalled();

    triggerShortcut('s');
    expect(handlers.onSave).toHaveBeenCalled();

    triggerShortcut('S', true, true);
    expect(handlers.onSaveAs).toHaveBeenCalled();

    triggerShortcut('w');
    expect(handlers.onCloseTab).toHaveBeenCalled();

    triggerShortcut('f');
    expect(handlers.onFind).toHaveBeenCalled();

    triggerShortcut('h');
    expect(handlers.onReplace).toHaveBeenCalled();

    triggerShortcut('g');
    expect(handlers.onGoToLine).toHaveBeenCalled();

    triggerShortcut('P', true, true);
    expect(handlers.onToggleCommandPalette).toHaveBeenCalled();

    triggerShortcut('Tab');
    expect(handlers.onNextTab).toHaveBeenCalled();

    triggerShortcut('Tab', true, true);
    expect(handlers.onPreviousTab).toHaveBeenCalled();

    triggerShortcut('1');
    expect(handlers.onSwitchToTab).toHaveBeenCalledWith(0);
  });
});
