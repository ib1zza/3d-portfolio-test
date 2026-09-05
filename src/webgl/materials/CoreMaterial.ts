import { Color, ShaderMaterial } from "three";

import { simplexNoise3D } from "@/src/webgl/shaders/noise";

/**
 * Материал ядра — центрального объекта героя.
 *
 * Смысл приёма: поверхность не «объект с текстурой», а неспокойная материя.
 * Вершины гуляют по фрактальному шуму, скорость скролла растягивает форму по
 * направлению движения, а по кромке идёт френелевский подсвет акцентом.
 * См. plans/05-shaders-and-effects.md, разделы 3 и 10.
 *
 * Нормали пересчитываются в вершинном шейдере численно: аналитическая
 * производная fbm получилась бы дороже трёх дополнительных выборок шума.
 */

const vertexShader = /* glsl */ `
uniform float uTime;
uniform float uAmplitude;
uniform float uFrequency;
uniform float uStretch;
uniform int   uOctaves;

varying vec3 vNormalW;
varying vec3 vViewDir;
varying float vDisplacement;

${simplexNoise3D}

float surface(vec3 p) {
  return fbm(p * uFrequency + vec3(0.0, uTime * 0.25, 0.0), uOctaves);
}

/**
 * Геометрия — сфера с центром в начале координат, поэтому нормаль в любой
 * точке равна normalize(p). Это позволяет посчитать смещённую позицию для
 * произвольной точки, а не только для вершин сетки — и получить честную
 * нормаль по двум соседям вместо интерполяции исходной.
 */
vec3 displaced(vec3 p) {
  return p + normalize(p) * surface(p) * uAmplitude;
}

void main() {
  float d = surface(position);

  // Касательный базис. vec3(0,1,0) вырождается на полюсах, поэтому там
  // берём другую опорную ось.
  vec3 n = normalize(position);
  vec3 up = abs(n.y) > 0.99 ? vec3(1.0, 0.0, 0.0) : vec3(0.0, 1.0, 0.0);
  vec3 tangent = normalize(cross(up, n));
  vec3 bitangent = cross(n, tangent);

  float eps = 0.06 / max(uFrequency, 0.001);
  vec3 p0 = displaced(position);
  vec3 p1 = displaced(position + tangent * eps);
  vec3 p2 = displaced(position + bitangent * eps);

  vec3 newNormal = normalize(cross(p1 - p0, p2 - p0));
  // cross даёт нормаль с точностью до знака; выравниваем по исходной.
  newNormal *= sign(dot(newNormal, n));

  vec3 pos = p0;
  // Растяжение по вертикали от скорости скролла: объект «тянется» за движением.
  pos.y *= 1.0 + uStretch * 0.35;
  pos.xz *= 1.0 - uStretch * 0.12;

  vNormalW = normalize(normalMatrix * newNormal);
  vDisplacement = d;

  vec4 world = modelMatrix * vec4(pos, 1.0);
  vViewDir = normalize(cameraPosition - world.xyz);

  gl_Position = projectionMatrix * viewMatrix * world;
}
`;

const fragmentShader = /* glsl */ `
uniform vec3  uColor;
uniform vec3  uAccent;
uniform float uRimPower;
uniform float uGlow;

varying vec3 vNormalW;
varying vec3 vViewDir;
varying float vDisplacement;

void main() {
  vec3 n = normalize(vNormalW);

  // Один направленный свет прямо в шейдере: полноценная модель освещения
  // здесь не нужна, а лишние проходы стоят кадров на мобилке.
  float diffuse = clamp(dot(n, normalize(vec3(0.4, 0.8, 0.6))), 0.0, 1.0);

  float fresnel = pow(1.0 - clamp(dot(n, normalize(vViewDir)), 0.0, 1.0), uRimPower);

  vec3 base = mix(uColor * 0.35, uColor, diffuse);

  // Впадины подсвечиваются акцентом — материя выглядит светящейся изнутри.
  float veins = smoothstep(0.15, -0.35, vDisplacement);
  vec3 color = base + uAccent * (fresnel * uGlow + veins * 0.55);

  gl_FragColor = vec4(color, 1.0);
}
`;

export interface CoreMaterialUniforms {
  uTime: number;
  uAmplitude: number;
  uFrequency: number;
  uStretch: number;
  uOctaves: number;
  uColor: Color;
  uAccent: Color;
  uRimPower: number;
  uGlow: number;
}

export function createCoreMaterial(octaves: number): ShaderMaterial {
  return new ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uTime: { value: 0 },
      uAmplitude: { value: 0.32 },
      uFrequency: { value: 1.1 },
      uStretch: { value: 0 },
      uOctaves: { value: octaves },
      uColor: { value: new Color("#1b1b3a") },
      uAccent: { value: new Color("#5a4bff") },
      uRimPower: { value: 2.4 },
      uGlow: { value: 1.6 },
    },
  });
}
