<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'

const props = defineProps<{
  heading: string
  diagram: string
  caption?: string
}>()

const containerRef = ref<HTMLElement | null>(null)
const error = ref(false)

async function renderDiagram() {
  if (!containerRef.value || !props.diagram) return
  error.value = false
  try {
    const mermaid = (await import('mermaid')).default
    mermaid.initialize({ startOnLoad: false, theme: 'dark', securityLevel: 'strict' })
    const id = `mermaid-${Math.random().toString(36).slice(2)}`
    const { svg } = await mermaid.render(id, props.diagram)
    containerRef.value.innerHTML = svg
  } catch {
    error.value = true
  }
}

onMounted(renderDiagram)
watch(() => props.diagram, renderDiagram)
</script>

<template>
  <div class="section-block">
    <h3 class="section-heading">{{ heading }}</h3>
    <ClientOnly>
      <div v-if="!error" ref="containerRef" class="section-mermaid" />
      <pre v-else class="section-fallback">{{ diagram }}</pre>
    </ClientOnly>
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

.section-mermaid {
  overflow-x: auto;
  padding: 8px 0;

  :deep(svg) {
    max-width: 100%;
    height: auto;
  }
}

.section-fallback {
  background: #08080e;
  border-radius: 8px;
  padding: 14px 18px;
  font-family: $mono;
  font-size: 12px;
  overflow-x: auto;
  color: $muted;
}

.section-caption {
  margin-top: 10px;
  font-size: 13px;
  color: $muted;
}
</style>
