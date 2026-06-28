import { ref } from 'vue'
import type { Attempt, Test } from '~/types/tests'
import {
  createAttempt,
  saveAnswer as engineSaveAnswer,
  finishAttempt as engineFinishAttempt,
} from '~/utils/attemptengine'

export function useAttempts() {
  const currentAttempt = ref<Attempt | null>(null)
  const { data: attempts, refresh: refreshAttempts } = useFetch<Attempt[]>('/api/attempts')

  function startAttempt(testId: string, testDate: string) {
    currentAttempt.value = createAttempt(testId, testDate)
  }

  function saveAnswer(questionId: string, choiceId: string | null) {
    if (!currentAttempt.value) return
    currentAttempt.value = engineSaveAnswer(currentAttempt.value, questionId, choiceId)
  }

  async function finishAttempt(test: Test): Promise<Attempt | null> {
    if (!currentAttempt.value) return null

    const finished = engineFinishAttempt(currentAttempt.value, test)
    const result = await $fetch<{ attemptId: string; score: { correct: number; total: number } }>(
      '/api/attempts',
      {
        method: 'POST',
        body: {
          testId: finished.testId,
          answers: finished.answers,
          startedAt: finished.startedAt,
          finishedAt: finished.finishedAt,
        },
      },
    )

    const saved: Attempt = {
      ...finished,
      attemptId: result.attemptId,
      score: result.score,
    }

    currentAttempt.value = null
    await refreshAttempts()
    return saved
  }

  async function fetchAttemptsByTestId(testId: string): Promise<Attempt[]> {
    return $fetch<Attempt[]>(`/api/attempts/${testId}`)
  }

  function getAttemptById(id: string): Attempt | null {
    return attempts.value?.find((a) => a.attemptId === id) ?? null
  }

  return {
    currentAttempt,
    attempts,
    refreshAttempts,
    startAttempt,
    saveAnswer,
    finishAttempt,
    fetchAttemptsByTestId,
    getAttemptById,
  }
}
