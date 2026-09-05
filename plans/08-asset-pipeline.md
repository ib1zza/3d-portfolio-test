> Часть плана MATTER. Предыдущий файл: [07-performance-mobile-a11y.md](./07-performance-mobile-a11y.md)

# 08 — Пайплайн ассетов

Ассеты — главный источник веса и главная причина, по которой 3D-сайты медленные.
Всё, что можно посчитать заранее, считается заранее и коммитится как артефакт.

Правило: **в `public/` не попадает ни один файл, который не прошёл через скрипт
из `scripts/`.** Исходники лежат в `assets-src/` и не деплоятся.

```
assets-src/          # исходники (не в public, не в бандле)
  models/*.glb       # как отдали из Blender
  hdri/*.hdr
  images/*.png
public/
  models/*.glb       # оптимизированные
  textures/*.ktx2
  hdri/*.ktx2
  points/*.bin       # облака точек
  fonts/*.woff2
  posters/*.webp     # статичные кадры для flat-режима
```

## 1. Оптимизация GLB

`@gltf-transform/cli` 4.5. Один прогон на модель:

```bash
gltf-transform optimize assets-src/models/cartoon-teeth-set.glb \
  public/models/cartoon-teeth-set.glb \
  --compress meshopt \
  --texture-compress webp \
  --texture-size 1024 \
  --simplify true --simplify-error 0.001 \
  --prune --dedup --flatten --join --weld
```

Почему `meshopt`, а не Draco: декодер меньше (~30 KB против ~200 KB для Draco с
воркерами), декодирование быстрее, и он лучше работает с инстансированием.
Draco выигрывает по степени сжатия на очень крупных сетках, но у нас таких нет.

В R3F подключается один раз глобально:

```ts
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js'
useGLTF.setDecoderPath?.()          // если используется draco
// либо в loader: loader.setMeshoptDecoder(MeshoptDecoder)
```

### Целевые размеры

| Модель | Исходник (ожидаемо) | Цель после оптимизации |
| --- | --- | --- |
| `cartoon-teeth-set.glb` | 1–3 MB | < 250 KB |
| `t-shirt.glb` | 0.5–2 MB | < 180 KB |
| `cap.glb` | 0.3–1 MB | < 100 KB |
| `printer-scanner.glb` | 2–6 MB | < 400 KB |
| `simplex.glb`, `silkworm.glb` (логотипы) | — | < 60 KB каждый |

Если после оптимизации модель не влезает в бюджет — упрощаем в Blender вручную,
а не мучаем скрипт. Для логотипов, скорее всего, вообще лучше экструдировать SVG
в рантайме (`SVGLoader` + `ExtrudeGeometry`): весит килобайты и масштабируется без
потерь.

### Проверка

```bash
gltf-transform inspect public/models/printer-scanner.glb
```

Смотрим: число вершин, число материалов (в идеале 1–2), размеры текстур,
наличие лишних UV-каналов и анимаций.

## 2. Текстуры: KTX2

Все текстуры, которые остаются после `optimize`, переводим в KTX2 (Basis UASTC
для нормалмапов и важных карт, ETC1S для остального):

```bash
gltf-transform uastc  in.glb out.glb --level 4 --rdo 4 --zstd 18
gltf-transform etc1s  in.glb out.glb --quality 200
```

Выигрыш не столько в весе файла, сколько в **видеопамяти**: KTX2 остаётся сжатой
на GPU, тогда как WebP/PNG распаковываются в RGBA и занимают в разы больше. На
мобилке это разница между «работает» и «вкладка перезагрузилась».

В коде — `KTX2Loader` с `transcoderPath`, подключается один раз.

## 3. HDRI

Студийные HDRI для двух тем. Не тянуть 4K `.hdr` (это 10+ MB):

```bash
# понижаем до 1K и конвертируем
gltf-transform ...   # или отдельный скрипт на sharp/ktx-software
```

Цель: < 250 KB на HDRI. Для фонового окружения 1K более чем достаточно, потому
что HDRI у нас не виден напрямую — он только освещает сцену (`background: false`).

Альтернатива, которую стоит рассмотреть: вместо HDRI-файла — `drei/Lightformer`
внутри `<Environment>`. Процедурное студийное окружение из нескольких плоскостей
весит ноль байт, полностью контролируемо и даёт очень «дорогой» результат для
глянцевых материалов. Для этого проекта, скорее всего, это правильный выбор для
светлой темы, а тёмная получает настоящий HDRI.

## 4. Облака точек для GPGPU

Самый важный скрипт проекта. Он превращает GLB в файл позиций, который читается
как `DataTexture`.

