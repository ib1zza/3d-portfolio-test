import Link from "next/link";
import type { Locale } from "@/src/content/types";
import { switchLocale } from "@/src/lib/locale-actions";
import { GraphicsSettings } from "./GraphicsSettings";
import { HudBrand, HudWorkLink } from "./HudLinks";
import styles from "./Hud.module.css";

export function Hud({ locale, name }: { locale: Locale; name: string }) {
  const ru = locale === "ru";
  return (
    <header className={styles.hud}>
      <HudBrand
        name={name}
        className={styles.brand}
        markClass={styles.mark}
        nameClass={styles.name}
      />
      <nav
        className={styles.nav}
        aria-label={ru ? "Главная навигация" : "Main navigation"}
      >
        <HudWorkLink href="/#work" className={styles.link}>
          {ru ? "Работы" : "Work"}
        </HudWorkLink>
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
