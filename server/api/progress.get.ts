import { getDb } from '../db'
import { buildProgressData } from '../utils/progress'

export default defineEventHandler(async () => {
  const db = await getDb()
  return buildProgressData(db)
})
