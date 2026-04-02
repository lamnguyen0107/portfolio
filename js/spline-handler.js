import { Application } from 'https://esm.sh/@splinetool/runtime';

/**
 * SplineHandler handles the loading and integration of the Spline 3D scene.
 */
class SplineHandler {
    constructor(canvasId, sceneUrl) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            console.error(`Canvas with ID "${canvasId}" not found.`);
            return;
        }
        // Ensure canvas is visible on every device.
        this.canvas.style.display = 'block';
        this.canvas.style.visibility = 'visible';
        this.canvas.style.opacity = '1';

        // Ensure parent container is also visible
        const parent = this.canvas.parentElement;
        if (parent) {
            parent.style.display = '';
            parent.style.visibility = 'visible';
            parent.style.opacity = '1';
        }

        // FIX: Relay scroll wheel events to allows page scrolling while over the canvas
        // This prevents the Spline runtime from intercepting and blocking the page scroll.
        this.canvas.addEventListener('wheel', (e) => {
            // By stopping immediate propagation, we prevent Spline's own wheel listener 
            // from firing and calling preventDefault(), while allowing the event 
            // to bubble up to the window (and thus Lenis).
            e.stopImmediatePropagation();
        }, { capture: true, passive: true });

        this.app = new Application(this.canvas);
        this.sceneUrl = sceneUrl;
        this.retryCount = 0;
        this.maxRetries = 2;
        this.init();
    }

    async init() {
        try {
            await this.app.load(this.sceneUrl);
            console.log('Spline scene loaded successfully.');

            // Ensure the canvas background is transparent
            this.canvas.style.backgroundColor = 'transparent';

            // Force canvas visible again after load (some browsers reset styles)
            this.canvas.style.display = 'block';
            this.canvas.style.visibility = 'visible';
            this.canvas.style.opacity = '1';

            // Hide Spline watermark
            this.hideWatermark();

            // Set pixel ratio to device native (no capping)
            try {
                if (this.app.setPixelRatio) {
                    const dpr = Math.min(window.devicePixelRatio || 1, 2);
                    this.app.setPixelRatio(dpr);
                }
            } catch (e) {
                console.warn('Could not set pixel ratio:', e);
            }

            // Final resize check
            this.handleResize();
            let resizeRaf = 0;
            window.addEventListener('resize', () => {
                if (resizeRaf) return;
                resizeRaf = requestAnimationFrame(() => {
                    resizeRaf = 0;
                    this.handleResize();
                });
            });

        } catch (error) {
            console.error('Error loading Spline scene:', error);
            // Retry loading once
            if (this.retryCount < this.maxRetries) {
                this.retryCount++;
                console.log(`Retrying Spline load (attempt ${this.retryCount}/${this.maxRetries})...`);
                setTimeout(() => this.init(), 2000);
            }
        }
    }

    /**
     * Centering adjustment for Desktop viewports.
     * Relying more on CSS positioning now for a cleaner "lying fully within hero" look.
     */
    adjustCameraForDesktop() {
        // Current CSS (glass-theme.css) handles the shifting now.
        // This allows the object to stay centered within its interaction container.
        console.log('Desktop: Optimized via CSS and object scale.');
    }

    /**
     * Hide the "Built with Spline" watermark logo.
     */
    hideWatermark() {
        const container = this.canvas.parentElement;
        if (!container) return;

        const observer = new MutationObserver(() => {
            const watermarks = container.querySelectorAll('a[href*="spline"], div[class*="spline"], a[style*="position"]');
            watermarks.forEach(el => { el.style.display = 'none'; });
            const parentWatermarks = container.parentElement?.querySelectorAll(':scope > a[href*="spline"]');
            parentWatermarks?.forEach(el => { el.style.display = 'none'; });
        });

        observer.observe(container, { childList: true, subtree: true });

        setTimeout(() => {
            const allLinks = document.querySelectorAll('a[href*="spline.design"], a[href*="splinetool"]');
            allLinks.forEach(el => {
                if (el.closest('.hero-spline-fullscreen') || el.closest('.hero-spline-container') || el.closest('#spline-canvas')) {
                    el.style.display = 'none';
                }
            });
            container.querySelectorAll('*').forEach(el => {
                if (el.textContent?.includes('Built with Spline') || el.textContent?.includes('Spline')) {
                    if (el.tagName === 'A' || el.tagName === 'DIV' || el.tagName === 'SPAN') {
                        el.style.display = 'none';
                    }
                }
            });
        }, 500);
    }

    handleResize() {
        // No-op: CSS handles responsive sizing
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('spline-canvas')) {
        new SplineHandler('spline-canvas', 'https://prod.spline.design/y8oaJvNQ9PoTRe1b/scene.splinecode');
    }
});
