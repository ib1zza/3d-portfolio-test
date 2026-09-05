# 02 — Архитектура и стек

## 1. Выбор фреймворка

R3F — это React, поэтому Nuxt отпадает, несмотря на то что это основной
коммерческий стек автора. Из React-вариантов:

| Вариант | За | Против | Решение |
| --- | --- | --- | --- |
| **Next.js 16 App Router** | SSR текста и SEO, серверные компоненты, встроенные View Transitions, знакомый работодателям стек, простой деплой | Нужно аккуратно изолировать WebGL от SSR | **Выбран** |
| Vite 8 + React Router 7 | Проще, быстрее dev-сервер, полный контроль над бандлом | Нет SSR из коробки, SEO придётся решать пререндером | Запасной |
| Astro + React islands | Отличный SEO и вес | Единый persistent canvas между страницами делается неудобно | Нет |

Next выбран ещё и потому, что портфолио читают технические люди: `View Transitions`,
RSC и продуманный SSR внутри 3D-сайта — сами по себе аргумент на собеседовании.

## 2. Версии зависимостей (проверены на сентябрь 2026)

```jsonc
{
  "dependencies": {
    "next": "16.3.4",
    "react": "19.2.8",
    "react-dom": "19.2.8",

    "three": "0.185.1",
    "@react-three/fiber": "9.7.0",
    "@react-three/drei": "10.7.8",
    "@react-three/postprocessing": "3.1.1",
    "postprocessing": "6.39.4",

    "lenis": "1.3.26",
    "motion": "13.2.0",
    "zustand": "5.0.15",
    "tunnel-rat": "^0.1.2",
    "maath": "0.10.8",

    "@react-three/rapier": "2.2.0",   // только секция скиллов, ленивый чанк
    "three-mesh-bvh": "0.9.14",       // рейкаст по сложным мешам
    "troika-three-text": "0.52.5"     // если понадобится SDF-текст помимо drei/Text
  },
  "devDependencies": {
    "typescript": "^5.9",
    "leva": "0.10.1",
    "r3f-perf": "7.2.3",
    "@gltf-transform/cli": "4.5.0",
    "vitest": "^3",
    "@playwright/test": "^1.5x",
    "eslint": "^9",
    "prettier": "^3"
  }
}
```

Замечания по версиям:

- `@react-three/fiber@9` требует React 19 — совпадает.
- View Transitions не требуют флага в конфиге: в Next 16.3.4
  `experimental.viewTransition` уже удалён, `ViewTransition` приходит из
  бандлёного React canary 19.3.0. Подробности — в
  [03, раздел 3.1](./03-motion-scroll-transitions.md).
- `drei@10` совместим с fiber 9; `View` и `MeshPortalMaterial` — оттуда.
- GSAP сознательно **не берём**: вся хореография строится на одном источнике
  времени (скролл) и на `maath/easing.damp` внутри `useFrame`. `motion` остаётся
  только для DOM-микроанимаций, он уже в стеке автора.
- Всё, что связано с three, фиксируем точными версиями без `^`: минорные релизы
  three регулярно ломают шейдерные хуки.

## 3. Ключевое архитектурное решение: один canvas на всё приложение

```
app/layout.tsx
 └─ <Providers>
     ├─ <SmoothScroll>              // Lenis, повешен на html
     ├─ <DomLayer>{children}</DomLayer>   // весь HTML, SSR, SEO
     └─ <WebGLLayer>                // fixed, inset-0, pointer-events: none
         └─ <Canvas eventSource={documentRoot} eventPrefix="client">
             ├─ <SceneTunnel.Out />        // сцены, пробрасываемые из страниц
             ├─ <View.Port />              // локальные «окна» в 3D
             ├─ <GlobalParticles />        // сквозной поток филамента
             ├─ <Environment />            // HDRI, интерполируемый темой
             ├─ <PostFX />
             └─ <Preload all />
```

Что это даёт:

- WebGL-контекст создаётся один раз за сессию. Переход `/` → `/work/simplex` не
  роняет и не пересоздаёт сцену, частицы продолжают лететь сквозь смену страницы.
- Тяжёлые ресурсы (HDRI, геометрии, текстуры позиций частиц) живут в кэше
  `useLoader`/`useGLTF` весь жизненный цикл приложения.
- Постпроцессинг общий: один проход для всего экрана, а не по проходу на сцену.

### 3.1 Как страницы добавляют 3D

Страница — серверный компонент с текстом. 3D-часть — клиентский компонент,
который «телепортирует» свои объекты в общий canvas через `tunnel-rat`:

