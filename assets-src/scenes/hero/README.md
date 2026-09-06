# TENSION hero — procedural source

The authored source is `src/webgl/scenes/tension-geometry.ts`; assembly, materials and LOD are in `src/webgl/scenes/HeroCore.tsx`. No downloaded GLB or stock sculpture is used by this hero.

- Two individually shaped Catmull–Rom rails; rounded closed cross section, capped ends.
- Two textile surfaces with a diagonal opening. The open morph shares topology and outer attachment points with the rest state; target normals are computed from target geometry.
- Three studies: vertical, wide, asymmetric. The asymmetric study is the initial selection.
- Geometry LOD: 100/180 rail steps, 48/96 textile rows for medium/high. The same studio environment is retained on medium.
- Standard Three.js physical/standard materials; no custom PBR shader, transmission, bloom or chromatic passes.
- Posters in `public/scenes/hero/` are direct captures of the implemented scene. Their source PNGs are in `output/playwright/`.

This is an initial lookdev asset, not a signed-off production sculpture. Next: resolve close-up folds and rail smoothing, add grounded studio shadows, validate the silhouette on physical mobile screens. Do not claim the existing third-party project GLBs have been re-licensed or replaced.
