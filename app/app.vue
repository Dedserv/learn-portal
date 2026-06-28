<script setup lang="ts">
const route = useRoute()

const tabs = [
  { to: '/', label: 'Дашборд' },
  { to: '/topics', label: 'Темы' },
  { to: '/cards', label: 'Шпаргалки' },
  { to: '/review', label: 'Ревью' },
  { to: '/tests', label: 'Тесты' },
  { to: '/attempts', label: 'Попытки' },
] as const

const activeTab = computed(() => {
  const path = route.path
  if (path === '/') return '/'
  return '/' + (path.split('/')[1] ?? '')
})
</script>

<template>
  <div class="app-shell">
    <header class="app-header">
      <span class="app-logo">Обучение Vue</span>
      <nav class="app-nav">
        <NuxtLink
          v-for="tab in tabs"
          :key="tab.to"
          :to="tab.to"
          class="nav-tab"
          :class="{ active: activeTab === tab.to }"
        >
          {{ tab.label }}
        </NuxtLink>
      </nav>
    </header>
    <main class="app-main">
      <NuxtPage />
    </main>
  </div>
</template>

<style lang="scss">
@use '~/assets/styles/tokens' as *;

.app-shell {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 48px;

  @media (max-width: 700px) {
    padding: 24px 20px;
  }
}

.app-header {
  display: flex;
  align-items: center;
  gap: 40px;
  padding-bottom: 24px;
  border-bottom: 1px solid $border;
  margin-bottom: 40px;

  @media (max-width: 600px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
}

.app-logo {
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.02em;
  white-space: nowrap;
}

.app-nav {
  display: flex;
  gap: 4px;
}

.nav-tab {
  padding: 6px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: $muted;
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

.app-main {
  min-height: 60vh;
}

// Page transitions
.page-enter-active,
.page-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