```tsx
// src/webgl/tunnel.ts
import tunnel from 'tunnel-rat'
export const SceneTunnel = tunnel()

// src/app/work/[id]/scene.tsx  ('use client')
export function ProjectScene({ project }: { project: Project }) {
  return (
    <SceneTunnel.In>
      <ProjectWorld project={project} />
    </SceneTunnel.In>
  )
}
```

Для секций, которые должны быть привязаны к конкретному DOM-блоку (карточка,
инлайновая иллюстрация, витрина проекта), используем `drei/View` — он режет
общий canvas ножницами по границам трекающего элемента:

```tsx
<View className="h-[60vh] w-full">
  <PerspectiveCamera makeDefault fov={35} position={[0, 0, 5]} />
  <SkillsJar />
</View>
```

Правило: **`View` — для того, что должно жить строго в рамке блока;
`SceneTunnel` — для того, что живёт во весь экран и переживает смену роута.**

### 3.2 SSR и WebGL

- `<Canvas>` монтируется только на клиенте: `dynamic(() => import('./WebGLLayer'), { ssr: false })`.
- Весь текст, ссылки, метрики и кейсы рендерятся сервером и присутствуют в HTML
  до загрузки canvas — это одновременно SEO и fallback.
- 3D-чанк грузится после `requestIdleCallback` и после того, как отработал LCP:
  сначала пользователь видит статичный «постер» секции (CSS-градиент + сжатый
  превью-кадр), потом canvas плавно проявляется поверх.

## 4. Структура репозитория

```
.
├── app/
│   ├── layout.tsx                 # providers, HUD, WebGL layer
│   ├── page.tsx                   # главная (серверная сборка секций)
│   ├── work/
│   │   ├── page.tsx               # витрина
│   │   └── [id]/page.tsx          # кейс проекта, generateStaticParams
│   ├── playground/page.tsx
│   ├── resume/page.tsx            # без WebGL
│   ├── opengraph-image.tsx        # генерация OG через ImageResponse
│   └── globals.css
│
├── src/
│   ├── content/                   # ЕДИНСТВЕННЫЙ источник данных
│   │   ├── portfolio.ts           # профиль, опыт, образование, скиллы
│   │   ├── projects.ts            # проекты + сценические настройки
│   │   ├── types.ts
│   │   └── i18n/{ru,en}.ts
│   │
│   ├── webgl/
│   │   ├── canvas/                # WebGLLayer, PostFX, Environment, Preload
│   │   ├── rig/                   # CameraRig, маршруты камеры, damping
│   │   ├── scenes/                # по сцене на секцию (см. 04-scenes.md)
│   │   │   ├── hero/
│   │   │   ├── manifest/
│   │   │   ├── focus/
│   │   │   ├── timeline/
│   │   │   ├── skills/
│   │   │   ├── showcase/
│   │   │   └── project/
│   │   ├── systems/
│   │   │   ├── particles/         # GPGPU: симуляция, морфинг, сэмплинг
│   │   │   ├── portal/
│   │   │   ├── transition/        # FBO-переход между сценами
│   │   │   └── pointer/           # 3D-курсор, магнитные зоны
│   │   ├── materials/             # кастомные материалы через shaderMaterial
│   │   ├── shaders/               # .glsl (vite/webpack loader), общие includes
│   │   └── lib/                   # utils, hooks (useScrollRange, useQuality)
│   │
│   ├── ui/                        # DOM UI-кит (кнопки, чипы, HUD, типографика)
│   │   └── */*.stories.tsx        # Storybook: сильная сторона автора
│   ├── motion/                    # scroll store, Lenis, transition orchestrator
│   └── lib/                       # общие утилиты, device detection, analytics
│
├── public/
│   ├── models/                    # оптимизированные .glb (draco/meshopt)
│   ├── textures/                  # .ktx2
│   ├── points/                    # предсэмплированные облака точек (.bin)
│   ├── hdri/                      # .hdr → .ktx2
│   └── posters/                   # статичные постеры секций для fallback
│
├── scripts/                       # asset pipeline (см. 08-asset-pipeline.md)
├── plans/                         # этот план
└── tests/
    ├── e2e/                       # Playwright, включая визуальные регрессии
    └── unit/
```

Принцип: `src/content` не знает про three, `src/webgl` не знает про Next,
`src/ui` не знает ни про то, ни про другое. Это упрощает и тесты, и Storybook.

## 5. Состояние приложения

