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
        
        // Optimize for device resolution
        try {
            if (this.app.setPixelRatio) {
                this.app.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit to 2 for performance
            }
        } catch (e) {
            console.warn('Could not set pixel ratio:', e);
        }
        
        // Global scale: Reverted to 1.0 for original proportions
        const isMobile = window.innerWidth <= 800;
        const baseScale = 1.0; 
        
        const allObjects = this.app.getAllObjects();
        if (allObjects && allObjects.length > 0) {
            allObjects.forEach(obj => {
                // If it's a visual object (not camera/light/environment)
                const isVisual = obj.name && !['Camera', 'Directional Light', 'Environment', 'Point Light', 'Sun', 'Light'].some(n => obj.name.includes(n));
                
                if (isVisual && obj.scale) {
                    obj.scale.x *= baseScale;
                    obj.scale.y *= baseScale;
                    obj.scale.z *= baseScale;
                }
                
                // Keep camera adjustments to ensure full object cluster visibility
                const isCamera = obj.type === 'camera' || (obj.name && obj.name.toLowerCase().includes('camera'));
                if (isCamera && obj.position) {
                    // Optimized factors to prevent frustum clipping
                    const frustumFactor = isMobile ? 1.55 : 1.25;
                    obj.position.z *= frustumFactor;
                    console.log('Optimized Camera Frustum for:', obj.name);
                }
            });
        }
        
        // Final resize check
        this.handleResize();
        window.addEventListener('resize', () => this.handleResize());
        
    } catch (error) {
        console.error('Error loading Spline scene:', error);
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
        const isMobile = window.innerWidth < 768;
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('spline-canvas')) {
        new SplineHandler('spline-canvas', 'https://prod.spline.design/y8oaJvNQ9PoTRe1b/scene.splinecode');
    }
});
