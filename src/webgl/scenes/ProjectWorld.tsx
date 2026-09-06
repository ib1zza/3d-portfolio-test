"use client";

import { Environment, Float, Lightformer } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { damp } from "maath/easing";
import { Suspense, useRef } from "react";
import type { Group } from "three";

import { readScroll } from "@/src/motion/scroll-store";
import type { ProjectStage } from "@/src/content/types";
import { ProjectModel, StageGltf } from "@/src/webgl/models/ProjectModel";
import { useQualityStore } from "@/src/webgl/lib/quality-store";
import { SceneTunnel } from "@/src/webgl/tunnel";

/**
 * Мир одного проекта: модель на весь экран за текстом страницы
 * (plans/04-scenes.md, сцена 07).
 *
 * Сцена объявляется страницей и через tunnel попадает в общий Canvas из
 * layout, поэтому переход между проектами не пересоздаёт WebGL-контекст.
 */
export function ProjectWorld({ stage }: { stage: ProjectStage }) {
  const tier = useQualityStore((s) => s.tier);

  return (
    <SceneTunnel.In>
      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 6, 5]} intensity={2} />
      <pointLight position={[-5, -2, 3]} intensity={16} color={stage.accent} />

      {tier !== "medium" && (
        <Environment resolution={128} frames={1}>
          <Lightformer
            intensity={2.2}
            form="rect"
            scale={[10, 4, 1]}
            position={[0, 4, -6]}
            color="#ffffff"
          />
          <Lightformer
            intensity={1.8}
            form="circle"
            scale={4}
            position={[-6, 0, 2]}
            color={stage.accent}
          />
        </Environment>
      )}

      <Suspense fallback={null}>
        <Stage stage={stage} />
      </Suspense>
    </SceneTunnel.In>
  );
}

/**
 * Модель уходит вправо и вглубь: слева идёт колонка с описанием проекта.
 */
const WORLD_POSITION: [number, number, number] = [2.3, -0.1, -1.6];

function Stage({ stage }: { stage: ProjectStage }) {
  const group = useRef<Group>(null);

  useFrame((state, delta) => {
    if (!group.current) return;

    const { progress } = readScroll();

    // Модель доворачивается по скроллу: прокрутка страницы обходит объект
    // вокруг, а не просто уводит его из кадра.
    const targetY = progress * Math.PI * 1.2;
    const rot = { value: group.current.rotation.y };
    damp(rot, "value", targetY, 0.5, delta);
    group.current.rotation.y = rot.value;

    // Небольшой наклон к курсору — объект отзывается на присутствие.
    const tilt = { value: group.current.rotation.x };
    damp(tilt, "value", state.pointer.y * -0.18, 0.4, delta);
    group.current.rotation.x = tilt.value;
  });

  return (
    <group position={WORLD_POSITION}>
      <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.35}>
        <group ref={group}>
          <ProjectModel stage={stage} />

          {/* Предметы мира рядом с главной моделью: например, кепка рядом
              с футболкой в Silkworm. Описаны в stages.ts отдельно. */}
          {stage.extras?.map((extra) => (
            <StageGltf
              key={extra.src}
              src={extra.src}
              fit={extra.fit}
              position={extra.position}
              rotation={extra.rotation}
            />
          ))}
        </group>
      </Float>
    </group>
  );
}

