import { useRef, useState, useCallback } from 'react';
import { X } from 'lucide-react';

interface Tab {
  id: string;
  filename: string;
  isModified: boolean;
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
}: TabBarProps) {
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    tabId: string;
  } | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const tabRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const handleContextMenu = useCallback((e: React.MouseEvent, tabId: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, tabId });
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
            onContextMenu={(e) => handleContextMenu(e, tab.id)}
            className={`group flex items-center gap-2 px-3 py-2 min-w-0 max-w-48 cursor-pointer border-r border-[#3c3c3c] select-none ${
              tab.id === activeTabId
                ? 'bg-[#1e1e1e] text-white'
                : 'bg-[#2d2d2d] text-[#969696] hover:bg-[#2a2a2a]'
            } ${draggedIndex === index ? 'opacity-50' : ''}`}
          >
            <span className="truncate text-sm flex-1">{tab.filename}</span>
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
