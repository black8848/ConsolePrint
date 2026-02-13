import initSqlJs, { Database } from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '../../data');
const dbPath = path.join(dataDir, 'console-print.db');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

let db: Database;

export async function initDb(): Promise<Database> {
  const SQL = await initSqlJs();

  // Load existing database or create new one
  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  // Initialize tables
  db.run(`
    CREATE TABLE IF NOT EXISTS issues (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      location TEXT DEFAULT '',
      impact TEXT DEFAULT '',
      status TEXT DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved')),
      createdAt TEXT DEFAULT (datetime('now')),
      updatedAt TEXT DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS configs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      issueId INTEGER NOT NULL,
      key TEXT NOT NULL,
      value TEXT DEFAULT '',
      note TEXT,
      createdAt TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (issueId) REFERENCES issues(id) ON DELETE CASCADE
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS console_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      issueId INTEGER NOT NULL,
      prompt TEXT DEFAULT '',
      command TEXT DEFAULT '',
      output TEXT DEFAULT '',
      note TEXT,
      logType TEXT DEFAULT 'info' CHECK (logType IN ('error', 'warning', 'info', 'clue')),
      createdAt TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (issueId) REFERENCES issues(id) ON DELETE CASCADE
    )
  `);

  // Save to file
  saveDb();

  console.log('Database initialized at:', dbPath);
  return db;
}

export function getDb(): Database {
  return db;
}

export function saveDb(): void {
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbPath, buffer);
}

// Helper to run query and get results as objects
export function query<T>(sql: string, params: any[] = []): T[] {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const results: T[] = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject() as T);
  }
  stmt.free();
  return results;
}

// Helper to run single query
export function queryOne<T>(sql: string, params: any[] = []): T | undefined {
  const results = query<T>(sql, params);
  return results[0];
}

// Helper to run insert/update/delete
export function run(sql: string, params: any[] = []): { lastId: number; changes: number } {
  db.run(sql, params);
  const lastId = db.exec("SELECT last_insert_rowid() as id")[0]?.values[0]?.[0] as number || 0;
  const changes = db.getRowsModified();
  saveDb();
  return { lastId, changes };
}
