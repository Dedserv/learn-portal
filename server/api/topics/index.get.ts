import { getDb } from '../../db'
import { fetchAllTopics } from '../../utils/topics'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const status = typeof query.status === 'string' ? query.status : undefined
  const db = await getDb()
  return fetchAllTopics(db, status)
})
