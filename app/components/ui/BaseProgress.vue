<script setup lang="ts">
defineProps<{
  modelValue: number
  max?: number
}>()
</script>

<template>
  <div class="base-progress">
    <div class="progress-track">
      <div
        class="progress-fill"
        :style="{ width: `${Math.min((modelValue / (max ?? 100)) * 100, 100)}%` }"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '~/assets/styles/tokens' as *;

.base-progress {
  width: 100%;
}

.progress-track {
  height: 6px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #6366f1, $ok);
  border-radius: 3px;
  transition: width 0.5s ease;
}
</style>
