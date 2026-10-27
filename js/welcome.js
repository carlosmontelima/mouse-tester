/**
 * Welcome Screen & Top-Left Animated Mouse Header Controller
 * - Once scrolled down to the app, locks out the Welcome Screen so scrolling up cannot return to it.
 * - Reveals the top-left mouse icon + outlined "Mouse Tester" header and runs its gradual outline draw animation.
 * - Clicking the top-left mouse header (or refreshing the page) returns to the Welcome Screen.
 */

export function initWelcomeScreen({ onReturnToWelcome } = {}) {
  const heroStageEl = document.getElementById('hero-mouse-stage');
  const headerBrandEl = document.getElementById('header-mouse-brand');
  const scrollBtn = document.getElementById('scroll-to-arena-btn');
  const canvas = document.getElementById('welcome-particles');

  let inAppMode = false;
  let isTransitioning = false;

  const triggerHeroOutlineAnimation = () => {
    if (!heroStageEl) return;
    heroStageEl.classList.remove('is-drawn');
    const paths = document.querySelectorAll('.mouse-contour-path, .hero-title-text');
    paths.forEach((el) => {
      el.style.animation = 'none';
      void el.offsetWidth;
      el.style.animation = '';
    });
    requestAnimationFrame(() => {
      heroStageEl.classList.add('is-drawn');
    });
  };

  const triggerHeaderOutlineAnimation = () => {
    if (!headerBrandEl) return;
    headerBrandEl.classList.remove('animate-outline', 'is-drawn');
    const paths = headerBrandEl.querySelectorAll('.header-contour-path, .header-title-text');
    paths.forEach((el) => {
      el.style.animation = 'none';
      void el.offsetWidth;
      el.style.animation = '';
    });
    requestAnimationFrame(() => {
      headerBrandEl.classList.add('animate-outline', 'is-drawn');
    });
  };

  const enterAppMode = () => {
    if (inAppMode || isTransitioning) return;
    isTransitioning = true;
    document.body.classList.add('welcome-leaving');

    setTimeout(() => {
      inAppMode = true;
      isTransitioning = false;
      document.body.classList.remove('welcome-leaving');
      document.body.classList.add('in-app-mode');
      window.scrollTo({ top: 0, behavior: 'instant' });
      triggerHeaderOutlineAnimation();
    }, 380);
  };

  const returnToWelcomeScreen = (e) => {
    if (e) e.preventDefault();
    if (!inAppMode || isTransitioning) return;
    inAppMode = false;
    if (typeof onReturnToWelcome === 'function') {
      onReturnToWelcome();
    }
    document.body.classList.remove('in-app-mode', 'welcome-leaving');
    window.scrollTo({ top: 0, behavior: 'instant' });
    triggerHeroOutlineAnimation();
  };

  // Initial welcome outline draw on load
  triggerHeroOutlineAnimation();

  if (scrollBtn) {
    scrollBtn.addEventListener('click', enterAppMode);
  }

  if (headerBrandEl) {
    headerBrandEl.addEventListener('click', returnToWelcomeScreen);
  }

  window.addEventListener('keydown', (e) => {
    if (!inAppMode && e.key === 'ArrowDown') {
      e.preventDefault();
      enterAppMode();
    }
  });

  window.addEventListener(
    'wheel',
    (e) => {
      if (!inAppMode && e.deltaY > 10) {
        enterAppMode();
      }
    },
    { passive: true }
  );

  if (canvas) {
    initParticlesCanvas(canvas);
  }
}

function initParticlesCanvas(canvas) {
  const ctx = canvas.getContext('2d');
  let width = 0;
  let height = 0;
  let particles = [];
  let mouseX = -1000;
  let mouseY = -1000;

  const resize = () => {
    width = canvas.width = canvas.offsetWidth || window.innerWidth;
    height = canvas.height = canvas.offsetHeight || window.innerHeight;
  };

  resize();
  window.addEventListener('resize', resize);

  window.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
  });

  const count = Math.min(75, Math.max(38, Math.floor(window.innerWidth / 22)));
  const palette = [
    'rgba(192, 132, 252, ',
    'rgba(168, 85, 247, ',
    'rgba(147, 51, 234, ',
    'rgba(232, 121, 249, '
  ];

  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 2.6 + 0.9,
      vx: (Math.random() - 0.5) * 0.42,
      vy: -Math.random() * 0.55 - 0.15,
      alpha: Math.random() * 0.65 + 0.2,
      pulseSpeed: Math.random() * 0.025 + 0.008,
      pulsePhase: Math.random() * Math.PI * 2,
      colorPrefix: palette[i % palette.length]
    });
  }

  const render = () => {
    if (!document.body.classList.contains('in-app-mode')) {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.pulsePhase += p.pulseSpeed;
        p.x += p.vx;
        p.y += p.vy;

        const dx = p.x - mouseX;
        const dy = p.y - mouseY;
        const distSq = dx * dx + dy * dy;
        if (distSq < 16000 && distSq > 1) {
          const dist = Math.sqrt(distSq);
          p.x += (dx / dist) * 0.45;
          p.y += (dy / dist) * 0.45;
        }

        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        const currentAlpha = Math.max(0.12, Math.min(0.9, p.alpha + Math.sin(p.pulsePhase) * 0.22));

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `${p.colorPrefix}${currentAlpha})`;
        ctx.shadowColor = 'rgba(192, 132, 252, 0.85)';
        ctx.shadowBlur = p.r * 6;
        ctx.fill();
        ctx.restore();
      }
    }

    requestAnimationFrame(render);
  };

  requestAnimationFrame(render);
}
