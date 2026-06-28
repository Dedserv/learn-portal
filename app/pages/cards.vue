<script setup lang="ts">
import {ref, computed, watch} from "vue";
import {useProgress} from "~/composables/useProgress";
import CheatCard from "~/components/portal/CheatCard.vue";
import type {Topic} from "~/types/progress";

const { topicsWithCheatCards, modules, allTags, getModuleById } = useProgress();

type Mode = "grid" | "random" | "carousel";
const mode = ref<Mode>("grid");

const selectedModule = ref<number | null>(null);
const selectedTag = ref<string | null>(null);
const searchQuery = ref("");

const currentIndex = ref(0);

const filteredCards = computed<Topic[]>(() => {
  let cards = topicsWithCheatCards.value;

  if (selectedModule.value !== null) {
    cards = cards.filter((t) => t.moduleId === selectedModule.value);
  }
  if (selectedTag.value !== null) {
    cards = cards.filter((t) => t.cheatCard?.tags.includes(selectedTag.value!));
  }
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase();
    cards = cards.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.cheatCard?.rule.toLowerCase().includes(q) ||
        t.cheatCard?.tags.some((tag) => tag.toLowerCase().includes(q)),
    );
  }

  return cards;
});

watch(filteredCards, () => {
  if (filteredCards.value.length === 0) {
    currentIndex.value = 0;
  } else if (currentIndex.value >= filteredCards.value.length) {
    currentIndex.value = filteredCards.value.length - 1;
  }
});

const randomCard = ref<Topic | null>(null);

function nextRandom() {
  if (filteredCards.value.length === 0) return;
  const idx = Math.floor(Math.random() * filteredCards.value.length);
  randomCard.value = filteredCards.value[idx]!;
}

function switchToRandom() {
  mode.value = "random";
  nextRandom();
}

function switchToCarousel() {
  mode.value = "carousel";
  currentIndex.value = 0;
}

function prevCard() {
  if (filteredCards.value.length === 0) return;
  currentIndex.value =
    currentIndex.value <= 0
      ? filteredCards.value.length - 1
      : currentIndex.value - 1;
}

function nextCard() {
  if (filteredCards.value.length === 0) return;
  currentIndex.value =
    currentIndex.value >= filteredCards.value.length - 1
      ? 0
      : currentIndex.value + 1;
}

const carouselTopic = computed(() => filteredCards.value[currentIndex.value]!)

function clearFilters() {
  selectedModule.value = null;
  selectedTag.value = null;
  searchQuery.value = "";
}
</script>

<template>
  <div class="cards-page">
    <div class="cards-controls">
      <div class="mode-tabs">
        <button
          class="mode-tab"
          :class="{active: mode === 'grid'}"
          @click="mode = 'grid'">
          Сетка
        </button>
        <button
          class="mode-tab"
          :class="{active: mode === 'random'}"
          @click="switchToRandom()">
          🎲 Случайная
        </button>
        <button
          class="mode-tab"
          :class="{active: mode === 'carousel'}"
          @click="switchToCarousel()">
          Карусель
        </button>
      </div>

      <div class="filter-row">
        <select v-model="selectedModule" class="filter-select">
          <option :value="null">Все модули</option>
          <option v-for="mod in modules" :key="mod.id" :value="mod.id">
            {{ mod.title }}
          </option>
        </select>

        <input
          v-model="searchQuery"
          type="text"
          class="filter-search"
          placeholder="Поиск по тексту..." />

        <button
          v-if="selectedModule !== null || selectedTag !== null || searchQuery"
          class="filter-clear"
          @click="clearFilters">
          Сбросить
        </button>
      </div>

      <div class="tag-chips">
        <button
          class="tag-chip"
          :class="{active: selectedTag === null}"
          @click="selectedTag = null">
          Все теги
        </button>
        <button
          v-for="tag in allTags"
          :key="tag"
          class="tag-chip"
          :class="{active: selectedTag === tag}"
          @click="selectedTag = tag">
          {{ tag }}
        </button>
      </div>
    </div>

    <!-- Grid -->
    <div v-if="mode === 'grid'" class="cards-grid">
      <div v-if="filteredCards.length === 0" class="empty">
        Ничего не найдено
      </div>
      <CheatCard
        v-for="topic in filteredCards"
        :key="topic.id"
        :topic="topic"
        :module="getModuleById(topic.moduleId)" />
    </div>

    <!-- Random -->
    <div v-if="mode === 'random'" class="random-mode">
      <button class="random-next" @click="nextRandom">
        {{ randomCard ? "🎲 Ещё" : "🎲 Показать случайную" }}
      </button>
      <div v-if="randomCard" class="random-card-wrap">
        <CheatCard
          :topic="randomCard"
          :module="getModuleById(randomCard.moduleId)" />
      </div>
    </div>

    <!-- Carousel -->
    <div v-if="mode === 'carousel'" class="carousel-mode">
      <div v-if="filteredCards.length === 0" class="empty">
        Ничего не найдено
      </div>
      <template v-else>
        <div class="carousel-nav">
          <button class="carousel-btn" @click="prevCard">←</button>
          <span class="carousel-pos">
            {{ currentIndex + 1 }} / {{ filteredCards.length }}
          </span>
          <button class="carousel-btn" @click="nextCard">→</button>
        </div>
        <div class="carousel-card-wrap">
          <Transition name="slide" mode="out-in">
            <CheatCard
              :key="filteredCards[currentIndex]?.id"
              :topic="carouselTopic"
              :module="
                getModuleById(filteredCards[currentIndex]?.moduleId ?? 0)
              " />
          </Transition>
        </div>
      </template>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use "~/assets/styles/tokens" as *;

