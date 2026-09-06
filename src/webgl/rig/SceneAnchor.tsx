"use client";

import { useFrame } from "@react-three/fiber";
import { damp3 } from "maath/easing";
import { useRef } from "react";
import { Vector3, type Group } from "three";

type Vec3 = [number, number, number];

/**
 * Переносит содержимое туда, где для него есть место.
 *
 * На широком экране текст занимает левую половину, и объём уходит вправо. На
 * вертикальном экране правой половины нет — там объём поднимается над текстом,
 * иначе он либо уезжает за кадр, либо ложится поверх заголовков.
 *
 * Позиция не выбирается один раз при монтировании: экран поворачивают и окно
 * меняют, и жёсткая ветка по первому кадру оставила бы объект за кадром до
 * перезагрузки. Переход сглажен, поэтому смена ориентации выглядит движением,
 * а не прыжком.
 */
export function SceneAnchor({
  wide,
  narrow,
  children,
}: {
  wide: Vec3;
  narrow: Vec3;
  children: React.ReactNode;
}) {
  const group = useRef<Group>(null);
  const desired = useRef(new Vector3());
  const initialized = useRef(false);

  useFrame((state, delta) => {
    if (!group.current) return;

    const aspect = state.size.width / Math.max(state.size.height, 1);
    desired.current.set(...(aspect < 1 ? narrow : wide));

    damp3(group.current.position, desired.current, initialized.current ? 0.4 : 0, delta);
    initialized.current = true;
  });

  return <group ref={group}>{children}</group>;
}
