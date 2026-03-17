import { addRecentFile } from './db';

declare global {
  interface Window {
    showOpenFilePicker?: (options?: OpenFilePickerOptions) => Promise<FileSystemFileHandle[]>;
    showSaveFilePicker?: (options?: SaveFilePickerOptions) => Promise<FileSystemFileHandle>;
  }
}

interface OpenFilePickerOptions {
  multiple?: boolean;
  excludeAcceptAllOption?: boolean;
  types?: FilePickerAcceptType[];
}

interface SaveFilePickerOptions {
  excludeAcceptAllOption?: boolean;
  suggestedName?: string;
  types?: FilePickerAcceptType[];
}

interface FilePickerAcceptType {
  description?: string;
  accept: Record<string, string[]>;
}

export interface FileHandle {
  handle: FileSystemFileHandle | null;
  name: string;
  path: string;
}

const FILE_TYPES: FilePickerAcceptType[] = [
  {
    description: 'Text Files',
    accept: {
      'text/plain': ['.txt', '.text', '.log'],
      'text/javascript': ['.js', '.mjs', '.cjs'],
      'text/typescript': ['.ts', '.mts', '.cts'],
      'text/jsx': ['.jsx'],
      'text/tsx': ['.tsx'],
      'text/x-python': ['.py', '.pyw', '.pyi'],
      'text/html': ['.html', '.htm', '.xhtml'],
      'text/css': ['.css'],
      'application/json': ['.json', '.jsonc'],
      'text/markdown': ['.md', '.markdown'],
      'text/x-sql': ['.sql'],
      'text/yaml': ['.yaml', '.yml'],
      'text/xml': ['.xml', '.svg', '.xsd', '.xsl'],
      'text/x-rust': ['.rs'],
      'text/x-c++src': ['.cpp', '.cc', '.cxx', '.hpp', '.h'],
      'text/x-csrc': ['.c'],
      'text/x-go': ['.go'],
      'text/x-sh': ['.sh', '.bash', '.zsh'],
      'text/x-toml': ['.toml'],
    },
  },
];

export function isFileSystemAccessSupported(): boolean {
  return 'showOpenFilePicker' in window && 'showSaveFilePicker' in window;
}

export async function openFile(): Promise<{ content: string; handle: FileHandle } | null> {
  if (isFileSystemAccessSupported()) {
    try {
      const [fileHandle] = await window.showOpenFilePicker!({
        multiple: false,
        types: FILE_TYPES,
      });
      const file = await fileHandle.getFile();
      const content = await file.text();

      await addRecentFile({
        path: fileHandle.name,
        name: fileHandle.name,
        lastOpened: Date.now(),
      });

      return {
        content,
        handle: {
          handle: fileHandle,
          name: fileHandle.name,
          path: fileHandle.name,
        },
      };
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        return null;
      }
      throw err;
    }
  } else {
    return openFileFallback();
  }
}

export async function openFiles(): Promise<Array<{ content: string; handle: FileHandle }>> {
  if (isFileSystemAccessSupported()) {
    try {
      const fileHandles = await window.showOpenFilePicker!({
        multiple: true,
        types: FILE_TYPES,
      });
      const results = await Promise.all(
        fileHandles.map(async (fileHandle) => {
          const file = await fileHandle.getFile();
          const content = await file.text();

          await addRecentFile({
            path: fileHandle.name,
            name: fileHandle.name,
            lastOpened: Date.now(),
          });

          return {
            content,
            handle: {
              handle: fileHandle,
              name: fileHandle.name,
              path: fileHandle.name,
            },
          };
        })
      );
      return results;
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        return [];
      }
      throw err;
    }
  } else {
    const result = await openFileFallback();
    return result ? [result] : [];
  }
}

function openFileFallback(): Promise<{ content: string; handle: FileHandle } | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt,.js,.ts,.jsx,.tsx,.py,.html,.css,.json,.md,.sql,.yaml,.yml,.xml,.rs,.cpp,.c,.go,.sh,.toml,.log,.text';

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) {
        resolve(null);
        return;
      }

      const content = await file.text();

      await addRecentFile({
        path: file.name,
        name: file.name,
        lastOpened: Date.now(),
      });

      resolve({
        content,
        handle: {
          handle: null,
          name: file.name,
          path: file.name,
        },
      });
    };

    input.oncancel = () => resolve(null);
    input.click();
  });
}

export async function saveFile(
  content: string,
  handle: FileHandle | null
): Promise<FileHandle | null> {
  if (handle?.handle && isFileSystemAccessSupported()) {
    try {
      const writable = await handle.handle.createWritable();
      await writable.write(content);
      await writable.close();
      return handle;
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        return null;
      }
      throw err;
    }
  } else {
    return saveFileAs(content, handle?.name);
  }
}

export async function saveFileAs(
  content: string,
  suggestedName?: string
): Promise<FileHandle | null> {
  if (isFileSystemAccessSupported()) {
    try {
      const fileHandle = await window.showSaveFilePicker!({
        suggestedName: suggestedName || 'untitled.txt',
        types: FILE_TYPES,
      });

      const writable = await fileHandle.createWritable();
      await writable.write(content);
      await writable.close();

      await addRecentFile({
        path: fileHandle.name,
        name: fileHandle.name,
        lastOpened: Date.now(),
      });

      return {
        handle: fileHandle,
        name: fileHandle.name,
        path: fileHandle.name,
      };
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        return null;
      }
      throw err;
    }
  } else {
    downloadFile(content, suggestedName || 'untitled.txt');
    return {
      handle: null,
      name: suggestedName || 'untitled.txt',
      path: suggestedName || 'untitled.txt',
    };
  }
}

function downloadFile(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function readFileFromHandle(handle: FileSystemFileHandle): Promise<string> {
  const file = await handle.getFile();
  return file.text();
}
