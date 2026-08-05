/**
 * blog.js — Blog interaction logic
 * Handles: visit counter, like/dislike, share, bookmark, reading progress, TOC, tag filter
 */

;(function () {
  'use strict';

  /* ───────────────────────────────────────────────
     UTILITY: animate a number from start to end
  ─────────────────────────────────────────────── */
  function animateNumber(el, from, to, duration) {
    if (!el) return;
    const start = performance.now();
    const range = to - from;
    function step(now) {
      const elapsed = Math.min(now - start, duration);
      const progress = elapsed / duration;
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const current = Math.round(from + range * eased);
      el.textContent = current.toLocaleString();
      if (elapsed < duration) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ───────────────────────────────────────────────
     READING PROGRESS BAR
  ─────────────────────────────────────────────── */
  function initReadingProgress() {
    const bar = document.getElementById('reading-progress');
    if (!bar) return;
    window.addEventListener('scroll', function () {
      const docEl = document.documentElement;
      const scrollTop = docEl.scrollTop || document.body.scrollTop;
      const scrollHeight = docEl.scrollHeight - docEl.clientHeight;
      const pct = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
      bar.style.width = pct.toFixed(2) + '%';
    }, { passive: true });
  }

  /* ───────────────────────────────────────────────
     VISIT COUNTER
     - Base seed per article (realistic count)
     - Increments on first visit per browser (localStorage)
     - Animates count-up on load
  ─────────────────────────────────────────────── */
  function initVisitCounter() {
    const el = document.getElementById('visit-count');
    if (!el) return;

    const articleId = el.dataset.article || 'default';
    const base = parseInt(el.dataset.base || '1200', 10);
    const storageKey = 'blog_views_' + articleId;

    let views = parseInt(localStorage.getItem(storageKey) || base, 10);

    // First visit: increment
    const visitedKey = 'visited_' + articleId;
    if (!sessionStorage.getItem(visitedKey)) {
      sessionStorage.setItem(visitedKey, '1');
      views = views + 1;
      localStorage.setItem(storageKey, views);
    }

    // Animate from base to current
    animateNumber(el, Math.max(base, views - 50), views, 1200);
  }

  /* ───────────────────────────────────────────────
     LIKE / DISLIKE
  ─────────────────────────────────────────────── */
  function initLikeDislike() {
    const articleId = document.getElementById('visit-count')?.dataset.article || 'default';
    const likeBtn = document.getElementById('like-btn');
    const dislikeBtn = document.getElementById('dislike-btn');
    const likeCount = document.getElementById('like-count');
    const dislikeCount = document.getElementById('dislike-count');
    if (!likeBtn || !dislikeBtn) return;

    const likeKey = 'blog_likes_' + articleId;
    const dislikeKey = 'blog_dislikes_' + articleId;
    const userLikedKey = 'user_liked_' + articleId;
    const userDislikedKey = 'user_disliked_' + articleId;

    const baseLikes = parseInt(likeBtn.dataset.base || '148', 10);
    const baseDislikes = parseInt(dislikeBtn.dataset.base || '7', 10);

    let likes = parseInt(localStorage.getItem(likeKey) || baseLikes, 10);
    let dislikes = parseInt(localStorage.getItem(dislikeKey) || baseDislikes, 10);
    let userLiked = localStorage.getItem(userLikedKey) === '1';
    let userDisliked = localStorage.getItem(userDislikedKey) === '1';

    function renderState() {
      if (likeCount) likeCount.textContent = likes.toLocaleString();
      if (dislikeCount) dislikeCount.textContent = dislikes.toLocaleString();
      likeBtn.classList.toggle('liked', userLiked);
      dislikeBtn.classList.toggle('disliked', userDisliked);
    }

    likeBtn.addEventListener('click', function () {
      if (userLiked) {
        // toggle off
        userLiked = false;
        likes = Math.max(baseLikes, likes - 1);
        localStorage.removeItem(userLikedKey);
      } else {
        userLiked = true;
        likes += 1;
        localStorage.setItem(userLikedKey, '1');
        // remove dislike if set
        if (userDisliked) {
          userDisliked = false;
          dislikes = Math.max(baseDislikes, dislikes - 1);
          localStorage.removeItem(userDislikedKey);
          localStorage.setItem(dislikeKey, dislikes);
        }
      }
      localStorage.setItem(likeKey, likes);
      renderState();
    });

    dislikeBtn.addEventListener('click', function () {
      if (userDisliked) {
        userDisliked = false;
        dislikes = Math.max(baseDislikes, dislikes - 1);
        localStorage.removeItem(userDislikedKey);
      } else {
        userDisliked = true;
        dislikes += 1;
        localStorage.setItem(userDislikedKey, '1');
        if (userLiked) {
          userLiked = false;
          likes = Math.max(baseLikes, likes - 1);
          localStorage.removeItem(userLikedKey);
          localStorage.setItem(likeKey, likes);
        }
      }
      localStorage.setItem(dislikeKey, dislikes);
      renderState();
    });

    renderState();
  }

  /* ───────────────────────────────────────────────
     SHARE BUTTON
  ─────────────────────────────────────────────── */
  function initShare() {
    const shareBtn = document.getElementById('share-btn');
    if (!shareBtn) return;

    shareBtn.addEventListener('click', async function () {
      const title = document.title;
      const url = window.location.href;
      const text = document.querySelector('meta[name="description"]')?.content || '';

      if (navigator.share) {
        try {
          await navigator.share({ title, text, url });
          showToast('✓ Article shared!');
        } catch (e) {
          if (e.name !== 'AbortError') copyToClipboard(url);
        }
      } else {
        copyToClipboard(url);
      }
    });
  }

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text)
      .then(() => showToast('🔗 Link copied to clipboard!'))
      .catch(() => showToast('Copy this URL: ' + text));
  }

  /* ───────────────────────────────────────────────
     BOOKMARK BUTTON
  ─────────────────────────────────────────────── */
  function initBookmark() {
    const btn = document.getElementById('bookmark-btn');
    if (!btn) return;
    const articleId = document.getElementById('visit-count')?.dataset.article || 'default';
    const key = 'bookmarked_' + articleId;
    let saved = localStorage.getItem(key) === '1';

    function render() {
      btn.classList.toggle('bookmarked', saved);
      const icon = btn.querySelector('i');
      const label = btn.querySelector('.btn-label');
      if (icon) icon.className = saved ? 'fa-solid fa-bookmark' : 'fa-regular fa-bookmark';
      if (label) label.textContent = saved ? 'Bookmarked' : 'Bookmark';
    }

    btn.addEventListener('click', function () {
      saved = !saved;
      if (saved) {
        localStorage.setItem(key, '1');
        showToast('🔖 Article bookmarked!');
      } else {
        localStorage.removeItem(key);
        showToast('Bookmark removed');
      }
      render();
    });

    render();
  }

  /* ───────────────────────────────────────────────
     TOAST NOTIFICATION
  ─────────────────────────────────────────────── */
  function showToast(message) {
    let toast = document.getElementById('blog-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'blog-toast';
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.innerHTML = '<i class="fa-solid fa-check-circle"></i> ' + message;
    toast.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove('show'), 3000);
  }

  /* ───────────────────────────────────────────────
     TABLE OF CONTENTS — IntersectionObserver
  ─────────────────────────────────────────────── */
  function initTOC() {
    const tocLinks = document.querySelectorAll('.toc-link');
    if (!tocLinks.length) return;

    const headings = Array.from(
      document.querySelectorAll('.article-content h2, .article-content h3')
    );
    if (!headings.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            tocLinks.forEach((l) => l.classList.remove('active'));
            const active = document.querySelector(`.toc-link[href="#${entry.target.id}"]`);
            if (active) active.classList.add('active');
          }
        });
      },
      { rootMargin: '-20% 0px -70% 0px', threshold: 0 }
    );

    headings.forEach((h) => { if (h.id) observer.observe(h); });
  }

  /* ───────────────────────────────────────────────
     BLOG LISTING — Tag Filter
  ─────────────────────────────────────────────── */
  function initTagFilter() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const cards = document.querySelectorAll('.blog-card[data-tags]');
    const noResults = document.getElementById('no-results');
    if (!filterBtns.length) return;

    filterBtns.forEach((btn) => {
      btn.addEventListener('click', function () {
        filterBtns.forEach((b) => b.classList.remove('active'));
        this.classList.add('active');
        const tag = this.dataset.filter;
        let visible = 0;
        cards.forEach((card) => {
          const tags = card.dataset.tags || '';
          const show = tag === 'all' || tags.includes(tag);
          card.style.display = show ? '' : 'none';
          if (show) visible++;
        });
        if (noResults) noResults.style.display = visible === 0 ? '' : 'none';
      });
    });
  }

  /* ───────────────────────────────────────────────
     REVEAL ANIMATION (reuse main.js pattern)
  ─────────────────────────────────────────────── */
  function initReveal() {
    const els = document.querySelectorAll('.reveal');
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('visible');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    els.forEach((el) => io.observe(el));
  }

  /* ───────────────────────────────────────────────
     SMOOTH SCROLL for TOC links
  ─────────────────────────────────────────────── */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener('click', function (e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  /* ───────────────────────────────────────────────
     NAVBAR SCROLL EFFECT (shared)
  ─────────────────────────────────────────────── */
  function initNavbar() {
    const nav = document.getElementById('navbar');
    if (!nav) return;
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ───────────────────────────────────────────────
     THEME TOGGLE (shared)
  ─────────────────────────────────────────────── */
  function initTheme() {
    const toggle = document.getElementById('theme-toggle');
    if (!toggle) return;
    const saved = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', saved);
    updateThemeIcon(toggle, saved);
    toggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
      updateThemeIcon(toggle, next);
    });
  }
  function updateThemeIcon(btn, theme) {
    const icon = btn.querySelector('i');
    if (!icon) return;
    icon.className = theme === 'dark' ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
  }

  /* ───────────────────────────────────────────────
     MOBILE MENU (shared)
  ─────────────────────────────────────────────── */
  function initMobileMenu() {
    const menuToggle = document.getElementById('menu-toggle');
    const navLinks = document.getElementById('nav-links');
    const navClose = document.getElementById('nav-close');
    const navOverlay = document.getElementById('nav-overlay');
    if (!menuToggle) return;

    function openMenu() {
      menuToggle.classList.add('active');
      navLinks.classList.add('open');
      navOverlay.classList.add('visible');
      document.body.style.overflow = 'hidden';
    }
    function closeMenu() {
      menuToggle.classList.remove('active');
      navLinks.classList.remove('open');
      navOverlay.classList.remove('visible');
      document.body.style.overflow = '';
    }
    menuToggle.addEventListener('click', openMenu);
    if (navClose) navClose.addEventListener('click', closeMenu);
    if (navOverlay) navOverlay.addEventListener('click', closeMenu);
    navLinks?.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeMenu));
  }

  /* ───────────────────────────────────────────────
     BACK TO TOP (shared)
  ─────────────────────────────────────────────── */
  function initBackToTop() {
    const btn = document.querySelector('.back-to-top');
    if (!btn) return;
    window.addEventListener('scroll', () => {
      btn.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  /* ───────────────────────────────────────────────
     INIT ALL
  ─────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    initNavbar();
    initTheme();
    initMobileMenu();
    initBackToTop();
    initReadingProgress();
    initVisitCounter();
    initLikeDislike();
    initShare();
    initBookmark();
    initTOC();
    initTagFilter();
    initReveal();
    initSmoothScroll();
  });

})();
