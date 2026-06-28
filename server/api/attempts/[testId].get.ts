import { getDb } from '../../db'
import { mapAttemptRow } from '../../utils/attempts'

export default defineEventHandler(async (event) => {
  const testId = getRouterParam(event, 'testId')
  if (!testId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing testId' })
  }

  const db = await getDb()
  const result = await db.execute({
    sql: `SELECT a.*, t.date AS test_date
          FROM attempts a
          JOIN tests t ON a.test_id = t.id
          WHERE a.test_id = ?
          ORDER BY a.finished_at DESC`,
    args: [testId],
  })

  return result.rows.map((row) => mapAttemptRow(row as Record<string, unknown>))
})
