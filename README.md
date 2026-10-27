<div align="center">

  <img src="assets/mouse.png" alt="Mouse Tester Logo" width="160" />

  # Mouse Tester
  **Precision Web Hardware Diagnostic Suite**

  [![Created by Carlos Monte Lima](https://img.shields.io/badge/Created%20by-Carlos%20Monte%20Lima-9333ea?style=for-the-badge&logo=github)](https://github.com/carlosmontelima)
  [![Tech Stack](https://img.shields.io/badge/Stack-HTML5%20%7C%20CSS3%20%7C%20ES6%20JS-a855f7?style=for-the-badge)](#)
  [![License](https://img.shields.io/badge/Theme-Purple%20Glassmorphism-7e22ce?style=for-the-badge)](#)

  <p align="center">
    <a href="#-english"><strong>English</strong></a> •
    <a href="#-português"><strong>Português</strong></a>
  </p>

</div>

---

## 🌐 English

**Mouse Tester** is a complete web-based diagnostic suite built to test mouse switches, side buttons, rotary scroll wheel encoders, and optical sensor polling rates (`Hz`). It detects hardware and firmware anomalies in real time and provides technical hypotheses along with step-by-step repair guides after each test session.

### Key Features

| Module | What It Tests | Real-Time Anomaly Detection |
| :--- | :--- | :--- |
| **1. Mouse Buttons & Side Switches** | Left (`M1`), Right (`M2`), Middle (`M3`), Side Back (`M4`), and Side Forward (`M5`) | Detects **Double-Click / Switch Chatter** (`< 80ms` interval) and **Hold-Release Dropouts** (`< 45ms` contact loss while holding/dragging). |
| **2. Scroll Wheel & Encoder** | Upward/Downward scroll steps, directional streaks, and live step impulse graph | Detects **Reverse Scroll Jumps (Encoder Phase Bounce)** immediately when the wheel registers an opposite-direction tick during a scroll streak, plus erratic step spikes. |
| **3. Polling Rate (`Hz`) & Sensor** | Instantaneous `Hz`, Peak `Hz`, Average `Hz`, Stability `%`, and live waveform | Uses raw uncoalesced pointer streams (`pointerrawupdate` / `getCoalescedEvents`) to flag **USB/Wireless Packet Drops** and **Sensor Jitter Spikes**. |

### Highlights
- **Welcome Screen & Animated Outlines**: Displays the custom mouse icon and title with a progressive glowing purple outline animation and floating ambient particles, transitioning into a sticky top-left header once inside the app.
- **Strictly Isolated Timed Sessions**: Tests never overlap; choose between **30s, 60s, 90s, or 120s** and start when ready.
- **Live Non-Intrusive Notifications**: Smooth top-right glass notifications report anomalies the instant they occur during a test.
- **Post-Test Hypothesis & Fix Guide**: Explains *why* the anomaly happens (e.g., oxidized microswitch leaf springs, dust/grease in the rotary quadrature encoder, or 2.4GHz wireless interference) with an expandable **"What You Can Do to Fix It"** tab.
- **Dark & Light Themes**: Deep purple glassmorphism dark theme by default with a one-click **Light / Dark Mode** switcher.

### Running Locally
```bash
# Run any local static server in the project root:
python -m http.server 8080
```
Then open `http://localhost:8080` in your browser.

---

## 🇧🇷 Português

O **Mouse Tester** é uma suíte completa de diagnóstico via web desenvolvida para testar todos os aspectos do seu mouse: cliques principais, botões laterais, scroll (codificador rotativo) e taxa de atualização (*Polling Rate* em `Hz`). Ele detecta anomalias de hardware e firmware em tempo real e apresenta hipóteses técnicas detalhadas com um guia interativo de como resolver cada problema.

### Principais Funcionalidades

| Módulo de Teste | O Que É Testado | Detecção de Anomalias em Tempo Real |
| :--- | :--- | :--- |
| **1. Botões & Switches Laterais** | Botão Esquerdo (`M1`), Direito (`M2`), Meio (`M3`), Lateral Voltar (`M4`) e Avançar (`M5`) | Detecta **Duplo Clique Indesejado / Switch Chatter** (intervalo `< 80ms`) e **Falha ao Segurar / Arrastar** (perda de contato `< 45ms` durante o clique pressionado). |
| **2. Scroll Wheel & Encoder** | Passos para cima/baixo, sequência direcional e gráfico de passos em tempo real | Detecta **Scroll Reverso (Encoder Bounce)** no exato momento em que a roda registra um passo na direção oposta durante a rolagem, além de picos irregulares. |
| **3. Polling Rate (`Hz`) & Sensor** | Taxa `Hz` ao vivo, Pico `Hz`, Média `Hz`, `%` de Estabilidade e gráfico contínuo | Analisa eventos brutos do ponteiro (`pointerrawupdate` / `getCoalescedEvents`) para identificar **Quedas de Polling (Packet Drops)** e **Picos de Jitter do Sensor**. |

### Destaques do Projeto
- **Tela de Boas-Vindas Animada**: Apresenta o ícone personalizado do mouse e o título com contornos roxos brilhantes desenhados gradualmente e partículas flutuantes, transformando-se em um cabeçalho interativo no canto superior esquerdo ao entrar no app.
- **Testes Isolados com Tempo Configurável**: Os testes nunca rodam juntos para garantir precisão; escolha entre **30s, 60s, 90s ou 120s** e inicie pelo botão **Start Test**.
- **Notificações em Tempo Real**: Alertas elegantes deslizam no canto superior direito assim que uma anomalia é detectada durante o teste.
- **Hipótese de Diagnóstico & Aba de Soluções**: Ao final do tempo, o app descreve o que está acontecendo fisicamente/eletricamente no mouse e disponibiliza uma aba clicável mostrando passo a passo **o que fazer para consertar**.
- **Tema Escuro & Claro**: Visual *Glassmorphism* com iluminação *bloom* roxa, efeito *backlight* nos botões e alternância entre **Dark Mode** e **Light Mode**.

### Como Rodar Localmente
```bash
# Inicie qualquer servidor estático na raiz do projeto:
python -m http.server 8080
```
Depois, acesse `http://localhost:8080` no seu navegador.

---

<div align="center">
  Desenvolvido por <strong><a href="https://github.com/carlosmontelima">Carlos Monte Lima (@carlosmontelima)</a></strong>
</div>
