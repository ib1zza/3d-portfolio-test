import { DEFAULT_LOCALE, LOCALES, type Locale, type Localized } from "./types";

/**
 * Тонкий слой локализации вместо i18next: словари статические, выбор языка
 * происходит на сервере, клиентского рантайма нет вовсе.
 * См. plans/06-content-model.md, раздел 5.
 */

export const dictionaries = {
  ru: {
    "nav.work": "Проекты",
    "nav.playground": "Лаборатория",
    "nav.resume": "Резюме",
    "nav.contacts": "Контакты",

    "a11y.skipToContent": "Перейти к содержанию",
    "a11y.skipToContacts": "Перейти к контактам",

    "hud.theme": "Тема",
    "hud.language": "Язык",
    "hud.quality": "Качество графики",
    "hud.effectsOff": "Отключить эффекты",

    "section.manifest": "Манифест",
    "section.focus": "Чем занимаюсь",
    "section.experience": "Опыт",
    "section.education": "Образование",
    "section.skills": "Технологии",
    "section.work": "Проекты",
    "section.contacts": "Контакты",
    "section.achievements": "Результаты",

    "project.role": "Роль",
    "project.year": "Год",
    "project.period": "Период",
    "project.client": "Клиент",
    "project.agency": "Студия",
    "project.stack": "Стек",
    "project.responsibilities": "Что делал",
    "project.features": "Что внутри",
    "project.highlights": "Ключевое",
    "project.metrics": "Метрики",
    "project.problem": "Задача",
    "project.solution": "Решение",
    "project.result": "Результат",
    "project.links": "Ссылки",
    "project.next": "Следующий проект",
    "project.open": "Открыть кейс",
    "project.noLinks": "Ссылок нет",
    "project.unverified": "оценка, не замер",
    "project.nda": "Под NDA",

    "kind.commercial": "Коммерческий",
    "kind.current": "В работе",
    "kind.pet": "Пет-проект",
    "kind.legacy": "Ранний",
    "kind.internal": "Внутренний",

    "resume.title": "Резюме",
    "resume.download": "Скачать PDF",
    "resume.backToSite": "На сайт",

    "contacts.cta": "Напишите — отвечу быстро",
  },

  en: {
    "nav.work": "Work",
    "nav.playground": "Playground",
    "nav.resume": "Resume",
    "nav.contacts": "Contacts",

    "a11y.skipToContent": "Skip to content",
    "a11y.skipToContacts": "Skip to contacts",

    "hud.theme": "Theme",
    "hud.language": "Language",
    "hud.quality": "Graphics quality",
    "hud.effectsOff": "Disable effects",

    "section.manifest": "Manifest",
    "section.focus": "What I do",
    "section.experience": "Experience",
    "section.education": "Education",
    "section.skills": "Technologies",
    "section.work": "Work",
    "section.contacts": "Contacts",
    "section.achievements": "Results",

    "project.role": "Role",
    "project.year": "Year",
    "project.period": "Period",
    "project.client": "Client",
    "project.agency": "Studio",
    "project.stack": "Stack",
    "project.responsibilities": "What I did",
    "project.features": "What is inside",
    "project.highlights": "Highlights",
    "project.metrics": "Metrics",
    "project.problem": "Problem",
    "project.solution": "Solution",
    "project.result": "Result",
    "project.links": "Links",
    "project.next": "Next project",
    "project.open": "Open case study",
    "project.noLinks": "No public links",
    "project.unverified": "estimate, not a measurement",
    "project.nda": "Under NDA",

    "kind.commercial": "Commercial",
    "kind.current": "In progress",
    "kind.pet": "Pet project",
    "kind.legacy": "Early",
    "kind.internal": "Internal",

    "resume.title": "Resume",
    "resume.download": "Download PDF",
    "resume.backToSite": "Back to site",

    "contacts.cta": "Drop me a line — I reply fast",
  },
} as const;

export type DictKey = keyof (typeof dictionaries)["ru"];

export function getDictionary(locale: Locale) {
  return dictionaries[locale];
}

/** Строка интерфейса. */
export function translate(locale: Locale, key: DictKey): string {
  return dictionaries[locale][key];
}

/** Значение локализованного поля контента. */
export function pick<T>(value: Localized<T>, locale: Locale): T {
  return value[locale];
}

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

export { DEFAULT_LOCALE, LOCALES };
export type { Locale, Localized };
