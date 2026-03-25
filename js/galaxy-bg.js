import { Renderer, Program, Mesh, Color, Triangle } from 'https://esm.sh/ogl';

class GalaxyBG {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;

        const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
        const isCoarsePointer = window.matchMedia?.('(pointer: coarse)')?.matches ?? false;
        const isMobileViewport = window.matchMedia?.('(max-width: 800px)')?.matches ?? window.innerWidth <= 800;
        const lowPower = prefersReducedMotion || isCoarsePointer || isMobileViewport;

        this.options = {
            focal: [0.5, 0.5],
            rotation: [1.0, 0.0],
            starSpeed: 0.15,
            density: 0.7, // Reduced density
            hueShift: 210, 
            speed: 0.6, // Slightly slower speed
            mouseInteraction: true,
            glowIntensity: 0.2, // Reduced glow
            saturation: 0.1, // Significantly reduced saturation for a subtle look
            mouseRepulsion: true,
            repulsionStrength: 1.5,
            twinkleIntensity: 0.3,
            rotationSpeed: 0.03,
            autoCenterRepulsion: 0,
            transparent: true,
            // Performance/feel tuning
            layers: lowPower ? 3 : 5,
            maxDpr: lowPower ? 1.0 : 1.5,
            targetFps: lowPower ? 30 : 60,
            lowPower,
            mouseLerp: lowPower ? 0.35 : 0.65, // higher = less delay
            activeLerp: lowPower ? 0.25 : 0.55,
            scrollLerp: 0.04,
            ...options
        };

        // Apply a conservative preset unless explicitly overridden by options.
        if (lowPower) {
            if (!('density' in options)) this.options.density = Math.min(this.options.density, 0.55);
            if (!('glowIntensity' in options)) this.options.glowIntensity = Math.min(this.options.glowIntensity, 0.14);
            if (!('twinkleIntensity' in options)) this.options.twinkleIntensity = Math.min(this.options.twinkleIntensity, 0.18);
            if (!('rotationSpeed' in options)) this.options.rotationSpeed = Math.min(this.options.rotationSpeed, 0.02);
            if (!('repulsionStrength' in options)) this.options.repulsionStrength = Math.min(this.options.repulsionStrength, 1.0);
            if (!('mouseRepulsion' in options)) this.options.mouseRepulsion = false;
        }
        if (prefersReducedMotion) {
            if (!('rotationSpeed' in options)) this.options.rotationSpeed = 0.0;
            if (!('twinkleIntensity' in options)) this.options.twinkleIntensity = 0.0;
        }

        // Avoid per-event allocations.
        this.targetMousePos = { x: 0.5, y: 0.5 };
        this.smoothMousePos = { x: 0.5, y: 0.5 };
        this.targetMouseActive = 0.0;
        this.smoothMouseActive = 0.0;
        
        // Add properties for smooth scroll speed blending
        this.targetScrollSpeed = 0.0;
        this.smoothScrollSpeed = 0.0;

        this._lastT = 0;
        this._lastRenderT = 0;
        this._paused = false;

