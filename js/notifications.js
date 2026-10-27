/**
 * Single-Instance Right-Side Notification Manager & Custom SVG Icon Library
 * Slides in smoothly from above on the right side outside the main app box.
 */

import { t } from './i18n.js';

export const ICONS = {
  play: `<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="6 4 20 12 6 20 6 4"></polygon></svg>`,
  stop: `<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="6" y="6" width="12" height="12" rx="2"></rect></svg>`,
  arrowUp: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>`,
  arrowDown: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>`,
  alert: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`,
  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`,
  wrench: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>`,
  pulse: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>`,
  info: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`
};

let activeTimeout = null;

export function showNotification({ title, message, icon = 'alert', durationMs = 5600 }) {
  const host = document.getElementById('notification-host');
  if (!host) return;

  if (activeTimeout) {
    clearTimeout(activeTimeout);
    activeTimeout = null;
  }

  host.innerHTML = '';

  const toast = document.createElement('div');
  toast.className = 'app-toast';
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');

  const svgIcon = ICONS[icon] || ICONS.alert;

  toast.innerHTML = `
    <div class="app-toast-icon">${svgIcon}</div>
    <div class="app-toast-body">
      <div class="app-toast-title">${title}</div>
      <div class="app-toast-msg">${message}</div>
    </div>
    <button type="button" class="app-toast-close" aria-label="Dismiss notification">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>
  `;

  host.appendChild(toast);

  const dismiss = () => {
    if (!toast.parentElement) return;
    toast.classList.add('closing');
    setTimeout(() => {
      if (toast.parentElement) {
        toast.remove();
      }
    }, 240);
  };

  const closeBtn = toast.querySelector('.app-toast-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', dismiss);
  }

  if (durationMs > 0) {
    activeTimeout = setTimeout(dismiss, durationMs);
  }
}

export function clearNotification() {
  const host = document.getElementById('notification-host');
  if (!host) return;
  if (activeTimeout) {
    clearTimeout(activeTimeout);
    activeTimeout = null;
  }
  host.innerHTML = '';
}

export function setStartStopButtonContent(btnEl, isRunning) {
  if (!btnEl) return;
  btnEl.classList.toggle('is-running', isRunning);
  btnEl.innerHTML = isRunning
    ? `${ICONS.stop}<span>${t('stopTest')}</span>`
    : `${ICONS.play}<span>${t('startTest')}</span>`;
}
