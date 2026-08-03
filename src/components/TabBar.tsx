import { useRef, useState, useCallback } from 'react';
import { X } from 'lucide-react';

interface Tab {
  id: string;
  filename: string;
  isModified: boolean;
  isUnsaved: boolean;
}

interface TabBarProps {
  tabs: Tab[];
  activeTabId: string | null;
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string) => void;
  onCloseOther: (id: string) => void;
  onCloseAll: () => void;
  onCloseToRight: (id: string) => void;
  onReorderTabs: (fromIndex: number, toIndex: number) => void;
  onRenameTab: (id: string, newName: string) => void;
}

export function TabBar({
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  onCloseOther,
  onCloseAll,
  onCloseToRight,
  onReorderTabs,
  onRenameTab,
}: TabBarProps) {
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    tabId: string;
    isUnsaved: boolean;
  } | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [renamingTabId, setRenamingTabId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const tabRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const handleContextMenu = useCallback((e: React.MouseEvent, tab: Tab) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, tabId: tab.id, isUnsaved: tab.isUnsaved });
  }, []);

  const closeContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, dropIndex: number) => {
      e.preventDefault();
      if (draggedIndex !== null && draggedIndex !== dropIndex) {
        onReorderTabs(draggedIndex, dropIndex);
      }
      setDraggedIndex(null);
    },
    [draggedIndex, onReorderTabs]
  );

  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null);
  }, []);

  const startRename = useCallback((tab: Tab) => {
    if (tab.isUnsaved) {
      setRenamingTabId(tab.id);
      setRenameValue(tab.filename);
      closeContextMenu();
    }
  }, [closeContextMenu]);

  const commitRename = useCallback(() => {
    if (renamingTabId && renameValue.trim()) {
      onRenameTab(renamingTabId, renameValue.trim());
    }
    setRenamingTabId(null);
  }, [renamingTabId, renameValue, onRenameTab]);

  const handleRenameKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      commitRename();
    } else if (e.key === 'Escape') {
      setRenamingTabId(null);
    }
  }, [commitRename]);

  return (
    <div className="flex bg-[#252526] border-b border-[#3c3c3c] overflow-x-auto">
      <div className="flex min-w-0">
        {tabs.map((tab, index) => (
          <div
            key={tab.id}
            ref={(el) => {
              if (el) tabRefs.current.set(tab.id, el);
              else tabRefs.current.delete(tab.id);
            }}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            onClick={() => onSelectTab(tab.id)}
            onDoubleClick={() => startRename(tab)}
            onContextMenu={(e) => handleContextMenu(e, tab)}
            className={`group flex items-center gap-2 px-3 py-2 min-w-0 max-w-48 cursor-pointer border-r border-[#3c3c3c] select-none ${
              tab.id === activeTabId
                ? 'bg-[#1e1e1e] text-white'
                : 'bg-[#2d2d2d] text-[#969696] hover:bg-[#2a2a2a]'
            } ${draggedIndex === index ? 'opacity-50' : ''}`}
          >
            {renamingTabId === tab.id ? (
              <input
                autoFocus
                type="text"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onBlur={commitRename}
                onKeyDown={handleRenameKeyDown}
                className="truncate text-sm flex-1 bg-[#3c3c3c] text-white border border-[#007acc] outline-none px-1 py-0.5 rounded"
                onClick={(e) => e.stopPropagation()}
                onDoubleClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span className="truncate text-sm flex-1">{tab.filename}</span>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCloseTab(tab.id);
              }}
              className={`flex-shrink-0 w-5 h-5 flex items-center justify-center rounded hover:bg-[#3c3c3c] ${
                tab.isModified ? 'visible' : 'invisible group-hover:visible'
              }`}
            >
              {tab.isModified ? (
                <span className="w-2 h-2 rounded-full bg-white" />
              ) : (
                <X className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        ))}
      </div>

      {contextMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={closeContextMenu}
          />
          <div
            className="fixed z-50 bg-[#2d2d2d] border border-[#454545] rounded shadow-lg py-1 min-w-40"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            {contextMenu.isUnsaved && (
              <button
                onClick={() => {
                  const tab = tabs.find(t => t.id === contextMenu.tabId);
                  if (tab) startRename(tab);
                }}
                className="w-full px-3 py-1.5 text-left text-sm text-[#cccccc] hover:bg-[#094771]"
              >
                Rename
              </button>
            )}
            <button
              onClick={() => {
                onCloseTab(contextMenu.tabId);
                closeContextMenu();
              }}
              className="w-full px-3 py-1.5 text-left text-sm text-[#cccccc] hover:bg-[#094771]"
            >
              Close
            </button>
            <button
              onClick={() => {
                onCloseOther(contextMenu.tabId);
                closeContextMenu();
              }}
              className="w-full px-3 py-1.5 text-left text-sm text-[#cccccc] hover:bg-[#094771]"
            >
              Close Others
            </button>
            <button
              onClick={() => {
                onCloseToRight(contextMenu.tabId);
                closeContextMenu();
              }}
              className="w-full px-3 py-1.5 text-left text-sm text-[#cccccc] hover:bg-[#094771]"
            >
              Close to the Right
            </button>
            <div className="border-t border-[#454545] my-1" />
            <button
              onClick={() => {
                onCloseAll();
                closeContextMenu();
              }}
              className="w-full px-3 py-1.5 text-left text-sm text-[#cccccc] hover:bg-[#094771]"
            >
              Close All
            </button>
          </div>
        </>
      )}
    </div>
  );
}
