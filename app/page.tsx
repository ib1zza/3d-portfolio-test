import Link from "next/link";

import { pick, translate } from "@/src/content/i18n";
import {
  achievements,
  contacts,
  education,
  experience,
  focusAreas,
  profile,
  skills,
} from "@/src/content/profile";
import { projectSections, projects } from "@/src/content/projects";
import { getLocale } from "@/src/lib/locale";
import { PersonJsonLd } from "@/src/ui/seo/PersonJsonLd";

import styles from "./page.module.css";

export default async function HomePage() {
  const locale = await getLocale();
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key);

  return (
    <main id="content" className={styles.page}>
      <PersonJsonLd locale={locale} />

      {/* 01 — Hero. Позже сюда встанет ядро частиц, см. plans/04-scenes.md */}
      <section className={styles.hero}>
        <p className="mono">{pick(profile.role, locale)}</p>
        <h1 className={`display ${styles.heroTitle}`}>{pick(profile.name, locale)}</h1>
        <p className={`mono ${styles.heroMeta}`}>
          Nuxt · Vue · React · TypeScript — {pick(profile.location, locale)}
        </p>
        <p className={`prose ${styles.heroSummary}`}>{pick(profile.summary, locale)}</p>
        <div className={styles.heroActions}>
          <Link href="/work" className={styles.buttonPrimary}>
            {t("nav.work")}
          </Link>
          <Link href="/resume" className={styles.buttonGhost}>
            {t("nav.resume")}
          </Link>
        </div>
      </section>

      {/* 02 — Манифест */}
      <section className={styles.section} aria-labelledby="manifest">
        <h2 id="manifest" className="visually-hidden">
          {t("section.manifest")}
        </h2>
        <p className={`display ${styles.manifest}`}>
          {pick(profile.manifest, locale).map((line) => (
            <span key={line} className={styles.manifestLine}>
              {line}
            </span>
          ))}
        </p>
      </section>

      {/* 03 — Направления */}
      <section className={styles.section} aria-labelledby="focus">
        <SectionHead id="focus" index="01" title={t("section.focus")} />
        <ul className={styles.focusGrid}>
          {focusAreas.map((area) => (
            <li key={area.id} className={styles.focusItem}>
              <h3 className={styles.focusTitle}>{pick(area.title, locale)}</h3>
              <p className={styles.muted}>{pick(area.description, locale)}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* 04 — Опыт */}
      <section className={styles.section} aria-labelledby="experience">
        <SectionHead id="experience" index="02" title={t("section.experience")} />
        <ol className={styles.timeline}>
          {experience.map((job) => (
            <li key={job.id} className={styles.job}>
              <p className="mono">{pick(job.period, locale)}</p>
              <div>
                <h3 className={styles.jobCompany}>{job.company}</h3>
                <p className={styles.jobRole}>{pick(job.role, locale)}</p>
                <ul className={styles.bullets}>
                  {pick(job.highlights, locale).map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* 05 — Технологии */}
      <section className={styles.section} aria-labelledby="skills">
        <SectionHead id="skills" index="03" title={t("section.skills")} />
        <ul className={styles.chips}>
          {skills.map((skill) => (
            <li key={skill} className={styles.chip}>
              {skill}
            </li>
          ))}
        </ul>
      </section>

      {/* 06 — Проекты */}
      <section className={styles.section} aria-labelledby="work">
        <SectionHead id="work" index="04" title={t("section.work")} />
        {projectSections.map((group) => (
          <div key={group.id} className={styles.group}>
            <h3 className={styles.groupTitle}>{pick(group.title, locale)}</h3>
            <p className={styles.muted}>{pick(group.description, locale)}</p>
            <ul className={styles.projectList}>
              {group.projectIds.map((id) => {
                const project = projects.find((p) => p.id === id);
                if (!project) return null;
                return (
                  <li key={id}>
                    <Link href={`/work/${id}`} className={styles.projectRow}>
                      <span className={styles.projectTitle}>{project.title}</span>
                      <span className="mono">{project.year}</span>
                      <span className={styles.muted}>
                        {pick(project.summary, locale)}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </section>

      {/* Результаты и образование — компактно */}
      <section className={styles.section} aria-labelledby="achievements">
        <SectionHead id="achievements" index="05" title={t("section.achievements")} />
        <div className={styles.twoCol}>
          <ul className={styles.bullets}>
            {pick(achievements, locale).map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <ul className={styles.eduList}>
            {education.map((item) => (
              <li key={item.id}>
                <p className="mono">{item.period}</p>
                <h3 className={styles.eduTitle}>{pick(item.title, locale)}</h3>
                <p className={styles.muted}>{pick(item.place, locale)}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 09 — Контакты */}
      <section id="contacts" className={styles.section} aria-labelledby="contacts-title">
        <SectionHead id="contacts-title" index="06" title={t("section.contacts")} />
        <p className={`display ${styles.contactsCta}`}>{t("contacts.cta")}</p>
        <ul className={styles.contactList}>
          {contacts.map((contact) => (
            <li key={contact.label}>
              <a className={styles.contactLink} href={contact.href}>
                <span>{contact.label}</span>
                <span className="mono">{contact.handle}</span>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

function SectionHead({
  id,
  index,
  title,
}: {
  id: string;
  index: string;
  title: string;
}) {
  return (
    <div className={styles.sectionHead}>
      <span className="mono">{index}</span>
      <h2 id={id} className={styles.sectionTitle}>
        {title}
      </h2>
    </div>
  );
}
