"use client";

import { useFrame } from "@react-three/fiber";
import { damp } from "maath/easing";
import { useMemo, useRef } from "react";
import { Color, Object3D, type Group, type InstancedMesh } from "three";

import { readHovered } from "@/src/motion/hover-store";
import { readScroll } from "@/src/motion/scroll-store";
import { sectionFocus } from "@/src/motion/section-registry";
import { useQualityStore } from "@/src/webgl/lib/quality-store";
import { SceneAnchor } from "@/src/webgl/rig/SceneAnchor";

/**
 * Сцена секции «Работы» — поле кубов, идущее волной.
 *
 * Одна InstancedMesh на всё поле: 144 отдельных меша дали бы 144 draw call и
 * столько же обходов графа сцены за кадр, тогда как инстансинг рисует их
 * одним вызовом, а за кадр меняются только матрицы.
 *
 * Волна привязана к скорости скролла: поле спокойно, пока читают список
 * проектов, и вздымается на быстрой прокрутке. Так объём отвечает на действие
 * пользователя, а не крутится сам по себе.
 */
const SIDE_BY_TIER = { ultra: 14, high: 12, medium: 8, flat: 0 } as const;

const STEP = 0.42;
const CUBE = 0.2;

/** Поле уходит вправо и вглубь: слева идёт колонка со списком проектов. */
const WIDE: [number, number, number] = [2.4, -0.6, -2.2];
const NARROW: [number, number, number] = [0.2, 1.4, -3.4];

const scratch = new Object3D();
const tint = new Color();
const COOL = new Color("#5a4bff");
const WARM = new Color("#ff3da6");

export function WorkWave() {
  const tier = useQualityStore((s) => s.tier);
  const side = SIDE_BY_TIER[tier];
  const count = side * side;

  const group = useRef<Group>(null);
  const mesh = useRef<InstancedMesh>(null);

  // Цвет инстанса не меняется в кадре, поэтому раскрашиваем один раз при
  // изменении размера поля, а не каждый кадр вместе с матрицами.
  const colors = useMemo(() => {
    const array = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const row = Math.floor(i / side);
      tint.copy(COOL).lerp(WARM, row / Math.max(side - 1, 1));
      array[i * 3] = tint.r;
      array[i * 3 + 1] = tint.g;
      array[i * 3 + 2] = tint.b;
    }
    return array;
  }, [count, side]);

  useFrame((state, delta) => {
    if (!group.current || !mesh.current) return;

    const focus = sectionFocus("work");
    const scale = { value: group.current.scale.x };
    damp(scale, "value", Math.max(focus, 0.001), 0.3, delta);
    group.current.scale.setScalar(scale.value);
    group.current.visible = scale.value > 0.01;
    if (!group.current.visible) return;

    const { smoothVelocity } = readScroll();
    const time = state.clock.elapsedTime;
    const hoveringWork = readHovered()?.startsWith("work:") ?? false;
    const amplitude =
      0.28 + Math.min(Math.abs(smoothVelocity), 1) * 0.75 + (hoveringWork ? 0.55 : 0);
    const offset = (side - 1) / 2;

    for (let i = 0; i < count; i++) {
      const col = i % side;
      const row = Math.floor(i / side);
      const x = (col - offset) * STEP;
      const z = (row - offset) * STEP;

      // Расстояние от центра, а не сумма координат: волна расходится кругами
      // и читается как отклик поля, а не как бегущая по диагонали строка.
      const distance = Math.hypot(x, z);
      const y = Math.sin(distance * 2.6 - time * 1.6) * amplitude;

      scratch.position.set(x, y, z);
      scratch.rotation.set(y * 0.6, time * 0.1, 0);
      scratch.scale.setScalar(1 + y * 0.35);
      scratch.updateMatrix();
      mesh.current.setMatrixAt(i, scratch.matrix);
    }

    mesh.current.instanceMatrix.needsUpdate = true;
    group.current.rotation.y = -0.35 + state.pointer.x * 0.12;
    group.current.rotation.x = 0.18 + state.pointer.y * 0.08;
  });

  if (count === 0) return null;

  return (
    <SceneAnchor wide={WIDE} narrow={NARROW}>
      <group ref={group} scale={0.001}>
        <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
          <boxGeometry args={[CUBE, CUBE, CUBE]}>
            <instancedBufferAttribute attach="attributes-color" args={[colors, 3]} />
          </boxGeometry>
          <meshStandardMaterial vertexColors roughness={0.25} metalness={0.6} />
        </instancedMesh>
      </group>
    </SceneAnchor>
  );
}
