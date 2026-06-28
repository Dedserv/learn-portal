import { getDb } from '../../db'
import { upsertTopic, validateCreateTopicBody } from '../../utils/topics'
import type { CreateTopicBody } from '~/types/topic'

export default defineEventHandler(async (event) => {
  const body = await readBody<CreateTopicBody>(event)
  const error = validateCreateTopicBody(body)
  if (error) {
    throw createError({ statusCode: 400, statusMessage: error })
  }

  const db = await getDb()
  const result = await upsertTopic(db, body)
  return { ok: true, id: result.id, status: result.status, created: result.created }
})
