> Часть плана MATTER. Предыдущий файл: [04-scenes.md](./04-scenes.md)

# 05 — Техкарта шейдеров и эффектов

Каждый эффект описан по схеме: зачем, как устроен, чего стоит, где используется,
чем заменяется при деградации. Код — скетчи, не финальная реализация.

## Сводная таблица

| # | Эффект | Где | Стоимость | Тир |
| --- | --- | --- | --- | --- |
| 1 | GPGPU-частицы с морфингом | сквозной | высокая | ultra/high/medium |
| 2 | Сэмплирование облаков точек из GLB | оффлайн-скрипт | нулевая в рантайме | все |
| 3 | Velocity stretching | все объекты | ~0 | все, кроме flat |
| 4 | Портальный материал | витрина, переходы | средняя | ultra/high |
| 5 | FBO-переход между сценами | смена роута | средняя, кратковременно | ultra/high/medium |
| 6 | Clipping-срез со светящейся линией | Simplex, 3D Outlet | низкая | все, кроме flat |
| 7 | Transmission-стекло | скиллы, линза | высокая | ultra/high |
| 8 | Raymarched жидкий фон | hero, манифест | средняя | ultra/high |
| 9 | Метаболы | Realtime Chat | средняя | ultra/high |
| 10 | Ткань на шуме | Silkworm | низкая | все, кроме flat |
| 11 | Глитч/пикселизация NDA | 3D Outlet | низкая | все, кроме flat |
| 12 | Постпроцессинг-цепочка | глобально | настраиваемая | ultra/high |
| 13 | MSDF-текст | скиллы, чат | низкая | все, кроме flat |
| 14 | Интерполяция окружения по теме | глобально | низкая | все, кроме flat |

---

## 1. GPGPU-система частиц

Ядро всего сайта. Позиции и скорости частиц живут в текстурах и обновляются
фрагментным шейдером — то есть симуляция целиком на GPU.

### Устройство

Две пары render target'ов (ping-pong): `positionTexture` и `velocityTexture`,
размер `512×512` = 262 144 частицы на `ultra`, `256×256` = 65 536 на `medium`.

```
uPosition (RGBA32F): xyz = позиция, w = «возраст/фаза»
uVelocity (RGBA32F): xyz = скорость, w = служебное
uTargetA / uTargetB : два целевых облака точек (текстуры)
uMorph              : 0..1, смешивание между A и B
```

Шаг симуляции во фрагментном шейдере:

```glsl
vec3 pos = texture2D(uPosition, uv).xyz;
vec3 vel = texture2D(uVelocity, uv).xyz;

// цель: интерполяция между двумя облаками проектов
vec3 target = mix(texture2D(uTargetA, uv).xyz,
                  texture2D(uTargetB, uv).xyz, uMorph);

// пружина к цели: чем ближе морф к 0 или 1, тем сильнее сборка
float grip = mix(0.02, 0.22, abs(uMorph - 0.5) * 2.0);
vel += (target - pos) * grip;

// турбулентность: максимум в середине морфа — «взрыв и пересборка»
float chaos = (1.0 - abs(uMorph - 0.5) * 2.0);
vel += curlNoise(pos * 0.6 + uTime * 0.15) * chaos * 0.18;

// отталкивание указателем
vec3 d = pos - uPointer;
vel += normalize(d) * uPointerForce / (dot(d, d) + 0.4);

vel *= 0.92;                 // затухание
gl_FragColor = vec4(pos + vel * uDelta, 1.0);
```

Рендер частиц — один `<points>` с фиксированной геометрией UV-индексов; позиция
берётся из текстуры в вершинном шейдере:

```glsl
vec3 pos = texture2D(uPosition, aRef).xyz;
vec3 vel = texture2D(uVelocity, aRef).xyz;

// растягиваем точку по направлению движения — дешёвый motion blur
float speed = length(vel);
vec4 mv = modelViewMatrix * vec4(pos, 1.0);
gl_Position = projectionMatrix * mv;
gl_PointSize = uSize * (1.0 + speed * 6.0) * (uScale / -mv.z);
vColor = mix(uColorSlow, uColorFast, smoothstep(0.0, 0.35, speed));
```

Во фрагментном — круглая маска и мягкий край, без текстуры:

```glsl
float d = length(gl_PointCoord - 0.5);
float a = smoothstep(0.5, 0.35, d);
if (a < 0.01) discard;
gl_FragColor = vec4(vColor, a * uOpacity);
```

### Морфинг между проектами

