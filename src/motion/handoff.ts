import { showEnterCover, showLeaveCover } from "./handoff-overlay";

export type Box = { top: number; left: number; width: number; height: number };

export type HandoffShot = {
  id: string;
  title: string;
  href: string;
  plate: Box;
  titleBox: Box;
  titleSize: string;
  titleWeight: string;
  titleTracking: string;
  titleColor: string;
  plateColor: string;
  plateImage: string | null;
};

export type HandoffDirection = "enter" | "leave";
export type HandoffPhase = "idle" | "cover" | "reveal" | "leaving";

export type HandoffState = {
  token: number;
  phase: HandoffPhase;
  direction: HandoffDirection;
  shot: HandoffShot | null;
  destHref: string;
  navigate: boolean;
};

const idle: HandoffState = {
  token: 0,
  phase: "idle",
  direction: "enter",
  shot: null,
  destHref: "",
  navigate: true,
};

let state: HandoffState = idle;
let token = 0;
let caseSnapshot: HandoffShot | null = null;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((fn) => fn());
}

export function subscribeHandoff(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function getHandoff(): HandoffState {
  return state;
}

export function startHandoff(input: {
  direction: HandoffDirection;
  shot: HandoffShot;
  destHref: string;
  navigate?: boolean;
}) {
  token += 1;
  state = {
    token,
    phase: input.direction === "leave" ? "leaving" : "cover",
    direction: input.direction,
    shot: input.shot,
    destHref: input.destHref,
    navigate: input.navigate ?? true,
  };
  if (typeof document !== "undefined") {
    if (input.direction === "leave") showLeaveCover(input.shot);
    else showEnterCover(input.shot);
  }
  emit();
}

export function setHandoffPhase(phase: HandoffPhase) {
  if (state.phase === phase) return;
  state = { ...state, phase };
  emit();
}

export function clearHandoff() {
  state = { ...idle, token: state.token };
  emit();
}

export type ReturnTarget = {
  id: string;
  scrollY: number | null;
  listHref: "/" | "/work";
};

const RETURN_KEY = "project-handoff-return";
let returnTarget: ReturnTarget | null = null;

export function saveReturnTarget(target: ReturnTarget) {
  returnTarget = target;
  try {
    sessionStorage.setItem(RETURN_KEY, JSON.stringify(target));
  } catch {
    /* private mode */
  }
}

export function readReturnTarget() {
  if (returnTarget) return returnTarget;
  try {
    const raw = sessionStorage.getItem(RETURN_KEY);
    if (raw) returnTarget = JSON.parse(raw) as ReturnTarget;
  } catch {
    /* private mode */
  }
  return returnTarget;
}

export function listHrefForLeave(fallback: "/" | "/work" = "/") {
  return readReturnTarget()?.listHref ?? fallback;
}

export function saveCaseSnapshot(shot: HandoffShot) {
  caseSnapshot = shot;
}

export function readCaseSnapshot() {
  return caseSnapshot;
}

function boxFrom(rect: DOMRect): Box {
  return {
    top: rect.top,
    left: rect.left,
    width: rect.width,
    height: Math.max(rect.height, 1),
  };
}

function homeTitleEl(id: string) {
  return document.querySelector<HTMLElement>(
    `[data-project-home="${id}"][data-project-title="${id}"], [data-project-home="${id}"] [data-project-title="${id}"]`,
  );
}

function homePlateEl(id: string) {
  return (
    document.querySelector<HTMLElement>(`[data-project-home="${id}"][data-project-plate="${id}"]`) ??
    document.querySelector<HTMLElement>(`[data-project-home="${id}"]`)
  );
}

export function captureShot(id: string, href: string, home = false): HandoffShot | null {
  const titleEl = home
    ? homeTitleEl(id) ?? document.querySelector<HTMLElement>(`[data-project-title="${id}"]:not(h1)`)
    : document.querySelector<HTMLElement>(`[data-project-title="${id}"]`);
  if (!titleEl) return null;

  const plateEl = home
    ? homePlateEl(id) ?? titleEl
    : (document.querySelector<HTMLElement>(`[data-project-plate="${id}"]`) ?? titleEl);
  const titleBox = boxFrom(titleEl.getBoundingClientRect());
  const plateBox = boxFrom(plateEl.getBoundingClientRect());
  const titleStyle = getComputedStyle(titleEl);
  const plateStyle = getComputedStyle(plateEl);
  const img = plateEl.matches("img")
    ? (plateEl as HTMLImageElement)
    : plateEl.querySelector("img");

  const bg = plateStyle.backgroundColor;
  const image =
    img?.currentSrc ||
    img?.src ||
    plateEl.dataset.projectImage ||
    titleEl.dataset.projectImage ||
    null;

  return {
    id,
    title: (titleEl.textContent ?? id).replace(/\s+/g, " ").trim(),
    href,
    plate: plateBox,
    titleBox,
    titleSize: titleStyle.fontSize,
    titleWeight: titleStyle.fontWeight,
    titleTracking: titleStyle.letterSpacing,
    titleColor: titleStyle.color,
    plateColor: curtainColor(bg, image),
    plateImage: image,
  };
}

function curtainColor(bg: string, image: string | null) {
  if (image) return bg && !isTransparent(bg) && !isNearPaper(bg) ? bg : "#191b1b";
  if (isTransparent(bg) || isNearPaper(bg)) return "#191b1b";
  return bg;
}

function isTransparent(color: string) {
  return !color || color === "transparent" || color === "rgba(0, 0, 0, 0)";
}

function isNearPaper(color: string) {
  const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return color === "#e9e5dd" || color === "#E9E5DD";
  const dist =
    Math.abs(Number(match[1]) - 233) +
    Math.abs(Number(match[2]) - 229) +
    Math.abs(Number(match[3]) - 221);
  return dist < 48;
}

export function caseTitleTarget(title: string): {
  box: Box;
  size: string;
  color: string;
} {
  const mobile = window.innerWidth <= 700;
  const padX = mobile ? 0.05 : 0.06;
  const left = window.innerWidth * padX;
  const width = window.innerWidth * (1 - padX * 2);
  const size = mobile
    ? Math.min(80, Math.max(44, window.innerWidth * 0.14))
    : Math.min(170, Math.max(64, window.innerWidth * 0.11));
  const lines = title.includes(" ") ? 2 : 1;
  const top = (mobile ? 84 : 132) + 44 + (mobile ? 18 : 28);

  return {
    box: { top, left, width, height: size * 0.95 * lines },
    size: `${size}px`,
    color: "#191b1b",
  };
}

export function fullscreenBox(): Box {
  return {
    top: 0,
    left: 0,
    width: window.innerWidth,
    height: window.innerHeight,
  };
}

export function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function isModifiedClick(event: { metaKey: boolean; ctrlKey: boolean; shiftKey: boolean; altKey: boolean; button: number }) {
  return (
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey ||
    event.button !== 0
  );
}

export function pathOf(href: string) {
  const path = href.split("#")[0] || "/";
  return path === "" ? "/" : path;
}

export function waitFor(test: () => boolean, timeout = 2000) {
  return new Promise<boolean>((resolve) => {
    if (test()) {
      resolve(true);
      return;
    }

    const started = Date.now();
    const tick = () => {
      if (test()) {
        window.clearInterval(id);
        observer.disconnect();
        resolve(true);
      } else if (Date.now() - started > timeout) {
        window.clearInterval(id);
        observer.disconnect();
        resolve(false);
      }
    };

    const observer = new MutationObserver(tick);
    observer.observe(document.body, { childList: true, subtree: true });
    const id = window.setInterval(tick, 32);
    window.addEventListener("popstate", tick, { once: true });
  });
}

export function waitForPath(href: string, timeout = 2000) {
  const path = pathOf(href);
  return waitFor(() => window.location.pathname === path, timeout);
}

export function waitForSelector(selector: string, timeout = 1600) {
  return new Promise<Element | null>((resolve) => {
    const first = document.querySelector(selector);
    if (first) {
      resolve(first);
      return;
    }

    const started = Date.now();
    const observer = new MutationObserver(() => {
      const el = document.querySelector(selector);
      if (el) {
        observer.disconnect();
        resolve(el);
      } else if (Date.now() - started > timeout) {
        observer.disconnect();
        resolve(null);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    window.setTimeout(() => {
      observer.disconnect();
      resolve(document.querySelector(selector));
    }, timeout);
  });
}

/** Case destination: the real h1, after the route has swapped. */
export async function waitForCaseTitle(id: string) {
  const ready = await waitFor(
    () =>
      window.location.pathname === `/work/${id}` &&
      Boolean(document.querySelector(`h1[data-project-title="${id}"]`)),
  );
  return ready ? document.querySelector<HTMLElement>(`h1[data-project-title="${id}"]`) : null;
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

function scrollInstant(top: number) {
  const root = document.documentElement;
  const previous = root.style.scrollBehavior;
  root.style.scrollBehavior = "auto";
  window.scrollTo(0, Math.max(0, top));
  root.style.scrollBehavior = previous;
}

export function scrollHomeCardIntoView(id: string) {
  const el = homeTitleEl(id) ?? homePlateEl(id);
  if (!el) return;
  const y = window.scrollY + el.getBoundingClientRect().top - window.innerHeight * 0.32;
  scrollInstant(y);
}

function homeCardVisible(id: string) {
  const el = homeTitleEl(id) ?? homePlateEl(id);
  if (!el) return false;
  const rect = el.getBoundingClientRect();
  const visible = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 72);
  return visible > Math.min(56, rect.height * 0.35);
}

function restoreListScroll(id: string) {
  const root = document.documentElement;
  root.style.overflow = "";
  document.body.style.overflow = "";
  const saved = readReturnTarget();
  if (saved?.id === id && saved.scrollY != null) {
    scrollInstant(saved.scrollY);
  }
  if (!homeCardVisible(id)) scrollHomeCardIntoView(id);
  root.style.overflow = "hidden";
}

/** Home / reel destination: never the case h1. */
export async function waitForListShot(id: string, href: string) {
  const path = pathOf(href);
  const ready = await waitFor(() => {
    if (window.location.pathname !== path) return false;
    if (document.querySelector(`h1[data-project-title="${id}"]`)) return false;
    return Boolean(homeTitleEl(id) ?? document.querySelector(`[data-project-title="${id}"]:not(h1)`));
  });
  if (!ready) return null;

  const saved = readReturnTarget();
  await waitFor(() => {
    const el =
      homeTitleEl(id) ??
      document.querySelector<HTMLElement>(`[data-project-title="${id}"]:not(h1)`);
    if (!el || el.getBoundingClientRect().height < 8) return false;
    const need = saved?.id === id && saved.scrollY != null ? saved.scrollY + window.innerHeight : 0;
    return document.documentElement.scrollHeight >= need;
  });

  restoreListScroll(id);
  const until = Date.now() + 2000;
  while (Date.now() < until && !homeCardVisible(id)) {
    restoreListScroll(id);
    await frames(3);
  }
  await frames(3);
  if (!homeCardVisible(id)) {
    scrollHomeCardIntoView(id);
    await frames(3);
  }

  const shot = captureShot(id, href, true);
  document.documentElement.style.overflow = "hidden";
  return shot;
}

export function recaptureHomeShot(id: string, href: string) {
  scrollHomeCardIntoView(id);
  return captureShot(id, href, true);
}
