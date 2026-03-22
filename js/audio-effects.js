/**
 * Audio Effects - Hover Sound Implementation
 * Inspired by DialedWeb
 */

(function () {
  'use strict';

  // Create an audio pool for better responsiveness (allows multiple simultaneous plays)
  const hoverSound = new Audio('./assets/audio/fx.mp3');
  hoverSound.volume = 0.3; // Default soft volume

  function playHoverSound() {
    // Reset and play
    const sound = hoverSound.cloneNode();
    sound.volume = 0.3;
    sound.play().catch(e => {
      // Silence if blocked by browser (autoplay policy)
      console.log('Audio play blocked. User must interact first.');
    });
  }

  // List of interactive elements to trigger sound
  const targetElements = 'a, button, .btn, .btn-glass, .project-card, .logo-cube-container, [role="button"]';

  // Use event delegation for hover sound
  document.addEventListener('mouseover', (e) => {
    const target = e.target.closest(targetElements);
    if (target) {
      // Only play if moving to a NEW interactable
      if (!target.dataset.hovered) {
        playHoverSound();
        target.dataset.hovered = 'true';
      }
    }
  });

  document.addEventListener('mouseout', (e) => {
    const target = e.target.closest(targetElements);
    if (target) {
      target.dataset.hovered = '';
    }
  });

})();
