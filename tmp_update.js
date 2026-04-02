const fs = require('fs');

const indexHtmlPath = 'index.html';
const stylesCssPath = 'css/styles.css';

let html = fs.readFileSync(indexHtmlPath, 'utf8');
const searchHTML = `<div class="cb-process-grid">
          <div class="cb-process-step glass-panel reveal">
            <span class="cb-step-num">01</span>
            <h4>Research & Discover</h4>
            <p>Deep dive into user needs, business goals, and competitive landscape.</p>
          </div>
          <div class="cb-process-step glass-panel reveal">
            <span class="cb-step-num">02</span>
            <h4>Eliminate Noise</h4>
            <p>Strip away complexity. Focus on what truly matters to the user.</p>
          </div>
          <div class="cb-process-step glass-panel reveal">
            <span class="cb-step-num">03</span>
            <h4>Design & Prototype</h4>
            <p>Rapid wireframing, visual design, and interactive prototyping.</p>
          </div>
          <div class="cb-process-step glass-panel reveal">
            <span class="cb-step-num">04</span>
            <h4>Test & Validate</h4>
            <p>User testing, stakeholder review, and data-driven iteration.</p>
          </div>
          <div class="cb-process-step glass-panel reveal">
            <span class="cb-step-num">05</span>
            <h4>Ship & Optimize</h4>
            <p>Pixel-perfect handoff, launch support, and conversion tracking.</p>
          </div>
        </div>`.replace(/\r\n/g, '\n');

const replaceHTML = `<div class="cb-process-grid bento-grid">
          <div class="cb-process-step glass-panel reveal bento-item bento-feature">
            <span class="cb-step-num">01</span>
            <h4>Research & Discover</h4>
            <p>Deep dive into user needs, business goals, and competitive landscape.</p>
            <div class="bento-graphic">
              <div class="bento-shape bento-cube"></div>
            </div>
          </div>
          <div class="cb-process-step glass-panel reveal bento-item bento-tall">
            <span class="cb-step-num">02</span>
            <h4>Eliminate Noise</h4>
            <p>Strip away complexity. Focus on what truly matters to the user.</p>
          </div>
          <div class="cb-process-step glass-panel reveal bento-item bento-wide">
            <span class="cb-step-num">03</span>
            <h4>Design & Prototype</h4>
            <p>Rapid wireframing, visual design, and interactive prototyping.</p>
             <div class="bento-graphic bento-graphic-row">
               <div class="bento-shape bento-sphere"></div>
               <div class="bento-shape bento-sphere"></div>
               <div class="bento-shape bento-sphere bento-active"></div>
            </div>
          </div>
          <div class="cb-process-step glass-panel reveal bento-item">
            <span class="cb-step-num">04</span>
            <h4>Test & Validate</h4>
            <p>User testing, stakeholder review, and data-driven iteration.</p>
          </div>
          <div class="cb-process-step glass-panel reveal bento-item">
            <span class="cb-step-num">05</span>
            <h4>Ship & Optimize</h4>
            <p>Pixel-perfect handoff, launch support, and conversion tracking.</p>
          </div>
        </div>`;

html = html.replace(/\r\n/g, '\n');
if (html.includes(searchHTML)) {
  html = html.replace(searchHTML, replaceHTML);
  fs.writeFileSync(indexHtmlPath, html);
  console.log('index.html updated successfully.');
} else {
  console.log('Could not find HTML chunk to replace.');
}

