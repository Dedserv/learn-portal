<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTopics } from '~/composables/useTopics'
import type { TopicStatus } from '~/types/progress'

const { topics, topicsByModule, inProgressTopic, getTopicStatusLabel } = useTopics()

type StatusFilter = 'all' | TopicStatus
const statusFilter = ref<StatusFilter>('all')

const filteredByModule = computed(() =>
  topicsByModule.value
    .map((group) => ({
      ...group,
      topics: group.topics.filter((t) =>
        statusFilter.value === 'all' ? true : t.status === statusFilter.value,
      ),
    }))
    .filter((group) => group.topics.length > 0),
)

const filters: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'Все' },
  { value: 'in-progress', label: 'В работе' },
  { value: 'completed', label: 'Пройденные' },
  { value: 'pending', label: 'Ожидают' },
]
</script>

<template>
  <div class="topics-page">
    <div class="page-header">
      <h1 class="page-title">Темы</h1>
      <div class="filter-tabs">
        <button
          v-for="f in filters"
          :key="f.value"
          type="button"
          class="filter-tab"
          :class="{ active: statusFilter === f.value }"
          @click="statusFilter = f.value"
        >
          {{ f.label }}
        </button>
      </div>
    </div>

    <div v-if="!topics?.length" class="empty">Темы загружаются…</div>

    <div v-else class="modules-list">
      <section v-for="group in filteredByModule" :key="group.module.id" class="module-group">
        <div class="module-header">
          <span class="module-dot" :style="{ background: group.module.color }" />
          <h2 class="module-title">{{ group.module.title }}</h2>
          <span class="module-count">{{ group.topics.length }}</span>
        </div>

        <div class="topics-list">
          <NuxtLink
            v-for="topic in group.topics"
            :key="topic.id"
            :to="`/topics/${topic.id}`"
            class="topic-row"
            :class="{
              'is-in-progress': topic.status === 'in-progress',
              'is-current': inProgressTopic?.id === topic.id,
            }"
          >
            <div class="topic-main">
              <span class="topic-id">{{ topic.id }}</span>
              <div class="topic-text">
                <span class="topic-title">{{ topic.title }}</span>
                <span class="topic-focus">{{ topic.focus }}</span>
              </div>
            </div>
            <div class="topic-meta">
              <span v-if="topic.hasContent" class="content-badge" title="Есть контент">📄</span>
              <span class="status-badge" :class="`status-${topic.status}`">
                {{ getTopicStatusLabel(topic.status) }}
              </span>
            </div>
          </NuxtLink>
        </div>
      </section>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '~/assets/styles/tokens' as *;

.topics-page {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.page-header {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.page-title {
  font-size: 22px;
  font-weight: 700;
}

.filter-tabs {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.filter-tab {
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  color: $muted;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: color 0.2s, background 0.2s;

  &:hover {
    color: $text;
    background: rgba(255, 255, 255, 0.04);
  }

  &.active {
    color: $text;
    background: rgba(255, 255, 255, 0.06);
  }
}

.empty {
  color: $muted;
  font-size: 14px;
}

.module-group {
  @include card;
  padding: 16px 20px;
}

.module-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.module-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.module-title {
  font-size: 14px;
  font-weight: 600;
  flex: 1;
}

.module-count {
  font-size: 12px;
  color: $muted;
}

.topics-list {
  display: flex;
  flex-direction: column;
}

.topic-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 8px;
  border-radius: 8px;
  text-decoration: none;
  color: inherit;
  transition: background 0.15s;

  & + & {
    border-top: 1px solid rgba(255, 255, 255, 0.04);
  }

  &:hover {
    background: rgba(255, 255, 255, 0.03);
  }

  &.is-in-progress,
  &.is-current {
    background: rgba(99, 102, 241, 0.06);
  }
}

.topic-main {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  min-width: 0;
  flex: 1;
}

.topic-id {
  font-family: $mono;
  font-size: 12px;
  color: $muted;
  width: 32px;
  flex-shrink: 0;
  padding-top: 2px;
}

.topic-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.topic-title {
  font-size: 14px;
  font-weight: 500;
  line-height: 1.35;
}

.topic-focus {
  font-size: 12px;
  color: $muted;
}

.topic-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.content-badge {
  font-size: 12px;
  opacity: 0.7;
}

.status-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 20px;
  white-space: nowrap;

  &.status-pending {
    background: rgba(255, 255, 255, 0.06);
    color: $muted;
  }

  &.status-in-progress {
    background: rgba(99, 102, 241, 0.15);
    color: #a5b4fc;
  }

  &.status-completed {
    background: rgba($ok, 0.12);
    color: $ok;
  }
}

@media (max-width: 600px) {
  .topic-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .topic-meta {
    padding-left: 44px;
  }
}
</style>
