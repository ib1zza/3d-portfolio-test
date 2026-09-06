"use client";

import { Environment, Float, Lightformer } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { damp } from "maath/easing";
import { Suspense, useRef, useState } from "react";
import { PerspectiveCamera, type Group } from "three";

import { stages } from "@/src/content/stages";
import type { ProjectId } from "@/src/content/types";
import { sectionSteps } from "@/src/motion/section-registry";
import { useQualityStore } from "@/src/webgl/lib/quality-store";
import { ProjectModel } from "@/src/webgl/models/ProjectModel";
import { CameraPose } from "@/src/webgl/rig/CameraPose";
import { SceneTunnel } from "@/src/webgl/tunnel";

/** Шаг между мирами по X. Больше кадра, чтобы соседи не лезли в центр. */
const STRIDE = 7;

/**
 * Витрина проектов: миры стоят в ряд по X, скролл везёт ряд мимо камеры.
 *
 * Ряд в общем пространстве, а не отдельная сцена на проект: тогда соседние
 * миры видны на краях кадра и переход между проектами читается как движение,
 * а не как подмена картинки. Камера стоит на месте — едет содержимое.
 */
/** id секции-ленты в реестре: по нему сцена узнаёт, где сейчас скролл. */
export const REEL_SECTION = "work-reel";

export function WorkScene({ ids }: { ids: ProjectId[] }) {
  const activeWorlds = useQualityStore((s) => s.profile.activeWorlds);

  return (
    <SceneTunnel.In>
      <CameraPose position={[0, 0, 6.4]} fov={34} parallax={0.35} />

      {/* Свет сдержанный: на светлом фоне пересвеченная модель сливается с
          ним и теряет форму, поэтому объём здесь держится на контрасте
          направленного света, а не на общей заливке. */}
      <ambientLight intensity={0.35} />
      <directionalLight position={[4, 6, 5]} intensity={1.6} />

      <Environment resolution={128} frames={1}>
        <Lightformer intensity={1.6} form="rect" scale={[12, 5, 1]} position={[0, 4, -6]} />
        <Lightformer intensity={0.9} form="circle" scale={5} position={[-7, 0, 3]} />
        <Lightformer intensity={0.8} form="circle" scale={5} position={[7, 0, 3]} />
      </Environment>

      <ReelAnchor>
        <Reel ids={ids} budget={activeWorlds} />
      </ReelAnchor>
    </SceneTunnel.In>
  );
}

/**
 * Ставит ленту в свободную половину кадра: на широком экране текст занимает
 * левую половину и модель уходит вправо, на узком текст лежит внизу и модель
 * поднимается вверх. Иначе модель встаёт ровно на заголовок.
 *
 * Сдвиг считается от кадра, а не задан константой: при фиксированных
 * координатах модель уезжала бы за край на широких пропорциях и наползала на
 * текст на узких.
 */
function ReelAnchor({ children }: { children: React.ReactNode }) {
  const group = useRef<Group>(null);

  useFrame((state, delta) => {
    if (!group.current) return;

    // Половина видимой высоты на плоскости z = 0, где стоят модели.
    const halfHeight =
      state.camera instanceof PerspectiveCamera
        ? Math.tan(((state.camera.fov / 2) * Math.PI) / 180) * state.camera.position.z
        : 0;
    const aspect = state.size.width / Math.max(state.size.height, 1);
    const narrow = state.size.width < 768;

    damp(group.current.position, "x", narrow ? 0 : halfHeight * aspect * 0.5, 0.3, delta);
    damp(group.current.position, "y", narrow ? halfHeight * 0.45 : 0, 0.3, delta);
  });

  return <group ref={group}>{children}</group>;
}

function Reel({ ids, budget }: { ids: ProjectId[]; budget: number }) {
  const row = useRef<Group>(null);

  useFrame((_, delta) => {
    if (!row.current) return;

    // Демпфируем позицию ряда, а не позицию скролла: прилипание Lenis уже
    // анимирует скролл, и второе сглаживание поверх него делает движение
    // ватным. Здесь демпфер нужен только чтобы сгладить дребезг ввода.
    const position = sectionSteps(REEL_SECTION, ids.length);
    damp(row.current.position, "x", -position * STRIDE, 0.12, delta);
  });

  return (
    <group ref={row}>
      {ids.map((id, index) => (
        <World key={id} id={id} index={index} budget={budget} count={ids.length} />
      ))}
    </group>
  );
}

/**
 * Один мир в ряду. Модель монтируется только рядом с кадром: каждая — это
 * загруженный GLB и свой набор материалов, и держать все миры живыми ради
 * двух видимых значит платить памятью за то, чего не видно.
 */
function World({
  id,
  index,
  budget,
  count,
}: {
  id: ProjectId;
  index: number;
  budget: number;
  count: number;
}) {
  const group = useRef<Group>(null);
  const stage = stages[id];

  // Радиус в мирах: бюджет 3 — это текущий и по одному с каждой стороны.
  const radius = Math.max(Math.floor((budget - 1) / 2), 0);
  const [inRange, setInRange] = useState(index <= radius);

  useFrame((_, delta) => {
    if (!group.current) return;

    // Каждый мир читает позицию сам: sectionSteps — чистая функция от
    // позиции скролла, за кадр она не меняется, зато не нужно следить за
    // порядком useFrame между лентой и её детьми.
    const offset = sectionSteps(REEL_SECTION, count) - index;
    const distance = Math.abs(offset);

    // Ререндер только на пересечении границы, а не каждый кадр. Запас в
    // половину шага — гистерезис: без него мир на самой границе мигал бы
    // монтированием туда-обратно от дребезга скролла.
    const next = distance <= radius + 0.5;
    if (next !== inRange) setInRange(next);

    // Уходящие миры отступают и уменьшаются: так центр кадра всегда один,
    // и соседи не спорят с ним за внимание.
    const focus = Math.max(1 - Math.min(distance, 1), 0);
    damp(group.current.position, "z", -2.2 * (1 - focus), 0.2, delta);
    damp(group.current.rotation, "y", offset * 0.5, 0.2, delta);

    const scale = 0.65 + focus * 0.35;
    damp(group.current.scale, "x", scale, 0.2, delta);
    damp(group.current.scale, "y", scale, 0.2, delta);
    damp(group.current.scale, "z", scale, 0.2, delta);
  });

  return (
    <group ref={group} position={[index * STRIDE, 0, 0]}>
      {inRange && (
        <>
          <pointLight position={[-2, 1, 2.5]} intensity={6} color={stage.accent} />

          <Float speed={1.1} rotationIntensity={0.12} floatIntensity={0.4}>
            <Suspense fallback={null}>
              <ProjectModel stage={stage} spin={0.12} />
            </Suspense>
          </Float>
        </>
      )}
    </group>
  );
}
