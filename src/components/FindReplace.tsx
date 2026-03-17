import { useState, useCallback, useEffect, useRef } from 'react';
import { X, ChevronDown, ChevronUp, Replace, ReplaceAll } from 'lucide-react';
import { EditorView } from '@codemirror/view';
import {
  SearchQuery,
  findNext,
  findPrevious,
  replaceNext,
  replaceAll,
  setSearchQuery,
} from '@codemirror/search';

interface FindReplaceProps {
  editorView: EditorView | null;
  isOpen: boolean;
  showReplace: boolean;
  onClose: () => void;
}

export function FindReplace({
  editorView,
  isOpen,
  showReplace,
  onClose,
}: FindReplaceProps) {
  const [searchText, setSearchText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [wholeWord, setWholeWord] = useState(false);
  const [useRegex, setUseRegex] = useState(false);
  const [matchCount, setMatchCount] = useState<{ current: number; total: number } | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
      searchInputRef.current.select();
    }
  }, [isOpen]);

  const updateSearch = useCallback(() => {
    if (!editorView || !searchText) {
      setMatchCount(null);
      return;
    }

    const query = new SearchQuery({
      search: searchText,
      caseSensitive,
      regexp: useRegex,
      wholeWord,
    });

    editorView.dispatch({
      effects: setSearchQuery.of(query),
    });

    let total = 0;
    let current = 0;
    const cursorPos = editorView.state.selection.main.from;
    let foundCurrent = false;

    const cursor = query.getCursor(editorView.state.doc);
    let match = cursor.next();
    while (!match.done) {
      total++;
      if (!foundCurrent && match.value.from >= cursorPos) {
        current = total;
        foundCurrent = true;
      }
      match = cursor.next();
    }

    if (total > 0 && !foundCurrent) {
      current = 1;
    }

    setMatchCount(total > 0 ? { current, total } : null);
  }, [editorView, searchText, caseSensitive, wholeWord, useRegex]);

  useEffect(() => {
    updateSearch();
  }, [updateSearch]);

  const handleFindNext = useCallback(() => {
    if (!editorView) return;
    findNext(editorView);
    updateSearch();
  }, [editorView, updateSearch]);

  const handleFindPrevious = useCallback(() => {
    if (!editorView) return;
    findPrevious(editorView);
    updateSearch();
  }, [editorView, updateSearch]);

  const handleReplace = useCallback(() => {
    if (!editorView) return;
    replaceNext(editorView);
    updateSearch();
  }, [editorView, updateSearch]);

  const handleReplaceAll = useCallback(() => {
    if (!editorView) return;
    replaceAll(editorView);
    updateSearch();
  }, [editorView, updateSearch]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'Enter') {
        if (e.shiftKey) {
          handleFindPrevious();
        } else {
          handleFindNext();
        }
      } else if (e.key === 'F3') {
        e.preventDefault();
        if (e.shiftKey) {
          handleFindPrevious();
        } else {
          handleFindNext();
        }
      }
    },
    [handleFindNext, handleFindPrevious, onClose]
  );

  if (!isOpen) return null;

  return (
    <div className="bg-[#252526] border-b border-[#3c3c3c] px-3 py-2">
      <div className="flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2">
          <div className="relative flex-1 max-w-md">
            <input
              ref={searchInputRef}
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Find"
              className="w-full bg-[#3c3c3c] text-white text-sm px-2 py-1 rounded border border-[#3c3c3c] focus:border-[#007acc] focus:outline-none"
            />
            {matchCount && (
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-[#858585]">
                {matchCount.current} of {matchCount.total}
              </span>
            )}
            {searchText && !matchCount && (
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-[#f48771]">
                No results
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCaseSensitive(!caseSensitive)}
              title="Match Case"
              className={`w-7 h-7 flex items-center justify-center rounded text-sm font-medium ${
                caseSensitive
                  ? 'bg-[#094771] text-white'
                  : 'text-[#858585] hover:bg-[#3c3c3c]'
              }`}
            >
              Aa
            </button>
            <button
              onClick={() => setWholeWord(!wholeWord)}
              title="Match Whole Word"
              className={`w-7 h-7 flex items-center justify-center rounded text-sm font-medium ${
                wholeWord
                  ? 'bg-[#094771] text-white'
                  : 'text-[#858585] hover:bg-[#3c3c3c]'
              }`}
            >
              ab
            </button>
            <button
              onClick={() => setUseRegex(!useRegex)}
              title="Use Regular Expression"
              className={`w-7 h-7 flex items-center justify-center rounded text-sm font-medium ${
                useRegex
                  ? 'bg-[#094771] text-white'
                  : 'text-[#858585] hover:bg-[#3c3c3c]'
              }`}
            >
              .*
            </button>
          </div>

          <button
            onClick={handleFindPrevious}
            title="Previous Match (Shift+Enter)"
            className="w-7 h-7 flex items-center justify-center rounded text-[#cccccc] hover:bg-[#3c3c3c]"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          <button
            onClick={handleFindNext}
            title="Next Match (Enter)"
            className="w-7 h-7 flex items-center justify-center rounded text-[#cccccc] hover:bg-[#3c3c3c]"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-7 h-7 flex items-center justify-center rounded text-[#cccccc] hover:bg-[#3c3c3c]"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {showReplace && (
        <div className="flex items-center gap-2 mt-2">
          <div className="flex-1 max-w-md">
            <input
              type="text"
              value={replaceText}
              onChange={(e) => setReplaceText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Replace"
              className="w-full bg-[#3c3c3c] text-white text-sm px-2 py-1 rounded border border-[#3c3c3c] focus:border-[#007acc] focus:outline-none"
            />
          </div>

          <button
            onClick={handleReplace}
            title="Replace"
            className="w-7 h-7 flex items-center justify-center rounded text-[#cccccc] hover:bg-[#3c3c3c]"
          >
            <Replace className="w-4 h-4" />
          </button>
          <button
            onClick={handleReplaceAll}
            title="Replace All"
            className="w-7 h-7 flex items-center justify-center rounded text-[#cccccc] hover:bg-[#3c3c3c]"
          >
            <ReplaceAll className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
