<script setup lang="ts">
import { ref, computed } from 'vue'
import type { TopicReviewEntry } from '~/types/topic'
import { scoreDots } from '~/utils/format'

const props = defineProps<{
  reviews: TopicReviewEntry[]
}>()

const sorted = computed(() =>
  [...props.reviews].sort((a, b) => b.attempt - a.attempt),
)

const currentIndex = ref(0)

const current = computed(() => sorted.value[currentIndex.value] ?? null)

const previous = computed(() => sorted.value[currentIndex.value + 1] ?? null)

const improved = computed(() => {
  if (!current.value || !previous.value) return false
  const currBad = current.value.critical + current.value.warning
  const prevBad = previous.value.critical + previous.value.warning
  return currBad < prevBad
})

function prevAttempt() {
  if (currentIndex.value < sorted.value.length - 1) currentIndex.value++
}

function nextAttempt() {
  if (currentIndex.value > 0) currentIndex.value--
}
</script>

<template>
  <div v-if="current" class="topic-review-history">
    <div class="history-header">
      <div class="history-label">📋 История ревью</div>
      <div v-if="sorted.length > 1" class="history-nav">
        <button type="button" class="nav-btn" :disabled="currentIndex >= sorted.length - 1" @click="prevAttempt">
          ←
        </button>
        <span class="nav-label">Попытка {{ current.attempt }}</span>
        <button type="button" class="nav-btn" :disabled="currentIndex <= 0" @click="nextAttempt">
          →
        </button>
      </div>
    </div>

    <div class="history-row">
      <span class="attempt-label">Попытка {{ current.attempt }}</span>
      <span class="attempt-scores">
        {{ scoreDots(current.critical, current.warning, current.good) }}
      </span>
    </div>

    <p class="history-summary">{{ current.summary }}</p>

    <p v-if="improved" class="history-improved">▲ улучшение!</p>
  </div>
</template>

<style lang="scss" scoped>
@use '~/assets/styles/tokens' as *;

.topic-review-history {
  @include card;
}

.history-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
  gap: 12px;
}

.history-label {
  font-size: 13px;
  font-weight: 600;
  color: $muted;
}

.history-nav {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-btn {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 1px solid $border;
  background: transparent;
  color: $text;
  cursor: pointer;
  font-size: 14px;

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.04);
  }
}

.nav-label {
  font-size: 12px;
  color: $muted;
  font-variant-numeric: tabular-nums;
}

.history-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.attempt-label {
  font-weight: 600;
  font-size: 14px;
}

.attempt-scores {
  font-size: 12px;
  letter-spacing: 1px;
}

.history-summary {
  font-size: 13px;
  color: $muted;
  line-height: 1.55;
}

.history-improved {
  margin-top: 10px;
  font-size: 12px;
  font-weight: 600;
  color: $ok;
}
</style>
