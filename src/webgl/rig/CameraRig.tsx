"use client";

import { useFrame } from "@react-three/fiber";
import { damp, damp3 } from "maath/easing";
import { useRef } from "react";
import { PerspectiveCamera, Vector3 } from "three";

import { readScroll } from "@/src/motion/scroll-store";
import { adaptFovToAspect, fovAt, positionCurve, targetCurve } from "./camera-path";

// Временные объекты создаются один раз: аллокации в useFrame дают заметный GC-джиттер.
const desiredPosition = new Vector3();
const desiredTarget = new Vector3();
const smoothedTarget = new Vector3();
const scratch = { value: 0 };

/**
 * Камера, едущая по пути из camera-path по прогрессу скролла.
 *
 * Камера и указатель читаются из аргумента useFrame, а не из useThree:
 * значения из хуков считаются иммутабельными (правило react-hooks/immutability),
 * а R3F по своей природе требует мутации объектов сцены в кадре.
 *
 * Приоритет -1: камера обновляется до систем, которые от неё зависят.
 */
export function CameraRig() {
  const initialized = useRef(false);

  useFrame((state, delta) => {
    const scroll = readScroll();

    // Сглаживаем скорость один раз за кадр: все шейдеры получают уже
    // готовое значение и не дёргаются на дребезге ввода.
    scratch.value = scroll.smoothVelocity;
    damp(scratch, "value", scroll.velocity, 0.12, delta);
    scroll.smoothVelocity = scratch.value;

    const t = Math.min(Math.max(scroll.progress, 0), 1);

    positionCurve.getPoint(t, desiredPosition);
    targetCurve.getPoint(t, desiredTarget);

    // Параллакс от указателя. На тач-устройствах pointer остаётся в нуле,
    // поэтому отдельная ветка не нужна.
    desiredPosition.x += state.pointer.x * 0.25;
    desiredPosition.y += state.pointer.y * 0.18;

    // Первый кадр ставим камеру сразу: иначе виден «подлёт» из точки по умолчанию.
    const smoothing = initialized.current ? 0.35 : 0;
    initialized.current = true;

    const camera = state.camera;
    damp3(camera.position, desiredPosition, smoothing, delta);
    damp3(smoothedTarget, desiredTarget, smoothing, delta);
    camera.lookAt(smoothedTarget);

    if (camera instanceof PerspectiveCamera) {
      const aspect = state.size.width / Math.max(state.size.height, 1);
      const target = adaptFovToAspect(fovAt(t), aspect);
      scratch.value = camera.fov;
      damp(scratch, "value", target, 0.4, delta);
      if (Math.abs(scratch.value - camera.fov) > 0.001) {
        camera.fov = scratch.value;
        camera.updateProjectionMatrix();
      }
    }
  }, -1);

  return null;
}
