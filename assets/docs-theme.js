(() => {
  'use strict';
  const key = 'chumpy.site.theme';
  const media = typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-color-scheme: dark)') : { matches: false };
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
  document.addEventListener('click', event => {
    const button = event.target.closest?.('#docs-theme-toggle');
    if (!button) return;
    choice = document.documentElement.dataset.docsTheme === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem(key, choice); } catch {}
    apply();
  });
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', apply, { once: true });
  } else {
    apply();
  }
  const systemChanged = () => { if (!choice) apply(); };
  if (media.addEventListener) media.addEventListener('change', systemChanged);
  else if (media.addListener) media.addListener(systemChanged);
  window.addEventListener('storage', event => {
    if (event.key !== key && event.key !== null) return;
    choice = event.newValue === 'dark' || event.newValue === 'light' ? event.newValue : null;
    apply();
  });
})();
