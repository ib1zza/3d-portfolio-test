"use client";
import type { Locale } from "@/src/content/types";
import { useQualityStore } from "@/src/webgl/lib/quality-store";
import styles from "./Hud.module.css";

export function GraphicsSettings({ locale }: { locale: Locale }) {
  const tier = useQualityStore((s) => s.tier);
  const setTier = useQualityStore((s) => s.setTier);
  return (
    <details className={styles.settings}>
      <summary aria-label={locale === "ru" ? "Настройки графики" : "Graphics settings"}>
        ···
      </summary>
      <div>
        <label htmlFor="graphics-quality">
          {locale === "ru" ? "Графика" : "Graphics"}
        </label>
        <select
          id="graphics-quality"
          value={tier === "ultra" ? "high" : tier}
          onChange={(e) => setTier(e.target.value as "high" | "medium" | "flat")}
        >
          <option value="high">{locale === "ru" ? "Полная" : "Full"}</option>
          <option value="medium">{locale === "ru" ? "Лёгкая" : "Light"}</option>
          <option value="flat">{locale === "ru" ? "Статичная" : "Static"}</option>
        </select>
      </div>
    </details>
  );
}
