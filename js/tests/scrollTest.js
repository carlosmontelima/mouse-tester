import { TestTimer } from '../timer.js';
import { buildScrollReport, renderDiagnosticReport } from '../diagnostics.js';
import { ICONS, showNotification, setStartStopButtonContent } from '../notifications.js';
import { t, onLanguageChange } from '../i18n.js';

export function createScrollTest() {
  const zoneEl = document.getElementById('scroll-test-zone');
  const startBtn = document.getElementById('scroll-start-btn');
  const resetBtn = document.getElementById('scroll-reset-btn');
  const timerTextEl = document.getElementById('scroll-timer-text');
  const timerDotEl = document.getElementById('scroll-timer-dot');
  const progressFillEl = document.getElementById('scroll-progress-fill');
  const logListEl = document.getElementById('scroll-log-list');
  const reportContainerEl = document.getElementById('scroll-diagnostic-report');
  const canvas = document.getElementById('scroll-canvas');
  const durationPills = document.querySelectorAll('[data-test="scroll"].duration-pill');

  // Metric elements
  const upCountEl = document.getElementById('scroll-up-count');
  const downCountEl = document.getElementById('scroll-down-count');
  const streakEl = document.getElementById('scroll-streak-val');
  const reverseCountEl = document.getElementById('scroll-reverse-count');
  const reverseCardEl = document.getElementById('scroll-reverse-card');
  const svgWheelEl = document.getElementById('svg-scroll-wheel-part');
  const liveDirectionPillEl = document.getElementById('scroll-live-direction');

  let state = {
    upSteps: 0,
    downSteps: 0,
    reverseAnomalies: 0,
    anomaliesBeforeOppositeStreak: 0,
    erraticSpikes: 0,
    lockedDir: null, // 'UP' | 'DOWN' — locked on first scroll tick of the test
    consecutiveOppositeTicks: 0,
    streakCount: 0,
    lastTickTime: 0,
    lastDeltaAbs: 0,
    stepHistory: [],
    durationSec: 30,
    finished: false
  };

  function dirText(dirCode) {
    if (!dirCode) return t('notLockedYet');
    return dirCode === 'UP' ? t('dirUp') : t('dirDown');
  }

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
      state.finished = true;
      showNotification({
        title:
          state.reverseAnomalies > 0
            ? t('notifScrollDoneFaultTitle')
            : t('notifScrollDoneOkTitle'),
        message:
          state.reverseAnomalies > 0
            ? t('notifScrollDoneFaultMsg', { count: state.reverseAnomalies })
            : t('notifScrollDoneOkMsg', {
                steps: state.upSteps + state.downSteps,
                dir: dirText(state.lockedDir || 'DOWN')
              }),
        icon: state.reverseAnomalies > 0 ? 'alert' : 'check'
      });
      const report = buildScrollReport(state);
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

  function drawScrollStepsGraph() {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = (canvas.width = canvas.offsetWidth || 540);
    const h = (canvas.height = canvas.offsetHeight || 132);
    const midY = h / 2;

    ctx.clearRect(0, 0, w, h);

    ctx.strokeStyle = 'rgba(168, 85, 247, 0.12)';
    ctx.lineWidth = 1;
    [0.22, 0.78].forEach((ratio) => {
      ctx.beginPath();
      ctx.moveTo(0, h * ratio);
      ctx.lineTo(w, h * ratio);
      ctx.stroke();
    });

    ctx.strokeStyle = 'rgba(192, 132, 252, 0.32)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(0, midY);
    ctx.lineTo(w, midY);
    ctx.stroke();

    ctx.fillStyle = 'rgba(192, 132, 252, 0.55)';
    ctx.font = '600 10px Inter, sans-serif';
    ctx.fillText(t('canvasUpSteps'), 10, 16);
    ctx.fillText(t('canvasDownSteps'), 10, h - 8);

    const hist = state.stepHistory;
    if (hist.length === 0) return;

    const maxVisible = 46;
    const slice = hist.slice(-maxVisible);
    const slotW = w / maxVisible;

    ctx.save();

    ctx.beginPath();
    slice.forEach((step, idx) => {
      const x = idx * slotW + slotW * 0.5;
      const normMag = Math.min(1, Math.max(0.28, step.deltaAbs / 140));
      const offset = normMag * (midY - 18);
      const y = step.dir === 'UP' ? midY - offset : midY + offset;
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = 'rgba(192, 132, 252, 0.45)';
    ctx.lineWidth = 1.8;
    ctx.stroke();

    slice.forEach((step, idx) => {
      const x = idx * slotW + slotW * 0.5;
      const normMag = Math.min(1, Math.max(0.28, step.deltaAbs / 140));
      const offset = normMag * (midY - 18);
      const y = step.dir === 'UP' ? midY - offset : midY + offset;

      ctx.beginPath();
      ctx.moveTo(x, midY);
      ctx.lineTo(x, y);
      ctx.strokeStyle = step.isReverseFault
        ? '#e879f9'
        : step.isIgnoredOpposite
        ? 'rgba(168, 85, 247, 0.35)'
        : '#a855f7';
      ctx.lineWidth = step.isReverseFault ? 3.2 : 2.2;
      ctx.shadowColor = step.isReverseFault ? '#e879f9' : '#a855f7';
      ctx.shadowBlur = step.isReverseFault ? 12 : 6;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(x, y, step.isReverseFault ? 4.5 : 3, 0, Math.PI * 2);
      ctx.fillStyle = step.isReverseFault ? '#ffffff' : '#d8b4fe';
      ctx.fill();

      if (step.isReverseFault) {
        ctx.beginPath();
        ctx.arc(x, y, 7.5, 0, Math.PI * 2);
        ctx.strokeStyle = '#e879f9';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    });

    ctx.restore();
  }

  function updateUI() {
    if (upCountEl) upCountEl.textContent = String(state.upSteps);
    if (downCountEl) downCountEl.textContent = String(state.downSteps);
    if (streakEl) {
      streakEl.textContent = state.lockedDir ? dirText(state.lockedDir) : t('notLockedYet');
    }
    if (reverseCountEl) reverseCountEl.textContent = String(state.reverseAnomalies);
    if (reverseCardEl) {
      reverseCardEl.classList.toggle('fault-detected', state.reverseAnomalies > 0);
    }
    drawScrollStepsGraph();
  }

  function resetAll() {
    timer.stop(true);
    state = {
      upSteps: 0,
      downSteps: 0,
      reverseAnomalies: 0,
      anomaliesBeforeOppositeStreak: 0,
      erraticSpikes: 0,
      lockedDir: null,
      consecutiveOppositeTicks: 0,
      streakCount: 0,
      lastTickTime: 0,
      lastDeltaAbs: 0,
      stepHistory: [],
      durationSec: timer.durationSec,
      finished: false
    };
    updateUI();
    if (liveDirectionPillEl) {
      liveDirectionPillEl.innerHTML = `<span>${t('clickStartToBegin')}</span>`;
    }
    if (logListEl) {
      logListEl.innerHTML = `<li class="anomaly-log-item">${t('scrollLogReady')}</li>`;
    }
    if (reportContainerEl) {
      reportContainerEl.classList.remove('visible');
      reportContainerEl.innerHTML = '';
    }
  }

  onLanguageChange(() => {
    setStartStopButtonContent(startBtn, timer.isRunning);
    updateUI();
    if (!timer.isRunning && state.upSteps + state.downSteps === 0) {
      if (liveDirectionPillEl) {
        liveDirectionPillEl.innerHTML = `<span>${t('clickStartToBegin')}</span>`;
      }
      if (logListEl) {
        logListEl.innerHTML = `<li class="anomaly-log-item">${t('scrollLogReady')}</li>`;
      }
    }
    if (state.finished && reportContainerEl && reportContainerEl.classList.contains('visible')) {
      renderDiagnosticReport(reportContainerEl, buildScrollReport(state));
    }
  });

  durationPills.forEach((pill) => {
    pill.addEventListener('click', () => {
      if (timer.isRunning) return;
      const sec = Number(pill.dataset.seconds) || 30;
      durationPills.forEach((p) => p.classList.toggle('active', p === pill));
      timer.setDuration(sec);
      state.durationSec = sec;
    });
  });

  if (startBtn) {
    setStartStopButtonContent(startBtn, false);
    startBtn.addEventListener('click', () => {
      if (timer.isRunning) {
        timer.stop(true);
        appendLog(t('scrollLogStopped'), 'normal');
      } else {
        resetAll();
        timer.start();
        if (liveDirectionPillEl) {
          liveDirectionPillEl.innerHTML = `<span>${t('scrollWaitingFirstDir')}</span>`;
        }
        appendLog(t('scrollLogStarted'), 'normal');
      }
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', resetAll);
  }

  window.addEventListener('resize', drawScrollStepsGraph);
  setTimeout(drawScrollStepsGraph, 60);

  if (zoneEl) {
    zoneEl.addEventListener(
      'wheel',
      (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!timer.isRunning) return;
        if (e.deltaY === 0) return;

        const now = performance.now();
        const dir = e.deltaY > 0 ? 'DOWN' : 'UP';
        const deltaAbs = Math.abs(e.deltaY);
        const intervalMs = state.lastTickTime > 0 ? now - state.lastTickTime : 9999;

        // First scroll movement of the session locks the target direction!
        if (!state.lockedDir) {
          state.lockedDir = dir;
          state.streakCount = 1;
          state.consecutiveOppositeTicks = 0;
          if (dir === 'DOWN') state.downSteps += 1;
          else state.upSteps += 1;

          state.stepHistory.push({
            dir,
            deltaAbs,
            isReverseFault: false,
            isIgnoredOpposite: false
          });

          appendLog(t('scrollLogLocked', { dir: dirText(dir) }), 'normal');

          if (liveDirectionPillEl) {
            const dirIcon = dir === 'DOWN' ? ICONS.arrowDown : ICONS.arrowUp;
            liveDirectionPillEl.innerHTML = `${dirIcon}<span>${t('scrollLockedBadge', {
              locked: dirText(state.lockedDir),
              dir: dirText(dir),
              streak: state.streakCount
            })}</span>`;
          }

          state.lastTickTime = now;
          state.lastDeltaAbs = deltaAbs;
          updateUI();
          return;
        }

        let isReverseFault = false;
        let isIgnoredOpposite = false;

        if (dir === state.lockedDir) {
          // User is scrolling in the locked session direction
          state.consecutiveOppositeTicks = 0;
          state.streakCount += 1;
          if (dir === 'DOWN') state.downSteps += 1;
          else state.upSteps += 1;

          if (
            state.lastDeltaAbs > 0 &&
            intervalMs < 120 &&
            deltaAbs > state.lastDeltaAbs * 4.2 &&
            deltaAbs > 240
          ) {
            state.erraticSpikes += 1;
            const warnMsg = t('notifIrregularStepMsg', {
              curr: Math.round(deltaAbs),
              prev: Math.round(state.lastDeltaAbs),
              dir: dirText(dir)
            });
            showNotification({
              title: t('notifIrregularStepTitle'),
              message: warnMsg,
              icon: 'alert'
            });
            appendLog(warnMsg, 'warn');
          }

          if (liveDirectionPillEl) {
            const dirIcon = dir === 'DOWN' ? ICONS.arrowDown : ICONS.arrowUp;
            liveDirectionPillEl.innerHTML = `${dirIcon}<span>${t('scrollLockedBadge', {
              locked: dirText(state.lockedDir),
              dir: dirText(dir),
              streak: state.streakCount
            })}</span>`;
          }
        } else {
          // Opposite direction tick relative to state.lockedDir!
          state.consecutiveOppositeTicks += 1;

          if (state.consecutiveOppositeTicks === 1) {
            state.anomaliesBeforeOppositeStreak = state.reverseAnomalies;
          }

          if (state.consecutiveOppositeTicks <= 2) {
            // 1–2 isolated opposite ticks during locked-direction test -> Reverse Scroll Bounce Fault
            isReverseFault = true;
            state.reverseAnomalies += 1;
            if (dir === 'DOWN') state.downSteps += 1;
            else state.upSteps += 1;

            const alertMsg = t('notifReverseMsg', {
              locked: dirText(state.lockedDir),
              dir: dirText(dir),
              ms: intervalMs < 2000 ? intervalMs.toFixed(0) : '0'
            });

            showNotification({
              title: t('notifReverseTitle'),
              message: alertMsg,
              icon: 'alert'
            });
            appendLog(alertMsg, 'fault');

            if (zoneEl) {
              zoneEl.classList.add('anomaly-flash');
              setTimeout(() => zoneEl.classList.remove('anomaly-flash'), 550);
            }
            if (svgWheelEl) {
              svgWheelEl.classList.add('fault-part');
              setTimeout(() => svgWheelEl.classList.remove('fault-part'), 650);
            }

            if (liveDirectionPillEl) {
              liveDirectionPillEl.innerHTML = `${ICONS.alert}<span>${t('scrollReverseJumpBadge', {
                dir: dirText(dir),
                locked: dirText(state.lockedDir)
              })}</span>`;
            }
          } else if (state.consecutiveOppositeTicks === 3) {
            // 3 consecutive opposite ticks means the user intentionally started scrolling the other way!
            // Roll back the tentative reverse fault from ticks #1 and #2 so there is NO false positive:
            state.reverseAnomalies = state.anomaliesBeforeOppositeStreak;
            isIgnoredOpposite = true;

            // Convert the previous 2 stepHistory items from fault to ignored intentional opposite
            for (
              let i = state.stepHistory.length - 1;
              i >= 0 && i >= state.stepHistory.length - 2;
              i--
            ) {
              if (state.stepHistory[i].dir === dir) {
                state.stepHistory[i].isReverseFault = false;
                state.stepHistory[i].isIgnoredOpposite = true;
              }
            }

            const intentionalMsg = t('notifIntentionalOppositeMsg', {
              locked: dirText(state.lockedDir),
              dir: dirText(dir)
            });

            showNotification({
              title: t('notifIntentionalOppositeTitle'),
              message: intentionalMsg,
              icon: 'info',
              durationMs: 6500
            });
            appendLog(intentionalMsg, 'warn');

            if (liveDirectionPillEl) {
              liveDirectionPillEl.innerHTML = `${ICONS.info}<span>${t('scrollOppositeWarnBadge', {
                dir: dirText(dir),
                locked: dirText(state.lockedDir)
              })}</span>`;
            }
          } else {
            // 4+ consecutive opposite ticks: keep ignoring without false positives
            isIgnoredOpposite = true;
            if (liveDirectionPillEl) {
              liveDirectionPillEl.innerHTML = `${ICONS.info}<span>${t('scrollOppositeWarnBadge', {
                dir: dirText(dir),
                locked: dirText(state.lockedDir)
              })}</span>`;
            }
          }
        }

        state.stepHistory.push({
          dir,
          deltaAbs,
          isReverseFault,
          isIgnoredOpposite
        });
        if (state.stepHistory.length > 80) {
          state.stepHistory.shift();
        }

        if (svgWheelEl && !isReverseFault) {
          svgWheelEl.classList.add('pressed');
          clearTimeout(svgWheelEl._wheelTimeout);
          svgWheelEl._wheelTimeout = setTimeout(() => {
            svgWheelEl.classList.remove('pressed');
          }, 140);
        }

        state.lastTickTime = now;
        state.lastDeltaAbs = deltaAbs;
        updateUI();
      },
      { passive: false }
    );
  }

  return {
    stopAndReset: resetAll
  };
}
