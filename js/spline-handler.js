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
            
            // Adjust camera & scale for Desktop to make object feel further away
            this.adjustCameraForDesktop();
            
            // Global scale reduction for ALL devices (10% smaller as requested)
            const allObjects = this.app.getAllObjects();
            if (allObjects && allObjects.length > 0) {
                allObjects.forEach(obj => {
                    if (obj.name && obj.name !== 'Camera' && obj.name !== 'Directional Light' && obj.name !== 'Environment') {
                        obj.scale.x *= 0.90;
                        obj.scale.y *= 0.90;
                        obj.scale.z *= 0.90;
                    }
                });
            }
            
            this.handleResize();
            window.addEventListener('resize', () => this.handleResize());
            
        } catch (error) {
            console.error('Error loading Spline scene:', error);
        }
    }

    /**
     * Pull the camera back and slightly scale down the object on Desktop viewports.
     * This creates a 'deeper' feeling of distance and gives more room for interaction.
     */
    adjustCameraForDesktop() {
        if (window.innerWidth <= 900) return; // Desktop only

        try {
            const camera = this.app.findObjectByName('Camera');
            if (camera) {
                // Push camera significantly further back (Desktop only zoom-out)
                camera.position.z = camera.position.z * 3.0;
                console.log('Desktop: Camera zoomed out significantly to', camera.position.z);
            }

            // Scale down the object further for Desktop (requested 10% on top of previous adjustment)
            const allObjects = this.app.getAllObjects();
            if (allObjects && allObjects.length > 0) {
                for (const obj of allObjects) {
                    if (obj.name && obj.name !== 'Camera' && obj.name !== 'Directional Light' && obj.name !== 'Environment') {
                        obj.scale.x *= 0.315; 
                        obj.scale.y *= 0.315;
                        obj.scale.z *= 0.315;
                        console.log('Desktop: Scaled down object to 0.315 scale:', obj.name);
                        break; 
                    }
                }
            }
        } catch (err) {
            console.warn('Could not adjust desktop camera/object:', err);
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
        new SplineHandler('spline-canvas', 'https://prod.spline.design/a0rHWFtuaJKy618c/scene.splinecode');
    }
});
