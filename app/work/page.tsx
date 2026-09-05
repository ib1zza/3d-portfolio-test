import type { Metadata } from "next";
import Link from "next/link";

import { pick, translate } from "@/src/content/i18n";
import { projects } from "@/src/content/projects";
import { stages } from "@/src/content/stages";
import { getLocale } from "@/src/lib/locale";

import styles from "./work.module.css";

export const metadata: Metadata = {
  title: "Проекты",
  alternates: { canonical: "/work" },
};

/**
 * Витрина. На этапе 5 каждая карточка станет порталом в отдельный мир
 * (plans/04-scenes.md, сцена 06). Сейчас это текстовая основа, которая
 * останется в SSR-разметке и после появления WebGL.
 */
export default async function WorkPage() {
  const locale = await getLocale();
  const ordered = [...projects].sort((a, b) => a.priority - b.priority);

  return (
    <main id="content" className={styles.page}>
      <h1 className={`display ${styles.title}`}>{translate(locale, "section.work")}</h1>

      <ul className={styles.grid}>
        {ordered.map((project) => {
          const stage = stages[project.id];
          return (
            <li key={project.id}>
              <Link
                href={`/work/${project.id}`}
                className={styles.card}
                style={{ "--accent": stage.accent } as React.CSSProperties}
              >
                <div className={styles.cardHead}>
                  <span className="mono">{project.year}</span>
                  <span className="mono">
                    {translate(locale, `kind.${project.kind}` as const)}
                  </span>
                </div>
                <h2 className={styles.cardTitle}>{project.title}</h2>
                <p className={styles.cardSummary}>{pick(project.summary, locale)}</p>
                {project.stack.length > 0 && (
                  <p className={`mono ${styles.cardStack}`}>
                    {project.stack.slice(0, 4).join(" · ")}
                  </p>
                )}
                {project.availability === "nda" && (
                  <p className={styles.nda}>{translate(locale, "project.nda")}</p>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
