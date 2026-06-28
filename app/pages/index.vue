<script setup lang="ts">
import { useProgress } from '~/composables/useProgress'
import ProgressBar from '~/components/portal/ProgressBar.vue'
import ModuleSegment from '~/components/portal/ModuleSegment.vue'
import CompletedList from '~/components/portal/CompletedList.vue'

const { meta, inProgressTopic, overallPercentage, moduleProgress, completedTopics, modules } =
  useProgress()
</script>

<template>
  <div v-if="meta" class="dashboard">
    <section class="dash-section">
      <ProgressBar
        :completed="meta.completedTopics"
        :total="meta.totalTopics"
        :percentage="overallPercentage"
      />
    </section>

    <section v-if="inProgressTopic" class="dash-section">
      <NuxtLink :to="`/topics/${inProgressTopic.id}`" class="in-progress-link">
        <div class="in-progress-card">
          <div class="section-title">Сейчас в работе</div>
          <div class="in-progress-info">
            <span class="in-progress-id">{{ inProgressTopic.id }}</span>
            <span class="in-progress-title">{{ inProgressTopic.title }}</span>
            <span class="in-progress-focus">{{ inProgressTopic.focus }}</span>
          </div>
        </div>
      </NuxtLink>
    </section>

    <section class="dash-section">
      <div class="modules-grid">
        <div class="section-title">Прогресс по модулям</div>
        <ModuleSegment
          v-for="mod in moduleProgress"
          :key="mod.module.id"
          :module="mod"
        />
      </div>
    </section>

    <section class="dash-section">
      <CompletedList :topics="completedTopics" :modules="modules" />
    </section>
  </div>
</template>

<style lang="scss" scoped>
@use '~/assets/styles/tokens' as *;

.dashboard {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.in-progress-link {
  text-decoration: none;
  color: inherit;
  display: block;
}

.in-progress-card {
  @include card;
  border-color: rgba($color-feature, 0.3);
  background: linear-gradient(135deg, $card 0%, rgba($color-feature, 0.04) 100%);
  transition: border-color 0.2s;

  &:hover {
    border-color: rgba($color-feature, 0.5);
  }
}

.section-title {
  @include section-title;
}

.in-progress-info {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.in-progress-id {
  font-family: $mono;
  font-size: 14px;
  color: $color-feature;
}

.in-progress-title {
  font-size: 18px;
  font-weight: 700;
}

.in-progress-focus {
  font-size: 13px;
  color: $muted;
}

.modules-grid {
  @include card;
}

@media (max-width: 600px) {
  .in-progress-info {
    flex-wrap: wrap;
  }
}
</style>
