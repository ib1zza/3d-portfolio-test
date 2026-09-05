"use client";

import { Environment, Lightformer } from "@react-three/drei";

import { useQualityStore } from "@/src/webgl/lib/quality-store";
import { SceneTunnel } from "@/src/webgl/tunnel";
import { FocusOrbit } from "./FocusOrbit";
import { HeroCore } from "./HeroCore";
import { ManifestWords } from "./ManifestWords";

/**
 * Мир главной страницы. Все секции живут в одном пространстве вокруг начала
 * координат и передают материю друг другу: активная секция «раздувает» свои
 * объекты, ушедшая — сжимает. Так камере не нужно ездить на километры, а
 * переходы между секциями читаются как одно непрерывное движение.
 *
 * Объявляется через tunnel: сцена принадлежит странице, а рендерится внутри
 * единственного Canvas в layout (plans/02-architecture.md, раздел 3.1).
 */
export function HomeScene() {
  const tier = useQualityStore((s) => s.tier);

  return (
    <SceneTunnel.In>
      <ambientLight intensity={0.45} />
      <directionalLight position={[4, 6, 5]} intensity={1.8} />
      <pointLight position={[-5, -2, 3]} intensity={14} color="#5a4bff" />
      <pointLight position={[5, 2, -3]} intensity={10} color="#ff3da6" />

      {/* Окружение собрано из Lightformer'ов, а не из готового preset:
          preset скачивает HDR-файл с CDN pmndrs, а это внешняя зависимость
          на критическом пути и лишние мегабайты. Здесь отражения рисуются
          процедурно в маленький кубмап. */}
      {tier !== "medium" && (
        <Environment resolution={128} frames={1}>
          <Lightformer
            intensity={2.4}
            form="rect"
            scale={[10, 4, 1]}
            position={[0, 4, -6]}
            color="#ffffff"
          />
          <Lightformer
            intensity={1.6}
            form="circle"
            scale={4}
            position={[-6, 1, 2]}
            color="#5a4bff"
          />
          <Lightformer
            intensity={1.4}
            form="circle"
            scale={4}
            position={[6, -1, 2]}
            color="#ff3da6"
          />
        </Environment>
      )}

      <HeroCore />
      <ManifestWords />
      <FocusOrbit />
    </SceneTunnel.In>
  );
}