Три независимых zustand-стора. Никакого контекста React для горячих данных —
значения скролла меняются каждый кадр, через контекст это убьёт производительность.

```ts
// src/motion/scroll-store.ts
type ScrollState = {
  progress: number        // 0..1 по всему документу
  velocity: number        // нормализованная, -1..1
  direction: 1 | -1
  section: SectionId
  sectionProgress: number // 0..1 внутри активной секции
}
```

```ts
// src/webgl/lib/quality-store.ts
type QualityState = {
  tier: 'ultra' | 'high' | 'medium' | 'flat'
  dpr: number
  particleCount: number
  postfx: { bloom: boolean; dof: boolean; chromatic: boolean }
  reducedMotion: boolean
  setTier: (t: Tier) => void
}
```

```ts
// src/motion/transition-store.ts
type TransitionState = {
  phase: 'idle' | 'leaving' | 'entering'
  from: RouteKey | null
  to: RouteKey | null
  progress: number        // прогресс раскрытия портала, 0..1
}
```

Важно: **компоненты внутри `useFrame` читают стор императивно**, а не через
подписку-ререндер:

```tsx
useFrame((state, dt) => {
  const { velocity } = useScrollStore.getState()
  damp(material.uniforms.uStretch, 'value', velocity, 0.15, dt)
})
```

Подписка через селектор допустима только там, где смена значения должна вызвать
реальный ререндер React (например, смена тира качества).

## 6. Рендер-луп и производительность цикла

- `<Canvas frameloop="demand">` **не подходит** — у нас постоянная анимация.
  Используем `frameloop="always"`, но добавляем ручную паузу: при
  `document.hidden` и при полном уходе canvas из вьюпорта вызываем
  `invalidate`-режим или просто пропускаем тяжёлые системы.
- Lenis встраиваем в общий цикл R3F, а не поднимаем второй `requestAnimationFrame`:

```ts
import { addEffect } from '@react-three/fiber'
const lenis = new Lenis({ syncTouch: true, autoRaf: false })
addEffect((t) => lenis.raf(t))
```

- Порядок систем в кадре задаём через `useFrame(cb, priority)`:
  `-1` — чтение скролла и ввода, `0` — симуляции (GPGPU, физика), `1` — камера
  и материалы, `2` — рендер постпроцессинга.
- `PerformanceMonitor` из drei меряет реальный FPS и понижает тир качества.
  Понижение — с гистерезисом и задержкой 2 секунды, чтобы сайт не мигал
  качеством на каждом чихе.

## 7. Загрузка и код-сплиттинг

| Чанк | Что внутри | Когда грузится |
| --- | --- | --- |
| `main` | DOM, HUD, контент, Lenis | сразу |
| `webgl-core` | three, fiber, drei-минимум, hero-сцена | после первого кадра, idle |
| `webgl-particles` | GPGPU-система, точки проектов | при подходе к секции витрины |
| `webgl-physics` | rapier | при входе секции скиллов во вьюпорт |
| `webgl-postfx` | postprocessing | только на тирах `high`/`ultra` |
| `playground` | все демки лаборатории | по роуту |

Модели и текстуры префетчим по «предсказанию»: когда пользователь доскроллил до
70% предыдущей секции, стартует `useGLTF.preload` следующей.

## 8. Тесты и качество кода

- **Vitest** — на утилиты скролла, маппинг контента, расчёт тиров.
- **Playwright** — сценарии: сайт открывается без WebGL, контент виден до
  загрузки canvas, переход на кейс проекта не роняет консоль, `/resume`
  рендерится за один запрос. Плюс визуальные снапшоты DOM-слоя.
- **Storybook** — UI-кит. Это прямо перекликается с опытом автора («Built
  reusable UI kits», Storybook и Jest в резюме), и его стоит опубликовать
  отдельным поддоменом и дать ссылку из `/playground`.
- `eslint` + `prettier` + `typescript strict`, `noUncheckedIndexedAccess: true`.
- В CI: сборка, типы, unit, Playwright smoke, Lighthouse CI с бюджетами из
  [07-performance-mobile-a11y.md](./07-performance-mobile-a11y.md).

## 9. Деплой

Vercel (нативно для Next 16), домен вида `pshenichny.dev`. Ассеты — с CDN, `.glb`
и `.ktx2` с `Cache-Control: public, max-age=31536000, immutable` и хэшем в имени.
Отдельно включить `Accept-Encoding: br` для `.glb` — они хорошо жмутся.

Далее: [03-motion-scroll-transitions.md](./03-motion-scroll-transitions.md).