`uMorph` привязан к прогрессу скролла в секции витрины и к фазе перехода между
роутами. Порядок облаков: `hero-sphere → tooth → shirt → printer → chat → kanban → signature`.

Ключевая деталь качества: **все облака должны иметь одинаковое число точек и
согласованный порядок**, иначе морф будет выглядеть как случайное перемешивание.
Точки сортируются по общему принципу (например, по сферическим координатам от
центра масс) на этапе генерации — тогда переход читается как «перетекание», а не
как «телепорт».

### Стоимость и деградация

- `ultra`: 262k частиц, симуляция каждый кадр.
- `high`: 131k, симуляция каждый кадр.
- `medium`: 65k, симуляция через кадр (`uDelta` удваивается).
- `flat`: система не создаётся, показываются предзапечённые PNG-спрайты.

Обязательная проверка: поддержка `EXT_color_buffer_float`. Без неё — падаем на
`HalfFloatType`, при отсутствии и его — на тир `flat`.

---

## 2. Генерация облаков точек из GLB

Делается **оффлайн**, скриптом, результат — бинарный файл с `Float32Array`.
В рантайме это просто `fetch` + `DataTexture`, никакой нагрузки.

```ts
// scripts/sample-points.ts
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler.js'

const sampler = new MeshSurfaceSampler(mesh).setWeightAttribute(null).build()
const count = 262144
const out = new Float32Array(count * 4)
for (let i = 0; i < count; i++) sampler.sample(tmpPos, tmpNormal)
// нормализация в единичный куб + сортировка по общему ключу
```

Подробности и запуск — в [08-asset-pipeline.md](./08-asset-pipeline.md).

---

## 3. Velocity-driven vertex stretching

Каждый значимый объект слегка растягивается по направлению скролла на разгоне —
это «вес» и читается как моушен-блюр, но стоит один `mix` в вершинном шейдере.

Внедряется в стандартный материал через `onBeforeCompile` (или `drei/shaderMaterial`
для кастомных):

```glsl
// в vertex, до project_vertex
float along = dot(normalize(transformed), uStretchDir);
transformed += uStretchDir * along * uStretch * 0.35;
```

`uStretch` — сглаженная скорость скролла из стора, `uStretchDir` — направление в
пространстве вида. Максимальное растяжение ограничено 35% размера объекта: выше
начинает выглядеть как баг.

---

## 4. Портальный материал

`MeshPortalMaterial` из drei: плоскость, за которой рендерится отдельная сцена в
свой render target.

```tsx
<mesh geometry={roundedPlane}>
  <MeshPortalMaterial
    blend={blend}          // 0 = окно, 1 = мы внутри мира
    resolution={quality.portalRes}
    worldUnits={false}
  >
    <ProjectWorld project={project} />
    <color attach="background" args={[project.accentBg]} />
    <Environment preset={project.envPreset} />
  </MeshPortalMaterial>
</mesh>
```

Переход в кейс = анимация `blend` от 0 к 1 одновременно с раскрытием геометрии
портала на весь экран и полётом камеры. Именно потому, что `blend` — штатный
параметр drei, переход «влёта» получается без хаков.

Экономия: у каждого портала свой render target. Пять активных порталов = пять
дополнительных проходов рендера, что недопустимо. Решение:
- рендерим только видимые в кадре порталы;
- невидимым выставляем `frames={1}` — они рисуются один раз и замораживаются;
- на мобилке живой портал ровно один — активный в snap-контейнере.

---

## 5. FBO-переход между сценами

Для переходов без портала. Обе сцены — в свои `WebGLRenderTarget`, полноэкранный
квад смешивает по fbm-шуму с направленным смещением (код в
[03, раздел 3.3](./03-motion-scroll-transitions.md)).

Реализация как кастомный `Effect` для `postprocessing`, чтобы попасть в общую
цепочку и не делать лишний проход:

```ts
class DissolveTransitionEffect extends Effect {
  constructor() {
    super('DissolveTransition', fragmentShader, {
      uniforms: new Map([['uFrom', new Uniform(null)], ['uProgress', new Uniform(0)]]),
    })
  }
}
```

---

## 6. Срез с светящейся линией

Используется в Simplex («разбираю интерфейс на слои») и в 3D Outlet («печать слой
за слоем»). Один из самых выразительных и при этом дешёвых эффектов.

```ts
const plane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0)
renderer.localClippingEnabled = true
material.clippingPlanes = [plane]
material.clipShadows = true
```

Сама светящаяся линия среза — не отдельная геометрия, а эмиссия у поверхности
плоскости, добавленная в фрагментный шейдер материала:

