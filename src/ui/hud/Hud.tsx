import Link from "next/link";

import { translate } from "@/src/content/i18n";
import type { Locale } from "@/src/content/types";
import { ThemeToggle } from "@/src/ui/theme/ThemeToggle";

import styles from "./Hud.module.css";

/**
 * HUD живёт вне потока документа и не участвует в переходах между страницами.
 * На этапе 0 здесь навигация и тема; позже добавятся индикатор секции,
 * переключатель качества и языка (plans/01-concept.md, раздел 4.4).
 */
export function Hud({ locale, name }: { locale: Locale; name: string }) {
  return (
    <header className={styles.hud}>
      <Link href="/" className={styles.brand}>
        <span className={styles.mark} aria-hidden="true" />
        <span className={styles.name}>{name}</span>
      </Link>

      <nav className={styles.nav} aria-label={translate(locale, "nav.work")}>
        <Link href="/work" className={styles.link}>
          {translate(locale, "nav.work")}
        </Link>
        <Link href="/resume" className={styles.link}>
          {translate(locale, "nav.resume")}
        </Link>
        <a href="#contacts" className={styles.link}>
          {translate(locale, "nav.contacts")}
        </a>
        <ThemeToggle label={translate(locale, "hud.theme")} />
      </nav>
    </header>
  );
}
