import { getDb } from '../../db'

interface SubmitBody {
  testId: string
  answers: Record<string, string | null>
  startedAt: string
  finishedAt: string
}

export default defineEventHandler(async (event) => {
  const body = await readBody<SubmitBody>(event)

  if (!body.testId || !body.answers || !body.startedAt || !body.finishedAt) {
    throw createError({ statusCode: 400, statusMessage: 'Missing required fields' })
  }

  const db = await getDb()

  const testResult = await db.execute({
    sql: 'SELECT questions FROM tests WHERE id = ?',
    args: [body.testId],
  })

  if (testResult.rows.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Test not found' })
  }

  const row = testResult.rows[0]
  if (!row) {
    throw createError({ statusCode: 404, statusMessage: 'Test not found' })
  }
  const questions = JSON.parse(row.questions as string) as Array<{
    id: string
    answer: string
  }>

  let correct = 0
  for (const q of questions) {
    if (body.answers[q.id] === q.answer) correct++
  }

  const attemptId = crypto.randomUUID()

  await db.execute({
    sql: `INSERT INTO attempts (id, test_id, started_at, finished_at, answers, score_correct, score_total) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [
      attemptId,
      body.testId,
      body.startedAt,
      body.finishedAt,
      JSON.stringify(body.answers),
      correct,
      questions.length,
    ],
  })

  return {
    attemptId,
    score: { correct, total: questions.length },
  }
})
