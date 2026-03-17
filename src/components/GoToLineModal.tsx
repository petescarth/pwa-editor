import { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { EditorView } from '@codemirror/view';

interface GoToLineModalProps {
  isOpen: boolean;
  onClose: () => void;
  editorView: EditorView | null;
  totalLines: number;
}

export function GoToLineModal({
  isOpen,
  onClose,
  editorView,
  totalLines,
}: GoToLineModalProps) {
  const [lineNumber, setLineNumber] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isOpen]);

  const handleGoToLine = () => {
    if (!editorView) return;

    const line = parseInt(lineNumber);
    if (isNaN(line) || line < 1 || line > totalLines) return;

    const pos = editorView.state.doc.line(line).from;
    editorView.dispatch({
      selection: { anchor: pos, head: pos },
      scrollIntoView: true,
    });
    editorView.focus();
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleGoToLine();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      <div className="relative bg-[#252526] border border-[#3c3c3c] rounded-lg shadow-xl w-full max-w-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#3c3c3c]">
          <h2 className="text-lg font-medium text-white">Go to Line</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded text-[#cccccc] hover:bg-[#3c3c3c]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          <label className="block text-sm text-[#858585] mb-2">
            Enter line number (1-{totalLines})
          </label>
          <input
            ref={inputRef}
            type="number"
            min="1"
            max={totalLines}
            value={lineNumber}
            onChange={(e) => setLineNumber(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Line number"
            className="w-full bg-[#3c3c3c] text-white text-sm px-3 py-2 rounded border border-[#3c3c3c] focus:border-[#007acc] focus:outline-none"
          />
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-sm text-[#cccccc] hover:bg-[#3c3c3c] rounded"
            >
              Cancel
            </button>
            <button
              onClick={handleGoToLine}
              className="px-4 py-1.5 text-sm bg-[#007acc] text-white rounded hover:bg-[#006bb3]"
            >
              Go
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
