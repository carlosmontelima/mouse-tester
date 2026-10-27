/**
 * Bilingual Diagnostics Knowledge Base & Post-Test Report Renderer (EN / PT)
 * Generates detailed hypotheses ("What is going on") and actionable clickable fix tabs.
 */

import { ICONS } from './notifications.js';
import { getLang, t } from './i18n.js';

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
        <span>${t('diagHypothesisPrefix')} ${hypothesisTitle}</span>
      </div>
      <p class="hypothesis-body">${hypothesisText}</p>
    </div>

    <button type="button" class="fix-guide-tab-btn" aria-expanded="false">
      <span class="fix-guide-btn-label">
        ${ICONS.wrench}
        <span>${t('fixGuideBtnText', { count: fixSteps.length })}</span>
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
  const isPt = getLang() === 'pt';
  const { totalClicks, doubleClicks, holdDrops, faultyButtons, durationSec } = stats;
  const totalFaults = doubleClicks + holdDrops;
  const affectedList = Array.from(faultyButtons)
    .map((btnIdx) => t(`btnName${btnIdx}`))
    .join(', ');

  if (totalClicks === 0) {
    return isPt
      ? {
          verdictType: 'warn',
          verdictLabel: 'Nenhum Clique Registrado',
          summaryStatsText: `0 cliques na sessão de ${durationSec}s`,
          hypothesisTitle: 'Nenhum Clique Foi Detectado Durante o Tempo do Teste',
          hypothesisText:
            'O cronômetro terminou sem registrar nenhum clique dentro da arena de teste. Certifique-se de manter o cursor dentro da área roxa pontilhada enquanto clica.',
          fixSteps: [
            {
              title: 'Execute o Teste Clicando Dentro da Arena',
              description:
                'Clique em Iniciar Teste, mantenha o cursor dentro da caixa roxa e pressione os botões Esquerdo, Direito, Meio e Laterais.'
            }
          ]
        }
      : {
          verdictType: 'warn',
          verdictLabel: 'No Button Input Recorded',
          summaryStatsText: `0 clicks in ${durationSec}s session`,
          hypothesisTitle: 'No Clicks Were Registered During the Test Window',
          hypothesisText:
            'The timer completed without detecting any mouse button presses inside the interactive test arena. Make sure your cursor remains inside the highlighted purple target zone while clicking.',
          fixSteps: [
            {
              title: 'Re-run the Test Inside the Target Box',
              description:
                'Click Start Test, keep your cursor inside the dashed purple arena, and click Left, Right, Middle, and Side buttons.'
            }
          ]
        };
  }

  if (totalFaults === 0) {
    return isPt
      ? {
          verdictType: 'pass',
          verdictLabel: 'Todos os Switches Saudáveis',
          summaryStatsText: `${totalClicks} cliques testados • 0 anomalias (${durationSec}s)`,
          hypothesisTitle: 'Sinal Elétrico e Debounce em Perfeito Estado',
          hypothesisText:
            'Todos os cliques e sustentações foram registrados de forma limpa, sem rebote mecânico (chatter/duplo clique) ou perda de contato ao segurar. Os microswitches e o filtro de debounce do seu mouse estão operando perfeitamente.',
          fixSteps: [
            {
              title: 'Mantenha o Debounce Atual',
              description:
                'Mantenha o ajuste de Debounce Time atual (geralmente entre 4ms e 8ms) no software do seu mouse para máxima confiabilidade.'
            },
            {
              title: 'Prevenção Contra Poeira',
              description:
                'Aplique jatos curtos de ar comprimido periodicamente ao redor dos botões para evitar acúmulo de partículas.'
            }
          ]
        }
      : {
          verdictType: 'pass',
          verdictLabel: 'All Mouse Switches Healthy',
          summaryStatsText: `${totalClicks} clicks tested • 0 anomalies (${durationSec}s)`,
          hypothesisTitle: 'Clean Mechanical & Debounce Signal Integrity',
          hypothesisText:
            'Every button press and release registered cleanly without microswitch contact bounce (chatter) or involuntary hold dropouts. Your mouse switches and firmware debounce filtering are operating within optimal electrical tolerances.',
          fixSteps: [
            {
              title: 'Keep Firmware & Debounce Settings Current',
              description:
                'Maintain your current debounce setting (typically 4ms–8ms) in your mouse companion software for reliable click registration.'
            },
            {
              title: 'Preventive Dust Protection',
              description:
                'Periodically blow away dust around the button plungers with dry compressed air to keep switches clean.'
            }
          ]
        };
  }

  const hasChatter = doubleClicks > 0;
  const hasHoldDrop = holdDrops > 0;

  if (isPt) {
    return {
      verdictType: 'fail',
      verdictLabel: `Anomalia nos Switches (${totalFaults} Falha${totalFaults > 1 ? 's' : ''})`,
      summaryStatsText: `${totalClicks} cliques • ${doubleClicks} duplos cliques • ${holdDrops} quedas de sustentação (${affectedList})`,
      hypothesisTitle:
        hasChatter && hasHoldDrop
          ? `Switch Chatter (Duplo Clique) e Falha de Sustentação em ${affectedList}`
          : hasChatter
          ? `Duplo Clique Indesejado (Switch Bounce / Chatter) em ${affectedList}`
          : `Perda de Contato ao Segurar (Hold Drop) em ${affectedList}`,
      hypothesisText:
        `Durante o teste de ${durationSec}s, ${affectedList} apresentou instabilidade elétrica no microswitch. ` +
        (hasChatter
          ? `Dois ou mais cliques foram registrados em menos de 80ms, o que ocorre quando a lâmina metálica interna do microswitch mecânico desenvolve oxidação superficial, perde tensão elástica ou vibra além da janela de debounce do firmware. `
          : '') +
        (hasHoldDrop
          ? `Além disso, enquanto o botão estava segurado, o switch perdeu contato elétrico momentaneamente (< 45ms), fazendo com que itens arrastados ou miras sustentadas soltem sozinhos.`
          : ''),
      fixSteps: [
        {
          title: 'Aumente o Debounce Time via Software (Solução Imediata)',
          description:
            'Abra o software do seu mouse (Logitech G HUB, Razer Synapse, Pulsar, Glorious Core ou configurador web) e aumente o Debounce Time de 0–2ms para 8ms–12ms para filtrar o rebote mecânico da lâmina.'
        },
        {
          title: 'Descarregue Eletricidade Estática e Oxidação com Cliques Rápidos',
          description:
            'Desconecte o mouse do USB (ou desligue a chave wireless) e clique repetidamente e com firmeza no botão afetado por 30 a 45 segundos. Isso ajuda a dissipar carga estática e limpar microcamadas de óxido nos contatos.'
        },
        {
          title: 'Limpeza com Ar Comprimido e Álcool Isopropílico 99% (IPA)',
          description:
            'Aplique ar comprimido sob a fresta do botão. Se persistir, com o mouse desligado, pingue 1 gota de Álcool Isopropílico 99% no pino do microswitch, clique 50 vezes para limpar o contato interno e aguarde 20 minutos para secar totalmente.'
        },
        {
          title: 'Solução Definitiva: Troca do Microswitch ou Garantia (RMA)',
          description:
            'Se a mola de cobre interna estiver com fadiga física, acione a garantia (RMA) ou substitua o switch por modelos de alta durabilidade (como Huano Blue Shell Pink Dot, Kailh GM 8.0 ou switches ópticos).'
        }
      ]
    };
  }

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
  const isPt = getLang() === 'pt';
  const { upSteps, downSteps, reverseAnomalies, erraticSpikes, lockedDir, durationSec } = stats;
  const totalSteps = upSteps + downSteps;
  const totalFaults = reverseAnomalies + erraticSpikes;

  if (totalSteps === 0) {
    return isPt
      ? {
          verdictType: 'warn',
          verdictLabel: 'Nenhum Movimento de Scroll Registrado',
          summaryStatsText: `0 passos na sessão de ${durationSec}s`,
          hypothesisTitle: 'Nenhum Pulso da Roda de Scroll Foi Detectado',
          hypothesisText:
            'Nenhum evento de scroll foi capturado durante o teste. Clique em Iniciar Teste, posicione o cursor dentro da Arena do Scroll e role a roda em uma única direção.',
          fixSteps: [
            {
              title: 'Inicie o Teste e Mantenha o Cursor na Arena',
              description:
                'Clique em Iniciar Teste primeiro e depois role a roda continuamente em uma única direção dentro da caixa roxa.'
            }
          ]
        }
      : {
          verdictType: 'warn',
          verdictLabel: 'No Scroll Input Recorded',
          summaryStatsText: `0 scroll steps in ${durationSec}s session`,
          hypothesisTitle: 'No Scroll Wheel Ticks Were Detected',
          hypothesisText:
            'No wheel events were captured during the test duration. Click Start Test, hover your mouse cursor directly inside the Scroll Arena box, and roll the scroll wheel in one single direction.',
          fixSteps: [
            {
              title: 'Start Test & Keep Cursor Inside the Scroll Zone',
              description:
                'Click Start Test first, then place your cursor inside the purple target box before scrolling.'
            }
          ]
        };
  }

  const dirLabel = lockedDir === 'UP' ? t('dirUp') : t('dirDown');

  if (totalFaults === 0) {
    return isPt
      ? {
          verdictType: 'pass',
          verdictLabel: 'Codificador do Scroll Saudável',
          summaryStatsText: `${totalSteps} passos (${dirLabel}) • 0 pulos reversos`,
          hypothesisTitle: 'Leitura de Fase do Encoder Rotativo Precisa',
          hypothesisText:
            `Ao longo de ${totalSteps} passos na direção ${dirLabel} em ${durationSec} segundos, todos os pulsos foram registrados na direção correta sem nenhum pulo reverso ou falha de fase. O encoder do seu scroll está limpo e operando perfeitamente.`,
          fixSteps: [
            {
              title: 'Manutenção Preventiva do Encoder',
              description:
                'Mantenha pelos e poeira longe da fresta da roda do scroll usando jatos periódicos de ar comprimido.'
            }
          ]
        }
      : {
          verdictType: 'pass',
          verdictLabel: 'Scroll Encoder Healthy',
          summaryStatsText: `${totalSteps} scroll steps (${dirLabel}) • 0 reverse jumps`,
          hypothesisTitle: 'Accurate Rotary Encoder Phase Tracking',
          hypothesisText:
            `Across ${totalSteps} scroll ticks locked in the ${dirLabel} direction over ${durationSec} seconds, every step registered cleanly without a single reverse-scroll bounce or skipped phase step. Your scroll wheel encoder is clean and accurately decoding directional signals.`,
          fixSteps: [
            {
              title: 'Routine Encoder Maintenance',
              description:
                'Keep hair and lint away from the scroll wheel slot using periodic bursts of compressed air.'
            }
          ]
        };
  }

  const faultRate = ((reverseAnomalies / Math.max(1, totalSteps)) * 100).toFixed(1);

  if (isPt) {
    return {
      verdictType: reverseAnomalies > 0 ? 'fail' : 'warn',
      verdictLabel:
        reverseAnomalies > 0
          ? `Anomalia de Scroll Reverso (${reverseAnomalies} Pulo${reverseAnomalies > 1 ? 's' : ''})`
          : `Tempo de Passo Irregular (${erraticSpikes} Pico${erraticSpikes > 1 ? 's' : ''})`,
      summaryStatsText: `${totalSteps} passos • ${reverseAnomalies} pulos reversos (${faultRate}% de falha) • ${erraticSpikes} picos`,
      hypothesisTitle:
        reverseAnomalies > 0
          ? 'Leitura Incorreta de Fase no Encoder Rotativo (Scroll Reverso)'
          : 'Inconsistência na Magnitude de Pulsos do Scroll',
      hypothesisText:
        reverseAnomalies > 0
          ? `Com o teste travado na direção ${dirLabel}, a roda do seu mouse enviou ${reverseAnomalies} sinal(is) espúrio(s) na direção oposta. Em codificadores rotativos mecânicos (como Kailh, TTC ou Alps), a roda gira um disco de contatos que gera sinais de quadratura (fases A e B) para definir a direção. Quando poeira, fios de cabelo, graxa ressecada ou desgaste nas escovas metálicas interrompem uma das fases, o microcontrolador interpreta a ordem das fases invertida e gera um pulo súbito para o lado contrário.`
          : `Não houve pulos na direção oposta, mas ${erraticSpikes} passos apresentaram variação brusca de magnitude, geralmente causada por resíduos leves nas travas do encoder ou aceleração de rolagem do sistema operacional.`,
      fixSteps: [
        {
          title: 'Aplique Ar Comprimido no Lado Esquerdo da Roda do Scroll',
          description:
            'O codificador rotativo fica quase sempre encaixado no eixo esquerdo da roda do scroll. Insira o bico de ar comprimido na fresta lateral do scroll e aplique jatos curtos enquanto gira a roda.'
        },
        {
          title: 'Vire o Mouse de Cabeça para Baixo e Role Rápido sobre um Pano Limpo',
          description:
            'Inverta o mouse e role a roda vigorosamente contra o mousepad ou pano de microfibra por 30 a 60 segundos nas duas direções. O atrito aquece e redistribui a graxa interna do encoder e solta fibras presas.'
        },
        {
          title: 'Limpe o Encoder com Álcool Isopropílico 99% (IPA)',
          description:
            'Com o mouse desligado/desconectado, aplique 1 a 2 gotas de Álcool Isopropílico 99% no eixo do encoder rotativo e gire o scroll continuamente por 1 minuto para dissolver graxa oxidada nos contatos de quadratura. Deixe secar totalmente antes de ligar.'
        },
        {
          title: 'Solução de Hardware: Troca por Encoder à Prova de Poeira (TTC Gold) ou Garantia',
          description:
            'Se a limpeza resolver apenas temporariamente, as escovas metálicas internas estão gastas. Acione a garantia (RMA) ou substitua o componente por um encoder blindado (ex: TTC Gold Dustproof) na mesma altura em milímetros do seu mouse (8mm, 9mm, 10mm ou 11mm).'
        }
      ]
    };
  }

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
        ? `While locked to scrolling ${dirLabel}, your scroll wheel sent ${reverseAnomalies} opposite-direction signal(s). In mechanical rotary encoders (like Kailh, TTC, or Alps), the wheel turns a slotted disc or 3-pin wiper that produces quadrature phase signals (A & B) to determine direction. When dust, pet hair, thickened factory lubricant, or worn metal contacts bridge or skip one phase contact, the microcontroller misinterprets the phase order and triggers a sudden jump in the opposite direction.`
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
  const isPt = getLang() === 'pt';
  const { samplesCount, peakHz, avgHz, consistencyPct, dropAnomalies, jitterSpikes, durationSec } = stats;
  const totalFaults = dropAnomalies + jitterSpikes;

  if (samplesCount < 20) {
    return isPt
      ? {
          verdictType: 'warn',
          verdictLabel: 'Dados de Movimento Insuficientes',
          summaryStatsText: `${samplesCount} amostras em ${durationSec}s`,
          hypothesisTitle: 'O Mouse Não Foi Movido Continuamente para Saturar o Polling USB',
          hypothesisText:
            'Um mouse só atinge sua taxa máxima de atualização (Hz) quando o sensor óptico detecta movimento contínuo. Clique em Iniciar Teste e mova o mouse em círculos contínuos dentro da área demarcada.',
          fixSteps: [
            {
              title: 'Mova em Círculos Rápidos e Contínuos',
              description:
                'Clique em Iniciar Teste e faça movimentos circulares rápidos sem pausar até o fim da contagem.'
            }
          ]
        }
      : {
          verdictType: 'warn',
          verdictLabel: 'Insufficient Movement Data',
          summaryStatsText: `${samplesCount} samples recorded in ${durationSec}s`,
          hypothesisTitle: 'Mouse Was Not Moved Continuously Enough to Saturate USB Polling',
          hypothesisText:
            'A mouse only reports its maximum polling rate (Hz) when the sensor is actively detecting continuous surface movement. Click Start Test and move the mouse in continuous smooth circles inside the target box throughout the test.',
          fixSteps: [
            {
              title: 'Move in Fast Continuous Circles',
              description:
                'Click Start Test and make continuous circular movements inside the target area without pausing.'
            }
          ]
        };
  }

  if (totalFaults === 0 && consistencyPct >= 82) {
    return isPt
      ? {
          verdictType: 'pass',
          verdictLabel: 'Polling Rate & Sensor Estáveis',
          summaryStatsText: `Média ${avgHz} Hz • Pico ${peakHz} Hz • ${consistencyPct}% Estabilidade`,
          hypothesisTitle: 'Intervalo de Pacotes USB / Wireless Consistente e Rastreamento Limpo',
          hypothesisText:
            `Seu mouse manteve uma taxa média de ${avgHz} Hz (pico de ${peakHz} Hz) com ${consistencyPct}% de estabilidade e zero quedas de pacotes. Tanto o sensor óptico quanto a comunicação USB/wireless estão entregando atualizações lineares e sem interrupções.`,
          fixSteps: [
            {
              title: 'Configuração Ideal Confirmada',
              description:
                'Mantenha a opção "Aprimorar precisão do ponteiro" desmarcada nas Propriedades do Mouse do Windows para rastreamento 1:1.'
            }
          ]
        }
      : {
          verdictType: 'pass',
          verdictLabel: 'Polling Rate & Sensor Stable',
          summaryStatsText: `Avg ${avgHz} Hz • Peak ${peakHz} Hz • ${consistencyPct}% Stability`,
          hypothesisTitle: 'Consistent USB / Wireless Report Interval & Clean Sensor Tracking',
          hypothesisText:
            `Your mouse maintained an average polling rate of ${avgHz} Hz (peaking at ${peakHz} Hz) with ${consistencyPct}% report stability and zero packet dropouts. Both the optical sensor and USB/wireless transceiver are delivering smooth, uninterrupted updates.`,
          fixSteps: [
            {
              title: 'Optimal Configuration Confirmed',
              description:
                'Keep Windows "Enhance pointer precision" unchecked in Mouse Properties for 1:1 raw linear sensor tracking.'
            }
          ]
        };
  }

  if (isPt) {
    return {
      verdictType: dropAnomalies > 2 ? 'fail' : 'warn',
      verdictLabel:
        dropAnomalies > 2
          ? `Instabilidade de Polling (${dropAnomalies} Quedas)`
          : `Oscilação Leve de Polling (${consistencyPct}% Estabilidade)`,
      summaryStatsText: `Média ${avgHz} Hz • Pico ${peakHz} Hz • ${dropAnomalies} quedas • ${jitterSpikes} picos de jitter`,
      hypothesisTitle: 'Queda no Envio de Pacotes USB / Wireless ou Obstrução na Lente do Sensor',
      hypothesisText:
        `Durante o movimento contínuo, o teste detectou ${dropAnomalies} queda(s) brusca(s) de Polling Rate e ${jitterSpikes} pico(s) de rastreamento (estabilidade: ${consistencyPct}%). ` +
        `Isso acontece quando pacotes USB atrasam ou se perdem devido a interferência sem fio em 2.4GHz (roteadores Wi-Fi ou ruído de portas USB 3.0), hubs USB sem alimentação própria, economia de bateria ou uma partícula de poeira/pelo na lente do sensor óptico na base do mouse.`,
      fixSteps: [
        {
          title: 'Posicione o Receptor Wireless a Menos de 20cm com Cabo Extensor',
          description:
            'Portas USB 3.0 emitem ruído de rádio em 2.4GHz que interfere no dongle wireless. Conecte o receptor em uma porta USB 2.0 usando o cabo extensor e deixe o dongle na mesa, próximo ao mousepad.'
        },
        {
          title: 'Inspecione e Limpe a Lente do Sensor Óptico embaixo do Mouse',
          description:
            'Vire o mouse e observe a abertura do sensor. Um único fio de poeira ou pelo preso no prisma óptico causa quedas súbitas de leitura e saltos de coordenada. Limpe suavemente com ar comprimido ou cotonete seco.'
        },
        {
          title: 'Desative a Suspensão Seletiva USB e Use Porta Traseira da Placa-Mãe',
          description:
            'Evite conectar mouses de 1000Hz–8000Hz em hubs de monitor ou portas frontais. Conecte direto na placa-mãe e desative a "Configuração de suspensão seletiva USB" nas Opções de Energia do Windows.'
        },
        {
          title: 'Ajuste o LOD (Lift-Off Distance) e Verifique a Bateria',
          description:
            'Em mousepads de tecido desgastados ou de vidro, aumente o LOD de 1mm para 2mm no software do mouse e mantenha a bateria acima de 20% para evitar redução automática de polling.'
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
