import { computed } from 'vue'
import type { TopicListEntry, TopicDetail } from '~/types/topic'
import type { TopicStatus } from '~/types/progress'
import { MODULES } from '~/utils/modules'

const STATUS_LABELS: Record<TopicStatus, string> = {
  pending: 'Ожидает',
  'in-progress': 'В работе',
  completed: 'Пройдена',
}

export function useTopics() {
  const { data: topics, refresh: refreshTopics } = useFetch<TopicListEntry[]>('/api/topics')

  async function fetchTopic(id: string): Promise<TopicDetail | null> {
    try {
      return await $fetch<TopicDetail>(`/api/topics/${id}`)
    } catch {
      return null
    }
  }

  const inProgressTopic = computed(
    () => topics.value?.find((t) => t.status === 'in-progress') ?? null,
  )

  const completedTopics = computed(() =>
    (topics.value ?? [])
      .filter((t) => t.status === 'completed')
      .sort((a, b) => (b.completedAt ?? '').localeCompare(a.completedAt ?? '')),
  )

  const completedCount = computed(() => completedTopics.value.length)
  const totalTopics = computed(() => topics.value?.length ?? MODULES.reduce((s, m) => s + m.topicsCount, 0))

  const topicsByModule = computed(() =>
    MODULES.map((mod) => ({
      module: mod,
      topics: (topics.value ?? [])
        .filter((t) => t.moduleId === mod.id)
        .sort((a, b) => {
          const [am, ai] = a.id.split('.').map(Number)
          const [bm, bi] = b.id.split('.').map(Number)
          return (am! - bm!) * 1000 + (ai! - bi!)
        }),
    })),
  )

  function getTopicStatusLabel(status: TopicStatus): string {
    return STATUS_LABELS[status]
  }

  return {
    topics,
    refreshTopics,
    fetchTopic,
    inProgressTopic,
    completedTopics,
    completedCount,
    totalTopics,
    topicsByModule,
    getTopicStatusLabel,
    modules: MODULES,
  }
}
