"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ProjectLink } from "@/src/motion/ProjectLink";

export function HudBrand({
  name,
  className,
  markClass,
  nameClass,
}: {
  name: string;
  className?: string;
  markClass?: string;
  nameClass?: string;
}) {
  const pathname = usePathname();
  const caseId = pathname.match(/^\/work\/([^/]+)$/)?.[1];
  const inner = (
    <>
      <span className={markClass} aria-hidden="true">
        мп.
      </span>
      <span className={nameClass}>{name}</span>
    </>
  );

  if (caseId) {
    return (
      <ProjectLink
        projectId={caseId}
        direction="leave"
        href="/"
        className={className}
        aria-label={name}
      >
        {inner}
      </ProjectLink>
    );
  }

  return (
    <Link href="/" className={className} aria-label={name}>
      {inner}
    </Link>
  );
}

export function HudWorkLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const caseId = pathname.match(/^\/work\/([^/]+)$/)?.[1];

  if (caseId) {
    return (
      <ProjectLink
        projectId={caseId}
        direction="leave"
        href={href}
        className={className}
      >
        {children}
      </ProjectLink>
    );
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
