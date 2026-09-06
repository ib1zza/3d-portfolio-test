"use client";

import { useFrame } from "@react-three/fiber";
import { damp } from "maath/easing";
import { useRef } from "react";
import type { Group, Mesh } from "three";

import { skills } from "@/src/content/profile";
import { sectionFocus } from "@/src/motion/section-registry";
import { useQualityStore } from "@/src/webgl/lib/quality-store";
import { SceneAnchor } from "@/src/webgl/rig/SceneAnchor";

/**
 * Сцена технологий — кольцо плиток. Каждая плитка — один навык из профиля.
 * Кольцо крутится само, курсор наклоняет его: стек читается как набор,
 * а не как бегущая строка, повторённая в 3D.
 *
 * На medium берём меньше плиток: полный список из двадцати instanced-мешей
 * на слабом GPU не стоит той же цены, что на ultra.
 */
const WIDE: [number, number, number] = [2.4, 0, -2.2];
const NARROW: [number, number, number] = [0.1, 1.2, -3.4];
const COLORS = ["#5a4bff", "#34e0c0", "#ffb347", "#ff3da6"] as const;
const COUNT_BY_TIER = { ultra: 12, high: 10, medium: 7, flat: 0 } as const;

export function SkillRing() {
  const tier = useQualityStore((s) => s.tier);
  const count = Math.min(COUNT_BY_TIER[tier], skills.length);
  const group = useRef<Group>(null);

  useFrame((state, delta) => {
    if (!group.current) return;
    const focus = sectionFocus("skills");
    const scale = { value: group.current.scale.x };
    damp(scale, "value", Math.max(focus, 0.001), 0.3, delta);
    group.current.scale.setScalar(scale.value);
    group.current.visible = scale.value > 0.01;
    group.current.rotation.y += delta * 0.22;
    group.current.rotation.x = -0.35 + state.pointer.y * 0.12;
  });

  if (count === 0) return null;

  return (
    <SceneAnchor wide={WIDE} narrow={NARROW}>
      <group ref={group} scale={0.001}>
        {skills.slice(0, count).map((skill, index) => (
          <Tile key={skill} index={index} count={count} color={COLORS[index % COLORS.length]!} />
        ))}
      </group>
    </SceneAnchor>
  );
}

function Tile({ index, count, color }: { index: number; count: number; color: string }) {
  const mesh = useRef<Mesh>(null);
  const angle = (index / count) * Math.PI * 2;

  useFrame((state, delta) => {
    if (!mesh.current) return;
    mesh.current.rotation.z += delta * 0.4;
    const pulse = 1 + Math.sin(state.clock.elapsedTime * 1.4 + index) * 0.08;
    const scale = { value: mesh.current.scale.x };
    damp(scale, "value", pulse, 0.2, delta);
    mesh.current.scale.setScalar(scale.value);
  });

  return (
    <mesh
      ref={mesh}
      position={[Math.cos(angle) * 1.45, Math.sin(angle * 2) * 0.18, Math.sin(angle) * 1.45]}
      rotation={[0, -angle, 0]}
    >
      <boxGeometry args={[0.42, 0.22, 0.08]} />
      <meshStandardMaterial color={color} roughness={0.3} metalness={0.35} emissive={color} emissiveIntensity={0.2} />
    </mesh>
  );
}
