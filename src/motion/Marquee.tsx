"use client";

import type { CSSProperties, ReactNode } from "react";

import styles from "./Marquee.module.css";

/**
 * Бегущая строка. Две одинаковые копии дорожки едут влево на свою ширину:
 * когда первая уходит из кадра, вторая уже стоит на её месте, поэтому цикл
 * незаметен. Копия одна, а не десять, потому что дорожка сама по себе шире
 * экрана — содержимое повторяется внутри неё.
 *
 * Скорость задаётся временем прохода, а не пикселями в секунду: строка разной
 * длины на разных языках при фиксированной скорости давала бы разное время
 * цикла, и две строки рядом расходились бы по ритму.
 */
export function Marquee({
  children,
  duration = 30,
  reverse = false,
  gap,
  className,
  label,
}: {
  children: ReactNode;
  /** Время полного прохода, с. */
  duration?: number;
  reverse?: boolean;
  gap?: string;
  className?: string;
  /** Что прочитает скринридер вместо бегущего текста. */
  label?: string;
}) {
  const style = { "--duration": `${duration}s`, ...(gap ? { "--gap": gap } : {}) };

  return (
    <div
      className={[styles.marquee, reverse ? styles.reverse : "", className]
        .filter(Boolean)
        .join(" ")}
      style={style as CSSProperties}
      role="marquee"
      aria-label={label}
    >
      <div className={styles.track}>{children}</div>
      {/* Вторая копия только для картинки: скринридер прочитал бы список
          дважды, поэтому она скрыта от дерева доступности. */}
      <div className={styles.track} aria-hidden="true">
        {children}
      </div>
    </div>
  );
}
