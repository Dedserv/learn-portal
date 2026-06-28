<script setup lang="ts">
import { ref, watch } from 'vue'
import type { CheatCard } from '~/types/progress'
import { useHighlighter } from '~/composables/useHighlighter'
import { escapeHtml } from '~/utils/format'

const props = defineProps<{
  cheatCard: CheatCard
}>()

const { highlight } = useHighlighter()
const highlightedCode = ref('')

watch(
  () => props.cheatCard.code,
  async (code) => {
    if (!code) {
      highlightedCode.value = ''
      return
    }
    try {
      highlightedCode.value = await highlight(code, 'vue')
    } catch {
      highlightedCode.value = escapeHtml(code)
    }
  },
  { immediate: true },
)
</script>

<template>
  <div class="topic-cheat-card">
    <div class="cheat-label">💡 Шпаргалка</div>
    <p class="cheat-rule">{{ cheatCard.rule }}</p>
    <div v-if="cheatCard.code" class="cheat-code" v-html="highlightedCode" />
    <div v-if="cheatCard.tags?.length" class="cheat-tags">
      <span v-for="tag in cheatCard.tags" :key="tag" class="cheat-tag">#{{ tag }}</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '~/assets/styles/tokens' as *;

.topic-cheat-card {
  @include card;
  border-color: rgba(#6366f1, 0.35);
  background: linear-gradient(135deg, $card 0%, rgba(99, 102, 241, 0.06) 100%);
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.cheat-label {
  font-size: 13px;
  font-weight: 600;
  color: #a5b4fc;
}

.cheat-rule {
  font-size: 15px;
  font-weight: 600;
  line-height: 1.5;
}

.cheat-code {
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
}

.cheat-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.cheat-tag {
  font-size: 11px;
  color: $muted;
  font-family: $mono;
}
</style>
