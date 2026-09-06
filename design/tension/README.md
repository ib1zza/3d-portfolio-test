# «Натяжение» — первая итерация реализации

Дата: 6 сентября 2026. Основа: `new plans/`. Это начало пакета A → B, **не завершение этапа B и не готовность всего портфолио к публикации**.

## Что реализовано

- Новая главная: имя и роль → Silkworm → индекс остальных работ → About → Contact. Опыт и образование остаются в `/resume`; все пять кейсов сохраняют URL.
- Процедурная hero-скульптура: две объёмные дуги, две части мембраны, открывающийся при скролле разрез, ограниченный pointer tilt с затуханием. Исходник и ограничения описаны в `assets-src/scenes/hero/README.md`.
- Три варианта формы и их clay/silhouette/material кадры. Для дальнейшей работы выбран asymmetric: вертикальный слишком узок, широкий сильнее обрезается краем desktop; асимметричный оставляет отдельную спокойную область для имени.
- Общая студийная палитра, Inter для кириллицы/латиницы, JetBrains Mono для существующих технических подписей. Переключатель инвертированной темы убран из навигации.
- Открытие реального кейса Silkworm из DOM-медиа; навигация и CTA работают независимо от Canvas.
- RU/EN через серверную cookie и Server Action. Язык сохраняется между маршрутами, меняются `lang` и основные метаданные. Отдельных SEO-адресов локалей пока нет; фиктивная ссылка `/en` убрана из metadata. Cookie делает содержательные страницы динамически рендеримыми на сервере — это осознанное временное решение до этапа D.
- Полная / лёгкая / статичная графика. Статичный режим и отсутствие WebGL используют настоящие scene posters. Сохранённое некорректное значение качества больше не ломает загрузку.
- На главной — native scroll, demand rendering, освобождение hero при уходе из кадра, отсутствие постоянного postprocessing. На medium сохраняется Environment. Reduced motion отключает pointer/scroll-деформацию, реагирует на изменение системной настройки без reload.

## Контрольные кадры

- [Hero desktop](../../output/playwright/hero-desktop.png)
- [Hero mobile](../../output/playwright/hero-mobile.png)
- [Silkworm desktop](../../output/playwright/silkworm-desktop.png)
- [Silkworm mobile](../../output/playwright/silkworm-mobile.png)
- [About](../../output/playwright/about-desktop.png)
- [Contact](../../output/playwright/contact-desktop.png)
- [320 px](../../output/playwright/hero-320.png)
- [Статичный режим](../../output/playwright/fallback-mobile.png)
- [Без JavaScript](../../output/playwright/no-javascript-mobile.png)
- [Reduced motion](../../output/playwright/reduced-mobile.png)
- [Запись hero → Silkworm → case → Back](../../output/playwright/tension-animatic-final.webm)

Baseline до изменений снят из отдельного checkout исходного HEAD: `output/playwright/baseline/`. Четыре маршрута (`/`, `/work`, `/work/silkworm`, `/resume`), 1440×900 и 390×844. Исходные lint, typecheck и build прошли. При baseline в Chromium замечено предупреждение Three.Clock о deprecated API.

## Studies

| Форма | Силуэт | Clay | Материал |
| --- | --- | --- | --- |
| Вертикальная | [Кадр](../../output/playwright/study-vertical-silhouette.png) | [Кадр](../../output/playwright/study-vertical-clay.png) | [Кадр](../../output/playwright/study-vertical-material.png) |
| Широкая | [Кадр](../../output/playwright/study-wide-silhouette.png) | [Кадр](../../output/playwright/study-wide-clay.png) | [Кадр](../../output/playwright/study-wide-material.png) |
| Асимметричная | [Кадр](../../output/playwright/study-asymmetric-silhouette.png) | [Кадр](../../output/playwright/study-asymmetric-clay.png) | [Кадр](../../output/playwright/study-asymmetric-material.png) |

Воспроизведение: `/?study=vertical&look=silhouette`, `/?study=wide&look=clay`; без query — выбранная форма и финальные для этой итерации материалы. Эти параметры — инструмент lookdev, не пользовательский интерфейс.

## Проверки и реальные измерения

Среда: локальный macOS, автоматизированный настольный Chromium. 390/320 px — эмуляция размеров окна, **не физический телефон**.

