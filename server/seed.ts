import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { readFileSync } from 'node:fs'
import { getDb } from './db/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const TESTS_SRC = process.env.TESTS_SRC
  || join(__dirname, '..', '..', '..', 'vue-learning', '_tools', 'testing-repo', 'public', 'tests')

const db = await getDb()

const indexRaw = readFileSync(join(TESTS_SRC, 'index.json'), 'utf-8')
const index = JSON.parse(indexRaw) as Array<{
  id: string
  title: string
  date: string
  path: string
  tags?: string[]
}>

let count = 0
for (const entry of index) {
  const fileName = entry.path.split('/').pop() ?? ''
  const testFile = join(TESTS_SRC, fileName)
  try {
    const testRaw = readFileSync(testFile, 'utf-8')
    const test = JSON.parse(testRaw)
    await db.execute({
      sql: `INSERT OR REPLACE INTO tests (id, title, date, topic_id, tags, questions) VALUES (?, ?, ?, ?, ?, ?)`,
      args: [
        test.id,
        test.title,
        test.date,
        null,
        entry.tags ? JSON.stringify(entry.tags) : null,
        JSON.stringify(test.questions),
      ],
    })
    count++
  } catch (e) {
    console.warn(`Failed to seed ${entry.id}:`, (e as Error).message)
  }
}

console.log(`Seeded ${count} tests`)
