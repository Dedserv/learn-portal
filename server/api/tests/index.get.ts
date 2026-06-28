import { getDb } from '../../db'

export default defineEventHandler(async () => {
  const db = await getDb()
  const result = await db.execute(
    'SELECT id, title, date, topic_id, tags FROM tests ORDER BY date DESC',
  )

  return result.rows.map((row) => ({
    id: row.id as string,
    title: row.title as string,
    date: row.date as string,
    topicId: (row.topic_id as string | null) ?? undefined,
    path: `/tests/${row.id}.json`,
    tags: row.tags ? JSON.parse(row.tags as string) : undefined,
  }))
})
