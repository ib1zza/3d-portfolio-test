import type {
  Contact,
  EducationItem,
  ExperienceItem,
  FocusArea,
  Profile,
} from "./types";

export const profile: Profile = {
  name: {
    ru: "Михаил Пшеничный",
    en: "Mikhail Pshenichny",
  },
  role: {
    ru: "Frontend-разработчик",
    en: "Frontend developer",
  },
  location: {
    ru: "Санкт-Петербург",
    en: "Saint Petersburg, Russia",
  },
  summary: {
    ru:
      "Frontend-разработчик с коммерческим опытом в Nuxt, Vue, React и TypeScript. " +
      "Делаю адаптивные интерфейсы, переиспользуемые UI-киты, страницы с плотной " +
      "анимацией и продакшен-сайты, за метриками которых слежу так же внимательно, " +
      "как за макетом.",
    en:
      "Frontend developer with commercial experience in Nuxt, Vue, React and " +
      "TypeScript. I build responsive interfaces, reusable UI kits, animation-heavy " +
      "pages and production websites where performance matters as much as the design.",
  },
  manifest: {
    ru: [
      "Собираю интерфейсы из компонентов",
      "и слежу, чтобы красота",
      "не стоила производительности.",
    ],
    en: [
      "I assemble interfaces from components",
      "and make sure the beauty",
      "never costs performance.",
    ],
  },
};

export const contacts: Contact[] = [
  { label: "Telegram", href: "https://t.me/ib1zza", handle: "@ib1zza" },
  { label: "GitHub", href: "https://github.com/ib1zza", handle: "ib1zza" },
  { label: "VK", href: "https://vk.com/ib1zza", handle: "ib1zza" },
  { label: "Email", href: "mailto:dremast1337@gmail.com", handle: "dremast1337@gmail.com" },
];

/**
 * Пять направлений работы. Каждое становится объектом на орбите в сцене 03,
 * см. plans/04-scenes.md
 */
export const focusAreas: FocusArea[] = [
  {
    id: "nuxt",
    title: {
      ru: "Коммерческие сайты на Nuxt и Vue",
      en: "Commercial Nuxt and Vue websites",
    },
    description: {
      ru: "Продакшен-страницы, SSR, сложные секции и сдача проектов заказчику.",
      en: "Production pages, SSR, complex sections and client delivery.",
    },
    projectIds: ["simplex", "3d-outlet"],
  },
  {
    id: "react",
    title: {
      ru: "Приложения на React и TypeScript",
      en: "React and TypeScript applications",
    },
    description: {
      ru: "Состояние, интеграция с API, архитектура и рефакторинг легаси.",
      en: "State, API integration, architecture and legacy refactoring.",
    },
    projectIds: ["realtime-chat", "kanban"],
  },
  {
    id: "ui-kit",
    title: {
      ru: "UI-киты",
      en: "UI kits",
    },
    description: {
      ru: "Переиспользуемые компоненты, из которых страницы собираются быстрее.",
      en: "Reusable components that make page development faster and consistent.",
    },
    projectIds: ["simplex", "kanban"],
  },
  {
    id: "motion",
    title: {
      ru: "Анимация интерфейсов",
      en: "Interface animation",
    },
    description: {
      ru: "Скролл-анимации, переходы, слайдеры и микровзаимодействия.",
      en: "Scroll animation, transitions, sliders and micro-interactions.",
    },
    projectIds: ["simplex", "realtime-chat"],
  },
  {
    id: "performance",
    title: {
      ru: "Производительность фронтенда",
      en: "Frontend performance",
    },
    description: {
      ru: "Ленивая загрузка, оптимизация медиа, динамические импорты, метрики.",
      en: "Lazy loading, media optimization, dynamic imports, measurable metrics.",
    },
    projectIds: ["simplex", "3d-outlet"],
  },
];

