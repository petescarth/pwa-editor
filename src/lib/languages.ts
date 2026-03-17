import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { json } from '@codemirror/lang-json';
import { markdown } from '@codemirror/lang-markdown';
import { sql } from '@codemirror/lang-sql';
import { yaml } from '@codemirror/lang-yaml';
import { xml } from '@codemirror/lang-xml';
import { rust } from '@codemirror/lang-rust';
import { cpp } from '@codemirror/lang-cpp';
import { go } from '@codemirror/lang-go';
import { StreamLanguage } from '@codemirror/language';
import { shell } from '@codemirror/legacy-modes/mode/shell';
import { toml } from '@codemirror/legacy-modes/mode/toml';
import { LanguageSupport } from '@codemirror/language';

export interface LanguageConfig {
  name: string;
  extensions: string[];
  mimeTypes: string[];
  load: () => LanguageSupport;
}

const shellLanguage = () => new LanguageSupport(StreamLanguage.define(shell));
const tomlLanguage = () => new LanguageSupport(StreamLanguage.define(toml));

export const LANGUAGES: LanguageConfig[] = [
  {
    name: 'JavaScript',
    extensions: ['js', 'mjs', 'cjs'],
    mimeTypes: ['text/javascript', 'application/javascript'],
    load: () => javascript(),
  },
  {
    name: 'TypeScript',
    extensions: ['ts', 'mts', 'cts'],
    mimeTypes: ['text/typescript', 'application/typescript'],
    load: () => javascript({ typescript: true }),
  },
  {
    name: 'JSX',
    extensions: ['jsx'],
    mimeTypes: ['text/jsx'],
    load: () => javascript({ jsx: true }),
  },
  {
    name: 'TSX',
    extensions: ['tsx'],
    mimeTypes: ['text/tsx'],
    load: () => javascript({ jsx: true, typescript: true }),
  },
  {
    name: 'Python',
    extensions: ['py', 'pyw', 'pyi'],
    mimeTypes: ['text/x-python', 'application/x-python'],
    load: () => python(),
  },
  {
    name: 'HTML',
    extensions: ['html', 'htm', 'xhtml'],
    mimeTypes: ['text/html'],
    load: () => html(),
  },
  {
    name: 'CSS',
    extensions: ['css'],
    mimeTypes: ['text/css'],
    load: () => css(),
  },
  {
    name: 'JSON',
    extensions: ['json', 'jsonc'],
    mimeTypes: ['application/json'],
    load: () => json(),
  },
  {
    name: 'Markdown',
    extensions: ['md', 'markdown', 'mdown'],
    mimeTypes: ['text/markdown'],
    load: () => markdown(),
  },
  {
    name: 'SQL',
    extensions: ['sql'],
    mimeTypes: ['text/x-sql'],
    load: () => sql(),
  },
  {
    name: 'YAML',
    extensions: ['yaml', 'yml'],
    mimeTypes: ['text/yaml', 'application/x-yaml'],
    load: () => yaml(),
  },
  {
    name: 'XML',
    extensions: ['xml', 'xsd', 'xsl', 'xslt', 'svg'],
    mimeTypes: ['text/xml', 'application/xml'],
    load: () => xml(),
  },
  {
    name: 'Rust',
    extensions: ['rs'],
    mimeTypes: ['text/x-rust'],
    load: () => rust(),
  },
  {
    name: 'C++',
    extensions: ['cpp', 'cc', 'cxx', 'hpp', 'hh', 'hxx', 'h'],
    mimeTypes: ['text/x-c++src'],
    load: () => cpp(),
  },
  {
    name: 'C',
    extensions: ['c'],
    mimeTypes: ['text/x-csrc'],
    load: () => cpp(),
  },
  {
    name: 'Go',
    extensions: ['go'],
    mimeTypes: ['text/x-go'],
    load: () => go(),
  },
  {
    name: 'Shell',
    extensions: ['sh', 'bash', 'zsh', 'fish'],
    mimeTypes: ['text/x-sh', 'application/x-sh'],
    load: shellLanguage,
  },
  {
    name: 'TOML',
    extensions: ['toml'],
    mimeTypes: ['text/x-toml'],
    load: tomlLanguage,
  },
  {
    name: 'Plain Text',
    extensions: ['txt', 'text', 'log'],
    mimeTypes: ['text/plain'],
    load: () => new LanguageSupport(StreamLanguage.define({ token: () => null })),
  },
];

export function getLanguageByExtension(filename: string): LanguageConfig {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  const lang = LANGUAGES.find(l => l.extensions.includes(ext));
  return lang || LANGUAGES[LANGUAGES.length - 1];
}

export function getLanguageByName(name: string): LanguageConfig | undefined {
  return LANGUAGES.find(l => l.name.toLowerCase() === name.toLowerCase());
}

export function getAllLanguageNames(): string[] {
  return LANGUAGES.map(l => l.name);
}
