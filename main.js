/**
 * main.js — Scroll Driven Hero Section
 * Assignment: Scroll Driven Hero Section Animation
 *
 * Animations:
 *  1. Custom cursor tracking
 *  2. Nav style on scroll
 *  3. Hero headline — letter-by-letter staggered reveal
 *  4. Tagline fade-up reveal
 *  5. Stats counter animation
 *  6. CTA fade-up
 *  7. Scroll-driven visual card (parallax + rotation + progress)
 *  8. About, Work, Contact section scroll reveals
 *
 * Tech: GSAP 3 + ScrollTrigger (CDN), Vanilla JS
 */

/* ================================================================
   0. GSAP PLUGIN REGISTRATION
   ================================================================ */
gsap.registerPlugin(ScrollTrigger);

/* ================================================================
   1. CUSTOM CURSOR
   ================================================================ */
(function initCursor() {
  const cursor    = document.getElementById('cursor');
  const cursorDot = document.getElementById('cursorDot');
  if (!cursor) return;

  let mouseX = 0, mouseY = 0;
  let curX = 0, curY = 0;

  // Fast dot follows immediately
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    gsap.to(cursorDot, { x: mouseX, y: mouseY, duration: 0.05, ease: 'none' });
  });

  // Outer ring follows with lag (lerp feel)
  function animateCursor() {
    curX += (mouseX - curX) * 0.12;
    curY += (mouseY - curY) * 0.12;
    gsap.set(cursor, { x: curX, y: curY });
    requestAnimationFrame(animateCursor);
  }
  animateCursor();
})();

/* ================================================================
   2. NAV SCROLL STATE
   ================================================================ */
(function initNav() {
  const nav = document.getElementById('nav');
  if (!nav) return;

  ScrollTrigger.create({
    start: 'top -80',
    onUpdate: (self) => {
      nav.classList.toggle('scrolled', self.progress > 0);
    }
  });
})();

/* ================================================================
   3. HERO INITIAL LOAD ANIMATIONS (on page load, NOT scroll)
   ================================================================ */
(function initHeroLoad() {
  /**
   * GSAP timeline for the initial page load:
   *  - Letters stagger in from below
   *  - Tagline lines fade up
   *  - Stats animate in
   *  - CTA fades in
   *  - Visual card slides in from right
   */
  const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

  /* --- Letters --- */
  const letters = document.querySelectorAll('.letter');
  tl.to(letters, {
    opacity: 1,
    y: 0,
    duration: 0.7,
    stagger: {
      each: 0.045,
      ease: 'power2.out'
    }
  });

  /* --- Tagline --- */
  tl.to('#taglineLine1', { opacity: 1, y: 0, duration: 0.6 }, '-=0.3')
    .to('#taglineLine2', { opacity: 1, y: 0, duration: 0.6 }, '-=0.45');

  /* --- Stats --- */
  const stats = document.querySelectorAll('.stat');
  tl.to(stats, {
    opacity: 1,
    y: 0,
    duration: 0.5,
    stagger: 0.08
  }, '-=0.2');

  /* --- CTA --- */
  tl.to('#heroCTA', { opacity: 1, y: 0, duration: 0.5 }, '-=0.2');

  /* --- Visual card enters from right --- */
  tl.fromTo('#heroVisual',
    { opacity: 0, x: 60, rotateY: 20 },
    { opacity: 1, x: 0, rotateY: 0, duration: 1, ease: 'power3.out' },
    0.2
  );

  /* --- Floating tags pop in after card --- */
  tl.fromTo('.card-tag',
    { opacity: 0, scale: 0.7 },
    { opacity: 1, scale: 1, duration: 0.4, stagger: 0.15, ease: 'back.out(2)' },
    '-=0.3'
  );

})();

/* ================================================================
   4. STATS COUNTER ANIMATION (triggered on scroll into view)
   ================================================================ */
(function initCounters() {
  const statNumbers = document.querySelectorAll('.stat__number');

  statNumbers.forEach((el) => {
    const target = parseInt(el.getAttribute('data-target'), 10);
    const obj = { val: 0 };

    ScrollTrigger.create({
      trigger: '#stats',
      start: 'top 80%',
      once: true,
      onEnter: () => {
        gsap.to(obj, {
          val: target,
          duration: 1.8,
          ease: 'power2.out',
          onUpdate: () => {
            el.textContent = Math.round(obj.val);
          }
        });
      }
    });
  });
})();

/* ================================================================
   5. SCROLL-DRIVEN VISUAL CARD (core feature)
   ================================================================ */