export const experience: ExperienceItem[] = [
  {
    id: "grokhotov-studio",
    company: "GROKHOTOV STUDIO",
    period: { ru: "Сентябрь 2025 — настоящее время", en: "Sep 2025 — Present" },
    role: { ru: "Nuxt-разработчик", en: "Nuxt developer" },
    highlights: {
      ru: [
        "Разрабатываю интерактивные интерфейсы на Vue 3, Composition API и Nuxt 4.",
        "Собираю сложные UI-компоненты: слайдеры на Swiper, кастомные переходы, скролл-анимации.",
        "Улучшаю метрики Lighthouse через SSR, ленивую загрузку, динамические импорты и оптимизацию ассетов.",
        "Веду переиспользуемые UI-киты, участвую в код-ревью и выпуске проектов в продакшен.",
      ],
      en: [
        "Build interactive interfaces with Vue 3, Composition API and Nuxt 4.",
        "Implement complex UI components: Swiper sliders, custom transitions, scroll animation.",
        "Improve Lighthouse metrics through SSR, lazy loading, dynamic imports and asset optimization.",
        "Maintain reusable UI kits, take part in code review and production delivery.",
      ],
    },
  },
  {
    id: "apex-nova-tech",
    company: "ApexNovaTech",
    period: { ru: "Январь 2025 — Август 2025", en: "Jan 2025 — Aug 2025" },
    role: { ru: "React + TypeScript разработчик", en: "React + TypeScript developer" },
    highlights: {
      ru: [
        "Реализовал интерфейсы профиля и блока рекомендаций.",
        "Сделал анимации интерфейса на Motion.",
        "Работал в связке с UX/UI-дизайнерами и бэкендом над интеграцией API.",
        "Рефакторил легаси-код и участвовал в код-ревью.",
      ],
      en: [
        "Implemented the profile and recommendations interfaces.",
        "Built interface animation with Motion.",
        "Worked closely with UX/UI designers and backend developers on API integration.",
        "Refactored legacy code and participated in code review.",
      ],
    },
  },
];

export const education: EducationItem[] = [
  {
    id: "spbpu-ispo",
    title: {
      ru: "Информационные технологии и программирование",
      en: "Information technologies and programming",
    },
    place: { ru: "ИСПО при СПбПУ", en: "ISPO at SPbPU" },
    period: "2021 — 2025",
    description: {
      ru: "Среднее профессиональное образование.",
      en: "Secondary vocational education.",
    },
  },
  {
    id: "top-academy",
    title: {
      ru: "Разработка и продвижение WEB-проектов",
      en: "WEB project development and promotion",
    },
    place: { ru: "Компьютерная Академия ТОП", en: "Computer Academy TOP" },
    period: "2022 — 2023",
    description: {
      ru: "Дополнительное образование: JavaScript, React, TypeScript, CSS, HTML.",
      en: "Additional education focused on JavaScript, React, TypeScript, CSS and HTML.",
    },
  },
];

/**
 * Порядок важен: он же определяет порядок таблеток в сосуде (сцена 05).
 * Первые — то, на чём автор пишет каждый день.
 */
export const skills = [
  "TypeScript",
  "JavaScript",
  "Vue",
  "Nuxt",
  "React",
  "Next.js",
  "Pinia",
  "Redux Toolkit",
  "RTK Query",
  "SCSS",
  "CSS Modules",
  "Motion",
  "Storybook",
  "Jest",
  "Cypress",
  "Vite",
  "Webpack",
  "Firebase",
  "i18next",
  "Git",
] as const;

export const achievements = {
  ru: [
    "Собрал переиспользуемые UI-киты, ускорившие разработку страниц.",
    "Работал над продакшен-сайтами ecommerce и услуг в студийном процессе.",
    "Поднимал метрики Lighthouse ленивой загрузкой, оптимизацией медиа, SSR и работой над компонентами.",
  ],
  en: [
    "Built reusable UI kits that made page development faster and more consistent.",
    "Worked on production ecommerce and service websites in a studio environment.",
    "Improved Lighthouse metrics through lazy loading, media optimization, SSR and component-level work.",
  ],
};
