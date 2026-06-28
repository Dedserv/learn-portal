<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Topic, Module } from '~/types/progress'
import { useHighlighter } from '~/composables/useHighlighter'
import { scoreDots, formatDate, escapeHtml } from '~/utils/format'

const props = defineProps<{
  topic: Topic
  module: Module | undefined
}>()

const { highlight } = useHighlighter()
const highlightedCode = ref('')

watch(
  () => props.topic.cheatCard?.code,
  async (code) => {
    if (code) {
      try {
        highlightedCode.value = await highlight(code)
      } catch {
        highlightedCode.value = escapeHtml(code)
      }
    }
  },
  { immediate: true },
)
</script>

<template>
  <div class="cheat-card">
    <div class="card-header">
      <span v-if="module" class="card-module" :style="{ background: module.color }">
        {{ module.title }}
      </span>
      <span class="card-id">{{ topic.id }}</span>
    </div>

    <p v-if="topic.cheatCard?.rule" class="card-rule">{{ topic.cheatCard.rule }}</p>

    <div
      v-if="topic.cheatCard?.code"
      class="card-code"
      v-html="highlightedCode"
    />

    <div v-if="topic.cheatCard?.tags?.length" class="card-tags">
      <span v-for="tag in topic.cheatCard.tags" :key="tag" class="card-tag">{{ tag }}</span>
    </div>

    <div class="card-footer">
      <span v-if="topic.review" class="card-score">
        {{ scoreDots(topic.review.critical, topic.review.warning, topic.review.good) }}
      </span>
      <span v-if="topic.completedAt" class="card-date">
        {{ formatDate(topic.completedAt) }}
      </span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '~/assets/styles/tokens' as *;

.cheat-card {
  @include card;
  @include card-hover;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 18px 22px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.card-module {
  font-size: 10px;
  font-weight: 700;
  color: #fff;
  padding: 2px 10px;
  border-radius: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 180px;
}

.card-id {
  font-family: $mono;
  font-size: 11px;
  color: $muted;
}

.card-rule {
  font-size: 15px;
  font-weight: 600;
  line-height: 1.5;
  letter-spacing: -0.01em;
}

.card-code {
  :deep(pre) {
    background: #08080e !important;
    border-radius: 8px;
    padding: 14px 18px;
    font-family: $mono;
    font-size: 12px;
    line-height: 1.6;
    overflow-x: auto;
    margin: 0;
  }

  :deep(code) {
    font-family: $mono;
    font-size: 12px;
  }
}

.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.card-tag {
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.04);
  color: #a1a1aa;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  padding-top: 4px;
}

.card-score {
  font-size: 11px;
  letter-spacing: 1px;
}

.card-date {
  font-size: 11px;
  color: $muted;
}
</style>
