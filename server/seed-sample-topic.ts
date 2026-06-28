import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { getDb } from './db/index.js'
import { upsertTopic } from './utils/topics.js'
import type { CreateTopicBody } from '../app/types/topic.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const samplePath = join(__dirname, 'examples', 'post-topic-2.2.json')
const body = JSON.parse(readFileSync(samplePath, 'utf-8')) as CreateTopicBody

const db = await getDb()
const result = await upsertTopic(db, body)
console.log('Sample topic upserted:', result)
