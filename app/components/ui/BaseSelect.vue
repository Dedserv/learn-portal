<script setup lang="ts" generic="T extends string | number | null">
defineProps<{
  modelValue: T
  options: { value: T; label: string }[]
}>()

defineEmits<{
  'update:modelValue': [value: T]
}>()
</script>

<template>
  <select
    class="base-select"
    :value="modelValue"
    @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value as T)"
  >
    <option
      v-for="opt in options"
      :key="String(opt.value)"
      :value="opt.value"
    >
      {{ opt.label }}
    </option>
  </select>
</template>

<style lang="scss" scoped>
@use '~/assets/styles/tokens' as *;

.base-select {
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
</style>
