"use client";

import { addEffect } from "@react-three/fiber";
import Lenis from "lenis";
import { useEffect } from "react";

import { useQualityStore } from "@/src/webgl/lib/quality-store";
import { setLenis } from "./lenis-instance";
import { writeScroll } from "./scroll-store";

/** Скорость Lenis приходит в px/кадр; делитель подобран так, чтобы 1.0 ≈ быстрый флик. */
const VELOCITY_SCALE = 40;

/**
 * Lenis встроен в цикл рендера R3F через addEffect, а не поднимает свой
 * requestAnimationFrame: два независимых цикла дают рассинхрон DOM и WebGL
 * на один кадр, и это видно как дрожание закреплённых к скроллу объектов.
 * См. plans/03-motion-scroll-transitions.md, раздел 1.1.
 */
export function SmoothScroll() {
  const tier = useQualityStore((s) => s.tier);
  const reducedMotion = useQualityStore((s) => s.device?.reducedMotion ?? false);
  const isMobile = useQualityStore((s) => s.device?.isMobile ?? false);

  useEffect(() => {
    // На слабых устройствах и при reduced motion родной скролл честнее:
    // сглаживание там ощущается ватным, а не плавным.
    const disabled = reducedMotion || tier === "flat" || (isMobile && tier === "medium");

    if (disabled) {
      const onScroll = () => {
        const limit = document.documentElement.scrollHeight - window.innerHeight;
        writeScroll({
          scrollY: window.scrollY,
          limit,
          progress: limit > 0 ? window.scrollY / limit : 0,
        });
      };
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
      return () => window.removeEventListener("scroll", onScroll);
    }

    const lenis = new Lenis({
      autoRaf: false,
      duration: 1.1,
      easing: (t: number) => 1 - Math.pow(1 - t, 3),
      syncTouch: isMobile,
      gestureOrientation: "vertical",
    });

    lenis.on("scroll", (e: Lenis) => {
      const limit = e.limit || 1;
      writeScroll({
        scrollY: e.scroll,
        limit,
        progress: e.scroll / limit,
        velocity: Math.max(-1, Math.min(1, e.velocity / VELOCITY_SCALE)),
        direction: e.direction === -1 ? -1 : 1,
      });
    });

    setLenis(lenis);

    let lastFiberTick = 0;

    const stop = addEffect((time: number) => {
      lastFiberTick = time;
      lenis.raf(time);
    });

    // Сторожевой цикл: addEffect тикает только пока смонтирован Canvas.
    // Если WebGL-слой не поднялся или упал, без этого страница перестанет
    // скроллиться вообще — самый неприятный из возможных отказов.
    let watchdog = 0;
    const tickWatchdog = (time: number) => {
      if (time - lastFiberTick > 200) lenis.raf(time);
      watchdog = requestAnimationFrame(tickWatchdog);
    };
    watchdog = requestAnimationFrame(tickWatchdog);

    return () => {
      stop();
      cancelAnimationFrame(watchdog);
      setLenis(null);
      lenis.destroy();
    };
  }, [tier, reducedMotion, isMobile]);

  return null;
}
