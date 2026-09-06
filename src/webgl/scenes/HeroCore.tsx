"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { DoubleSide, ExtrudeGeometry, Shape, type Group, type Mesh } from "three";
import { useQualityStore } from "../lib/quality-store";
import { membraneGeometry, railCurve, type TensionStudy } from "./tension-geometry";

export function HeroCore({
  study = "asymmetric",
  look = "material",
}: {
  study?: TensionStudy;
  look?: "material" | "clay" | "silhouette";
}) {
  const group = useRef<Group>(null);
  const membranes = useRef<(Mesh | null)[]>([]);
  const viewport = useThree((s) => s.viewport);
  const invalidate = useThree((s) => s.invalidate);
  const progressRef = useRef(0);
  const medium = useQualityStore((s) => s.tier === "medium");
  const reduced = useQualityStore((s) => s.device?.reducedMotion ?? false);
  const compact = viewport.aspect < 1;
  useEffect(() => {
    const update = () => {
      const hero = document.getElementById("tension-hero");
      progressRef.current = hero
        ? Math.max(0, Math.min(1, -hero.getBoundingClientRect().top / hero.offsetHeight))
        : 0;
      invalidate();
    };
    const wake = () => invalidate();
    update();
    if (reduced) return;
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    window.addEventListener("pointermove", wake, { passive: true });
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      window.removeEventListener("pointermove", wake);
    };
  }, [invalidate, reduced]);
  const geometries = useMemo(() => {
    const shape = new Shape();
    const w = 0.16,
      h = 0.045,
      r = 0.025;
    shape.moveTo(-w + r, -h);
    shape.lineTo(w - r, -h);
    shape.quadraticCurveTo(w, -h, w, -h + r);
    shape.lineTo(w, h - r);
    shape.quadraticCurveTo(w, h, w - r, h);
    shape.lineTo(-w + r, h);
    shape.quadraticCurveTo(-w, h, -w, h - r);
    shape.lineTo(-w, -h + r);
    shape.quadraticCurveTo(-w, -h, -w + r, -h);
    return [0, 1].map((side) => ({
      rail: new ExtrudeGeometry(shape, {
        steps: medium ? 100 : 180,
        bevelEnabled: false,
        extrudePath: railCurve(side, study),
        curveSegments: 4,
      }),
      fabric: membraneGeometry(side, study, medium ? 48 : 96),
    }));
  }, [medium, study]);
  useEffect(
    () => () =>
      geometries.forEach(({ rail, fabric }) => {
        rail.dispose();
        fabric.dispose();
      }),
    [geometries],
  );

  useFrame((state, delta) => {
    if (!group.current || reduced) return;
    const progress = progressRef.current;
    membranes.current.forEach((mesh) => {
      if (mesh?.morphTargetInfluences) mesh.morphTargetInfluences[0] = progress;
    });
    const follow = 1 - Math.exp(-Math.min(delta, 0.05) * 7);
    const targetY = -0.3 + (compact ? 0 : state.pointer.x * 0.09) + progress * 0.6;
    const targetX = compact ? 0 : state.pointer.y * -0.05;
    group.current.rotation.y += (targetY - group.current.rotation.y) * follow;
    group.current.rotation.x += (targetX - group.current.rotation.x) * follow;
    if (
      Math.abs(targetY - group.current.rotation.y) +
        Math.abs(targetX - group.current.rotation.x) >
      0.0001
    )
      invalidate();
    group.current.position.y =
      (compact ? viewport.height * 0.205 : viewport.height * 0.035) +
      progress * viewport.height * 0.6;
  });

  return (
    <group
      key={reduced ? "still" : "motion"}
      ref={group}
      position={[
        compact ? 0 : viewport.width * 0.22,
        compact ? viewport.height * 0.205 : viewport.height * 0.035,
        0,
      ]}
      scale={compact ? viewport.width * 0.2 : viewport.height * 0.195}
      rotation={[0, -0.3, -0.28]}
    >
      {geometries.map(({ rail, fabric }, i) => (
        <group key={i}>
          <mesh geometry={rail}>
            {look === "silhouette" ? (
              <meshBasicMaterial color="#191b1b" />
            ) : (
              <meshStandardMaterial
                color={look === "clay" ? "#c8c4b8" : "#a8aca9"}
                metalness={look === "clay" ? 0 : 0.88}
                roughness={look === "clay" ? 0.8 : 0.3}
              />
            )}
          </mesh>
          <mesh
            ref={(mesh) => {
              membranes.current[i] = mesh;
            }}
            args={[fabric]}
          >
            {look === "silhouette" ? (
              <meshBasicMaterial color="#191b1b" side={DoubleSide} />
            ) : (
              <meshPhysicalMaterial
                color={look === "clay" ? "#c8c4b8" : i ? "#d8f36a" : "#e5e2d6"}
                side={DoubleSide}
                roughness={0.68}
                metalness={0.02}
                sheen={0.65}
                sheenRoughness={0.8}
                sheenColor="#fffbe9"
              />
            )}
          </mesh>
        </group>
      ))}
    </group>
  );
}
