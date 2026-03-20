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
            const allObjects = this.app.getAllObjects();
            
            // 1. First, zoom out ALL cameras
            allObjects.forEach(obj => {
                const isCamera = obj.type === 'camera' || (obj.name && obj.name.toLowerCase().includes('camera'));
                if (isCamera && obj.position) {
                    // Moving camera further away (~3x from original)
                    // If Z is negative or weird, we try to adjust reasonably
                    const zoomFactor = 3.2; 
                    obj.position.z *= zoomFactor;
                    obj.position.x *= zoomFactor * 0.5; // Slight offset to look from side
                    console.log('Desktop: Zoomed out camera:', obj.name, 'to', obj.position.z);
                }
            });

            // 2. Second, apply a consistent small scale reduction to ALL visual objects
            // But only those that don't have a parent (to avoid double-scaling)
            // Note: In @splinetool/runtime, objects might not have .parent exposed simply,
            // but we can assume root-level objects have specific names or types.
            // For now, let's just use the camera zoom as the primary 'size' control on desktop.
            
            console.log('Desktop: Scene adjusted via camera zoom.');
            
        } catch (err) {
            console.warn('Could not adjust desktop camera/objects:', err);
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
        new SplineHandler('spline-canvas', 'https://prod.spline.design/y8oaJvNQ9PoTRe1b/scene.splinecode');
    }
});
