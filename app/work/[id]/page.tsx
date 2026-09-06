import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { pick, translate } from "@/src/content/i18n";
import { getProject, projects } from "@/src/content/projects";
import { stages } from "@/src/content/stages";
import { getLocale } from "@/src/lib/locale";
import { ProjectWorld } from "@/src/webgl/scenes/ProjectWorld";

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
  const stage = stages[project.id];

  const ordered = [...projects].sort((a, b) => a.priority - b.priority);
  const index = ordered.findIndex((p) => p.id === project.id);
  const next = ordered[(index + 1) % ordered.length];

  return (
    <main
      id="content"
      className={styles.page}
      style={{ "--accent": stage.accent } as React.CSSProperties}
    >
      <ProjectWorld stage={stage} />

      <header className={styles.head}>
        <p className="mono">
          {project.year} — {t(`kind.${project.kind}`)}
        </p>
        <h1 className={`display ${styles.title}`}>{project.title}</h1>
        <p className={`prose ${styles.summary}`}>{pick(project.summary, locale)}</p>

        <dl className={styles.facts}>
          <Fact label={t("project.role")} value={pick(project.role, locale)} />
          {project.client && <Fact label={t("project.client")} value={project.client} />}
          {project.agency && <Fact label={t("project.agency")} value={project.agency} />}
          {project.period && <Fact label={t("project.period")} value={project.period} />}
        </dl>

        {project.links.length > 0 && (
          <div className={styles.links}>
            {project.links.map((link) => (
              <a key={link.href} href={link.href} className={styles.linkButton}>
                {link.label}
              </a>
            ))}
          </div>
        )}

        {project.accessNote && (
          <p className={styles.accessNote}>
            <span className={styles.ndaBadge}>{t("project.nda")}</span>
            {pick(project.accessNote, locale)}
          </p>
        )}
      </header>

      {project.caseStudy && (
        <section className={styles.section}>
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

      <section className={styles.section}>
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
        <section className={styles.section}>
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
        <section className={styles.section}>
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
        <nav className={styles.next}>
          <Link href={`/work/${next.id}`} className={styles.nextLink}>
            <span className="mono">{t("project.next")}</span>
            <span className={`display ${styles.nextTitle}`}>{next.title}</span>
          </Link>
        </nav>
      )}
    </main>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.fact}>
      <dt className="mono">{label}</dt>
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
