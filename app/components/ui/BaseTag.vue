<script setup lang="ts">
defineProps<{
  active?: boolean
}>()
</script>

<template>
  <button class="base-tag" :class="{ 'tag-active': active }" type="button">
    <slot />
  </button>
</template>

<style lang="scss" scoped>
@use '~/assets/styles/tokens' as *;

.base-tag {
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-family: $font;
  background: rgba(255, 255, 255, 0.04);
  color: $muted;
  border: none;
  cursor: pointer;
  transition:
    background 0.2s,
    color 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    color: $text;
  }

  &.tag-active {
    background: rgba(255, 255, 255, 0.1);
    color: $text;
  }
}
</style>
