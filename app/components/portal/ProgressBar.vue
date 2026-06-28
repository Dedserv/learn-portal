<script setup lang="ts">
import BaseProgress from '~/components/ui/BaseProgress.vue'

defineProps<{
  completed: number
  total: number
  percentage: number
}>()
</script>

<template>
  <div class="progress-bar">
    <div class="progress-info">
      <span class="progress-count">{{ completed }} из {{ total }}</span>
      <span class="progress-pct">{{ percentage }}%</span>
    </div>
    <BaseProgress :model-value="percentage" :max="100" />
  </div>
</template>

<style lang="scss" scoped>
@use '~/assets/styles/tokens' as *;

.progress-bar {
  @include card;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 12px;
}

.progress-count {
  font-size: 18px;
  font-weight: 700;
}

.progress-pct {
  font-size: 28px;
  font-weight: 800;
  color: $ok;
}
</style>