```glsl
float distToPlane = abs(dot(vWorldPos, uPlaneNormal) - uPlaneConstant);
float edge = 1.0 - smoothstep(0.0, 0.02, distToPlane);
outgoingLight += uEdgeColor * edge * 2.5;
```

Чтобы срез не выглядел «пустым» изнутри, добавляем `BackSide`-меш той же
геометрии с тем же clipping — тогда внутренность модели читается как заполненная.
Позиция плоскости — от прогресса скролла в секции.

---

## 7. Стекло

`MeshTransmissionMaterial` — самый дорогой эффект в проекте, потому что делает
дополнительный проход рендера сцены на каждый экземпляр.

Бюджет:

| Тир | samples | resolution | Экземпляров |
| --- | --- | --- | --- |
| ultra | 6 | 512 | 2 (сосуд + линза курсора) |
| high | 2 | 256 | 1 (только сосуд) |
| medium | — | — | фейк |
| flat | — | — | нет |

Фейковое стекло: `MeshPhysicalMaterial` с `roughness: 0.05`, `metalness: 0`,
`envMapIntensity: 1.6`, лёгкий `Fresnel` через `onBeforeCompile` и статичный
`envMap`. На 90% сцен визуальная разница неочевидна, а стоит в разы дешевле.

---

## 8. Raymarched жидкий фон

Полноэкранный квад, во фрагментном шейдере — 2D fbm-домейн-варпинг (не полноценный
3D raymarching, он не нужен и дорог):

```glsl
vec2 q = vec2(fbm(uv + uTime * 0.05), fbm(uv + vec2(5.2, 1.3)));
vec2 r = vec2(fbm(uv + 4.0 * q + uTime * 0.03), fbm(uv + 4.0 * q + vec2(8.3, 2.8)));
float f = fbm(uv + 4.0 * r);
vec3 col = mix(uColorA, uColorB, clamp(f * f * 2.2, 0.0, 1.0));
col = mix(col, uAccent, smoothstep(0.7, 1.0, f) * uAccentAmount);
```

`uAccentAmount` растёт со скоростью скролла — фон «разогревается» при разгоне.
Рендерится в половинном разрешении в отдельный target и апскейлится: визуально
неотличимо, стоит вчетверо дешевле. Число октав fbm: 5 на `ultra`, 3 на `high`,
на `medium` — CSS-градиент вместо шейдера.

---

## 9. Метаболы (Realtime Chat)

Два варианта, выбираем по замеру:

- **MarchingCubes** из drei — честная геометрия, можно освещать физически
  корректно, но CPU-нагрузка растёт кубически от разрешения. Разрешение 32,
  максимум 8 шаров — приемлемо.
- **SDF-raymarching на квадe** — только GPU, красивее, но материал придётся
  писать целиком, и он не будет участвовать в общем освещении и тенях.

Рекомендация: MarchingCubes на десктопе (интегрируется с общим светом и
постпроцессингом), SDF-квад на мобилке (дешевле по CPU, а CPU там узкое место).

---

## 10. Ткань (Silkworm)

Вершинный шейдер поверх стандартного материала: смещение по нормали, амплитуда
по маске (низ футболки колышется, плечи почти нет).

```glsl
float mask = smoothstep(0.6, -0.4, position.y);
float wave = snoise(vec3(position.xz * 2.5, uTime * 0.6)) * 0.06;
wave += snoise(vec3(position.xz * 6.0, uTime * 1.1)) * 0.02;
transformed += normal * wave * mask * (1.0 + uWindFromPointer);
```

Нормали пересчитываем численно (два дополнительных сэмпла шума), иначе освещение
«не почувствует» волну и эффект пропадёт.

Свотчи материалов — просто набор пресетов uniform'ов, интерполируемых через `damp`:
шёлк (анизотропный блик, `sheen`), хлопок (высокий roughness + шумовая карта),
деним (нормалмап с диагональным плетением).

---

## 11. Глитч и пикселизация (NDA)

Прогрессивная деградация изображения по мере приближения камеры — то есть
наоборот: чем ближе смотришь, тем меньше видно. Это и есть шутка секции.

```glsl
float secrecy = smoothstep(6.0, 2.0, uCameraDistance);   // ближе → больше
vec2 grid = mix(vec2(512.0), vec2(18.0), secrecy);
vec2 quv = floor(vUv * grid) / grid;

// строчный сдвиг с случайными «разрывами»
float band = step(0.985, hash(floor(quv.y * 60.0) + floor(uTime * 8.0)));
quv.x += band * (hash(quv.y) - 0.5) * 0.12 * secrecy;

vec3 col = texture2D(uMap, quv).rgb;
col = mix(col, vec3(hash(quv + uTime)), band * secrecy * 0.6);
```

