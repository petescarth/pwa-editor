import { useState, useCallback, useRef, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import type { RecentFile } from '../lib/db';

interface MenuBarProps {
  onNewFile: () => void;
  onOpenFile: () => void;
  onSave: () => void;
  onSaveAs: () => void;
  onCloseTab: () => void;
  onCloseAllTabs: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onCut: () => void;
  onCopy: () => void;
  onPaste: () => void;
  onSelectAll: () => void;
  onDuplicateLine: () => void;
  onToggleLineNumbers: () => void;
  onToggleWordWrap: () => void;
  onIncreaseFontSize: () => void;
  onDecreaseFontSize: () => void;
  onToggleTheme: () => void;
  onOpenSettings: () => void;
  onFind: () => void;
  onReplace: () => void;
  onGoToLine: () => void;
  onShowShortcuts: () => void;
  onShowAbout: () => void;
  recentFiles: RecentFile[];
  onOpenRecentFile: (file: RecentFile) => void;
  onClearRecentFiles: () => void;
  lineNumbers: boolean;
  wordWrap: boolean;
  theme: 'dark' | 'light';
}

interface MenuItem {
  label: string;
  shortcut?: string;
  action?: () => void;
  divider?: boolean;
  submenu?: MenuItem[];
  checked?: boolean;
  disabled?: boolean;
}

export function MenuBar({
  onNewFile,
  onOpenFile,
  onSave,
  onSaveAs,
  onCloseTab,
  onCloseAllTabs,
  onUndo,
  onRedo,
  onCut,
  onCopy,
  onPaste,
  onSelectAll,
  onDuplicateLine,
  onToggleLineNumbers,
  onToggleWordWrap,
  onIncreaseFontSize,
  onDecreaseFontSize,
  onToggleTheme,
  onOpenSettings,
  onFind,
  onReplace,
  onGoToLine,
  onShowShortcuts,
  onShowAbout,
  recentFiles,
  onOpenRecentFile,
  onClearRecentFiles,
  lineNumbers,
  wordWrap,
  theme,
}: MenuBarProps) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const menuBarRef = useRef<HTMLDivElement>(null);

  const recentFilesSubmenu: MenuItem[] = recentFiles.length > 0
    ? [
        ...recentFiles.map((file) => ({
          label: file.name,
          action: () => onOpenRecentFile(file),
        })),
        { label: '', divider: true },
        { label: 'Clear Recent Files', action: onClearRecentFiles },
      ]
    : [{ label: 'No Recent Files', disabled: true }];

  const menus: Record<string, MenuItem[]> = {
    File: [
      { label: 'New', shortcut: 'Ctrl+N', action: onNewFile },
      { label: 'Open...', shortcut: 'Ctrl+O', action: onOpenFile },
      { label: 'Open Recent', submenu: recentFilesSubmenu },
      { label: '', divider: true },
      { label: 'Save', shortcut: 'Ctrl+S', action: onSave },
      { label: 'Save As...', shortcut: 'Ctrl+Shift+S', action: onSaveAs },
      { label: '', divider: true },
      { label: 'Close Tab', shortcut: 'Ctrl+W', action: onCloseTab },
      { label: 'Close All Tabs', action: onCloseAllTabs },
    ],
    Edit: [
      { label: 'Undo', shortcut: 'Ctrl+Z', action: onUndo },
      { label: 'Redo', shortcut: 'Ctrl+Y', action: onRedo },
      { label: '', divider: true },
      { label: 'Cut', shortcut: 'Ctrl+X', action: onCut },
      { label: 'Copy', shortcut: 'Ctrl+C', action: onCopy },
      { label: 'Paste', shortcut: 'Ctrl+V', action: onPaste },
      { label: '', divider: true },
      { label: 'Select All', shortcut: 'Ctrl+A', action: onSelectAll },
      { label: 'Duplicate Line', shortcut: 'Ctrl+D', action: onDuplicateLine },
    ],
    View: [
      { label: 'Line Numbers', checked: lineNumbers, action: onToggleLineNumbers },
      { label: 'Word Wrap', checked: wordWrap, action: onToggleWordWrap },
      { label: '', divider: true },
      { label: 'Increase Font Size', shortcut: 'Ctrl++', action: onIncreaseFontSize },
      { label: 'Decrease Font Size', shortcut: 'Ctrl+-', action: onDecreaseFontSize },
      { label: '', divider: true },
      { label: theme === 'dark' ? 'Light Theme' : 'Dark Theme', action: onToggleTheme },
      { label: '', divider: true },
      { label: 'Settings...', action: onOpenSettings },
    ],
    Find: [
      { label: 'Find', shortcut: 'Ctrl+F', action: onFind },
      { label: 'Replace', shortcut: 'Ctrl+H', action: onReplace },
      { label: '', divider: true },
      { label: 'Go to Line...', shortcut: 'Ctrl+G', action: onGoToLine },
    ],
    Help: [
      { label: 'Keyboard Shortcuts', action: onShowShortcuts },
      { label: '', divider: true },
      { label: 'About', action: onShowAbout },
    ],
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuBarRef.current && !menuBarRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
    };

    if (activeMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeMenu]);

  const handleMenuClick = useCallback((menuName: string) => {
    setActiveMenu((prev) => (prev === menuName ? null : menuName));
  }, []);

  const handleMenuItemClick = useCallback((action?: () => void) => {
    if (action) {
      action();
    }
    setActiveMenu(null);
  }, []);

  return (
    <div ref={menuBarRef} className="flex bg-[#3c3c3c] text-sm select-none">
      {Object.entries(menus).map(([menuName, items]) => (
        <div key={menuName} className="relative">
          <button
            onClick={() => handleMenuClick(menuName)}
            onMouseEnter={() => activeMenu && setActiveMenu(menuName)}
            className={`px-3 py-1.5 text-[#cccccc] hover:bg-[#505050] ${
              activeMenu === menuName ? 'bg-[#505050]' : ''
            }`}
          >
            {menuName}
          </button>

          {activeMenu === menuName && (
            <MenuDropdown
              items={items}
              onItemClick={handleMenuItemClick}
            />
          )}
        </div>
      ))}
    </div>
  );
}

