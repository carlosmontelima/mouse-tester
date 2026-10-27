/**
 * Internationalization (i18n) Module — English (en) & Português (pt)
 */

const TRANSLATIONS = {
  en: {
    // Header & Welcome
    headerTitleAttr: 'Return to Welcome Screen',
    themeLight: 'Light Mode',
    themeDark: 'Dark Mode',
    heroSubtitle:
      'Complete hardware diagnostics for mouse switches, side buttons, rotary scroll encoders, and high-frequency polling sensors — with real-time anomaly alerts and repair guides.',
    scrollCta: 'Scroll Down or Press Down Arrow to Begin',

    // Main Arena Header & Tabs
    arenaBadge: 'Isolated Diagnostic Suite',
    arenaTitle: 'Hardware Diagnostic Arena',
    arenaDesc:
      'Each diagnostic runs strictly isolated for accurate timing. Select a test tab, choose your duration (30s–120s), and click Start Test.',
    tabButtons: '1. Mouse Buttons & Side Switches',
    tabScroll: '2. Scroll Wheel & Reverse Detector',
    tabPolling: '3. Polling Rate (Hz) & Sensor',

    // Controls
    testDuration: 'Test Duration:',
    startTest: 'Start Test',
    stopTest: 'Stop Test',
    resetBtn: 'Reset',

    // Buttons Test
    buttonsZoneTitle: 'Click & Hold Target Arena',
    buttonsZoneSub:
      'Click "Start Test" above first. Then click Left (M1), Right (M2), Middle Wheel (M3), Side Back (M4), and Side Forward (M5) here to test for switch bounce or hold dropouts.',
    liveSwitchIllum: 'Live Switch Illumination',
    interactiveSwitchMap: 'Interactive Switch Zone Map',
    btnLeft: 'Left (M1)',
    btnRight: 'Right (M2)',
    btnMiddle: 'Middle (M3)',
    btnBack: 'Side Back (M4)',
    btnFwd: 'Side Fwd (M5)',
    btnName0: 'Left Click (M1)',
    btnName1: 'Middle Click (M3)',
    btnName2: 'Right Click (M2)',
    btnName3: 'Side Back (M4)',
    btnName4: 'Side Forward (M5)',
    noDeltaYet: 'No delta yet',
    minSuffix: 'ms min',
    faultSuffix: 'fault(s)',
    buttonsLogHeader: 'Live Switch Telemetry Stream',
    buttonsLogThreshold: 'Threshold: < 80ms Double-Click | < 45ms Hold-Drop',
    buttonsLogReady: 'Click "Start Test" above, then click inside the target box to test all 5 buttons.',
    buttonsLogStarted: 'Test started — click Left, Right, Middle, and Side buttons inside the arena.',
    buttonsLogStopped: 'Test stopped manually.',
    buttonsLogFirstPress: '{btn} first press registered',
    buttonsLogPressed: '{btn} pressed (interval: {ms}ms)',
    notifHoldDropTitle: 'Hold-Drop Anomaly Detected',
    notifHoldDropMsg: '{btn} dropped contact for {ms}ms while holding.',
    notifDoubleClickTitle: 'Double-Click Chatter Detected',
    notifDoubleClickMsg: '{btn} registered 2 clicks in {ms}ms (< 80ms threshold).',
    notifButtonsDoneFaultTitle: 'Switch Test Complete — Anomalies Found',
    notifButtonsDoneFaultMsg: 'Detected {count} switch anomaly event(s). Review the diagnostic hypothesis and fix guide below.',
    notifButtonsDoneOkTitle: 'Switch Test Complete — Healthy',
    notifButtonsDoneOkMsg: 'Analyzed {clicks} clicks with zero switch bounce or hold anomalies.',

    // Scroll Test
    scrollRuleTitle: 'Single-Direction Test Rule (Avoid False Positives):',
    scrollRuleText:
      'Scroll in ONLY ONE direction per test. Your first scroll movement after clicking "Start Test" locks the target direction (Up or Down) for the entire session. To test the opposite direction, click Reset and run a new test.',
    scrollZoneTitle: 'Scroll Wheel Encoder Arena',
    scrollZoneSub:
      'Click "Start Test" above, then roll your scroll wheel continuously in a single direction (only Down or only Up) inside this box.',
    clickStartToBegin: 'Click "Start Test" to Begin',
    scrollWaitingFirstDir: 'Test Running — Scroll Up or Down to Lock Direction',
    scrollLockedBadge: 'Locked Direction: {locked} • Scrolling {dir} (Streak: {streak})',
    scrollReverseJumpBadge: 'Reverse Jump ({dir}) Detected While Locked to {locked}',
    scrollOppositeWarnBadge: 'Wrong Direction ({dir}) — Locked to {locked} Only',
    rotaryVisualizer: 'Rotary Encoder Visualizer',
    detectsReverseSub: 'Detects Reverse Scroll Bounce Live',
    scrollUpSteps: 'Scroll Up Steps',
    upwardTicks: 'Upward Ticks',
    scrollDownSteps: 'Scroll Down Steps',
    downwardTicks: 'Downward Ticks',
    lockedDirLabel: 'Locked Direction',
    singleDirModeSub: 'Single-Direction Lock',
    notLockedYet: 'Unlocked',
    dirUp: 'UP',
    dirDown: 'DOWN',
    canvasUpSteps: 'UP STEPS',
    canvasDownSteps: 'DOWN STEPS',
    reverseScrollJumps: 'Reverse Scroll Jumps',
    oppositeBounceFaults: 'Opposite Bounce Faults',
    scrollLogHeader: 'Live Rotary Encoder Telemetry',
    scrollLogThreshold: 'Single-Direction Lock | Detects Encoder Bounce',
    scrollLogReady: 'Click "Start Test" above, then roll the scroll wheel in ONE single direction inside the target box.',
    scrollLogStarted: 'Scroll test started — your first scroll tick will lock the test direction (UP or DOWN).',
    scrollLogStopped: 'Scroll test stopped manually.',
    scrollLogLocked: 'Target direction locked to {dir}. Keep scrolling {dir} only for the rest of this test.',
    notifReverseTitle: 'Reverse Scroll Detected',
    notifReverseMsg: 'Locked direction is {locked}, but the scroll wheel jumped {dir} ({ms}ms encoder bounce).',
    notifIntentionalOppositeTitle: 'Opposite Direction Scrolling Detected',
    notifIntentionalOppositeMsg:
      'This test session is locked to scrolling {locked}. Scrolling {dir} on purpose is ignored to prevent false positives — keep scrolling {locked} or click Reset.',
    notifIrregularStepTitle: 'Irregular Scroll Step',
    notifIrregularStepMsg: 'Irregular scroll step magnitude ({curr}px vs {prev}px) while scrolling {dir}.',
    notifScrollDoneFaultTitle: 'Scroll Test Complete — Reverse Scroll Detected',
    notifScrollDoneFaultMsg: 'Detected {count} reverse scroll anomaly event(s). View the hypothesis and fix guide below.',
    notifScrollDoneOkTitle: 'Scroll Test Complete — Encoder Healthy',
    notifScrollDoneOkMsg: 'Analyzed {steps} scroll steps in {dir} direction with zero reverse scroll jumps.',

    // Polling Test
    pollingZoneTitle: 'High-Frequency Sensor & Polling Arena',
    pollingZoneSub:
      'Click "Start Test" above, then move your cursor in rapid, continuous circular motions inside this arena.',
    livePollingRate: 'Live Polling Rate',
    instantRate: 'Instantaneous Rate',
    peakPollingRate: 'Peak Polling Rate',
    maxRecorded: 'Maximum Recorded',
    avgRate: 'Average Rate',
    activeMotionMean: 'Active Motion Mean',
    pollingStability: 'Polling Stability',
    packetConsistency: 'Packet Consistency',
    pollingLogHeader: 'Live Sensor & USB Report Telemetry',
    pollingLogSub: 'Raw Pointer Stream (Uncoalesced Events)',
    pollingLogReady: 'Click "Start Test" above, then move your mouse in continuous fast circles inside the arena.',
    pollingLogStarted: 'Polling test started — move your mouse in continuous fast circles.',
    pollingLogStopped: 'Polling rate test stopped manually.',
    notifSpikeTitle: 'Sensor Jitter Spike Detected',
    notifSpikeMsg: 'Cursor jumped {px}px in {ms}ms.',
    notifDropTitle: 'Polling Rate Drop Detected',
    notifDropMsg: 'Polling rate plunged from ~{avg}Hz down to {curr}Hz during movement.',
    notifPollingDoneWarnTitle: 'Polling Test Complete — Variance Found',
    notifPollingDoneWarnMsg: 'Detected {drops} polling drop(s) and {spikes} spike(s). Check the hypothesis and fix guide below.',
    notifPollingDoneOkTitle: 'Polling Test Complete — Stable',
    notifPollingDoneOkMsg: 'Average {avg} Hz (Peak {peak} Hz) with {stab}% stability.',

    // Diagnostics & Reports
    diagHypothesisPrefix: 'Diagnostic Hypothesis:',
    fixGuideBtnText: 'Click to View: What You Can Do to Fix It ({count} Recommended Actions)',
    footerCreditHtml: 'Designed & Created by <strong>Carlos Monte Lima</strong> — All Rights Reserved.'
  },

  pt: {
    // Header & Welcome
    headerTitleAttr: 'Voltar para a Tela Inicial',
    themeLight: 'Modo Claro',
    themeDark: 'Modo Escuro',
    heroSubtitle:
      'Diagnóstico completo de hardware para switches de clique, botões laterais, codificador rotativo do scroll e taxa de atualização (Polling Rate) — com alertas em tempo real e guias de reparo.',
    scrollCta: 'Role para Baixo ou Pressione a Seta para Baixo para Começar',

    // Main Arena Header & Tabs
    arenaBadge: 'Suíte de Diagnóstico Isolada',
    arenaTitle: 'Arena de Diagnóstico de Hardware',
    arenaDesc:
      'Cada diagnóstico roda separadamente para máxima precisão. Escolha a aba do teste, defina a duração (30s–120s) e clique em Iniciar Teste.',
    tabButtons: '1. Botões do Mouse & Laterais',
    tabScroll: '2. Scroll Wheel & Detector Reverso',
    tabPolling: '3. Polling Rate (Hz) & Sensor',

    // Controls
    testDuration: 'Duração do Teste:',
    startTest: 'Iniciar Teste',
    stopTest: 'Parar Teste',
    resetBtn: 'Resetar',

    // Buttons Test
    buttonsZoneTitle: 'Arena de Clique & Sustentação',
    buttonsZoneSub:
      'Clique em "Iniciar Teste" acima primeiro. Depois clique com o Botão Esquerdo (M1), Direito (M2), Meio (M3) e Laterais (M4/M5) aqui para detectar duplo clique ou falha ao segurar.',
    liveSwitchIllum: 'Iluminação dos Switches ao Vivo',
    interactiveSwitchMap: 'Mapa Interativo de Switches',
    btnLeft: 'Esquerdo (M1)',
    btnRight: 'Direito (M2)',
    btnMiddle: 'Meio (M3)',
    btnBack: 'Lateral Voltar (M4)',
    btnFwd: 'Lateral Avançar (M5)',
    btnName0: 'Clique Esquerdo (M1)',
    btnName1: 'Clique do Meio (M3)',
    btnName2: 'Clique Direito (M2)',
    btnName3: 'Lateral Voltar (M4)',
    btnName4: 'Lateral Avançar (M5)',
    noDeltaYet: 'Sem intervalo',
    minSuffix: 'ms mín',
    faultSuffix: 'falha(s)',
    buttonsLogHeader: 'Telemetria de Switches em Tempo Real',
    buttonsLogThreshold: 'Limite: < 80ms Duplo Clique | < 45ms Queda de Clique',
    buttonsLogReady: 'Clique em "Iniciar Teste" acima e depois clique dentro da área demarcada para testar os 5 botões.',
    buttonsLogStarted: 'Teste iniciado — clique nos botões Esquerdo, Direito, Meio e Laterais dentro da arena.',
    buttonsLogStopped: 'Teste interrompido manualmente.',
    buttonsLogFirstPress: '{btn}: primeiro clique registrado',
    buttonsLogPressed: '{btn} pressionado (intervalo: {ms}ms)',
    notifHoldDropTitle: 'Falha ao Segurar Botão Detectada',
    notifHoldDropMsg: '{btn} perdeu contato por {ms}ms enquanto estava pressionado.',
    notifDoubleClickTitle: 'Duplo Clique Indesejado (Chatter)',
    notifDoubleClickMsg: '{btn} registrou 2 cliques em {ms}ms (abaixo do limite de 80ms).',
    notifButtonsDoneFaultTitle: 'Teste Finalizado — Anomalias Detectadas',
    notifButtonsDoneFaultMsg: 'Detectamos {count} anomalia(s) nos switches. Veja a hipótese e o guia de conserto abaixo.',
    notifButtonsDoneOkTitle: 'Teste Finalizado — Switches Saudáveis',
    notifButtonsDoneOkMsg: 'Analisamos {clicks} cliques com zero falhas de duplo clique ou perda de sustentação.',

    // Scroll Test
    scrollRuleTitle: 'Regra de Direção Única (Evita Falsos Positivos):',
    scrollRuleText:
      'Role o scroll em APENAS UMA direção por teste. O seu primeiro movimento após clicar em "Iniciar Teste" trava a direção padrão (Para Cima ou Para Baixo) durante toda a sessão. Para testar a direção oposta, clique em Resetar e inicie um novo teste.',
    scrollZoneTitle: 'Arena do Codificador do Scroll',
    scrollZoneSub:
      'Clique em "Iniciar Teste" acima e role o scroll continuamente em uma única direção (só para Baixo ou só para Cima) dentro desta área.',
    clickStartToBegin: 'Clique em "Iniciar Teste" para Começar',
    scrollWaitingFirstDir: 'Teste Rodando — Role para Cima ou para Baixo para Travar a Direção',
    scrollLockedBadge: 'Direção Travada: {locked} • Rolando {dir} (Sequência: {streak})',
    scrollReverseJumpBadge: 'Pulo Reverso ({dir}) Detectado (Travado em {locked})',
    scrollOppositeWarnBadge: 'Direção Oposta ({dir}) — Role Apenas para {locked}',
    rotaryVisualizer: 'Visualizador do Encoder Rotativo',
    detectsReverseSub: 'Detecta Scroll Reverso ao Vivo',
    scrollUpSteps: 'Passos para Cima',
    upwardTicks: 'Pulsos para Cima',
    scrollDownSteps: 'Passos para Baixo',
    downwardTicks: 'Pulsos para Baixo',
    lockedDirLabel: 'Direção Travada',
    singleDirModeSub: 'Trava de Direção Única',
    notLockedYet: 'Destravado',
    dirUp: 'CIMA',
    dirDown: 'BAIXO',
    canvasUpSteps: 'PASSOS CIMA',
    canvasDownSteps: 'PASSOS BAIXO',
    reverseScrollJumps: 'Pulos de Scroll Reverso',
    oppositeBounceFaults: 'Falhas de Pulo Oposto',
    scrollLogHeader: 'Telemetria do Encoder Rotativo ao Vivo',
    scrollLogThreshold: 'Direção Única por Teste | Detecta Rebote de Fase',
    scrollLogReady: 'Clique em "Iniciar Teste" acima e role o scroll em APENAS UMA direção dentro da área.',
    scrollLogStarted: 'Teste iniciado — seu primeiro movimento de scroll travará a direção padrão (CIMA ou BAIXO).',
    scrollLogStopped: 'Teste de scroll interrompido manualmente.',
    scrollLogLocked: 'Direção padrão travada para {dir}. Continue rolando apenas para {dir} até o fim do teste.',
    notifReverseTitle: 'Scroll Reverso Detectado',
    notifReverseMsg: 'A direção padrão é {locked}, mas o scroll deu um pulo reverso para {dir} ({ms}ms).',
    notifIntentionalOppositeTitle: 'Rolagem na Direção Oposta Detectada',
    notifIntentionalOppositeMsg:
      'Este teste está travado para {locked}. Você começou a rolar para {dir} de propósito — role apenas para {locked} ou clique em Resetar para testar a outra direção.',
    notifIrregularStepTitle: 'Passo de Scroll Irregular',
    notifIrregularStepMsg: 'Magnitude irregular ({curr}px vs {prev}px) ao rolar para {dir}.',
    notifScrollDoneFaultTitle: 'Teste Finalizado — Scroll Reverso Detectado',
    notifScrollDoneFaultMsg: 'Detectamos {count} pulo(s) de scroll reverso. Veja a hipótese e como consertar abaixo.',
    notifScrollDoneOkTitle: 'Teste Finalizado — Scroll Saudável',
    notifScrollDoneOkMsg: 'Analisamos {steps} passos na direção {dir} com zero pulos reversos.',

    // Polling Test
    pollingZoneTitle: 'Arena de Frequência (Polling Rate) & Sensor',
    pollingZoneSub:
      'Clique em "Iniciar Teste" acima e mova o cursor em círculos rápidos e contínuos dentro desta área.',
    livePollingRate: 'Polling Rate ao Vivo',
    instantRate: 'Taxa Instantânea',
    peakPollingRate: 'Pico de Polling Rate',
    maxRecorded: 'Máximo Registrado',
    avgRate: 'Taxa Média',
    activeMotionMean: 'Média em Movimento',
    pollingStability: 'Estabilidade de Polling',
    packetConsistency: 'Consistência de Pacotes',
    pollingLogHeader: 'Telemetria do Sensor & Pacotes USB',
    pollingLogSub: 'Fluxo Bruto de Eventos do Ponteiro',
    pollingLogReady: 'Clique em "Iniciar Teste" acima e mova o mouse em círculos contínuos dentro da arena.',
    pollingLogStarted: 'Teste de Polling iniciado — mova o mouse em círculos rápidos sem parar.',
    pollingLogStopped: 'Teste de Polling Rate interrompido manualmente.',
    notifSpikeTitle: 'Pico de Jitter no Sensor Detectado',
    notifSpikeMsg: 'O cursor saltou {px}px em {ms}ms.',
    notifDropTitle: 'Queda de Polling Rate Detectada',
    notifDropMsg: 'A taxa caiu bruscamente de ~{avg}Hz para {curr}Hz durante o movimento.',
    notifPollingDoneWarnTitle: 'Teste Finalizado — Oscilação Detectada',
    notifPollingDoneWarnMsg: 'Detectamos {drops} queda(s) de polling e {spikes} pico(s). Veja a hipótese e solução abaixo.',
    notifPollingDoneOkTitle: 'Teste Finalizado — Sensor Estável',
    notifPollingDoneOkMsg: 'Média de {avg} Hz (Pico de {peak} Hz) com {stab}% de estabilidade.',

    // Diagnostics & Reports
    diagHypothesisPrefix: 'Hipótese de Diagnóstico:',
    fixGuideBtnText: 'Clique para Ver: O Que Fazer para Consertar ({count} Ações Recomendadas)',
    footerCreditHtml: 'Projetado & Desenvolvido por <strong>Carlos Monte Lima</strong> — Todos os Direitos Reservados.'
  }
};

