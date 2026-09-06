"use client";

import { useFrame } from "@react-three/fiber";
import { damp, damp3 } from "maath/easing";
import { useRef } from "react";
import type { Group, Mesh } from "three";

import { experience } from "@/src/content/profile";
import { readHovered } from "@/src/motion/hover-store";
import { sectionFocus } from "@/src/motion/section-registry";
import { SceneAnchor } from "@/src/webgl/rig/SceneAnchor";

/**
 * Сцена опыта — позвоночник карьеры. Узлы на вертикали, по одному на место
 * работы. Наведение на ряд в DOM поднимает соответствующий узел: список и
 * объём говорят об одном и том же, а не живут рядом.
 */
const WIDE: [number, number, number] = [2.5, 0.1, -2];
const NARROW: [number, number, number] = [0.15, 1.15, -3.2];
const COLORS = ["#5a4bff", "#ff3da6"] as const;

export function ExperienceSpine() {
  const group = useRef<Group>(null);

  useFrame((_, delta) => {
    if (!group.current) return;
    const focus = sectionFocus("experience");
    const scale = { value: group.current.scale.x };
    damp(scale, "value", Math.max(focus, 0.001), 0.3, delta);
    group.current.scale.setScalar(scale.value);
    group.current.visible = scale.value > 0.01;
  });

  return (
    <SceneAnchor wide={WIDE} narrow={NARROW}>
      <group ref={group} scale={0.001}>
        <mesh>
          <cylinderGeometry args={[0.02, 0.02, 2.6, 8]} />
          <meshStandardMaterial color="#c9c4ba" roughness={0.5} />
        </mesh>
        {experience.map((job, index) => (
          <Node key={job.id} id={job.id} index={index} count={experience.length} />
        ))}
      </group>
    </SceneAnchor>
  );
}

function Node({ id, index, count }: { id: string; index: number; count: number }) {
  const mesh = useRef<Mesh>(null);
  const plate = useRef<Mesh>(null);
  const y = ((count - 1) / 2 - index) * 1.1;

  useFrame((state, delta) => {
    const active = readHovered() === `exp:${id}`;
    if (mesh.current) {
      const scale = { value: mesh.current.scale.x };
      damp(scale, "value", active ? 1.45 : 1, 0.2, delta);
      mesh.current.scale.setScalar(scale.value);
      mesh.current.rotation.y += delta * (active ? 1.2 : 0.25);
    }
    if (plate.current) {
      damp3(plate.current.position, [active ? 0.95 : 0.62, y, 0], 0.22, delta);
      plate.current.rotation.y = state.pointer.x * 0.15;
    }
  });

  return (
    <group>
      <mesh ref={mesh} position={[0, y, 0]}>
        <octahedronGeometry args={[0.18, 0]} />
        <meshStandardMaterial
          color={COLORS[index % COLORS.length]}
          emissive={COLORS[index % COLORS.length]}
          emissiveIntensity={0.35}
          roughness={0.25}
          metalness={0.45}
        />
      </mesh>
      <mesh ref={plate} position={[0.62, y, 0]}>
        <boxGeometry args={[0.72, 0.08, 0.42]} />
        <meshStandardMaterial color="#2a2a34" roughness={0.35} metalness={0.2} />
      </mesh>
    </group>
  );
}
