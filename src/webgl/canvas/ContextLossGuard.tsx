"use client";

import { useThree } from "@react-three/fiber";
import { useEffect } from "react";

/**
 * Потеря WebGL-контекста случается чаще, чем кажется: переключение вкладок на
 * слабой машине, спящий режим, смена дискретной и встроенной видеокарты на
 * ноутбуке. Без обработки пользователь видит белый прямоугольник.
 * См. plans/07-performance-mobile-a11y.md, раздел 5.
 *
 * Тонкость, на которой легко обжечься: при размонтировании R3F сам вызывает
 * gl.forceContextLoss(), и это тоже поднимает webglcontextlost. То есть
 * плановый снос сцены выглядит для обработчика точно как авария. В dev это
 * срабатывает на каждой загрузке из-за StrictMode (mount → unmount → mount),
 * в проде — на любом ремоунте.
 *
 * Отличаем по признаку: настоящая потеря происходит на canvas, который всё
 * ещё в документе и чей компонент всё ещё смонтирован.
 */
export function ContextLossGuard({
  onLost,
  onRestored,
}: {
  onLost: () => void;
  onRestored: () => void;
}) {
  const gl = useThree((state) => state.gl);
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    const canvas = gl.domElement;
    let mounted = true;

    const handleLost = (event: Event) => {
      // preventDefault обязателен: иначе браузер не станет восстанавливать контекст.
      event.preventDefault();

      if (process.env.NODE_ENV !== "production") {
        const status = (event as WebGLContextEvent).statusMessage;
        console.warn(
          `[webgl] contextlost: status="${status}" mounted=${mounted} ` +
            `connected=${canvas.isConnected}`,
        );
      }

      // Проверку откладываем на следующий тик: к этому моменту размонтирование,
      // если оно идёт, уже успело выставить mounted = false и вынуть canvas.
      setTimeout(() => {
        if (mounted && canvas.isConnected) onLost();
      }, 0);
    };

    // three переинициализирует свои ресурсы сам, от нас нужно только снять
    // плашку и запросить кадр: при frameloop по требованию рендер иначе
    // не возобновится.
    const handleRestored = () => {
      if (!mounted) return;
      onRestored();
      invalidate();
    };

    canvas.addEventListener("webglcontextlost", handleLost);
    canvas.addEventListener("webglcontextrestored", handleRestored);
    return () => {
      mounted = false;
      canvas.removeEventListener("webglcontextlost", handleLost);
      canvas.removeEventListener("webglcontextrestored", handleRestored);
    };
  }, [gl, invalidate, onLost, onRestored]);

  return null;
}
