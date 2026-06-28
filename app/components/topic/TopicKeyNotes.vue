<script setup lang="ts">
defineProps<{
  notes: string[]
}>()
</script>

<template>
  <div class="topic-key-notes">
    <div class="notes-label">📌 Ключевые выводы</div>
    <ul class="notes-list">
      <li v-for="(note, i) in notes" :key="i" class="notes-item">
        <span class="notes-check">✅</span>
        <span>{{ note }}</span>
      </li>
    </ul>
  </div>
</template>

<style lang="scss" scoped>
@use '~/assets/styles/tokens' as *;

.topic-key-notes {
  @include card;
}

.notes-label {
  font-size: 13px;
  font-weight: 600;
  color: $muted;
  margin-bottom: 14px;
}

.notes-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.notes-item {
  display: flex;
  gap: 10px;
  font-size: 14px;
  line-height: 1.5;
}

.notes-check {
  flex-shrink: 0;
  font-size: 13px;
}
</style>
