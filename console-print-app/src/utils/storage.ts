import type { ConsoleRecord } from '../types';

const STORAGE_KEY = 'console-print-records';

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
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
