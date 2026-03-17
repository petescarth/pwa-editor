import { useEffect, useRef, useCallback } from 'react';
import { EditorState, Extension } from '@codemirror/state';
import {
  EditorView,
  keymap,
  lineNumbers,
  highlightActiveLineGutter,
  highlightSpecialChars,
  drawSelection,
  dropCursor,
  rectangularSelection,
  crosshairCursor,
  highlightActiveLine,
} from '@codemirror/view';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { searchKeymap, highlightSelectionMatches } from '@codemirror/search';
import { autocompletion, completionKeymap, closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete';
import { foldGutter, indentOnInput, bracketMatching, foldKeymap } from '@codemirror/language';
import { lintKeymap } from '@codemirror/lint';
import { getEditorTheme } from '../lib/editorTheme';
import { getLanguageByExtension } from '../lib/languages';
import type { EditorSettings } from '../lib/db';

interface EditorProps {
  content: string;
  filename: string;
  settings: EditorSettings;
  onChange: (content: string) => void;
  onCursorChange: (line: number, column: number) => void;
  editorViewRef?: React.MutableRefObject<EditorView | null>;
}

export function Editor({
  content,
  filename,
  settings,
  onChange,
  onCursorChange,
  editorViewRef,
}: EditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const isUpdatingRef = useRef(false);

  const getExtensions = useCallback((): Extension[] => {
    const language = getLanguageByExtension(filename);
    const extensions: Extension[] = [
      highlightSpecialChars(),
      history(),
      drawSelection(),
      dropCursor(),
      EditorState.allowMultipleSelections.of(true),
      indentOnInput(),
      bracketMatching(),
      closeBrackets(),
      autocompletion(),
      rectangularSelection(),
      crosshairCursor(),
      highlightActiveLine(),
      highlightActiveLineGutter(),
      highlightSelectionMatches(),
      keymap.of([
        ...closeBracketsKeymap,
        ...defaultKeymap,
        ...searchKeymap,
        ...historyKeymap,
        ...foldKeymap,
        ...completionKeymap,
        ...lintKeymap,
        indentWithTab,
      ]),
      EditorView.updateListener.of((update) => {
        if (update.docChanged && !isUpdatingRef.current) {
          onChange(update.state.doc.toString());
        }
        if (update.selectionSet) {
          const pos = update.state.selection.main.head;
          const line = update.state.doc.lineAt(pos);
          onCursorChange(line.number, pos - line.from + 1);
        }
      }),
      getEditorTheme(settings.theme === 'dark'),
      language.load(),
      EditorView.theme({
        '&': {
          height: '100%',
          fontFamily: settings.fontFamily,
          fontSize: `${settings.fontSize}px`,
        },
        '.cm-scroller': {
          overflow: 'auto',
        },
        '.cm-content': {
          fontFamily: settings.fontFamily,
        },
        '.cm-gutters': {
          fontFamily: settings.fontFamily,
        },
      }),
      EditorState.tabSize.of(settings.tabSize),
    ];

    if (settings.lineNumbers) {
      extensions.push(lineNumbers());
    }

    if (settings.wordWrap) {
      extensions.push(EditorView.lineWrapping);
    }

    extensions.push(foldGutter());

    return extensions;
  }, [filename, settings, onChange, onCursorChange]);

  useEffect(() => {
    if (!containerRef.current) return;

    const state = EditorState.create({
      doc: content,
      extensions: getExtensions(),
    });

    const view = new EditorView({
      state,
      parent: containerRef.current,
    });

    viewRef.current = view;
    if (editorViewRef) {
      editorViewRef.current = view;
    }

    return () => {
      view.destroy();
      viewRef.current = null;
      if (editorViewRef) {
        editorViewRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;

    const currentContent = view.state.doc.toString();
    if (currentContent !== content) {
      isUpdatingRef.current = true;
      view.dispatch({
        changes: { from: 0, to: view.state.doc.length, insert: content },
      });
      isUpdatingRef.current = false;
    }
  }, [content]);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;

    const state = EditorState.create({
      doc: view.state.doc,
      extensions: getExtensions(),
      selection: view.state.selection,
    });

    view.setState(state);
  }, [settings, filename, getExtensions]);

  return (
    <div
      ref={containerRef}
      className="h-full w-full overflow-hidden"
    />
  );
}