let currentLang = localStorage.getItem('mouse-tester-lang') || 'en';
const listeners = new Set();

export function getLang() {
  return currentLang;
}

export function t(key, vars = {}) {
  const dict = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
  let str = dict[key] ?? TRANSLATIONS.en[key] ?? key;
  Object.entries(vars).forEach(([k, v]) => {
    str = str.replaceAll(`{${k}}`, String(v));
  });
  return str;
}

export function onLanguageChange(fn) {
  listeners.add(fn);
}

export function setLang(lang) {
  currentLang = lang === 'pt' ? 'pt' : 'en';
  localStorage.setItem('mouse-tester-lang', currentLang);
  document.documentElement.setAttribute('lang', currentLang === 'pt' ? 'pt-BR' : 'en');
  applyStaticTranslations();
  listeners.forEach((fn) => fn(currentLang));
}

export function applyStaticTranslations() {
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (key) {
      el.textContent = t(key);
    }
  });

  document.querySelectorAll('[data-i18n-html]').forEach((el) => {
    const key = el.getAttribute('data-i18n-html');
    if (key) {
      el.innerHTML = t(key);
    }
  });

  const headerBrand = document.getElementById('header-mouse-brand');
  if (headerBrand) {
    headerBrand.setAttribute('title', t('headerTitleAttr'));
  }

  const langLabel = document.getElementById('lang-toggle-label');
  if (langLabel) {
    langLabel.textContent = currentLang === 'en' ? 'PT-BR' : 'EN';
  }
}
