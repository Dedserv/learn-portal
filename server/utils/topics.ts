import type { Client } from '@libsql/client'
import type {
  CreateTopicBody,
  ReviewBody,
  TopicDetail,
  TopicListEntry,
  TopicReviewEntry,
  TopicSection,
} from '~/types/topic'
import type { CheatCard, TopicStatus } from '~/types/progress'

function parseJson<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function topicSortKey(id: string): number {
  const [major, minor] = id.split('.').map(Number)
  return (major ?? 0) * 1000 + (minor ?? 0)
}

export function validateCreateTopicBody(body: CreateTopicBody): string | null {
  if (!body.id || !body.title || !body.focus || body.moduleId == null) {
    return 'Missing required fields: id, moduleId, title, focus'
  }
  if (body.sections) {
    for (const s of body.sections) {
      if (!s.type || !s.heading) return 'Each section requires type and heading'
      if (s.type === 'text' && !s.content) return 'Text section requires content'
      if (s.type === 'code' && (!s.code || !s.language)) return 'Code section requires code and language'
      if (s.type === 'mermaid' && !s.diagram) return 'Mermaid section requires diagram'
      if (s.type === 'image' && !s.url) return 'Image section requires url'
    }
  }
  return null
}

export function validateReviewBody(body: ReviewBody): string | null {
  if (
    body.critical == null ||
    body.warning == null ||
    body.good == null ||
    !body.summary
  ) {
    return 'Missing required fields: critical, warning, good, summary'
  }
  return null
}

export async function getMetaValue(db: Client, key: string): Promise<string | null> {
  const result = await db.execute({
    sql: 'SELECT value FROM portal_meta WHERE key = ?',
    args: [key],
  })
  return (result.rows[0]?.value as string | undefined) ?? null
}

