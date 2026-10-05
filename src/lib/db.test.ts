import { describe, it, expect, beforeEach } from 'vitest';
import {
  DEFAULT_SETTINGS,
  getSettings,
  saveSettings,
  getSession,
  saveSession,
  saveRecoveryData,
  getRecoveryData,
  clearRecoveryData,
  type SessionState,
} from './db';

describe('db.ts', () => {
  beforeEach(async () => {
    // Clear recovery and settings between tests
    await clearRecoveryData();
  });

  it('provides default settings with restorePreviousSession = true', () => {
    expect(DEFAULT_SETTINGS.restorePreviousSession).toBe(true);
  });

  it('saves and retrieves user settings including restorePreviousSession', async () => {
    const customSettings = {
      ...DEFAULT_SETTINGS,
      restorePreviousSession: false,
      fontSize: 16,
    };
    await saveSettings(customSettings);

    const loaded = await getSettings();
    expect(loaded.restorePreviousSession).toBe(false);
    expect(loaded.fontSize).toBe(16);
  });

  it('saves and retrieves session state correctly', async () => {
    const session: SessionState = {
      tabs: [
        {
          id: 'tab-1',
          filename: 'test.js',
          content: 'console.log("hello");',
          language: 'JavaScript',
          cursorPosition: { line: 1, column: 1 },
          scrollPosition: 0,
          isModified: false,
          fileHandle: null,
        },
        {
          id: 'tab-2',
          filename: 'notes.txt',
          content: 'My notes',
          language: 'Plain Text',
          cursorPosition: { line: 1, column: 1 },
          scrollPosition: 0,
          isModified: true,
          fileHandle: null,
        },
      ],
      activeTabId: 'tab-2',
      lastOpened: Date.now(),
    };

    await saveSession(session);
    const restored = await getSession();

    expect(restored).not.toBeNull();
    expect(restored?.tabs.length).toBe(2);
    expect(restored?.tabs[0].filename).toBe('test.js');
    expect(restored?.tabs[1].filename).toBe('notes.txt');
    expect(restored?.tabs[1].isModified).toBe(true);
    expect(restored?.activeTabId).toBe('tab-2');
  });

  it('manages recovery data correctly', async () => {
    await saveRecoveryData({
      tabId: 'tab-99',
      filename: 'unsaved.txt',
      content: 'unsaved draft',
      timestamp: Date.now(),
    });

    const recovery = await getRecoveryData();
    expect(recovery.length).toBe(1);
    expect(recovery[0].tabId).toBe('tab-99');
    expect(recovery[0].content).toBe('unsaved draft');

    await clearRecoveryData('tab-99');
    const emptyRecovery = await getRecoveryData();
    expect(emptyRecovery.length).toBe(0);
  });
});
