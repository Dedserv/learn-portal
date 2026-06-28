<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTopics } from '~/composables/useTopics'
import { getModuleById } from '~/utils/modules'
import TopicHero from '~/components/topic/TopicHero.vue'
import TopicSection from '~/components/topic/TopicSection.vue'
import TopicCheatCard from '~/components/topic/TopicCheatCard.vue'
import TopicKeyNotes from '~/components/topic/TopicKeyNotes.vue'
import TopicReviewHistory from '~/components/topic/TopicReviewHistory.vue'
import BaseButton from '~/components/ui/BaseButton.vue'
import type { TopicDetail } from '~/types/topic'

const route = useRoute()
const router = useRouter()
const { fetchTopic, completedCount, totalTopics, getTopicStatusLabel } = useTopics()

const topicId = computed(() => route.params.id as string)
const topic = ref<TopicDetail | null>(null)

onMounted(async () => {
  topic.value = await fetchTopic(topicId.value)
  if (!topic.value) {
    router.replace('/topics')
  }
})

const module = computed(() =>
  topic.value ? getModuleById(topic.value.moduleId) : undefined,
)
</script>

<template>
  <div v-if="topic" class="topic-detail">
    <div class="back-row">
      <BaseButton variant="ghost" @click="router.push('/topics')">← К списку тем</BaseButton>
    </div>

    <TopicHero
      :topic-id="topic.id"
      :title="topic.title"
      :focus="topic.focus"
      :status="topic.status"
      :status-label="getTopicStatusLabel(topic.status)"
      :total-topics="totalTopics"
      :completed-topics="completedCount"
      :module-color="module?.color"
    />

    <div v-if="topic.sections.length === 0" class="empty-sections">
      Материал в подготовке
    </div>

    <TopicSection
      v-for="(section, i) in topic.sections"
      :key="i"
      :section="section"
    />

    <TopicCheatCard v-if="topic.cheatCard" :cheat-card="topic.cheatCard" />

    <TopicKeyNotes v-if="topic.keyNotes.length" :notes="topic.keyNotes" />

    <TopicReviewHistory v-if="topic.reviews.length" :reviews="topic.reviews" />

    <div v-if="topic.relatedTestId" class="test-cta">
      <NuxtLink :to="`/tests/${topic.relatedTestId}`">
        <BaseButton>Пройти тест</BaseButton>
      </NuxtLink>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '~/assets/styles/tokens' as *;

.topic-detail {
  max-width: 760px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.back-row {
  margin-bottom: -8px;
}

.empty-sections {
  @include card;
  color: $muted;
  font-size: 14px;
  text-align: center;
  padding: 32px;
}

.test-cta {
  padding-top: 8px;
}
</style>
