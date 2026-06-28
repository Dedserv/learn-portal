import type { CheatCard, TopicStatus } from '~/types/progress'

export type TopicSection =
  | { type: 'text'; heading: string; content: string }
  | {
      type: 'code'
      heading: string
      language: string
      code: string
      caption?: string
    }
  | {
      type: 'mermaid'
      heading: string
      diagram: string
      caption?: string
    }
  | {
      type: 'image'
      heading: string
      url: string
      alt?: string
      caption?: string
    }

export interface TopicReviewEntry {
  attempt: number
  critical: number
  warning: number
  good: number
  summary: string
  createdAt: string
}

export interface TopicReviewScores {
  critical: number
  warning: number
  good: number
}

export interface TopicListEntry {
  id: string
  moduleId: number
  title: string
  focus: string
  status: TopicStatus
  attempts: number
  completedAt: string | null
  latestReview: TopicReviewScores | null
  hasContent: boolean
}

export interface TopicDetail {
  id: string
  moduleId: number
  title: string
  focus: string
  status: TopicStatus
  completedAt: string | null
  attempts: number
  sections: TopicSection[]
  cheatCard: CheatCard | null
  keyNotes: string[]
  reviews: TopicReviewEntry[]
  relatedTestId: string | null
}

export interface CreateTopicBody {
  id: string
  moduleId: number
  title: string
  focus: string
  sections?: TopicSection[]
  cheatCard?: CheatCard | null
  keyNotes?: string[]
}

export interface ReviewBody {
  critical: number
  warning: number
  good: number
  summary: string
}
