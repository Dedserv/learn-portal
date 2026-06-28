<script setup lang="ts">
import { computed } from 'vue'
import type { Topic, Module } from '~/types/progress'
import { scoreDots, formatDate } from '~/utils/format'

const props = defineProps<{
  topics: Topic[]
  modules: Module[]
}>()

const moduleMap = computed(() => {
  const map = new Map<number, Module>()
  props.modules.forEach((m) => map.set(m.id, m))
  return map
})
</script>

<template>
  <div class="completed-list">
    <div class="section-title">Пройденные темы</div>
    <div v-if="topics.length === 0" class="empty">Нет пройденных тем</div>
    <div v-for="topic in topics" :key="topic.id" class="topic-row">
      <NuxtLink :to="`/topics/${topic.id}`" class="topic-link">
        <div class="topic-left">
          <span class="topic-id">{{ topic.id }}</span>
          <span
            class="topic-module"
            :style="{ color: moduleMap.get(topic.moduleId)?.color ?? '#666' }"
          >
            {{ moduleMap.get(topic.moduleId)?.title ?? '—' }}
          </span>
        </div>
        <div class="topic-center">{{ topic.title }}</div>
        <div class="topic-right">
          <span v-if="topic.review" class="topic-score">
            {{ scoreDots(topic.review.critical, topic.review.warning, topic.review.good) }}
          </span>
          <span v-if="topic.completedAt" class="topic-date">
            {{ formatDate(topic.completedAt) }}
          </span>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '~/assets/styles/tokens' as *;

.completed-list {
  @include card;
}

.section-title {
  @include section-title;
  margin-bottom: 12px;
}

.empty {
  color: $muted;
  font-size: 13px;
  padding: 12px 0;
}

.topic-row {
  & + & {
    border-top: 1px solid rgba(255, 255, 255, 0.04);
  }
}

.topic-link {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 10px 0;
  font-size: 13px;
  text-decoration: none;
  color: inherit;
  transition: opacity 0.15s;

  &:hover {
    opacity: 0.85;
  }
}

.topic-left {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 200px;
  flex-shrink: 0;
}

.topic-id {
  font-family: $mono;
  font-size: 12px;
  color: $muted;
  width: 28px;
  flex-shrink: 0;
}

.topic-module {
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.topic-center {
  flex: 1;
  font-weight: 500;
}

.topic-right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.topic-score {
  font-size: 11px;
  letter-spacing: 1px;
}

.topic-date {
  color: $muted;
  font-size: 12px;
  width: 80px;
  text-align: right;
}

@media (max-width: 600px) {
  .topic-row {
    flex-wrap: wrap;
    gap: 6px;
  }

  .topic-left {
    width: 100%;
  }

  .topic-center {
    width: 100%;
    flex-basis: 100%;
  }
}
</style>
