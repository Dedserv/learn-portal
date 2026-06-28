<script setup lang="ts">
defineProps<{
  padding?: boolean
}>()
</script>

<template>
  <div class="base-card" :class="{ 'card-padded': padding !== false }">
    <slot />
  </div>
</template>

<style lang="scss" scoped>
@use '~/assets/styles/tokens' as *;

.base-card {
  background: $card;
  border: 1px solid $border;
  border-radius: $radius;
}

.card-padded {
  padding: 20px 24px;
}
</style>
