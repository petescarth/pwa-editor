import { useCallback, useEffect, useRef, useState } from 'react';
import type { RecentFile } from '../lib/db';
import {
  clearRecoveryData,
  DEFAULT_SETTINGS,
  getRecoveryData,
  getSession,
  getSettings,
  saveRecoveryData,
  saveSession,
  saveSettings,
  type EditorSettings,
  type SessionState,
  type TabState,
} from '../lib/db';
import { openFile, openFiles, openRecentFile, saveFile, saveFileAs, type FileHandle } from '../lib/fileSystem';
import { getLanguageByExtension } from '../lib/languages';
import { useToast } from './useToast';

let tabIdCounter = 0;

function generateTabId(): string {
  return `tab-${Date.now()}-${++tabIdCounter}`;
}

function createNewTab(filename = 'untitled.txt', content = ''): TabState {
  return {
    id: generateTabId(),
    filename,
    content,
    language: getLanguageByExtension(filename).name,
    cursorPosition: { line: 1, column: 1 },
    scrollPosition: 0,
    isModified: false,
  };
}

interface TabWithHandle extends TabState {
  fileHandle: FileHandle | null;
}

// Describes a deferred close action awaiting user confirmation.
export interface PendingCloseAction {
  type: 'single' | 'batch';
  /** For 'single': the tab being closed */
  tabId?: string;
  filename?: string;
  /** For 'batch': all tab IDs to close (may be filtered down to modified ones) */
  tabIds?: string[];
  modifiedCount?: number;
  /** Callback that performs the actual close after confirmation */
  executeClose: () => void;
}

