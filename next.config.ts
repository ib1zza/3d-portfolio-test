import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
};

/**
 * View Transitions: в Next 16.3.4 флаг `experimental.viewTransition` уже удалён.
 * Next бандлит React canary 19.3.0, где `ViewTransition` и `addTransitionType`
 * экспортируются напрямую, а `transitionTypes` доступен на <Link> без флагов.
 * Проверено: node_modules/next/dist/compiled/react.
 *
 * Шейдеры пишутся как tagged template literals в .ts (src/webgl/shaders),
 * поэтому загрузчик .glsl не нужен и бандл остаётся без лишних зависимостей.
 */

export default nextConfig;
