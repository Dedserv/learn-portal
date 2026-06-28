import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { getDb } from './db/index.js'
import { setMetaValue } from './utils/topics.js'
import { TOPICS_CATALOG } from './data/topics-catalog.js'
import type { ProgressData } from '../app/types/progress.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const JSON_PATH = join(__dirname, 'data', 'progress-data.json')

const db = await getDb()
const data = JSON.parse(readFileSync(JSON_PATH, 'utf-8')) as ProgressData
const now = new Date().toISOString()

let migratedTopics = 0
let migratedReviews = 0

for (const topic of data.topics) {
  const cheatCard = topic.cheatCard ? JSON.stringify(topic.cheatCard) : null
  const keyNotes = JSON.stringify(topic.keyNotes ?? [])

  await db.execute({
    sql: `UPDATE topics SET
            module_id = ?, title = ?, focus = ?, status = ?, completed_at = ?,
            attempts = ?, cheat_card = ?, key_notes = ?, updated_at = ?
          WHERE id = ?`,
    args: [
      topic.moduleId,
      topic.title,
      topic.focus,
      topic.status,
      topic.completedAt,
      topic.attempts,
      cheatCard,
      keyNotes,
      now,
      topic.id,
    ],
  })
  migratedTopics++

  if (topic.review) {
    const existing = await db.execute({
      sql: 'SELECT id FROM topic_reviews WHERE topic_id = ? AND attempt = ?',
      args: [topic.id, topic.attempts],
    })

    if (existing.rows.length === 0) {
      await db.execute({
        sql: `INSERT INTO topic_reviews (topic_id, attempt, critical, warning, good, summary, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?)`,
        args: [
          topic.id,
          topic.attempts,
          topic.review.critical,
          topic.review.warning,
          topic.review.good,
          topic.review.summary,
          now,
        ],
      })
      migratedReviews++
    }
  }
}

await setMetaValue(db, 'started_at', data.meta.startedAt)
await setMetaValue(db, 'last_updated', data.meta.lastUpdated)
await setMetaValue(db, 'total_topics', String(TOPICS_CATALOG.length))

const inProgress = data.meta.inProgress
if (inProgress) {
  const ipCheck = await db.execute({
    sql: `SELECT status FROM topics WHERE id = ?`,
    args: [inProgress],
  })
  const status = ipCheck.rows[0]?.status as string | undefined
  if (status !== 'in-progress' && status !== 'completed') {
    await db.execute({
      sql: `UPDATE topics SET status = 'in-progress', updated_at = ? WHERE id = ?`,
      args: [now, inProgress],
    })
  }
  if (status !== 'completed') {
    await setMetaValue(db, 'in_progress', inProgress)
  }
}

console.log(`Migrated ${migratedTopics} topics, ${migratedReviews} reviews from progress-data.json`)
