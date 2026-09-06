"use client";

import { useEffect, useState } from "react";

/**
 * Подгоняет кегль строки так, чтобы самое длинное слово влезло по ширине.
 *
 * Возвращает размер для style, а не пишет в DOM напрямую: аргумент хука
 * нельзя мутировать (react-hooks/immutability), поэтому кегль уходит обратно
 * в React и ставится как обычный проп.
 *
 * Сброс к полной ступени делаем только когда изменилась ширина родителя.
 * Если сбрасывать перед каждым замером, следующий кадр успевает посчитать
 * уже ужатый текст, решить что всё влезает и оставить полный кегль — имя
 * снова выезжает за край.
 */
export function useFitText(
  node: Element | null,
  enabled: boolean,
  text: string,
): { fitted: boolean; fontSize?: string } {
  const [fitted, setFitted] = useState(false);
  const [fontSize, setFontSize] = useState<string | undefined>();

  useEffect(() => {
    if (!enabled || !(node instanceof HTMLElement)) return;

    const parent = node.parentElement;
    if (!parent) return;

    let lastAvailable = -1;

    const availableWidth = () => {
      const style = getComputedStyle(node);
      const padding = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
      return parent.clientWidth - padding - 12;
    };

    const widestChild = () => {
      let widest = 0;
      for (const word of node.children) {
        widest = Math.max(widest, word.getBoundingClientRect().width);
      }
      return widest;
    };

    const shrink = () => {
      const available = availableWidth();
      const widest = widestChild();
      if (widest <= 0 || available <= 0 || widest <= available) return;

      const current = parseFloat(getComputedStyle(node).fontSize);
      setFitted(true);
      setFontSize(`${current * (available / widest)}px`);
    };

    const measure = () => {
      const available = availableWidth();
      if (Math.abs(available - lastAvailable) > 1) {
        lastAvailable = available;
        setFontSize(undefined);
        setFitted(true);
        requestAnimationFrame(shrink);
        return;
      }
      shrink();
    };

    measure();
    document.fonts?.ready.then(measure);

    const observer = new ResizeObserver(measure);
    observer.observe(parent);
    return () => observer.disconnect();
  }, [node, enabled, text]);

  return { fitted, fontSize };
}
