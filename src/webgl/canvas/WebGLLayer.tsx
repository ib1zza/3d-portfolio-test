"use client";

import { AdaptiveDpr, Preload } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { usePathname } from "next/navigation";
import { useCallback, useState } from "react";

import { useQualityStore } from "@/src/webgl/lib/quality-store";
import { SceneTunnel } from "@/src/webgl/tunnel";
import { ContextLossGuard } from "./ContextLossGuard";
import { PerformanceGovernor } from "./PerformanceGovernor";
import { PostFX } from "./PostFX";

import styles from "./WebGLLayer.module.css";

/**
 * Единственный Canvas приложения. Живёт в корневом layout, поэтому смена
 * роута не пересоздаёт WebGL-контекст и сцена не моргает при переходах.
 * См. plans/02-architecture.md, раздел 3.
 */
export function WebGLLayer() {
  const pathname = usePathname();
  const profile = useQualityStore((s) => s.profile);
  const ready = useQualityStore((s) => s.ready);

  const [contextLost, setContextLost] = useState(false);

  const handleContextLost = useCallback(() => {
    delete document.documentElement.dataset.tensionReady;
    setContextLost(true);
  }, []);
  const handleContextRestored = useCallback(() => setContextLost(false), []);

  if (!ready || profile.tier === "flat") return null;

  // Компонент грузится через dynamic(..., { ssr: false }), поэтому рендерится
  // только на клиенте и document доступен уже на первом рендере.
  // События берём с body, чтобы 3D реагировало на курсор над HTML-контентом.
  const eventSource = typeof document === "undefined" ? undefined : document.body;

  return (
    <div className={styles.layer} aria-hidden="true">
      <Canvas
        className={styles.canvas}
        frameloop={pathname === "/" ? "demand" : "always"}
        dpr={[1, profile.maxDpr]}
        gl={{ antialias: true, powerPreference: "high-performance", alpha: true }}
        camera={{ position: [0, 0, 9], fov: 38, near: 0.1, far: 100 }}
        eventSource={eventSource}
        eventPrefix="client"
        shadows={profile.shadows}
      >
        <ContextLossGuard onLost={handleContextLost} onRestored={handleContextRestored} />

        {pathname !== "/" && <PerformanceGovernor />}
        <AdaptiveDpr pixelated={false} />

        {/* Полноэкранные сцены, объявленные страницами. Камеру ставит сама
            сцена: путь по скроллу нужен главной, а витрине и миру проекта
            нужна своя поза, и общий риг здесь только мешал бы. */}
        <SceneTunnel.Out />

        {pathname !== "/" && <PostFX />}

        <Preload all />
      </Canvas>

      {/* Плашка рисуется поверх Canvas, а не вместо него. Размонтировать
          canvas при потере контекста нельзя: событие webglcontextrestored
          приходит именно на него, и снятый со страницы canvas уже никогда
          не восстановится — пользователь останется без графики до
          перезагрузки. */}
      {contextLost && (
        <div className={styles.lost} role="status" aria-hidden={false}>
          <p>Графика приостановлена браузером и скоро вернётся.</p>
          <button type="button" onClick={() => window.location.reload()}>
            Перезагрузить
          </button>
        </div>
      )}
    </div>
  );
}
