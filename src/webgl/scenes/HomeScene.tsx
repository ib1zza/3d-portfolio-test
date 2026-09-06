"use client";
import dynamic from "next/dynamic";
import { useQualityStore } from "../lib/quality-store";
import type { TensionStudy } from "./tension-geometry";

const TensionScene = dynamic(() => import("./TensionScene").then((m) => m.TensionScene), {
  ssr: false,
});
export function HomeScene({
  study,
  look,
}: {
  study?: TensionStudy;
  look?: "material" | "clay" | "silhouette";
}) {
  const enabled = useQualityStore((s) => s.ready && s.tier !== "flat");
  return enabled ? <TensionScene study={study} look={look} /> : null;
}
