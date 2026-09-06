"use client";

import type { CSSProperties } from "react";

import { useInView } from "@/src/motion/useInView";

import styles from "./Draw.module.css";

/**
 * Линия, прочерчивающаяся при входе в кадр. Заменяет border-top у секций:
 * статичная линейка просто есть, прочерченная — сообщает, что секция началась.
 *
 * pathLength="1" нормирует длину контура: dasharray и dashoffset в CSS
 * работают в долях, и одна и та же анимация годится для любой геометрии.
 */
export function DrawLine({
  className,
  delay = 0,
  width = 2,
}: {
  className?: string;
  delay?: number;
  width?: number;
}) {
  const [inView, ref] = useInView();

  return (
    <svg
      ref={ref}
      className={[className, inView ? styles.in : ""].filter(Boolean).join(" ")}
      viewBox="0 0 100 2"
      preserveAspectRatio="none"
      aria-hidden="true"
      style={{ "--delay": `${delay}ms` } as CSSProperties}
    >
      <path className={styles.path} pathLength={1} strokeWidth={width} d="M0 1 H100" />
    </svg>
  );
}

/**
 * Росчерк под заголовком: рукописная линия, а не подчёркивание. Ломаная с
 * двумя изгибами — ровная линия в этой роли читается как ошибка вёрстки.
 */
export function DrawSquiggle({ className, delay = 0 }: { className?: string; delay?: number }) {
  const [inView, ref] = useInView();

  return (
    <svg
      ref={ref}
      className={[className, inView ? styles.in : ""].filter(Boolean).join(" ")}
      viewBox="0 0 200 18"
      fill="none"
      aria-hidden="true"
      style={{ "--delay": `${delay}ms`, "--dur-draw": "1500ms" } as CSSProperties}
    >
      <path
        className={styles.path}
        pathLength={1}
        strokeWidth={3}
        d="M2 12C28 4 52 4 78 11s48 7 74-1c16-5 30-5 46 2"
      />
    </svg>
  );
}

/** Стрелка «перейти». Двигается на hover ссылки-родителя. */
export function Arrow({ className, size = 14 }: { className?: string; size?: number }) {
  return (
    <svg
      className={[styles.arrow, className].filter(Boolean).join(" ")}
      width={size}
      height={size}
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
    >
      <g className={styles.arrowGroup}>
        <path
          d="M1 7h11M7.5 2.5 12 7l-4.5 4.5"
          stroke="currentColor"
          strokeWidth={1.6}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}

/** Подсказка «листай дальше»: точка стекает по линии. */
export function ScrollCue({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width={12}
      height={40}
      viewBox="0 0 12 40"
      fill="none"
      aria-hidden="true"
    >
      <path d="M6 0v30" stroke="currentColor" strokeWidth={1} opacity={0.35} />
      <circle className={styles.cueDot} cx={6} cy={4} r={2.4} fill="currentColor" />
    </svg>
  );
}