- `npm run lint`, `npm run typecheck`, `npm run build`: пройдены после реализации.
- `node --experimental-strip-types scripts/check-tension-geometry.mjs`: 12 комбинаций формы, LOD и стороны; одинаковая топология morph, неподвижная внешняя кромка, конечные нормали/координаты, бюджет поверхности.
- Hero high: **23 688 triangles, 4 draw calls**. Medium: **12 680 triangles, 4 draw calls**. Renderer counters прочитаны после прогрева; environment preprocessing не входит в эти 4 вызова.
- После pointer tilt и затухания счётчик кадров остановился на 57 и не вырос за последующую секунду. Это проверка demand rendering, не оценка FPS.
- Poster desktop: 17 698 bytes; mobile: 6 262 bytes, WebP. Собственная геометрия без сетевого GLB.
- Главная → Silkworm → Back: восстановлена позиция работы (`/#work`, scroll 774 при 390×844), один Canvas, ошибок JS нет.
- RU → EN, переход Contact и сохранение языка при навигации проверены.
- Статичный режим: 0 Canvas, poster загружен и видим. Reduced motion: 1 Canvas с неподвижной формой. Изменение motion preference проверено без reload. На старых внутренних маршрутах reduced motion использует DOM без Canvas до миграции их отдельных сцен.
- 320 и 390 px: scrollWidth равен ширине viewport.
- Context loss через WEBGL_lose_context: poster становится видимым; после restore живая сцена возвращается.
- JavaScript disabled: 0 Canvas, серверный h1 и постер доступны.

LCP/INP/CLS, 30-секундный GPU-профиль, memory soak, тепловой тест, Safari/Firefox и реальные телефоны **не измерены**. Бюджеты из плана не объявляются достигнутыми. Предупреждение Three.Clock в зависимостях остаётся.

## Медиа и фактические ограничения

| Проект | Есть | Не хватает |
| --- | --- | --- |
| Silkworm | preview 1251×1226, текст вклада, стек | Превью почти чёрное: не показывает каталог/товар. Нужны полные desktop/mobile screenshots и запись корзины. Публичный адрес из content проверен: ERR_TIMED_OUT в браузере и SSL connection timeout отдельным запросом 06.09.2026; свежий кадр получить не удалось. |
| Simplex | Вклад, стек, публичная ссылка, старые GLB | Разрешённые реальные медиа, авторская керамическая сцена |
| 3D Outlet | Текст задач, стек, явная отметка NDA | Разрешённые медиа отсутствуют. Оставлен в текстовом индексе без искусственного мира |

## Направление и референсы

Визуальный тезис: прохладная металлическая кромка удерживает мягкую светлую мембрану в тёплом студийном пространстве. Контент: автор → доказательство работы → короткий контекст → контакт. Движение: наклон от указателя, раскрытие при скролле, читаемая остановка у DOM-кейса.

Проверены страницы-источники из плана: [Lusion](https://www.awwwards.com/sites/lusion), [Dennis Snellenberg](https://www.awwwards.com/sites/dennis-snellenberg). Первая выделяет WebGL scroll navigation, вторая — навигацию и контакт. Наше применение этих ориентиров: одна крупная форма и обычные доступные DOM-ссылки. Это интерпретация, не копирование ассетов и не полноценный аудит live-сайтов. Предметный moodboard металла/ткани/керамики с визуальными источниками ещё предстоит собрать.

## Следующий производственный шаг

1. Улучшить макро-кадр выбранной формы: сглаживание ленты, складки/перекрытия, опорная тень, соответствие света и материала без postFX.
2. Получить содержательные медиа Silkworm и собрать именно текстильную предметную сцену; текущий DOM-блок не заменяет её. Добавить полноценный hero → ткань → DOM handoff.
3. Проверить размерные и performance-бюджеты на конкретном телефоне. До этого этап B не закрывать.
4. Затем Simplex, отдельные styleframes Simplex/3D Outlet, остальные сцены и переработка `/work` и case pages по C/D. Их старые 3D-миры пока сохранены.

Отдельный комплект A из шести **запланированных** styleframes (включая Simplex и 3D Outlet) ещё не готов: текущие шесть контрольных кадров показывают реализованный первый проход, а не заменяют недостающие сцены. Публикация не выполнялась.
