/**
 * Что сейчас под курсором в DOM. Читается из useFrame сцен: наведение на ряд
 * секции должно подсветить её объект в кадре, а не жить отдельной жизнью.
 *
 * Модуль, а не Zustand: подписка на React не нужна — сцена и так крутится
 * каждый кадр, и лишний ререндер списка только мешал бы скроллу.
 */
let hovered: string | null = null;

export function setHovered(id: string | null) {
  hovered = id;
}

export function readHovered(): string | null {
  return hovered;
}
