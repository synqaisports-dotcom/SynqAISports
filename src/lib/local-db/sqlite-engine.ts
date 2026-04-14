import initSqlJs, { type Database } from "sql.js";
import { Capacitor } from "@capacitor/core";
import { Directory, Encoding, Filesystem } from "@capacitor/filesystem";
import { LOCAL_SQLITE_SCHEMA, SQLITE_STORAGE_KEY } from "./schema-sql";

let dbPromise: Promise<Database | null> | null = null;
let wasmFailed = false;
const NATIVE_DB_PATH = "synq-local/sqlite.bin.b64";

function bytesToBase64(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i += 1) {
    bin += String.fromCharCode(bytes[i]);
  }
  return btoa(bin);
}

function base64ToBytes(raw: string): Uint8Array {
  const bin = atob(raw);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) {
    out[i] = bin.charCodeAt(i);
  }
  return out;
}

function isCapacitorNativeRuntime(): boolean {
  return typeof window !== "undefined" && Capacitor.isNativePlatform();
}

async function readNativeDbBinary(): Promise<Uint8Array | null> {
  if (!isCapacitorNativeRuntime()) return null;
  try {
    const data = await Filesystem.readFile({
      path: NATIVE_DB_PATH,
      directory: Directory.Data,
      encoding: Encoding.UTF8,
    });
    if (!data.data || typeof data.data !== "string") return null;
    return base64ToBytes(data.data);
  } catch {
    return null;
  }
}

async function persistNativeDb(data: Uint8Array) {
  if (!isCapacitorNativeRuntime()) return;
  try {
    await Filesystem.writeFile({
      path: NATIVE_DB_PATH,
      directory: Directory.Data,
      recursive: true,
      encoding: Encoding.UTF8,
      data: bytesToBase64(data),
    });
  } catch {
    /* noop */
  }
}

async function persistDb(db: Database) {
  try {
    const data = db.export();
    void persistNativeDb(data);
    if (!isCapacitorNativeRuntime()) {
      const binary = Array.from(data);
      localStorage.setItem(SQLITE_STORAGE_KEY, JSON.stringify(binary));
    }
  } catch {
    /* quota or private mode */
  }
}

export function persistCurrentDb(db: Database) {
  void persistDb(db);
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
        let nativeBytes: Uint8Array | null = null;
        if (isCapacitorNativeRuntime()) {
          nativeBytes = await readNativeDbBinary();
        }
        const raw = !isCapacitorNativeRuntime() ? localStorage.getItem(SQLITE_STORAGE_KEY) : null;
        let db: Database;
        if (nativeBytes && nativeBytes.length > 0) {
          db = new SQL.Database(nativeBytes);
        } else if (raw) {
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
        await persistDb(db);
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