Плюс лёгкий RGB-сдвиг каналов и моноширинная плашка `CLASSIFIED` поверх (DOM).

---

## 12. Постпроцессинг

Единая цепочка на весь сайт, состав зависит от тира:

```tsx
<EffectComposer multisampling={quality.msaa} enableNormalPass={false}>
  <Bloom intensity={0.6} luminanceThreshold={0.85} mipmapBlur />
  <DepthOfField focusDistance={dof.focus} focalLength={0.03} bokehScale={2.2} />
  <ChromaticAberration offset={aberration} />      {/* от скорости скролла */}
  <Noise opacity={0.025} premultiply />            {/* убирает бандинг градиентов */}
  <Vignette darkness={0.35} offset={0.32} />
  <ToneMapping mode={ToneMappingMode.AGX} />
</EffectComposer>
```

Замечания:

- `AgX` вместо `ACESFilmic`: мягче ведёт себя с насыщенными акцентными цветами и
  не «выжигает» их в белый. Доступен в three начиная с r160+.
- `ChromaticAberration.offset` анимируется от скорости скролла: 0 в покое,
  до `0.0018` на разгоне. Это то, что делает быстрый скролл «физическим».
- `DepthOfField` — самый дорогой в цепочке, включается только на `ultra` и только
  в секциях, где он работает на смысл (фокус-орбита, витрина).
- `Noise` с `opacity: 0.025` обязателен: без него плавные градиенты фона дают
  видимый бандинг на 8-битных экранах.
- На `medium` цепочка сводится к `Bloom` + `Vignette`. На `flat` — CSS-фильтры.

---

## 13. MSDF-текст в 3D

Для надписей на таблетках скиллов и сообщений в чат-пузырях: `drei/Text`
(troika под капотом) даёт качественный текст, но каждый экземпляр — свой меш.
20 таблеток = 20 дополнительных draw call'ов.

Решение: генерируем **один атлас MSDF** со всеми нужными глифами (ru + en) и
рендерим надписи как инстансированные квады с UV-смещением по атласу. Один
draw call на все надписи.

Для одиночных крупных надписей `drei/Text` остаётся — там оверхед несущественен.

---

## 14. Интерполяция окружения при смене темы

Тема меняет не только CSS-переменные, но и сцену. Это редкий приём и он почти
бесплатный.

```ts
// два HDRI загружены заранее (сжатые, .ktx2, по ~200 KB каждый)
useFrame((_, dt) => {
  damp(scene, 'backgroundIntensity', theme.bgIntensity, 0.4, dt)
  damp(scene, 'environmentIntensity', theme.envIntensity, 0.4, dt)
  damp(gl, 'toneMappingExposure', theme.exposure, 0.4, dt)
  damp(fog, 'color', theme.fogColor, 0.4, dt)   // через damp3/Color lerp
})
```

Сам HDRI не кроссфейдится (это дорого) — вместо этого переключается мгновенно в
момент, когда экспозиция проходит через минимум. Переключение спрятано внутри
«моргания» и незаметно. Длительность всего перехода — 700 мс.

Дополнительно на время смены темы по экрану проходит волна: круговая маска из
точки клика по переключателю, синхронизированная с CSS `clip-path` на DOM-слое.
DOM и WebGL меняются одной и той же волной — это выглядит цельно и делают так
единицы.

---

## Общие правила работы с шейдерами

1. Все кастомные материалы — через `drei/shaderMaterial` + `extend`, с типизацией
   через `declare module '@react-three/fiber'`.
2. Никаких `new THREE.Vector3()` внутри `useFrame` — все временные объекты
   создаются один раз в модуле.
3. Общие GLSL-функции (`snoise`, `curlNoise`, `fbm`, `hash`, `rotate`) — в
   `src/webgl/shaders/lib/` и подключаются через `glsl` template literal
   (`glslify`-подобный include или простая конкатенация).
4. Каждый uniform, который анимируется, обновляется через `maath/easing.damp` —
   единый стиль движения по всему сайту.
5. Любой новый эффект сначала появляется в `/playground` как изолированное демо,
   и только потом интегрируется в сцену. Так проще отлаживать и заодно наполняется
   раздел лаборатории.

Далее: [06-content-model.md](./06-content-model.md).
