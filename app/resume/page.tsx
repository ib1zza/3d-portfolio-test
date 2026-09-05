import type { Metadata } from "next";
import Link from "next/link";

import { pick, translate } from "@/src/content/i18n";
import {
  achievements,
  contacts,
  education,
  experience,
  profile,
  skills,
} from "@/src/content/profile";
import { projects } from "@/src/content/projects";
import { getLocale } from "@/src/lib/locale";

import styles from "./resume.module.css";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return {
    // Имя добавляет шаблон title из корневого layout.
    title: translate(locale, "resume.title"),
    description: pick(profile.summary, locale),
    alternates: { canonical: "/resume" },
  };
}

/**
 * Страница для рекрутёра: без WebGL, один запрос, печатается в PDF.
 * Сознательное отступление от вау-эффекта, см. plans/01-concept.md, раздел 6.
 */
export default async function ResumePage() {
  const locale = await getLocale();
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key);

  const publicProjects = projects.filter((p) => p.availability !== "nda");

  return (
    <main id="content" className={styles.sheet}>
      <header className={styles.head}>
        <div>
          <h1 className={styles.name}>{pick(profile.name, locale)}</h1>
          <p className={styles.role}>{pick(profile.role, locale)}</p>
          <p className={styles.location}>{pick(profile.location, locale)}</p>
        </div>
        <ul className={styles.contacts}>
          {contacts.map((contact) => (
            <li key={contact.label}>
              <span className={styles.contactLabel}>{contact.label}</span>
              <a href={contact.href}>{contact.handle}</a>
            </li>
          ))}
        </ul>
      </header>

      <p className={styles.summary}>{pick(profile.summary, locale)}</p>

      <Section title={t("section.experience")}>
        <ol className={styles.list}>
          {experience.map((job) => (
            <li key={job.id} className={styles.entry}>
              <div className={styles.entryHead}>
                <h3>{job.company}</h3>
                <span className={styles.period}>{pick(job.period, locale)}</span>
              </div>
              <p className={styles.entryRole}>{pick(job.role, locale)}</p>
              <ul className={styles.bullets}>
                {pick(job.highlights, locale).map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </Section>

      <Section title={t("section.work")}>
        <ol className={styles.list}>
          {publicProjects.map((project) => (
            <li key={project.id} className={styles.entry}>
              <div className={styles.entryHead}>
                <h3>{project.title}</h3>
                <span className={styles.period}>{project.period ?? project.year}</span>
              </div>
              <p>{pick(project.summary, locale)}</p>
              {project.stack.length > 0 && (
                <p className={styles.stack}>{project.stack.join(" · ")}</p>
              )}
              {project.links.length > 0 && (
                <p className={styles.links}>
                  {project.links.map((link) => (
                    <a key={link.href} href={link.href}>
                      {link.href.replace(/^https?:\/\//, "")}
                    </a>
                  ))}
                </p>
              )}
            </li>
          ))}
        </ol>
      </Section>

      <Section title={t("section.skills")}>
        <p className={styles.stack}>{skills.join(" · ")}</p>
      </Section>

      <Section title={t("section.achievements")}>
        <ul className={styles.bullets}>
          {pick(achievements, locale).map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </Section>

      <Section title={t("section.education")}>
        <ol className={styles.list}>
          {education.map((item) => (
            <li key={item.id} className={styles.entry}>
              <div className={styles.entryHead}>
                <h3>{pick(item.title, locale)}</h3>
                <span className={styles.period}>{item.period}</span>
              </div>
              <p>
                {pick(item.place, locale)} — {pick(item.description, locale)}
              </p>
            </li>
          ))}
        </ol>
      </Section>

      <footer className={styles.foot}>
        <Link href="/">{t("resume.backToSite")}</Link>
      </footer>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>{title}</h2>
      {children}
    </section>
  );
}
