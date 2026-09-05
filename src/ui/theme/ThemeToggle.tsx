"use client";

import { useSyncExternalStore } from "react";

import styles from "./ThemeToggle.module.css";

type Theme = "light" | "dark";

const STORAGE_KEY = "matter-theme";

/**
 * Источник правды по теме — атрибут data-theme на <html>, который ThemeScript
 * ставит ещё до гидратации. React подписывается на него как на внешнюю систему,
 * поэтому нет ни setState в эффекте, ни рассинхрона с SSR.
 *
 * На этапе 0 переключатель меняет только CSS-переменные. Когда появится
 * WebGL-слой, сюда же приедет интерполяция HDRI, экспозиции и материалов
 * (plans/05-shaders-and-effects.md, раздел 14).
 */
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => observer.disconnect();
}

function getSnapshot(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function getServerSnapshot(): Theme {
  return "light";
}

export function ThemeToggle({ label }: { label: string }) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // приватный режим — просто не запоминаем выбор
    }
  }

  return (
    <button
      type="button"
      className={styles.toggle}
      onClick={toggle}
      aria-label={label}
      aria-pressed={theme === "dark"}
    >
      <span className={styles.icon} aria-hidden="true" />
    </button>
  );
}
