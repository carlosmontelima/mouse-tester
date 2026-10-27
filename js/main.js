import { initWelcomeScreen } from './welcome.js';
import { createButtonsTest } from './tests/buttonsTest.js';
import { createScrollTest } from './tests/scrollTest.js';
import { createPollingTest } from './tests/pollingTest.js';
import { clearNotification } from './notifications.js';
import { getLang, setLang, t, onLanguageChange, applyStaticTranslations } from './i18n.js';

document.addEventListener('DOMContentLoaded', () => {
  initLanguageController();
  initThemeController();

  const tests = {
    buttons: createButtonsTest(),
    scroll: createScrollTest(),
    polling: createPollingTest()
  };

  const stopAllTests = () => {
    clearNotification();
    Object.values(tests).forEach((tInst) => {
      if (tInst && typeof tInst.stopAndReset === 'function') {
        tInst.stopAndReset();
      }
    });
  };

  initWelcomeScreen({
    onReturnToWelcome: stopAllTests
  });

  // Tab Navigation (guarantees tests never run together)
  const tabButtons = document.querySelectorAll('.tab-btn');
  const testPanels = document.querySelectorAll('.test-panel');

  tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetTab = btn.dataset.tab;
      if (!targetTab) return;

      stopAllTests();

      tabButtons.forEach((b) => {
        const isActive = b === btn;
        b.classList.toggle('active', isActive);
        b.setAttribute('aria-selected', String(isActive));
      });

      testPanels.forEach((panel) => {
        panel.classList.toggle('active', panel.id === `panel-${targetTab}`);
      });
    });
  });
});

function initLanguageController() {
  const langBtn = document.getElementById('lang-toggle-btn');
  applyStaticTranslations();

  if (langBtn) {
    langBtn.addEventListener('click', () => {
      const next = getLang() === 'en' ? 'pt' : 'en';
      setLang(next);
    });
  }
}

function initThemeController() {
  const root = document.documentElement;
  const themeBtn = document.getElementById('theme-toggle-btn');
  const themeLabel = document.getElementById('theme-toggle-label');
  const themeIcon = document.getElementById('theme-toggle-icon');

  const savedTheme = localStorage.getItem('mouse-tester-theme') || 'dark';
  applyTheme(savedTheme);

  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const current = root.getAttribute('data-theme') || 'dark';
      const next = current === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      localStorage.setItem('mouse-tester-theme', next);
    });
  }

  onLanguageChange(() => {
    const current = root.getAttribute('data-theme') || 'dark';
    if (themeLabel) {
      themeLabel.textContent = current === 'dark' ? t('themeLight') : t('themeDark');
    }
  });

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    if (themeLabel) {
      themeLabel.textContent = theme === 'dark' ? t('themeLight') : t('themeDark');
    }
    if (themeIcon) {
      themeIcon.innerHTML =
        theme === 'dark'
          ? `<circle cx="12" cy="12" r="5"></circle>
             <line x1="12" y1="1" x2="12" y2="3"></line>
             <line x1="12" y1="21" x2="12" y2="23"></line>
             <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
             <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
             <line x1="1" y1="12" x2="3" y2="12"></line>
             <line x1="21" y1="12" x2="23" y2="12"></line>
             <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
             <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>`
          : `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>`;
    }
  }
}
