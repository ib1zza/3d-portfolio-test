"use client";

import { useEffect, useState } from "react";

/**
 * Попал ли элемент в кадр. Один раз и навсегда: анимации входа не должны
 * повторяться при скролле назад — повторный запуск читается как сбой, а не
 * как приём.
 *
 * Возвращает не ref-объект, а функцию-ref: её можно положить в обычный объект
 * пропсов для createElement, тогда как ref-объект там считается обращением к
 * ref во время рендера (правило react-hooks). Заодно наблюдатель подключается
 * ровно тогда, когда узел появился, без useEffect с пустой проверкой.
 */
export function useInView({
  rootMargin = "-10% 0px -10% 0px",
}: { rootMargin?: string } = {}): [boolean, (node: Element | null) => void, Element | null] {
  const [inView, setInView] = useState(false);
  const [node, setNode] = useState<Element | null>(null);

  useEffect(() => {
    if (!node) return;

    // Элемент, уже видимый при загрузке (первый экран), анимируется сразу:
    // IntersectionObserver сообщит о нём первым же колбэком, поэтому
    // отдельной ветки для него не нужно.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setInView(true);
        observer.disconnect();
      },
      { rootMargin },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [node, rootMargin]);

  // Узел отдаётся наружу третьим значением: измерения (например подгонка
  // кегля по ширине) нужны там же, где и наблюдатель, а второй ref на тот же
  // элемент разошёлся бы с этим по времени монтирования.
  return [inView, setNode, node];
}
