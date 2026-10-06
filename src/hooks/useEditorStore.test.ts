import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useEditorStore } from './useEditorStore';
import {
  saveSession,
  saveSettings,
  saveRecoveryData,
  clearRecoveryData,
  DEFAULT_SETTINGS,
  type SessionState,
} from '../lib/db';

describe('useEditorStore - Session Restore', () => {
  beforeEach(async () => {
    await clearRecoveryData();
  });

  it('restores previous session tabs when restorePreviousSession is true', async () => {
    await saveSettings({
      ...DEFAULT_SETTINGS,
      restorePreviousSession: true,
    });

    const previousSession: SessionState = {
      tabs: [
        {
          id: 'tab-1',
          filename: 'main.py',
          content: 'print("hello")',
          language: 'Python',
          cursorPosition: { line: 1, column: 1 },
          scrollPosition: 0,
          isModified: false,
          fileHandle: null,
        },
        {
          id: 'tab-2',
          filename: 'README.md',
          content: '# Docs',
          language: 'Markdown',
          cursorPosition: { line: 2, column: 1 },
          scrollPosition: 0,
          isModified: true,
          fileHandle: null,
        },
      ],
      activeTabId: 'tab-2',
      lastOpened: Date.now(),
    };
    await saveSession(previousSession);

    const { result } = renderHook(() => useEditorStore());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.tabs.length).toBe(2);
    expect(result.current.tabs[0].filename).toBe('main.py');
    expect(result.current.tabs[1].filename).toBe('README.md');
    expect(result.current.activeTabId).toBe('tab-2');
  });

  it('does NOT restore previous session tabs when restorePreviousSession is false', async () => {
    await saveSettings({
      ...DEFAULT_SETTINGS,
      restorePreviousSession: false,
    });

    const previousSession: SessionState = {
      tabs: [
        {
          id: 'tab-1',
          filename: 'secret.txt',
          content: 'do not restore',
          language: 'Plain Text',
          cursorPosition: { line: 1, column: 1 },
          scrollPosition: 0,
          isModified: false,
          fileHandle: null,
        },
      ],
      activeTabId: 'tab-1',
      lastOpened: Date.now(),
    };
    await saveSession(previousSession);

    const { result } = renderHook(() => useEditorStore());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Should ignore previous session and create 1 fresh untitled tab
    expect(result.current.tabs.length).toBe(1);
    expect(result.current.tabs[0].filename).toBe('untitled.txt');
    expect(result.current.tabs[0].content).toBe('');
  });

  it('merges recovery data into session tabs without discarding non-modified tabs', async () => {
    await saveSettings({
      ...DEFAULT_SETTINGS,
      restorePreviousSession: true,
    });

    const previousSession: SessionState = {
      tabs: [
        {
          id: 'tab-a',
          filename: 'saved.ts',
          content: 'const a = 1;',
          language: 'TypeScript',
          cursorPosition: { line: 1, column: 1 },
          scrollPosition: 0,
          isModified: false,
          fileHandle: null,
        },
        {
          id: 'tab-b',
          filename: 'modified.ts',
          content: 'old content',
          language: 'TypeScript',
          cursorPosition: { line: 1, column: 1 },
          scrollPosition: 0,
          isModified: false,
          fileHandle: null,
        },
      ],
      activeTabId: 'tab-a',
      lastOpened: Date.now(),
    };
    await saveSession(previousSession);

    // Save recovery data for tab-b
    await saveRecoveryData({
      tabId: 'tab-b',
      filename: 'modified.ts',
      content: 'recovered unsaved edits!',
      timestamp: Date.now(),
    });

    const { result } = renderHook(() => useEditorStore());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.tabs.length).toBe(2);
    // tab-a should still exist!
    expect(result.current.tabs[0].filename).toBe('saved.ts');
    expect(result.current.tabs[0].content).toBe('const a = 1;');
    // tab-b should have recovered content and isModified: true
    expect(result.current.tabs[1].filename).toBe('modified.ts');
    expect(result.current.tabs[1].content).toBe('recovered unsaved edits!');
    expect(result.current.tabs[1].isModified).toBe(true);
  });

  it('updates restorePreviousSession setting', async () => {
    const { result } = renderHook(() => useEditorStore());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.settings.restorePreviousSession).toBe(true);

    await act(async () => {
      await result.current.updateSettings({ restorePreviousSession: false });
    });

    expect(result.current.settings.restorePreviousSession).toBe(false);
  });

  it('does NOT call e.preventDefault() on beforeunload in Chrome extension context even when modified', async () => {
    // Simulate Chrome extension environment
    const originalChrome = (globalThis as unknown as { chrome?: unknown }).chrome;
    (globalThis as unknown as { chrome: unknown }).chrome = {
      runtime: { id: 'test-extension-id' },
    };

    try {
      const { result } = renderHook(() => useEditorStore());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Modify the tab
      act(() => {
        result.current.updateTabContent(result.current.tabs[0].id, 'Modified content');
      });

      expect(result.current.tabs[0].isModified).toBe(true);

      const event = new Event('beforeunload', { cancelable: true });
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

      window.dispatchEvent(event);

      // In extension context, preventDefault must NOT be called to avoid crashing Chromium
      expect(preventDefaultSpy).not.toHaveBeenCalled();
    } finally {
      if (originalChrome !== undefined) {
        (globalThis as unknown as { chrome: unknown }).chrome = originalChrome;
      } else {
        delete (globalThis as unknown as { chrome?: unknown }).chrome;
      }
    }
  });

  it('calls e.preventDefault() on beforeunload in standard web context when modified', async () => {
    delete (globalThis as unknown as { chrome?: unknown }).chrome;

    const { result } = renderHook(() => useEditorStore());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.updateTabContent(result.current.tabs[0].id, 'Web modified text');
    });

    expect(result.current.tabs[0].isModified).toBe(true);

    const event = new Event('beforeunload', { cancelable: true });
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

    window.dispatchEvent(event);

    expect(preventDefaultSpy).toHaveBeenCalled();
  });
});
