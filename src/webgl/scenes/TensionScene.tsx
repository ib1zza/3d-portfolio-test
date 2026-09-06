"use client";

import { Environment, Lightformer, PerspectiveCamera } from "@react-three/drei";
import { useEffect, useState, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { SceneTunnel } from "../tunnel";
import { HeroCore } from "./HeroCore";
import type { TensionStudy } from "./tension-geometry";

function FirstFrame() {
  const frames = useRef(0);
  useFrame(({ gl, invalidate }) => {
    if (++frames.current < 3) invalidate();
    if (frames.current >= 2 && !gl.getContext().isContextLost())
      document.documentElement.dataset.tensionReady = "true";
    if (process.env.NODE_ENV === "development" && frames.current > 3) {
      gl.domElement.dataset.frames = String(frames.current);
      gl.domElement.dataset.triangles = String(gl.info.render.triangles);
      gl.domElement.dataset.drawCalls = String(gl.info.render.calls);
    }
  });
  useEffect(
    () => () => {
      delete document.documentElement.dataset.tensionReady;
    },
    [],
  );
  return null;
}

export function TensionScene({
  study,
  look,
}: {
  study?: TensionStudy;
  look?: "material" | "clay" | "silhouette";
}) {
  const [active, setActive] = useState(true);
  useEffect(() => {
    const hero = document.getElementById("tension-hero");
    if (!hero) return;
    const observer = new IntersectionObserver(
      ([entry]) => setActive(entry?.isIntersecting ?? false),
      { rootMargin: "100px" },
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);
  if (!active) return null;
  return (
    <SceneTunnel.In>
      <PerspectiveCamera makeDefault position={[0, 0, 9]} fov={38} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[-3, 5, 6]} intensity={2.8} color="#fff6e8" />
      <directionalLight position={[5, 1, 3]} intensity={1.5} color="#e2eaf3" />
      <Environment resolution={128} frames={1}>
        <Lightformer
          intensity={4}
          form="rect"
          scale={[4, 8, 1]}
          position={[-4, 3, 4]}
          target={[0, 0, 0]}
        />
        <Lightformer
          intensity={3}
          form="rect"
          scale={[2, 7, 1]}
          position={[5, 0, 2]}
          target={[0, 0, 0]}
        />
        <Lightformer
          intensity={1.5}
          form="rect"
          scale={[8, 3, 1]}
          position={[0, 5, -4]}
          target={[0, 0, 0]}
        />
      </Environment>
      <HeroCore study={study} look={look} />
      <FirstFrame />
    </SceneTunnel.In>
  );
}
