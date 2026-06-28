export interface TestIndexEntry {
  id: string
  title: string
  date: string
  path: string
  tags?: string[]
}

export interface Question {
  id: string
  prompt: string
  choices: { id: string; text: string }[]
  answer: string
  explain: string
}

export interface Test {
  id: string
  title: string
  date: string
  questions: Question[]
}

export interface Attempt {
  attemptId: string
  testId: string
  testDate: string
  startedAt: string
  finishedAt: string
  answers: Record<string, string | null>
  score: { correct: number; total: number }
}
