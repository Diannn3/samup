import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

export interface StewardDatabase {
  path: string;
  sqlite: DatabaseSync;
}

export function createDatabase(databasePath: string): StewardDatabase {
  const memory = databasePath === ":memory:";
  const resolved = memory ? ":memory:" : path.resolve(databasePath);
  if (!memory) fs.mkdirSync(path.dirname(resolved), {recursive: true});
  const sqlite = new DatabaseSync(resolved);
  sqlite.exec("PRAGMA journal_mode = WAL;");
  sqlite.exec("PRAGMA foreign_keys = ON;");
  initializeSchema(sqlite);
  return {path: resolved, sqlite};
}

function initializeSchema(sqlite: DatabaseSync): void {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS snapshots (
      id TEXT PRIMARY KEY,
      guild_id TEXT NOT NULL,
      generated_at TEXT NOT NULL,
      snapshot_json TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS snapshots_guild_time ON snapshots(guild_id, generated_at DESC);

    CREATE TABLE IF NOT EXISTS plans (
      id TEXT PRIMARY KEY,
      guild_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      status TEXT NOT NULL,
      hash TEXT NOT NULL,
      confirmation_code TEXT NOT NULL,
      current_state_hash TEXT NOT NULL,
      plan_json TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS plans_guild_time ON plans(guild_id, created_at DESC);

    CREATE TABLE IF NOT EXISTS plan_operations (
      id TEXT PRIMARY KEY,
      plan_id TEXT NOT NULL,
      operation_index INTEGER NOT NULL,
      operation_json TEXT NOT NULL,
      status TEXT NOT NULL,
      result_json TEXT,
      rollback_json TEXT,
      error TEXT
    );
    CREATE UNIQUE INDEX IF NOT EXISTS plan_operations_order ON plan_operations(plan_id, operation_index);

    CREATE TABLE IF NOT EXISTS audit_events (
      id TEXT PRIMARY KEY,
      guild_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      actor TEXT NOT NULL,
      action TEXT NOT NULL,
      target_type TEXT,
      target_id TEXT,
      reason TEXT,
      details_json TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS audit_guild_time ON audit_events(guild_id, created_at DESC);

    CREATE TABLE IF NOT EXISTS verification_requests (
      id TEXT PRIMARY KEY,
      guild_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      source_message_id TEXT NOT NULL,
      ticket_channel_id TEXT NOT NULL,
      support_message_id TEXT,
      full_name TEXT NOT NULL,
      org_batch TEXT NOT NULL,
      preferred_nickname TEXT NOT NULL,
      nickname TEXT NOT NULL,
      parser_method TEXT NOT NULL,
      status TEXT NOT NULL,
      reviewer_id TEXT,
      selected_role TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      delete_at TEXT,
      last_error TEXT
    );
    CREATE UNIQUE INDEX IF NOT EXISTS verification_ticket_user
      ON verification_requests(ticket_channel_id, user_id);
    CREATE INDEX IF NOT EXISTS verification_deletion_due
      ON verification_requests(status, delete_at);
  `);
}
