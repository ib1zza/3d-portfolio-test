"use client";

import { useEffect, useRef } from "react";

import { registerSection, remeasureSections } from "./section-registry";

/**
 * Оборачивает DOM-секцию и сообщает её геометрию 3D-слою.
 * Рендерит только children и невидимый маркер — на разметку не влияет.
 */
export function SectionMarker({
  id,
  children,
}: {
  id: string;
  children?: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current?.parentElement;
    if (!el) return;
    return registerSection(id, el);
  }, [id]);

  useEffect(() => {
    // Шрифты меняют высоту текста уже после первой отрисовки.
    document.fonts?.ready.then(remeasureSections);

    const onResize = () => remeasureSections();
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
  }, []);

  return (
    <>
      <div ref={ref} hidden />
      {children}
    </>
  );
}
