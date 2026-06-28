<script setup lang="ts">
import { computed, watch, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTests } from '~/composables/useTests'
import { useAttempts } from '~/composables/useAttempts'
import { formatDateTime } from '~/utils/format'
import QuestionBlock from '~/components/tests/QuestionBlock.vue'
import ResultSummary from '~/components/tests/ResultSummary.vue'
import BaseButton from '~/components/ui/BaseButton.vue'
import type { Attempt, Test } from '~/types/tests'

const route = useRoute()
const router = useRouter()
const { fetchTest } = useTests()
const { attempts } = useAttempts()

const attemptId = computed(() => route.params.id as string)

const attempt = computed<Attempt | null>(() =>
  attempts.value?.find((a) => a.attemptId === attemptId.value) ?? null,
)

const test = ref<Test | null>(null)

watch(attempt, async (found) => {
  if (!found) return
  test.value = await fetchTest(found.testId)
  if (!test.value) {
    router.replace('/attempts')
  }
}, { immediate: true })

watch(attempts, (val) => {
  if (val && !val.find((a) => a.attemptId === attemptId.value)) {
    router.replace('/attempts')
  }
})
</script>

<template>
  <div v-if="attempt && test" class="attempt-page">
    <div class="back-row">
      <BaseButton variant="ghost" @click="router.push('/attempts')">← Назад</BaseButton>
    </div>

    <ResultSummary :correct="attempt.score.correct" :total="attempt.score.total" />

    <p class="attempt-meta">
      Тест: {{ attempt.testId }} · {{ formatDateTime(attempt.finishedAt) }}
    </p>

    <div class="review-list">
      <div v-for="(q, i) in test.questions" :key="q.id" class="review-item">
        <QuestionBlock
          :question="q"
          :selected-choice-id="attempt.answers[q.id] ?? null"
          :show-result="true"
          :correct-choice-id="q.answer"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '~/assets/styles/tokens' as *;

.attempt-page {
  max-width: 700px;
}

.back-row {
  margin-bottom: 16px;
}

.attempt-meta {
  font-size: 13px;
  color: $muted;
  margin-top: 12px;
}

.review-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-top: 32px;
}

.review-item {
  background: $card;
  border: 1px solid $border;
  border-radius: $radius;
  padding: 24px;
}
</style>
