import type { Client } from '@libsql/client'
import type { Meta, Module, ProgressData, Review, Topic } from '~/types/progress'
import { MODULES } from '../data/topics-catalog'
import { getCompletedCount, getMetaValue, getTotalTopics } from './topics'

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

function mapRowToProgressTopic(row: Record<string, unknown>): Topic {
  const hasReview =
    row.review_critical != null &&
    row.review_warning != null &&
    row.review_good != null &&
    row.review_summary != null

  const review: Review | null = hasReview
    ? {
        critical: row.review_critical as number,
        warning: row.review_warning as number,
        good: row.review_good as number,
        summary: row.review_summary as string,
      }
    : null

  return {
    id: row.id as string,
    moduleId: row.module_id as number,
    title: row.title as string,
    focus: row.focus as string,
    status: row.status as Topic['status'],
    completedAt: (row.completed_at as string | null) ?? null,
    attempts: row.attempts as number,
    review,
    cheatCard: parseJson(row.cheat_card as string | null, null),
    keyNotes: parseJson<string[]>(row.key_notes as string, []),
  }
}

async function buildMeta(db: Client): Promise<Meta> {
  const [totalTopics, completedTopics, startedAt, lastUpdated, inProgressRaw] =
    await Promise.all([
      getTotalTopics(db),
      getCompletedCount(db),
      getMetaValue(db, 'started_at'),
      getMetaValue(db, 'last_updated'),
      getMetaValue(db, 'in_progress'),
    ])

  let inProgress: string | null = null
  if (inProgressRaw && inProgressRaw !== 'null') {
    inProgress = inProgressRaw
  } else {
    const ipResult = await db.execute(
      `SELECT id FROM topics WHERE status = 'in-progress' LIMIT 1`,
    )
    inProgress = (ipResult.rows[0]?.id as string | undefined) ?? null
  }

  return {
    totalTopics,
    completedTopics,
    inProgress,
    lastUpdated: lastUpdated ?? new Date().toISOString().slice(0, 10),
    startedAt: startedAt ?? '2026-05-15',
  }
}

export async function buildProgressData(db: Client): Promise<ProgressData> {
  const result = await db.execute(`
    SELECT t.*,
           lr.critical AS review_critical,
           lr.warning AS review_warning,
           lr.good AS review_good,
           lr.summary AS review_summary
    FROM topics t
    LEFT JOIN topic_reviews lr ON lr.topic_id = t.id AND lr.attempt = t.attempts
    ORDER BY t.module_id, t.id
  `)

  const topics = result.rows
    .map((row) => mapRowToProgressTopic(row as Record<string, unknown>))
    .sort((a, b) => {
      if (a.moduleId !== b.moduleId) return a.moduleId - b.moduleId
      return topicSortKey(a.id) - topicSortKey(b.id)
    })

  const meta = await buildMeta(db)
  const modules: Module[] = MODULES.map((m) => ({ ...m }))

  return { meta, modules, topics }
}
