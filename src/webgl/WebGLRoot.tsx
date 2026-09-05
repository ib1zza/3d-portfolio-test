"use client";

import dynamic from "next/dynamic";
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
  const initialize = useQualityStore((s) => s.initialize);
  const ready = useQualityStore((s) => s.ready);
  const setTier = useQualityStore((s) => s.setTier);
  const [idle, setIdle] = useState(false);

  useEffect(() => {
    initialize();
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
      {ready && idle && (
        <WebGLBoundary onError={handleFailure}>
          <WebGLLayer />
        </WebGLBoundary>
      )}
      <QualityNotice />
    </>
  );
}
