<script setup lang="ts">
defineProps<{
  heading: string
  url: string
  alt?: string
  caption?: string
}>()
</script>

<template>
  <div class="section-block">
    <h3 class="section-heading">{{ heading }}</h3>
    <div class="section-image-wrap">
      <img :src="url" :alt="alt ?? heading" class="section-image" loading="lazy" />
    </div>
    <p v-if="caption" class="section-caption">{{ caption }}</p>
  </div>
</template>

<style lang="scss" scoped>
@use '~/assets/styles/tokens' as *;

.section-block {
  @include card;
}

.section-heading {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 14px;
}

.section-image-wrap {
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid $border;
  background: #08080e;
}

.section-image {
  display: block;
  width: 100%;
  height: auto;
}

.section-caption {
  margin-top: 10px;
  font-size: 13px;
  color: $muted;
}
</style>
