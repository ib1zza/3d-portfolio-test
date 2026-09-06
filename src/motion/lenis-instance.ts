import type Lenis from "lenis";

/**
 * Доступ к живому экземпляру Lenis для тех, кто им управляет: прилипание к
 * секциям, программная прокрутка из HUD, остановка скролла на время перехода.
 *
 * Через модуль, а не через контекст: Lenis создаётся в SmoothScroll и
 * пересоздаётся при смене тира, а подписчики появляются позже и на других
 * ветках дерева. Контекст заставил бы поднять провайдер в layout и
 * прокидывать ссылку через все страницы ради одного объекта-синглтона.
 */

let instance: Lenis | null = null;
const listeners = new Set<(lenis: Lenis | null) => void>();

export function setLenis(next: Lenis | null) {
  instance = next;
  for (const listener of listeners) listener(next);
}

export function getLenis(): Lenis | null {
  return instance;
}

/**
 * Подписка на появление и смену экземпляра. Слушатель вызывается сразу с
 * текущим значением: страница может смонтироваться и раньше, и позже Lenis,
 * и оба порядка должны работать одинаково.
 */
export function onLenis(listener: (lenis: Lenis | null) => void): () => void {
  listeners.add(listener);
  listener(instance);
  return () => listeners.delete(listener);
}
