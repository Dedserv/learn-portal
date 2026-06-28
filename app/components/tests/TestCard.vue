<script setup lang="ts">
import type { TestIndexEntry } from '~/types/tests'
import BaseCard from '~/components/ui/BaseCard.vue'
import BaseBadge from '~/components/ui/BaseBadge.vue'
import BaseButton from '~/components/ui/BaseButton.vue'

defineProps<{
  entry: TestIndexEntry
}>()
</script>

<template>
  <BaseCard>
    <div class="test-card">
      <div class="card-body">
        <h3 class="card-title">{{ entry.title }}</h3>
        <p class="card-date">{{ entry.date }}</p>
        <div v-if="entry.tags?.length" class="card-tags">
          <BaseBadge v-for="tag in entry.tags" :key="tag" variant="secondary">
            {{ tag }}
          </BaseBadge>
        </div>
      </div>
      <div class="card-action">
        <BaseButton :to="`/tests/${entry.id}`">Пройти</BaseButton>
      </div>
    </div>
  </BaseCard>
</template>

<style lang="scss" scoped>
@use '~/assets/styles/tokens' as *;

.test-card {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 24px;
}

.card-body {
  flex: 1;
  min-width: 0;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 4px;
}

.card-date {
  font-size: 13px;
  color: $muted;
  margin-bottom: 8px;
}

.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.card-action {
  flex-shrink: 0;
}

@media (max-width: 500px) {
  .test-card {
    flex-direction: column;
  }

  .card-action {
    align-self: flex-start;
  }
}
</style>
