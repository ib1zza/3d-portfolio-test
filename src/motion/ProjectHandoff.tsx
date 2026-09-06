"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useSyncExternalStore } from "react";

import {
  caseTitleTarget,
  captureShot,
  clearHandoff,
  fullscreenBox,
  getHandoff,
  prefersReducedMotion,
  readCaseSnapshot,
  saveCaseSnapshot,
  startHandoff,
  subscribeHandoff,
  listHrefForLeave,
  recaptureHomeShot,
  waitForCaseTitle,
  waitForListShot,
} from "./handoff";
import { applyTitle, getOverlay, ghostProject, ghostTitle, liftCover, removeOverlay } from "./handoff-overlay";

const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";
const MOVE_MS = 1100;
const TITLE_DELAY = 140;
const BODY_MS = 1000;

let playGen = 0;

function applyBox(el: HTMLElement, box: { top: number; left: number; width: number; height: number }) {
  el.style.top = `${box.top}px`;
  el.style.left = `${box.left}px`;
  el.style.width = `${box.width}px`;
  el.style.height = `${box.height}px`;
}

function setDocHandoff(value: string | null) {
  if (value) document.documentElement.dataset.handoff = value;
  else delete document.documentElement.dataset.handoff;
}

function frames(count = 2) {
  return new Promise<void>((resolve) => {
    const step = (left: number) => {
      if (left <= 0) resolve();
      else requestAnimationFrame(() => step(left - 1));
    };
    step(count);
  });
}

