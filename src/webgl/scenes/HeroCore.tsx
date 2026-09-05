"use client";

import { useFrame } from "@react-three/fiber";
import { damp } from "maath/easing";
import { useEffect, useMemo, useRef } from "react";
import type { Mesh, ShaderMaterial } from "three";

import { readScroll } from "@/src/motion/scroll-store";
import { sectionProgress } from "@/src/motion/section-registry";
import { createCoreMaterial } from "@/src/webgl/materials/CoreMaterial";
import { useQualityStore } from "@/src/webgl/lib/quality-store";

/**
 * Сцена 01 — ядро. Центральный объект героя: неспокойная материя, из которой
 * дальше по сайту собираются интерфейсы. См. plans/04-scenes.md, сцена 01.
 *
 * Детализация сферы и число октав шума привязаны к тиру: вершинный шейдер
 * считает шум трижды на вершину (позиция плюс два соседа для нормали),
 * поэтому цена растёт как «вершины × октавы × 3».
 */
const DETAIL_BY_TIER = { ultra: 96, high: 64, medium: 40, flat: 24 } as const;
const OCTAVES_BY_TIER = { ultra: 4, high: 3, medium: 2, flat: 1 } as const;

/**
 * Сдвинуто вправо и вглубь: имя в заголовке занимает левую половину экрана,
 * и ядро, стоящее по центру, перекрывало его.
 */
const CORE_POSITION: [number, number, number] = [2.5, 0.1, -1.4];

export function HeroCore() {
  const tier = useQualityStore((s) => s.tier);
  const mesh = useRef<Mesh>(null);
  const material = useMemo(() => createCoreMaterial(OCTAVES_BY_TIER[tier]), [tier]);

  useEffect(() => () => material.dispose(), [material]);

  useFrame((_, delta) => {
    if (!mesh.current) return;

    const { smoothVelocity } = readScroll();

    // Материал читаем из ref меша, а не из useMemo: значения из хуков
    // считаются иммутабельными (react-hooks/immutability), а юниформы
    // обязаны меняться каждый кадр.
    const uniforms = (mesh.current.material as ShaderMaterial).uniforms;
    uniforms.uTime!.value += delta;
    damp(uniforms.uStretch!, "value", Math.abs(smoothVelocity), 0.18, delta);

    // Пока герой в кадре — ядро дышит и медленно вращается. Когда секция
    // уходит, объект сжимается: он «отдаёт материю» следующим секциям.
    const focus = 1 - sectionProgress("hero");
    mesh.current.rotation.y += delta * 0.12;
    mesh.current.rotation.z = smoothVelocity * 0.25;

    const scale = { value: mesh.current.scale.x };
    damp(scale, "value", 0.35 + focus * 0.65, 0.4, delta);
    mesh.current.scale.setScalar(scale.value);
  });

  return (
    <mesh ref={mesh} position={CORE_POSITION}>
      <sphereGeometry args={[1.5, DETAIL_BY_TIER[tier], DETAIL_BY_TIER[tier]]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}
