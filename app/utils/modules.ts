export const MODULES = [
  { id: 0, title: 'Модуль 0 — TypeScript для Vue', color: '#6366f1', topicsCount: 6 },
  { id: 1, title: 'Модуль 1 — Архитектура Vue', color: '#f97316', topicsCount: 9 },
  { id: 2, title: 'Модуль 2 — Паттерны проектирования', color: '#8b5cf6', topicsCount: 10 },
  { id: 3, title: 'Модуль 3 — Composables', color: '#06b6d4', topicsCount: 9 },
  { id: 4, title: 'Модуль 4 — Vue Router', color: '#10b981', topicsCount: 8 },
  { id: 5, title: 'Модуль 5 — Тестирование', color: '#f59e0b', topicsCount: 8 },
  { id: 6, title: 'Модуль 6 — Производительность', color: '#ef4444', topicsCount: 6 },
  { id: 7, title: 'Модуль 7 — Интеграция и практика', color: '#ec4899', topicsCount: 4 },
] as const

export function getModuleById(id: number) {
  return MODULES.find((m) => m.id === id)
}
