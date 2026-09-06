import { BufferGeometry, CatmullRomCurve3, Float32BufferAttribute, Vector3 } from "three";

export type TensionStudy = "vertical" | "wide" | "asymmetric";

// Authored rails. Both the metal and pinned textile sample the same curves.
export function tensionRail(t: number, side: number, study: TensionStudy) {
  const a = -1.3 + t * 3.6;
  const wide = study === "wide" ? 1.2 : study === "vertical" ? 0.72 : 1;
  const x = (Math.cos(a) * 1.48 + (side ? -0.57 : 0.35)) * wide;
  const y = Math.sin(a) * (side ? 1.52 : 1.88);
  const z = Math.sin(a * 1.45 + side * 1.8) * 0.54 + side * 0.3;
  return new Vector3(side ? -x : x, y + (side ? -0.28 : 0.15), z);
}

export function railCurve(side: number, study: TensionStudy) {
  return new CatmullRomCurve3(
    Array.from({ length: 65 }, (_, i) => tensionRail(i / 64, side, study)),
  );
}

export function membraneGeometry(
  side: number,
  study: TensionStudy,
  segments: number,
  open = false,
) {
  const positions: number[] = [],
    indices: number[] = [],
    uv: number[] = [];
  for (let i = 0; i <= segments; i++) {
    const u = i / segments;
    const a = tensionRail(u, 0, study),
      b = tensionRail(u, 1, study);
    for (let j = 0; j <= 24; j++) {
      // Two pieces leave a diagonal negative space. Fixed outer edges never move.
      const v =
        side === 0
          ? (j / 24) * (open ? 0.2 : 0.43)
          : (open ? 0.8 : 0.57) + (j / 24) * (open ? 0.2 : 0.43);
      const p = a.clone().lerp(b, v);
      p.z += Math.sin(v * Math.PI) * Math.sin(u * Math.PI) * 0.58;
      p.z += Math.sin(u * 24 + v * 8) * 0.065 * Math.sin(v * Math.PI);
      positions.push(p.x, p.y, p.z);
      uv.push(u, v);
      if (i < segments && j < 24) {
        const k = i * 25 + j;
        indices.push(k, k + 25, k + 1, k + 1, k + 25, k + 26);
      }
    }
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new Float32BufferAttribute(uv, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  if (!open) {
    const target = membraneGeometry(side, study, segments, true);
    geometry.morphAttributes.position = [target.getAttribute("position").clone()];
    geometry.morphAttributes.normal = [target.getAttribute("normal").clone()];
    target.dispose();
  }
  return geometry;
}
