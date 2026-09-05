"use client";

import { useThree } from "@react-three/fiber";
import { useEffect } from "react";

/**
 * Потеря WebGL-контекста случается чаще, чем кажется: переключение вкладок на
 * слабой машине, спящий режим, смена дискретной и встроенной видеокарты на
 * ноутбуке. Без обработки пользователь видит белый прямоугольник.
 * См. plans/07-performance-mobile-a11y.md, раздел 5.
 */
export function ContextLossGuard({ onLost }: { onLost: () => void }) {
  const gl = useThree((state) => state.gl);

  useEffect(() => {
    const canvas = gl.domElement;

    const handleLost = (event: Event) => {
      // preventDefault обязателен: иначе браузер не станет восстанавливать контекст.
      event.preventDefault();
      onLost();
    };

    canvas.addEventListener("webglcontextlost", handleLost);
    return () => canvas.removeEventListener("webglcontextlost", handleLost);
  }, [gl, onLost]);

  return null;
}
