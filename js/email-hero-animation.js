/* ===== EMAIL HERO ANIMATION — JS CONTROLLER ===== */
(function () {
  'use strict';

  const stage = document.getElementById('eha-stage');
  if (!stage) return;

  // --- DOM refs ---
  const steps = stage.querySelectorAll('.eha-step');
  const compose = stage.querySelector('.eha-compose');
  const sendBtn = stage.querySelector('.eha-send-btn');
  const fromVal = stage.querySelector('#eha-from-val');
  const toVal = stage.querySelector('#eha-to-val');
  const subjVal = stage.querySelector('#eha-subj-val');
  const infraNodes = stage.querySelectorAll('.eha-infra-node');
  const infraLines = stage.querySelectorAll('.eha-infra-line');
  const inboxNewRow = stage.querySelector('.eha-inbox-row.new-email');
  const inboxStatus = stage.querySelector('.eha-inbox-status');
  const cursor = stage.querySelector('.eha-cursor');
  const emailParagraphs = stage.querySelectorAll('.eha-email-open-body p');
  const successMetrics = stage.querySelectorAll('.eha-success-metric');

  let currentStep = -1;
  let animTimeout = null;
  let isRunning = false;
  let loopTimeout = null;

  // --- Utility ---
  function delay(ms) {
    return new Promise(resolve => { animTimeout = setTimeout(resolve, ms); });
  }

  function activateStep(idx) {
    steps.forEach((s, i) => {
      s.classList.toggle('active', i === idx);
    });
    currentStep = idx;
  }

  // --- Typing effect ---
  async function typeText(el, text, speed) {
    el.innerHTML = '';
    const cursorEl = document.createElement('span');
    cursorEl.className = 'eha-typing-cursor';
    el.appendChild(cursorEl);
    for (let i = 0; i < text.length; i++) {
      const charNode = document.createTextNode(text[i]);
      el.insertBefore(charNode, cursorEl);
      await delay(speed);
    }
    // Remove cursor after typing
    await delay(300);
    if (cursorEl.parentNode) cursorEl.remove();
  }

  // --- Cursor movement ---
  function moveCursor(x, y, duration) {
    return new Promise(resolve => {
      cursor.style.transition = `left ${duration}ms cubic-bezier(.4,0,.2,1), top ${duration}ms cubic-bezier(.4,0,.2,1)`;
      cursor.style.left = x + 'px';
      cursor.style.top = y + 'px';
      animTimeout = setTimeout(resolve, duration + 50);
    });
  }

  // --- STEP 1: Email Compose ---
  async function runStep1() {
    // Reset compose fields
    fromVal.textContent = '';
    toVal.textContent = '';
    subjVal.textContent = '';
    sendBtn.classList.remove('sending');

    activateStep(0);
    await delay(400);

    // Type in fields
    await typeText(fromVal, 'hello@business.com', 35);
    await typeText(toVal, 'prospect@company.com', 30);
    await typeText(subjVal, 'Helping Your Business Scale Outreach', 25);
    await delay(300);
  }

  // --- STEP 2: Infrastructure Flow ---
  async function runStep2() {
    // Send button animation
    sendBtn.classList.add('sending');
    await delay(600);

    activateStep(1);
    await delay(200);

    // Sequential node activation
    for (let i = 0; i < infraNodes.length; i++) {
      // Show line above (if exists)
      if (i > 0 && infraLines[i - 1]) {
        infraLines[i - 1].classList.add('visible');
        // Add glow traveler
        const glow = document.createElement('div');
        glow.className = 'eha-infra-line-glow';
        infraLines[i - 1].appendChild(glow);
        await delay(150);
      }

      // Show and activate node
      infraNodes[i].classList.add('visible');
      await delay(80);
      infraNodes[i].classList.add('active-node');
      await delay(250);

      // Mark previous as passed
      if (i > 0) {
        infraNodes[i - 1].classList.remove('active-node');
        infraNodes[i - 1].classList.add('passed');
      }
    }

    // Mark last node as passed
    infraNodes[infraNodes.length - 1].classList.remove('active-node');
    infraNodes[infraNodes.length - 1].classList.add('passed');
    await delay(300);
  }

  // --- STEP 3: Inbox ---
  async function runStep3() {
    // Reset inbox state
    if (inboxNewRow) {
      inboxNewRow.classList.remove('slide-in');
      inboxNewRow.classList.add('new-email');
    }
    if (inboxStatus) inboxStatus.classList.remove('show');

    activateStep(2);
    await delay(500);

    // Slide in new email
    if (inboxNewRow) {
      inboxNewRow.classList.add('slide-in');
      await delay(400);
    }

    // Show delivered status
    if (inboxStatus) {
      inboxStatus.classList.add('show');
    }
    await delay(600);
  }

  // --- STEP 4: Cursor Click ---
  async function runStep4() {
    // Show cursor at bottom-right of inbox
    cursor.style.left = '85%';
    cursor.style.top = '85%';
    cursor.style.transition = 'none';
    cursor.classList.add('visible');
    await delay(200);

    // Move cursor to the new email row
    const rowRect = inboxNewRow.getBoundingClientRect();
    const stageRect = stage.getBoundingClientRect();
    const targetX = (rowRect.left - stageRect.left) + rowRect.width * 0.6;
    const targetY = (rowRect.top - stageRect.top) + rowRect.height * 0.5;

    await moveCursor(targetX, targetY, 800);

    // Highlight row on hover
    inboxNewRow.classList.add('highlighted');
    await delay(400);

    // Click effect — scale cursor briefly
    cursor.style.transform = 'scale(0.85)';
    await delay(150);
    cursor.style.transform = 'scale(1)';
    await delay(300);

    cursor.classList.remove('visible');
    inboxNewRow.classList.remove('highlighted');
  }

  // --- STEP 5: Email Open ---
  async function runStep5() {
    // Reset paragraph reveals
    emailParagraphs.forEach(p => p.classList.remove('reveal-line'));

    activateStep(4);
    await delay(400);

    // Stagger reveal paragraphs
    for (let i = 0; i < emailParagraphs.length; i++) {
      emailParagraphs[i].classList.add('reveal-line');
      await delay(180);
    }
    await delay(500);
  }

  // --- STEP 6: Success ---
  async function runStep6() {
    // Reset metrics
    successMetrics.forEach(m => { m.style.transitionDelay = '0s'; });

    activateStep(5);
    await delay(100);

    // Stagger metrics
    successMetrics.forEach((m, i) => {
      m.style.transitionDelay = (0.4 + i * 0.2) + 's';
    });
    await delay(2000);
  }

  // --- Reset all states ---
  function resetAll() {
    steps.forEach(s => s.classList.remove('active'));
    sendBtn.classList.remove('sending');
    infraNodes.forEach(n => {
      n.classList.remove('visible', 'active-node', 'passed');
    });
    infraLines.forEach(l => {
      l.classList.remove('visible');
      l.innerHTML = '';
    });
    if (inboxNewRow) {
      inboxNewRow.classList.remove('slide-in', 'highlighted');
      inboxNewRow.classList.add('new-email');
    }
    if (inboxStatus) inboxStatus.classList.remove('show');
    cursor.classList.remove('visible');
    cursor.style.transform = '';
    emailParagraphs.forEach(p => p.classList.remove('reveal-line'));
    successMetrics.forEach(m => { m.style.transitionDelay = '0s'; });
    currentStep = -1;
  }

  // --- Main Loop ---
  async function runAnimation() {
    if (!isRunning) return;
    resetAll();
    await delay(100);

    try {
      await runStep1();
      if (!isRunning) return;
      await runStep2();
      if (!isRunning) return;
      await runStep3();
      if (!isRunning) return;
      await runStep4();
      if (!isRunning) return;
      await runStep5();
      if (!isRunning) return;
      await runStep6();
      if (!isRunning) return;

      // Brief hold on success, then restart immediately
      await delay(500);
      if (!isRunning) return;

      // Quick fade out and restart
      steps.forEach(s => s.classList.remove('active'));
      await delay(250);

      if (isRunning) {
        loopTimeout = setTimeout(() => runAnimation(), 100);
      }
    } catch (e) {
      // Animation interrupted, that's OK
    }
  }

  // --- Intersection Observer: play only when visible ---
  function startAnimation() {
    if (isRunning) return;
    isRunning = true;
    runAnimation();
  }

  function stopAnimation() {
    isRunning = false;
    clearTimeout(animTimeout);
    clearTimeout(loopTimeout);
  }

  const heroSection = document.getElementById('ei-hero');
  if (heroSection && 'IntersectionObserver' in window) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          startAnimation();
        } else {
          stopAnimation();
        }
      });
    }, { threshold: 0.15 });
    obs.observe(heroSection);
  } else {
    // Fallback: just start
    startAnimation();
  }

})();