        this.init();
    }

    get vertexShader() {
        return `
attribute vec2 uv;
attribute vec2 position;

varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position, 0, 1);
}
`;
    }

    get fragmentShader() {
        const layers = Math.max(2, Math.min(8, Number(this.options.layers) || 5));
        const precision = this.options.lowPower ? 'mediump' : 'highp';
        return `
precision ${precision} float;

uniform float uTime;
uniform vec3 uResolution;
uniform vec2 uFocal;
uniform vec2 uRotation;
uniform float uStarSpeed;
uniform float uDensity;
uniform float uHueShift;
uniform float uSpeed;
uniform vec2 uMouse;
uniform float uGlowIntensity;
uniform float uSaturation;
uniform bool uMouseRepulsion;
uniform float uTwinkleIntensity;
uniform float uRotationSpeed;
uniform float uRepulsionStrength;
uniform float uMouseActiveFactor;
uniform float uAutoCenterRepulsion;
uniform bool uTransparent;

varying vec2 vUv;

#define NUM_LAYER ${layers}.0
#define STAR_COLOR_CUTOFF 0.2
#define MAT45 mat2(0.7071, -0.7071, 0.7071, 0.7071)
#define PERIOD 3.0

float Hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float tri(float x) {
  return abs(fract(x) * 2.0 - 1.0);
}

float tris(float x) {
  float t = fract(x);
  return 1.0 - smoothstep(0.0, 1.0, abs(2.0 * t - 1.0));
}

float trisn(float x) {
  float t = fract(x);
  return 2.0 * (1.0 - smoothstep(0.0, 1.0, abs(2.0 * t - 1.0))) - 1.0;
}

vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

float Star(vec2 uv, float flare) {
  float d = length(uv);
  float m = (0.05 * uGlowIntensity) / d;
  float rays = smoothstep(0.0, 1.0, 1.0 - abs(uv.x * uv.y * 1000.0));
  m += rays * flare * uGlowIntensity;
  uv *= MAT45;
  rays = smoothstep(0.0, 1.0, 1.0 - abs(uv.x * uv.y * 1000.0));
  m += rays * 0.3 * flare * uGlowIntensity;
  m *= smoothstep(1.0, 0.2, d);
  return m;
}

vec3 StarLayer(vec2 uv) {
  vec3 col = vec3(0.0);

  vec2 gv = fract(uv) - 0.5; 
  vec2 id = floor(uv);

  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 offset = vec2(float(x), float(y));
      vec2 si = id + vec2(float(x), float(y));
      float seed = Hash21(si);
      float size = fract(seed * 345.32);
      float glossLocal = tri(uStarSpeed / (PERIOD * seed + 1.0));
      float flareSize = smoothstep(0.9, 1.0, size) * glossLocal;

      float red = smoothstep(STAR_COLOR_CUTOFF, 1.0, Hash21(si + 1.0)) + STAR_COLOR_CUTOFF;
      float blu = smoothstep(STAR_COLOR_CUTOFF, 1.0, Hash21(si + 3.0)) + STAR_COLOR_CUTOFF;
      float grn = min(red, blu) * seed;
      vec3 base = vec3(red, grn, blu);
      
      float hue = atan(base.g - base.r, base.b - base.r) / (2.0 * 3.14159) + 0.5;
      hue = fract(hue + uHueShift / 360.0);
      float sat = length(base - vec3(dot(base, vec3(0.299, 0.587, 0.114)))) * uSaturation;
      float val = max(max(base.r, base.g), base.b);
      base = hsv2rgb(vec3(hue, sat, val));

      vec2 pad = vec2(tris(seed * 34.0 + uTime * uSpeed / 10.0), tris(seed * 38.0 + uTime * uSpeed / 30.0)) - 0.5;

      float star = Star(gv - offset - pad, flareSize);
      vec3 color = base;

      float twinkle = trisn(uTime * uSpeed + seed * 6.2831) * 0.5 + 1.0;
      twinkle = mix(1.0, twinkle, uTwinkleIntensity);
      star *= twinkle;
      
      col += star * size * color;
    }
  }

  return col;
}

void main() {
  vec2 focalPx = uFocal * uResolution.xy;
  vec2 uv = (vUv * uResolution.xy - focalPx) / uResolution.y;

  vec2 mouseNorm = uMouse - vec2(0.5);
  
  if (uAutoCenterRepulsion > 0.0) {
    vec2 centerUV = vec2(0.0, 0.0);
    float centerDist = length(uv - centerUV);
    vec2 repulsion = normalize(uv - centerUV) * (uAutoCenterRepulsion / (centerDist + 0.1));
    uv += repulsion * 0.05;
  } else if (uMouseRepulsion) {
    vec2 mousePosUV = (uMouse * uResolution.xy - focalPx) / uResolution.y;
    float mouseDist = length(uv - mousePosUV);
    vec2 repulsion = normalize(uv - mousePosUV) * (uRepulsionStrength / (mouseDist + 0.1));
    uv += repulsion * 0.05 * uMouseActiveFactor;
  } else {
    vec2 mouseOffset = mouseNorm * 0.1 * uMouseActiveFactor;
    uv += mouseOffset;
  }

  float autoRotAngle = uTime * uRotationSpeed;
  mat2 autoRot = mat2(cos(autoRotAngle), -sin(autoRotAngle), sin(autoRotAngle), cos(autoRotAngle));
  uv = autoRot * uv;

  uv = mat2(uRotation.x, -uRotation.y, uRotation.y, uRotation.x) * uv;

  vec3 col = vec3(0.0);

  for (float i = 0.0; i < 1.0; i += 1.0 / NUM_LAYER) {
    float depth = fract(i + uStarSpeed * uSpeed);
    float scale = mix(20.0 * uDensity, 0.5 * uDensity, depth);
    float fade = depth * smoothstep(1.0, 0.9, depth);
    col += StarLayer(uv * scale + i * 453.32) * fade;
  }

  if (uTransparent) {
    float alpha = length(col);
    alpha = smoothstep(0.0, 0.3, alpha);
    alpha = min(alpha, 1.0);
    gl_FragColor = vec4(col, alpha);
  } else {
    gl_FragColor = vec4(col, 1.0);
  }
}
`;
    }

    init() {
        const deviceDpr = window.devicePixelRatio || 1;
        this.dpr = Math.min(deviceDpr, Math.max(0.75, Number(this.options.maxDpr) || 1.5));

        this.renderer = new Renderer({
            alpha: this.options.transparent,
            premultipliedAlpha: false,
            dpr: this.dpr
        });
        this.gl = this.renderer.gl;

        if (this.options.transparent) {
            this.gl.enable(this.gl.BLEND);
            this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
            this.gl.clearColor(0, 0, 0, 0);
        } else {
            this.gl.clearColor(0, 0, 0, 1);
        }

        this.geometry = new Triangle(this.gl);
        this.program = new Program(this.gl, {
            vertex: this.vertexShader,
            fragment: this.fragmentShader,
            uniforms: {
                uTime: { value: 0 },
                uResolution: {
                    value: new Color(this.gl.canvas.width, this.gl.canvas.height, this.gl.canvas.width / this.gl.canvas.height)
                },
                uFocal: { value: new Float32Array(this.options.focal) },
                uRotation: { value: new Float32Array(this.options.rotation) },
                uStarSpeed: { value: this.options.starSpeed },
                uDensity: { value: this.options.density },
                uHueShift: { value: this.options.hueShift },
                uSpeed: { value: this.options.speed },
                uMouse: {
                    value: new Float32Array([this.smoothMousePos.x, this.smoothMousePos.y])
                },
                uGlowIntensity: { value: this.options.glowIntensity },
                uSaturation: { value: this.options.saturation },
                uMouseRepulsion: { value: this.options.mouseRepulsion },
                uTwinkleIntensity: { value: this.options.twinkleIntensity },
                uRotationSpeed: { value: this.options.rotationSpeed },
                uRepulsionStrength: { value: this.options.repulsionStrength },
                uMouseActiveFactor: { value: 0.0 },
                uAutoCenterRepulsion: { value: this.options.autoCenterRepulsion },
                uTransparent: { value: this.options.transparent }
            }
        });

        this.mesh = new Mesh(this.gl, { geometry: this.geometry, program: this.program });
        
        this.resize();
        window.addEventListener('resize', () => this.resize(), false);

        this.container.appendChild(this.gl.canvas);

        if (this.options.mouseInteraction) {
            // Use window level listeners to capture movement even through other elements
            window.addEventListener('pointermove', (e) => this.handleMouseMove(e), { passive: true });
            window.addEventListener('pointerleave', () => this.handleMouseLeave(), { passive: true });
        }

        // Revised scroll interaction: passive + rAF to avoid scroll-handler spam.
        this._scrollRaf = 0;
        window.addEventListener('scroll', () => {
            if (this._scrollRaf) return;
            this._scrollRaf = requestAnimationFrame(() => {
                this._scrollRaf = 0;
                const denom = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
                const scrollPercent = window.scrollY / denom;
                this.targetScrollSpeed = scrollPercent * 0.6;
            });
        }, { passive: true });

        document.addEventListener('visibilitychange', () => {
            this._paused = document.hidden;
        });

        requestAnimationFrame((t) => this.update(t));
    }

    resize() {
        if (!this.container) return;
        const width = this.container.offsetWidth;
        const height = this.container.offsetHeight;
        if (this.renderer && this.dpr) this.renderer.dpr = this.dpr;
        this.renderer.setSize(width, height);
        if (this.program) {
            this.program.uniforms.uResolution.value = new Color(
                this.gl.canvas.width,
                this.gl.canvas.height,
                this.gl.canvas.width / this.gl.canvas.height
            );
        }
    }

    handleMouseMove(e) {
        const rect = this.container.getBoundingClientRect();
        const safeW = Math.max(1, rect.width);
        const safeH = Math.max(1, rect.height);
        const x = (e.clientX - rect.left) / safeW;
        const y = 1.0 - (e.clientY - rect.top) / safeH;
        this.targetMousePos.x = Math.min(1, Math.max(0, x));
        this.targetMousePos.y = Math.min(1, Math.max(0, y));
        this.targetMouseActive = 1.0;
    }

    handleMouseLeave() {
        this.targetMouseActive = 0.0;
    }

    update(t) {
        requestAnimationFrame((t) => this.update(t));

        if (this._paused) return;

        const dt = this._lastT ? Math.min(0.05, (t - this._lastT) * 0.001) : (1 / 60);
        this._lastT = t;

        // Respect a lower FPS budget on mobile/low-power devices.
        const frameBudget = 1000 / Math.max(1, this.options.targetFps || 60);
        if (this._lastRenderT && (t - this._lastRenderT) < frameBudget) return;
        this._lastRenderT = t;

        this.program.uniforms.uTime.value = t * 0.001;
        this.program.uniforms.uStarSpeed.value = (t * 0.001 * this.options.starSpeed) / 10.0;

        // Frame-rate independent smoothing (less perceived delay).
        const mouseK = Number(this.options.mouseLerp) || 0.5;
        const activeK = Number(this.options.activeLerp) || 0.4;
        const scrollK = Number(this.options.scrollLerp) || 0.04;
        const mouseAlpha = 1 - Math.pow(1 - mouseK, dt * 60);
        const activeAlpha = 1 - Math.pow(1 - activeK, dt * 60);
        const scrollAlpha = 1 - Math.pow(1 - scrollK, dt * 60);

        this.smoothMousePos.x += (this.targetMousePos.x - this.smoothMousePos.x) * mouseAlpha;
        this.smoothMousePos.y += (this.targetMousePos.y - this.smoothMousePos.y) * mouseAlpha;
        this.smoothMouseActive += (this.targetMouseActive - this.smoothMouseActive) * activeAlpha;

        // Smoothly interpolate scroll speed multiplier
        this.smoothScrollSpeed += (this.targetScrollSpeed - this.smoothScrollSpeed) * scrollAlpha;
        this.program.uniforms.uSpeed.value = this.options.speed + this.smoothScrollSpeed;

        this.program.uniforms.uMouse.value[0] = this.smoothMousePos.x;
        this.program.uniforms.uMouse.value[1] = this.smoothMousePos.y;
        this.program.uniforms.uMouseActiveFactor.value = this.smoothMouseActive;

        this.renderer.render({ scene: this.mesh });
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    new GalaxyBG('hero-3d-container');
});
