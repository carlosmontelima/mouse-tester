import { TestTimer } from '../timer.js';
import { buildScrollReport, renderDiagnosticReport } from '../diagnostics.js';
import { ICONS, showNotification, setStartStopButtonContent } from '../notifications.js';

const REVERSE_BOUNCE_STREAK_WINDOW_MS = 260;
const SINGLE_DETENT_BOUNCE_MS = 95;

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
    erraticSpikes: 0,
    streakDir: null,
    streakCount: 0,
    lastTickTime: 0,
    lastDeltaAbs: 0,
    stepHistory: [],
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
      state.finished = true;
      showNotification({
        title:
          state.reverseAnomalies > 0
            ? 'Scroll Test Complete — Reverse Scroll Detected'
            : 'Scroll Test Complete — Encoder Healthy',
        message:
          state.reverseAnomalies > 0
            ? `Detected ${state.reverseAnomalies} reverse scroll anomaly event(s). View the hypothesis and fix guide below.`
            : `Analyzed ${state.upSteps + state.downSteps} scroll steps with zero reverse scroll jumps.`,
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

    // Subtle upper (UP) and lower (DOWN) guide lines + center zero baseline
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

    // Labels for UP / DOWN zones
    ctx.fillStyle = 'rgba(192, 132, 252, 0.55)';
    ctx.font = '600 10px Inter, sans-serif';
    ctx.fillText('UP STEPS', 10, 16);
    ctx.fillText('DOWN STEPS', 10, h - 8);

    const hist = state.stepHistory;
    if (hist.length === 0) return;

    const maxVisible = 46;
    const slice = hist.slice(-maxVisible);
    const slotW = w / maxVisible;

    ctx.save();

    // Connect step trajectory line
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

    // Draw individual step bars and nodes
    slice.forEach((step, idx) => {
      const x = idx * slotW + slotW * 0.5;
      const normMag = Math.min(1, Math.max(0.28, step.deltaAbs / 140));
      const offset = normMag * (midY - 18);
      const y = step.dir === 'UP' ? midY - offset : midY + offset;

      // Step impulse bar from center line
      ctx.beginPath();
      ctx.moveTo(x, midY);
      ctx.lineTo(x, y);
      ctx.strokeStyle = step.isReverseFault ? '#e879f9' : '#a855f7';
      ctx.lineWidth = step.isReverseFault ? 3.2 : 2.2;
      ctx.shadowColor = step.isReverseFault ? '#e879f9' : '#a855f7';
      ctx.shadowBlur = step.isReverseFault ? 12 : 6;
      ctx.stroke();

      // Step tip node
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
      streakEl.textContent = state.streakDir ? `${state.streakDir} x${state.streakCount}` : 'Idle';
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
      erraticSpikes: 0,
      streakDir: null,
      streakCount: 0,
      lastTickTime: 0,
      lastDeltaAbs: 0,
      stepHistory: [],
      durationSec: timer.durationSec,
      finished: false
    };
    updateUI();
    if (liveDirectionPillEl) {
      liveDirectionPillEl.innerHTML = '<span>Click "Start Test" to Begin</span>';
    }
    if (logListEl) {
      logListEl.innerHTML =
        '<li class="anomaly-log-item">Click "Start Test" above, then roll the scroll wheel inside the target box.</li>';
    }
    if (reportContainerEl) {
      reportContainerEl.classList.remove('visible');
      reportContainerEl.innerHTML = '';
    }
  }

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
        appendLog('Scroll test stopped manually.', 'normal');
      } else {
        resetAll();
        timer.start();
        if (liveDirectionPillEl) {
          liveDirectionPillEl.innerHTML = '<span>Test Running — Scroll Up or Down Now</span>';
        }
        appendLog('Scroll test started — roll your wheel continuously Down, then Up.', 'normal');
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
        // Lock page scroll while hovering inside scroll arena
        e.preventDefault();
        e.stopPropagation();

        // Strictly require Start Test button to be clicked first
        if (!timer.isRunning) return;
        if (e.deltaY === 0) return;

        const now = performance.now();
        const dir = e.deltaY > 0 ? 'DOWN' : 'UP';
        const deltaAbs = Math.abs(e.deltaY);
        const intervalMs = state.lastTickTime > 0 ? now - state.lastTickTime : 9999;

        if (dir === 'DOWN') {
          state.downSteps += 1;
        } else {
          state.upSteps += 1;
        }

        let isReverseFault = false;

        // Detect Reverse Scroll Anomaly:
        if (
          state.streakDir &&
          state.streakDir !== dir &&
          ((state.streakCount >= 2 && intervalMs < REVERSE_BOUNCE_STREAK_WINDOW_MS) ||
            intervalMs < SINGLE_DETENT_BOUNCE_MS)
        ) {
          isReverseFault = true;
          state.reverseAnomalies += 1;

          const intendedDir = state.streakDir;
          const reverseDir = dir;
          const alertMsg = `You were scrolling ${intendedDir}, but the scroll wheel jumped ${reverseDir} (${intervalMs.toFixed(0)}ms bounce).`;

          showNotification({
            title: 'Reverse Scroll Detected',
            message: alertMsg,
            icon: 'alert'
          });
          appendLog(`REVERSE SCROLL FAULT: ${alertMsg}`, 'fault');

          if (zoneEl) {
            zoneEl.classList.add('anomaly-flash');
            setTimeout(() => zoneEl.classList.remove('anomaly-flash'), 550);
          }
          if (svgWheelEl) {
            svgWheelEl.classList.add('fault-part');
            setTimeout(() => svgWheelEl.classList.remove('fault-part'), 650);
          }

          state.streakDir = dir;
          state.streakCount = 1;
        } else {
          if (
            state.lastDeltaAbs > 0 &&
            intervalMs < 120 &&
            deltaAbs > state.lastDeltaAbs * 4.2 &&
            deltaAbs > 240
          ) {
            state.erraticSpikes += 1;
            const warnMsg = `Irregular scroll step magnitude (${Math.round(deltaAbs)}px vs ${Math.round(state.lastDeltaAbs)}px) while scrolling ${dir}.`;
            showNotification({
              title: 'Irregular Scroll Step',
              message: warnMsg,
              icon: 'alert'
            });
            appendLog(warnMsg, 'warn');
          }

          if (state.streakDir === dir && intervalMs < 650) {
            state.streakCount += 1;
          } else {
            state.streakDir = dir;
            state.streakCount = 1;
          }
        }

        state.stepHistory.push({
          dir,
          deltaAbs,
          isReverseFault
        });
        if (state.stepHistory.length > 80) {
          state.stepHistory.shift();
        }

        if (liveDirectionPillEl) {
          const dirIcon = isReverseFault
            ? ICONS.alert
            : dir === 'DOWN'
            ? ICONS.arrowDown
            : ICONS.arrowUp;
          const dirText = isReverseFault
            ? `Reverse Jump (${dir}) Detected`
            : `Scrolling ${dir} • Step ${state.streakCount} (${intervalMs < 2000 ? `${Math.round(intervalMs)}ms` : 'start'})`;
          liveDirectionPillEl.innerHTML = `${dirIcon}<span>${dirText}</span>`;
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
