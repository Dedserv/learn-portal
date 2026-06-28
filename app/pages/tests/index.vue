<script setup lang="ts">
import { useTests } from '~/composables/useTests'
import TestCard from '~/components/tests/TestCard.vue'
import EmptyState from '~/components/tests/EmptyState.vue'
import BaseButton from '~/components/ui/BaseButton.vue'
import BaseCard from '~/components/ui/BaseCard.vue'

const { index, getTodayTest, getLatestTests } = useTests()

const todayEntry = computed(() =>
  index.value ? getTodayTest(index.value) : undefined,
)

const latestTests = computed(() =>
  index.value ? getLatestTests(index.value, 5) : [],
)

const { data: recentAttempts } = useFetch('/api/attempts')
</script>

<template>
  <div class="tests-home">
    <section class="page-section">
      <h2 class="section-title">Тест дня</h2>
      <BaseCard v-if="todayEntry">
        <div class="today-card">
          <div class="today-info">
            <h3 class="today-title">{{ todayEntry.title }}</h3>
            <p class="today-date">{{ todayEntry.date }}</p>
          </div>
          <NuxtLink :to="`/tests/${todayEntry.id}`">
            <BaseButton>Начать тест</BaseButton>
          </NuxtLink>
        </div>
      </BaseCard>
      <EmptyState v-else title="Тест на сегодня пока не добавлен">
        <NuxtLink v-if="latestTests[0]" :to="`/tests/${latestTests[0].id}`">
          <BaseButton variant="outline">Пройти последний тест</BaseButton>
        </NuxtLink>
      </EmptyState>
    </section>

    <section class="page-section">
      <h2 class="section-title">Последние тесты</h2>
      <div v-if="latestTests.length === 0" class="skeleton-list">
        <div v-for="i in 3" :key="i" class="skeleton-card" />
      </div>
      <div v-else class="tests-list">
        <TestCard v-for="entry in latestTests" :key="entry.id" :entry="entry" />
      </div>
    </section>

    <section class="page-section">
      <h2 class="section-title">Последние попытки</h2>
      <EmptyState
        v-if="!recentAttempts?.length"
        title="Попыток пока нет"
        description="Пройдите первый тест, чтобы здесь появилась история"
      />
      <div v-else class="attempts-list">
        <NuxtLink
          v-for="a in recentAttempts.slice(0, 5)"
          :key="a.attemptId"
          :to="`/attempts/${a.attemptId}`"
          class="attempt-row"
        >
          <span class="attempt-test">{{ a.testId }}</span>
          <span class="attempt-score">{{ a.score.correct }}/{{ a.score.total }}</span>
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<style lang="scss" scoped>
@use '~/assets/styles/tokens' as *;

.tests-home {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.section-title {
  @include section-title;
}

.today-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 24px;
}

.today-title {
  font-size: 16px;
  font-weight: 600;
}

.today-date {
  font-size: 13px;
  color: $muted;
  margin-top: 4px;
}

.tests-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.skeleton-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.skeleton-card {
  height: 80px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid $border;
  border-radius: $radius;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 0.3;
  }
  50% {
    opacity: 0.6;
  }
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
  padding: 12px 16px;
  border: 1px solid $border;
  border-radius: $radius;
  transition: background 0.15s;

  &:hover {
    background: rgba(255, 255, 255, 0.03);
  }
}

.attempt-test {
  font-weight: 500;
  font-size: 14px;
}

.attempt-score {
  font-size: 16px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

@media (max-width: 500px) {
  .today-card {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
