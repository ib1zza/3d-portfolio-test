import type { Project, ProjectSection } from "./types";

/**
 * Факты о проектах. Режиссура 3D-миров — в ./stages.ts
 *
 * Отличия от старых данных портфолио (см. plans/06-content-model.md, раздел 4):
 * - убраны все упоминания 1-bit направления, оно закрыто;
 * - метрики получили флаг `verified`, чтобы не выдавать оценку за замер;
 * - у Silkworm вместо списка фич в поле `stack` заведён TODO на реальный стек.
 */
export const projects: Project[] = [
  {
    id: "simplex",
    title: "Simplex Clinic",
    year: "2026",
    period: "2025 — 2026",
    kind: "commercial",
    availability: "public",
    featured: true,
    priority: 1,
    client: "Simplex Clinic",
    agency: "GROKHOTOV STUDIO",
    role: { ru: "Frontend-разработчик", en: "Frontend developer" },
    status: {
      ru: "Коммерческий продакшен-проект",
      en: "Commercial production project",
    },
    summary: {
      ru:
        "Сайт стоматологической клиники: страницы услуг, сценарий записи на приём, " +
        "адаптивные макеты, анимация и производительность на Nuxt.",
      en:
        "Website for a dental clinic with service pages, an appointment-oriented user " +
        "flow, responsive layouts, animation and performance-focused Nuxt implementation.",
    },
    stack: [
      "Nuxt 4",
      "Vue 3",
      "TypeScript",
      "Pinia",
      "Sass",
      "Motion",
      "nuxt-swiper",
      "Maska",
      "ESLint",
      "Prettier",
    ],
    responsibilities: {
      ru: [
        "Разрабатывал адаптивные страницы Nuxt и переиспользуемые секции макета.",
        "Собрал и поддерживал UI-кит проекта: кнопки, инпуты, карточки, типографику, секционные примитивы.",
        "Реализовал логику анимации, скролл-взаимодействия, переходы между страницами и слайдеры.",
        "Делал фронтенд-логику интерактивных блоков и интерфейсы форм.",
        "Оптимизировал производительность: ленивая загрузка, работа с медиа, практики рендеринга Nuxt.",
        "Адаптировал макеты под десктоп, планшет и мобильные брейкпоинты.",
      ],
      en: [
        "Developed responsive Nuxt pages and reusable layout sections.",
        "Built and maintained the project UI kit: buttons, inputs, cards, typography, section primitives.",
        "Implemented animation logic, scroll interactions, page transitions and slider behaviour.",
        "Worked on frontend logic for interactive blocks and form-related UI.",
        "Optimized performance through lazy loading, media handling and Nuxt rendering practices.",
        "Adapted layouts for desktop, tablet and mobile breakpoints.",
      ],
    },
    features: {
      ru: [
        "Структура сайта вокруг услуг клиники.",
        "Пользовательский путь, ведущий к записи на приём.",
        "Адаптивные коммерческие лендинг и внутренние страницы.",
        "Анимированные секции интерфейса.",
        "Переиспользуемые UI-компоненты.",
      ],
      en: [
        "Service-oriented website structure.",
        "Appointment-focused user journey.",
        "Responsive commercial landing and inner pages.",
        "Animated interface sections.",
        "Reusable UI components.",
      ],
    },
    highlights: {
      ru: [
        "Масштабируемый UI-кит, на котором быстро собираются новые страницы.",
        "Анимация, которая не мешает пользоваться сайтом.",
        "Работа над метриками производительности и best practices.",
        "Коммерческий продакшен-интерфейс на Nuxt и Vue.",
      ],
      en: [
        "A scalable UI kit for consistent and fast page development.",
        "Polished animation that does not hurt usability.",
        "Work on performance and best-practice metrics.",
        "Commercial production UI delivered on Nuxt and Vue.",
      ],
    },
    metrics: [
      {
        label: { ru: "Lighthouse", en: "Lighthouse" },
        value: "—",
        note: {
          ru: "Нужен датированный замер на продакшене. До этого цифру не показываем.",
          en: "Requires a dated production measurement. No number until then.",
        },
        verified: false,
      },
    ],
    caseStudy: {
      problem: {
        ru:
          "Клинике нужен был сайт премиального уровня: чистая визуальная система, " +
          "адаптивные страницы и аккуратные детали взаимодействия.",
        en:
          "The clinic needed a premium-level website with a clean visual system, " +
          "responsive pages and careful interaction details.",
      },
      solution: {
        ru:
          "Собрал переиспользуемые компоненты Nuxt/Vue, сделал UI-кит, добавил анимацию " +
          "и слайдеры, оптимизировал фронтенд под метрики производительности.",
        en:
          "Built reusable Nuxt/Vue components and the UI kit, added animation and slider " +
          "interactions, optimized the frontend for performance metrics.",
      },
      result: {
        ru:
          "Продакшен-сайт клиники с переиспользуемыми компонентами, адаптивными " +
          "макетами и вниманием к производительности.",
        en:
          "A production clinic website with reusable components, responsive layouts " +
          "and performance-focused implementation.",
      },
    },
    links: [{ label: "Live", href: "https://simplexclinic.ru/", kind: "live" }],
  },

  {
    id: "silkworm",
    title: "Silkworm",
    year: "2026",
    kind: "commercial",
    availability: "public",
    featured: true,
    priority: 2,
    client: "Silkworm",
    role: { ru: "Frontend-разработчик", en: "Frontend developer" },
    status: {
      ru: "Коммерческий продакшен-проект",
      en: "Commercial production project",
    },
    summary: {
      ru:
        "Ecommerce одежды: каталог, страницы товаров, корзина, галерея, " +
        "информация об оплате и доставке.",
      en:
        "Clothing ecommerce website with catalog, product pages, cart, gallery, " +
        "payment and delivery information.",
    },
    // TODO(Михаил): подтвердить реальный стек проекта.
    // В старых данных здесь были фичи (Ecommerce, Catalog, Cart), а не технологии —
    // они перенесены в `features`. Пустой массив осознанно: лучше ничего,
    // чем выдуманное. См. plans/06-content-model.md, раздел 4.
    stack: [],
    responsibilities: {
      ru: [
        "Верстал адаптивные ecommerce-страницы и переиспользуемые блоки карточек товара.",
        "Работал над каталогом, страницей товара, корзиной, оплатой и доставкой.",
        "Адаптировал интерфейс под мобильные и десктопные сценарии покупки.",
        "Поддерживал единую визуальную систему на всех страницах.",
      ],
      en: [
        "Built responsive ecommerce pages and reusable product interface blocks.",
        "Worked on catalog, product, cart, payment and delivery flows.",
        "Adapted the interface for mobile and desktop commerce scenarios.",
        "Kept a consistent visual system across pages.",
      ],
    },
    features: {
      ru: [
        "Каталог товаров.",
        "Страницы товара.",
        "Корзина.",
        "Страницы доставки и оплаты.",
        "Галерея и бренд-контент.",
      ],
      en: [
        "Product catalog.",
        "Product pages.",
        "Cart flow.",
        "Delivery and payment pages.",
        "Gallery and brand content.",
      ],
    },
    highlights: {
      ru: [
        "Публичный продакшен-сайт бренда одежды.",
        "Полный коммерческий путь: каталог, галерея, корзина, оферта, оплата, доставка.",
        "Сдержанная визуальная система, выдержанная на всех страницах.",
      ],
      en: [
        "Public production website for a clothing brand.",
        "Full commercial journey: catalog, gallery, cart, offer, payment, delivery.",
        "A restrained visual system held consistently across pages.",
      ],
    },
    caseStudy: {
      problem: {
        ru:
          "Бренду нужен был публичный ecommerce с понятным путём к покупке " +
          "и сдержанной подачей.",
        en:
          "The brand needed a public ecommerce experience with a clear product journey " +
          "and a restrained visual direction.",
      },
      solution: {
        ru:
          "Сделал адаптивный ecommerce-интерфейс, страницы товаров, элементы корзины " +
          "и единую визуальную подачу.",
        en:
          "Worked on responsive ecommerce UI, product-facing pages, cart-related " +
          "interface pieces and consistent visual presentation.",
      },
      result: {
        ru: "Сайт показывает бренд и каталог через рабочий коммерческий сценарий.",
        en: "The website presents the brand and catalog through a production ecommerce flow.",
      },
    },
    links: [{ label: "Live", href: "https://xn--b1algdhloc.xn--p1ai/", kind: "live" }],
    images: [
      {
        src: "/projects/silkworm/preview.webp",
        alt: { ru: "Главная страница сайта Silkworm", en: "Silkworm website home screen" },
        caption: { ru: "Продакшен-сайт", en: "Production website" },
      },
    ],
  },

  {
    id: "3d-outlet",
    title: "3D Outlet",
    year: "2026",
    kind: "current",
    availability: "nda",
    featured: true,
    priority: 3,
    role: { ru: "Frontend-разработчик", en: "Frontend developer" },
    status: {
      ru: "Текущий коммерческий проект",
      en: "Current commercial project",
    },
    summary: {
      ru:
        "Текущая коммерческая работа: интернет-магазин 3D-принтеров и расходников. " +
        "Каталог, страницы товаров, витрина, работа над скоростью загрузки.",
      en:
        "Current commercial work on an online store for 3D printers and related " +
        "products: catalog, product pages, storefront, loading performance.",
    },
    stack: ["Nuxt", "Vue", "TypeScript", "SCSS"],
    responsibilities: {
      ru: [
        "Разрабатываю адаптивные страницы магазина и переиспользуемые компоненты витрины.",
        "Работаю над интерфейсом каталога, подачей товара и коммерческими секциями страниц.",
        "Занимаюсь производительностью и поведением загрузки в Nuxt-окружении.",
      ],
      en: [
        "Develop responsive storefront pages and reusable commerce components.",
        "Work on catalog UI, product presentation and commerce-oriented page sections.",
        "Improve frontend performance and loading behaviour in a Nuxt environment.",
      ],
    },
    features: {
      ru: [
        "Каталог товаров.",
        "Страницы витрины.",
        "Коммерческая подача товара.",
        "Адаптивный ecommerce-интерфейс.",
      ],
      en: [
        "Product catalog.",
        "Storefront pages.",
        "Commercial product presentation.",
        "Responsive ecommerce UI.",
      ],
    },
    highlights: {
      ru: [
        "Текущая продакшен-работа, идёт прямо сейчас.",
        "Кейс раскрывается частично: проект под NDA.",
      ],
      en: [
        "Ongoing production work.",
        "Partially disclosed case study: the project is under NDA.",
      ],
    },
    accessNote: {
      ru:
        "Живой ссылки и исходников нет: проект коммерческий и закрытый. " +
        "Могу разобрать задачи и решения голосом на созвоне.",
      en:
        "No live link or source code: the project is commercial and closed. " +
        "I can walk through the problems and solutions in a call.",
    },
    links: [],
  },

  {
    id: "realtime-chat",
    title: "Realtime Chat",
    year: "2024",
    kind: "pet",
    availability: "public",
    featured: false,
    priority: 4,
    role: { ru: "Frontend-разработчик", en: "Frontend developer" },
    status: { ru: "Пет-проект", en: "Pet project" },
    summary: {
      ru:
        "Мессенджер в реальном времени: авторизация, поиск пользователей, сообщения, " +
        "файлы, редактирование профиля, темы и локализация.",
      en:
        "Realtime messaging app with authentication, user search, messages, files, " +
        "profile editing, themes and localization.",
    },
    stack: [
      "React",
      "TypeScript",
      "SCSS",
      "Firebase",
      "Redux Toolkit",
      "Motion",
      "Vite",
      "i18next",
      "date-fns",
    ],
    responsibilities: {
      ru: [
        "Сделал интерфейс чата и поток данных через Firebase.",
        "Реализовал авторизацию, редактирование профиля, поиск, темы и локализацию.",
        "Добавил отправку файлов и адаптивные макеты.",
      ],
      en: [
        "Implemented the chat interface and the Firebase data flow.",
        "Built authentication, profile editing, user search, themes and localization.",
        "Added file sending and responsive layouts.",
      ],
    },
    features: {
      ru: [
        "Вход по email и через Google.",
        "Сообщения в реальном времени.",
        "Отправка файлов.",
        "Редактирование профиля.",
        "Темы и локализация.",
      ],
      en: [
        "Email and Google authentication.",
        "Realtime messages.",
        "File sending.",
        "Profile editing.",
        "Themes and localization.",
      ],
    },
    highlights: {
      ru: [
        "Доставка сообщений в реальном времени через Firebase.",
        "Отправка файлов, удаление чатов, редактирование профиля, темы приложения.",
        "Адаптивная вёрстка под мобильные и десктопные экраны.",
      ],
      en: [
        "Realtime message delivery through Firebase.",
        "File sending, chat deletion, profile editing and app themes.",
        "Responsive layout for mobile and desktop screens.",
      ],
    },
    links: [
      { label: "Live", href: "https://react-chat-dusky.vercel.app", kind: "live" },
      { label: "GitHub", href: "https://github.com/ib1zza/react-chat", kind: "repo" },
    ],
    images: [
      {
        src: "/projects/realtime-chat/preview.webp",
        alt: { ru: "Интерфейс чата", en: "Realtime chat interface" },
        caption: { ru: "Экран переписки", en: "Chat screen" },
      },
    ],
  },

  {
    id: "kanban",
    title: "Kanban",
    year: "2024",
    kind: "legacy",
    availability: "public",
    featured: false,
    priority: 5,
    role: { ru: "Frontend-разработчик", en: "Frontend developer" },
    status: { ru: "Пет-проект", en: "Pet project" },
    summary: {
      ru:
        "Совместная канбан-доска с данными в реальном времени на Firebase Realtime " +
        "Database и архитектурой по Feature-Sliced Design.",
      en:
        "Collaborative Kanban board with realtime data on Firebase Realtime Database " +
        "and a Feature-Sliced Design architecture.",
    },
    stack: [
      "React",
      "TypeScript",
      "SCSS",
      "Redux Toolkit",
      "Firebase",
      "i18next",
      "Jest",
      "Storybook",
    ],
    responsibilities: {
      ru: [
        "Сделал интерфейс совместной доски на переиспользуемых React-компонентах.",
        "Структурировал проект по Feature-Sliced Design.",
        "Написал истории Storybook и тесты Jest для ключевых компонентов.",
      ],
      en: [
        "Built a collaborative board UI with reusable React components.",
        "Structured the project using Feature-Sliced Design.",
        "Added Storybook stories and Jest coverage for core UI pieces.",
      ],
    },
    features: {
      ru: [
        "Общие канбан-доски.",
        "Данные в реальном времени через Firebase.",
        "Состояние на Redux Toolkit.",
        "Документация компонентов в Storybook.",
      ],
      en: [
        "Shared Kanban boards.",
        "Realtime Firebase data.",
        "Redux Toolkit state management.",
        "Storybook component documentation.",
      ],
    },
    highlights: {
      ru: [
        "Общие доски для нескольких пользователей.",
        "Архитектура по Feature-Sliced Design.",
        "Покрытие Storybook и Jest.",
      ],
      en: [
        "Shared boards for multiple users.",
        "Feature-Sliced Design architecture.",
        "Storybook and Jest coverage.",
      ],
    },
    links: [
      { label: "Live", href: "https://react-kanban-delta.vercel.app/", kind: "live" },
      { label: "GitHub", href: "https://github.com/ib1zza/react-kanban", kind: "repo" },
    ],
    images: [
      {
        src: "/projects/kanban/preview.webp",
        alt: { ru: "Интерфейс канбан-доски", en: "Kanban application interface" },
        caption: { ru: "Экран доски", en: "Board interface" },
      },
    ],
  },
];

export const projectSections: ProjectSection[] = [
  {
    id: "commercial",
    title: { ru: "Коммерческие проекты", en: "Commercial work" },
    description: {
      ru: "Продакшен-проекты, сделанные для заказчиков в студийном процессе.",
      en: "Production projects delivered for clients in a studio environment.",
    },
    projectIds: ["simplex", "silkworm", "3d-outlet"],
  },
  {
    id: "pet",
    title: { ru: "Пет-проекты", en: "Pet projects" },
    description: {
      ru: "Проекты, на которых отрабатывались React, Firebase, тесты и архитектура.",
      en: "Projects where React, Firebase, testing and architecture were practiced.",
    },
    projectIds: ["realtime-chat", "kanban"],
  },
];

const projectsById = new Map(projects.map((p) => [p.id, p]));

export function getProject(id: string): Project | undefined {
  return projectsById.get(id as Project["id"]);
}

export const projectIds = projects.map((p) => p.id);
