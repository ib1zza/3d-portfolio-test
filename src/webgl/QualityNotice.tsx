"use client";

import { useState } from "react";

import { useQualityStore } from "./lib/quality-store";

import styles from "./QualityNotice.module.css";

/**
 * Автопонижение качества обязано быть обратимым. Без этого одна случайная
 * просадка FPS (свернули вкладку, отработал тяжёлый скрипт) навсегда лишает
 * пользователя 3D, и он даже не узнает почему.
 * См. plans/07-performance-mobile-a11y.md, раздел 2.2.
 */
export function QualityNotice() {
  const autoDowngrades = useQualityStore((s) => s.autoDowngrades);
  const tier = useQualityStore((s) => s.tier);
  const detectedTier = useQualityStore((s) => s.detectedTier);
  const pinned = useQualityStore((s) => s.pinned);
  const restore = useQualityStore((s) => s.restore);

  const [dismissed, setDismissed] = useState(false);

  const downgraded = !pinned && tier !== detectedTier && autoDowngrades > 0;
  if (!downgraded || dismissed) return null;

  return (
    <div className={styles.notice} role="status">
      <span>
        {tier === "flat"
          ? "Включён облегчённый режим без 3D."
          : "Качество графики понижено под ваше устройство."}
      </span>
      <button
        type="button"
        onClick={() => {
          restore();
          setDismissed(true);
        }}
      >
        Вернуть эффекты
      </button>
      <button type="button" onClick={() => setDismissed(true)} aria-label="Закрыть">
        ✕
      </button>
    </div>
  );
}
