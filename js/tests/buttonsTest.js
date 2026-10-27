import { TestTimer } from '../timer.js';
import { buildButtonsReport, renderDiagnosticReport } from '../diagnostics.js';
import { showNotification, setStartStopButtonContent } from '../notifications.js';
import { t, onLanguageChange } from '../i18n.js';

const DOUBLE_CLICK_THRESHOLD_MS = 80;
const HOLD_DROP_THRESHOLD_MS = 45;

export function createButtonsTest() {
  const zoneEl = document.getElementById('buttons-test-zone');
  const startBtn = document.getElementById('buttons-start-btn');
  const resetBtn = document.getElementById('buttons-reset-btn');
  const timerTextEl = document.getElementById('buttons-timer-text');
  const timerDotEl = document.getElementById('buttons-timer-dot');
  const progressFillEl = document.getElementById('buttons-progress-fill');
  const logListEl = document.getElementById('buttons-log-list');
  const reportContainerEl = document.getElementById('buttons-diagnostic-report');
  const durationPills = document.querySelectorAll('[data-test="buttons"].duration-pill');

  const buttonState = {};
  const initState = () => {
    [0, 1, 2, 3, 4].forEach((b) => {
      buttonState[b] = {
        clicks: 0,
        doubleClicks: 0,
        holdDrops: 0,
        minDeltaMs: null,
        lastDownTime: 0,
        lastUpTime: 0,
        lastHoldDuration: 0,
        isDown: false
      };
    });
  };

  let sessionStats = {
    totalClicks: 0,
    doubleClicks: 0,
    holdDrops: 0,
    faultyButtons: new Set(),
    durationSec: 30,
    finished: false
  };

  const timer = new TestTimer({
    durationSec: 30,
    onTick: ({ formatted, progressPct }) => {
      if (timerTextEl) timerTextEl.textContent = formatted;
      if (progressFillEl) progressFillEl.style.width = `${progressPct}%`;
    },
    onStateChange: (running) => {
      if (timerDotEl) timerDotEl.classList.toggle('running', running);
      setStartStopButtonContent(startBtn, running);
      if (zoneEl) zoneEl.classList.toggle('active-zone', running);
      durationPills.forEach((pill) => {
        pill.disabled = running;
      });
    },
    onComplete: () => {
      sessionStats.finished = true;
      const totalFaults = sessionStats.doubleClicks + sessionStats.holdDrops;
      showNotification({
        title: totalFaults > 0 ? t('notifButtonsDoneFaultTitle') : t('notifButtonsDoneOkTitle'),
        message:
          totalFaults > 0
            ? t('notifButtonsDoneFaultMsg', { count: totalFaults })
            : t('notifButtonsDoneOkMsg', { clicks: sessionStats.totalClicks }),
        icon: totalFaults > 0 ? 'alert' : 'check'
      });
      const report = buildButtonsReport(sessionStats);
      renderDiagnosticReport(reportContainerEl, report);
    }
  });

  function appendLog(text, type = 'normal') {
    if (!logListEl) return;
    const li = document.createElement('li');
    li.className = `anomaly-log-item ${type}`;
    const timeStr = new Date().toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' });
    li.textContent = `[${timeStr}] ${text}`;
    logListEl.prepend(li);
    while (logListEl.children.length > 30) {
      logListEl.removeChild(logListEl.lastChild);
    }
  }

  function updateMetricCards() {
    [0, 1, 2, 3, 4].forEach((b) => {
      const st = buttonState[b];
      const countEl = document.getElementById(`btn-count-${b}`);
      const subEl = document.getElementById(`btn-sub-${b}`);
      const cardEl = document.getElementById(`btn-card-${b}`);
      if (countEl) countEl.textContent = String(st.clicks);
      if (subEl) {
        const minStr =
          st.minDeltaMs !== null ? `${Math.round(st.minDeltaMs)}${t('minSuffix')}` : t('noDeltaYet');
        const faults = st.doubleClicks + st.holdDrops;
        subEl.textContent = faults > 0 ? `${faults} ${t('faultSuffix')} (${minStr})` : minStr;
      }
      if (cardEl) {
        cardEl.classList.toggle('fault-detected', st.doubleClicks + st.holdDrops > 0);
      }
    });
  }

  function highlightMouseSvgPart(buttonIdx, isPressed, isFault = false) {
    const partEl = document.getElementById(`svg-btn-part-${buttonIdx}`);
    const cardEl = document.getElementById(`btn-card-${buttonIdx}`);
    if (partEl) {
      partEl.classList.toggle('pressed', isPressed);
      if (isFault) {
        partEl.classList.add('fault-part');
        setTimeout(() => partEl.classList.remove('fault-part'), 700);
      }
    }
    if (cardEl) {
      cardEl.classList.toggle('active-hit', isPressed);
    }
  }

  function resetAll() {
    timer.stop(true);
    initState();
    sessionStats = {
      totalClicks: 0,
      doubleClicks: 0,
      holdDrops: 0,
      faultyButtons: new Set(),
      durationSec: timer.durationSec,
      finished: false
    };
    updateMetricCards();
    if (logListEl) {
      logListEl.innerHTML = `<li class="anomaly-log-item">${t('buttonsLogReady')}</li>`;
    }
    if (reportContainerEl) {
      reportContainerEl.classList.remove('visible');
      reportContainerEl.innerHTML = '';
    }
  }

  onLanguageChange(() => {
    setStartStopButtonContent(startBtn, timer.isRunning);
    updateMetricCards();
    if (sessionStats.totalClicks === 0 && !timer.isRunning && logListEl) {
      logListEl.innerHTML = `<li class="anomaly-log-item">${t('buttonsLogReady')}</li>`;
    }
    if (sessionStats.finished && reportContainerEl && reportContainerEl.classList.contains('visible')) {
      renderDiagnosticReport(reportContainerEl, buildButtonsReport(sessionStats));
    }
  });

  durationPills.forEach((pill) => {
    pill.addEventListener('click', () => {
      if (timer.isRunning) return;
      const sec = Number(pill.dataset.seconds) || 30;
      durationPills.forEach((p) => p.classList.toggle('active', p === pill));
      timer.setDuration(sec);
      sessionStats.durationSec = sec;
    });
  });

  if (startBtn) {
    setStartStopButtonContent(startBtn, false);
    startBtn.addEventListener('click', () => {
      if (timer.isRunning) {
        timer.stop(true);
        appendLog(t('buttonsLogStopped'), 'normal');
      } else {
        resetAll();
        timer.start();
        appendLog(t('buttonsLogStarted'), 'normal');
      }
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', resetAll);
  }

  if (zoneEl) {
    zoneEl.addEventListener('contextmenu', (e) => e.preventDefault());

    zoneEl.addEventListener('mousedown', (e) => {
      e.preventDefault();
      if (!timer.isRunning) return;

      const btn = e.button;
      if (!(btn in buttonState)) return;

      const now = performance.now();
      const st = buttonState[btn];
      const btnLabel = t(`btnName${btn}`);

      st.clicks += 1;
      sessionStats.totalClicks += 1;
      st.isDown = true;

      let faultTriggered = false;

      if (st.lastUpTime > 0 && st.lastHoldDuration > 160) {
        const releaseGap = now - st.lastUpTime;
        if (releaseGap > 0 && releaseGap < HOLD_DROP_THRESHOLD_MS) {
          st.holdDrops += 1;
          sessionStats.holdDrops += 1;
          sessionStats.faultyButtons.add(btn);
          faultTriggered = true;

          const msg = t('notifHoldDropMsg', { btn: btnLabel, ms: releaseGap.toFixed(1) });
          showNotification({
            title: t('notifHoldDropTitle'),
            message: msg,
            icon: 'alert'
          });
          appendLog(msg, 'fault');
        }
      }

      if (st.lastDownTime > 0) {
        const delta = now - st.lastDownTime;
        if (st.minDeltaMs === null || delta < st.minDeltaMs) {
          st.minDeltaMs = delta;
        }

        if (delta < DOUBLE_CLICK_THRESHOLD_MS && !faultTriggered) {
          st.doubleClicks += 1;
          sessionStats.doubleClicks += 1;
          sessionStats.faultyButtons.add(btn);
          faultTriggered = true;

          const msg = t('notifDoubleClickMsg', { btn: btnLabel, ms: delta.toFixed(1) });
          showNotification({
            title: t('notifDoubleClickTitle'),
            message: msg,
            icon: 'alert'
          });
          appendLog(msg, 'fault');
        } else if (!faultTriggered) {
          appendLog(t('buttonsLogPressed', { btn: btnLabel, ms: delta.toFixed(0) }), 'normal');
        }
      } else {
        appendLog(t('buttonsLogFirstPress', { btn: btnLabel }), 'normal');
      }

      if (faultTriggered && zoneEl) {
        zoneEl.classList.add('anomaly-flash');
        setTimeout(() => zoneEl.classList.remove('anomaly-flash'), 500);
      }

      st.lastDownTime = now;
      highlightMouseSvgPart(btn, true, faultTriggered);
      updateMetricCards();
    });

    window.addEventListener('mouseup', (e) => {
      const btn = e.button;
      if (!(btn in buttonState)) return;
      const st = buttonState[btn];
      if (st.isDown) {
        const now = performance.now();
        st.lastHoldDuration = now - st.lastDownTime;
        st.lastUpTime = now;
        st.isDown = false;
        highlightMouseSvgPart(btn, false, false);
      }
      if ((btn === 3 || btn === 4) && zoneEl.matches(':hover')) {
        e.preventDefault();
      }
    });
  }

  initState();

  return {
    stopAndReset: resetAll
  };
}
