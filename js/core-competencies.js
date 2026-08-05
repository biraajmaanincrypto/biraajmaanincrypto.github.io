/* ========== CORE COMPETENCIES PAGE JS ========== */
(function () {
  'use strict';

  // --- Dark/Light Mode ---
  const themeToggle = document.getElementById('theme-toggle');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    if (themeToggle) themeToggle.innerHTML = theme === 'dark' ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
  }
  const savedTheme = localStorage.getItem('theme') || (prefersDark.matches ? 'dark' : 'dark');
  setTheme(savedTheme);
  if (themeToggle) themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    setTheme(current === 'dark' ? 'light' : 'dark');
  });

  // --- Navbar Scroll ---
  const navbar = document.querySelector('.navbar');
  function handleScroll() {
    if (!navbar) return;
    navbar.classList.toggle('scrolled', window.scrollY > 50);
    const btn = document.querySelector('.back-to-top');
    if (btn) btn.classList.toggle('visible', window.scrollY > 500);
  }
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // --- Mobile Menu ---
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  const navClose = document.getElementById('nav-close');
  const navOverlay = document.getElementById('nav-overlay');
  function openMenu() {
    menuToggle.classList.add('active');
    navLinks.classList.add('open');
    if (navOverlay) navOverlay.classList.add('open');
    if (navClose) navClose.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }
  function closeMenu() {
    menuToggle.classList.remove('active');
    navLinks.classList.remove('open');
    if (navOverlay) navOverlay.classList.remove('open');
    if (navClose) navClose.style.display = 'none';
    document.body.style.overflow = '';
  }
  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      navLinks.classList.contains('open') ? closeMenu() : openMenu();
    });
    if (navClose) navClose.addEventListener('click', closeMenu);
    if (navOverlay) navOverlay.addEventListener('click', closeMenu);
    navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
  }

  // --- Scroll Reveal ---
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    revealEls.forEach(el => observer.observe(el));
  } else { revealEls.forEach(el => el.classList.add('visible')); }

  // --- Smooth Scroll ---
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
    });
  });

  // --- Back to Top ---
  const backToTop = document.querySelector('.back-to-top');
  if (backToTop) backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  // --- Stat Counter Animation ---
  const statEls = document.querySelectorAll('.cc-stat-number[data-count]');
  if (statEls.length && 'IntersectionObserver' in window) {
    const countObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target, target = parseInt(el.dataset.count);
          let current = 0;
          const step = Math.ceil(target / 40);
          const timer = setInterval(() => {
            current += step;
            if (current >= target) { current = target; clearInterval(timer); }
            el.textContent = (el.dataset.prefix || '') + current + (el.dataset.suffix || '');
          }, 30);
          countObserver.unobserve(el);
        }
      });
    }, { threshold: 0.5 });
    statEls.forEach(el => countObserver.observe(el));
  }

  // --- Proficiency Bar Animation ---
  const proficiencyBars = document.querySelectorAll('.cc-proficiency-fill[data-width]');
  if (proficiencyBars.length && 'IntersectionObserver' in window) {
    const barObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          el.style.width = el.dataset.width + '%';
          barObserver.unobserve(el);
        }
      });
    }, { threshold: 0.3 });
    proficiencyBars.forEach(el => barObserver.observe(el));
  }

  // --- Category Filter Tabs ---
  const tabs = document.querySelectorAll('.cc-tab');
  const cards = document.querySelectorAll('.cc-skill-card[data-category]');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Update active tab
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const filter = tab.dataset.filter;

      cards.forEach(card => {
        if (filter === 'all' || card.dataset.category === filter) {
          card.classList.remove('hidden');
          // Re-trigger reveal animation
          card.classList.remove('visible');
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              card.classList.add('visible');
            });
          });
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });

})();
