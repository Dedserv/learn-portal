<script setup lang="ts">
import type { TopicStatus } from '~/types/progress'

defineProps<{
  topicId: string
  title: string
  focus: string
  status: TopicStatus
  statusLabel: string
  totalTopics: number
  completedTopics: number
  moduleColor?: string
}>()
</script>

<template>
  <div class="topic-hero">
    <div class="hero-top">
      <span v-if="moduleColor" class="hero-module-dot" :style="{ background: moduleColor }" />
      <span class="hero-id">Тема {{ topicId }}</span>
      <span class="hero-status" :class="`status-${status}`">{{ statusLabel }}</span>
    </div>
    <h1 class="hero-title">{{ title }}</h1>
    <p class="hero-focus">{{ focus }}</p>
    <div class="hero-progress">
      <div class="progress-track">
        <div
          class="progress-fill"
          :style="{ width: totalTopics ? `${(completedTopics / totalTopics) * 100}%` : '0%' }"
        />
      </div>
      <span class="progress-label">{{ completedTopics }}/{{ totalTopics }} тем</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '~/assets/styles/tokens' as *;

.topic-hero {
  @include card;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.hero-top {
  display: flex;
  align-items: center;
  gap: 10px;
}

.hero-module-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.hero-id {
  font-family: $mono;
  font-size: 13px;
  color: $muted;
}

.hero-status {
  margin-left: auto;
  font-size: 12px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 20px;

  &.status-pending {
    background: rgba(255, 255, 255, 0.06);
    color: $muted;
  }

  &.status-in-progress {
    background: rgba(99, 102, 241, 0.15);
    color: #a5b4fc;
  }

  &.status-completed {
    background: rgba($ok, 0.12);
    color: $ok;
  }
}

.hero-title {
  font-size: 26px;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.hero-focus {
  font-size: 15px;
  color: $muted;
}

.hero-progress {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 4px;
}

.progress-track {
  flex: 1;
  height: 6px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #6366f1, #8b5cf6);
  border-radius: 3px;
  transition: width 0.4s ease;
}

.progress-label {
  font-size: 12px;
  color: $muted;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
</style>
