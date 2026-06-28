<script setup lang="ts">
defineProps<{
  variant?: 'primary' | 'ghost' | 'outline'
  size?: 'sm' | 'md'
  disabled?: boolean
  to?: string
}>()
</script>

<template>
  <NuxtLink v-if="to" :to="to" class="base-btn" :class="[`btn-${variant ?? 'primary'}`, `btn-${size ?? 'md'}`]">
    <slot />
  </NuxtLink>
  <button
    v-else
    class="base-btn"
    :class="[`btn-${variant ?? 'primary'}`, `btn-${size ?? 'md'}`]"
    :disabled="disabled"
  >
    <slot />
  </button>
</template>

<style lang="scss" scoped>
@use '~/assets/styles/tokens' as *;

.base-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border-radius: 8px;
  font-family: $font;
  font-weight: 500;
  cursor: pointer;
  transition:
    background 0.2s,
    border-color 0.2s,
    color 0.2s,
    opacity 0.2s;
  border: 1px solid transparent;
  white-space: nowrap;
  text-decoration: none;

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
}

.btn-sm {
  padding: 4px 12px;
  font-size: 12px;
}

.btn-md {
  padding: 8px 20px;
  font-size: 14px;
}

.btn-primary {
  background: #6366f1;
  color: #fff;
  border-color: #6366f1;

  &:hover:not(:disabled) {
    background: #5558e6;
  }
}

.btn-ghost {
  background: transparent;
  color: $muted;
  border-color: transparent;

  &:hover:not(:disabled) {
    color: $text;
    background: rgba(255, 255, 255, 0.04);
  }
}

.btn-outline {
  background: transparent;
  color: $text;
  border-color: $border;

  &:hover:not(:disabled) {
    border-color: rgba(255, 255, 255, 0.15);
    background: rgba(255, 255, 255, 0.03);
  }
}
</style>
