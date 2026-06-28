import { getDb } from '../../db'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing test id' })
  }

  const db = await getDb()
  const result = await db.execute({
    sql: 'SELECT * FROM tests WHERE id = ?',
    args: [id],
  })

  if (result.rows.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Test not found' })
  }

  const row = result.rows[0]!
  return {
    id: row.id,
    title: row.title,
    date: row.date,
    questions: JSON.parse(row.questions as string),
  }
})
