import { create } from "zustand";

import {
  detectTier,
  inspectDevice,
  lowerTier,
  QUALITY_PROFILES,
  type DeviceReport,
  type QualityProfile,
  type Tier,
} from "./quality";

const STORAGE_KEY = "matter-quality";
/** Пауза между автопонижениями, чтобы сайт не «пульсировал» качеством. */
const DOWNGRADE_COOLDOWN_MS = 3000;

interface QualityState {
  ready: boolean;
  tier: Tier;
  profile: QualityProfile;
  device: DeviceReport | null;
  /** Тир, определённый по устройству. Нужен, чтобы можно было вернуть эффекты. */
  detectedTier: Tier;
  /** Пользователь выбрал тир руками — автопонижение больше не вмешивается. */
  pinned: boolean;
  autoDowngrades: number;
  lastDowngradeAt: number;

  initialize: () => void;
  setTier: (tier: Tier, pin?: boolean) => void;
  downgrade: () => void;
  /** Вернуть исходное качество и запретить дальнейшее автопонижение. */
  restore: () => void;
}

function readStoredTier(): Tier | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { tier: Tier; until: number };
    if (parsed.until < Date.now()) return null;
    return parsed.tier;
  } catch {
    return null;
  }
}

function storeTier(tier: Tier) {
  try {
    const until = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 дней
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ tier, until }));
  } catch {
    // приватный режим
  }
}

export const useQualityStore = create<QualityState>((set, get) => ({
  ready: false,
  tier: "flat",
  profile: QUALITY_PROFILES.flat,
  device: null,
  detectedTier: "flat",
  pinned: false,
  autoDowngrades: 0,
  lastDowngradeAt: 0,

  initialize: () => {
    if (get().ready) return;

    const device = inspectDevice();
    const detectedTier = detectTier(device);
    const stored = readStoredTier();
    const tier = stored ?? detectedTier;

    set({
      ready: true,
      device,
      detectedTier,
      tier,
      profile: QUALITY_PROFILES[tier],
      pinned: stored !== null,
    });
  },

  setTier: (tier, pin = true) => {
    if (pin) storeTier(tier);
    set({ tier, profile: QUALITY_PROFILES[tier], pinned: pin });
  },

  // Понижаем только вниз: автоповышения нет намеренно, иначе качество мигает.
  downgrade: () => {
    const state = get();
    if (state.pinned) return;

    const now = Date.now();
    if (now - state.lastDowngradeAt < DOWNGRADE_COOLDOWN_MS) return;

    const next = lowerTier(state.tier);
    if (next === state.tier) return;

    set({
      tier: next,
      profile: QUALITY_PROFILES[next],
      autoDowngrades: state.autoDowngrades + 1,
      lastDowngradeAt: now,
    });
  },

  restore: () => {
    const { detectedTier } = get();
    storeTier(detectedTier);
    set({
      tier: detectedTier,
      profile: QUALITY_PROFILES[detectedTier],
      pinned: true,
      autoDowngrades: 0,
    });
  },
}));

/** Для чтения внутри useFrame — без подписки и без ререндеров. */
export const readQuality = () => useQualityStore.getState().profile;
