import { X } from 'lucide-react';
import { SHORTCUTS } from '../hooks/useKeyboardShortcuts';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ShortcutsModal({ isOpen, onClose }: ShortcutsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      <div className="relative bg-[#252526] border border-[#3c3c3c] rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#3c3c3c]">
          <h2 className="text-lg font-medium text-white">Keyboard Shortcuts</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded text-[#cccccc] hover:bg-[#3c3c3c]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto max-h-[calc(80vh-60px)]">
          <div className="grid grid-cols-2 gap-6">
            {SHORTCUTS.map((section) => (
              <div key={section.category}>
                <h3 className="text-sm font-medium text-[#cccccc] mb-3">
                  {section.category}
                </h3>
                <div className="space-y-2">
                  {section.shortcuts.map((shortcut) => (
                    <div
                      key={shortcut.keys}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm text-[#858585]">
                        {shortcut.description}
                      </span>
                      <kbd className="px-2 py-0.5 bg-[#3c3c3c] text-[#cccccc] text-xs rounded">
                        {shortcut.keys}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
