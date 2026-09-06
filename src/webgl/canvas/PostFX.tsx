"use client";

import {
  Bloom,
  ChromaticAberration,
  EffectComposer,
  Noise,
  Vignette,
} from "@react-three/postprocessing";
import { useFrame } from "@react-three/fiber";
import { BlendFunction, type ChromaticAberrationEffect } from "postprocessing";
import { useRef } from "react";
import { Vector2 } from "three";

import { readScroll } from "@/src/motion/scroll-store";
import { useQualityStore } from "@/src/webgl/lib/quality-store";

/** Стартовое смещение: дальше эффект двигает скролл, см. ScrollAberration. */
const ZERO_OFFSET = new Vector2(0, 0);

/**
 * Постобработка кадра. Спецификация приёмов: plans/05-shaders-and-effects.md,
 * состав по тирам: plans/07-performance-mobile-a11y.md.
 *
 * Собирается из тира, а не включается целиком: композер добавляет проходы
 * полноэкранного размера, и на слабой графике их цена заметнее, чем сами
 * модели. На `flat` компонент не рендерится вообще — там нет и Canvas.
 */
export function PostFX() {
  const postfx = useQualityStore((s) => s.profile.postfx);
  const enabled = postfx.bloom || postfx.chromatic || postfx.noise;

  if (!enabled) return null;

  return (
    // multisampling выключен: композер и без него делает свой проход
    // сглаживания, а MSAA на цели композера удваивает трафик памяти.
    <EffectComposer multisampling={0} enableNormalPass={false}>
      {postfx.bloom ? (
        <Bloom
          // Порог выше единицы: светится только то, что мы сами вывели за
          // пределы диапазона (эмиссия, блики), а не вся светлая половина
          // кадра. На светлой палитре низкий порог заливает экран молоком.
          luminanceThreshold={1.1}
          luminanceSmoothing={0.25}
          intensity={0.45}
          mipmapBlur
        />
      ) : (
        <></>
      )}

      {postfx.chromatic ? <ScrollAberration /> : <></>}

      {postfx.noise ? (
        // Зерно даёт материальность и заодно прячет полосы на градиентах:
        // 8 бит на канал не хватает, чтобы плавный переход остался плавным.
        <Noise premultiply blendFunction={BlendFunction.OVERLAY} opacity={0.35} />
      ) : (
        <></>
      )}

      {/* Виньетка мягкая: на светлой палитре тёмные углы читаются как грязь,
          её задача только собрать взгляд к центру кадра. */}
      <Vignette offset={0.4} darkness={0.18} blendFunction={BlendFunction.NORMAL} />
    </EffectComposer>
  );
}

/**
 * Хроматическая аберрация по скорости скролла: в покое её нет, на разгоне
 * каналы расходятся. Постоянная аберрация читается как расфокус монитора,
 * а привязанная к движению — как инерция оптики.
 */
function ScrollAberration() {
  // Мутируем сам эффект через ref, а не пересоздаём вектор в пропсе: смена
  // пропа на каждый кадр заставила бы React перерисовывать композер, а
  // постпроцессинг пересобирает шейдеры при изменении набора проходов.
  const effect = useRef<ChromaticAberrationEffect>(null);

  useFrame(() => {
    if (!effect.current) return;

    const { smoothVelocity } = readScroll();
    // Смещение по вертикали больше, чем по горизонтали: скролл вертикальный,
    // и растяжение должно идти вдоль движения.
    const magnitude = Math.min(Math.abs(smoothVelocity), 1) * 0.0022;
    effect.current.offset.set(magnitude * 0.4, magnitude);
  });

  return (
    <ChromaticAberration
      ref={effect}
      offset={ZERO_OFFSET}
      radialModulation
      modulationOffset={0.3}
      blendFunction={BlendFunction.NORMAL}
    />
  );
}
