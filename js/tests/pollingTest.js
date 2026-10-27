import { TestTimer } from '../timer.js';
import { buildPollingReport, renderDiagnosticReport } from '../diagnostics.js';
import { showNotification, setStartStopButtonContent } from '../notifications.js';
import { t, onLanguageChange } from '../i18n.js';

export function createPollingTest() {
  const zoneEl = document.getElementById('polling-test-zone');
  const startBtn = document.getElementById('polling-start-btn');
  const resetBtn = document.getElementById('polling-reset-btn');
  const timerTextEl = document.getElementById('polling-timer-text');
  const timerDotEl = document.getElementById('polling-timer-dot');
  const progressFillEl = document.getElementById('polling-progress-fill');
  const logListEl = document.getElementById('polling-log-list');
  const reportContainerEl = document.getElementById('polling-diagnostic-report');
  const canvas = document.getElementById('polling-canvas');
  const durationPills = document.querySelectorAll('[data-test="polling"].duration-pill');

  // Metric elements
  const currentHzEl = document.getElementById('polling-current-hz');
  const peakHzEl = document.getElementById('polling-peak-hz');
  const avgHzEl = document.getElementById('polling-avg-hz');
  const stabilityEl = document.getElementById('polling-stability-pct');
  const dropCardEl = document.getElementById('polling-stability-card');

  let state = {
    timestamps: [],
    hzHistory: [],
    currentHz: 0,
    peakHz: 0,
    avgHz: 0,
    consistencyPct: 100,
    samplesCount: 0,
    dropAnomalies: 0,
    jitterSpikes: 0,
    lastEventTime: 0,
    lastX: null,
    lastY: null,
    lastDropAlertTime: 0,
    durationSec: 30,
    finished: false
  };

  const timer = new TestTimer({
    durationSec: 30,
    onTick: ({ formatted, progressPct }) => {
      if (timerTextEl) timerTextEl.textContent = formatted;
      if (progressFillEl) progressFillEl.style.width = `${progressPct}%`;
      if (performance.now() - state.lastEventTime > 220 && state.currentHz !== 0) {
        state.currentHz = 0;
        if (currentHzEl) currentHzEl.textContent = '0 Hz';
      }
      drawGraph();
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
      const totalFaults = state.dropAnomalies + state.jitterSpikes;
      showNotification({
        title: totalFaults > 0 ? t('notifPollingDoneWarnTitle') : t('notifPollingDoneOkTitle'),
        message:
          totalFaults > 0
            ? t('notifPollingDoneWarnMsg', {
                drops: state.dropAnomalies,
                spikes: state.jitterSpikes
              })
            : t('notifPollingDoneOkMsg', {
                avg: state.avgHz,
                peak: state.peakHz,
                stab: state.consistencyPct
              }),
        icon: totalFaults > 0 ? 'alert' : 'check'
      });
      const report = buildPollingReport(state);
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

  function updateMetricsUI() {
    if (currentHzEl) currentHzEl.textContent = `${state.currentHz} Hz`;
    if (peakHzEl) peakHzEl.textContent = `${state.peakHz} Hz`;
    if (avgHzEl) avgHzEl.textContent = `${state.avgHz} Hz`;
    if (stabilityEl) stabilityEl.textContent = `${state.consistencyPct}%`;
    if (dropCardEl) {
      dropCardEl.classList.toggle('fault-detected', state.dropAnomalies > 2);
    }
  }

  function drawGraph() {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = (canvas.width = canvas.offsetWidth || 600);
    const h = (canvas.height = canvas.offsetHeight || 132);

    ctx.clearRect(0, 0, w, h);

    ctx.strokeStyle = 'rgba(168, 85, 247, 0.14)';
    ctx.lineWidth = 1;
    [0.25, 0.5, 0.75].forEach((ratio) => {
      ctx.beginPath();
      ctx.moveTo(0, h * ratio);
      ctx.lineTo(w, h * ratio);
      ctx.stroke();
    });

    const hist = state.hzHistory;
    if (hist.length < 2) return;

    const maxScale = Math.max(1000, state.peakHz * 1.15);
    ctx.save();
    ctx.beginPath();
    const maxPts = 90;
    const slice = hist.slice(-maxPts);

    slice.forEach((pt, idx) => {
      const x = (idx / Math.max(1, maxPts - 1)) * w;
      const y = h - Math.min(1, pt.hz / maxScale) * (h - 24) - 12;
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });

    ctx.strokeStyle = '#c084fc';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#a855f7';
    ctx.shadowBlur = 12;
    ctx.stroke();

    slice.forEach((pt, idx) => {
      if (pt.isAnomaly) {
        const x = (idx / Math.max(1, maxPts - 1)) * w;
        const y = h - Math.min(1, pt.hz / maxScale) * (h - 24) - 12;
        ctx.beginPath();
        ctx.arc(x, y, 4.5, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#e879f9';
        ctx.shadowBlur = 12;
        ctx.fill();
      }
    });

    ctx.restore();
  }

  function resetAll() {
    timer.stop(true);
    state = {
      timestamps: [],
      hzHistory: [],
      currentHz: 0,
      peakHz: 0,
      avgHz: 0,
      consistencyPct: 100,
      samplesCount: 0,
      dropAnomalies: 0,
      jitterSpikes: 0,
      lastEventTime: 0,
      lastX: null,
      lastY: null,
      lastDropAlertTime: 0,
      durationSec: timer.durationSec,
      finished: false
    };
    updateMetricsUI();
    drawGraph();
    if (logListEl) {
      logListEl.innerHTML = `<li class="anomaly-log-item">${t('pollingLogReady')}</li>`;
    }
    if (reportContainerEl) {
      reportContainerEl.classList.remove('visible');
      reportContainerEl.innerHTML = '';
    }
  }

  onLanguageChange(() => {
    setStartStopButtonContent(startBtn, timer.isRunning);
    if (!timer.isRunning && state.samplesCount === 0 && logListEl) {
      logListEl.innerHTML = `<li class="anomaly-log-item">${t('pollingLogReady')}</li>`;
    }
    if (state.finished && reportContainerEl && reportContainerEl.classList.contains('visible')) {
      renderDiagnosticReport(reportContainerEl, buildPollingReport(state));
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
        appendLog(t('pollingLogStopped'), 'normal');
      } else {
        resetAll();
        timer.start();
        appendLog(t('pollingLogStarted'), 'normal');
      }
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', resetAll);
  }

  if (zoneEl) {
    const processPointerSample = (timeStamp, clientX, clientY) => {
      const now = timeStamp || performance.now();

      if (state.lastEventTime > 0) {
        const dt = now - state.lastEventTime;
        if (dt < 0.08) return;

        if (state.lastX !== null && state.lastY !== null && dt < 4) {
          const dist = Math.hypot(clientX - state.lastX, clientY - state.lastY);
          if (dist > 210) {
            state.jitterSpikes += 1;
            const msg = t('notifSpikeMsg', { px: Math.round(dist), ms: dt.toFixed(2) });
            showNotification({
              title: t('notifSpikeTitle'),
              message: msg,
              icon: 'alert'
            });
            appendLog(msg, 'fault');
          }
        }
      }

      state.lastEventTime = now;
      state.lastX = clientX;
      state.lastY = clientY;
      state.samplesCount += 1;
      state.timestamps.push(now);

      const windowMs = 160;
      const cutoff = now - windowMs;
      while (state.timestamps.length > 0 && state.timestamps[0] < cutoff) {
        state.timestamps.shift();
      }

      if (state.timestamps.length >= 4) {
        const span = state.timestamps[state.timestamps.length - 1] - state.timestamps[0];
        if (span > 15) {
          const instantHz = Math.round(((state.timestamps.length - 1) / span) * 1000);
          state.currentHz = instantHz;
          if (instantHz > state.peakHz && instantHz <= 8500) {
            state.peakHz = instantHz;
          }

          let isDropAnomaly = false;
          if (
            state.avgHz >= 220 &&
            instantHz < state.avgHz * 0.42 &&
            now - state.lastDropAlertTime > 450
          ) {
            isDropAnomaly = true;
            state.dropAnomalies += 1;
            state.lastDropAlertTime = now;
            const msg = t('notifDropMsg', { avg: state.avgHz, curr: instantHz });
            showNotification({
              title: t('notifDropTitle'),
              message: msg,
              icon: 'alert'
            });
            appendLog(msg, 'fault');
            if (zoneEl) {
              zoneEl.classList.add('anomaly-flash');
              setTimeout(() => zoneEl.classList.remove('anomaly-flash'), 450);
            }
          }

          if (state.samplesCount % 4 === 0) {
            state.hzHistory.push({ hz: instantHz, isAnomaly: isDropAnomaly });
            if (state.hzHistory.length > 120) state.hzHistory.shift();

            const validHz = state.hzHistory.map((h) => h.hz).filter((v) => v > 60);
            if (validHz.length > 3) {
              const sum = validHz.reduce((a, b) => a + b, 0);
              state.avgHz = Math.round(sum / validHz.length);
              const variance =
                validHz.reduce((acc, v) => acc + Math.pow(v - state.avgHz, 2), 0) / validHz.length;
              const stdDev = Math.sqrt(variance);
              const cv = stdDev / Math.max(1, state.avgHz);
              state.consistencyPct = Math.max(10, Math.min(100, Math.round((1 - cv * 0.85) * 100)));
            }

            updateMetricsUI();
          }
        }
      }
    };

    const handlePointerStream = (e) => {
      if (!timer.isRunning) return;

      const coalesced = typeof e.getCoalescedEvents === 'function' ? e.getCoalescedEvents() : null;
      if (coalesced && coalesced.length > 0) {
        for (let i = 0; i < coalesced.length; i++) {
          const ce = coalesced[i];
          processPointerSample(ce.timeStamp || performance.now(), ce.clientX, ce.clientY);
        }
      } else {
        processPointerSample(e.timeStamp || performance.now(), e.clientX, e.clientY);
      }
    };

    if ('onpointerrawupdate' in window) {
      zoneEl.addEventListener('pointerrawupdate', handlePointerStream);
    } else {
      zoneEl.addEventListener('pointermove', handlePointerStream);
    }
  }

  return {
    stopAndReset: resetAll
  };
}
