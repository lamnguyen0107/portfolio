/**
 * Magnetic Effect - DialedWeb Style
 * Moves buttons gently towards the cursor when hovered.
 */

(function () {
  'use strict';

  const magneticElements = document.querySelectorAll('.btn-glass, .nav-toggle, .project-link-icon, .brand-logo');

  magneticElements.forEach((el) => {
    el.addEventListener('mousemove', function (e) {
      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      // Magnetic intensity: lower number = more subtle
      const intensity = 0.35;
      
      this.style.transform = `translate(${x * intensity}px, ${y * intensity}px)`;
    });

    el.addEventListener('mouseleave', function () {
      this.style.transform = `translate(0, 0)`;
    });
  });
})();
