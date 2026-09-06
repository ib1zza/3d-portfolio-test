"use client";

import { createElement, type CSSProperties, type ElementType, type ReactNode } from "react";

import { setHovered } from "./hover-store";
import { useFitText } from "./useFitText";
import { useInView } from "./useInView";

import styles from "./Reveal.module.css";

/**
 * Набор пропсов, который компоненты ниже передают в тег из `as`.
 *
 * Элемент создаётся через createElement, а не JSX с динамическим тегом:
 * присваивание тега локальной переменной и рендер её как компонента React
 * Compiler считает созданием компонента внутри рендера. К тому же TS не
 * выводит пропсы для произвольного ElementType и сводит их к never.
 */
interface TagProps {
  ref?: (node: Element | null) => void;
  id?: string;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  onPointerEnter?: () => void;
  onPointerLeave?: () => void;
  "data-fitted"?: "on";
}

/**
 * Текст, выезжающий из-под маски по словам.
 *
 * Каждое слово — своя маска, а не строка целиком: строки зависят от ширины
 * экрана и переносов, и маска на строку разъезжается с реальной вёрсткой при
 * первом же изменении шрифта или размера окна.
 *
 * Разметка остаётся текстом: слова лежат в DOM как есть, поэтому поиск,
 * скринридеры и выделение мышью работают обычным образом.
 */
export function RevealText({
  text,
  as = "span",
  className,
  id,
  fit = false,
  stagger = 55,
  delay = 0,
  style,
}: {
  text: string;
  as?: ElementType;
  className?: string;
  /** Нужен заголовкам: на них ссылается aria-labelledby секции. */
  id?: string;
  /** Подгонять кегль под ширину: для строк, набранных на пределе. */
  fit?: boolean;
  /** Задержка между словами, мс. */
  stagger?: number;
  /** Задержка всей строки, мс. */
  delay?: number;
  style?: CSSProperties;
}) {
  const [inView, ref, node] = useInView();
  const fitted = useFitText(node, fit, text);

  // Пробелы сохраняем как отдельные части: иначе слова склеятся, ведь
  // inline-block съедает пробел между элементами при переносе строки.
  const parts = text.split(/(\s+)/);

  let wordIndex = 0;

  const words = parts.map((part, index) => {
    if (/^\s+$/.test(part)) return <span key={index}> </span>;

    const wordStyle = {
      "--index": wordIndex++,
      "--delay": `${delay}ms`,
    } as CSSProperties;

    return (
      <span key={index} className={styles.mask}>
        <span className={styles.word} style={wordStyle}>
          {part}
        </span>
      </span>
    );
  });

  return createElement(
    as,
    {
      ref,
      id,
      className: [className, inView ? styles.in : ""].filter(Boolean).join(" "),
      "data-fitted": fitted.fitted ? "on" : undefined,
      style: { ...style, fontSize: fitted.fontSize, "--stagger": `${stagger}ms` } as CSSProperties,
    } satisfies TagProps,
    words,
  );
}

/**
 * Блок, поднимающийся из-под низа при входе в кадр. Для всего, что не текст:
 * ряды списков, карточки метрик, изображения.
 */
export function Reveal({
  children,
  as = "div",
  className,
  delay = 0,
  shift = "2rem",
  hoverId,
  style,
}: {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  delay?: number;
  shift?: string;
  /** Наведение пишет id в hover-store — сцена подсвечивает свой объект. */
  hoverId?: string;
  style?: CSSProperties;
}) {
  const [inView, ref] = useInView();

  return createElement(
    as,
    {
      ref,
      className: [styles.block, className, inView ? styles.in : ""].filter(Boolean).join(" "),
      style: { ...style, "--delay": `${delay}ms`, "--shift": shift } as CSSProperties,
      onPointerEnter: hoverId ? () => setHovered(hoverId) : undefined,
      onPointerLeave: hoverId ? () => setHovered(null) : undefined,
    } satisfies TagProps,
    children,
  );
}
