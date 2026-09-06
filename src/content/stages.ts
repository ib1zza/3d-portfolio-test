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
      fit: 1.9,
      position: [0, -0.15, 0],
      rotation: [0, -Math.PI / 2, 0],
    },
    logo: {
      src: "/models/simplex.glb",
      fit: 1.3,
      position: [0, 1.2, 0],
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
      fit: 1.7,
      position: [-0.35, -0.05, 0],
      rotation: [0, Math.PI, 0],
    },
    extras: [{ src: "/models/cap.glb", fit: 0.75, position: [0.85, -0.5, 0.25] }],
    logo: {
      src: "/models/silkworm.glb",
      fit: 1.1,
      position: [0, 1.2, 0],
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
      fit: 2,
      position: [0, -0.1, 0],
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
