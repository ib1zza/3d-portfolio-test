/**
 * Тиры качества и их определение.
 * Спецификация: plans/07-performance-mobile-a11y.md, раздел 2.
 *
 * Важно: `flat` — это не «сломанный сайт», а полноценный режим без WebGL.
 */

export const TIERS = ["ultra", "high", "medium", "flat"] as const;
export type Tier = (typeof TIERS)[number];

export interface QualityProfile {
  tier: Tier;
  maxDpr: number;
  particleCount: number;
  /** Симулировать частицы каждый кадр или через один. */
  simulationStride: 1 | 2;
  transmissionSamples: number;
  /**
   * Сколько миров проектов держим смонтированными одновременно на витрине.
   * Каждый — свой GLB с материалами, и держать все живыми ради двух видимых
   * значит платить видеопамятью за то, чего не видно.
   */
  activeWorlds: number;
  postfx: { bloom: boolean; dof: boolean; chromatic: boolean; noise: boolean };
  shadows: boolean;
  raymarchOctaves: number;
  physicsBodies: number;
}

export const QUALITY_PROFILES: Record<Tier, QualityProfile> = {
  ultra: {
    tier: "ultra",
    maxDpr: 2,
    particleCount: 262_144,
    simulationStride: 1,
    transmissionSamples: 6,
    activeWorlds: 3,
    postfx: { bloom: true, dof: true, chromatic: true, noise: true },
    shadows: true,
    raymarchOctaves: 5,
    physicsBodies: 20,
  },
  high: {
    tier: "high",
    maxDpr: 1.75,
    particleCount: 131_072,
    simulationStride: 1,
    transmissionSamples: 2,
    activeWorlds: 3,
    postfx: { bloom: true, dof: false, chromatic: true, noise: true },
    shadows: true,
    raymarchOctaves: 3,
    physicsBodies: 20,
  },
  medium: {
    tier: "medium",
    maxDpr: 1.25,
    particleCount: 65_536,
    simulationStride: 2,
    transmissionSamples: 0,
    // Только мир в кадре: соседей не подгружаем заранее, они появятся при
    // подходе. Витрина без единого мира не имеет смысла, поэтому не ноль.
    activeWorlds: 1,
    postfx: { bloom: true, dof: false, chromatic: false, noise: false },
    shadows: false,
    raymarchOctaves: 0,
    physicsBodies: 12,
  },
  flat: {
    tier: "flat",
    maxDpr: 1,
    particleCount: 0,
    simulationStride: 2,
    transmissionSamples: 0,
    activeWorlds: 0,
    postfx: { bloom: false, dof: false, chromatic: false, noise: false },
    shadows: false,
    raymarchOctaves: 0,
    physicsBodies: 0,
  },
};

export interface DeviceReport {
  webgl2: boolean;
  floatRenderTargets: boolean;
  renderer: string | null;
  isMobile: boolean;
  isIos: boolean;
  deviceMemory: number;
  cores: number;
  saveData: boolean;
  reducedMotion: boolean;
}

export function inspectDevice(): DeviceReport {
  if (typeof window === "undefined") {
    return {
      webgl2: false,
      floatRenderTargets: false,
      renderer: null,
      isMobile: false,
      isIos: false,
      deviceMemory: 0,
      cores: 0,
      saveData: false,
      reducedMotion: false,
    };
  }

  const canvas = document.createElement("canvas");
  const gl = canvas.getContext("webgl2");

  const debugInfo = gl?.getExtension("WEBGL_debug_renderer_info");
  const renderer =
    gl && debugInfo
      ? String(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL))
      : null;

  // Без float render targets GPGPU-симуляция невозможна: см. plans/05, раздел 1.
  const floatRenderTargets = Boolean(gl?.getExtension("EXT_color_buffer_float"));

  const nav = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean };
  };

  const ua = navigator.userAgent;
  const isIos =
    /iPad|iPhone|iPod/.test(ua) ||
    (ua.includes("Macintosh") && navigator.maxTouchPoints > 1);

  // Освобождаем пробный контекст сразу. Браузер держит жёсткий лимит на их
  // количество (в Chromium — 16 на процесс рендерера) и при переполнении
  // убивает самый старый, то есть боевую сцену.
  gl?.getExtension("WEBGL_lose_context")?.loseContext();

  return {
    webgl2: Boolean(gl),
    floatRenderTargets,
    renderer,
    isMobile: /Android|iPad|iPhone|iPod|Mobile/i.test(ua),
    isIos,
    deviceMemory: nav.deviceMemory ?? 4,
    cores: navigator.hardwareConcurrency || 4,
    saveData: Boolean(nav.connection?.saveData),
    reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  };
}

/** Грубая эвристика по строке рендерера: точнее ничего браузер не даёт. */
function scoreRenderer(renderer: string | null): number {
  if (!renderer) return 0;
  const r = renderer.toLowerCase();
  if (/(rtx|radeon rx|apple m[1-9]|arc a)/.test(r)) return 2;
  if (/(gtx|radeon|apple gpu|adreno 7|mali-g7)/.test(r)) return 1;
  if (/(swiftshader|llvmpipe|software)/.test(r)) return -5;
  return 0;
}

export function detectTier(report: DeviceReport): Tier {
  if (!report.webgl2) return "flat";
  if (report.saveData) return "flat";
  if (report.reducedMotion) return "medium";

  let score = 0;
  score += report.deviceMemory >= 8 ? 2 : report.deviceMemory >= 4 ? 1 : 0;
  score += report.cores >= 8 ? 2 : report.cores >= 4 ? 1 : 0;
  score += report.isMobile ? 0 : 2;
  score += scoreRenderer(report.renderer);
  score += report.floatRenderTargets ? 1 : -2;

  const tier: Tier = score >= 7 ? "ultra" : score >= 4 ? "high" : score >= 2 ? "medium" : "flat";

  // iOS Safari быстро упирается в лимит видеопамяти и убивает контекст.
  // Восстановление на живом сайте выглядит как краш, поэтому потолок — high.
  if (report.isIos && tier === "ultra") return "high";

  return tier;
}

/**
 * Ниже этого тира автоматика не опускается никогда.
 *
 * `flat` полностью снимает WebGL со страницы, и вернуть его без перезагрузки
 * нельзя. Такое решение допустимо только по объективным причинам — нет WebGL2,
 * включён режим экономии трафика, пользователь просил меньше движения или
 * сцена упала с ошибкой. Просадка FPS к ним не относится: замер занижен в
 * первые секунды, в неактивной вкладке и на слабой встроенной графике, и
 * платой за ошибку становится сайт вообще без графики.
 */
export const AUTO_DOWNGRADE_FLOOR: Tier = "medium";

export function lowerTier(tier: Tier, floor: Tier = "flat"): Tier {
  const index = TIERS.indexOf(tier);
  const floorIndex = TIERS.indexOf(floor);
  return TIERS[Math.min(index + 1, floorIndex)] ?? floor;
}
