"use client";

import { PerformanceMonitor } from "@react-three/drei";
import { useCallback, useEffect, useRef } from "react";

import { AUTO_DOWNGRADE_FLOOR } from "@/src/webgl/lib/quality";
import { useQualityStore } from "@/src/webgl/lib/quality-store";

/**
 * Первые секунды после монтирования FPS всегда занижен: идут гидратация,
 * компиляция шейдеров, загрузка шрифтов. Без прогрева PerformanceMonitor
 * почти гарантированно роняет качество на ровном месте.
 */
const WARMUP_MS = 2500;

export function PerformanceGovernor() {
  const downgrade = useQualityStore((s) => s.downgrade);
  const setTier = useQualityStore((s) => s.setTier);
  const warm = useRef(false);

  useEffect(() => {
    const id = window.setTimeout(() => {
      warm.current = true;
    }, WARMUP_MS);
    return () => window.clearTimeout(id);
  }, []);

  const handleDecline = useCallback(() => {
    if (warm.current) downgrade();
  }, [downgrade]);

  // pin = false: это решение движка, а не пользователя, и его можно отменить
  // кнопкой «Вернуть эффекты» — см. QualityNotice.
  //
  // Опускаемся до пола автопонижения, а не до flat: flat снимает WebGL со
  // страницы без возможности вернуть его без перезагрузки.
  const handleFallback = useCallback(() => {
    if (warm.current) setTier(AUTO_DOWNGRADE_FLOOR, false);
  }, [setTier]);

  return (
    <PerformanceMonitor
      // Нижняя граница намеренно низкая: встроенная графика и неактивная
      // вкладка легко дают 40 кадров, и на этом основании ломать сцену нельзя.
      bounds={() => [30, 55]}
      flipflops={4}
      onDecline={handleDecline}
      onFallback={handleFallback}
    />
  );
}
