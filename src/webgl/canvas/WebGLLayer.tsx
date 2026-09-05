"use client";

import { AdaptiveDpr, Preload, View } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useCallback, useState } from "react";

import { useQualityStore } from "@/src/webgl/lib/quality-store";
import { CameraRig } from "@/src/webgl/rig/CameraRig";
import { SceneTunnel } from "@/src/webgl/tunnel";
import { ContextLossGuard } from "./ContextLossGuard";
import { PerformanceGovernor } from "./PerformanceGovernor";
import { ScaffoldScene } from "./ScaffoldScene";

import styles from "./WebGLLayer.module.css";

/**
 * Единственный Canvas приложения. Живёт в корневом layout, поэтому смена
 * роута не пересоздаёт WebGL-контекст и сцена не моргает при переходах.
 * См. plans/02-architecture.md, раздел 3.
 */
export function WebGLLayer() {
  const profile = useQualityStore((s) => s.profile);
  const ready = useQualityStore((s) => s.ready);

  const [contextLost, setContextLost] = useState(false);

  const handleContextLost = useCallback(() => setContextLost(true), []);

  if (!ready || profile.tier === "flat") return null;

  if (contextLost) {
    return (
      <div className={styles.lost} role="status">
        <p>Графика приостановлена браузером.</p>
        <button type="button" onClick={() => window.location.reload()}>
          Восстановить
        </button>
      </div>
    );
  }

  // Компонент грузится через dynamic(..., { ssr: false }), поэтому рендерится
  // только на клиенте и document доступен уже на первом рендере.
  // События берём с body, чтобы 3D реагировало на курсор над HTML-контентом.
  const eventSource = typeof document === "undefined" ? undefined : document.body;

  return (
    <div className={styles.layer} aria-hidden="true">
      <Canvas
        className={styles.canvas}
        dpr={[1, profile.maxDpr]}
        gl={{ antialias: false, powerPreference: "high-performance", alpha: true }}
        camera={{ position: [0, 0, 9], fov: 38, near: 0.1, far: 100 }}
        eventSource={eventSource}
        eventPrefix="client"
        shadows={profile.shadows}
      >
        <ContextLossGuard onLost={handleContextLost} />

        <PerformanceGovernor />
        <AdaptiveDpr pixelated={false} />

        <CameraRig />

        {/* Заготовка сцены: заменяется реальными сценами на этапах 3–5. */}
        <ScaffoldScene />

        {/* Полноэкранные сцены, объявленные страницами. */}
        <SceneTunnel.Out />

        {/* Локальные «окна» в 3D, привязанные к DOM-блокам. */}
        <View.Port />

        <Preload all />
      </Canvas>
    </div>
  );
}