const appendCSS = `
/* ==========================================================================
   UI UX PRO MAX: BENTO GRID & GLASSMORPHISM REFINEMENTS
   ========================================================================== */

/* Glass panel premium overrides */
.glass-panel {
  box-shadow: inset 0 0 0 calc(1px + 0px) var(--glass-border),
              inset 0 1px 1px rgba(255, 255, 255, 0.15),
              0 10px 30px rgba(0, 0, 0, 0.2) !important;
  transition: transform 0.4s cubic-bezier(0.2, 0.72, 0.2, 1), 
              box-shadow 0.4s cubic-bezier(0.2, 0.72, 0.2, 1),
              background-color 0.4s ease !important;
}

.glass-panel:hover {
  transform: translateY(-4px) !important;
  box-shadow: inset 0 0 0 calc(1px + 0px) var(--glass-border),
              inset 0 1px 1.5px rgba(255, 255, 255, 0.25),
              0 15px 40px rgba(0, 0, 0, 0.3) !important;
}

/* Button Premium lift */
.btn-glass {
  transition: all 0.4s cubic-bezier(0.2, 0.72, 0.2, 1) !important;
}
.btn-glass:hover {
  transform: translateY(-3px) scale(1.02) !important;
  box-shadow: inset 0 0 1vw hsla(0, 0%, 100%, 0.15), 0 8px 25px rgba(0, 0, 0, 0.25) !important;
}

/* Bento Grid System */
.bento-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr) !important;
  grid-template-rows: auto auto !important;
  gap: 1.5rem !important;
  max-width: 1120px;
  margin: 0 auto;
}

.bento-item {
  display: flex !important;
  flex-direction: column !important;
  justify-content: space-between !important;
  padding: 2.2rem 1.8rem !important;
  border-radius: 28px !important; /* Softer radius for modern bento */
}

.bento-feature {
  grid-column: span 2 !important;
  grid-row: span 2 !important;
  background: linear-gradient(180deg, rgba(228, 111, 45, 0.05) 0%, transparent 100%) !important;
}

.bento-tall {
  grid-column: span 1 !important;
  grid-row: span 2 !important;
}

.bento-wide {
  grid-column: span 2 !important;
  grid-row: span 1 !important;
}

/* Responsive bento */
@media (max-width: 1024px) {
  .bento-grid {
    grid-template-columns: repeat(2, 1fr) !important;
    grid-auto-rows: minMax(200px, auto);
  }
  .bento-feature {
    grid-column: span 2;
    grid-row: span 1;
  }
  .bento-tall {
    grid-column: span 1;
    grid-row: span 1;
  }
}

@media (max-width: 680px) {
  .bento-grid {
    grid-template-columns: 1fr !important;
  }
  .bento-item, .bento-feature, .bento-tall, .bento-wide {
    grid-column: span 1 !important;
    grid-row: span 1 !important;
  }
}

/* Graphic elements inside Bento Box */
.bento-graphic {
  margin-top: 2rem;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.bento-graphic-row {
  justify-content: flex-start;
  gap: 1.5rem;
}

.bento-shape {
  background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.0));
  border: 1px solid rgba(255,255,255,0.2);
  box-shadow: inset 0 2px 5px rgba(255,255,255,0.2);
}

.bento-cube {
  width: 80px;
  height: 80px;
  border-radius: 16px;
  transform: rotate(15deg) translateY(10px);
  background: linear-gradient(135deg, var(--orange-accent) 0%, #ca5f23 100%);
  transition: all 0.5s cubic-bezier(0.2, 0.72, 0.2, 1);
}

.bento-pill {
  width: 40px;
  height: 100px;
  border-radius: 999px;
  transform: rotate(-15deg);
  background: var(--moss-700);
  transition: all 0.5s cubic-bezier(0.2, 0.72, 0.2, 1);
}

.bento-sphere {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  transition: transform 0.3s ease;
  background: var(--surface);
  border: 2px solid var(--moss-700);
}

.bento-active {
  background: var(--orange-accent);
  box-shadow: 0 0 15px var(--orange-glow);
  transform: scale(1.2);
  border-color: var(--orange-accent);
}

.bento-item:hover .bento-cube {
  transform: rotate(5deg) translateY(0);
}

.bento-item:hover .bento-pill {
  transform: rotate(-5deg) translateY(-5px);
}

/* Typography fix for bento */
.cb-step-num {
  font-size: 2.2rem !important;
}
.bento-item h4 {
  font-size: 1.3rem !important;
  margin-top: 0.5rem;
  letter-spacing: -0.02em;
}
.bento-item p {
  font-size: 1rem !important;
  line-height: 1.6;
  opacity: 0.8;
}
`;

let css = fs.readFileSync(stylesCssPath, 'utf8');
if (!css.includes('BENTO GRID')) {
  fs.appendFileSync(stylesCssPath, '\n' + appendCSS);
  console.log('styles.css updated successfully.');
} else {
  console.log('CSS already added.');
}
