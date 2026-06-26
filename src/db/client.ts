import * as SQLite from "expo-sqlite";

const DB_NAME = "fieldlog.db";

let db: SQLite.SQLiteDatabase | null = null;

export function getDatabase(): SQLite.SQLiteDatabase {
  if (!db) {
    db = SQLite.openDatabaseSync(DB_NAME);
  }
  return db;
}

export async function initDatabase(): Promise<void> {
  const database = getDatabase();

  await database.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS tasks (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      title       TEXT    NOT NULL,
      description TEXT    NOT NULL DEFAULT '',
      lat         REAL    NOT NULL,
      lng         REAL    NOT NULL,
      status      TEXT    NOT NULL DEFAULT 'draft',
      created_at  INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      firestore_id TEXT,
      needs_sync  INTEGER NOT NULL DEFAULT 1
    );
  `);

  // Mevcut DB'ye yeni kolonlar ekle (migration) — hata fırlatırsa kolon zaten var
  try {
    await database.execAsync("ALTER TABLE tasks ADD COLUMN firestore_id TEXT;");
  } catch {}
  try {
    await database.execAsync(
      "ALTER TABLE tasks ADD COLUMN needs_sync INTEGER NOT NULL DEFAULT 1;"
    );
  } catch {}
  try {
    await database.execAsync(
      "ALTER TABLE tasks ADD COLUMN priority TEXT NOT NULL DEFAULT 'medium';"
    );
  } catch {}
}
