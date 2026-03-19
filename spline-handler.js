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

        this.app = new Application(this.canvas);
        this.sceneUrl = sceneUrl;
        this.init();
    }

    async init() {
        try {
            await this.app.load(this.sceneUrl);
            console.log('Spline scene loaded successfully.');
            
            // Ensure the canvas background is transparent
            this.canvas.style.backgroundColor = 'transparent';

            // Hide Spline watermark
            this.hideWatermark();
            
            this.handleResize();
            window.addEventListener('resize', () => this.handleResize());
            
        } catch (error) {
            console.error('Error loading Spline scene:', error);
        }
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
        const isMobile = window.innerWidth < 768;
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('spline-canvas')) {
        new SplineHandler('spline-canvas', 'https://prod.spline.design/PfMVBprKBdueuM0a/scene.splinecode');
    }
});
