"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

import { pick, translate, type Locale } from "@/src/content/i18n";
import { stages } from "@/src/content/stages";
import type { Project } from "@/src/content/types";
import { registerSection } from "@/src/motion/section-registry";
import { useSnapSections } from "@/src/motion/useSnapSections";
import { REEL_SECTION, WorkScene } from "@/src/webgl/scenes/WorkScene";

import styles from "./work.module.css";

/**
 * Лента проектов: один проект — один кадр. Текст и ссылки живут в DOM,
 * модель проекта — в общей сцене (plans/10-art-direction-v2.md, раздел 4).
 *
 * Клиентский компонент, потому что ленте нужны позиция скролла и прилипание.
 * Разметка при этом остаётся серверной: клиентские компоненты рендерятся и на
 * сервере, поэтому проекты и ссылки на кейсы видны поиску и без JS.
 */
export function WorkReel({ projects, locale }: { projects: Project[]; locale: Locale }) {
  const reel = useRef<HTMLOListElement>(null);

  useSnapSections(reel);

  // Сцена читает позицию скролла внутри ленты по этому id.
  useEffect(() => {
    const el = reel.current;
    if (!el) return;
    return registerSection(REEL_SECTION, el);
  }, []);

  return (
    <>
      <WorkScene ids={projects.map((project) => project.id)} />

      <ol ref={reel} className={styles.reel}>
        {projects.map((project, index) => (
          <li key={project.id} className={styles.slide}>
            <p className={`mono ${styles.counter}`}>
              {String(index + 1).padStart(2, "0")}
              <span className={styles.counterTotal}>
                / {String(projects.length).padStart(2, "0")}
              </span>
            </p>

            <h2 className={`display ${styles.slideTitle}`}>{project.title}</h2>

            <p className={styles.slideSummary}>{pick(project.summary, locale)}</p>

            <dl className={styles.facts}>
              <div>
                <dt className="mono">{translate(locale, "project.year")}</dt>
                <dd>{project.year}</dd>
              </div>
              <div>
                <dt className="mono">{translate(locale, "project.role")}</dt>
                <dd>{pick(project.role, locale)}</dd>
              </div>
              <div>
                <dt className="mono">{translate(locale, "project.stack")}</dt>
                <dd>{project.stack.join(" · ")}</dd>
              </div>
            </dl>

            <Link
              href={`/work/${project.id}`}
              className={styles.open}
              style={{ "--accent": stages[project.id].accent } as React.CSSProperties}
            >
              {translate(locale, "project.open")}
            </Link>
          </li>
        ))}
      </ol>
    </>
  );
}