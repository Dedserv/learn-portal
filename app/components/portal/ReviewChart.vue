<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ReviewHistoryItem } from '~/types/progress'
import { formatDate } from '~/utils/format'

const props = defineProps<{
  items: ReviewHistoryItem[]
}>()

const WIDTH = 600
const HEIGHT = 220
const PAD_LEFT = 44
const PAD_RIGHT = 16
const PAD_TOP = 16
const PAD_BOTTOM = 32

const chartWidth = WIDTH - PAD_LEFT - PAD_RIGHT
const chartHeight = HEIGHT - PAD_TOP - PAD_BOTTOM

const hoveredIdx = ref<number | null>(null)

const sorted = computed(() =>
  [...props.items].sort((a, b) => a.completedAt.localeCompare(b.completedAt)),
)

const points = computed(() => {
  if (sorted.value.length === 0) return []
  const total = sorted.value.length
  return sorted.value.map((item, i) => {
    const totalScore = item.critical + item.warning + item.good
    const pct = totalScore > 0 ? (item.good / totalScore) * 100 : 0
    const x = PAD_LEFT + (total > 1 ? (i / (total - 1)) * chartWidth : chartWidth / 2)
    const y = PAD_TOP + chartHeight - (pct / 100) * chartHeight
    return { x, y, pct, item }
  })
})

const linePath = computed(() => {
  if (points.value.length === 0) return ''
  return points.value
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(' ')
})

const areaPath = computed(() => {
  if (points.value.length === 0) return ''
  const first = points.value[0]!
  const last = points.value[points.value.length - 1]!
  const bottom = PAD_TOP + chartHeight
  return `${linePath.value} L ${last.x.toFixed(1)} ${bottom} L ${first.x.toFixed(1)} ${bottom} Z`
})

const yTicks = [0, 25, 50, 75, 100]

const hoveredPoint = computed(() =>
  hoveredIdx.value !== null ? points.value[hoveredIdx.value] ?? null : null,
)
</script>

<template>
  <div v-if="items.length === 0" class="chart-empty">Недостаточно данных для графика</div>
  <svg v-else class="chart-svg" :viewBox="`0 0 ${WIDTH} ${HEIGHT}`">
    <line
      v-for="tick in yTicks"
      :key="tick"
      :x1="PAD_LEFT"
      :y1="PAD_TOP + chartHeight - (tick / 100) * chartHeight"
      :x2="WIDTH - PAD_RIGHT"
      :y2="PAD_TOP + chartHeight - (tick / 100) * chartHeight"
      class="grid-line"
    />
    <text
      v-for="tick in yTicks"
      :key="'t' + tick"
      :x="PAD_LEFT - 8"
      :y="PAD_TOP + chartHeight - (tick / 100) * chartHeight + 4"
      class="y-label"
      text-anchor="end"
    >
      {{ tick }}%
    </text>

    <path :d="areaPath" class="area-fill" />
    <path :d="linePath" class="chart-line" />

    <circle
      v-for="(pt, i) in points"
      :key="pt.item.id"
      :cx="pt.x"
      :cy="pt.y"
      r="4"
      class="chart-dot"
      :class="{ active: hoveredIdx === i }"
      @mouseenter="hoveredIdx = i"
      @mouseleave="hoveredIdx = null"
    />

    <text
      v-for="(pt, i) in points"
      :key="'x' + pt.item.id"
      v-show="
        i === 0 ||
        i === points.length - 1 ||
        points.length <= 6 ||
        i % Math.ceil(points.length / 5) === 0
      "
      :x="pt.x"
      :y="HEIGHT - 6"
      class="x-label"
      text-anchor="middle"
    >
      {{ formatDate(pt.item.completedAt, 'short') }}
    </text>

    <g v-if="hoveredPoint" class="tooltip-group">
      <rect
        :x="Math.max(0, Math.min(hoveredPoint.x - 60, WIDTH - 140))"
        :y="hoveredPoint.y - 40 > 0 ? hoveredPoint.y - 40 : hoveredPoint.y + 12"
        width="120"
        height="32"
        rx="6"
        class="tooltip-bg"
      />
      <text
        :x="Math.max(0, Math.min(hoveredPoint.x - 60, WIDTH - 140)) + 60"
        :y="
          (hoveredPoint.y - 40 > 0 ? hoveredPoint.y - 40 : hoveredPoint.y + 12) + 20
        "
        class="tooltip-text"
        text-anchor="middle"
      >
        {{ hoveredPoint.item.title }} — {{ Math.round(hoveredPoint.pct) }}% 🟢
      </text>
    </g>
  </svg>
</template>

<style lang="scss" scoped>
@use '~/assets/styles/tokens' as *;

.chart-svg {
  width: 100%;
  max-width: 700px;
  font-family: $font;
}

.chart-empty {
  color: $muted;
  font-size: 13px;
  padding: 24px 0;
}

.grid-line {
  stroke: rgba(255, 255, 255, 0.04);
  stroke-width: 1;
}

.y-label {
  font-size: 10px;
  fill: $muted;
}

.x-label {
  font-size: 10px;
  fill: $muted;
}

.area-fill {
  fill: rgba(16, 185, 129, 0.05);
}

.chart-line {
  fill: none;
  stroke: $ok;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.chart-dot {
  fill: $ok;
  stroke: $bg;
  stroke-width: 2;
  cursor: pointer;
  transition: r 0.15s;

  &:hover,
  &.active {
    r: 6;
  }
}

.tooltip-bg {
  fill: #1a1a24;
  stroke: $border;
  stroke-width: 1;
}

.tooltip-text {
  font-size: 11px;
  fill: $text;
}
</style>
