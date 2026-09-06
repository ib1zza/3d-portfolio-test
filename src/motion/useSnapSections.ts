"use client";

import Snap from "lenis/snap";
import { useEffect, type RefObject } from "react";

import { useQualityStore } from "@/src/webgl/lib/quality-store";
import { onLenis } from "./lenis-instance";

/**
 * Прилипание скролла к экранам внутри контейнера: один проект — один кадр.
 *
 * Через модуль Snap из Lenis, а не через CSS `scroll-snap-type`: CSS-прилипание
 * работает по нативной позиции скролла, а Lenis анимирует её сам, и браузер
 * начинает бороться с библиотекой за одну и ту же величину — скролл дёргается
 * и залипает. Пока сглаживание включено, прилипать должно то же, что скроллит.
 *
 * Отсюда же следует поведение в отключённых режимах: при reduced motion и на
 * `flat` Lenis не создаётся, прилипания нет, и это верно по сути — навязанная
 * прокрутка экранами противоречит просьбе уменьшить движение.
 */
export function useSnapSections(container: RefObject<HTMLElement | null>) {
  const reducedMotion = useQualityStore((s) => s.device?.reducedMotion ?? false);

  useEffect(() => {
    if (reducedMotion) return;

    const el = container.current;
    if (!el) return;

    let snap: Snap | null = null;

    // Lenis пересоздаётся при смене тира, поэтому подписка живёт всё время
    // жизни хука, а Snap — только вместе с конкретным экземпляром.
    const unsubscribe = onLenis((lenis) => {
      snap?.destroy();
      snap = null;
      if (!lenis) return;

      snap = new Snap(lenis, {
        type: "mandatory",
        duration: 0.9,
        easing: (t: number) => 1 - Math.pow(1 - t, 3),
      });

      // Дети контейнера, а не сам контейнер: прилипаем к каждому экрану.
      const slides = Array.from(el.children).filter(
        (child): child is HTMLElement => child instanceof HTMLElement,
      );
      snap.addElements(slides, { align: "start" });
    });

    return () => {
      unsubscribe();
      snap?.destroy();
    };
  }, [container, reducedMotion]);
}
