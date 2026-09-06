import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import { pick, translate } from "@/src/content/i18n";
import { getProject, projects } from "@/src/content/projects";
import { getLocale } from "@/src/lib/locale";
import { ProjectLink } from "@/src/motion/ProjectLink";

import styles from "./project.module.css";

type Params = { id: string };

export function generateStaticParams(): Params[] {
  return projects.map((project) => ({ id: project.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { id } = await params;
  const project = getProject(id);
  if (!project) return {};

  const locale = await getLocale();
  return {
    title: project.title,
    description: pick(project.summary, locale),
    alternates: { canonical: `/work/${project.id}` },
    openGraph: {
      title: project.title,
      description: pick(project.summary, locale),
    },
  };
}

export default async function ProjectPage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const project = getProject(id);
  if (!project) notFound();

  const locale = await getLocale();
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key);
  const cover = project.images?.[0];

  const ordered = [...projects].sort((a, b) => a.priority - b.priority);
  const index = ordered.findIndex((p) => p.id === project.id);
  const next = ordered[(index + 1) % ordered.length];

  return (
      <main id="content" className={styles.page}>
        <header className={styles.head}>
          <div className={styles.headTop} data-project-body="">
            <ProjectLink
              projectId={project.id}
              direction="leave"
              href="/#work"
              className={styles.back}
            >
              ← {t("project.back")}
            </ProjectLink>
            <p className={styles.meta}>
              {project.year} · {t(`kind.${project.kind}`)}
            </p>
          </div>

          <h1 className={styles.title} data-project-title={project.id}>
            {project.title}
          </h1>

          {cover && (
            <Image
              src={cover.src}
              alt={pick(cover.alt, locale)}
              width={1251}
              height={1226}
              sizes="100vw"
              priority
              className={styles.heroImage}
              data-project-plate={project.id}
            />
          )}

          <p className={styles.summary} data-project-body="">
            {pick(project.summary, locale)}
          </p>

          <dl className={styles.facts} data-project-body="">
            <Fact label={t("project.role")} value={pick(project.role, locale)} />
            {project.client && <Fact label={t("project.client")} value={project.client} />}
            {project.agency && <Fact label={t("project.agency")} value={project.agency} />}
            {project.period && <Fact label={t("project.period")} value={project.period} />}
          </dl>

          {project.links.length > 0 && (
            <div className={styles.links} data-project-body="">
              {project.links.map((link) => (
                <a key={link.href} href={link.href} className={styles.linkButton}>
                  {link.label} <span aria-hidden="true">↗</span>
                </a>
              ))}
            </div>
          )}

          {project.accessNote && (
            <p className={styles.accessNote} data-project-body="">
              <span className={styles.ndaBadge}>{t("project.nda")}</span>
              {pick(project.accessNote, locale)}
            </p>
          )}
        </header>

        {project.caseStudy && (
          <section className={styles.section} data-project-body="">
            <div className={styles.caseGrid}>
              <Block title={t("project.problem")}>
                {pick(project.caseStudy.problem, locale)}
              </Block>
              <Block title={t("project.solution")}>
                {pick(project.caseStudy.solution, locale)}
              </Block>
              {project.caseStudy.result && (
                <Block title={t("project.result")}>
                  {pick(project.caseStudy.result, locale)}
                </Block>
              )}
            </div>
          </section>
        )}

        <section className={styles.section} data-project-body="">
          <div className={styles.twoCol}>
            <div>
              <h2 className={styles.sectionTitle}>{t("project.responsibilities")}</h2>
              <ul className={styles.bullets}>
                {pick(project.responsibilities, locale).map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className={styles.sectionTitle}>{t("project.features")}</h2>
              <ul className={styles.bullets}>
                {pick(project.features, locale).map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {project.metrics && project.metrics.length > 0 && (
          <section className={styles.section} data-project-body="">
            <h2 className={styles.sectionTitle}>{t("project.metrics")}</h2>
            <ul className={styles.metrics}>
              {project.metrics.map((metric) => (
                <li key={metric.label[locale]} className={styles.metric}>
                  <span className={styles.metricValue}>{metric.value}</span>
                  <span className={styles.metricLabel}>{pick(metric.label, locale)}</span>
                  {!metric.verified && (
                    <span className={styles.metricNote}>
                      {metric.note ? pick(metric.note, locale) : t("project.unverified")}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        {project.stack.length > 0 && (
          <section className={styles.section} data-project-body="">
            <h2 className={styles.sectionTitle}>{t("project.stack")}</h2>
            <ul className={styles.chips}>
              {project.stack.map((tech) => (
                <li key={tech} className={styles.chip}>
                  {tech}
                </li>
              ))}
            </ul>
          </section>
        )}

        {next && (
          <nav className={styles.next} data-project-body="">
            <ProjectLink
              projectId={next.id}
              href={`/work/${next.id}`}
              className={styles.nextLink}
              data-project-plate={next.id}
              data-project-image={next.images?.[0]?.src}
            >
              <span className={styles.nextLabel}>{t("project.next")}</span>
              <span className={styles.nextTitle} data-project-title={next.id}>
                {next.title}
              </span>
            </ProjectLink>
          </nav>
        )}
      </main>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.fact}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className={styles.block}>
      <h2 className={styles.blockTitle}>{title}</h2>
      <p>{children}</p>
    </div>
  );
}
