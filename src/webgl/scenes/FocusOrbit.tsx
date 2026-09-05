"use client";

import { useFrame } from "@react-three/fiber";
import { damp } from "maath/easing";
import { useRef, useState } from "react";
import type { Group, Mesh, MeshStandardMaterial } from "three";

import { sectionFocus } from "@/src/motion/section-registry";
import { focusAreas } from "@/src/content/profile";

/**
 * Сцена 03 — направления работы. Пять объектов на орбите, по одному на
 * направление из content/profile. См. plans/04-scenes.md, сцена 03.
 *
 * Форма каждого объекта отражает суть направления, а не выбрана случайно:
 * коробка — коммерческие страницы, октаэдр — приложения, тор-узел — UI-кит
 * (переиспользование как замкнутая петля), тор — анимация, конус — метрики.
 */
const SHAPES = ["box", "octahedron", "torusKnot", "torus", "cone"] as const;
const COLORS = ["#34e0c0", "#5a4bff", "#ffb347", "#ff3da6", "#5a4bff"] as const;

const RADIUS = 3.1;

/**
 * Орбита сдвинута вправо и вглубь: слева идёт колонка текста, а объекты,
 * пролетающие поверх заголовков, мешают их читать.
 */
const ORBIT_POSITION: [number, number, number] = [2.6, -0.2, -2.4];

export function FocusOrbit() {
  const group = useRef<Group>(null);

  useFrame((_, delta) => {
    if (!group.current) return;

    const focus = sectionFocus("focus");
    const scale = { value: group.current.scale.x };
    damp(scale, "value", Math.max(focus, 0.001), 0.3, delta);
    group.current.scale.setScalar(scale.value);
    group.current.visible = scale.value > 0.01;

    group.current.rotation.y += delta * 0.18;
    // Орбита слегка наклонена: строго горизонтальное кольцо выглядит служебно.
    group.current.rotation.x = -0.22;
  });

  return (
    <group ref={group} scale={0.001} position={ORBIT_POSITION}>
      {focusAreas.map((area, i) => {
        const angle = (i / focusAreas.length) * Math.PI * 2;
        return (
          <OrbitObject
            key={area.id}
            shape={SHAPES[i % SHAPES.length]!}
            color={COLORS[i % COLORS.length]!}
            position={[
              Math.cos(angle) * RADIUS,
              Math.sin(angle * 2) * 0.45,
              Math.sin(angle) * RADIUS,
            ]}
          />
        );
      })}
    </group>
  );
}

function OrbitObject({
  shape,
  color,
  position,
}: {
  shape: (typeof SHAPES)[number];
  color: string;
  position: [number, number, number];
}) {
  const mesh = useRef<Mesh>(null);
  const material = useRef<MeshStandardMaterial>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((_, delta) => {
    if (mesh.current) {
      mesh.current.rotation.x += delta * 0.4;
      mesh.current.rotation.y += delta * 0.55;

      const scale = { value: mesh.current.scale.x };
      damp(scale, "value", hovered ? 1.45 : 1, 0.2, delta);
      mesh.current.scale.setScalar(scale.value);
    }

    if (material.current) {
      const glow = { value: material.current.emissiveIntensity };
      damp(glow, "value", hovered ? 1.8 : 0.15, 0.25, delta);
      material.current.emissiveIntensity = glow.value;
    }
  });

  return (
    <mesh
      ref={mesh}
      position={position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <Geometry shape={shape} />
      <meshStandardMaterial
        ref={material}
        color={color}
        emissive={color}
        emissiveIntensity={0.15}
        roughness={0.28}
        metalness={0.45}
      />
    </mesh>
  );
}

function Geometry({ shape }: { shape: (typeof SHAPES)[number] }) {
  switch (shape) {
    case "box":
      return <boxGeometry args={[0.62, 0.62, 0.62]} />;
    case "octahedron":
      return <octahedronGeometry args={[0.46, 0]} />;
    case "torusKnot":
      return <torusKnotGeometry args={[0.3, 0.1, 96, 12]} />;
    case "torus":
      return <torusGeometry args={[0.36, 0.12, 20, 40]} />;
    case "cone":
      return <coneGeometry args={[0.4, 0.7, 5]} />;
  }
}
