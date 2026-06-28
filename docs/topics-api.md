# Темы: API и UI

Краткий справочник для добавления контента тем, отправки ревью и понимания того, как данные попадают на страницы.

> **Важно:** файлы на сервер не загружаются. Весь контент — JSON в теле запроса. Картинки — только по URL.

---

## Быстрый старт

```bash
# 60 заглушек тем (id, title, focus, status=pending) из plan.md
npm run seed:topics

# Пример полной темы 2.2 (sections + cheatCard + keyNotes)
npm run seed:sample-topic

# Однократная миграция completed-тем и reviews из progress-data.json
npm run migrate:progress
```

Пример JSON для POST — `server/examples/post-topic-2.2.json`.

---

## Жизненный цикл темы

| Статус | Когда ставится |
|--------|----------------|
| `pending` | Заглушка без контента (seed) |
| `in-progress` | Первый POST с непустым `sections`, или upsert новой темы |
| `completed` | POST `/api/topics/:id/review` |

Правила:

- Одновременно **одна** тема `in-progress` (хранится в `portal_meta.in_progress`). При старте новой предыдущая `in-progress` откатывается в `pending`.
- `attempts` увеличивается на 1 при каждом ревью.
- Повторный POST контента **не сбрасывает** `completed` — только обновляет поля.

---

## База данных

| Таблица | Назначение |
|---------|------------|
| `topics` | Контент темы, статус, attempts |
| `topic_reviews` | История ревью (по attempt) |
| `portal_meta` | `total_topics`, `in_progress`, `last_updated`, `started_at` |

Типы: `app/types/topic.ts`, `app/types/progress.ts`.  
Бизнес-логика: `server/utils/topics.ts`.

---

## API: темы

### `GET /api/topics`

Список всех тем (краткий формат).

**Query:** `?status=pending|in-progress|completed` — опциональный фильтр.

**Ответ:** `TopicListEntry[]`

```json
{
  "id": "2.2",
  "moduleId": 2,
  "title": "Renderless Components",
  "focus": "Абстракция логики без UI",
  "status": "in-progress",
  "attempts": 0,
  "completedAt": null,
  "latestReview": null,
  "hasContent": true
}
```

`latestReview` — оценки последней попытки (если есть). `hasContent` — `sections.length > 0`.

---

### `GET /api/topics/:id`

Полная тема + история ревью + связанный тест.

**Ответ:** `TopicDetail`

```json
{
  "id": "2.2",
  "moduleId": 2,
  "title": "...",
  "focus": "...",
  "status": "in-progress",
  "completedAt": null,
  "attempts": 0,
  "sections": [ /* см. типы секций ниже */ ],
  "cheatCard": { "rule": "...", "code": "...", "tags": ["..."] },
  "keyNotes": ["..."],
  "reviews": [],
  "relatedTestId": null
}
```

`relatedTestId` — id последнего теста с `topic_id = :id` (если есть).

**Ошибки:** `404` — тема не найдена.

---

### `POST /api/topics`

Upsert контента темы. Создаёт новую или обновляет существующую.

**Тело:** `CreateTopicBody`

```json
{
  "id": "2.2",
  "moduleId": 2,
  "title": "Renderless Components",
  "focus": "Абстракция логики без UI",
  "sections": [],
  "cheatCard": null,
  "keyNotes": []
}
```

**Обязательные поля:** `id`, `moduleId`, `title`, `focus`.

**Валидация секций:**

| type | обязательные поля |
|------|-------------------|
| `text` | `heading`, `content` (markdown) |
| `code` | `heading`, `language`, `code` |
| `mermaid` | `heading`, `diagram` |
| `image` | `heading`, `url` (+ опционально `alt`, `caption`) |

**Ответ:**

```json
{ "ok": true, "id": "2.2", "status": "in-progress", "created": false }
```

**Поведение:**

- Новая тема → `status: in-progress`, `created: true`
- `pending` + непустой `sections` → перевод в `in-progress`
- Уже `completed` → контент обновляется, статус остаётся `completed`

**Пример (PowerShell, dev-сервер на :3000):**

```powershell
$body = Get-Content server/examples/post-topic-2.2.json -Raw
Invoke-RestMethod -Method POST -Uri http://localhost:3000/api/topics `
  -ContentType 'application/json' -Body $body
