"use client";

import { Clone, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { Box3, Vector3, type Group } from "three";

import type { ProjectStage } from "@/src/content/types";

/**
 * Модель проекта в 3D.
 *
 * Через Clone, а не напрямую: один и тот же GLB нужен и в портале на витрине,
 * и на странице проекта, а объект three не может находиться в двух местах
 * графа одновременно — второе вхождение просто вырвало бы его из первого.
 * Clone делает поверхностную копию иерархии с общей геометрией и материалами,
 * так что вторая копия не стоит ни памяти, ни лишней загрузки.
 *
 * Файлы сжаты meshopt (scripts/optimize-models.mjs); useGLTF подключает
 * MeshoptDecoder сам, отдельной настройки не требуется.
 */
export function ProjectModel({ stage, spin = 0 }: { stage: ProjectStage; spin?: number }) {
  const group = useRef<Group>(null);

  useFrame((_, delta) => {
    if (group.current && spin !== 0) group.current.rotation.y += delta * spin;
  });

  if (stage.model.type !== "gltf") {
    return (
      <group ref={group}>
        <ProceduralPlaceholder accent={stage.accent} />
      </group>
    );
  }

  return (
    <group ref={group}>
      <GltfModel stage={stage} />
    </group>
  );
}

function GltfModel({ stage }: { stage: ProjectStage }) {
  // Условного вызова хука здесь нет: компонент рендерится только для gltf-сцен.
  const model = stage.model;
  if (model.type !== "gltf") return null;

  return (
    <StageGltf
      src={model.src}
      fit={model.fit}
      position={model.position}
      rotation={model.rotation}
    />
  );
}

/**
 * Отдельная модель мира: главная или один из предметов из stage.extras.
 *
 * Модель приводится к размеру `fit` по наибольшей стороне и центруется в
 * начале своей группы. Без этого сцену пришлось бы настраивать под единицы
 * каждого файла: t-shirt.glb, например, приходит размером 3.4e5 юнитов с
 * центром в -6.3e5 — при любом «разумном» множителе он оказывается далеко за
 * камерой. Центрирование заодно делает position и rotation предсказуемыми:
 * вращение идёт вокруг самой модели, а не вокруг случайной точки её автора.
 */
export function StageGltf({
  src,
  fit = 2,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
}: {
  src: string;
  fit?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
}) {
  const { scene } = useGLTF(src);

  const { scale, offset } = useMemo(() => {
    const box = new Box3().setFromObject(scene);
    const size = box.getSize(new Vector3());
    const largest = Math.max(size.x, size.y, size.z);
    const scale = largest > 0 ? fit / largest : 1;
    // Позиция Clone не масштабируется вместе с объектом, поэтому смещение
    // считаем уже в масштабированных координатах.
    const offset = box.getCenter(new Vector3()).multiplyScalar(-scale);
    return { scale, offset: offset.toArray() as [number, number, number] };
  }, [scene, fit]);

  return (
    <group position={position} rotation={rotation}>
      <Clone object={scene} scale={scale} position={offset} />
    </group>
  );
}

/**
 * Заглушка для миров, у которых модели нет по замыслу: чат и канбан
 * задуманы процедурными (метаболы и физика карточек, см. stages.ts).
 * До того, как эти сцены появятся, портал показывает акцентную форму —
 * пустое окно выглядело бы поломкой.
 */
function ProceduralPlaceholder({ accent }: { accent: string }) {
  return (
    <mesh>
      <icosahedronGeometry args={[0.85, 1]} />
      <meshStandardMaterial
        color={accent}
        emissive={accent}
        emissiveIntensity={0.25}
        roughness={0.25}
        metalness={0.5}
        flatShading
      />
    </mesh>
  );
}

/** Предзагрузка: вызывается со страниц, чтобы модель не всплывала рывком. */
export function preloadStageModel(stage: ProjectStage) {
  if (stage.model.type === "gltf") useGLTF.preload(stage.model.src);
}
