> Часть плана MATTER. Предыдущий файл: [05-shaders-and-effects.md](./05-shaders-and-effects.md)

# 06 — Контент-модель и маппинг данных

Старый файл `portfolio.ts` — хорошая основа: там уже есть профиль, опыт,
образование, скиллы и пять проектов с моделями. Переносим его, но меняем три вещи:

1. **Убираем всё, что относилось к 1-bit направлению** (`label: "Interactive 1-bit ..."`,
   упоминания монохрома в `highlights` Silkworm).
2. **Отделяем факты от режиссуры**: данные проекта не должны знать про позиции
   камеры и цвета bloom. Появляется отдельный слой `stage`.
3. **Добавляем локализацию** ru/en: сайт двуязычный.

## 1. Типы

```ts
// src/content/types.ts

export type Locale = 'ru' | 'en'
export type Localized<T> = Record<Locale, T>

export type ProjectKind = 'commercial' | 'current' | 'pet' | 'legacy' | 'internal'
export type Availability = 'public' | 'private' | 'offline' | 'unreleased' | 'nda'

export interface Link { label: string; href: string; kind: 'live' | 'repo' | 'other' }

export interface Metric {
  label: Localized<string>
  value: string
  note?: Localized<string>
  /** true — цифра подтверждена измерением, false — оценочная. Влияет на подачу. */
  verified: boolean
}

export interface CaseStudy {
  problem: Localized<string>
  solution: Localized<string>
  result?: Localized<string>
}

/** Факты о проекте. Никакой 3D-специфики. */
export interface Project {
  id: ProjectId
  title: string
  year: string
  period?: string
  kind: ProjectKind
  availability: Availability
  featured: boolean
  priority: number
  client?: string
  agency?: string
  role: Localized<string>
  status: Localized<string>
  summary: Localized<string>
  stack: string[]
  responsibilities: Localized<string[]>
  features: Localized<string[]>
  highlights: Localized<string[]>
  metrics?: Metric[]
  caseStudy?: CaseStudy
  accessNote?: Localized<string>
  links: Link[]
  images?: Array<{ src: string; alt: Localized<string>; caption?: Localized<string> }>
}

/** Режиссура: как проект выглядит и ведёт себя в 3D. */
export interface ProjectStage {
  id: ProjectId
  accent: string              // hex, акцент мира проекта
  accentBg: string            // фон внутри портала
  envPreset: EnvPreset
  /** Главная модель, либо процедурная сцена */
  model:
    | { type: 'gltf'; src: string; scale: number; position: Vec3; rotation: Vec3 }
    | { type: 'procedural'; scene: 'metaballs' | 'kanban' }
  extras?: Array<{ src: string; scale?: number; position?: Vec3; rotation?: Vec3 }>
  logo?: { src: string; scale?: number; position?: Vec3; rotationSpeed?: number }
  /** Уникальный приём мира проекта, см. 04-scenes.md */
  signature: 'slice' | 'fabric' | 'print' | 'metaballs' | 'dragdrop'
  /** Облако точек для GPGPU-морфинга */
  pointCloud: string          // '/points/tooth.bin'
  /** Витрина живого сайта */
  showcase?:
    | { type: 'iframe'; url: string; frame: 'laptop' | 'phone' }
    | { type: 'gallery'; images: string[] }
    | { type: 'redacted' }    // NDA
}
```

Разделение `Project` / `ProjectStage` — принципиальное. Оно позволяет
редактировать тексты, не трогая 3D, и наоборот; плюс `Project` можно
отрендерить сервером в HTML без импорта чего-либо из three.

## 2. Маппинг: что из старых данных куда идёт

| Поле старых данных | Куда попадает |
| --- | --- |
| `profile.name`, `role`, `location` | Сцена 01 Hero, `schema.org/Person`, `<title>` |
| `profile.summary` | Сцена 02 Манифест |
| `profile.focus` / `focusAreas` | Сцена 03 Фокус (5 объектов на орбите) |
| `achievements` | Сцена 04, разворот «станции» + `/resume` |
| `experience[]` | Сцена 04 Коридор опыта |
| `education[]` | `/resume` + сворачиваемый блок в конце коридора |
| `skills[]` | Сцена 05 Сосуд (20 таблеток) + фильтр витрины |
| `projectSections[]` | Фильтры на `/work` |
| `projects[]` | Сцена 06 Витрина + страницы `/work/[id]` |
| `projects[].model` | Переезжает в `ProjectStage` |
| `contacts[]` | Сцена 09 Подпись + HUD |

## 3. Таблица проектов

