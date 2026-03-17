import { X, FileText } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AboutModal({ isOpen, onClose }: AboutModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      <div className="relative bg-[#252526] border border-[#3c3c3c] rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#3c3c3c]">
          <h2 className="text-lg font-medium text-white">About</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded text-[#cccccc] hover:bg-[#3c3c3c]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-[#1e1e1e] rounded-lg flex items-center justify-center">
            <FileText className="w-8 h-8 text-[#569cd6]" />
          </div>
          <h1 className="text-xl font-semibold text-white mb-1">
            PWA Text Editor
          </h1>
          <p className="text-sm text-[#858585] mb-4">Version 1.0.0</p>
          <p className="text-sm text-[#cccccc] mb-4">
            A powerful offline-capable text editor with syntax highlighting for
            multiple programming languages.
          </p>
          <div className="text-xs text-[#858585] space-y-1">
            <p>Works 100% offline after first load</p>
            <p>Supports File System Access API</p>
            <p>Auto-saves your work</p>
          </div>
        </div>
      </div>
    </div>
  );
}