.cards-controls {
  margin-bottom: 28px;
}

.mode-tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 16px;
}

.mode-tab {
  padding: 6px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: $muted;
  background: transparent;
  border: none;
  cursor: pointer;
  transition:
    color 0.2s,
    background 0.2s;

  &:hover {
    color: $text;
    background: rgba(255, 255, 255, 0.04);
  }

  &.active {
    color: $text;
    background: rgba(255, 255, 255, 0.06);
  }
}

.filter-row {
  display: flex;
  gap: 10px;
  margin-bottom: 12px;
}

.filter-select {
  appearance: none;
  background: $card;
  border: 1px solid $border;
  border-radius: 8px;
  padding: 8px 32px 8px 12px;
  font-size: 13px;
  font-family: $font;
  color: $text;
  cursor: pointer;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2371717a' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'%3E%3C/path%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;

  &:focus {
    outline: none;
    border-color: rgba(255, 255, 255, 0.2);
  }
}

.filter-search {
  flex: 1;
  background: $card;
  border: 1px solid $border;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 13px;
  font-family: $font;
  color: $text;

  &::placeholder {
    color: $muted;
  }

  &:focus {
    outline: none;
    border-color: rgba(255, 255, 255, 0.2);
  }
}

.filter-clear {
  padding: 8px 14px;
  background: transparent;
  border: 1px solid $border;
  border-radius: 8px;
  color: $muted;
  font-size: 12px;
  font-family: $font;
  cursor: pointer;
  transition: color 0.2s;

  &:hover {
    color: $text;
  }
}

.tag-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag-chip {
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

  &.active {
    background: rgba(255, 255, 255, 0.1);
    color: $text;
  }
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
}

.empty {
  color: $muted;
  font-size: 14px;
  padding: 32px 0;
  grid-column: 1 / -1;
  text-align: center;
}

.random-mode {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.random-next {
  padding: 10px 24px;
  border-radius: 10px;
  background: $card;
  border: 1px solid $border;
  color: $text;
  font-size: 15px;
  font-family: $font;
  cursor: pointer;
  transition:
    border-color 0.2s,
    background 0.2s;

  &:hover {
    border-color: rgba(255, 255, 255, 0.15);
    background: rgba(255, 255, 255, 0.04);
  }
}

.random-card-wrap {
  max-width: 560px;
  width: 100%;
}

.carousel-mode {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.carousel-nav {
  display: flex;
  align-items: center;
  gap: 16px;
}

.carousel-btn {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: $card;
  border: 1px solid $border;
  color: $text;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.2s;

  &:hover {
    border-color: rgba(255, 255, 255, 0.15);
  }
}

.carousel-pos {
  font-size: 13px;
  color: $muted;
  font-variant-numeric: tabular-nums;
}

.carousel-card-wrap {
  max-width: 560px;
  width: 100%;
}

.slide-enter-active,
.slide-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.slide-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
</style>
