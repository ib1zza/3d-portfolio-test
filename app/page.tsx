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
import { projects } from "@/src/content/projects";
import { getLocale } from "@/src/lib/locale";
import { Marquee } from "@/src/motion/Marquee";
import { Reveal, RevealText } from "@/src/motion/Reveal";
import { SectionMarker } from "@/src/motion/SectionMarker";
import { Arrow, DrawLine, DrawSquiggle, ScrollCue } from "@/src/ui/graphics/Draw";
import { PersonJsonLd } from "@/src/ui/seo/PersonJsonLd";
import { HomeScene } from "@/src/webgl/scenes/HomeScene";

import styles from "./page.module.css";

/**
 * Главная. Одна история: имя — манифест — направления — опыт — работы — контакт
 * (plans/10-art-direction-v2.md, раздел 4).
 *
 * Секции полноэкранные и без непрозрачных фонов: фон кадра рисует сцена.
 * Текст появляется из-под маски при входе в кадр, линии секций
 * прочерчиваются — движение привязано к чтению, а не идёт само по себе.
 */
export default async function HomePage() {
  const locale = await getLocale();
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key);

  const featured = [...projects].sort((a, b) => a.priority - b.priority).slice(0, 3);

  return (
    <main id="content" className={styles.page}>
      <PersonJsonLd locale={locale} />
      <HomeScene />

      {/* 01 — Герой. Сборка интерфейса живёт в scenes/HeroCore.tsx */}
      <section className={styles.hero}>
        <SectionMarker id="hero" />

        <RevealText as="p" className={`mono ${styles.heroRole}`} text={pick(profile.role, locale)} />

        <h1 className={styles.heroTitle}>
          {pick(profile.name, locale)
            .split(" ")
            .map((word, index) => (
              <RevealText
                key={word}
                as="span"
                className={`display ${styles.heroLine}`}
                text={word}
                delay={index * 90}
                fit
                style={fitChars(word)}
              />
            ))}
        </h1>

        <DrawSquiggle className={styles.squiggle} delay={500} />

        <Reveal className={styles.heroFoot} delay={400}>
          <p className={`mono ${styles.heroMeta}`}>
            Nuxt · Vue · React · TypeScript — {pick(profile.location, locale)}
          </p>
          <p className={`prose ${styles.heroSummary}`}>{pick(profile.summary, locale)}</p>
          <div className={styles.heroActions}>
            <Link href="/work" className={styles.buttonPrimary}>
              {t("nav.work")}
              <Arrow />
            </Link>
            <Link href="/resume" className={styles.buttonGhost}>
              {t("nav.resume")}
            </Link>
          </div>
        </Reveal>

        <ScrollCue className={styles.cue} />
      </section>

      {/* Полоса стека: первый признак того, что страница живая. */}
      <Marquee className={styles.band} duration={38} label={skills.slice(0, 8).join(", ")}>
        {skills.slice(0, 8).map((skill) => (
          <span key={skill} className={styles.bandItem}>
            {skill}
            <i className={styles.bandDot} aria-hidden="true" />
          </span>
        ))}
      </Marquee>

      {/* 02 — Манифест */}
      <section className={styles.manifestSection} aria-labelledby="manifest">
        <SectionMarker id="manifest" />
        <h2 id="manifest" className="visually-hidden">
          {t("section.manifest")}
        </h2>

        <p className={styles.manifest}>
          {pick(profile.manifest, locale).map((line, index) => (
            <RevealText
              key={line}
              as="span"
              className={`display ${styles.manifestLine}`}
              text={line}
              stagger={70}
              delay={index * 60}
              fit
              style={fitChars(line)}
            />
          ))}
        </p>
      </section>

      {/* 03 — Направления */}
      <Section id="focus" index="01" title={t("section.focus")}>
        <SectionMarker id="focus" />
        <ol className={styles.focusList}>
          {focusAreas.map((area, index) => (
            <Reveal
              as="li"
              key={area.id}
              className={styles.focusItem}
              delay={index * 60}
              hoverId={`focus:${area.id}`}
            >
              <span className={`mono ${styles.focusIndex}`}>
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className={styles.focusTitle}>{pick(area.title, locale)}</h3>
              <p className={styles.muted}>{pick(area.description, locale)}</p>
              <DrawLine className={styles.focusRule} delay={index * 60} />
            </Reveal>
          ))}
        </ol>
      </Section>

      {/* 04 — Опыт */}
      <Section id="experience" index="02" title={t("section.experience")}>
        <SectionMarker id="experience" />
        <ol className={styles.timeline}>
          {experience.map((job, index) => (
            <Reveal
              as="li"
              key={job.id}
              className={styles.job}
              delay={index * 80}
              hoverId={`exp:${job.id}`}
            >
              <p className={`mono ${styles.jobPeriod}`}>{pick(job.period, locale)}</p>
              <div>
                <h3 className={styles.jobCompany}>{job.company}</h3>
                <p className={styles.jobRole}>{pick(job.role, locale)}</p>
                <ul className={styles.bullets}>
                  {pick(job.highlights, locale).map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </ol>
      </Section>

      {/* 05 — Технологии: две строки навстречу друг другу. */}
      <Section id="skills" index="03" title={t("section.skills")}>
        <SectionMarker id="skills" />
        <div className={styles.skillBands}>
          <Marquee duration={44} gap="var(--space-4)" label={skills.join(", ")}>
            {skills.map((skill) => (
              <span key={skill} className={styles.chip}>
                {skill}
              </span>
            ))}
          </Marquee>
          <Marquee duration={52} gap="var(--space-4)" reverse>
            {[...skills].reverse().map((skill) => (
              <span key={skill} className={styles.chip} aria-hidden="true">
                {skill}
              </span>
            ))}
          </Marquee>
        </div>
      </Section>

      {/* 06 — Работы: три главных, остальное на витрине. */}
      <Section id="work" index="04" title={t("section.work")}>
        <SectionMarker id="work" />
        <ul className={styles.projectList}>
          {featured.map((project, index) => (
            <Reveal as="li" key={project.id} delay={index * 70} hoverId={`work:${project.id}`}>
              <Link href={`/work/${project.id}`} className={styles.projectRow}>
                <span className={`mono ${styles.projectYear}`}>{project.year}</span>
                <span className={`display ${styles.projectTitle}`}>{project.title}</span>
                <span className={styles.projectSummary}>{pick(project.summary, locale)}</span>
                <Arrow className={styles.projectArrow} size={18} />
              </Link>
            </Reveal>
          ))}
        </ul>

        <Reveal className={styles.allWorks}>
          <Link href="/work" className={styles.buttonGhost}>
            {t("section.work")}
            <Arrow />
          </Link>
        </Reveal>
      </Section>

      {/* 07 — Результаты и образование */}
      <Section id="achievements" index="05" title={t("section.achievements")}>
        <SectionMarker id="achievements" />
        <div className={styles.twoCol}>
          <ul className={styles.bullets}>
            {pick(achievements, locale).map((line, index) => (
              <Reveal as="li" key={line} delay={index * 60} hoverId={`ach:${index}`}>
                {line}
              </Reveal>
            ))}
          </ul>
          <ul className={styles.eduList}>
            {education.map((item, index) => (
              <Reveal as="li" key={item.id} delay={index * 60}>
                <p className="mono">{item.period}</p>
                <h3 className={styles.eduTitle}>{pick(item.title, locale)}</h3>
                <p className={styles.muted}>{pick(item.place, locale)}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </Section>

      {/* 08 — Контакты */}
      <section id="contacts" className={styles.contactsSection} aria-labelledby="contacts-title">
        <SectionMarker id="contacts" />
        <h2 id="contacts-title" className="visually-hidden">
          {t("section.contacts")}
        </h2>

        <RevealText
          as="p"
          className={`display ${styles.contactsCta}`}
          text={t("contacts.cta")}
          stagger={70}
          fit
          style={fitChars(t("contacts.cta"))}
        />

        <ul className={styles.contactList}>
          {contacts.map((contact, index) => (
            <Reveal as="li" key={contact.label} delay={index * 60} hoverId={`contact:${contact.label}`}>
              <a className={styles.contactLink} href={contact.href}>
                <span className={styles.contactLabel}>{contact.label}</span>
                <span className={`mono ${styles.contactHandle}`}>{contact.handle}</span>
                <Arrow />
              </a>
            </Reveal>
          ))}
        </ul>
      </section>
    </main>
  );
}

/**
 * Длина самого длинного слова в строке — в переменную --chars.
 *
 * Это оценка на первый кадр, пока не измерен настоящий текст: строка приходит
 * с сервера, а мерить ширину умеет только браузер. Дальше `useFitText`
 * подгоняет кегль по факту — оценка по числу символов ошибается на словах из
 * широких букв, но её достаточно, чтобы до замера страница не ушла в
 * горизонтальный скролл.
 */
function fitChars(text: string): React.CSSProperties {
  const longest = text
    .split(/\s+/)
    .reduce((max, word) => Math.max(max, word.length), 0);

  return { "--chars": longest } as React.CSSProperties;
}

/** Секция с номером, прочерчивающейся линией и заголовком из-под маски. */
function Section({
  id,
  index,
  title,
  children,
}: {
  id: string;
  index: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className={styles.section} aria-labelledby={id}>
      <DrawLine className={styles.sectionRule} />

      <div className={styles.sectionHead}>
        <span className={`mono ${styles.sectionIndex}`}>{index}</span>
        <RevealText as="h2" id={id} className={styles.sectionTitle} text={title} />
      </div>

      {children}
    </section>
  );
}
