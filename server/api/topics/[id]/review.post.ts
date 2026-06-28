import { getDb } from '../../../db'
import { submitReview, validateReviewBody } from '../../../utils/topics'
import type { ReviewBody } from '~/types/topic'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing topic id' })
  }

  const body = await readBody<ReviewBody>(event)
  const error = validateReviewBody(body)
  if (error) {
    throw createError({ statusCode: 400, statusMessage: error })
  }

  const db = await getDb()
  const result = await submitReview(db, id, body)
  if (!result) {
    throw createError({ statusCode: 404, statusMessage: 'Topic not found' })
  }

  return { ok: true, attempt: result.attempt, status: result.status }
})