export function ProjectHandoff() {
  const router = useRouter();
  const pathname = usePathname();
  const state = useSyncExternalStore(subscribeHandoff, getHandoff, getHandoff);
  const routerRef = useRef(router);
  routerRef.current = router;
  const played = useRef(0);

  useEffect(() => {
    const match = pathname.match(/^\/work\/([^/]+)$/);
    if (!match?.[1] || state.phase !== "idle") return;
    const id = match[1];

    const save = () => {
      const shot = captureShot(id, pathname);
      if (shot) saveCaseSnapshot(shot);
    };
    save();
    window.addEventListener("scroll", save, { passive: true });
    window.addEventListener("resize", save);
    return () => {
      window.removeEventListener("scroll", save);
      window.removeEventListener("resize", save);
    };
  }, [pathname, state.phase]);

  useEffect(() => {
    const onPop = () => {
      if (getHandoff().phase !== "idle" || prefersReducedMotion()) return;
      if (window.location.pathname !== "/") return;
      const shot = readCaseSnapshot();
      if (!shot) return;
      startHandoff({
        direction: "leave",
        shot,
        destHref: listHrefForLeave("/"),
        navigate: false,
      });
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    if (state.token === 0 || !state.shot || played.current === state.token) return;
    played.current = state.token;

    const nodes = getOverlay();
    if (!nodes) return;

    const { layer, plate, title } = nodes;
    const shot = state.shot;
    const enter = state.direction === "enter";
    const shouldNavigate = state.navigate;
    const destHref = state.destHref;
    const gen = ++playGen;
    const alive = () => playGen === gen;

    document.documentElement.style.overflow = "hidden";
    setDocHandoff(enter ? "pending" : "leaving");

    const timers: number[] = [];
    const later = (fn: () => void, ms: number) => {
      timers.push(window.setTimeout(fn, ms));
    };

    const finish = () => {
      if (!alive()) return;
      ghostProject(shot.id, false);
      removeOverlay();
      clearHandoff();
      setDocHandoff(null);
      document.documentElement.style.overflow = "";
    };

    const movePlate = () => {
      plate.style.transition = [
        `top ${MOVE_MS}ms ${EASE}`,
        `left ${MOVE_MS}ms ${EASE}`,
        `width ${MOVE_MS}ms ${EASE}`,
        `height ${MOVE_MS}ms ${EASE}`,
      ].join(", ");
    };

    const moveTitle = () => {
      title.style.transition = [
        `top ${MOVE_MS}ms ${EASE}`,
        `left ${MOVE_MS}ms ${EASE}`,
        `width ${MOVE_MS}ms ${EASE}`,
        `height ${MOVE_MS}ms ${EASE}`,
        `font-size ${MOVE_MS}ms ${EASE}`,
        `letter-spacing ${MOVE_MS}ms ${EASE}`,
        `color 420ms ${EASE}`,
      ].join(", ");
      title.style.whiteSpace = "normal";
    };

    const reveal = () => {
      liftCover();
      layer.style.transition = `opacity ${BODY_MS}ms ${EASE}`;
      layer.style.opacity = "0";
      setDocHandoff("reveal");
      later(finish, BODY_MS + 40);
    };

    const playEnter = () => {
      if (shouldNavigate) routerRef.current.push(destHref, { scroll: true });
      movePlate();
      applyBox(plate, fullscreenBox());

      later(() => {
        if (!alive()) return;
        moveTitle();
        const dest = caseTitleTarget(shot.title);
        applyTitle(title, dest.box, {
          titleSize: dest.size,
          titleWeight: "500",
          titleTracking: "-0.07em",
          titleColor: "#e9e5dd",
        });
      }, TITLE_DELAY);

      later(async () => {
        const real = await waitForCaseTitle(shot.id);
        if (!alive()) return;
        window.scrollTo(0, 0);
        await frames(2);
        if (!alive()) return;
        if (real) {
          const rect = real.getBoundingClientRect();
          applyTitle(
            title,
            {
              top: rect.top,
              left: rect.left,
              width: rect.width,
              height: rect.height,
            },
            {
              titleSize: getComputedStyle(real).fontSize,
              titleWeight: "500",
              titleTracking: getComputedStyle(real).letterSpacing,
              titleColor: "#e9e5dd",
            },
          );
        }
        reveal();
      }, MOVE_MS + TITLE_DELAY);
    };

    const playLeave = async () => {
      if (shouldNavigate) routerRef.current.push(destHref, { scroll: false });

      let dest = await waitForListShot(shot.id, destHref);
      if (!alive()) return;

      const inView = (box: { top: number; height: number }) =>
        box.top >= 56 && box.top + Math.min(box.height, 80) <= window.innerHeight - 16;

      if (!dest || !inView(dest.titleBox)) {
        document.documentElement.style.overflow = "";
        dest = recaptureHomeShot(shot.id, destHref) ?? dest;
        await frames(3);
        dest = recaptureHomeShot(shot.id, destHref) ?? dest;
        document.documentElement.style.overflow = "hidden";
      }
      if (!alive()) return;
      if (!dest) {
        finish();
        return;
      }

      applyBox(plate, fullscreenBox());
      applyTitle(title, shot.titleBox, {
        titleSize: shot.titleSize,
        titleWeight: shot.titleWeight,
        titleTracking: shot.titleTracking,
        titleColor: "#e9e5dd",
      });
      await frames(2);
      dest = recaptureHomeShot(shot.id, destHref) ?? dest;
      if (!alive() || !dest) return;

      liftCover();
      ghostProject(shot.id, false);
      ghostTitle(shot.id, true);
      document.documentElement.style.overflow = "hidden";
      dest = recaptureHomeShot(shot.id, destHref) ?? dest;
      if (!dest) {
        finish();
        return;
      }

      movePlate();
      plate.style.transition = `${plate.style.transition}, background-color ${MOVE_MS}ms ${EASE}`;
      moveTitle();
      applyBox(plate, dest.plate);
      title.style.whiteSpace = dest.title.includes(" ") ? "normal" : "nowrap";
      applyTitle(title, dest.titleBox, dest);
      later(() => {
        if (!alive()) return;
        ghostTitle(shot.id, false);
        plate.style.transition = `opacity 420ms ${EASE}, background-color 420ms ${EASE}`;
        plate.style.opacity = "0";
        plate.style.backgroundColor = "#e9e5dd";
        plate.style.backgroundImage = "none";
        title.style.transition = `opacity 280ms ${EASE}`;
        title.style.opacity = "0";
        later(finish, 440);
      }, MOVE_MS - 80);
    };

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!alive()) return;
        if (enter) playEnter();
        else void playLeave();
      });
    });
  }, [state.token, state.shot, state.direction, state.navigate, state.destHref]);

  return null;
}
