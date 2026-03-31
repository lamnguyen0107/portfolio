/**
 * Audio Effects - Hover Sound Implementation
 * Optimized: uses a pre-allocated audio pool instead of cloneNode per hover.
 */

(function () {
  'use strict';

  // Skip on mobile — saves memory and avoids autoplay policy issues
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const POOL_SIZE = 4;
  const VOLUME = 0.3;
  const pool = [];
  let poolIdx = 0;
  let poolReady = false;

  // Lazy-initialize pool on first user interaction to respect autoplay policy
  function initPool() {
    if (poolReady) return;
    poolReady = true;
    for (let i = 0; i < POOL_SIZE; i++) {
      const a = new Audio('./assets/audio/fx.mp3');
      a.volume = VOLUME;
      a.preload = 'auto';
      pool.push(a);
    }
  }

  function playHoverSound() {
    if (!poolReady) initPool();
    const sound = pool[poolIdx];
    poolIdx = (poolIdx + 1) % POOL_SIZE;
    sound.currentTime = 0;
    sound.play().catch(() => {});
  }

  // Initialize pool on first click/touch
  document.addEventListener('click', initPool, { once: true });
  document.addEventListener('touchstart', initPool, { once: true, passive: true });

  const targetElements = 'a, button, .btn, .btn-glass, .project-card, .logo-cube-container, [role="button"]';

  document.addEventListener('mouseover', (e) => {
    const target = e.target.closest(targetElements);
    if (target && !target.dataset.hovered) {
      playHoverSound();
      target.dataset.hovered = '1';
    }
  }, { passive: true });

  document.addEventListener('mouseout', (e) => {
    const target = e.target.closest(targetElements);
    if (target) target.dataset.hovered = '';
  }, { passive: true });
})();
