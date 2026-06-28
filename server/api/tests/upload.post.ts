import { getDb } from '../../db'

interface UploadBody {
  id: string
  title: string
  date: string
  topicId?: string
  tags?: string[]
  questions: Array<{
    id: string
    prompt: string
    choices: { id: string; text: string }[]
    answer: string
    explain: string
  }>
}

export default defineEventHandler(async (event) => {
  const body = await readBody<UploadBody>(event)

  if (!body.id || !body.title || !body.date || !body.questions?.length) {
    throw createError({ statusCode: 400, statusMessage: 'Missing required fields: id, title, date, questions' })
  }

  const db = await getDb()

  await db.execute({
    sql: `INSERT OR REPLACE INTO tests (id, title, date, topic_id, tags, questions) VALUES (?, ?, ?, ?, ?, ?)`,
    args: [
      body.id,
      body.title,
      body.date,
      body.topicId ?? null,
      body.tags ? JSON.stringify(body.tags) : null,
      JSON.stringify(body.questions),
    ],
  })

  return { ok: true, id: body.id }
})
