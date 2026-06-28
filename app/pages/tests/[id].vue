<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTests } from '~/composables/useTests'
import { useAttempts } from '~/composables/useAttempts'
import QuestionBlock from '~/components/tests/QuestionBlock.vue'
import ResultSummary from '~/components/tests/ResultSummary.vue'
import BaseButton from '~/components/ui/BaseButton.vue'
import BaseDialog from '~/components/ui/BaseDialog.vue'
import BaseProgress from '~/components/ui/BaseProgress.vue'
import type { Test, Question, Attempt } from '~/types/tests'

const route = useRoute()
const router = useRouter()
const { fetchTest } = useTests()
const { currentAttempt, startAttempt, saveAnswer, finishAttempt } = useAttempts()

const testId = computed(() => route.params.id as string)
const test = ref<Test | null>(null)
const currentIndex = ref(0)
const showConfirmDialog = ref(false)
const finishedAttempt = ref<Attempt | null>(null)

const currentQuestion = computed<Question | null>(() => {
  const t = test.value
  if (!t?.questions?.length) return null
  return t.questions[currentIndex.value] ?? null
})

const totalQuestions = computed(() => test.value?.questions?.length ?? 0)
const progress = computed(() =>
  totalQuestions.value ? ((currentIndex.value + 1) / totalQuestions.value) * 100 : 0,
)

const allAnswered = computed(() => {
  const a = currentAttempt.value
  const t = test.value
  if (!a || !t) return false
  return t.questions.every(
    (q) => a.answers[q.id] != null && a.answers[q.id] !== '',
  )
})

const selectedChoice = computed(() => {
  const q = currentQuestion.value
  const a = currentAttempt.value
  if (!q || !a) return null
  return a.answers[q.id] ?? null
})

async function loadTest() {
  test.value = await fetchTest(testId.value)
  if (!test.value) {
    router.replace('/tests')
    return
  }
  startAttempt(test.value.id, test.value.date)
}

onMounted(loadTest)

function selectChoice(choiceId: string) {
  const q = currentQuestion.value
  if (q) saveAnswer(q.id, choiceId)
}

function prev() {
  if (currentIndex.value > 0) currentIndex.value--
}

function next() {
  if (currentIndex.value < totalQuestions.value - 1) currentIndex.value++
}

function requestFinish() {
  if (allAnswered.value) {
    doFinish()
  } else {
    showConfirmDialog.value = true
  }
}

async function doFinish() {
  showConfirmDialog.value = false
  const t = test.value
  if (!t) return

  finishedAttempt.value = await finishAttempt(t)
}

function goHome() {
  router.push('/tests')
}
</script>

<template>
  <div class="test-page">
    <div v-if="finishedAttempt">
      <ResultSummary
        :correct="finishedAttempt.score.correct"
        :total="finishedAttempt.score.total"
      />

      <div class="review-list">
        <div v-for="q in test?.questions" :key="q.id" class="review-item">
          <QuestionBlock
            :question="q"
            :selected-choice-id="finishedAttempt.answers[q.id] ?? null"
            :show-result="true"
            :correct-choice-id="q.answer"
          />
        </div>
      </div>

      <div class="result-action">
        <BaseButton @click="goHome">На главную</BaseButton>
      </div>
    </div>

    <div v-else-if="test">
      <p class="question-counter">
        Вопрос {{ currentIndex + 1 }} из {{ totalQuestions }}
      </p>
      <BaseProgress :model-value="progress" :max="100" class="q-progress" />

      <Transition mode="out-in" name="slide">
        <div v-if="currentQuestion" :key="currentQuestion.id" class="question-card">
          <QuestionBlock
            :question="currentQuestion"
            :selected-choice-id="selectedChoice"
            @select="selectChoice"
          />
        </div>
      </Transition>

      <div class="nav-buttons">
        <BaseButton variant="outline" :disabled="currentIndex === 0" @click="prev">
          Назад
        </BaseButton>
        <BaseButton v-if="currentIndex < totalQuestions - 1" @click="next">
          Дальше
        </BaseButton>
        <BaseButton
          :variant="currentIndex < totalQuestions - 1 ? 'outline' : 'primary'"
          @click="requestFinish"
        >
          Завершить тест
        </BaseButton>
      </div>
    </div>
  </div>

  <BaseDialog :open="showConfirmDialog" @update:open="showConfirmDialog = $event">
    <div class="confirm-dialog">
      <h3 class="confirm-title">Завершить тест?</h3>
      <p class="confirm-desc">Остались неотвеченные вопросы. Завершить всё равно?</p>
      <div class="confirm-actions">
        <BaseButton variant="outline" @click="showConfirmDialog = false">Отмена</BaseButton>
        <BaseButton @click="doFinish">Завершить</BaseButton>
      </div>
    </div>
  </BaseDialog>
</template>

<style lang="scss" scoped>
@use '~/assets/styles/tokens' as *;

.test-page {
  max-width: 700px;
  margin: 0 auto;
}

.question-counter {
  font-size: 13px;
  color: $muted;
  margin-bottom: 8px;
}

.q-progress {
  margin-bottom: 24px;
}

.question-card {
  background: $card;
  border: 1px solid $border;
  border-radius: $radius;
  padding: 24px;
  margin-bottom: 24px;
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

.result-action {
  margin-top: 32px;
}

.nav-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.confirm-dialog {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.confirm-title {
  font-size: 16px;
  font-weight: 600;
}

.confirm-desc {
  font-size: 13px;
  color: $muted;
}

.confirm-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 8px;
}

.slide-enter-active,
.slide-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.slide-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
</style>
