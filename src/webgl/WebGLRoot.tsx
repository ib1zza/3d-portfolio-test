"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { SmoothScroll } from "@/src/motion/SmoothScroll";
import { useQualityStore } from "./lib/quality-store";
import { QualityNotice } from "./QualityNotice";
import { WebGLBoundary } from "./WebGLBoundary";

// Canvas монтируется только на клиенте и только после первого кадра:
// три с лишним сотни килобайт three не должны конкурировать с LCP.
const WebGLLayer = dynamic(
  () => import("./canvas/WebGLLayer").then((m) => m.WebGLLayer),
  { ssr: false },
);

export function WebGLRoot() {
  const pathname = usePathname();
  const reduced = useQualityStore((s) => s.device?.reducedMotion ?? false);
  const allowCanvas = !reduced || pathname === "/";
  const tier = useQualityStore((s) => s.tier);
  const initialize = useQualityStore((s) => s.initialize);
  const ready = useQualityStore((s) => s.ready);
  const setTier = useQualityStore((s) => s.setTier);
  const [idle, setIdle] = useState(false);

  useEffect(() => {
    initialize();
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      const device = useQualityStore.getState().device;
      if (device)
        useQualityStore.setState({ device: { ...device, reducedMotion: query.matches } });
    };
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, [initialize]);

  useEffect(() => {
    const schedule =
      window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 300));
    const handle = schedule(() => setIdle(true));
    return () => {
      if (window.cancelIdleCallback && typeof handle === "number") {
        window.cancelIdleCallback(handle);
      }
    };
  }, []);

  const handleFailure = useCallback(() => setTier("flat", false), [setTier]);

  return (
    <>
      <SmoothScroll />
      {ready && idle && tier !== "flat" && allowCanvas && (
        <WebGLBoundary onError={handleFailure}>
          <WebGLLayer />
        </WebGLBoundary>
      )}
      <QualityNotice />
    </>
  );
}
