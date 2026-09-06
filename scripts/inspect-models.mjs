/**
 * Габариты моделей в public/models: из них берутся scale и position сцен
 * (src/content/stages.ts). Подгонять масштаб на глаз в браузере — гадание:
 * GLB приходят от разных авторов и в разных единицах, от сантиметров до метров.
 *
 * Запуск: node scripts/inspect-models.mjs
 */
import { readdirSync } from "node:fs";
import { join } from "node:path";

import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { getBounds } from "@gltf-transform/core";
import { MeshoptDecoder } from "meshoptimizer";

const DIR = "public/models";

const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ "meshopt.decoder": MeshoptDecoder });

const round = (n) => Math.round(n * 1000) / 1000;

for (const file of readdirSync(DIR).filter((f) => f.endsWith(".glb"))) {
  const document = await io.read(join(DIR, file));
  const scene = document.getRoot().getDefaultScene() ?? document.getRoot().listScenes()[0];
  const { min, max } = getBounds(scene);

  const size = [0, 1, 2].map((i) => round(max[i] - min[i]));
  const center = [0, 1, 2].map((i) => round((max[i] + min[i]) / 2));
  // Масштаб, при котором модель занимает 2 юнита по наибольшей стороне —
  // столько влезает в портал витрины при камере z=4.2 и fov 32.
  const fit = round(2 / Math.max(...size));

  console.log(
    `${file.padEnd(26)} size=${size.join(" x ")}  center=${center.join(",")}  fit=${fit}`,
  );
}
