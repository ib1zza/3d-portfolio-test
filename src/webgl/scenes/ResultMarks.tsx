"use client";

import { useFrame } from "@react-three/fiber";
import { damp } from "maath/easing";
import { useRef } from "react";
import type { Group, Mesh } from "three";

import { achievements } from "@/src/content/profile";
import { readHovered } from "@/src/motion/hover-store";
import { sectionFocus } from "@/src/motion/section-registry";
import { SceneAnchor } from "@/src/webgl/rig/SceneAnchor";

/**
 * Сцена результатов — три столба. Высоты разные нарочно: одинаковые колонны
 * читались бы как декор, разные — как метрики. Наведение на строку в списке
 * поднимает свой столб.
 */
const WIDE: [number, number, number] = [2.45, -0.4, -2];
const NARROW: [number, number, number] = [0.1, 1.1, -3.2];
const HEIGHTS = [1.1, 1.55, 0.85] as const;
const COLORS = ["#34e0c0", "#5a4bff", "#ffb347"] as const;

export function ResultMarks() {
  const group = useRef<Group>(null);
  const count = Math.min(achievements.ru.length, HEIGHTS.length);

  useFrame((_, delta) => {
    if (!group.current) return;
    const focus = sectionFocus("achievements");
    const scale = { value: group.current.scale.x };
    damp(scale, "value", Math.max(focus, 0.001), 0.3, delta);
    group.current.scale.setScalar(scale.value);
    group.current.visible = scale.value > 0.01;
  });

  return (
    <SceneAnchor wide={WIDE} narrow={NARROW}>
      <group ref={group} scale={0.001}>
        {Array.from({ length: count }, (_, index) => (
          <Bar key={index} index={index} />
        ))}
      </group>
    </SceneAnchor>
  );
}

function Bar({ index }: { index: number }) {
  const mesh = useRef<Mesh>(null);
  const height = HEIGHTS[index]!;
  const color = COLORS[index]!;

  useFrame((_, delta) => {
    if (!mesh.current) return;
    const active = readHovered() === `ach:${index}`;
    const scale = { value: mesh.current.scale.y };
    damp(scale, "value", active ? 1.28 : 1, 0.2, delta);
    mesh.current.scale.y = scale.value;
    mesh.current.position.y = (height * scale.value) / 2;
  });

  return (
    <mesh ref={mesh} position={[(index - 1) * 0.62, height / 2, 0]}>
      <boxGeometry args={[0.38, height, 0.38]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.28}
        roughness={0.28}
        metalness={0.4}
      />
    </mesh>
  );
}
