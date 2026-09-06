import assert from "node:assert/strict";
import { membraneGeometry } from "../src/webgl/scenes/tension-geometry.ts";

// These invariants protect the pinned edge during the authored opening morph.
for (const study of ["vertical", "wide", "asymmetric"]) {
  for (const segments of [48, 96]) {
    for (const side of [0, 1]) {
      const geometry = membraneGeometry(side, study, segments);
      const base = geometry.getAttribute("position");
      const target = geometry.morphAttributes.position[0];
      assert.equal(base.count, target.count);
      for (const attribute of [
        base,
        target,
        geometry.getAttribute("normal"),
        geometry.morphAttributes.normal[0],
      ]) {
        assert.ok(
          Array.from(attribute.array).every(Number.isFinite),
          "positions and normals must stay finite",
        );
      }
      for (let row = 0; row <= segments; row++) {
        const index = row * 25 + (side === 0 ? 0 : 24);
        assert.ok(Math.abs(base.getX(index) - target.getX(index)) < 1e-6);
        assert.ok(Math.abs(base.getY(index) - target.getY(index)) < 1e-6);
        assert.ok(Math.abs(base.getZ(index) - target.getZ(index)) < 1e-6);
      }
      assert.ok(
        geometry.index.count / 3 < 10000,
        "each membrane must stay below the medium scene budget",
      );
      geometry.dispose();
    }
  }
}
console.log(
  "PASS: 12 membrane variants, fixed outer edges, matching morph topology, finite normals and triangle budget.",
);
