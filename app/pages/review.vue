<script setup lang="ts">
import { ref, computed } from 'vue'
import { useProgress } from '~/composables/useProgress'
import ReviewChart from '~/components/portal/ReviewChart.vue'
import { formatDate, greenPct } from '~/utils/format'

const { reviewHistory } = useProgress()

type SortKey = 'completedAt' | 'critical' | 'warning' | 'good' | 'attempts'
const sortKey = ref<SortKey>('completedAt')
const sortDir = ref<'asc' | 'desc'>('desc')

const sorted = computed(() => {
  const items = [...reviewHistory.value]
  items.sort((a, b) => {
    let va: string | number = a[sortKey.value]
    let vb: string | number = b[sortKey.value]
    if (va < vb) return sortDir.value === 'asc' ? -1 : 1
    if (va > vb) return sortDir.value === 'asc' ? 1 : -1
    return 0
  })
  return items
})

function toggleSort(key: SortKey) {
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortDir.value = 'desc'
  }
}

function sortArrow(key: SortKey): string {
  if (sortKey.value !== key) return ''
  return sortDir.value === 'asc' ? ' ↑' : ' ↓'
}
</script>

<template>
  <div class="history-page">
    <section>
      <div class="section-title">Динамика оценок</div>
      <ReviewChart :items="reviewHistory" />
    </section>

    <section>
      <div class="section-title">История ревью</div>
      <div v-if="sorted.length === 0" class="empty">Нет завершённых ревью</div>
      <div v-else class="table-wrap">
        <table class="history-table">
          <thead>
            <tr>
              <th class="col-date" @click="toggleSort('completedAt')">
                Дата{{ sortArrow('completedAt') }}
              </th>
              <th>Тема</th>
              <th class="col-num" @click="toggleSort('critical')">
                🔴{{ sortArrow('critical') }}
              </th>
              <th class="col-num" @click="toggleSort('warning')">
                🟡{{ sortArrow('warning') }}
              </th>
              <th class="col-num" @click="toggleSort('good')">
                🟢{{ sortArrow('good') }}
              </th>
              <th class="col-pct">%🟢</th>
              <th class="col-summary">Замечания</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in sorted" :key="item.id">
              <td class="col-date">{{ formatDate(item.completedAt, 'long') }}</td>
              <td class="col-topic">
                <span class="topic-title">{{ item.title }}</span>
                <span class="topic-id">{{ item.id }}</span>
              </td>
              <td class="col-num num-err">{{ item.critical }}</td>
              <td class="col-num num-warn">{{ item.warning }}</td>
              <td class="col-num num-ok">{{ item.good }}</td>
              <td class="col-pct">
                <span class="pct-badge" :style="{ '--pct': greenPct(item) + '%' }">
                  {{ greenPct(item) }}%
                </span>
              </td>
              <td class="col-summary">{{ item.summary }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<style lang="scss" scoped>
@use '~/assets/styles/tokens' as *;

.history-page {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.section-title {
  @include section-title;
}

.empty {
  color: $muted;
  font-size: 13px;
  padding: 12px 0;
}

.table-wrap {
  @include card;
  padding: 0;
  overflow-x: auto;
}

.history-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;

  th {
    text-align: left;
    padding: 10px 14px;
    border-bottom: 1px solid $border;
    color: $muted;
    font-weight: 500;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    white-space: nowrap;
    user-select: none;

    &:not(.col-date):not(.col-summary) {
      cursor: pointer;

      &:hover {
        color: $text;
      }
    }
  }

  td {
    padding: 10px 14px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.04);
    vertical-align: top;
  }

  tr:last-child td {
    border-bottom: none;
  }
}

.col-date {
  width: 130px;
  white-space: nowrap;
  color: $muted;
  font-size: 12px;
}

.col-topic {
  min-width: 140px;
}

.topic-title {
  display: block;
  font-weight: 500;
  margin-bottom: 2px;
}

.topic-id {
  font-family: $mono;
  font-size: 11px;
  color: $muted;
}

.col-num {
  width: 40px;
  text-align: center;
  font-variant-numeric: tabular-nums;
  font-family: $mono;
  font-size: 12px;
}

.num-err {
  color: $err;
}

.num-warn {
  color: $warn;
}

.num-ok {
  color: $ok;
}

.col-pct {
  width: 60px;
  text-align: center;
}

.pct-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  background: linear-gradient(
    90deg,
    rgba($ok, 0.15) var(--pct),
    rgba(255, 255, 255, 0.03) var(--pct)
  );
  color: $ok;
}

.col-summary {
  color: $muted;
  font-size: 12px;
  line-height: 1.5;
  max-width: 360px;
}
</style>
