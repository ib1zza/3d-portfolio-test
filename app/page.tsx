import Image from "next/image";
import Link from "next/link";
import { contacts, profile } from "@/src/content/profile";
import { projects } from "@/src/content/projects";
import { pick } from "@/src/content/i18n";
import { getLocale } from "@/src/lib/locale";
import { HomeScene } from "@/src/webgl/scenes/HomeScene";
import { PersonJsonLd } from "@/src/ui/seo/PersonJsonLd";
import styles from "./page.module.css";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ study?: string; look?: string }>;
}) {
  const locale = await getLocale();
  const ru = locale === "ru";
  const { study, look } = await searchParams;
  const variant = study === "vertical" || study === "wide" ? study : "asymmetric";
  const silkworm = projects.find((p) => p.id === "silkworm")!;
  return (
    <main id="content" className={styles.page}>
      <PersonJsonLd locale={locale} />
      <HomeScene
        study={variant}
        look={look === "silhouette" || look === "clay" ? look : "material"}
      />
      <section id="tension-hero" className={styles.hero} aria-labelledby="hero-title">
        <picture className={styles.poster}>
          <source media="(max-width: 700px)" srcSet="/scenes/hero/poster-mobile.webp" />
          <img
            src="/scenes/hero/poster-desktop.webp"
            alt=""
            width="1440"
            height="900"
            fetchPriority="high"
          />
        </picture>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>
            {pick(profile.role, locale)}
            <span> / {ru ? "Санкт-Петербург" : "Saint Petersburg"}</span>
          </p>
          <h1 id="hero-title" className={styles.name}>
            {pick(profile.name, locale)
              .split(" ")
              .map((word) => (
                <span key={word}>{word} </span>
              ))}
          </h1>
          <p className={styles.intro}>
            {ru
              ? "Разрабатываю интерфейсы, которые хочется исследовать."
              : "I build interfaces that invite exploration."}
          </p>
          <a className={styles.cta} href="#work">
            {ru ? "Смотреть работы" : "Explore work"}
            <span aria-hidden="true">↘</span>
          </a>
        </div>
        <div className={styles.heroBottom}>
          <span>Nuxt · Vue · React · TypeScript</span>
          <span>
            {ru ? "Избранные работы" : "Selected work"} <span aria-hidden="true">↓</span>
          </span>
        </div>
      </section>

      <section id="work" className={styles.work} aria-labelledby="silkworm-title">
        <div className={styles.workTop}>
          <span>01 / {ru ? "Избранная работа" : "Selected work"}</span>
          <span>2026 · Ecommerce</span>
        </div>
        <div className={styles.workHeading}>
          <h2 id="silkworm-title">Silkworm</h2>
          <p>
            {ru
              ? "От первого взгляда —\nдо своей вещи."
              : "From a first look\nto something of your own."}
          </p>
        </div>
        <Link
          href="/work/silkworm"
          className={styles.mediaLink}
          aria-label={ru ? "Открыть кейс Silkworm" : "Open the Silkworm case study"}
        >
          <Image
            src="/projects/silkworm/preview.webp"
            alt={ru ? "Главная страница сайта Silkworm" : "Silkworm website home screen"}
            width={1251}
            height={1226}
            sizes="(max-width: 700px) 92vw, 88vw"
            className={styles.projectImage}
          />
          <span className={styles.mediaCta}>
            {ru ? "Смотреть кейс" : "View case study"} ↗
          </span>
        </Link>
        <div className={styles.projectDetail}>
          <p className={styles.eyebrow}>
            {pick(silkworm.role, locale)}
            <br />
            Nuxt / Vue / TypeScript / SCSS
          </p>
          <div>
            <p>{pick(silkworm.summary, locale)}</p>
            <p className={styles.contribution}>
              {pick(silkworm.responsibilities, locale)[0]}
            </p>
            <Link href="/work/silkworm" className={styles.textLink}>
              {ru ? "Задачи и решения" : "Process and contribution"} ↗
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.index} aria-labelledby="index-title">
        <div className={styles.workTop}>
          <h2 id="index-title">{ru ? "Ещё работы" : "More work"}</h2>
          <Link href="/work">{ru ? "Все проекты" : "All projects"} ↗</Link>
        </div>
        {projects
          .filter((p) => p.id !== "silkworm")
          .map((p, i) => (
            <Link className={styles.indexRow} key={p.id} href={`/work/${p.id}`}>
              <span>0{i + 2}</span>
              <h3>{p.title}</h3>
              <span className={styles.indexType}>
                {p.availability === "nda"
                  ? ru
                    ? "Коммерческий проект · NDA"
                    : "Commercial project · NDA"
                  : pick(p.role, locale)}
              </span>
              <span aria-hidden="true">↗</span>
            </Link>
          ))}
      </section>

      <section id="about" className={styles.about}>
        <p className={styles.eyebrow}>{ru ? "Обо мне" : "About"}</p>
        <div>
          <h2>
            {ru
              ? "Внимание к форме.\nТочность в коде."
              : "An eye for form.\nPrecision in code."}
          </h2>
          <p>{pick(profile.summary, locale)}</p>
          <Link href="/resume" className={styles.textLink}>
            {ru ? "Опыт и резюме" : "Experience and résumé"} ↗
          </Link>
        </div>
      </section>
      <section id="contacts" className={styles.contact}>
        <p className={styles.eyebrow}>
          {ru ? "Есть задача?" : "Have a project in mind?"}
        </p>
        <h2>{ru ? "Давайте\nобсудим." : "Let’s talk."}</h2>
        <div className={styles.contactLinks}>
          {contacts
            .filter((c) => c.label !== "VK")
            .map((c) => (
              <a key={c.label} href={c.href}>
                {c.label}
                <span>↗</span>
              </a>
            ))}
        </div>
        <footer>
          <span>© 2026 {pick(profile.name, locale)}</span>
          <a href="#tension-hero">{ru ? "Наверх" : "Back to top"} ↑</a>
        </footer>
      </section>
    </main>
  );
}
