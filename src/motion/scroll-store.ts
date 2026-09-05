import { create } from "zustand";

/**
 * Скролл — единственный источник времени на сайте (plans/03, раздел 1).
 *
 * Значения меняются каждый кадр, поэтому компоненты внутри useFrame читают их
 * императивно через `readScroll()`, а не через подписку с ререндером.
 * Через селектор подписываются только те, кому нужен настоящий ререндер React
 * (например, HUD с названием активной секции).
 */

export interface ScrollSnapshot {
  /** 0..1 по всему документу. */
  progress: number;
  /** Нормализованная скорость, -1..1. */
  velocity: number;
  /** Сглаженная скорость: её и получают шейдеры. */
  smoothVelocity: number;
  direction: 1 | -1;
  scrollY: number;
  limit: number;
}

interface ScrollState extends ScrollSnapshot {
  activeSection: string | null;
  setActiveSection: (id: string | null) => void;
}

export const useScrollStore = create<ScrollState>((set) => ({
  progress: 0,
  velocity: 0,
  smoothVelocity: 0,
  direction: 1,
  scrollY: 0,
  limit: 1,
  activeSection: null,
  setActiveSection: (id) => set({ activeSection: id }),
}));

/**
 * Мутируем состояние напрямую: это горячий путь, вызывается каждый кадр,
 * а подписчиков на числовые поля нет по соглашению выше.
 */
export function writeScroll(patch: Partial<ScrollSnapshot>) {
  Object.assign(useScrollStore.getState(), patch);
}

export const readScroll = (): ScrollSnapshot => useScrollStore.getState();
