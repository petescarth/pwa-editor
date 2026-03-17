import { useEffect, useCallback } from 'react';

interface ShortcutHandlers {
  onNewFile: () => void;
  onOpenFile: () => void;
  onSave: () => void;
  onSaveAs: () => void;
  onCloseTab: () => void;
  onFind: () => void;
  onReplace: () => void;
  onGoToLine: () => void;
  onNextTab: () => void;
  onPreviousTab: () => void;
  onSwitchToTab: (index: number) => void;
  onToggleCommandPalette: () => void;
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modKey = isMac ? e.metaKey : e.ctrlKey;

      if (modKey && e.key === 'n') {
        e.preventDefault();
        handlers.onNewFile();
        return;
      }

      if (modKey && e.key === 'o') {
        e.preventDefault();
        handlers.onOpenFile();
        return;
      }

      if (modKey && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        handlers.onSaveAs();
        return;
      }

      if (modKey && e.key === 's') {
        e.preventDefault();
        handlers.onSave();
        return;
      }

      if (modKey && e.key === 'w') {
        e.preventDefault();
        handlers.onCloseTab();
        return;
      }

      if (modKey && e.key === 'f') {
        e.preventDefault();
        handlers.onFind();
        return;
      }

      if (modKey && e.key === 'h') {
        e.preventDefault();
        handlers.onReplace();
        return;
      }

      if (modKey && e.key === 'g') {
        e.preventDefault();
        handlers.onGoToLine();
        return;
      }

      if (modKey && e.shiftKey && e.key === 'P') {
        e.preventDefault();
        handlers.onToggleCommandPalette();
        return;
      }

      if (modKey && e.key === 'Tab') {
        e.preventDefault();
        if (e.shiftKey) {
          handlers.onPreviousTab();
        } else {
          handlers.onNextTab();
        }
        return;
      }

      if (modKey && e.key >= '1' && e.key <= '9') {
        e.preventDefault();
        handlers.onSwitchToTab(parseInt(e.key) - 1);
        return;
      }
    },
    [handlers]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
}

export const SHORTCUTS = [
  { category: 'File', shortcuts: [
    { keys: 'Ctrl+N', description: 'New File' },
    { keys: 'Ctrl+O', description: 'Open File' },
    { keys: 'Ctrl+S', description: 'Save' },
    { keys: 'Ctrl+Shift+S', description: 'Save As' },
    { keys: 'Ctrl+W', description: 'Close Tab' },
  ]},
  { category: 'Edit', shortcuts: [
    { keys: 'Ctrl+Z', description: 'Undo' },
    { keys: 'Ctrl+Y', description: 'Redo' },
    { keys: 'Ctrl+X', description: 'Cut' },
    { keys: 'Ctrl+C', description: 'Copy' },
    { keys: 'Ctrl+V', description: 'Paste' },
    { keys: 'Ctrl+A', description: 'Select All' },
    { keys: 'Ctrl+D', description: 'Duplicate Line' },
    { keys: 'Ctrl+/', description: 'Toggle Comment' },
  ]},
  { category: 'Find', shortcuts: [
    { keys: 'Ctrl+F', description: 'Find' },
    { keys: 'Ctrl+H', description: 'Find and Replace' },
    { keys: 'Ctrl+G', description: 'Go to Line' },
    { keys: 'F3', description: 'Find Next' },
    { keys: 'Shift+F3', description: 'Find Previous' },
  ]},
  { category: 'Navigation', shortcuts: [
    { keys: 'Ctrl+Tab', description: 'Next Tab' },
    { keys: 'Ctrl+Shift+Tab', description: 'Previous Tab' },
    { keys: 'Ctrl+1-9', description: 'Switch to Tab 1-9' },
  ]},
  { category: 'View', shortcuts: [
    { keys: 'Ctrl+Shift+P', description: 'Command Palette' },
    { keys: 'Ctrl++', description: 'Increase Font Size' },
    { keys: 'Ctrl+-', description: 'Decrease Font Size' },
  ]},
];
