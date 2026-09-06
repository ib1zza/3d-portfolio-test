/**
 * Реестр секций: DOM публикует, где секция находится в документе,
 * а WebGL читает её прогресс по id.
 *
 * Зачем не считать прогресс от общего скролла по фиксированным долям:
 * высоты секций зависят от контента, шрифтов и ширины экрана, и любая
 * захардкоженная доля разъезжается на первом же изменении текста.
 *
 * Реестр намеренно вне zustand: значения читаются каждый кадр из useFrame,
 * подписки и ререндеры здесь не нужны.
 */

interface SectionRange {
  /** Смещение верха секции от начала документа, px. */
  top: number;
  height: number;
}

const sections = new Map<string, SectionRange>();
const elements = new Map<string, HTMLElement>();

function measure(id: string, el: HTMLElement) {
  const rect = el.getBoundingClientRect();
  sections.set(id, { top: rect.top + window.scrollY, height: rect.height });
}

export function registerSection(id: string, el: HTMLElement): () => void {
  elements.set(id, el);
  measure(id, el);

  const observer = new ResizeObserver(() => measure(id, el));
  observer.observe(el);

  return () => {
    observer.disconnect();
    elements.delete(id);
    sections.delete(id);
  };
}

/** Пересчитать все секции: смена ориентации, подгрузка шрифтов, ресайз. */
export function remeasureSections() {
  for (const [id, el] of elements) measure(id, el);
}

/**
 * 0 — верх секции только что показался снизу экрана.
 * 1 — низ секции ушёл за верх экрана.
 */
export function sectionProgress(id: string): number {
  const range = sections.get(id);
  if (!range) return 0;

  const viewport = window.innerHeight;
  const span = range.height + viewport;
  if (span <= 0) return 0;

  const raw = (window.scrollY + viewport - range.top) / span;
  return raw < 0 ? 0 : raw > 1 ? 1 : raw;
}

/**
 * 0 — секция ещё не в кадре, 1 — секция ровно по центру экрана, 0 — уже ушла.
 * Удобно для «оживи объект, пока секция видна».
 */
export function sectionFocus(id: string): number {
  const p = sectionProgress(id);
  return 1 - Math.abs(p - 0.5) * 2;
}

export function hasSection(id: string): boolean {
  return sections.has(id);
}

/**
 * Позиция внутри секции в «экранах»: 0 — верх секции у верха окна, 1 — окно
 * проехало один экран вниз. Для лент, где один шаг скролла равен одному
 * элементу: считать от `scrollY / innerHeight` нельзя, потому что над лентой
 * стоит заголовок, и привязка к абсолютной позиции разъезжается от любого
 * изменения отступов сверху.
 */
export function sectionSteps(id: string, steps: number): number {
  const range = sections.get(id);
  if (!range || steps <= 0) return 0;

  const step = range.height / steps;
  if (step <= 0) return 0;

  const raw = (window.scrollY - range.top) / step;
  const max = steps - 1;
  return raw < 0 ? 0 : raw > max ? max : raw;
}

/**
 * Отладочный снимок реестра. Доступен как window.__sections() в dev: когда
 * объект секции не появляется в кадре, первым делом надо понять, видит ли
 * сцена вообще её границы.
 */
export function debugSections() {
  return Object.fromEntries(
    [...sections].map(([id, r]) => [
      id,
      { ...r, progress: sectionProgress(id), focus: sectionFocus(id) },
    ]),
  );
}

if (typeof window !== "undefined" && process.env.NODE_ENV !== "production") {
  (window as unknown as { __sections: typeof debugSections }).__sections = debugSections;
}
