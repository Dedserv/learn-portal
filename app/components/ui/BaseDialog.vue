<script setup lang="ts">
defineProps<{
  open: boolean
}>()

defineEmits<{
  'update:open': [value: boolean]
}>()
</script>

<template>
  <Teleport to="body">
    <Transition name="dialog">
      <div v-if="open" class="dialog-overlay" @click.self="$emit('update:open', false)">
        <div class="dialog-content">
          <slot />
          <button class="dialog-close" @click="$emit('update:open', false)" aria-label="Закрыть">
            ✕
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style lang="scss" scoped>
@use '~/assets/styles/tokens' as *;

.dialog-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  padding: 24px;
}

.dialog-content {
  position: relative;
  background: $card;
  border: 1px solid $border;
  border-radius: $radius;
  padding: 24px;
  max-width: 440px;
  width: 100%;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.4);
}

.dialog-close {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: $muted;
  font-size: 14px;
  cursor: pointer;
  border-radius: 6px;
  transition: color 0.2s, background 0.2s;

  &:hover {
    color: $text;
    background: rgba(255, 255, 255, 0.06);
  }
}

.dialog-enter-active,
.dialog-leave-active {
  transition: opacity 0.2s ease;

  .dialog-content {
    transition: transform 0.2s ease, opacity 0.2s ease;
  }
}

.dialog-enter-from,
.dialog-leave-to {
  opacity: 0;

  .dialog-content {
    transform: scale(0.95);
    opacity: 0;
  }
}
</style>
