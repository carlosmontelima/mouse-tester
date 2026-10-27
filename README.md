# Mouse Tester — Precision Web Diagnostic Suite

A web-based hardware diagnostic suite for testing gaming and office mice, featuring real-time anomaly detection, post-test diagnostic hypotheses, and interactive repair guides.

Created by **[Carlos Monte Lima (@carlosmontelima)](https://github.com/carlosmontelima)**.

---

## ✨ Features

- **Welcome Hero Screen**:
  - Displays the custom `assets/mouse.png` icon with a **gradually drawn glowing purple neon outline** and an interactive floating purple particle backdrop.
  - Matching gradually drawn glowing purple outline on the **"Mouse Tester"** title.
  - Smooth scroll-down or `ArrowDown` key transition to the centered diagnostic arena.
- **Strictly Isolated Timed Tests (30s, 60s, 90s, 120s)**:
  1. **Mouse Buttons & Side Switches (`M1`, `M2`, `M3`, `M4 Back`, `M5 Forward`)**:
     - Detects **Double-Click / Switch Chatter** (`< 80ms` click interval) and **Hold-Release Dropouts** (`< 45ms` contact loss while holding/dragging) in real time.
  2. **Scroll Wheel & Rotary Encoder**:
     - Detects **Reverse Scrolling (Encoder Phase Bounce)** immediately during upward or downward scrolling streaks.
  3. **Polling Rate (Hz) & Optical Sensor**:
     - Uses raw pointer events (`pointerrawupdate` / `getCoalescedEvents`) to measure live Hz, peak Hz, average Hz, and stability %, alerting live on packet drops or sensor jitter spikes.
- **Post-Test Diagnostic Report & Clickable Fix Guide**:
  - After the selected timer completes, displays a tailored **Diagnostic Hypothesis** explaining what is happening mechanically or electrically, followed by an expandable **"What You Can Do to Fix It"** tab.
- **Purple Glassmorphism UI & Theme Switcher**:
  - Deep violet dark theme by default with frosted glass panels, ambient bloom lighting, backlit buttons, and a one-click **Dark / Light Mode** toggle.

---

## 🚀 Running Locally or Deploying to GitHub Pages

1. **Local Preview**:
   Run any static HTTP server in the project root:
   ```bash
   python -m http.server 8080
   ```
   Then open `http://localhost:8080` in your browser.

2. **GitHub Pages Deployment**:
   Push this repository to GitHub and enable **Settings → Pages → Deploy from branch (`main` / root)**. No build step is required.
