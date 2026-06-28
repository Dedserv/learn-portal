import { createClient } from '@libsql/client'
import { join } from 'node:path'
import type { Client } from '@libsql/client'

const DB_PATH = join(process.cwd(), 'server', 'data', 'portal.db')

let client: Client | null = null
let schemaReady: Promise<void> | null = null

async function initSchema(c: Client): Promise<void> {
  await c.executeMultiple(`
    CREATE TABLE IF NOT EXISTS tests (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      date TEXT NOT NULL,
      topic_id TEXT,
      tags TEXT,
      questions TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS attempts (
      id TEXT PRIMARY KEY,
      test_id TEXT NOT NULL REFERENCES tests(id),
      started_at TEXT NOT NULL,
      finished_at TEXT NOT NULL,
      answers TEXT NOT NULL,
      score_correct INTEGER NOT NULL,
      score_total INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS topics (
      id TEXT PRIMARY KEY,
      module_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      focus TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      completed_at TEXT,
      attempts INTEGER NOT NULL DEFAULT 0,
      sections TEXT NOT NULL DEFAULT '[]',
      cheat_card TEXT,
      key_notes TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS topic_reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      topic_id TEXT NOT NULL REFERENCES topics(id),
      attempt INTEGER NOT NULL,
      critical INTEGER NOT NULL,
      warning INTEGER NOT NULL,
      good INTEGER NOT NULL,
      summary TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS portal_meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `)

  await c.execute({
    sql: `INSERT OR IGNORE INTO portal_meta (key, value) VALUES ('total_topics', ?), ('started_at', ?), ('in_progress', ?), ('last_updated', ?)`,
    args: [String(60), '2026-05-15', 'null', new Date().toISOString().slice(0, 10)],
  })
}

export async function getDb(): Promise<Client> {
  if (!client) {
    client = createClient({ url: `file:${DB_PATH}` })
    schemaReady = initSchema(client)
  }
  await schemaReady
  return client
}
