import type { ProjectId, ProjectStage } from "./types";

/**
 * Режиссура 3D-миров проектов: акцент, модель, signature-приём, витрина.
 * Этот модуль читает только клиентский WebGL-слой.
 *
 * Правило из plans/01-concept.md: один signature-приём на мир. Всё лишнее
 * уезжает в /playground.
 */
export const stages: Record<ProjectId, ProjectStage> = {
  simplex: {
    id: "simplex",
    accent: "#34E0C0",
    accentBg: "#0A1614",
    model: {
      type: "gltf",
      src: "/models/cartoon-teeth-set.glb",
      scale: 1.85,
      position: [0, -0.3, 0],
      rotation: [0, -Math.PI / 2, 0],
    },
    logo: {
      src: "/models/simplex.glb",
      scale: 1.05,
      position: [0, 0.95, 0],
      rotationSpeed: 0.7,
    },
    // Плоскость сечения идёт по модели, из среза выезжают компоненты UI-кита.
    signature: "slice",
    pointCloud: "/points/tooth.bin",
    showcase: { type: "iframe", url: "https://simplexclinic.ru/", frame: "laptop" },
  },

  silkworm: {
    id: "silkworm",
    accent: "#FF3DA6",
    accentBg: "#180A12",
    model: {
      type: "gltf",
      src: "/models/t-shirt.glb",
      scale: 1.2,
      position: [-0.4, -0.4, 0],
      rotation: [0, Math.PI, 0],
    },
    extras: [{ src: "/models/cap.glb", scale: 0.65, position: [0.72, -0.42, 0] }],
    logo: {
      src: "/models/silkworm.glb",
      scale: 0.75,
      position: [0, 0.8, 0],
      rotationSpeed: 0.65,
    },
    // Ткань колышется на шуме, свотчи переключают материал: шёлк / хлопок / деним.
    signature: "fabric",
    pointCloud: "/points/shirt.bin",
    showcase: { type: "gallery", images: ["/projects/silkworm/preview.webp"] },
  },

  "3d-outlet": {
    id: "3d-outlet",
    accent: "#FFB347",
    accentBg: "#1A1206",
    model: {
      type: "gltf",
      src: "/models/printer-scanner.glb",
      scale: 2.2,
      position: [0, -0.5, 0],
      rotation: [0, 0, 0],
    },
    // Принтер печатает объект слой за слоем по прогрессу скролла,
    // UI-планы глитчатся тем сильнее, чем ближе камера. NDA как приём.
    signature: "print",
    pointCloud: "/points/printer.bin",
    showcase: { type: "redacted" },
  },

  "realtime-chat": {
    id: "realtime-chat",
    accent: "#5A4BFF",
    accentBg: "#0A0A1A",
    model: { type: "procedural", scene: "metaballs" },
    // Пузыри слипаются и всплывают, внутри — настоящие сообщения о проекте.
    signature: "metaballs",
    pointCloud: "/points/chat.bin",
    showcase: { type: "gallery", images: ["/projects/realtime-chat/preview.webp"] },
  },

  kanban: {
    id: "kanban",
    accent: "#5A4BFF",
    accentBg: "#0C0C14",
    model: { type: "procedural", scene: "kanban" },
    // Карточки перетаскиваются между колонками с физикой,
    // попавшая в Done рассыпается в частицы общего потока.
    signature: "dragdrop",
    pointCloud: "/points/kanban.bin",
    showcase: { type: "gallery", images: ["/projects/kanban/preview.webp"] },
  },
};

export function getStage(id: ProjectId): ProjectStage {
  return stages[id];
}
