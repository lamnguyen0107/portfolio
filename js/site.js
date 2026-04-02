const searchParams = new URLSearchParams(window.location.search);
const isFigmaCapture =
  window.location.hash.includes("figmacapture=") ||
  searchParams.get("figma") === "1" ||
  /figma/i.test(navigator.userAgent);
const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
const lowPowerMode = prefersReducedMotion;

if (isFigmaCapture) {
  document.body.classList.add("figma-capture");
}

// -------------------------------------------------------------
// Lenis Smooth Scrolling Initialization
// -------------------------------------------------------------
let lenis;
if (!isFigmaCapture && !lowPowerMode && typeof Lenis !== 'undefined') {
  lenis = new Lenis({
    lerp: 0.05,
    wheelMultiplier: 0.8,
    smoothWheel: true,
    smoothTouch: false,
    touchMultiplier: 1.5,
  });

  // Integrate Lenis with GSAP ScrollTrigger
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);
  } else {
    // Fallback if GSAP is not loaded
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }

  // Handle anchor links for smooth scrolling via Lenis
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        lenis.scrollTo(target, { offset: -80 }); // offset for sticky header
      }
    });
  });
}

const yearEl = document.getElementById("year");
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

// -------------------------------------------------------------
// Premium Reveal Animations (GSAP)
// -------------------------------------------------------------
if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
  const revealItems = document.querySelectorAll(".reveal");
  const revealToggleActions = lowPowerMode ? "play none none none" : "play reverse play reverse";
  const revealDuration = lowPowerMode ? 0.75 : 1.2;
  const revealY = lowPowerMode ? 24 : 40;

  revealItems.forEach((item) => {
    if (item.id === "contact") {
      item.classList.add("is-visible");
      gsap.set(item, { opacity: 1, y: 0, clearProps: "transform" });
      return;
    }

    // Check if item is already high in the viewport (like Hero)
    const rect = item.getBoundingClientRect();
    const isAboveFold = rect.top < window.innerHeight * 0.5;

    gsap.fromTo(item,
      {
        opacity: isAboveFold ? 1 : 0,
        y: isAboveFold ? 0 : revealY
      },
      {
        opacity: 1,
        y: 0,
        duration: revealDuration,
        ease: "expo.out",
        scrollTrigger: {
          trigger: item,
          start: "top 95%",
          end: "bottom 5%", // Added explicit end point for scrolling up
          toggleActions: revealToggleActions,
        }
      }
    );
  });
} else {
  // Simple fallback if GSAP not available
  const revealItems = document.querySelectorAll(".reveal");
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
      }
    });
  }, { threshold: 0.1 });
  revealItems.forEach((item) => revealObserver.observe(item));
}

const mediaItems = Array.from(document.querySelectorAll(".project-media img, .cb-work-image-wrap img"));
let ticking = false;

function attachImageFallback(img) {
  const fallback = img.dataset.fallback;
  if (!fallback) {
    return;
  }

  img.addEventListener("error", () => {
    if (img.src !== fallback) {
      img.src = fallback;
    }
  });

  if (isFigmaCapture && img.currentSrc?.includes(".avif")) {
    img.src = fallback;
  }
}

mediaItems.forEach(attachImageFallback);

function warmupWorkImages() {
  const workImages = Array.from(document.querySelectorAll(".cb-work-image-wrap img[loading='lazy']"));
  if (!workImages.length || typeof IntersectionObserver === "undefined") {
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const img = entry.target;
      // Promote fetch earlier to avoid visible delay when card appears.
      img.loading = "eager";
      img.fetchPriority = "high";
      if (typeof img.decode === "function") {
        img.decode().catch(() => { });
      }
      obs.unobserve(img);
    });
  }, { rootMargin: "900px 0px" });

  workImages.forEach((img) => observer.observe(img));
}

warmupWorkImages();

function applyScrollMotion() {
  const scrollY = window.scrollY || window.pageYOffset || 0;
  document.documentElement.style.setProperty("--ambient-shift", `${Math.min(scrollY * 0.015, 16)}px`);
  ticking = false;
}

function onScroll() {
  if (!ticking) {
    window.requestAnimationFrame(applyScrollMotion);
    ticking = true;
  }
}

// If Lenis is active, hook the ambient shift to Lenis scroll event
if (lenis) {
  lenis.on('scroll', onScroll);
} else {
  window.addEventListener("scroll", onScroll, { passive: true });
}
let resizeRaf = 0;
window.addEventListener("resize", () => {
  if (resizeRaf) return;
  resizeRaf = requestAnimationFrame(() => {
    resizeRaf = 0;
    onScroll();
  });
});
applyScrollMotion();

const siteHeader = document.querySelector(".site-header");
const navToggle = document.querySelector(".nav-toggle");
const navDrawer = document.querySelector(".nav-drawer");

if (siteHeader && navToggle && navDrawer) {
  const closeMenu = () => {
    siteHeader.classList.remove("menu-open");
    navToggle.setAttribute("aria-expanded", "false");
  };

  navToggle.addEventListener("click", () => {
    const isOpen = siteHeader.classList.toggle("menu-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navDrawer.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 680) {
      closeMenu();
    }
  });
}

// SIMPLIFIED LOADER LOGIC
window.addEventListener("load", () => {
  const loader = document.getElementById("site-loader");
  if (loader) {
    // Small delay for premium feel
    setTimeout(() => {
      loader.classList.add("loaded");
      // Optional: mark hero as active for a reveal animation if needed
      const hero = document.getElementById("hero");
      if (hero) hero.classList.add("active");
    }, 1000);
  }

  // Stacking logic removed
});

