<script setup lang="ts">
import type { Question } from '~/types/tests'

defineProps<{
  question: Question
  selectedChoiceId: string | null
  showResult?: boolean
  correctChoiceId?: string | null
}>()

defineEmits<{
  select: [choiceId: string]
}>()
</script>

<template>
  <div class="question-block">
    <p class="question-prompt">{{ question.prompt }}</p>
    <div class="choices-list">
      <button
        v-for="choice in question.choices"
        :key="choice.id"
        type="button"
        :disabled="showResult"
        class="choice-btn"
        :class="{
          'choice-selected': selectedChoiceId === choice.id && !showResult,
          'choice-correct': showResult && choice.id === correctChoiceId,
          'choice-wrong':
            showResult &&
            selectedChoiceId === choice.id &&
            selectedChoiceId !== correctChoiceId,
        }"
        @click="$emit('select', choice.id)"
      >
        {{ choice.text }}
      </button>
    </div>
    <p
      v-if="
        showResult &&
        correctChoiceId &&
        selectedChoiceId !== correctChoiceId &&
        question.explain
      "
      class="explain"
    >
      {{ question.explain }}
    </p>
  </div>
</template>

<style lang="scss" scoped>
@use '~/assets/styles/tokens' as *;

.question-block {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.question-prompt {
  font-size: 15px;
  font-weight: 500;
  color: $text;
  line-height: 1.5;
}

.choices-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.choice-btn {
  width: 100%;
  text-align: left;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid $border;
  background: transparent;
  color: $text;
  font-size: 14px;
  font-family: $font;
  cursor: pointer;
  transition:
    background 0.15s,
    border-color 0.15s;

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.04);
  }

  &:disabled {
    cursor: default;
  }
}

.choice-selected {
  border-color: #6366f1;
  background: rgba(99, 102, 241, 0.1);
}

.choice-correct {
  border-color: $ok;
  background: rgba($ok, 0.1);
}

.choice-wrong {
  border-color: $err;
  background: rgba($err, 0.1);
}

.explain {
  font-size: 13px;
  color: $muted;
  line-height: 1.5;
  padding: 10px 14px;
  border-left: 3px solid #6366f1;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 0 6px 6px 0;
}
</style>
