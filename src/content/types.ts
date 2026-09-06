/**
 * Контент-модель портфолио.
 *
 * Принципиальное разделение: `Project` — это факты (их рендерит сервер, они
 * попадают в HTML и в резюме), `ProjectStage` — это режиссура 3D-мира проекта.
 * Модуль не импортирует ничего из three, поэтому его можно использовать в RSC.
 *
 * См. plans/06-content-model.md
 */

export const LOCALES = ["ru", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "ru";

export type Localized<T> = Record<Locale, T>;

export type Vec3 = [number, number, number];

export type ProjectId =
  | "simplex"
  | "silkworm"
  | "3d-outlet"
  | "realtime-chat"
  | "kanban";

export type ProjectKind = "commercial" | "current" | "pet" | "legacy" | "internal";

export type Availability = "public" | "private" | "offline" | "unreleased" | "nda";

export type LinkKind = "live" | "repo" | "other";

export interface Link {
  label: string;
  href: string;
  kind: LinkKind;
}

export interface Metric {
  label: Localized<string>;
  value: string;
  note?: Localized<string>;
  /**
   * true — цифра подтверждена измерением с датой.
   * false — оценка, и подаётся визуально иначе. Выдавать оценку за замер нельзя.
   */
  verified: boolean;
}

export interface CaseStudy {
  problem: Localized<string>;
  solution: Localized<string>;
  result?: Localized<string>;
}

export interface ProjectImage {
  src: string;
  alt: Localized<string>;
  caption?: Localized<string>;
}

/** Факты о проекте. Никакой 3D-специфики. */
export interface Project {
  id: ProjectId;
  title: string;
  year: string;
  period?: string;
  kind: ProjectKind;
  availability: Availability;
  featured: boolean;
  priority: number;
  client?: string;
  agency?: string;
  role: Localized<string>;
  status: Localized<string>;
  summary: Localized<string>;
  stack: string[];
  responsibilities: Localized<string[]>;
  features: Localized<string[]>;
  highlights: Localized<string[]>;
  metrics?: Metric[];
  caseStudy?: CaseStudy;
  accessNote?: Localized<string>;
  links: Link[];
  images?: ProjectImage[];
}

export interface ExperienceItem {
  id: string;
  company: string;
  period: Localized<string>;
  role: Localized<string>;
  highlights: Localized<string[]>;
}

export interface EducationItem {
  id: string;
  title: Localized<string>;
  place: Localized<string>;
  period: string;
  description: Localized<string>;
}

export interface Contact {
  label: string;
  href: string;
  handle: string;
}

export interface FocusArea {
  id: string;
  title: Localized<string>;
  description: Localized<string>;
  /** Проекты, где это направление применялось. */
  projectIds: ProjectId[];
}

export interface Profile {
  name: Localized<string>;
  role: Localized<string>;
  location: Localized<string>;
  /** Развёрнутое описание для резюме и мета-тегов. */
  summary: Localized<string>;
  /** Короткий манифест для крупного экрана (сцена 02). */
  manifest: Localized<string[]>;
}

export interface ProjectSection {
  id: string;
  title: Localized<string>;
  description: Localized<string>;
  projectIds: ProjectId[];
}

/* ------------------------------------------------------------------ */
/* Режиссура 3D-миров. Читается только клиентским WebGL-слоем.         */
/* ------------------------------------------------------------------ */

export type SignatureEffect =
  | "slice"
  | "fabric"
  | "print"
  | "metaballs"
  | "dragdrop";

/**
 * `fit` — желаемый размер модели по наибольшей стороне, в юнитах сцены.
 *
 * Именно размер, а не множитель: GLB приходят от разных авторов в разных
 * единицах, от сантиметров до непонятных десятков тысяч (см. вывод
 * scripts/inspect-models.mjs), и множитель пришлось бы подбирать под каждый
 * файл заново. Пересчёт в реальный масштаб — в StageGltf.
 */
export type StageModel =
  | { type: "gltf"; src: string; fit: number; position: Vec3; rotation: Vec3 }
  | { type: "procedural"; scene: "metaballs" | "kanban" };

export type Showcase =
  | { type: "iframe"; url: string; frame: "laptop" | "phone" }
  | { type: "gallery"; images: string[] }
  | { type: "redacted" };

export interface ProjectStage {
  id: ProjectId;
  /** Акцент мира проекта: свет, bloom, подчёркивания, цвет частиц. */
  accent: string;
  accentBg: string;
  model: StageModel;
  extras?: Array<{ src: string; fit?: number; position?: Vec3; rotation?: Vec3 }>;
  logo?: { src: string; fit?: number; position?: Vec3; rotationSpeed?: number };
  signature: SignatureEffect;
  /** Облако точек для GPGPU-морфинга, см. plans/08-asset-pipeline.md */
  pointCloud: string;
  showcase: Showcase;
}
