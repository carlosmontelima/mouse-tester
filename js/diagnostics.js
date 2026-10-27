/**
 * Diagnostics Knowledge Base & Post-Test Report Renderer
 * Generates detailed hypotheses ("What is going on") and actionable clickable fix tabs.
 * Uses only custom SVG icons and the clean purple glass aesthetic.
 */

import { ICONS } from './notifications.js';

export function renderDiagnosticReport(containerEl, reportData) {
  if (!containerEl) return;

  const {
    verdictType,
    verdictLabel,
    summaryStatsText,
    hypothesisTitle,
    hypothesisText,
    fixSteps
  } = reportData;

  const badgeIcon = verdictType === 'pass' ? ICONS.check : ICONS.alert;

  const stepsHtml = fixSteps
    .map(
      (step, index) => `
      <li class="fix-step-item">
        <span class="fix-step-num">${index + 1}</span>
        <div class="fix-step-content">
          <h4>${step.title}</h4>
          <p>${step.description}</p>
        </div>
      </li>
    `
    )
.join('');

  containerEl.innerHTML = `
    <div class="report-header">
      <div>
        <span class="report-verdict-badge">
          ${badgeIcon}
          <span>${verdictLabel}</span>
        </span>
      </div>
      <div class="report-summary-meta">${summaryStatsText}</div>
    </div>

    <div class="hypothesis-section">
      <div class="hypothesis-heading">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
          <path d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z"/>
          <path d="M9 21h6"/>
        </svg>
        <span>Diagnostic Hypothesis: ${hypothesisTitle}</span>
      </div>
      <p class="hypothesis-body">${hypothesisText}</p>
    </div>

    <button type="button" class="fix-guide-tab-btn" aria-expanded="false">
      <span class="fix-guide-btn-label">
        ${ICONS.wrench}
        <span>Click to View: What You Can Do to Fix It (${fixSteps.length} Recommended Actions)</span>
      </span>
      <svg class="fix-guide-chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4">
        <polyline points="6 9 12 15 18 9"></polyline>
      </svg>
    </button>

    <div class="fix-guide-drawer">
      <ul class="fix-steps-list">
        ${stepsHtml}
      </ul>
    </div>
  `;

  containerEl.classList.add('visible');

  const tabBtn = containerEl.querySelector('.fix-guide-tab-btn');
  const drawer = containerEl.querySelector('.fix-guide-drawer');
  if (tabBtn && drawer) {
    tabBtn.addEventListener('click', () => {
      const isOpen = drawer.classList.toggle('open');
      tabBtn.classList.toggle('expanded', isOpen);
      tabBtn.setAttribute('aria-expanded', String(isOpen));
    });
  }

  containerEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

export function buildButtonsReport(stats) {
  const { totalClicks, doubleClicks, holdDrops, faultyButtons, durationSec } = stats;
  const totalFaults = doubleClicks + holdDrops;
  const affectedList = Array.from(faultyButtons).join(', ');

  if (totalClicks === 0) {
    return {
      verdictType: 'warn',
      verdictLabel: 'No Button Input Recorded',
      summaryStatsText: `0 clicks in ${durationSec}s session`,
      hypothesisTitle: 'No Clicks Were Registered During the Test Window',
      hypothesisText:
        'The timer completed without detecting any mouse button presses inside the interactive test arena. Make sure your cursor remains inside the highlighted purple target zone while clicking.',
      fixSteps: [
        {
          title: 'Re-run the Test Inside the Target Box',
          description: 'Click Start Test, keep your cursor inside the dashed purple arena, and click Left, Right, Middle, and Side buttons.'
        }
      ]
    };
  }

  if (totalFaults === 0) {
    return {
      verdictType: 'pass',
      verdictLabel: 'All Mouse Switches Healthy',
      summaryStatsText: `${totalClicks} clicks tested • 0 anomalies (${durationSec}s)`,
      hypothesisTitle: 'Clean Mechanical & Debounce Signal Integrity',
      hypothesisText:
        'Every button press and release registered cleanly without microswitch contact bounce (chatter) or involuntary hold dropouts. Your mouse switches and firmware debounce filtering are operating within optimal electrical tolerances.',
      fixSteps: [
        {
          title: 'Keep Firmware & Debounce Settings Current',
          description: 'Maintain your current debounce setting (typically 4ms–8ms) in your mouse companion software for reliable click registration.'
        },
        {
          title: 'Preventive Dust Protection',
          description: 'Periodically blow away dust around the button plungers with dry compressed air to keep switches clean.'
        }
      ]
    };
  }

  const hasChatter = doubleClicks > 0;
  const hasHoldDrop = holdDrops > 0;

  return {
    verdictType: 'fail',
    verdictLabel: `Switch Anomaly Detected (${totalFaults} Fault${totalFaults > 1 ? 's' : ''})`,
    summaryStatsText: `${totalClicks} total clicks • ${doubleClicks} double-click faults • ${holdDrops} hold drops (${affectedList})`,
    hypothesisTitle:
      hasChatter && hasHoldDrop
        ? `Microswitch Contact Chatter & Hold Dropout on ${affectedList}`
        : hasChatter
        ? `Unintended Double-Clicking (Switch Bounce / Chatter) on ${affectedList}`
        : `Switch Hold-Release Dropout (Drag Drop) on ${affectedList}`,
    hypothesisText:
      `During the ${durationSec}s test, ${affectedList} exhibited electrical switch instability. ` +
      (hasChatter
        ? `Two or more clicks registered faster than humanly possible (< 80ms interval), which happens when the internal metal leaf spring inside the mechanical microswitch develops surface oxidation, loses spring tension, or vibrates against the contact point longer than the mouse's firmware debounce window. `
        : '') +
      (hasHoldDrop
        ? `Additionally, while holding the button down, the switch briefly lost electrical contact and re-engaged (< 45ms gap), causing dragged items or sustained aim holds to drop unexpectedly.`
        : ''),
    fixSteps: [
      {
        title: 'Increase Software Debounce Time (Immediate Software Fix)',
        description:
          'Open your mouse software (Logitech G HUB, Razer Synapse, Pulsar, Glorious Core, or web configurator) and raise the Click Debounce Time from 0–2ms to 8ms–12ms to filter out mechanical leaf-spring bounce.'
      },
      {
        title: 'Discharge Static & Clear Oxidation via Rapid Tapping',
        description:
          'Unplug the mouse (or turn off wireless power) and click the affected button rapidly and firmly for 30–45 seconds. In humid or dry environments, static charge and microscopic oxide film on low-current gold-plated contacts can be cleared mechanically.'
      },
      {
        title: 'Compressed Air & Isopropyl Alcohol (IPA 99%) Contact Flush',
        description:
          'Blow dry compressed air under the button gap. For persistent chatter, apply 1 drop of 99% Isopropyl Alcohol directly onto the microswitch plunger while unplugged, click 50 times to flush the internal leaf contact, and let it dry completely for 20 minutes.'
      },
      {
        title: 'Hardware Fix: Microswitch Replacement or Warranty RMA',
        description:
          'If the internal copper leaf spring is physically fatigued, claim a warranty RMA or replace the faulty switch (e.g., upgrading to Huano Blue Shell Pink Dot, Kailh GM 8.0, or optical microswitches).'
      }
    ]
  };
}

export function buildScrollReport(stats) {
  const { upSteps, downSteps, reverseAnomalies, erraticSpikes, durationSec } = stats;
  const totalSteps = upSteps + downSteps;
  const totalFaults = reverseAnomalies + erraticSpikes;

  if (totalSteps === 0) {
    return {
      verdictType: 'warn',
      verdictLabel: 'No Scroll Input Recorded',
      summaryStatsText: `0 scroll steps in ${durationSec}s session`,
      hypothesisTitle: 'No Scroll Wheel Ticks Were Detected',
      hypothesisText:
        'No wheel events were captured during the test duration. Click Start Test, hover your mouse cursor directly inside the Scroll Arena box, and roll the scroll wheel up and down.',
      fixSteps: [
        {
          title: 'Start Test & Keep Cursor Inside the Scroll Zone',
          description: 'Click Start Test first, then place your cursor inside the purple target box before scrolling up and down.'
        }
      ]
    };
  }

  if (totalFaults === 0) {
    return {
      verdictType: 'pass',
      verdictLabel: 'Scroll Encoder Healthy',
      summaryStatsText: `${totalSteps} scroll steps (${upSteps} Up / ${downSteps} Down) • 0 reverse jumps`,
      hypothesisTitle: 'Accurate Rotary Encoder Phase Tracking',
      hypothesisText:
        `Across ${totalSteps} scroll ticks in ${durationSec} seconds, every directional streak registered consistently without a single reverse-scroll bounce or skipped phase step. Your scroll wheel encoder is clean and accurately decoding directional signals.`,
      fixSteps: [
        {
          title: 'Routine Encoder Maintenance',
          description: 'Keep hair and lint away from the scroll wheel slot using periodic bursts of compressed air.'
        }
      ]
    };
  }

  const faultRate = ((reverseAnomalies / Math.max(1, totalSteps)) * 100).toFixed(1);

  return {
    verdictType: reverseAnomalies > 0 ? 'fail' : 'warn',
    verdictLabel:
      reverseAnomalies > 0
        ? `Reverse Scroll Anomaly (${reverseAnomalies} Jump${reverseAnomalies > 1 ? 's' : ''})`
        : `Irregular Scroll Step Timing (${erraticSpikes} Spike${erraticSpikes > 1 ? 's' : ''})`,
    summaryStatsText: `${totalSteps} steps • ${reverseAnomalies} reverse jumps (${faultRate}% fault rate) • ${erraticSpikes} erratic spikes`,
    hypothesisTitle:
      reverseAnomalies > 0
        ? 'Rotary Scroll Encoder Phase Misread (Reverse Scroll Bounce)'
        : 'Inconsistent Scroll Step Impulse Timing',
    hypothesisText:
      reverseAnomalies > 0
        ? `While scrolling continuously in one direction, your scroll wheel sent ${reverseAnomalies} opposite-direction signal(s). In mechanical rotary encoders (like Kailh, TTC, or Alps), the wheel turns a slotted disc or 3-pin wiper that produces quadrature phase signals (A & B) to determine direction. When dust, pet hair, thickened factory lubricant, or worn metal contacts bridge or skip one phase contact, the microcontroller misinterprets the phase order and triggers a sudden jump in the opposite direction.`
        : `No opposite-direction jumps occurred, but ${erraticSpikes} scroll steps showed irregular delta spikes, which typically points to minor debris in the encoder detents or OS smooth-scrolling acceleration.`,
    fixSteps: [
      {
        title: 'Blow Compressed Air Into the Left Side of the Scroll Wheel',
        description:
          'The rotary encoder is almost always mounted on the left axle of the scroll wheel. Insert a compressed air straw into the gap beside the scroll wheel and blow short bursts while rolling the wheel up and down.'
      },
      {
        title: 'Invert the Mouse & Roll Rapidly on a Microfiber Cloth',
        description:
          'Turn the mouse upside down and vigorously roll the scroll wheel against a clean pad or cloth for 30–60 seconds in both directions. Friction warms and redistributes uneven grease inside mechanical encoders and dislodges trapped fibers.'
      },
      {
        title: 'Clean the Rotary Encoder with 99% Isopropyl Alcohol (IPA)',
        description:
          'With the mouse powered off/unplugged, apply 1–2 drops of 99% IPA into the rotary encoder housing on the wheel axle and scroll continuously for 1 minute so the solvent dissolves oxidized grease on the internal quadrature contacts. Let dry completely before powering on.'
      },
      {
        title: 'Hardware Fix: Dustproof Encoder Replacement (TTC Gold / Kailh Red) or RMA',
        description:
          'If cleaning only fixes the reverse scroll temporarily, the internal metal contact wipers are worn. Claim a warranty RMA or solder a dustproof encoder (such as TTC Gold Dustproof) matching your mouse’s encoder height (e.g., 8mm, 9mm, 10mm, or 11mm).'
      }
    ]
  };
}

export function buildPollingReport(stats) {
  const { samplesCount, peakHz, avgHz, consistencyPct, dropAnomalies, jitterSpikes, durationSec } = stats;
  const totalFaults = dropAnomalies + jitterSpikes;

  if (samplesCount < 20) {
    return {
      verdictType: 'warn',
      verdictLabel: 'Insufficient Movement Data',
      summaryStatsText: `${samplesCount} samples recorded in ${durationSec}s`,
      hypothesisTitle: 'Mouse Was Not Moved Continuously Enough to Saturate USB Polling',
      hypothesisText:
        'A mouse only reports its maximum polling rate (Hz) when the sensor is actively detecting continuous surface movement. Click Start Test and move the mouse in continuous smooth circles inside the target box throughout the test.',
      fixSteps: [
        {
          title: 'Move in Fast Continuous Circles',
          description: 'Click Start Test and make continuous circular movements inside the target area without pausing.'
        }
      ]
    };
  }

  if (totalFaults === 0 && consistencyPct >= 82) {
    return {
      verdictType: 'pass',
      verdictLabel: 'Polling Rate & Sensor Stable',
      summaryStatsText: `Avg ${avgHz} Hz • Peak ${peakHz} Hz • ${consistencyPct}% Stability`,
      hypothesisTitle: 'Consistent USB / Wireless Report Interval & Clean Sensor Tracking',
      hypothesisText:
        `Your mouse maintained an average polling rate of ${avgHz} Hz (peaking at ${peakHz} Hz) with ${consistencyPct}% report stability and zero packet dropouts. Both the optical sensor and USB/wireless transceiver are delivering smooth, uninterrupted updates.`,
      fixSteps: [
        {
          title: 'Optimal Configuration Confirmed',
          description: 'Keep Windows "Enhance pointer precision" unchecked in Mouse Properties for 1:1 raw linear sensor tracking.'
        }
      ]
    };
  }

  return {
    verdictType: dropAnomalies > 2 ? 'fail' : 'warn',
    verdictLabel:
      dropAnomalies > 2
        ? `Polling Instability (${dropAnomalies} Packet Drops)`
        : `Minor Polling Variance (${consistencyPct}% Stability)`,
    summaryStatsText: `Avg ${avgHz} Hz • Peak ${peakHz} Hz • ${dropAnomalies} drops • ${jitterSpikes} jitter spikes`,
    hypothesisTitle: 'USB / Wireless Report Interval Drops or Optical Sensor Tracking Interruption',
    hypothesisText:
      `During continuous movement, the tester detected ${dropAnomalies} sudden polling rate drop(s) and ${jitterSpikes} timing/tracking spike(s) (stability: ${consistencyPct}%). ` +
      `This occurs when USB packets are delayed or dropped due to 2.4GHz wireless interference (Wi-Fi routers or USB 3.0 port noise), unpowered USB hub bandwidth contention, low battery power-saving states, or microscopic dust/fibers obstructing the optical sensor lens on the bottom of the mouse.`,
    fixSteps: [
      {
        title: 'Place Wireless Dongle Within 20cm Using Extension Adapter (Wireless Mice)',
        description:
          'USB 3.0 ports emit 2.4GHz radio noise that interferes with wireless mouse receivers. Plug your receiver into a USB 2.0 port using the included extension cable and place the dongle on your desk close to your mousepad.'
      },
      {
        title: 'Inspect & Clean the Bottom Optical Sensor Lens',
        description:
          'Flip the mouse over and inspect the sensor hole. A single trapped dust fiber or hair inside the sensor prism causes sudden tracking drops and coordinate spikes. Blow it out gently with compressed air or a dry cotton swab.'
      },
      {
        title: 'Disable Windows USB Selective Suspend & Use a Direct Motherboard Port',
        description:
          'Avoid plugging high-polling-rate mice (1000Hz–8000Hz) into unpowered monitor hubs or front-panel ports. Connect directly to a rear motherboard USB port and disable "USB selective suspend setting" in Windows Power Options.'
      },
      {
        title: 'Check Surface LOD (Lift-Off Distance) & Battery Level',
        description:
          'If using a worn cloth pad or glass pad, increase the Lift-Off Distance (LOD) from 1mm to 2mm in your mouse software, and ensure wireless battery charge is above 20% so low-power polling throttling does not engage.'
      }
    ]
  };
}
