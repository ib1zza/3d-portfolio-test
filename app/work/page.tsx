import type { Metadata } from "next";

import { translate } from "@/src/content/i18n";
import { projects } from "@/src/content/projects";
import { getLocale } from "@/src/lib/locale";

import { WorkReel } from "./WorkReel";
import styles from "./work.module.css";

export const metadata: Metadata = {
  title: "Проекты",
  alternates: { canonical: "/work" },
};

/**
 * Витрина: лента полноэкранных кадров, по одному на проект
 * (plans/10-art-direction-v2.md, раздел 4). Порядок и текст задаёт сервер,
 * прилипание скролла и 3D подключает клиентский WorkReel.
 */
export default async function WorkPage() {
  const locale = await getLocale();
  const ordered = [...projects].sort((a, b) => a.priority - b.priority);

  return (
    <main id="content" className={styles.page}>
      <header className={styles.intro}>
        <h1 className={`display ${styles.title}`}>{translate(locale, "section.work")}</h1>
        <p className={styles.introNote}>{translate(locale, "work.intro")}</p>
      </header>

      <WorkReel projects={ordered} locale={locale} />
    </main>
  );
}
