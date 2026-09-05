/**
 * Ставит data-theme до первой отрисовки, чтобы не было вспышки светлой темы
 * у пользователя с тёмной. Выполняется синхронно в <body>, до гидратации.
 */
const script = `
(function () {
  try {
    var stored = localStorage.getItem('matter-theme');
    var theme = stored === 'light' || stored === 'dark'
      ? stored
      : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.dataset.theme = theme;
  } catch (e) {
    document.documentElement.dataset.theme = 'light';
  }
})();
`;

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
