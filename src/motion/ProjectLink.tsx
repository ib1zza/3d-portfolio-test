"use client";

import Link from "next/link";
import type { ComponentProps } from "react";

import {
  captureShot,
  isModifiedClick,
  listHrefForLeave,
  prefersReducedMotion,
  readCaseSnapshot,
  saveReturnTarget,
  startHandoff,
} from "./handoff";

type Props = ComponentProps<typeof Link> & {
  projectId: string;
  direction?: "enter" | "leave";
};

export function ProjectLink({
  projectId,
  direction = "enter",
  href,
  onClick,
  ...props
}: Props) {
  return (
    <Link
      href={href}
      prefetch
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented || isModifiedClick(event) || prefersReducedMotion()) {
          return;
        }

        const raw = typeof href === "string" ? href : href.pathname || "/";
        const dest = direction === "leave" ? listHrefForLeave("/") : raw;
        const shot =
          direction === "leave"
            ? captureShot(projectId, dest) ?? readCaseSnapshot()
            : captureShot(projectId, dest);

        if (!shot) return;

        if (direction === "enter") {
          const path = window.location.pathname;
          if (path === "/" || path === "/work") {
            saveReturnTarget({
              id: projectId,
              scrollY: window.scrollY,
              listHref: path === "/work" ? "/work" : "/",
            });
          } else {
            saveReturnTarget({
              id: projectId,
              scrollY: null,
              listHref: listHrefForLeave("/"),
            });
          }
        }

        event.preventDefault();
        startHandoff({ direction, shot, destHref: dest, navigate: true });
      }}
      {...props}
    />
  );
}
