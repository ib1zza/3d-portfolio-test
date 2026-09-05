import tunnel from "tunnel-rat";

/**
 * Канал для полноэкранных сцен, которые должны пережить смену роута:
 * страница объявляет содержимое через <SceneTunnel.In>, а рендерится оно
 * внутри единственного Canvas в корневом layout.
 *
 * Для 3D, привязанного к конкретному DOM-блоку, используется drei/View —
 * см. plans/02-architecture.md, раздел 3.1.
 */
export const SceneTunnel = tunnel();