(function initScrollVisual() {
  const visualCard = document.getElementById('visualCard');
  const progressFill = document.getElementById('progressFill');
  const progressLabel = document.getElementById('progressLabel');

  if (!visualCard) return;

  /**
   * As user scrolls through the hero section:
   *  - Card gently floats upward and rotates slightly
   *  - Card scales down to simulate depth / car going into distance
   *  - Progress bar fills up showing scroll progress
   *  - Card's glow intensifies
   */
  ScrollTrigger.create({
    trigger: '.hero',
    start: 'top top',
    end: 'bottom top',
    scrub: 1.2,            // smooth scrub — tied to scroll, not time-based
    onUpdate: (self) => {
      const p = self.progress; // 0 → 1 as hero scrolls past

      // Update progress bar + label (live feedback)
      const pct = Math.round(p * 100);
      progressFill.style.width = pct + '%';
      progressLabel.textContent = pct + '%';

      // Parallax: card moves up, scales slightly, rotates subtly
      gsap.to(visualCard, {
        y:       -p * 120,          // float upward
        rotateZ: p * -6,            // slight counter-clockwise lean
        rotateY: p * 12,            // slight Y-axis rotation (3D depth)
        scale:   1 - p * 0.08,     // shrink a little (depth illusion)
        duration: 0.3,
        ease: 'none',
        overwrite: 'auto'
      });
    }
  });

  /**
   * Continuous idle float animation when not scrolling
   * (adds life to the card sitting on screen)
   */
  gsap.to(visualCard, {
    y: -12,
    duration: 3,
    ease: 'sine.inOut',
    repeat: -1,
    yoyo: true
  });
})();

/* ================================================================
   6. HERO SCROLL-OUT (headline tracks scroll)
   ================================================================ */
(function initHeroScrollOut() {
  // As hero leaves viewport, headline blurs and fades
  gsap.to('#headline', {
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: '50% top',
      scrub: 1.5
    },
    opacity: 0.3,
    filter: 'blur(4px)',
    y: -40
  });

  // Tagline also moves up slightly
  gsap.to('#tagline', {
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: '40% top',
      scrub: 1
    },
    opacity: 0,
    y: -30
  });
})();

/* ================================================================
   7. ABOUT SECTION SCROLL REVEALS
   ================================================================ */
(function initAboutReveal() {
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: '.about-section',
      start: 'top 70%',
      end: 'bottom 80%',
      toggleActions: 'play none none reverse'
    }
  });

  tl.to('.about-eyebrow', { opacity: 1, y: 0, duration: 0.5 })
    .to('.about-headline', { opacity: 1, y: 0, duration: 0.7 }, '-=0.2')
    .to('.about-body',     { opacity: 1, y: 0, duration: 0.6 }, '-=0.4')
    .to('.about-card',     {
      opacity: 1, x: 0, duration: 0.5, stagger: 0.12, ease: 'power3.out'
    }, '-=0.3');
})();

/* ================================================================
   8. WORK SECTION REVEALS
   ================================================================ */
(function initWorkReveal() {
  // Eyebrow + headline
  gsap.to('.section-eyebrow', {
    scrollTrigger: { trigger: '.work-section', start: 'top 75%', toggleActions: 'play none none reverse' },
    opacity: 1, duration: 0.5
  });
  gsap.to('.section-headline', {
    scrollTrigger: { trigger: '.work-section', start: 'top 72%', toggleActions: 'play none none reverse' },
    opacity: 1, y: 0, duration: 0.6
  });

  // Work cards stagger in
  gsap.to('.work-card', {
    scrollTrigger: {
      trigger: '.work-grid',
      start: 'top 80%',
      toggleActions: 'play none none reverse'
    },
    opacity: 1,
    y: 0,
    duration: 0.7,
    stagger: 0.15,
    ease: 'power3.out'
  });
})();

/* ================================================================
   9. CONTACT SECTION REVEALS
   ================================================================ */
(function initContactReveal() {
  gsap.to('.contact-headline', {
    scrollTrigger: { trigger: '.contact-section', start: 'top 75%', toggleActions: 'play none none reverse' },
    opacity: 1, y: 0, duration: 0.7
  });
  gsap.to('.contact-email', {
    scrollTrigger: { trigger: '.contact-section', start: 'top 72%', toggleActions: 'play none none reverse' },
    opacity: 1, y: 0, duration: 0.6, delay: 0.15
  });
  gsap.to('.contact-social', {
    scrollTrigger: { trigger: '.contact-section', start: 'top 68%', toggleActions: 'play none none reverse' },
    opacity: 1, duration: 0.6, delay: 0.3
  });
})();

/* ================================================================
   10. PARALLAX AMBIENT ORBS ON MOUSE MOVE
   ================================================================ */
(function initOrbParallax() {
  const orbs = document.querySelectorAll('.hero__orb');
  document.addEventListener('mousemove', (e) => {
    const cx = window.innerWidth  / 2;
    const cy = window.innerHeight / 2;
    const dx = (e.clientX - cx) / cx; // -1 to 1
    const dy = (e.clientY - cy) / cy;

    orbs.forEach((orb, i) => {
      const factor = (i + 1) * 12;
      gsap.to(orb, {
        x: dx * factor,
        y: dy * factor,
        duration: 1.5,
        ease: 'power2.out',
        overwrite: 'auto'
      });
    });
  });
})();

/* ================================================================
   11. SCROLL HINT — hide after first scroll
   ================================================================ */
(function initScrollHint() {
  const hint = document.getElementById('scrollHint');
  if (!hint) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
      gsap.to(hint, { opacity: 0, y: 10, duration: 0.4, onComplete: () => hint.remove() });
    }
  }, { once: true });
})();

/* ================================================================
   12. GSAP GLOBAL SETTINGS (performance)
   ================================================================ */
gsap.config({
  force3D: true,        // always use 3D transforms for GPU compositing
  nullTargetWarn: false
});

// Refresh ScrollTrigger after all assets load (avoids position bugs)
window.addEventListener('load', () => {
  ScrollTrigger.refresh();
  console.log('✅ ITZFIZZ Scroll Hero — ready!');
});
