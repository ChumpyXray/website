(() => {
  'use strict';
  const key = 'chumpy.site.theme';
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  let choice;
  try { choice = localStorage.getItem(key); } catch {}
  if (choice !== 'light' && choice !== 'dark') choice = null;
  function apply() {
    const dark = (choice || (media.matches ? 'dark' : 'light')) === 'dark';
    document.documentElement.dataset.docsTheme = dark ? 'dark' : 'light';
    document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
    const button = document.getElementById('docs-theme-toggle');
    if (button) {
      button.textContent = dark ? 'Светлая тема' : 'Чёрная тема';
      button.setAttribute('aria-label', dark ? 'Включить светлую тему' : 'Включить чёрную тему');
      button.setAttribute('aria-pressed', String(dark));
    }
  }
  apply();
  document.addEventListener('DOMContentLoaded', () => {
    apply();
    document.getElementById('docs-theme-toggle')?.addEventListener('click', () => {
      choice = document.documentElement.dataset.docsTheme === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem(key, choice); } catch {}
      apply();
    });
  }, { once: true });
  media.addEventListener('change', () => { if (!choice) apply(); });
  window.addEventListener('storage', event => {
    if (event.key !== key && event.key !== null) return;
    choice = event.newValue === 'dark' || event.newValue === 'light' ? event.newValue : null;
    apply();
  });
})();
