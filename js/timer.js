/**
 * Configurable Test Countdown Timer (30s, 60s, 90s, 120s)
 * Ensures tests run for a strictly defined duration and never overlap.
 */

export class TestTimer {
  constructor({ durationSec = 30, onTick, onComplete, onStateChange }) {
    this.durationSec = durationSec;
    this.remainingMs = durationSec * 1000;
    this.isRunning = false;
    this.rafId = null;
    this.lastTimestamp = 0;
    this.onTick = onTick;
    this.onComplete = onComplete;
    this.onStateChange = onStateChange;
  }

  setDuration(seconds) {
    if (this.isRunning) return;
    this.durationSec = seconds;
    this.remainingMs = seconds * 1000;
    this._emitTick();
  }

  start() {
    if (this.isRunning) return;
    this.remainingMs = this.durationSec * 1000;
    this.isRunning = true;
    this.lastTimestamp = performance.now();
    if (this.onStateChange) this.onStateChange(true);
    this._emitTick();

    const step = (now) => {
      if (!this.isRunning) return;
      const delta = now - this.lastTimestamp;
      this.lastTimestamp = now;
      this.remainingMs = Math.max(0, this.remainingMs - delta);
      this._emitTick();

      if (this.remainingMs <= 0) {
        this.isRunning = false;
        this.rafId = null;
        if (this.onStateChange) this.onStateChange(false);
        if (this.onComplete) this.onComplete();
        return;
      }

      this.rafId = requestAnimationFrame(step);
    };

    this.rafId = requestAnimationFrame(step);
  }

  stop(resetToFull = true) {
    const wasRunning = this.isRunning;
    this.isRunning = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    if (resetToFull) {
      this.remainingMs = this.durationSec * 1000;
    }
    this._emitTick();
    if (wasRunning && this.onStateChange) {
      this.onStateChange(false);
    }
  }

  _emitTick() {
    if (!this.onTick) return;
    const totalMs = this.durationSec * 1000;
    const elapsedMs = totalMs - this.remainingMs;
    const progressPct = totalMs > 0 ? Math.min(100, (elapsedMs / totalMs) * 100) : 0;
    const totalSecLeft = Math.ceil(this.remainingMs / 1000);
    const mins = String(Math.floor(totalSecLeft / 60)).padStart(2, '0');
    const secs = String(totalSecLeft % 60).padStart(2, '0');

    this.onTick({
      formatted: `${mins}:${secs}`,
      remainingMs: this.remainingMs,
      progressPct,
      durationSec: this.durationSec
    });
  }
}