interface MenuDropdownProps {
  items: MenuItem[];
  onItemClick: (action?: () => void) => void;
  isSubmenu?: boolean;
}

function MenuDropdown({ items, onItemClick, isSubmenu }: MenuDropdownProps) {
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);

  return (
    <div
      className={`absolute z-50 bg-[#2d2d2d] border border-[#454545] rounded shadow-lg py-1 min-w-48 ${
        isSubmenu ? 'left-full top-0 -mt-1' : 'left-0 top-full'
      }`}
    >
      {items.map((item, index) =>
        item.divider ? (
          <div key={index} className="border-t border-[#454545] my-1" />
        ) : (
          <div
            key={index}
            className="relative"
            onMouseEnter={() => item.submenu && setActiveSubmenu(item.label)}
            onMouseLeave={() => setActiveSubmenu(null)}
          >
            <button
              onClick={() => !item.submenu && !item.disabled && onItemClick(item.action)}
              disabled={item.disabled}
              className={`w-full px-3 py-1.5 text-left text-sm flex items-center justify-between ${
                item.disabled
                  ? 'text-[#6c6c6c] cursor-default'
                  : 'text-[#cccccc] hover:bg-[#094771]'
              }`}
            >
              <span className="flex items-center gap-2">
                {item.checked !== undefined && (
                  <span className="w-4">
                    {item.checked && '✓'}
                  </span>
                )}
                {item.label}
              </span>
              <span className="flex items-center gap-2">
                {item.shortcut && (
                  <span className="text-[#858585] text-xs">{item.shortcut}</span>
                )}
                {item.submenu && <ChevronRight className="w-4 h-4" />}
              </span>
            </button>

            {item.submenu && activeSubmenu === item.label && (
              <MenuDropdown
                items={item.submenu}
                onItemClick={onItemClick}
                isSubmenu
              />
            )}
          </div>
        )
      )}
    </div>
  );
}
