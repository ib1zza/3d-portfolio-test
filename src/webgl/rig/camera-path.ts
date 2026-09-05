import { CatmullRomCurve3, Vector3 } from "three";

/**
 * Камера одна на весь сайт и едет по заранее описанному пути; ключевые кадры
 * привязаны к прогрессу скролла. См. plans/03-motion-scroll-transitions.md, раздел 2.
 *
 * Значения — рабочая заготовка: их предстоит подгонять по мере появления сцен.
 */
export interface CameraKeyframe {
  at: number;
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
}

/**
 * Секции главной живут в одном пространстве вокруг начала координат
 * (см. scenes/HomeScene.tsx), поэтому камера не улетает далеко, а облетает
 * центр: меняются дистанция, высота и угол обзора. Резкие броски убирают
 * ощущение непрерывности сильнее, чем добавляют динамики.
 */
export const CAMERA_KEYFRAMES: CameraKeyframe[] = [
  { at: 0.0, position: [0, 0, 8.4], target: [0, 0, 0], fov: 38 },
  { at: 0.18, position: [2.2, 0.6, 7.2], target: [0, 0, 0], fov: 36 },
  { at: 0.36, position: [1.2, -0.9, 6.2], target: [0, 0, 0], fov: 40 },
  { at: 0.54, position: [-2.4, 0.4, 6.8], target: [0, 0, 0], fov: 38 },
  { at: 0.72, position: [-1.0, 1.4, 7.6], target: [0, 0, 0], fov: 35 },
  { at: 0.88, position: [1.4, 0.2, 8.2], target: [0, 0, 0], fov: 34 },
  { at: 1.0, position: [0, 0, 7.0], target: [0, 0, 0], fov: 38 },
];

export const positionCurve = new CatmullRomCurve3(
  CAMERA_KEYFRAMES.map((k) => new Vector3(...k.position)),
  false,
  "catmullrom",
  0.4,
);

export const targetCurve = new CatmullRomCurve3(
  CAMERA_KEYFRAMES.map((k) => new Vector3(...k.target)),
  false,
  "catmullrom",
  0.4,
);

/** FOV интерполируем отдельно: по кривой он ведёт себя неинтуитивно. */
export function fovAt(progress: number): number {
  const p = Math.min(Math.max(progress, 0), 1);

  for (let i = 0; i < CAMERA_KEYFRAMES.length - 1; i++) {
    const a = CAMERA_KEYFRAMES[i];
    const b = CAMERA_KEYFRAMES[i + 1];
    if (!a || !b) break;
    if (p >= a.at && p <= b.at) {
      const span = b.at - a.at || 1;
      const t = (p - a.at) / span;
      return a.fov + (b.fov - a.fov) * t;
    }
  }

  return CAMERA_KEYFRAMES.at(-1)?.fov ?? 40;
}

/**
 * В вертикальном вьюпорте кадр обрезается по бокам, поэтому на узких экранах
 * расширяем угол обзора. Без этого мобилка выглядит как «нос объекта крупным планом».
 */
export function adaptFovToAspect(fov: number, aspect: number): number {
  if (aspect >= 1) return fov;
  return fov + (1 - aspect) * 22;
}
