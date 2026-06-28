<script setup lang="ts">
import MarkdownIt from 'markdown-it'

const props = defineProps<{
  heading: string
  content: string
}>()

const md = new MarkdownIt({ html: false, linkify: true, breaks: true })
const html = computed(() => md.render(props.content))
</script>

<template>
  <div class="section-block">
    <h3 class="section-heading">{{ heading }}</h3>
    <div class="section-text" v-html="html" />
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

.section-text {
  font-size: 14px;
  line-height: 1.65;
  color: $text;

  :deep(p) {
    margin: 0 0 12px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  :deep(code) {
    font-family: $mono;
    font-size: 12px;
    background: rgba(255, 255, 255, 0.06);
    padding: 2px 6px;
    border-radius: 4px;
  }

  :deep(ul),
  :deep(ol) {
    margin: 0 0 12px;
    padding-left: 20px;
  }
}
</style>
