import type { Attempt, Test } from '~/types/tests'

export function createAttempt(testId: string, testDate: string): Attempt {
  const now = new Date().toISOString()
  return {
    attemptId: crypto.randomUUID(),
    testId,
    testDate,
    startedAt: now,
    finishedAt: '',
    answers: {},
    score: { correct: 0, total: 0 },
  }
}

export function saveAnswer(
  attempt: Attempt,
  questionId: string,
  choiceId: string | null,
): Attempt {
  return {
    ...attempt,
    answers: {
      ...attempt.answers,
      [questionId]: choiceId,
    },
  }
}

export function finishAttempt(attempt: Attempt, test: Test): Attempt {
  let correct = 0
  for (const q of test.questions) {
    const userAnswer = attempt.answers[q.id]
    if (userAnswer === q.answer) correct++
  }
  return {
    ...attempt,
    finishedAt: new Date().toISOString(),
    score: { correct, total: test.questions.length },
  }
}
