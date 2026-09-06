"use client";

import { RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { damp, damp3 } from "maath/easing";
import { useRef } from "react";
import type { Group, Mesh } from "three";

import { contacts } from "@/src/content/profile";
import { readHovered } from "@/src/motion/hover-store";
import { sectionFocus } from "@/src/motion/section-registry";
import { SceneAnchor } from "@/src/webgl/rig/SceneAnchor";

/**
 * Сцена контактов — четыре пластины, по одной на канал. Наведение на строку
 * в списке выдвигает свою пластину. Без шара: на герое тот же приём уже
 * читался как «непонятная сфера», здесь повторять его незачем.
 */
const WIDE: [number, number, number] = [2.55, 0.15, -1.8];
const NARROW: [number, number, number] = [0.2, 1.15, -3];
const COLORS = ["#5a4bff", "#34e0c0", "#ffb347", "#ff3da6"] as const;

export function ContactBeacon() {
  const group = useRef<Group>(null);

  useFrame((state, delta) => {
    if (!group.current) return;
    const focus = sectionFocus("contacts");
    const scale = { value: group.current.scale.x };
    damp(scale, "value", Math.max(focus, 0.001), 0.3, delta);
    group.current.scale.setScalar(scale.value);
    group.current.visible = scale.value > 0.01;
    group.current.rotation.y = state.pointer.x * 0.2;
    group.current.rotation.x = -state.pointer.y * 0.1;
  });

  return (
    <SceneAnchor wide={WIDE} narrow={NARROW}>
      <group ref={group} scale={0.001}>
        {contacts.map((contact, index) => (
          <Plate key={contact.label} label={contact.label} index={index} />
        ))}
      </group>
    </SceneAnchor>
  );
}

function Plate({ label, index }: { label: string; index: number }) {
  const mesh = useRef<Mesh>(null);
  const rest: [number, number, number] = [(index % 2) * 0.95 - 0.48, (1.5 - index) * 0.42, index * 0.08];

  useFrame((_, delta) => {
    if (!mesh.current) return;
    const active = readHovered() === `contact:${label}`;
    damp3(mesh.current.position, [rest[0] + (active ? 0.28 : 0), rest[1], rest[2] + (active ? 0.35 : 0)], 0.2, delta);
    const scale = { value: mesh.current.scale.x };
    damp(scale, "value", active ? 1.12 : 1, 0.2, delta);
    mesh.current.scale.setScalar(scale.value);
  });

  return (
    <RoundedBox ref={mesh} args={[1.15, 0.32, 0.08]} radius={0.06} smoothness={3} position={rest}>
      <meshStandardMaterial
        color={COLORS[index % COLORS.length]}
        roughness={0.3}
        metalness={0.25}
        emissive={COLORS[index % COLORS.length]}
        emissiveIntensity={0.2}
      />
    </RoundedBox>
  );
}
