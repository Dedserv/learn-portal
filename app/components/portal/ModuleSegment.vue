<script setup lang="ts">
import { ref } from 'vue'
import type { ModuleProgress } from '~/types/progress'

defineProps<{
  module: ModuleProgress
}>()

const tooltipVisible = ref(false)
</script>

<template>
  <div
    class="module-segment"
    @mouseenter="tooltipVisible = true"
    @mouseleave="tooltipVisible = false"
  >
    <div class="segment-header">
      <span
        class="segment-dot"
        :style="{ background: module.module.color, color: module.module.color }"
      />
      <span class="segment-label">{{ module.module.title }}</span>
      <span class="segment-stat">{{ module.completed }}/{{ module.total }}</span>
    </div>
    <div class="segment-track">
      <div
        class="segment-fill"
        :style="{
          width: module.percentage + '%',
          background: module.module.color,
        }"
      />
    </div>
    <Transition name="tooltip">
      <div v-if="tooltipVisible && module.completedTopics.length > 0" class="segment-tooltip">
        <div v-for="topic in module.completedTopics" :key="topic.id" class="tooltip-row">
          <NuxtLink :to="`/topics/${topic.id}`" class="tooltip-link">
            <span class="tooltip-id">{{ topic.id }}</span>
            <span class="tooltip-title">{{ topic.title }}</span>
          </NuxtLink>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style lang="scss" scoped>
@use '~/assets/styles/tokens' as *;

.module-segment {
  position: relative;
  padding: 8px 0;
}

.segment-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.segment-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
  box-shadow: 0 0 6px currentColor;
}

.segment-label {
  font-size: 13px;
  font-weight: 500;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.segment-stat {
  font-size: 12px;
  color: $muted;
  font-variant-numeric: tabular-nums;
}

.segment-track {
  height: 4px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 2px;
  overflow: hidden;
}

.segment-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.5s ease;
}

.segment-tooltip {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 10;
  margin-top: 4px;
  min-width: 220px;
  background: #1a1a24;
  border: 1px solid $border;
  border-radius: 8px;
  padding: 8px 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
}

.tooltip-row {
  padding: 3px 0;

  & + & {
    border-top: 1px solid rgba(255, 255, 255, 0.04);
  }
}

.tooltip-link {
  display: flex;
  gap: 8px;
  font-size: 12px;
  text-decoration: none;
  color: inherit;

  &:hover .tooltip-title {
    color: $text;
  }
}

.tooltip-id {
  color: $muted;
  font-family: $mono;
  font-size: 11px;
  width: 28px;
  flex-shrink: 0;
}

.tooltip-title {
  color: $text;
}

.tooltip-enter-active,
.tooltip-leave-active {
  transition: opacity 0.15s ease;
}

.tooltip-enter-from,
.tooltip-leave-to {
  opacity: 0;
}
</style>
