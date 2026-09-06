"use client";

import { useFrame } from "@react-three/fiber";
import { damp, damp3 } from "maath/easing";
import { useRef } from "react";
import { PerspectiveCamera, Vector3 } from "three";

import type { Vec3 } from "@/src/content/types";

/**
 * Фиксированная поза камеры с параллаксом от указателя.
 *
 * Нужна страницам, у которых кадр стоит на месте, а движется содержимое:
 * витрина проектов и мир проекта. Камера при этом остаётся общей (та же, что
 * у главной), поэтому при переходе она доезжает до новой позы, а не
 * перескакивает — сцена не пересоздаётся, и разрыв был бы заметен.
 *
 * Приоритет -1, как у CameraRig: камера обновляется раньше тех, кто от неё
 * зависит. Одновременно с CameraRig не монтируется — обе владеют камерой.
 */
export function CameraPose({
  position,
  target = [0, 0, 0],
  fov = 34,
  parallax = 0.3,
}: {
  position: Vec3;
  target?: Vec3;
  fov?: number;
  parallax?: number;
}) {
  // Векторы живут между кадрами: аллокация на кадр даёт заметный джиттер GC.
  // Именно ref, а не useMemo: значение из useMemo React Compiler считает
  // иммутабельным, а ref мутировать внутри useFrame можно.
  const scratch = useRef({
    desired: new Vector3(),
    target: new Vector3(),
    smoothed: new Vector3(),
    fov: { value: fov },
  });

  useFrame((state, delta) => {
    const { desired, smoothed } = scratch.current;

    desired.set(...position);
    desired.x += state.pointer.x * parallax;
    desired.y += state.pointer.y * parallax * 0.7;

    scratch.current.target.set(...target);

    damp3(state.camera.position, desired, 0.4, delta);
    damp3(smoothed, scratch.current.target, 0.4, delta);
    state.camera.lookAt(smoothed);

    if (state.camera instanceof PerspectiveCamera) {
      // Вертикальный fov на узком экране режет кадр по бокам, поэтому на
      // портретных пропорциях его расширяем — иначе модель не влезает.
      const aspect = state.size.width / Math.max(state.size.height, 1);
      const desiredFov = aspect < 1 ? fov / Math.max(aspect, 0.5) : fov;

      const smoothFov = scratch.current.fov;
      smoothFov.value = state.camera.fov;
      damp(smoothFov, "value", desiredFov, 0.4, delta);
      if (Math.abs(smoothFov.value - state.camera.fov) > 0.001) {
        state.camera.fov = smoothFov.value;
        state.camera.updateProjectionMatrix();
      }
    }
  }, -1);

  return null;
}
