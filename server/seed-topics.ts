import { getDb } from './db/index.js'
import { setMetaValue } from './utils/topics.js'
import { TOPICS_CATALOG } from './data/topics-catalog.js'

const db = await getDb()
const now = new Date().toISOString()

let inserted = 0
for (const topic of TOPICS_CATALOG) {
  const result = await db.execute({
    sql: `INSERT OR IGNORE INTO topics (id, module_id, title, focus, status, completed_at, attempts, sections, cheat_card, key_notes, created_at, updated_at)
          VALUES (?, ?, ?, ?, 'pending', NULL, 0, '[]', NULL, '[]', ?, ?)`,
    args: [topic.id, topic.moduleId, topic.title, topic.focus, now, now],
  })
  if (result.rowsAffected > 0) inserted++
}

await setMetaValue(db, 'total_topics', String(TOPICS_CATALOG.length))

console.log(`Seeded ${inserted} new topics (${TOPICS_CATALOG.length} total in catalog)`)
