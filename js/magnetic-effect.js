/**
 * Magnetic Effect - DialedWeb Style
 * Moves buttons gently towards the cursor when hovered.
 * Optimized: uses translate3d for GPU acceleration, debounced via rAF.
 */

(function () {
  'use strict';

  // Only apply on non-touch devices — magnetic effect is irrelevant on mobile
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const magneticElements = document.querySelectorAll('.btn-glass, .nav-toggle, .project-link-icon, .brand-logo');
  const intensity = 0.35;

  magneticElements.forEach((el) => {
    let rafId = 0;

    el.addEventListener('mousemove', function (e) {
      if (rafId) return; // throttle to 1 update per frame
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        const rect = this.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) * intensity;
        const y = (e.clientY - rect.top - rect.height / 2) * intensity;
        this.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      });
    }, { passive: true });

    el.addEventListener('mouseleave', function () {
      if (rafId) { cancelAnimationFrame(rafId); rafId = 0; }
      this.style.transform = '';
    }, { passive: true });
  });
})();