export function useEditorStore() {
  const { showToast } = useToast();
  const [tabs, setTabs] = useState<TabWithHandle[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [settings, setSettings] = useState<EditorSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingClose, setPendingClose] = useState<PendingCloseAction | null>(null);

  const recoveryIntervalRef = useRef<number | null>(null);
  const autoSaveIntervalRef = useRef<number | null>(null);

  // Keep a ref to tabs so interval callbacks always see the latest value
  const tabsRef = useRef<TabWithHandle[]>([]);
  tabsRef.current = tabs;

  const settingsRef = useRef<EditorSettings>(DEFAULT_SETTINGS);
  settingsRef.current = settings;

  const activeTab = tabs.find((t) => t.id === activeTabId) || null;

  // ── Initial State Load ────────────────────────────────────────────────────

  useEffect(() => {
    async function loadInitialState() {
      try {
        const [loadedSettings, loadedSession, recoveryData] = await Promise.all([
          getSettings(),
          getSession(),
          getRecoveryData(),
        ]);

        setSettings(loadedSettings);

        if (recoveryData.length > 0) {
          const recoveredTabs = recoveryData.map((data) => ({
            ...createNewTab(data.filename, data.content),
            id: data.tabId,
            isModified: true,
            fileHandle: null,
          }));
          setTabs(recoveredTabs);
          setActiveTabId(recoveredTabs[0].id);
          await clearRecoveryData();
        } else if (loadedSession && loadedSession.tabs.length > 0) {
          const restoredTabs: TabWithHandle[] = loadedSession.tabs.map((tab) => ({
            ...tab,
            fileHandle: null,
          }));
          setTabs(restoredTabs);
          setActiveTabId(loadedSession.activeTabId || restoredTabs[0].id);
        } else {
          const newTab = { ...createNewTab(), fileHandle: null };
          setTabs([newTab]);
          setActiveTabId(newTab.id);
        }
      } catch (err) {
        console.error('Failed to load initial state:', err);
        const newTab = { ...createNewTab(), fileHandle: null };
        setTabs([newTab]);
        setActiveTabId(newTab.id);
      } finally {
        setIsLoading(false);
      }
    }

    loadInitialState();
  }, []);

  // ── Session Persistence ───────────────────────────────────────────────────

  useEffect(() => {
    if (isLoading) return;

    const session: SessionState = {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      tabs: tabs.map(({ fileHandle, ...tab }) => tab),
      activeTabId,
      lastOpened: Date.now(),
    };
    saveSession(session);
  }, [tabs, activeTabId, isLoading]);

  // ── Crash Recovery Interval (IndexedDB, every 10 s) ───────────────────────

  useEffect(() => {
    if (recoveryIntervalRef.current) {
      clearInterval(recoveryIntervalRef.current);
    }

    recoveryIntervalRef.current = window.setInterval(() => {
      tabsRef.current.forEach((tab) => {
        if (tab.isModified) {
          saveRecoveryData({
            tabId: tab.id,
            content: tab.content,
            filename: tab.filename,
            timestamp: Date.now(),
          });
        }
      });
    }, 10000);

    return () => {
      if (recoveryIntervalRef.current) {
        clearInterval(recoveryIntervalRef.current);
      }
    };
  }, []);

  // ── Auto-Save Interval ────────────────────────────────────────────────────

  useEffect(() => {
    if (autoSaveIntervalRef.current) {
      clearInterval(autoSaveIntervalRef.current);
      autoSaveIntervalRef.current = null;
    }

    if (!settings.autoSave) return;

    autoSaveIntervalRef.current = window.setInterval(async () => {
      const currentTabs = tabsRef.current;
      for (const tab of currentTabs) {
        if (tab.isModified && tab.fileHandle) {
          try {
            const handle = await saveFile(tab.content, tab.fileHandle);
            if (handle) {
              setTabs((prev) =>
                prev.map((t) =>
                  t.id === tab.id ? { ...t, isModified: false } : t
                )
              );
              clearRecoveryData(tab.id);
            }
          } catch (err) {
            console.error(`Auto-save failed for "${tab.filename}":`, err);
          }
        }
      }
    }, settings.autoSaveInterval);

    return () => {
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
        autoSaveIntervalRef.current = null;
      }
    };
  }, [settings.autoSave, settings.autoSaveInterval]);

  // ── beforeunload Warning ──────────────────────────────────────────────────

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (tabsRef.current.some((t) => t.isModified)) {
        e.preventDefault();
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, []);

  // ── Settings ──────────────────────────────────────────────────────────────

  const updateSettings = useCallback(async (newSettings: Partial<EditorSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      saveSettings(updated);
      return updated;
    });
  }, []);

  // ── Tab Creation ──────────────────────────────────────────────────────────

  const createTab = useCallback((filename = 'untitled.txt', content = '') => {
    const newTab: TabWithHandle = { ...createNewTab(filename, content), fileHandle: null };
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newTab.id);
    return newTab.id;
  }, []);

  // ── Internal helpers ──────────────────────────────────────────────────────

  /** Actually remove a tab from state without any guards. */
  const _removeTab = useCallback((tabId: string) => {
    setTabs((prev) => {
      const index = prev.findIndex((t) => t.id === tabId);
      if (index === -1) return prev;

      const newTabs = prev.filter((t) => t.id !== tabId);

      if (newTabs.length === 0) {
        const newTab: TabWithHandle = { ...createNewTab(), fileHandle: null };
        setActiveTabId(newTab.id);
        return [newTab];
      }

      if (tabId === activeTabId) {
        const newActiveIndex = Math.min(index, newTabs.length - 1);
        setActiveTabId(newTabs[newActiveIndex].id);
      }

      return newTabs;
    });
    clearRecoveryData(tabId);
  }, [activeTabId]);

  /** Actually remove multiple tabs from state without any guards. */
  const _removeTabs = useCallback((tabIds: string[]) => {
    setTabs((prev) => {
      const idSet = new Set(tabIds);
      const newTabs = prev.filter((t) => !idSet.has(t.id));

      if (newTabs.length === 0) {
        const newTab: TabWithHandle = { ...createNewTab(), fileHandle: null };
        setActiveTabId(newTab.id);
        return [newTab];
      }

      if (activeTabId && idSet.has(activeTabId)) {
        setActiveTabId(newTabs[0].id);
      }

      return newTabs;
    });
    tabIds.forEach((id) => clearRecoveryData(id));
  }, [activeTabId]);

  // ── Close Tab (with confirmation if modified) ─────────────────────────────

  const closeTab = useCallback((tabId: string) => {
    const currentTabs = tabsRef.current;
    const tab = currentTabs.find((t) => t.id === tabId);
    if (!tab) return;

    const canAutoSave = settingsRef.current.autoSave && tab.fileHandle !== null;

    if (!tab.isModified || canAutoSave) {
      // If auto-save is on and file exists on disk, silently save then close
      if (canAutoSave && tab.isModified) {
        saveFile(tab.content, tab.fileHandle).then((handle) => {
          if (handle) {
            setTabs((prev) =>
              prev.map((t) => (t.id === tabId ? { ...t, isModified: false } : t))
            );
          }
          _removeTab(tabId);
        }).catch(() => _removeTab(tabId));
        return;
      }
      _removeTab(tabId);
      return;
    }

    // Modified + no auto-save: show confirmation dialog
    setPendingClose({
      type: 'single',
      tabId,
      filename: tab.filename,
      executeClose: () => _removeTab(tabId),
    });
  }, [_removeTab]);

  /**
   * Confirm save from the pending-close dialog (single tab).
   * Triggers save, then closes.
   */
  const confirmCloseSave = useCallback(async () => {
    if (!pendingClose) return;

    if (pendingClose.type === 'single' && pendingClose.tabId) {
      const tabId = pendingClose.tabId;
      const tab = tabsRef.current.find((t) => t.id === tabId);
      setPendingClose(null);
      if (tab) {
        const handle = await saveFile(tab.content, tab.fileHandle);
        if (handle) {
          setTabs((prev) =>
            prev.map((t) =>
              t.id === tabId
                ? { ...t, fileHandle: handle, filename: handle.name, isModified: false }
                : t
            )
          );
          clearRecoveryData(tabId);
        }
        // Close even if save was cancelled (AbortError)
      }
      _removeTab(tabId);
    } else if (pendingClose.type === 'batch' && pendingClose.tabIds) {
      const tabIds = pendingClose.tabIds;
      setPendingClose(null);
      // Save all modified tabs that have handles; for those without, just close
      const currentTabs = tabsRef.current;
      await Promise.all(
        tabIds.map(async (tabId) => {
          const tab = currentTabs.find((t) => t.id === tabId);
          if (tab?.isModified) {
            try {
              const handle = await saveFile(tab.content, tab.fileHandle);
              if (handle) {
                setTabs((prev) =>
                  prev.map((t) =>
                    t.id === tabId
                      ? { ...t, fileHandle: handle, filename: handle.name, isModified: false }
                      : t
                  )
                );
                clearRecoveryData(tabId);
              }
            } catch {
              // ignore individual save errors
            }
          }
        })
      );
      _removeTabs(tabIds);
    }
  }, [pendingClose, _removeTab, _removeTabs]);

  const confirmCloseDontSave = useCallback(() => {
    if (!pendingClose) return;
    const execute = pendingClose.executeClose;
    setPendingClose(null);
    execute();
  }, [pendingClose]);

  const confirmCloseCancel = useCallback(() => {
    setPendingClose(null);
  }, []);

  // ── Close Other/All/To-Right ──────────────────────────────────────────────

  const closeOtherTabs = useCallback((tabId: string) => {
    const currentTabs = tabsRef.current;
    const tabsToClose = currentTabs.filter((t) => t.id !== tabId);
    const modifiedUnsaved = tabsToClose.filter(
      (t) => t.isModified && !(settingsRef.current.autoSave && t.fileHandle)
    );

    const executeClose = () => {
      // Auto-save those that qualify
      const autoSavable = tabsToClose.filter(
        (t) => t.isModified && settingsRef.current.autoSave && t.fileHandle
      );
      Promise.all(
        autoSavable.map((t) =>
          saveFile(t.content, t.fileHandle).catch(() => null)
        )
      );
      setTabs((prev) => {
        const tab = prev.find((t) => t.id === tabId);
        if (!tab) return prev;
        prev.forEach((t) => {
          if (t.id !== tabId) clearRecoveryData(t.id);
        });
        return [tab];
      });
      setActiveTabId(tabId);
    };

    if (modifiedUnsaved.length === 0) {
      executeClose();
      return;
    }

    setPendingClose({
      type: 'batch',
      tabIds: tabsToClose.map((t) => t.id),
      modifiedCount: modifiedUnsaved.length,
      executeClose,
    });
  }, []);

  const closeAllTabs = useCallback(() => {
    const currentTabs = tabsRef.current;
    const modifiedUnsaved = currentTabs.filter(
      (t) => t.isModified && !(settingsRef.current.autoSave && t.fileHandle)
    );

    const executeClose = () => {
      clearRecoveryData();
      const newTab: TabWithHandle = { ...createNewTab(), fileHandle: null };
      setTabs([newTab]);
      setActiveTabId(newTab.id);
    };

    if (modifiedUnsaved.length === 0) {
      executeClose();
      return;
    }

    setPendingClose({
      type: 'batch',
      tabIds: currentTabs.map((t) => t.id),
      modifiedCount: modifiedUnsaved.length,
      executeClose,
    });
  }, []);

  const closeTabsToRight = useCallback((tabId: string) => {
    const currentTabs = tabsRef.current;
    const index = currentTabs.findIndex((t) => t.id === tabId);
    if (index === -1) return;

    const tabsToClose = currentTabs.slice(index + 1);
    const modifiedUnsaved = tabsToClose.filter(
      (t) => t.isModified && !(settingsRef.current.autoSave && t.fileHandle)
    );

    const executeClose = () => {
      tabsToClose.forEach((t) => clearRecoveryData(t.id));
      setTabs((prev) => {
        const newTabs = prev.slice(0, index + 1);
        if (activeTabId && !newTabs.find((t) => t.id === activeTabId)) {
          setActiveTabId(tabId);
        }
        return newTabs;
      });
    };

    if (modifiedUnsaved.length === 0) {
      executeClose();
      return;
    }

    setPendingClose({
      type: 'batch',
      tabIds: tabsToClose.map((t) => t.id),
      modifiedCount: modifiedUnsaved.length,
      executeClose,
    });
  }, [activeTabId]);

  // ── Tab Content / Cursor ──────────────────────────────────────────────────

  const updateTabContent = useCallback((tabId: string, content: string) => {
    setTabs((prev) =>
      prev.map((tab) =>
        tab.id === tabId
          ? { ...tab, content, isModified: tab.content !== content || tab.isModified }
          : tab
      )
    );
  }, []);

  const updateTabCursor = useCallback((tabId: string, line: number, column: number) => {
    setTabs((prev) =>
      prev.map((tab) =>
        tab.id === tabId ? { ...tab, cursorPosition: { line, column } } : tab
      )
    );
  }, []);

  // ── File Operations ───────────────────────────────────────────────────────

  const handleOpenFile = useCallback(async () => {
    try {
      const result = await openFile(settings.maxFileSize);
      if (!result) return;

      const existingTab = tabs.find(
        (t) => t.filename === result.handle.name && !t.isModified
      );

      if (existingTab) {
        setActiveTabId(existingTab.id);
        return;
      }

      const newTab: TabWithHandle = {
        ...createNewTab(result.handle.name, result.content),
        fileHandle: result.handle,
      };

      setTabs((prev) => [...prev, newTab]);
      setActiveTabId(newTab.id);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to open file', 'error');
    }
  }, [tabs, settings.maxFileSize, showToast]);

  const handleOpenFiles = useCallback(async () => {
    try {
      const { results, skipped } = await openFiles(settings.maxFileSize);

      if (skipped.length > 0) {
        showToast('Some files were skipped:\n' + skipped.join('\n'), 'warning');
      }

      if (results.length === 0) return;

      const newTabs: TabWithHandle[] = [];

      for (const result of results) {
        const existingTab = tabs.find(
          (t) => t.filename === result.handle.name && !t.isModified
        );

        if (!existingTab) {
          newTabs.push({
            ...createNewTab(result.handle.name, result.content),
            fileHandle: result.handle,
          });
        }
      }

      if (newTabs.length > 0) {
        setTabs((prev) => [...prev, ...newTabs]);
        setActiveTabId(newTabs[newTabs.length - 1].id);
      }
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to open files', 'error');
    }
  }, [tabs, settings.maxFileSize, showToast]);

  const handleOpenRecentFile = useCallback(async (recentFile: RecentFile) => {
    try {
      if (!recentFile.handle) {
        await handleOpenFile();
        return;
      }

      const result = await openRecentFile(recentFile, settings.maxFileSize);
      if (!result) {
        await handleOpenFile();
        return;
      }

      let existingTab: TabWithHandle | undefined;
      if (result.handle.handle) {
        for (const t of tabs) {
          if (t.fileHandle?.handle) {
            const same = await t.fileHandle.handle.isSameEntry(result.handle.handle);
            if (same) {
              existingTab = t;
              break;
            }
          }
        }
      }

      if (existingTab) {
        setActiveTabId(existingTab.id);
        return;
      }

      const newTab: TabWithHandle = {
        ...createNewTab(result.handle.name, result.content),
        fileHandle: result.handle,
      };

      setTabs((prev) => [...prev, newTab]);
      setActiveTabId(newTab.id);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to open recent file', 'error');
    }
  }, [tabs, settings.maxFileSize, handleOpenFile, showToast]);

  const handleSaveFile = useCallback(async (tabId?: string) => {
    const targetId = tabId || activeTabId;
    if (!targetId) return;

    const tab = tabs.find((t) => t.id === targetId);
    if (!tab) return;

    const handle = await saveFile(tab.content, tab.fileHandle);
    if (!handle) return;

    setTabs((prev) =>
      prev.map((t) =>
        t.id === targetId
          ? {
              ...t,
              fileHandle: handle,
              filename: handle.name,
              isModified: false,
              language: getLanguageByExtension(handle.name).name,
            }
          : t
      )
    );

    clearRecoveryData(targetId);
  }, [activeTabId, tabs]);

  const handleSaveFileAs = useCallback(async (tabId?: string) => {
    const targetId = tabId || activeTabId;
    if (!targetId) return;

    const tab = tabs.find((t) => t.id === targetId);
    if (!tab) return;

    const handle = await saveFileAs(tab.content, tab.filename);
    if (!handle) return;

    setTabs((prev) =>
      prev.map((t) =>
        t.id === targetId
          ? {
              ...t,
              fileHandle: handle,
              filename: handle.name,
              isModified: false,
              language: getLanguageByExtension(handle.name).name,
            }
          : t
      )
    );

    clearRecoveryData(targetId);
  }, [activeTabId, tabs]);

  // ── Tab Ordering / Navigation ─────────────────────────────────────────────

  const reorderTabs = useCallback((fromIndex: number, toIndex: number) => {
    setTabs((prev) => {
      const newTabs = [...prev];
      const [removed] = newTabs.splice(fromIndex, 1);
      newTabs.splice(toIndex, 0, removed);
      return newTabs;
    });
  }, []);

  const switchToTab = useCallback((index: number) => {
    if (index >= 0 && index < tabs.length) {
      setActiveTabId(tabs[index].id);
    }
  }, [tabs]);

  const switchToNextTab = useCallback(() => {
    if (tabs.length <= 1) return;
    const currentIndex = tabs.findIndex((t) => t.id === activeTabId);
    const nextIndex = (currentIndex + 1) % tabs.length;
    setActiveTabId(tabs[nextIndex].id);
  }, [tabs, activeTabId]);

  const switchToPreviousTab = useCallback(() => {
    if (tabs.length <= 1) return;
    const currentIndex = tabs.findIndex((t) => t.id === activeTabId);
    const prevIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    setActiveTabId(tabs[prevIndex].id);
  }, [tabs, activeTabId]);

  return {
    tabs,
    activeTab,
    activeTabId,
    settings,
    isLoading,
    pendingClose,
    setActiveTabId,
    createTab,
    closeTab,
    closeOtherTabs,
    closeAllTabs,
    closeTabsToRight,
    confirmCloseSave,
    confirmCloseDontSave,
    confirmCloseCancel,
    updateTabContent,
    updateTabCursor,
    updateSettings,
    handleOpenFile,
    handleOpenFiles,
    handleOpenRecentFile,
    handleSaveFile,
    handleSaveFileAs,
    reorderTabs,
    switchToTab,
    switchToNextTab,
    switchToPreviousTab,
  };
}
