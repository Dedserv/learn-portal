<script setup lang="ts">
import { useAttempts } from '~/composables/useAttempts'
import { formatDateTime } from '~/utils/format'
import EmptyState from '~/components/tests/EmptyState.vue'

const { attempts } = useAttempts()

const finished = computed(() =>
  attempts.value
    ? [...attempts.value]
        .filter((a) => a.finishedAt)
        .sort((a, b) => b.finishedAt.localeCompare(a.finishedAt))
    : [],
)
</script>

<template>
  <div class="attempts-page">
    <h1 class="page-title">История попыток</h1>

    <EmptyState
      v-if="finished.length === 0"
      title="Попыток пока нет"
      description="Пройдите тест на странице тестов"
    />

    <div v-else class="attempts-list">
      <NuxtLink
        v-for="a in finished"
        :key="a.attemptId"
        :to="`/attempts/${a.attemptId}`"
        class="attempt-row"
      >
        <div class="attempt-info">
          <p class="attempt-id">{{ a.testId }}</p>
          <p class="attempt-date">{{ formatDateTime(a.finishedAt) }}</p>
        </div>
        <span class="attempt-score">{{ a.score.correct }}/{{ a.score.total }}</span>
      </NuxtLink>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '~/assets/styles/tokens' as *;

.attempts-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.page-title {
  font-size: 22px;
  font-weight: 700;
}

.attempts-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.attempt-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  border: 1px solid $border;
  border-radius: $radius;
  transition: background 0.15s;

  &:hover {
    background: rgba(255, 255, 255, 0.03);
  }
}

.attempt-info {
  min-width: 0;
}

.attempt-id {
  font-weight: 500;
  font-size: 14px;
}

.attempt-date {
  font-size: 13px;
  color: $muted;
  margin-top: 2px;
}

.attempt-score {
  font-size: 18px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
</style>
