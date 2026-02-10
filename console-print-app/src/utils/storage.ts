import type { ConsoleRecord } from '../types';

declare global {
  interface Window {
    showOpenFilePicker: (options?: OpenFilePickerOptions) => Promise<FileSystemFileHandle[]>;
    showSaveFilePicker: (options?: SaveFilePickerOptions) => Promise<FileSystemFileHandle>;
  }

  interface OpenFilePickerOptions {
    types?: FilePickerAcceptType[];
    multiple?: boolean;
  }

  interface SaveFilePickerOptions {
    suggestedName?: string;
    types?: FilePickerAcceptType[];
  }

  interface FilePickerAcceptType {
    description?: string;
    accept: Record<string, string[]>;
  }
}

const STORAGE_KEY = 'console-print-records';

let fileHandle: FileSystemFileHandle | null = null;

export function loadRecords(): ConsoleRecord[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveRecords(records: ConsoleRecord[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  if (fileHandle) {
    saveToFile(records);
  }
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function isFileSystemSupported(): boolean {
  return 'showSaveFilePicker' in window;
}

export async function bindLocalFile(): Promise<ConsoleRecord[] | null> {
  try {
    const [handle] = await window.showOpenFilePicker({
      types: [
        {
          description: 'JSON Files',
          accept: { 'application/json': ['.json'] },
        },
      ],
    });
    fileHandle = handle;

    const file = await handle.getFile();
    const text = await file.text();
    const records = JSON.parse(text) as ConsoleRecord[];

    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));

    return records;
  } catch (error) {
    if ((error as Error).name !== 'AbortError') {
      console.error('Failed to bind file:', error);
    }
    return null;
  }
}

export async function createLocalFile(records: ConsoleRecord[]): Promise<boolean> {
  try {
    const handle = await window.showSaveFilePicker({
      suggestedName: `console-print-${new Date().toISOString().slice(0, 10)}.json`,
      types: [
        {
          description: 'JSON Files',
          accept: { 'application/json': ['.json'] },
        },
      ],
    });
    fileHandle = handle;

    await saveToFile(records);
    return true;
  } catch (error) {
    if ((error as Error).name !== 'AbortError') {
      console.error('Failed to create file:', error);
    }
    return false;
  }
}

async function saveToFile(records: ConsoleRecord[]): Promise<void> {
  if (!fileHandle) return;

  try {
    const writable = await fileHandle.createWritable();
    await writable.write(JSON.stringify(records, null, 2));
    await writable.close();
  } catch (error) {
    console.error('Failed to save to file:', error);
    fileHandle = null;
  }
}

export function getBoundFileName(): string | null {
  return fileHandle?.name || null;
}

export function unbindFile(): void {
  fileHandle = null;
}

export function isFileBound(): boolean {
  return fileHandle !== null;
}
