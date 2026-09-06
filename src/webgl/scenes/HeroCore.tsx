"use client";

import { RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { damp, damp3 } from "maath/easing";
import { useRef } from "react";
import type { Group, Mesh } from "three";

import { readScroll } from "@/src/motion/scroll-store";
import { sectionFocus } from "@/src/motion/section-registry";
import { SceneAnchor } from "@/src/webgl/rig/SceneAnchor";

/**
 * Сцена 01 — сборка интерфейса. Не шар с шумом: три карточки, полоса и
 * кнопка складываются в стопку. Это то, чем занимается автор — интерфейсы
 * из компонентов — и это читается без подписи.
 *
 * Карточки расходятся от курсора и от скорости скролла: покой — собранный
 * UI, движение — разборка. Так объём отвечает на действие, а не пульсирует
 * сам по себе.
 */
const WIDE: [number, number, number] = [2.35, 0.05, -1.2];
const NARROW: [number, number, number] = [0.2, 0.15, -2.8];

const PARTS = [
  { y: 0.72, z: 0.08, w: 2.35, h: 1.18, d: 0.08, color: "#5a4bff" },
  { y: 0.08, z: -0.06, w: 2.05, h: 0.92, d: 0.08, color: "#2a2a34" },
  { y: -0.58, z: 0.12, w: 1.7, h: 0.62, d: 0.08, color: "#f4f1ec" },
] as const;

export function HeroCore() {
  const group = useRef<Group>(null);

  useFrame((state, delta) => {
    if (!group.current) return;

    const focus = sectionFocus("hero");
    const compact = state.size.width / state.size.height < 1;
    const scale = { value: group.current.scale.x };
    damp(scale, "value", Math.max(focus, 0.001) * (compact ? 0.58 : 1), 0.28, delta);
    group.current.scale.setScalar(scale.value);
    group.current.visible = scale.value > 0.01;

    const pointer = state.pointer;
    group.current.rotation.y = pointer.x * 0.28;
    group.current.rotation.x = -pointer.y * 0.16;

    // Слайдер и кнопка на узком кадре падают на абзац — оставляем только стопку.
    group.current.children.forEach((child, index) => {
      child.visible = !compact || index < PARTS.length;
    });
  });

  return (
    <SceneAnchor wide={WIDE} narrow={NARROW}>
      <group ref={group} scale={0.001}>
        {PARTS.map((part, index) => (
          <Card key={part.color} part={part} index={index} />
        ))}
        <Slider />
        <Button />
      </group>
    </SceneAnchor>
  );
}

function Card({
  part,
  index,
}: {
  part: (typeof PARTS)[number];
  index: number;
}) {
  const mesh = useRef<Mesh>(null);

  useFrame((state, delta) => {
    if (!mesh.current) return;

    const { smoothVelocity } = readScroll();
    const spread = 0.18 + Math.min(Math.abs(smoothVelocity), 1) * 0.7;
    const hoverX = state.pointer.x * (0.12 + index * 0.08);
    const hoverY = state.pointer.y * 0.08;

    damp3(
      mesh.current.position,
      [hoverX, part.y + hoverY + (index - 1) * spread * 0.15, part.z + index * spread * 0.2],
      0.22,
      delta,
    );
    mesh.current.rotation.x = state.pointer.y * 0.04;
    mesh.current.rotation.z = -state.pointer.x * 0.03;
  });

  return (
    <RoundedBox
      ref={mesh}
      args={[part.w, part.h, part.d]}
      radius={0.08}
      smoothness={4}
      position={[0, part.y, part.z]}
    >
      <meshStandardMaterial
        color={part.color}
        roughness={0.32}
        metalness={0.18}
        emissive={part.color === "#5a4bff" ? "#5a4bff" : "#000000"}
        emissiveIntensity={part.color === "#5a4bff" ? 0.22 : 0}
      />
    </RoundedBox>
  );
}

function Slider() {
  const group = useRef<Group>(null);
  const knob = useRef<Mesh>(null);

  useFrame((state, delta) => {
    if (group.current) {
      damp3(group.current.position, [state.pointer.x * 0.2, -1.12, 0.22], 0.25, delta);
    }
    if (knob.current) {
      damp3(knob.current.position, [state.pointer.x * 0.55, 0, 0.06], 0.18, delta);
    }
  });

  return (
    <group ref={group} position={[0, -1.12, 0.22]}>
      <mesh>
        <boxGeometry args={[1.35, 0.06, 0.04]} />
        <meshStandardMaterial color="#c9c4ba" roughness={0.4} />
      </mesh>
      <mesh ref={knob} position={[0, 0, 0.06]}>
        <sphereGeometry args={[0.09, 16, 16]} />
        <meshStandardMaterial color="#5a4bff" roughness={0.2} metalness={0.4} emissive="#5a4bff" emissiveIntensity={0.4} />
      </mesh>
    </group>
  );
}

function Button() {
  const mesh = useRef<Mesh>(null);

  useFrame((state, delta) => {
    if (!mesh.current) return;
    damp3(mesh.current.position, [0.55 + state.pointer.x * 0.12, -1.48, 0.28], 0.25, delta);
    const scale = { value: mesh.current.scale.x };
    damp(scale, "value", 1 + Math.abs(state.pointer.x) * 0.06, 0.2, delta);
    mesh.current.scale.setScalar(scale.value);
  });

  return (
    <RoundedBox ref={mesh} args={[0.72, 0.22, 0.07]} radius={0.1} smoothness={4} position={[0.55, -1.48, 0.28]}>
      <meshStandardMaterial color="#ff3da6" roughness={0.28} metalness={0.15} emissive="#ff3da6" emissiveIntensity={0.18} />
    </RoundedBox>
  );
}
