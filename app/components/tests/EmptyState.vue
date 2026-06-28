<script setup lang="ts">
defineProps<{
  title?: string
  description?: string
}>()
</script>

<template>
  <div class="empty-state">
    <p v-if="title" class="empty-title">{{ title }}</p>
    <p v-if="description" class="empty-desc">{{ description }}</p>
    <slot />
  </div>
</template>

<style lang="scss" scoped>
@use '~/assets/styles/tokens' as *;

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 40px 24px;
  border: 1px dashed rgba($muted, 0.3);
  border-radius: $radius;
  background: rgba(255, 255, 255, 0.02);
  text-align: center;
}

.empty-title {
  font-size: 14px;
  font-weight: 500;
  color: $muted;
}

.empty-desc {
  font-size: 13px;
  color: rgba($muted, 0.7);
  max-width: 360px;
}
</style>
