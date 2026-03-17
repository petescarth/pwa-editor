import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface EditorSettings {
  fontFamily: string;
  fontSize: number;
  tabSize: number;
  insertSpaces: boolean;
  wordWrap: boolean;
  lineNumbers: boolean;
  autoSave: boolean;
  autoSaveInterval: number;
  theme: 'dark' | 'light';
}

interface TabState {
  id: string;
  filename: string;
  content: string;
  language: string;
  cursorPosition: { line: number; column: number };
  scrollPosition: number;
  isModified: boolean;
  filePath?: string;
}

interface SessionState {
  tabs: TabState[];
  activeTabId: string | null;
  lastOpened: number;
}

interface RecentFile {
  path: string;
  name: string;
  lastOpened: number;
}

interface UnsavedRecovery {
  tabId: string;
  content: string;
  filename: string;
  timestamp: number;
}

interface EditorDB extends DBSchema {
  settings: {
    key: string;
    value: EditorSettings;
  };
  session: {
    key: string;
    value: SessionState;
  };
  recentFiles: {
    key: string;
    value: RecentFile;
    indexes: { 'by-lastOpened': number };
  };
  recovery: {
    key: string;
    value: UnsavedRecovery;
    indexes: { 'by-timestamp': number };
  };
}

const DB_NAME = 'pwa-text-editor';
const DB_VERSION = 1;

let dbInstance: IDBPDatabase<EditorDB> | null = null;

export async function getDB(): Promise<IDBPDatabase<EditorDB>> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<EditorDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings');
      }
      if (!db.objectStoreNames.contains('session')) {
        db.createObjectStore('session');
      }
      if (!db.objectStoreNames.contains('recentFiles')) {
        const recentStore = db.createObjectStore('recentFiles', { keyPath: 'path' });
        recentStore.createIndex('by-lastOpened', 'lastOpened');
      }
      if (!db.objectStoreNames.contains('recovery')) {
        const recoveryStore = db.createObjectStore('recovery', { keyPath: 'tabId' });
        recoveryStore.createIndex('by-timestamp', 'timestamp');
      }
    },
  });

  return dbInstance;
}

export const DEFAULT_SETTINGS: EditorSettings = {
  fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
  fontSize: 14,
  tabSize: 4,
  insertSpaces: true,
  wordWrap: false,
  lineNumbers: true,
  autoSave: true,
  autoSaveInterval: 30000,
  theme: 'dark',
};

export async function getSettings(): Promise<EditorSettings> {
  const db = await getDB();
  const settings = await db.get('settings', 'user-settings');
  return settings || DEFAULT_SETTINGS;
}

export async function saveSettings(settings: EditorSettings): Promise<void> {
  const db = await getDB();
  await db.put('settings', settings, 'user-settings');
}

export async function getSession(): Promise<SessionState | null> {
  const db = await getDB();
  const session = await db.get('session', 'current-session');
  return session ?? null;
}

export async function saveSession(session: SessionState): Promise<void> {
  const db = await getDB();
  await db.put('session', session, 'current-session');
}

export async function getRecentFiles(limit = 10): Promise<RecentFile[]> {
  const db = await getDB();
  const files = await db.getAllFromIndex('recentFiles', 'by-lastOpened');
  return files.reverse().slice(0, limit);
}

export async function addRecentFile(file: RecentFile): Promise<void> {
  const db = await getDB();
  await db.put('recentFiles', file);
}

export async function clearRecentFiles(): Promise<void> {
  const db = await getDB();
  await db.clear('recentFiles');
}

export async function saveRecoveryData(data: UnsavedRecovery): Promise<void> {
  const db = await getDB();
  await db.put('recovery', data);
}

export async function getRecoveryData(): Promise<UnsavedRecovery[]> {
  const db = await getDB();
  return db.getAll('recovery');
}

export async function clearRecoveryData(tabId?: string): Promise<void> {
  const db = await getDB();
  if (tabId) {
    await db.delete('recovery', tabId);
  } else {
    await db.clear('recovery');
  }
}

export type { EditorSettings, TabState, SessionState, RecentFile, UnsavedRecovery };
