import { DEFAULT_LOCALE, type Locale } from "@/src/content/types";

/**
 * Пока сайт одноязычный на уровне роутинга: /en появится вместе с сегментом
 * локали (plans/06-content-model.md, раздел 5). Хелпер введён сразу, чтобы
 * страницы уже писались локале-осознанно и переход не потребовал правок везде.
 */
export async function getLocale(): Promise<Locale> {
  return DEFAULT_LOCALE;
}
