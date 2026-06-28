export function scoreDots(critical: number, warning: number, good: number): string {
  const parts: string[] = []
  for (let i = 0; i < critical; i++) parts.push('🔴')
  for (let i = 0; i < warning; i++) parts.push('🟡')
  for (let i = 0; i < good; i++) parts.push('🟢')
  return parts.join('')
}

export function formatDate(dateStr: string, monthFormat: 'short' | 'long' = 'short'): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: monthFormat, year: 'numeric' })
}

export function greenPct(item: { critical: number; warning: number; good: number }): number {
  const total = item.critical + item.warning + item.good
  return total > 0 ? Math.round((item.good / total) * 100) : 0
}

export function formatDateTime(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
