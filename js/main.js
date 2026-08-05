/* ========== PORTFOLIO MAIN JS ========== */
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
    // Back to top
    const btn = document.querySelector('.back-to-top');
    if (btn) btn.classList.toggle('visible', window.scrollY > 500);
    // Hide scroll indicator
    const scrollInd = document.querySelector('.scroll-indicator');
    if (scrollInd) scrollInd.style.opacity = window.scrollY > 100 ? '0' : '1';
    // Active nav
    const sections = document.querySelectorAll('section[id]');
    const scrollPos = window.scrollY + 120;
    sections.forEach(sec => {
      const top = sec.offsetTop, h = sec.offsetHeight, id = sec.getAttribute('id');
      const link = document.querySelector(`.nav-links a[href="#${id}"]`);
      if (link) {
        if (scrollPos >= top && scrollPos < top + h) link.classList.add('active');
        else link.classList.remove('active');
      }
    });
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

  // --- Typing Animation ---
  const typingEl = document.getElementById('typing-text');
  if (typingEl) {
    const fullText = 'Full Stack Developer | SaaS Builder | System Designer | Problem Solver';
    let charIdx = 0, deleting = false;
    function type() {
      if (deleting) {
        typingEl.textContent = fullText.substring(0, charIdx--);
        if (charIdx < 0) { deleting = false; setTimeout(type, 600); return; }
        setTimeout(type, 15);
      } else {
        typingEl.textContent = fullText.substring(0, ++charIdx);
        if (charIdx === fullText.length) { deleting = true; setTimeout(type, 3000); return; }
        setTimeout(type, 50);
      }
    }
    setTimeout(type, 800);
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
  const statEls = document.querySelectorAll('.stat-number[data-count]');
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
            el.textContent = current + (el.dataset.suffix || '');
          }, 30);
          countObserver.unobserve(el);
        }
      });
    }, { threshold: 0.5 });
    statEls.forEach(el => countObserver.observe(el));
  }
})();
