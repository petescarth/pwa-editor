import { redo, undo } from '@codemirror/commands';
import { EditorView } from '@codemirror/view';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AboutModal } from './components/AboutModal';
import { CommandPalette } from './components/CommandPalette';
import { ConfirmCloseModal } from './components/ConfirmCloseModal';
import { Editor } from './components/Editor';
import { FindReplace } from './components/FindReplace';
import { GoToLineModal } from './components/GoToLineModal';
import { MenuBar } from './components/MenuBar';
import { SettingsModal } from './components/SettingsModal';
import { ShortcutsModal } from './components/ShortcutsModal';
import { StatusBar } from './components/StatusBar';
import { TabBar } from './components/TabBar';
import { UpdateNotification } from './components/UpdateNotification';
import { useEditorStore } from './hooks/useEditorStore';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { usePWA } from './hooks/usePWA';
import { clearRecentFiles, getRecentFiles, type RecentFile } from './lib/db';

function App() {
  const {
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
    handleOpenFile: openFileFromStore,
    handleOpenRecentFile: openRecentFileFromStore,
    handleSaveFile,
    handleSaveFileAs: saveFileAsFromStore,
    reorderTabs,
    switchToTab,
    switchToNextTab,
    switchToPreviousTab,
  } = useEditorStore();

  const { isOnline, updateAvailable, applyUpdate, dismissUpdate } = usePWA();

  const [showFind, setShowFind] = useState(false);
  const [showReplace, setShowReplace] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showGoToLine, setShowGoToLine] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [recentFiles, setRecentFiles] = useState<RecentFile[]>([]);

  const editorViewRef = useRef<EditorView | null>(null);

  useEffect(() => {
    getRecentFiles().then(setRecentFiles);
  }, []);

  const refreshRecentFiles = useCallback(() => {
    getRecentFiles().then(setRecentFiles).catch((err) => {
      console.error('Failed to refresh recent files:', err);
    });
  }, []);

  const handleOpenFile = useCallback(async () => {
    await openFileFromStore();
    refreshRecentFiles();
  }, [openFileFromStore, refreshRecentFiles]);

  const handleSaveFileAs = useCallback(async (tabId?: string) => {
    await saveFileAsFromStore(tabId);
    refreshRecentFiles();
  }, [saveFileAsFromStore, refreshRecentFiles]);

  const handleNewFile = useCallback(() => createTab(), [createTab]);

  const handleCloseTab = useCallback(() => {
    if (activeTabId) closeTab(activeTabId);
  }, [activeTabId, closeTab]);

  const handleFind = useCallback(() => {
    setShowFind(true);
    setShowReplace(false);
  }, []);

  const handleReplace = useCallback(() => {
    setShowFind(true);
    setShowReplace(true);
  }, []);

  const handleCloseFindReplace = useCallback(() => {
    setShowFind(false);
    setShowReplace(false);
  }, []);

  const handleGoToLine = useCallback(() => {
    setShowGoToLine(true);
  }, []);

  const handleUndo = useCallback(() => {
    if (editorViewRef.current) {
      undo(editorViewRef.current);
    }
  }, []);

  const handleRedo = useCallback(() => {
    if (editorViewRef.current) {
      redo(editorViewRef.current);
    }
  }, []);

  const handleCut = useCallback(() => {
    document.execCommand('cut');
  }, []);

  const handleCopy = useCallback(() => {
    document.execCommand('copy');
  }, []);

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (editorViewRef.current) {
        const { from, to } = editorViewRef.current.state.selection.main;
        editorViewRef.current.dispatch({
          changes: { from, to, insert: text },
        });
      }
    } catch {
      document.execCommand('paste');
    }
  }, []);

  const handleSelectAll = useCallback(() => {
    if (editorViewRef.current) {
      editorViewRef.current.dispatch({
        selection: { anchor: 0, head: editorViewRef.current.state.doc.length },
      });
    }
  }, []);

  const handleDuplicateLine = useCallback(() => {
    if (!editorViewRef.current) return;
    const view = editorViewRef.current;
    const { from } = view.state.selection.main;
    const line = view.state.doc.lineAt(from);
    view.dispatch({
      changes: { from: line.to, insert: '\n' + line.text },
    });
  }, []);

  const handleToggleLineNumbers = useCallback(() => {
    updateSettings({ lineNumbers: !settings.lineNumbers });
  }, [settings.lineNumbers, updateSettings]);

  const handleToggleWordWrap = useCallback(() => {
    updateSettings({ wordWrap: !settings.wordWrap });
  }, [settings.wordWrap, updateSettings]);

  const handleIncreaseFontSize = useCallback(() => {
    updateSettings({ fontSize: Math.min(settings.fontSize + 1, 24) });
  }, [settings.fontSize, updateSettings]);

  const handleDecreaseFontSize = useCallback(() => {
    updateSettings({ fontSize: Math.max(settings.fontSize - 1, 10) });
  }, [settings.fontSize, updateSettings]);

  const handleToggleTheme = useCallback(() => {
    updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' });
  }, [settings.theme, updateSettings]);

  const handleOpenRecentFile = useCallback(async (file: RecentFile) => {
    await openRecentFileFromStore(file);
    refreshRecentFiles();
  }, [openRecentFileFromStore, refreshRecentFiles]);

  const handleClearRecentFiles = useCallback(async () => {
    await clearRecentFiles();
    setRecentFiles([]);
  }, []);

  const handleToggleCommandPalette = useCallback(() => {
    setShowCommandPalette((prev) => !prev);
  }, []);

  const commands = useMemo(() => [
    { id: 'new-file', label: 'New File', shortcut: 'Ctrl+N', action: handleNewFile },
    { id: 'open-file', label: 'Open File', shortcut: 'Ctrl+O', action: handleOpenFile },
    { id: 'save', label: 'Save', shortcut: 'Ctrl+S', action: () => handleSaveFile() },
    { id: 'save-as', label: 'Save As', shortcut: 'Ctrl+Shift+S', action: () => handleSaveFileAs() },
    { id: 'close-tab', label: 'Close Tab', shortcut: 'Ctrl+W', action: handleCloseTab },
    { id: 'close-all', label: 'Close All Tabs', action: closeAllTabs },
    { id: 'undo', label: 'Undo', shortcut: 'Ctrl+Z', action: handleUndo },
    { id: 'redo', label: 'Redo', shortcut: 'Ctrl+Y', action: handleRedo },
    { id: 'cut', label: 'Cut', shortcut: 'Ctrl+X', action: handleCut },
    { id: 'copy', label: 'Copy', shortcut: 'Ctrl+C', action: handleCopy },
    { id: 'paste', label: 'Paste', shortcut: 'Ctrl+V', action: handlePaste },
    { id: 'select-all', label: 'Select All', shortcut: 'Ctrl+A', action: handleSelectAll },
    { id: 'duplicate-line', label: 'Duplicate Line', shortcut: 'Ctrl+D', action: handleDuplicateLine },
    { id: 'find', label: 'Find', shortcut: 'Ctrl+F', action: handleFind },
    { id: 'replace', label: 'Find and Replace', shortcut: 'Ctrl+H', action: handleReplace },
    { id: 'go-to-line', label: 'Go to Line', shortcut: 'Ctrl+G', action: handleGoToLine },
    { id: 'toggle-line-numbers', label: 'Toggle Line Numbers', action: handleToggleLineNumbers },
    { id: 'toggle-word-wrap', label: 'Toggle Word Wrap', action: handleToggleWordWrap },
    { id: 'increase-font', label: 'Increase Font Size', shortcut: 'Ctrl++', action: handleIncreaseFontSize },
    { id: 'decrease-font', label: 'Decrease Font Size', shortcut: 'Ctrl+-', action: handleDecreaseFontSize },
    { id: 'toggle-theme', label: 'Toggle Theme', action: handleToggleTheme },
    { id: 'settings', label: 'Open Settings', action: () => setShowSettings(true) },
    { id: 'shortcuts', label: 'Keyboard Shortcuts', action: () => setShowShortcuts(true) },
    { id: 'about', label: 'About', action: () => setShowAbout(true) },
  ], [
    handleNewFile, handleOpenFile, handleSaveFile, handleSaveFileAs,
    handleCloseTab, closeAllTabs, handleUndo, handleRedo, handleCut,
    handleCopy, handlePaste, handleSelectAll, handleDuplicateLine,
    handleFind, handleReplace, handleGoToLine, handleToggleLineNumbers,
    handleToggleWordWrap, handleIncreaseFontSize, handleDecreaseFontSize,
    handleToggleTheme,
  ]);

  useKeyboardShortcuts({
    onNewFile: handleNewFile,
    onOpenFile: handleOpenFile,
    onSave: () => handleSaveFile(),
    onSaveAs: () => handleSaveFileAs(),
    onCloseTab: handleCloseTab,
    onFind: handleFind,
    onReplace: handleReplace,
    onGoToLine: handleGoToLine,
    onNextTab: switchToNextTab,
    onPreviousTab: switchToPreviousTab,
    onSwitchToTab: switchToTab,
    onToggleCommandPalette: handleToggleCommandPalette,
  });

  const handleContentChange = useCallback(
    (content: string) => {
      if (activeTabId) {
        updateTabContent(activeTabId, content);
      }
    },
    [activeTabId, updateTabContent]
  );

  const handleCursorChange = useCallback(
    (line: number, column: number) => {
      if (activeTabId) {
        updateTabCursor(activeTabId, line, column);
      }
    },
    [activeTabId, updateTabCursor]
  );

  useEffect(() => {
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDrop = async (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const files = e.dataTransfer?.files;
      if (!files || files.length === 0) return;

      for (const file of files) {
        const content = await file.text();
        createTab(file.name, content);
      }
    };

    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('drop', handleDrop);

    return () => {
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('drop', handleDrop);
    };
  }, [createTab]);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-[#1e1e1e]">
        <div className="text-[#cccccc] text-sm">Loading...</div>
      </div>
    );
  }

  const totalLines = activeTab
    ? activeTab.content.split('\n').length
    : 1;

  return (
    <div className={`h-full flex flex-col ${settings.theme === 'light' ? 'bg-white' : 'bg-[#1e1e1e]'}`}>
      <MenuBar
        onNewFile={handleNewFile}
        onOpenFile={handleOpenFile}
        onSave={() => handleSaveFile()}
        onSaveAs={() => handleSaveFileAs()}
        onCloseTab={handleCloseTab}
        onCloseAllTabs={closeAllTabs}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onCut={handleCut}
        onCopy={handleCopy}
        onPaste={handlePaste}
        onSelectAll={handleSelectAll}
        onDuplicateLine={handleDuplicateLine}
        onToggleLineNumbers={handleToggleLineNumbers}
        onToggleWordWrap={handleToggleWordWrap}
        onIncreaseFontSize={handleIncreaseFontSize}
        onDecreaseFontSize={handleDecreaseFontSize}
        onToggleTheme={handleToggleTheme}
        onOpenSettings={() => setShowSettings(true)}
        onFind={handleFind}
        onReplace={handleReplace}
        onGoToLine={handleGoToLine}
        onShowShortcuts={() => setShowShortcuts(true)}
        onShowAbout={() => setShowAbout(true)}
        recentFiles={recentFiles}
        onOpenRecentFile={handleOpenRecentFile}
        onClearRecentFiles={handleClearRecentFiles}
        lineNumbers={settings.lineNumbers}
        wordWrap={settings.wordWrap}
        theme={settings.theme}
      />

      <TabBar
        tabs={tabs.map((t) => ({
          id: t.id,
          filename: t.filename,
          isModified: t.isModified,
        }))}
        activeTabId={activeTabId}
        onSelectTab={setActiveTabId}
        onCloseTab={closeTab}
        onCloseOther={closeOtherTabs}
        onCloseAll={closeAllTabs}
        onCloseToRight={closeTabsToRight}
        onReorderTabs={reorderTabs}
      />

      <FindReplace
        editorView={editorViewRef.current}
        isOpen={showFind}
        showReplace={showReplace}
        onClose={handleCloseFindReplace}
      />

      <div className="flex-1 min-h-0">
        {activeTab && (
          <Editor
            content={activeTab.content}
            filename={activeTab.filename}
            settings={settings}
            onChange={handleContentChange}
            onCursorChange={handleCursorChange}
            editorViewRef={editorViewRef}
          />
        )}
      </div>

      <StatusBar
        line={activeTab?.cursorPosition.line || 1}
        column={activeTab?.cursorPosition.column || 1}
        language={activeTab?.language || 'Plain Text'}
        tabSize={settings.tabSize}
        insertSpaces={settings.insertSpaces}
        isOnline={isOnline}
      />

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onUpdateSettings={updateSettings}
      />

      <ShortcutsModal
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />

      <AboutModal
        isOpen={showAbout}
        onClose={() => setShowAbout(false)}
      />

      <GoToLineModal
        isOpen={showGoToLine}
        onClose={() => setShowGoToLine(false)}
        editorView={editorViewRef.current}
        totalLines={totalLines}
      />

      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        commands={commands}
      />

      <UpdateNotification
        isVisible={updateAvailable}
        onUpdate={applyUpdate}
        onDismiss={dismissUpdate}
      />

      <ConfirmCloseModal
        pendingClose={pendingClose}
        onSave={confirmCloseSave}
        onDontSave={confirmCloseDontSave}
        onCancel={confirmCloseCancel}
      />
    </div>
  );
}

export default App;
