(() => {
  'use strict';
  const root = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');
  const menuToggle = document.getElementById('menuToggle');
  const mobileNav = document.getElementById('mobileNav');
  const progressBar = document.getElementById('progressBar');
  const toast = document.getElementById('toast');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Keep this portfolio usable without local storage (e.g. private browsing).
  let savedTheme = null;
  try { savedTheme = window.localStorage.getItem('deka-portfolio-theme'); } catch (_) {}
  if (savedTheme === 'dark' || savedTheme === 'light') root.dataset.theme = savedTheme;
  updateThemeLabel();

  function updateThemeLabel() {
    if (!themeToggle) return;
    const dark = root.dataset.theme === 'dark';
    themeToggle.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
    themeToggle.setAttribute('title', dark ? 'Switch to light mode' : 'Switch to dark mode');
  }

  themeToggle?.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    try { window.localStorage.setItem('deka-portfolio-theme', root.dataset.theme); } catch (_) {}
    updateThemeLabel();
  });

  function closeMobileMenu() {
    if (!menuToggle || !mobileNav) return;
    mobileNav.hidden = true;
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open menu');
  }
  menuToggle?.addEventListener('click', () => {
    const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Open menu' : 'Close menu');
    mobileNav.hidden = isOpen;
  });
  mobileNav?.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMobileMenu));
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMobileMenu(); });
  document.addEventListener('click', event => {
    if (mobileNav && menuToggle && !mobileNav.hidden && !mobileNav.contains(event.target) && !menuToggle.contains(event.target)) closeMobileMenu();
  });

  // Scroll reveal: gracefully show content when it enters the viewport.
  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reducedMotion) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -35px 0px' });
    revealItems.forEach(item => revealObserver.observe(item));
  } else {
    revealItems.forEach(item => item.classList.add('in-view'));
  }

  // Active navigation item follows the visible section.
  const navLinks = [...document.querySelectorAll('.desktop-nav .nav-link')];
  const sections = navLinks.map(link => document.querySelector(link.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window && sections.length) {
    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navLinks.forEach(link => {
            const active = link.getAttribute('href') === `#${entry.target.id}`;
            link.classList.toggle('active', active);
            if (active) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
          });
        }
      });
    }, { threshold: 0, rootMargin: '-30% 0px -58% 0px' });
    sections.forEach(section => sectionObserver.observe(section));
  }

  // Small top reading progress indicator, scheduled with requestAnimationFrame.
  let scrollQueued = false;
  function updateProgress() {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? Math.min(100, Math.max(0, window.scrollY / scrollable * 100)) : 0;
    if (progressBar) progressBar.style.width = `${progress}%`;
    scrollQueued = false;
  }
  window.addEventListener('scroll', () => {
    if (!scrollQueued) { scrollQueued = true; window.requestAnimationFrame(updateProgress); }
  }, { passive: true });
  updateProgress();

  // Cursor-following ambient glow for pointer devices only.
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (finePointer && !reducedMotion) {
    let pointerQueued = false;
    let pointerX = window.innerWidth / 2;
    let pointerY = window.innerHeight / 3;
    document.addEventListener('pointermove', event => {
      pointerX = event.clientX;
      pointerY = event.clientY;
      if (pointerQueued) return;
      pointerQueued = true;
      window.requestAnimationFrame(() => {
        root.style.setProperty('--pointer-x', `${pointerX}px`);
        root.style.setProperty('--pointer-y', `${pointerY}px`);
        pointerQueued = false;
      });
    }, { passive: true });
  }

  // Award category filters. This changes only visibility; the source content stays in HTML.
  const filterButtons = [...document.querySelectorAll('.filter-button')];
  const achievementCards = [...document.querySelectorAll('.achievement-card')];
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter || 'all';
      filterButtons.forEach(item => {
        const active = item === button;
        item.classList.toggle('active', active);
        item.setAttribute('aria-pressed', String(active));
      });
      achievementCards.forEach(card => {
        const show = filter === 'all' || card.dataset.category === filter;
        card.classList.toggle('is-hidden', !show);
        if (show) card.removeAttribute('aria-hidden'); else card.setAttribute('aria-hidden', 'true');
      });
    });
  });

  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

  // The external links open in a new tab; this toast is reserved for graceful future notices.
  window.addEventListener('resize', () => {
    if (window.innerWidth > 820) closeMobileMenu();
  }, { passive: true });
})();