```

---

### `POST /api/topics/:id/review`

Запись ревью. Тема → `completed`, `attempts++`.

**Тело:** `ReviewBody`

```json
{
  "critical": 2,
  "warning": 3,
  "good": 5,
  "summary": "Краткий итог ревью"
}
```

Все поля обязательны.

**Ответ:**

```json
{ "ok": true, "attempt": 1, "status": "completed" }
```

**Ошибки:** `404` — тема не найдена, `400` — невалидное тело.

> UI для отправки ревью пока нет — только API (или скрипт/миграция).

---

## API: прогресс (дашборд)

### `GET /api/progress`

Агрегат для главной, карточек и истории ревью. Данные из SQLite, **не** из `progress-data.json`.

**Ответ:** `ProgressData`

```json
{
  "meta": {
    "totalTopics": 60,
    "completedTopics": 6,
    "inProgress": "2.2",
    "lastUpdated": "2026-06-26",
    "startedAt": "2026-05-15"
  },
  "modules": [ /* статический каталог модулей */ ],
  "topics": [ /* все темы + latest review на каждую */ ]
}
```

У каждой темы в `topics[]` — одно поле `review` (последняя попытка), не полная история. Полная история — только в `GET /api/topics/:id`.

---

## Типы секций (JSON → UI)

```ts
// app/types/topic.ts
type TopicSection =
  | { type: 'text'; heading: string; content: string }
  | { type: 'code'; heading: string; language: string; code: string; caption?: string }
  | { type: 'mermaid'; heading: string; diagram: string; caption?: string }
  | { type: 'image'; heading: string; url: string; alt?: string; caption?: string }
```

| type | Компонент | Рендер |
|------|-----------|--------|
| `text` | `TopicSectionText` | markdown-it |
| `code` | `TopicSectionCode` | Shiki (vue, bash, ts, …) |
| `mermaid` | `TopicSectionMermaid` | mermaid |
| `image` | `TopicSectionImage` | `<img :src="url">` |

Роутер секций: `TopicSection.vue` — по `section.type` выбирает дочерний компонент.

---

## UI: страницы и composables

### Composables

| Composable | API | Где используется |
|------------|-----|------------------|
| `useTopics()` | `GET /api/topics`, `GET /api/topics/:id` | `/topics`, `/topics/[id]` |
| `useProgress()` | `GET /api/progress` | `/` (дашборд), `/cards`, `/review` |

### `/topics` — `app/pages/topics/index.vue`

- `useTopics()` → `topics`, `topicsByModule`, `inProgressTopic`
- Группировка по модулям, фильтр по статусу (клиентский)
- Ссылка на `/topics/:id`
- Бейдж 📄 если `hasContent`

### `/topics/[id]` — `app/pages/topics/[id].vue`

- `fetchTopic(id)` → `GET /api/topics/:id`
- Рендер по полям ответа:

| Поле API | Компонент |
|----------|-----------|
| meta (id, title, focus, status) | `TopicHero` |
| `sections[]` | `TopicSection` → Text/Code/Mermaid/Image |
| `cheatCard` | `TopicCheatCard` |
| `keyNotes[]` | `TopicKeyNotes` |
| `reviews[]` | `TopicReviewHistory` |
| `relatedTestId` | кнопка «Пройти тест» → `/tests/:id` |

Пустой `sections` → «Материал в подготовке».

### Дашборд и смежные страницы

| Страница | Composable | Что показывает |
|----------|------------|----------------|
| `/` | `useProgress` | ProgressBar, текущая тема, модули, completed list |
| `/cards` | `useProgress` | `cheatCard` пройденных тем, фильтр по tags |
| `/review` | `useProgress` | `reviewHistory` — последние ревью по completed темам |

Ссылки с дашборда ведут на `/topics/:id`.

---

## Типичные сценарии

### Добавить контент к существующей заглушке

1. Убедиться, что тема есть: `GET /api/topics/3.1`
2. POST тем же `id` с заполненными `sections`, `cheatCard`, `keyNotes`
3. Открыть `/topics/3.1` — контент подтянется автоматически

### Создать тему с нуля

POST с новым `id`. Тема создаётся сразу как `in-progress`.

### Завершить тему

```powershell
Invoke-RestMethod -Method POST -Uri http://localhost:3000/api/topics/2.2/review `
  -ContentType 'application/json' `
  -Body '{"critical":1,"warning":2,"good":4,"summary":"Ок"}'
```

После этого:
- дашборд и `/review` обновятся через `GET /api/progress`
- `/topics/2.2` покажет ревью в `TopicReviewHistory`

### Обновить контент у completed-темы

Повторный POST `/api/topics` — контент перезапишется, статус `completed` сохранится.

---

## Файлы для ориентира

| Файл | Зачем |
|------|-------|
| `server/examples/post-topic-2.2.json` | Эталон JSON для POST |
| `server/api/topics/*.ts` | HTTP-handlers |
| `server/utils/topics.ts` | upsert, review, маппинг |
| `app/types/topic.ts` | TypeScript-типы запросов/ответов |
| `app/composables/useTopics.ts` | Клиентский доступ к topics API |
| `app/components/topic/*` | UI-компоненты темы |

---

## Связанные API (не темы)

| Метод | Назначение |
|-------|------------|
| `GET /api/tests` | Список тестов |
| `GET /api/tests/:id` | Тест по id |
| `POST /api/tests/upload` | Загрузка теста (JSON) |
| `POST /api/attempts` | Сдача попытки теста |
| `GET /api/attempts/:testId` | История попыток по тесту |

Тест привязывается к теме полем `topic_id` — тогда на странице темы появится кнопка «Пройти тест».