| id | Мир | Акцент | Модель | Signature-приём | Витрина |
| --- | --- | --- | --- | --- | --- |
| `simplex` | Стерильная студия, холодный свет | `#34E0C0` | `cartoon-teeth-set.glb` + `simplex.glb` | Срез с светящейся линией, из среза выезжают компоненты UI-кита | iframe `simplexclinic.ru` в 3D-ноутбуке |
| `silkworm` | Тёплый подиум, мягкие тени | `#FF3DA6` | `t-shirt.glb` + `cap.glb` + `silkworm.glb` | Колышущаяся ткань + переключение материалов (шёлк/хлопок/деним) | Карусель скриншотов с волновым переходом |
| `3d-outlet` | Индастриал, направленный свет | `#FFB347` | `printer-scanner.glb` | Печать слой за слоем + NDA-глитч на UI-планах | `redacted` |
| `realtime-chat` | Тёмная глубина, точечные источники | `#5A4BFF` | процедурные метаболы | Всплывающие пузыри с настоящими сообщениями о проекте | Галерея + живая ссылка |
| `kanban` | Светлая сетка, изометричный свет | `#5A4BFF` / `#FFB347` | процедурные карточки | Перетаскивание карточек в 3D с физикой, «Done» рассыпается в частицы | Галерея + живая ссылка |

## 4. Что нужно исправить в текстах

Проходя по старым данным, видно несколько мест, которые ослабляют портфолио.
Их стоит переписать до старта разработки — это дешевле, чем править по ходу.

**Метрики без цифр.** У Simplex стоит `{ label: "Lighthouse", value: "Optimized" }`
с пометкой «точные баллы можно добавить позже». В таком виде метрика хуже, чем её
отсутствие: она выглядит как попытка что-то скрыть. Нужно либо измерить и
поставить реальные значения (`Performance 96 / LCP 1.4s / CLS 0.02`, дата
измерения), либо заменить на измеримый факт другого рода: количество страниц,
компонентов в UI-ките, срок разработки, число breakpoint'ов.

Поле `verified: boolean` в типе `Metric` введено ровно для этого: неподтверждённые
цифры визуально подаются иначе (моноширинный серый текст с пометкой «оценка»), и
это честнее, чем выдавать оценку за замер.

**Silkworm без стека.** Сейчас `stack: ["Ecommerce", "Catalog", "Cart", "Responsive UI"]` —
это не стек, а список фич. Нужны реальные технологии: на чём написано, что
использовалось. Если проект не на Nuxt — тем более важно указать, это расширяет
профиль.

**3D Outlet без единого артефакта.** Проект помечен как текущий и приоритетный,
но показать нечего. Варианты по убыванию предпочтительности:
1. Согласовать с работодателем публикацию 2–3 санитизированных скриншотов.
2. Сделать «обезличенный» пересказ: архитектурная схема каталога, описание
   решённых задач производительности с цифрами до/после, без брендинга.
3. Оставить как есть, но текст переписать так, чтобы читатель понял конкретику
   работы («каталог на N тысяч SKU», «фасетные фильтры», «SSR-кеширование»).

Сейчас формулировки уровня «Work on product catalog UI» ничего не сообщают.

**Устаревшая привязка к 1-bit.** В `highlights` Silkworm есть фраза «fits the new
1-bit portfolio direction» — её удалить, направление сменилось. Также убрать
`label: "Interactive 1-bit ..."` из всех `model`.

**Отсутствует раздел про образование в основной ленте.** ИСПО СПбПУ и Академия TOP
сейчас есть только в данных. Стоит показать их компактно в конце коридора опыта —
это важно для части работодателей.

## 5. Локализация

```
src/content/i18n/
  ru.ts     # интерфейсные строки
  en.ts
```

Контент проектов локализуется прямо в структуре (`Localized<T>`), интерфейсные
строки — в отдельных словарях. Библиотека не нужна: своя тонкая функция `t()` и
серверный выбор словаря по сегменту роута (`/en/...`). Это дешевле i18next и
полностью совместимо с RSC.

Переключатель языка живёт в HUD рядом с переключателем темы. Смена языка
сохраняет позицию скролла и не перезапускает 3D-сцену.

Дефолт: определяем по `Accept-Language`, но URL всегда явный (`/` = ru, `/en` = en),
чтобы ссылки были предсказуемы и индексировались. `hreflang` в `<head>`.

## 6. Тексты, которых пока нет и которые нужно написать

1. **Манифест** (сцена 02) — 3–4 строки, кто ты и зачем тебя нанимать. Сейчас
   `profile.summary` написан для резюме, для крупного экрана он длинноват.
2. **Подписи к пяти направлениям** (сцена 03) — по одному предложению на каждое.
3. **Описание NDA-ситуации** (3D Outlet) — человеческий текст, объясняющий, почему
   нет ссылки, без канцелярита.
4. **Подписи к демо в `/playground`** — по 2–3 предложения на технику.
5. **Микротексты HUD**: названия секций, подсказки взаимодействия
   («потяни», «наклони телефон», «кликни, чтобы войти»).
6. **Мета-описания** для каждой страницы (`/work/[id]` — уникальное на проект).

## 7. Единый источник для резюме

`/resume` и PDF генерируются из тех же данных, что и сайт. PDF собирается на
сервере через `ImageResponse`/print-стили, а не поддерживается руками — иначе он
неминуемо разъедется с сайтом.

Далее: [07-performance-mobile-a11y.md](./07-performance-mobile-a11y.md).
