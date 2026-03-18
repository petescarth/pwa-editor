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

export function useEditorStore() {
  const { showToast } = useToast();
  const [tabs, setTabs] = useState<TabWithHandle[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [settings, setSettings] = useState<EditorSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const recoveryIntervalRef = useRef<number | null>(null);

  const activeTab = tabs.find((t) => t.id === activeTabId) || null;

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

  useEffect(() => {
    if (recoveryIntervalRef.current) {
      clearInterval(recoveryIntervalRef.current);
    }

    recoveryIntervalRef.current = window.setInterval(() => {
      tabs.forEach((tab) => {
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
  }, [tabs]);

  const updateSettings = useCallback(async (newSettings: Partial<EditorSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      saveSettings(updated);
      return updated;
    });
  }, []);

  const createTab = useCallback((filename = 'untitled.txt', content = '') => {
    const newTab: TabWithHandle = { ...createNewTab(filename, content), fileHandle: null };
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newTab.id);
    return newTab.id;
  }, []);

  const closeTab = useCallback((tabId: string) => {
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

  const closeOtherTabs = useCallback((tabId: string) => {
    setTabs((prev) => {
      const tab = prev.find((t) => t.id === tabId);
      if (!tab) return prev;

      prev.forEach((t) => {
        if (t.id !== tabId) {
          clearRecoveryData(t.id);
        }
      });

      return [tab];
    });
    setActiveTabId(tabId);
  }, []);

  const closeAllTabs = useCallback(() => {
    clearRecoveryData();
    const newTab: TabWithHandle = { ...createNewTab(), fileHandle: null };
    setTabs([newTab]);
    setActiveTabId(newTab.id);
  }, []);

  const closeTabsToRight = useCallback((tabId: string) => {
    setTabs((prev) => {
      const index = prev.findIndex((t) => t.id === tabId);
      if (index === -1) return prev;

      prev.slice(index + 1).forEach((t) => {
        clearRecoveryData(t.id);
      });

      const newTabs = prev.slice(0, index + 1);

      if (activeTabId && !newTabs.find((t) => t.id === activeTabId)) {
        setActiveTabId(tabId);
      }

      return newTabs;
    });
  }, [activeTabId]);

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
  }, [tabs, settings.maxFileSize]);

  const handleOpenFiles = useCallback(async () => {
    try {
      const { results, skipped } = await openFiles(settings.maxFileSize);

      if (skipped.length > 0) {
        showToast('Some files were skipped:\n' + skipped.join('\n'), 'warning');
      }

      if (results.length === 0) return; // nothing to open (all skipped or cancelled)

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
  }, [tabs, settings.maxFileSize]);

  const handleOpenRecentFile = useCallback(async (recentFile: RecentFile) => {
    try {
      if (!recentFile.handle) {
        // No handle stored (e.g. opened via fallback) — fall back to file picker
        await handleOpenFile();
        return;
      }

      const result = await openRecentFile(recentFile, settings.maxFileSize);
      if (!result) {
        // Permission denied or cancelled — fall back to file picker
        await handleOpenFile();
        return;
      }

      // Use isSameEntry() for reliable identity comparison across directories.
      // Also match modified tabs so we focus the existing tab rather than
      // opening a silent second copy of the same file.
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
    setActiveTabId,
    createTab,
    closeTab,
    closeOtherTabs,
    closeAllTabs,
    closeTabsToRight,
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
