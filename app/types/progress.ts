// === Meta ===
export interface Meta {
  totalTopics: number
  completedTopics: number
  inProgress: string | null
  lastUpdated: string
  startedAt: string
}

// === Module ===
export interface Module {
  id: number
  title: string
  color: string
  topicsCount: number
}

// === Review ===
export interface Review {
  critical: number
  warning: number
  good: number
  summary: string
}

// === CheatCard ===
export interface CheatCard {
  rule: string
  code: string
  tags: string[]
}

// === Topic ===
export type TopicStatus = 'pending' | 'in-progress' | 'completed'

export interface Topic {
  id: string
  moduleId: number
  title: string
  focus: string
  status: TopicStatus
  completedAt: string | null
  attempts: number
  review: Review | null
  cheatCard: CheatCard | null
  keyNotes: string[]
}

// === Root ===
export interface ProgressData {
  meta: Meta
  modules: Module[]
  topics: Topic[]
}

// === Derived types ===
export interface ModuleProgress {
  module: Module
  completed: number
  total: number
  percentage: number
  completedTopics: Topic[]
}

export interface ReviewHistoryItem {
  id: string
  title: string
  moduleId: number
  completedAt: string
  critical: number
  warning: number
  good: number
  summary: string
  attempts: number
}