export async function setMetaValue(db: Client, key: string, value: string): Promise<void> {
  await db.execute({
    sql: `INSERT INTO portal_meta (key, value) VALUES (?, ?)
          ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    args: [key, value],
  })
}

export async function setInProgress(db: Client, topicId: string): Promise<void> {
  const current = await getMetaValue(db, 'in_progress')
  if (current && current !== 'null' && current !== topicId) {
    await db.execute({
      sql: `UPDATE topics SET status = 'pending', updated_at = ? WHERE id = ? AND status = 'in-progress'`,
      args: [new Date().toISOString(), current],
    })
  }
  await setMetaValue(db, 'in_progress', topicId)
}

export function mapReviewRow(row: Record<string, unknown>): TopicReviewEntry {
  return {
    attempt: row.attempt as number,
    critical: row.critical as number,
    warning: row.warning as number,
    good: row.good as number,
    summary: row.summary as string,
    createdAt: row.created_at as string,
  }
}

export function mapTopicRow(
  row: Record<string, unknown>,
  reviews: TopicReviewEntry[] = [],
  relatedTestId: string | null = null,
): TopicDetail {
  const sections = parseJson<TopicSection[]>(row.sections as string, [])
  return {
    id: row.id as string,
    moduleId: row.module_id as number,
    title: row.title as string,
    focus: row.focus as string,
    status: row.status as TopicStatus,
    completedAt: (row.completed_at as string | null) ?? null,
    attempts: row.attempts as number,
    sections,
    cheatCard: parseJson<CheatCard | null>(row.cheat_card as string | null, null),
    keyNotes: parseJson<string[]>(row.key_notes as string, []),
    reviews,
    relatedTestId,
  }
}

export function mapTopicListRow(
  row: Record<string, unknown>,
): TopicListEntry {
  const sections = parseJson<TopicSection[]>(row.sections as string, [])
  const hasLatest =
    row.latest_critical != null &&
    row.latest_warning != null &&
    row.latest_good != null

  return {
    id: row.id as string,
    moduleId: row.module_id as number,
    title: row.title as string,
    focus: row.focus as string,
    status: row.status as TopicStatus,
    attempts: row.attempts as number,
    completedAt: (row.completed_at as string | null) ?? null,
    latestReview: hasLatest
      ? {
          critical: row.latest_critical as number,
          warning: row.latest_warning as number,
          good: row.latest_good as number,
        }
      : null,
    hasContent: sections.length > 0,
  }
}

export async function getAllReviews(db: Client, topicId: string): Promise<TopicReviewEntry[]> {
  const result = await db.execute({
    sql: 'SELECT * FROM topic_reviews WHERE topic_id = ? ORDER BY attempt DESC',
    args: [topicId],
  })
  return result.rows.map((row) => mapReviewRow(row as Record<string, unknown>))
}

export async function getRelatedTestId(db: Client, topicId: string): Promise<string | null> {
  const result = await db.execute({
    sql: 'SELECT id FROM tests WHERE topic_id = ? ORDER BY date DESC LIMIT 1',
    args: [topicId],
  })
  return (result.rows[0]?.id as string | undefined) ?? null
}

export async function fetchTopicById(db: Client, id: string): Promise<TopicDetail | null> {
  const result = await db.execute({
    sql: 'SELECT * FROM topics WHERE id = ?',
    args: [id],
  })
  if (result.rows.length === 0) return null
  const row = result.rows[0] as Record<string, unknown>
  const [reviews, relatedTestId] = await Promise.all([
    getAllReviews(db, id),
    getRelatedTestId(db, id),
  ])
  return mapTopicRow(row, reviews, relatedTestId)
}

export async function fetchAllTopics(
  db: Client,
  statusFilter?: string,
): Promise<TopicListEntry[]> {
  const sql = statusFilter
    ? `SELECT t.*,
         lr.critical AS latest_critical,
         lr.warning AS latest_warning,
         lr.good AS latest_good
       FROM topics t
       LEFT JOIN topic_reviews lr ON lr.topic_id = t.id AND lr.attempt = t.attempts
       WHERE t.status = ?
       ORDER BY t.module_id, t.id`
    : `SELECT t.*,
         lr.critical AS latest_critical,
         lr.warning AS latest_warning,
         lr.good AS latest_good
       FROM topics t
       LEFT JOIN topic_reviews lr ON lr.topic_id = t.id AND lr.attempt = t.attempts
       ORDER BY t.module_id, t.id`

  const result = await db.execute({
    sql,
    args: statusFilter ? [statusFilter] : [],
  })

  const entries = result.rows.map((row) => mapTopicListRow(row as Record<string, unknown>))
  return entries.sort((a, b) => {
    if (a.moduleId !== b.moduleId) return a.moduleId - b.moduleId
    return topicSortKey(a.id) - topicSortKey(b.id)
  })
}

export async function upsertTopic(
  db: Client,
  body: CreateTopicBody,
): Promise<{ id: string; status: TopicStatus; created: boolean }> {
  const now = new Date().toISOString()
  const sections = JSON.stringify(body.sections ?? [])
  const cheatCard = body.cheatCard ? JSON.stringify(body.cheatCard) : null
  const keyNotes = JSON.stringify(body.keyNotes ?? [])

  const existing = await db.execute({
    sql: 'SELECT id, status FROM topics WHERE id = ?',
    args: [body.id],
  })

  if (existing.rows.length === 0) {
    await db.execute({
      sql: `INSERT INTO topics (id, module_id, title, focus, status, completed_at, attempts, sections, cheat_card, key_notes, created_at, updated_at)
            VALUES (?, ?, ?, ?, 'in-progress', NULL, 0, ?, ?, ?, ?, ?)`,
      args: [
        body.id,
        body.moduleId,
        body.title,
        body.focus,
        sections,
        cheatCard,
        keyNotes,
        now,
        now,
      ],
    })
    await setInProgress(db, body.id)
    await setMetaValue(db, 'last_updated', now.slice(0, 10))
    return { id: body.id, status: 'in-progress', created: true }
  }

  const prevRow = existing.rows[0] as Record<string, unknown>
  const prevStatus = prevRow.status as TopicStatus
  const hasContent = (body.sections?.length ?? 0) > 0
  let nextStatus = prevStatus

  if (prevStatus === 'pending' && hasContent) {
    nextStatus = 'in-progress'
    await setInProgress(db, body.id)
  }

  await db.execute({
    sql: `UPDATE topics SET module_id = ?, title = ?, focus = ?, sections = ?, cheat_card = ?, key_notes = ?, updated_at = ?, status = ?
          WHERE id = ?`,
    args: [
      body.moduleId,
      body.title,
      body.focus,
      sections,
      cheatCard,
      keyNotes,
      now,
      nextStatus,
      body.id,
    ],
  })

  return { id: body.id, status: nextStatus, created: false }
}

export async function submitReview(
  db: Client,
  topicId: string,
  body: ReviewBody,
): Promise<{ attempt: number; status: TopicStatus } | null> {
  const topicResult = await db.execute({
    sql: 'SELECT id, attempts FROM topics WHERE id = ?',
    args: [topicId],
  })
  if (topicResult.rows.length === 0) return null

  const now = new Date().toISOString()
  const currentAttempts = (topicResult.rows[0]?.attempts as number) ?? 0
  const attempt = currentAttempts + 1

  await db.execute({
    sql: `INSERT INTO topic_reviews (topic_id, attempt, critical, warning, good, summary, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [topicId, attempt, body.critical, body.warning, body.good, body.summary, now],
  })

  await db.execute({
    sql: `UPDATE topics SET attempts = ?, status = 'completed', completed_at = ?, updated_at = ? WHERE id = ?`,
    args: [attempt, now.slice(0, 10), now, topicId],
  })

  const inProgress = await getMetaValue(db, 'in_progress')
  if (inProgress === topicId) {
    await setMetaValue(db, 'in_progress', 'null')
  }
  await setMetaValue(db, 'last_updated', now.slice(0, 10))

  return { attempt, status: 'completed' }
}

export async function getCompletedCount(db: Client): Promise<number> {
  const result = await db.execute(
    `SELECT COUNT(*) AS cnt FROM topics WHERE status = 'completed'`,
  )
  return (result.rows[0]?.cnt as number) ?? 0
}

export async function getTotalTopics(db: Client): Promise<number> {
  const meta = await getMetaValue(db, 'total_topics')
  if (meta) return Number(meta)
  const result = await db.execute('SELECT COUNT(*) AS cnt FROM topics')
  return (result.rows[0]?.cnt as number) ?? 0
}