```ts
// scripts/sample-points.ts
import { NodeIO } from '@gltf-transform/core'
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler.js'

const COUNT = 262144          // 512 * 512

function samplePointCloud(mesh: THREE.Mesh, count: number): Float32Array {
  const sampler = new MeshSurfaceSampler(mesh).build()
  const pts: THREE.Vector3[] = []
  const p = new THREE.Vector3()
  for (let i = 0; i < count; i++) { sampler.sample(p); pts.push(p.clone()) }

  // 1. Нормализация: центр масс в 0, максимальный габарит в 1
  const box = new THREE.Box3().setFromPoints(pts)
  const center = box.getCenter(new THREE.Vector3())
  const scale = 1 / Math.max(...box.getSize(new THREE.Vector3()).toArray())
  pts.forEach((v) => v.sub(center).multiplyScalar(scale))

  // 2. Сортировка по общему ключу — КРИТИЧНО для качества морфинга.
  //    Все облака сортируются одинаково, тогда точка i в облаке A и точка i
  //    в облаке B находятся в похожем месте, и переход читается как перетекание.
  pts.sort((a, b) => key(a) - key(b))

  const out = new Float32Array(count * 4)
  pts.forEach((v, i) => { out.set([v.x, v.y, v.z, 1], i * 4) })
  return out
}

// ключ сортировки: сферические координаты от центра
function key(v: THREE.Vector3) {
  const theta = Math.atan2(v.z, v.x)              // -π..π
  const phi = Math.acos(THREE.MathUtils.clamp(v.y / (v.length() || 1), -1, 1))
  return Math.floor(phi * 64) * 1024 + Math.floor((theta + Math.PI) * 64)
}
```

Выход — `.bin` c `Float32Array`, ~4 MB на облако при 262k точек. Это много,
поэтому:

- Файлы отдаются с `Content-Encoding: br` — Float32 с упорядоченными данными
  жмётся примерно втрое.
- Для `medium` генерируем отдельные облака на 65k точек (~1 MB).
- Ещё дешевле: хранить как `Uint16` в нормализованном диапазоне `[-1, 1]` —
  вдвое меньше, точности хватает с запасом, распаковка в `DataTexture` тривиальна.
  **Рекомендуется именно этот вариант.**
- Облака грузятся лениво: hero-сфера генерируется процедурно в рантайме (не файл),
  облака проектов подтягиваются при подходе к витрине.

### Что сэмплировать для процедурных сцен

`realtime-chat` и `kanban` не имеют GLB. Для них облака генерируются
процедурно тем же скриптом из построенной в коде геометрии (метаболы →
`MarchingCubes.generateGeometry()`; канбан → набор боксов). Результат так же
сортируется и сохраняется, чтобы морфинг был согласован.

### Подпись (сцена 09)

SVG-путь подписи → `SVGLoader` → `Path.getSpacedPoints()` → те же 262k точек,
разложенные вдоль кривой с небольшим случайным разбросом по толщине штриха.

## 5. Шрифты

- Три вариативных семейства, только `woff2`, только нужные подмножества
  (`latin`, `cyrillic`), `font-display: swap`, `preload` для дисплейного.
- Подмножество делается через `glyphhanger` или `pyftsubset` — полный вариативный
  Unbounded с кириллицей весит заметно, а нужен нам не весь.
- Для 3D-текста (`Text3D`) нужен отдельный формат — `typeface.json`. Генерируется
  из TTF через facetype.js. **Важно:** кириллица требует явного указания диапазона
  символов при генерации, иначе получите пустые глифы. Если 3D-слов в манифесте
  немного, дешевле экструдировать заранее подготовленные SVG-контуры каждого слова
  через `SVGLoader` + `ExtrudeGeometry` — контроль полный, вес минимальный.
- MSDF-атлас для таблеток скиллов и чат-пузырей: генерируется через
  `msdf-bmfont-xml` один раз, коммитится (PNG + JSON).

## 6. Постеры для flat-режима

Для каждой секции — статичный кадр её 3D-сцены. Генерируются автоматически:

```
scripts/render-posters.ts
  → Playwright открывает /?poster=hero&tier=ultra
  → ждёт стабилизации сцены
  → скриншот canvas → sharp → WebP + AVIF, 1600px и 800px
```

Это же используется для OG-картинок и для `<img>`-плейсхолдера, который виден до
загрузки WebGL. Скрипт запускается в CI после сборки — постеры всегда актуальны
и никогда не разъезжаются со сценами вручную.

## 7. Скрипты в package.json

```jsonc
{
  "scripts": {
    "assets:models":  "tsx scripts/optimize-models.ts",
    "assets:points":  "tsx scripts/sample-points.ts",
    "assets:hdri":    "tsx scripts/convert-hdri.ts",
    "assets:msdf":    "tsx scripts/build-msdf-atlas.ts",
    "assets:posters": "tsx scripts/render-posters.ts",
    "assets:all":     "npm-run-all -s assets:*",
    "assets:report":  "tsx scripts/asset-report.ts"    // таблица весов, падает при превышении бюджета
  }
}
```

`assets:report` выводит таблицу «файл / размер / бюджет / статус» и возвращает
ненулевой код при превышении. Подключается в CI. Это дисциплина, без которой
`public/` через месяц весит 40 MB.

## 8. Кеширование

- Имена файлов с хэшем содержимого (`printer-scanner.a3f91c.glb`).
- `Cache-Control: public, max-age=31536000, immutable`.
- Service Worker **не нужен** — усложняет отладку и даёт мало на статике за CDN.
  Исключение: если захочется офлайн-режима для `/resume`, тогда минимальный SW
  только на эту страницу.

Далее: [09-roadmap.md](./09-roadmap.md).
