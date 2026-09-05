"use client";

import { useFrame } from "@react-three/fiber";
import { damp } from "maath/easing";
import { useRef } from "react";
import type { Mesh, MeshStandardMaterial } from "three";

import { readScroll } from "@/src/motion/scroll-store";

/**
 * Временная сцена этапа 2: она существует только чтобы проверить, что весь
 * конвейер работает — камера едет по пути, скролл доезжает до объекта, скорость
 * влияет на материал. Заменяется реальными сценами на этапах 3–5.
 */
export function ScaffoldScene() {
  const mesh = useRef<Mesh>(null);
  const material = useRef<MeshStandardMaterial>(null);

  useFrame((_, delta) => {
    if (!mesh.current) return;
    const { progress, smoothVelocity } = readScroll();

    mesh.current.rotation.y += delta * 0.25 + smoothVelocity * 0.4;
    mesh.current.rotation.x = progress * Math.PI * 0.5;

    // Растяжение по скорости — упрощённая версия приёма из plans/05, раздел 3.
    const stretch = 1 + Math.abs(smoothVelocity) * 0.55;
    const scale = { value: mesh.current.scale.y };
    damp(scale, "value", stretch, 0.15, delta);
    mesh.current.scale.set(2 - scale.value * 0.5, scale.value, 2 - scale.value * 0.5);

    if (material.current) {
      const emissive = { value: material.current.emissiveIntensity };
      damp(emissive, "value", Math.abs(smoothVelocity) * 2.5, 0.2, delta);
      material.current.emissiveIntensity = emissive.value;
    }
  });

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[4, 6, 5]} intensity={2.2} />
      <pointLight position={[-5, -2, 3]} intensity={12} color="#5a4bff" />

      <mesh ref={mesh}>
        <icosahedronGeometry args={[1.4, 1]} />
        <meshStandardMaterial
          ref={material}
          color="#5a4bff"
          emissive="#ff3da6"
          emissiveIntensity={0}
          roughness={0.25}
          metalness={0.4}
          flatShading
        />
      </mesh>
    </>
  );
}
