document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initHamburger();
  initScrollObserver();
  initNavScroll();
  initBackToTop();
  initCounters();
  initSubNav();
});

/* ── THEME TOGGLE ───────────────────────────────────────── */
function initTheme() {
  const btn   = document.getElementById("theme-toggle");
  const root  = document.documentElement;
  const DARK  = "dark";
  const LIGHT = "light";
  const ICON_DARK  = "🌙";
  const ICON_LIGHT = "☀";

  const saved = localStorage.getItem("chwink-theme") || LIGHT;
  applyTheme(saved);

  if (btn) btn.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === DARK ? LIGHT : DARK;
    applyTheme(next);
    localStorage.setItem("chwink-theme", next);
  });

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    if (btn) {
      const icon = btn.querySelector(".theme-icon");
      if (icon) icon.textContent = theme === DARK ? ICON_LIGHT : ICON_DARK;
      btn.setAttribute("aria-label", theme === DARK ? "Switch to light mode" : "Switch to dark mode");
    }
  }
}

/* ── HAMBURGER / MOBILE DRAWER ──────────────────────────── */
function initHamburger() {
  const hamburger = document.getElementById("hamburger");
  const drawer    = document.getElementById("mobile-drawer");
  const overlay   = document.getElementById("mobile-overlay");
  const closeBtn  = document.getElementById("mobile-close");

  if (!hamburger || !drawer) return;

  function openMenu() {
    hamburger.classList.add("open");
    drawer.classList.add("open");
    if (overlay) overlay.classList.add("visible");
    document.body.style.overflow = "hidden";
  }

  function closeMenu() {
    hamburger.classList.remove("open");
    drawer.classList.remove("open");
    if (overlay) overlay.classList.remove("visible");
    document.body.style.overflow = "";
  }

  hamburger.addEventListener("click", () => {
    drawer.classList.contains("open") ? closeMenu() : openMenu();
  });

  if (closeBtn) closeBtn.addEventListener("click", closeMenu);
  if (overlay)  overlay.addEventListener("click", closeMenu);

  drawer.querySelectorAll("a").forEach(a => a.addEventListener("click", closeMenu));

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });
}

/* ── INTERSECTION OBSERVER (fade-in) ──────────────────────── */
function initScrollObserver() {
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          obs.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px", threshold: 0.08 }
  );

  document.querySelectorAll(".fade-in").forEach(el => observer.observe(el));
}

/* ── NAV SCROLL SHADOW ──────────────────────────────────── */
function initNavScroll() {
  const nav = document.querySelector(".primary-nav");
  if (!nav) return;

  const onScroll = () => {
    nav.classList.toggle("scrolled", window.scrollY > 10);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

/* ── BACK TO TOP ────────────────────────────────────────── */
function initBackToTop() {
  const btn = document.querySelector(".back-to-top");
  if (!btn) return;

  window.addEventListener("scroll", () => {
    btn.classList.toggle("visible", window.scrollY > 400);
  }, { passive: true });

  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

/* ── COUNTER ANIMATION ──────────────────────────────────── */
function initCounters() {
  const counters = document.querySelectorAll("[data-count]");
  if (!counters.length) return;

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el     = entry.target;
        const target = parseInt(el.getAttribute("data-count"), 10);
        const suffix = el.getAttribute("data-suffix") || "";
        const dur    = 1600;
        const start  = performance.now();

        const tick = (now) => {
          const pct  = Math.min((now - start) / dur, 1);
          const ease = 1 - Math.pow(1 - pct, 3);
          el.textContent = Math.round(ease * target) + suffix;
          if (pct < 1) requestAnimationFrame(tick);
        };

        requestAnimationFrame(tick);
        obs.unobserve(el);
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach(el => observer.observe(el));
}

/* ── PILL TAB FILTER ────────────────────────────────────── */
function initPillTabs(tabsSelector, targetAttr) {
  const tabs = document.querySelectorAll(tabsSelector);
  if (!tabs.length) return;

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");

      const filter = tab.getAttribute("data-filter");
      document.querySelectorAll(`[${targetAttr}]`).forEach(item => {
        const cat = item.getAttribute(targetAttr);
        item.style.display = (filter === "all" || cat === filter) ? "" : "none";
      });
    });
  });
}

initPillTabs(".pill-tab[data-filter]", "data-category");

/* ── SUB-NAV ACTIVE STATE & SMOOTH SCROLLING ────────────── */
function initSubNav() {
  const links = document.querySelectorAll(".sub-nav-strip a");
  if (!links.length) return;

  const nav = document.querySelector(".primary-nav");
  const subNavStrip = document.querySelector(".sub-nav-strip");

  // Click handler
  links.forEach(link => {
    const href = link.getAttribute("href");
    if (!href.startsWith("#")) return;

    link.addEventListener("click", (e) => {
      const targetEl = document.querySelector(href);
      if (targetEl) {
        e.preventDefault();
        
        // Remove active from all siblings
        links.forEach(l => l.classList.remove("active"));
        link.classList.add("active");

        // Scroll smooth with offset for sticky headers
        const navOffset = nav ? nav.offsetHeight : 70;
        const subNavOffset = subNavStrip ? subNavStrip.offsetHeight : 50;
        const targetPosition = targetEl.getBoundingClientRect().top + window.scrollY - navOffset - subNavOffset + 2;

        window.scrollTo({
          top: targetPosition,
          behavior: "smooth"
        });

        // Update hash in URL
        history.pushState(null, null, href);
      }
    });
  });

  // Scroll spy: Update active tab based on scroll position
  const observerOptions = {
    root: null,
    rootMargin: "-25% 0px -55% 0px", // Trigger when the section occupies the central-upper viewport
    threshold: 0
  };

  const spyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute("id");
        if (!id) return;
        
        const activeLink = document.querySelector(`.sub-nav-strip a[href="#${id}"]`);
        if (activeLink) {
          links.forEach(link => {
            if (link.getAttribute("href").startsWith("#")) {
              link.classList.remove("active");
            }
          });
          activeLink.classList.add("active");
        }
      }
    });
  }, observerOptions);

  links.forEach(link => {
    const href = link.getAttribute("href");
    if (href.startsWith("#")) {
      const section = document.querySelector(href);
      if (section) spyObserver.observe(section);
    }
  });
}
