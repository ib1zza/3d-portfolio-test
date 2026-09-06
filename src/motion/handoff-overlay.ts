import type { Box, HandoffShot } from "./handoff";

function fullscreenBox(): Box {
  return {
    top: 0,
    left: 0,
    width: window.innerWidth,
    height: window.innerHeight,
  };
}

type Overlay = {
  layer: HTMLDivElement;
  plate: HTMLDivElement;
  title: HTMLParagraphElement;
};

let overlay: Overlay | null = null;

function applyBox(el: HTMLElement, box: Box) {
  el.style.top = `${box.top}px`;
  el.style.left = `${box.left}px`;
  el.style.width = `${box.width}px`;
  el.style.height = `${box.height}px`;
}

export function applyPlate(el: HTMLElement, shot: Pick<HandoffShot, "plateColor" | "plateImage">) {
  el.style.backgroundColor = shot.plateColor;
  el.style.backgroundImage = shot.plateImage ? `url("${shot.plateImage}")` : "none";
  el.style.backgroundSize = "cover";
  el.style.backgroundPosition = "top center";
}

export function applyTitle(
  el: HTMLElement,
  box: Box,
  shot: Pick<HandoffShot, "titleSize" | "titleWeight" | "titleTracking" | "titleColor">,
) {
  applyBox(el, box);
  el.style.fontSize = shot.titleSize;
  el.style.fontWeight = shot.titleWeight;
  el.style.letterSpacing = shot.titleTracking;
  el.style.color = shot.titleColor;
}

export function getOverlay() {
  return overlay;
}

export function mountOverlay() {
  if (overlay) return overlay;

  const layer = document.createElement("div");
  layer.id = "project-handoff";
  layer.setAttribute("aria-hidden", "true");
  Object.assign(layer.style, {
    position: "fixed",
    inset: "0",
    zIndex: "90",
    pointerEvents: "auto",
    opacity: "1",
  });

  const plate = document.createElement("div");
  Object.assign(plate.style, {
    position: "fixed",
    background: "#191b1b",
    willChange: "top, left, width, height",
  });

  const title = document.createElement("p");
  Object.assign(title.style, {
    position: "fixed",
    zIndex: "1",
    margin: "0",
    overflow: "hidden",
    fontFamily: "var(--font-text)",
    fontWeight: "500",
    lineHeight: "0.9",
    letterSpacing: "-0.07em",
    whiteSpace: "nowrap",
    willChange: "top, left, width, font-size, color",
  });

  layer.append(plate, title);
  document.body.append(layer);
  overlay = { layer, plate, title };
  return overlay;
}

export function showLeaveCover(shot: HandoffShot) {
  const { layer, plate, title } = mountOverlay();
  layer.style.background = "#191b1b";
  layer.style.opacity = "1";
  layer.style.pointerEvents = "auto";
  layer.style.transition = "none";
  plate.style.transition = "none";
  title.style.transition = "none";
  applyPlate(plate, shot);
  applyBox(plate, fullscreenBox());
  title.textContent = shot.title;
  applyTitle(title, shot.titleBox, {
    titleSize: shot.titleSize,
    titleWeight: shot.titleWeight,
    titleTracking: shot.titleTracking,
    titleColor: "#e9e5dd",
  });
}

export function showEnterCover(shot: HandoffShot) {
  const { layer, plate, title } = mountOverlay();
  layer.style.background = "transparent";
  layer.style.opacity = "1";
  layer.style.pointerEvents = "auto";
  layer.style.transition = "none";
  plate.style.transition = "none";
  title.style.transition = "none";
  applyPlate(plate, shot);
  applyBox(plate, shot.plate);
  title.textContent = shot.title;
  applyTitle(title, shot.titleBox, shot);
}

export function liftCover() {
  if (!overlay) return;
  overlay.layer.style.background = "transparent";
}

export function removeOverlay() {
  overlay?.layer.remove();
  overlay = null;
}

export function ghostProject(id: string, on: boolean) {
  document
    .querySelectorAll(`[data-project-title="${id}"], [data-project-plate="${id}"]`)
    .forEach((el) => {
      if (on) el.setAttribute("data-handoff-ghost", "");
      else el.removeAttribute("data-handoff-ghost");
    });
}

export function ghostTitle(id: string, on: boolean) {
  document.querySelectorAll(`[data-project-title="${id}"]`).forEach((el) => {
    if (on) el.setAttribute("data-handoff-ghost", "");
    else el.removeAttribute("data-handoff-ghost");
  });
}
