/**
 * Ставит data-theme до первой отрисовки, чтобы тема не переключалась вспышкой
 * после гидратации. Выполняется синхронно в <body>, до неё.
 *
 * Системная тема здесь намеренно не учитывается: светлая тёплая палитра — это
 * идентичность сайта, под неё выставлен свет в сцене и подобраны акценты
 * (plans/10-art-direction-v2.md). Отдавать её системной настройке значит
 * показать большинству посетителей не тот сайт, который спроектирован.
 * Тёмная остаётся выбором пользователя и запоминается.
 */
const script = `
(function () {
  // Флаг наличия JS. Анимации появления скрывают текст до входа в кадр, и без
  // этого флага при отключённом JS страница осталась бы пустой: наблюдатель,
  // который возвращает текст, просто не запустится.
  //
  // Атрибут, а не класс: className на <html> задаётся из React (переменные
  // шрифтов), и добавленный сюда класс исчез бы при первом же ререндере.
  document.documentElement.dataset.js = 'on';

  try {
    var stored = localStorage.getItem('matter-theme');
    document.documentElement.dataset.theme = stored === 'dark' ? 'dark' : 'light';
  } catch (e) {
    document.documentElement.dataset.theme = 'light';
  }
})();
`;

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
