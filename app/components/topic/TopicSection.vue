<script setup lang="ts">
import type { TopicSection } from '~/types/topic'
import TopicSectionText from './TopicSectionText.vue'
import TopicSectionCode from './TopicSectionCode.vue'
import TopicSectionMermaid from './TopicSectionMermaid.vue'
import TopicSectionImage from './TopicSectionImage.vue'

defineProps<{
  section: TopicSection
}>()
</script>

<template>
  <TopicSectionText
    v-if="section.type === 'text'"
    :heading="section.heading"
    :content="section.content"
  />
  <TopicSectionCode
    v-else-if="section.type === 'code'"
    :heading="section.heading"
    :language="section.language"
    :code="section.code"
    :caption="section.caption"
  />
  <TopicSectionMermaid
    v-else-if="section.type === 'mermaid'"
    :heading="section.heading"
    :diagram="section.diagram"
    :caption="section.caption"
  />
  <TopicSectionImage
    v-else-if="section.type === 'image'"
    :heading="section.heading"
    :url="section.url"
    :alt="section.alt"
    :caption="section.caption"
  />
</template>
