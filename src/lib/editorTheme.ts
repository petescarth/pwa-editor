import { EditorView } from '@codemirror/view';
import { Extension } from '@codemirror/state';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags as t } from '@lezer/highlight';

const darkBackground = '#1e1e1e';
const darkForeground = '#d4d4d4';
const darkSelection = '#264f78';
const darkCursor = '#aeafad';
const darkActiveLine = '#2a2d2e';
const darkGutter = '#1e1e1e';
const darkGutterForeground = '#858585';

const lightBackground = '#ffffff';
const lightForeground = '#1e1e1e';
const lightSelection = '#add6ff';
const lightCursor = '#000000';
const lightActiveLine = '#f5f5f5';
const lightGutter = '#f5f5f5';
const lightGutterForeground = '#6e7681';

const darkEditorTheme = EditorView.theme({
  '&': {
    color: darkForeground,
    backgroundColor: darkBackground,
  },
  '.cm-content': {
    caretColor: darkCursor,
  },
  '.cm-cursor, .cm-dropCursor': {
    borderLeftColor: darkCursor,
  },
  '&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection': {
    backgroundColor: darkSelection,
  },
  '.cm-panels': {
    backgroundColor: '#252526',
    color: darkForeground,
  },
  '.cm-panels.cm-panels-top': {
    borderBottom: '1px solid #3c3c3c',
  },
  '.cm-panels.cm-panels-bottom': {
    borderTop: '1px solid #3c3c3c',
  },
  '.cm-searchMatch': {
    backgroundColor: '#515c6a',
    outline: '1px solid #74879f',
  },
  '.cm-searchMatch.cm-searchMatch-selected': {
    backgroundColor: '#613214',
  },
  '.cm-activeLine': {
    backgroundColor: darkActiveLine,
  },
  '.cm-selectionMatch': {
    backgroundColor: '#3a3d41',
  },
  '&.cm-focused .cm-matchingBracket': {
    backgroundColor: '#3b514d',
    outline: '1px solid #888',
  },
  '&.cm-focused .cm-nonmatchingBracket': {
    backgroundColor: '#5a1d1d',
  },
  '.cm-gutters': {
    backgroundColor: darkGutter,
    color: darkGutterForeground,
    border: 'none',
    borderRight: '1px solid #3c3c3c',
  },
  '.cm-activeLineGutter': {
    backgroundColor: darkActiveLine,
    color: '#c6c6c6',
  },
  '.cm-foldPlaceholder': {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#6c6c6c',
  },
  '.cm-tooltip': {
    border: '1px solid #454545',
    backgroundColor: '#252526',
  },
  '.cm-tooltip .cm-tooltip-arrow:before': {
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  '.cm-tooltip .cm-tooltip-arrow:after': {
    borderTopColor: '#252526',
    borderBottomColor: '#252526',
  },
  '.cm-tooltip-autocomplete': {
    '& > ul > li[aria-selected]': {
      backgroundColor: '#04395e',
      color: darkForeground,
    },
  },
}, { dark: true });

const lightEditorTheme = EditorView.theme({
  '&': {
    color: lightForeground,
    backgroundColor: lightBackground,
  },
  '.cm-content': {
    caretColor: lightCursor,
  },
  '.cm-cursor, .cm-dropCursor': {
    borderLeftColor: lightCursor,
  },
  '&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection': {
    backgroundColor: lightSelection,
  },
  '.cm-panels': {
    backgroundColor: lightGutter,
    color: lightForeground,
  },
  '.cm-panels.cm-panels-top': {
    borderBottom: '1px solid #e0e0e0',
  },
  '.cm-panels.cm-panels-bottom': {
    borderTop: '1px solid #e0e0e0',
  },
  '.cm-searchMatch': {
    backgroundColor: '#ffdf5d',
    outline: '1px solid #c9a500',
  },
  '.cm-searchMatch.cm-searchMatch-selected': {
    backgroundColor: '#f7d8a0',
  },
  '.cm-activeLine': {
    backgroundColor: lightActiveLine,
  },
  '.cm-selectionMatch': {
    backgroundColor: '#e8e8e8',
  },
  '&.cm-focused .cm-matchingBracket': {
    backgroundColor: '#b4d8fd',
    outline: '1px solid #888',
  },
  '&.cm-focused .cm-nonmatchingBracket': {
    backgroundColor: '#ffc4c4',
  },
  '.cm-gutters': {
    backgroundColor: lightGutter,
    color: lightGutterForeground,
    border: 'none',
    borderRight: '1px solid #e0e0e0',
  },
  '.cm-activeLineGutter': {
    backgroundColor: '#e8e8e8',
    color: '#1e1e1e',
  },
  '.cm-foldPlaceholder': {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#a0a0a0',
  },
  '.cm-tooltip': {
    border: '1px solid #e0e0e0',
    backgroundColor: lightBackground,
  },
  '.cm-tooltip-autocomplete': {
    '& > ul > li[aria-selected]': {
      backgroundColor: '#d6ebff',
      color: lightForeground,
    },
  },
}, { dark: false });

const darkHighlightStyle = HighlightStyle.define([
  { tag: t.keyword, color: '#569cd6' },
  { tag: [t.name, t.deleted, t.character, t.propertyName, t.macroName], color: '#9cdcfe' },
  { tag: [t.function(t.variableName), t.labelName], color: '#dcdcaa' },
  { tag: [t.color, t.constant(t.name), t.standard(t.name)], color: '#569cd6' },
  { tag: [t.definition(t.name), t.separator], color: '#d4d4d4' },
  { tag: [t.typeName, t.className, t.number, t.changed, t.annotation, t.modifier, t.self, t.namespace], color: '#4ec9b0' },
  { tag: [t.operator, t.operatorKeyword, t.url, t.escape, t.regexp, t.link, t.special(t.string)], color: '#d4d4d4' },
  { tag: [t.meta, t.comment], color: '#6a9955' },
  { tag: t.strong, fontWeight: 'bold' },
  { tag: t.emphasis, fontStyle: 'italic' },
  { tag: t.strikethrough, textDecoration: 'line-through' },
  { tag: t.link, color: '#569cd6', textDecoration: 'underline' },
  { tag: t.heading, fontWeight: 'bold', color: '#569cd6' },
  { tag: [t.atom, t.bool, t.special(t.variableName)], color: '#569cd6' },
  { tag: [t.processingInstruction, t.string, t.inserted], color: '#ce9178' },
  { tag: t.invalid, color: '#f44747' },
]);

const lightHighlightStyle = HighlightStyle.define([
  { tag: t.keyword, color: '#0000ff' },
  { tag: [t.name, t.deleted, t.character, t.propertyName, t.macroName], color: '#001080' },
  { tag: [t.function(t.variableName), t.labelName], color: '#795e26' },
  { tag: [t.color, t.constant(t.name), t.standard(t.name)], color: '#0000ff' },
  { tag: [t.definition(t.name), t.separator], color: '#1e1e1e' },
  { tag: [t.typeName, t.className, t.number, t.changed, t.annotation, t.modifier, t.self, t.namespace], color: '#267f99' },
  { tag: [t.operator, t.operatorKeyword, t.url, t.escape, t.regexp, t.link, t.special(t.string)], color: '#1e1e1e' },
  { tag: [t.meta, t.comment], color: '#008000' },
  { tag: t.strong, fontWeight: 'bold' },
  { tag: t.emphasis, fontStyle: 'italic' },
  { tag: t.strikethrough, textDecoration: 'line-through' },
  { tag: t.link, color: '#0000ff', textDecoration: 'underline' },
  { tag: t.heading, fontWeight: 'bold', color: '#0000ff' },
  { tag: [t.atom, t.bool, t.special(t.variableName)], color: '#0000ff' },
  { tag: [t.processingInstruction, t.string, t.inserted], color: '#a31515' },
  { tag: t.invalid, color: '#cd3131' },
]);

export function getEditorTheme(isDark: boolean): Extension {
  return isDark
    ? [darkEditorTheme, syntaxHighlighting(darkHighlightStyle)]
    : [lightEditorTheme, syntaxHighlighting(lightHighlightStyle)];
}
