import { getDb } from '../../db'
import { mapAttemptRow } from '../../utils/attempts'

export default defineEventHandler(async () => {
  const db = await getDb()
  const result = await db.execute(
    `SELECT a.*, t.date AS test_date
     FROM attempts a
     JOIN tests t ON a.test_id = t.id
     ORDER BY a.finished_at DESC`,
  )

  return result.rows.map((row) => mapAttemptRow(row as Record<string, unknown>))
})
