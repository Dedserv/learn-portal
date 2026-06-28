import type { Attempt } from '~/types/tests'

export function mapAttemptRow(row: Record<string, unknown>): Attempt {
  return {
    attemptId: row.id as string,
    testId: row.test_id as string,
    testDate: (row.test_date as string) ?? '',
    startedAt: row.started_at as string,
    finishedAt: row.finished_at as string,
    answers: JSON.parse(row.answers as string),
    score: {
      correct: row.score_correct as number,
      total: row.score_total as number,
    },
  }
}
