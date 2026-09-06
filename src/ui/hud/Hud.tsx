import Link from "next/link";
import type { Locale } from "@/src/content/types";
import { switchLocale } from "@/src/lib/locale-actions";
import { GraphicsSettings } from "./GraphicsSettings";
import styles from "./Hud.module.css";

export function Hud({ locale, name }: { locale: Locale; name: string }) {
  const ru = locale === "ru";
  return (
    <header className={styles.hud}>
      <Link href="/" className={styles.brand} aria-label={name}>
        <span className={styles.mark} aria-hidden="true">
          мп.
        </span>
        <span className={styles.name}>{name}</span>
      </Link>
      <nav
        className={styles.nav}
        aria-label={ru ? "Главная навигация" : "Main navigation"}
      >
        <Link href="/#work" className={styles.link}>
          {ru ? "Работы" : "Work"}
        </Link>
        <Link href="/#about" className={styles.link}>
          {ru ? "Обо мне" : "About"}
        </Link>
        <Link href="/#contacts" className={styles.link}>
          {ru ? "Контакт" : "Contact"}
        </Link>
        <form action={switchLocale}>
          <input type="hidden" name="locale" value={ru ? "en" : "ru"} />
          <button
            className={styles.language}
            aria-label={ru ? "Switch to English" : "Переключить на русский"}
          >
            {ru ? "EN" : "RU"}
          </button>
        </form>
        <GraphicsSettings locale={locale} />
      </nav>
    </header>
  );
}
