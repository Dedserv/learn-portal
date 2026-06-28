import { computed } from 'vue'
import type { ProgressData, ModuleProgress, ReviewHistoryItem, Topic, Module } from '~/types/progress'

export function useProgress() {
  const { data: raw } = useFetch<ProgressData>('/api/progress')

  const progressData = computed(() => raw.value ?? undefined)

  const meta = computed(() => progressData.value?.meta)
  const modules = computed(() => progressData.value?.modules ?? [])
  const topics = computed(() => progressData.value?.topics ?? [])

  const completedTopics = computed(() =>
    topics.value
      .filter((t) => t.status === 'completed')
      .sort((a, b) => (b.completedAt ?? '').localeCompare(a.completedAt ?? '')),
  )

  const topicsWithCheatCards = computed(() =>
    completedTopics.value.filter((t) => t.cheatCard !== null),
  )

  const inProgressTopic = computed(() =>
    meta.value?.inProgress
      ? topics.value.find((t) => t.id === meta.value!.inProgress) ?? null
      : null,
  )

  const overallPercentage = computed(() => {
    if (!meta.value || meta.value.totalTopics === 0) return 0
    return Math.round((meta.value.completedTopics / meta.value.totalTopics) * 100)
  })

  const moduleProgress = computed<ModuleProgress[]>(() =>
    modules.value.map((mod) => {
      const modTopics = topics.value.filter((t) => t.moduleId === mod.id)
      const completed = modTopics.filter((t) => t.status === 'completed')
      return {
        module: mod,
        completed: completed.length,
        total: mod.topicsCount,
        percentage:
          mod.topicsCount > 0 ? Math.round((completed.length / mod.topicsCount) * 100) : 0,
        completedTopics: completed,
      }
    }),
  )

  const reviewHistory = computed<ReviewHistoryItem[]>(() =>
    completedTopics.value
      .filter((t) => t.review !== null)
      .map((t) => ({
        id: t.id,
        title: t.title,
        moduleId: t.moduleId,
        completedAt: t.completedAt!,
        critical: t.review!.critical,
        warning: t.review!.warning,
        good: t.review!.good,
        summary: t.review!.summary,
        attempts: t.attempts,
      }))
      .sort((a, b) => b.completedAt.localeCompare(a.completedAt)),
  )

  const allTags = computed<string[]>(() => {
    const tagSet = new Set<string>()
    topicsWithCheatCards.value.forEach((t) => t.cheatCard?.tags.forEach((tag) => tagSet.add(tag)))
    return [...tagSet].sort()
  })

  function getTopicById(id: string): Topic | undefined {
    return topics.value.find((t) => t.id === id)
  }

  function getModuleById(id: number): Module | undefined {
    return modules.value.find((m) => m.id === id)
  }

  return {
    meta,
    modules,
    topics,
    completedTopics,
    topicsWithCheatCards,
    inProgressTopic,
    overallPercentage,
    moduleProgress,
    reviewHistory,
    allTags,
    getTopicById,
    getModuleById,
  }
}
