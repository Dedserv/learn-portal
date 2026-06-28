import { getDb } from '../../db'
import { fetchTopicById } from '../../utils/topics'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing topic id' })
  }

  const db = await getDb()
  const topic = await fetchTopicById(db, id)
  if (!topic) {
    throw createError({ statusCode: 404, statusMessage: 'Topic not found' })
  }

  return topic
})
