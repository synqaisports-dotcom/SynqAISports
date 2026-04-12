import initSqlJs, { type Database } from "sql.js";
import { LOCAL_SQLITE_SCHEMA, SQLITE_STORAGE_KEY } from "./schema-sql";

let dbPromise: Promise<Database | null> | null = null;
let wasmFailed = false;

function persistDb(db: Database) {
  try {
    const data = db.export();
    const binary = Array.from(data);
    localStorage.setItem(SQLITE_STORAGE_KEY, JSON.stringify(binary));
  } catch {
    /* quota or private mode */
  }
}

export function persistCurrentDb(db: Database) {
  persistDb(db);
}

export async function getLocalSqliteDb(): Promise<Database | null> {
  if (typeof window === "undefined") return null;
  if (wasmFailed) return null;

  if (!dbPromise) {
    dbPromise = (async () => {
      try {
        const SQL = await initSqlJs({
          locateFile: (file) => (file.endsWith(".wasm") ? `/sql-wasm.wasm` : file),
        });
        const raw = localStorage.getItem(SQLITE_STORAGE_KEY);
        let db: Database;
        if (raw) {
          try {
            const arr = JSON.parse(raw) as number[];
            if (Array.isArray(arr) && arr.length > 0) {
              db = new SQL.Database(new Uint8Array(arr));
            } else {
              db = new SQL.Database();
            }
          } catch {
            db = new SQL.Database();
          }
        } else {
          db = new SQL.Database();
        }
        db.run(LOCAL_SQLITE_SCHEMA);
        try {
          db.run(`ALTER TABLE sync_outbox ADD COLUMN last_attempt_at TEXT`);
        } catch {
          /* columna ya existe en DBs antiguas tras migración previa */
        }
        persistDb(db);
        return db;
      } catch (e) {
        console.warn("[SynqLocalDB] SQLite init failed:", e);
        wasmFailed = true;
        return null;
      }
    })();
  }
  return dbPromise;
}

export function resetLocalDbForTests() {
  dbPromise = null;
  wasmFailed = false;
}
