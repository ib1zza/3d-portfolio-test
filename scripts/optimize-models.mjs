import { execFileSync } from "node:child_process";
import { mkdirSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

/**
 * Оптимизация GLB: assets-src/models -> public/models.
 * Спецификация: plans/08-asset-pipeline.md, раздел 1.
 *
 * Исходники держим в assets-src, чтобы прогон был идемпотентным: повторная
 * оптимизация уже сжатого файла деградирует геометрию.
 */

const SRC = "assets-src/models";
const OUT = "public/models";

/**
 * --weld и индексация дают основной выигрыш: модели экспортированы из three
 * без индексов, из-за чего каждая вершина хранится столько раз, сколько
 * треугольников её используют.
 *
 * simplify выключен намеренно: у этих моделей от 5 до 33 тысяч вершин, и
 * прореживание на такой сетке заметно ломает силуэт логотипов.
 */
const ARGS = [
  "--compress",
  "meshopt",
  "--texture-compress",
  "webp",
  "--texture-size",
  "1024",
  "--simplify",
  "false",
  "--weld",
  "true",
];
// flatten, join, prune, palette, instance и resample включены в optimize
// по умолчанию. Отдельной опции --dedup у optimize в 4.5.0 нет: это
// самостоятельная команда, а в конвейере её роль закрывают prune и palette.

mkdirSync(OUT, { recursive: true });

const files = readdirSync(SRC).filter((f) => f.endsWith(".glb"));
if (files.length === 0) {
  console.error(`Нет .glb в ${SRC}`);
  process.exit(1);
}

let before = 0;
let after = 0;
const rows = [];

for (const file of files) {
  const input = join(SRC, file);
  const output = join(OUT, file);

  try {
    execFileSync("npx", ["gltf-transform", "optimize", input, output, ...ARGS], {
      stdio: ["ignore", "ignore", "pipe"],
      shell: process.platform === "win32",
    });
  } catch (error) {
    console.error(`✗ ${file}\n${error.stderr?.toString() ?? error.message}`);
    process.exitCode = 1;
    continue;
  }

  const sizeBefore = statSync(input).size;
  const sizeAfter = statSync(output).size;
  before += sizeBefore;
  after += sizeAfter;

  rows.push({
    file,
    было: `${(sizeBefore / 1024).toFixed(0)} КБ`,
    стало: `${(sizeAfter / 1024).toFixed(0)} КБ`,
    экономия: `${(100 - (sizeAfter / sizeBefore) * 100).toFixed(0)}%`,
  });
}

console.table(rows);
console.log(
  `Итого: ${(before / 1024).toFixed(0)} КБ -> ${(after / 1024).toFixed(0)} КБ ` +
    `(${(100 - (after / before) * 100).toFixed(0)}% экономии)`,
);

// Бюджет из plans/07: все модели вместе не должны превышать 2 МБ.
const BUDGET_KB = 2048;
if (after / 1024 > BUDGET_KB) {
  console.error(`Бюджет моделей превышен: ${(after / 1024).toFixed(0)} КБ > ${BUDGET_KB} КБ`);
  process.exitCode = 1;
}
