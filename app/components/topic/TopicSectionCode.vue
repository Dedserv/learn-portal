<script setup lang="ts">
import { ref, watch } from 'vue'
import { useHighlighter } from '~/composables/useHighlighter'
import { escapeHtml } from '~/utils/format'

const props = defineProps<{
  heading: string
  language: string
  code: string
  caption?: string
}>()

const { highlight } = useHighlighter()
const highlightedCode = ref('')

watch(
  () => [props.code, props.language] as const,
  async ([code, language]) => {
    if (!code) {
      highlightedCode.value = ''
      return
    }
    try {
      highlightedCode.value = await highlight(code, language)
    } catch {
      highlightedCode.value = escapeHtml(code)
    }
  },
  { immediate: true },
)
</script>

<template>
  <div class="section-block">
    <h3 class="section-heading">{{ heading }}</h3>
    <div class="section-code" v-html="highlightedCode" />
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

.section-code {
  :deep(pre) {
    background: #08080e !important;
    border-radius: 8px;
    padding: 14px 18px;
    font-family: $mono;
    font-size: 12px;
    line-height: 1.6;
    overflow-x: auto;
    margin: 0;
  }

  :deep(code) {
    font-family: $mono;
    font-size: 12px;
  }
}

.section-caption {
  margin-top: 10px;
  font-size: 13px;
  color: $muted;
}
</style>
