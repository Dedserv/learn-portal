<script setup lang="ts">
defineProps<{
  variant?: 'default' | 'secondary'
}>()
</script>

<template>
  <span class="base-badge" :class="[`badge-${variant ?? 'default'}`]">
    <slot />
  </span>
</template>

<style lang="scss" scoped>
@use '~/assets/styles/tokens' as *;

.base-badge {
  display: inline-flex;
  align-items: center;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 10px;
  border-radius: 4px;
  white-space: nowrap;
}

.badge-default {
  background: rgba(99, 102, 241, 0.15);
  color: #818cf8;
}

.badge-secondary {
  background: rgba(255, 255, 255, 0.06);
  color: $muted;
}
</style>
