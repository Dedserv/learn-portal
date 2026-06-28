<script setup lang="ts">
defineProps<{
  correct: number
  total: number
}>()
</script>

<template>
  <div class="result-summary">
    <p class="result-score">{{ correct }} из {{ total }}</p>
    <p class="result-label">
      {{ correct === total ? 'Всё верно!' : 'Есть ошибки — смотри разбор ниже' }}
    </p>
    <div class="result-bar">
      <div
        class="result-fill"
        :style="{ width: `${total ? (correct / total) * 100 : 0}%` }"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '~/assets/styles/tokens' as *;

.result-summary {
  text-align: center;
  padding: 24px;
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: $radius;
  background: rgba(99, 102, 241, 0.05);
}

.result-score {
  font-size: 24px;
  font-weight: 700;
}

.result-label {
  font-size: 13px;
  color: $muted;
  margin-top: 4px;
}

.result-bar {
  height: 6px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 3px;
  overflow: hidden;
  margin-top: 12px;
}

.result-fill {
  height: 100%;
  background: #6366f1;
  border-radius: 3px;
  transition: width 0.5s ease;
}
</style>
