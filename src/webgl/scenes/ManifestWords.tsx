"use client";

import { Float, Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { damp } from "maath/easing";
import { useRef, useState } from "react";
import type { Group } from "three";

import { sectionFocus } from "@/src/motion/section-registry";
import { SceneAnchor } from "@/src/webgl/rig/SceneAnchor";

/**
 * Сцена 02 — манифест. Технологии, на которых написан сайт, висят в воздухе
 * рядом с текстом манифеста и реагируют на курсор.
 * См. plans/04-scenes.md, сцена 02.
 *
 * Слова латиницей не случайно: подключён латинский срез Unbounded, кириллицы
 * в нём нет. Русский текст остаётся в DOM, где он доступен скринридерам и
 * поиску, а в 3D уходят только названия технологий.
 *
 * Шрифт свой, локальный: troika по умолчанию тянет Roboto с
 * fonts.gstatic.com, и при недоступном CDN текст молча не появляется.
 */
const FONT = "/fonts/unbounded-latin-700.woff";

/**
 * Позиции смещены вправо и вглубь: колонка текста занимает левую половину
 * экрана, и слова, попадающие на неё, ломают читаемость. Отрицательный z
 * уводит их за плоскость контента, где они читаются как фон, а не как
 * соперник за внимание.
 */
const WORDS = [
  { text: "React", position: [1.9, 1.4, -1.8], color: "#5a4bff" },
  { text: "Nuxt", position: [3.4, 0.2, -2.6], color: "#34e0c0" },
  { text: "TypeScript", position: [2.4, -1.5, -2.0], color: "#ffb347" },
  { text: "Shaders", position: [3.9, -2.4, -3.2], color: "#ff3da6" },
] as const;

export function ManifestWords() {
  const group = useRef<Group>(null);

  useFrame((_, delta) => {
    if (!group.current) return;

    // Слова появляются, только пока секция манифеста в кадре.
    const focus = sectionFocus("manifest");
    const scale = { value: group.current.scale.x };
    damp(scale, "value", Math.max(focus, 0.001), 0.3, delta);
    group.current.scale.setScalar(scale.value);
    group.current.visible = scale.value > 0.01;
  });

  return (
    // Слова стоят справа от колонки текста; на вертикальном экране якорь
    // сдвигает всю группу влево и вверх, где для них есть место.
    <SceneAnchor wide={[0, 0, 0]} narrow={[-1.9, 1.1, -1]}>
      <group ref={group} scale={0.001}>
        {WORDS.map((word) => (
          <Word key={word.text} {...word} />
        ))}
      </group>
    </SceneAnchor>
  );
}

function Word({
  text,
  position,
  color,
}: {
  text: string;
  position: readonly [number, number, number];
  color: string;
}) {
  const [hovered, setHovered] = useState(false);
  const ref = useRef<Group>(null);

  useFrame((state, delta) => {
    if (!ref.current) return;
    // Слово поворачивается к камере, но не полностью: полный billboard читается
    // как плоская наклейка и убивает ощущение объёма.
    const target = state.pointer.x * 0.35;
    const rot = { value: ref.current.rotation.y };
    damp(rot, "value", target, 0.4, delta);
    ref.current.rotation.y = rot.value;

    const scale = { value: ref.current.scale.x };
    damp(scale, "value", hovered ? 1.18 : 1, 0.2, delta);
    ref.current.scale.setScalar(scale.value);
  });

  return (
    <Float speed={1.4} rotationIntensity={0.25} floatIntensity={0.5}>
      <group ref={ref} position={[...position]}>
        <Text
          font={FONT}
          fontSize={0.42}
          color={hovered ? color : "#3a3a46"}
          anchorX="center"
          anchorY="middle"
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          {text}
        </Text>
      </group>
    </Float>
  );
}
