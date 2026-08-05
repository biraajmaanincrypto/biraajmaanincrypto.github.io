/* ===== CURSOR PARTICLE TRAIL ===== */
(function(){
  'use strict';
  if('ontouchstart' in window || navigator.maxTouchPoints > 0) return;
  if(window.innerWidth < 768) return;

  const canvas = document.createElement('canvas');
  canvas.id = 'particle-canvas';
  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:99999;';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize);

  let mx = -100, my = -100, pmx = -100, pmy = -100;
  let moving = false, moveTimer = null, onInteractive = false;
  const particles = [];
  const colors = ['#6366f1','#818cf8','#a78bfa','#c084fc','#f59e0b','#38bdf8'];

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY; moving = true;
    clearTimeout(moveTimer);
    moveTimer = setTimeout(() => { moving = false; }, 80);
  }, {passive:true});

  const hoverEls = 'a, button, .btn, input, textarea, select, [role="button"]';
  document.addEventListener('mouseover', e => { if(e.target.closest(hoverEls)) onInteractive = true; });
  document.addEventListener('mouseout', e => { if(e.target.closest(hoverEls)) onInteractive = false; });

  class Particle {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.size = Math.random() * 4 + 1.5;
      this.speedX = (Math.random() - 0.5) * 2;
      this.speedY = (Math.random() - 0.5) * 2;
      this.color = colors[Math.floor(Math.random() * colors.length)];
      this.life = 1;
      this.decay = Math.random() * 0.02 + 0.015;
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      this.life -= this.decay;
      this.size *= 0.98;
    }
    draw() {
      ctx.save();
      ctx.globalAlpha = this.life;
      ctx.fillStyle = this.color;
      ctx.shadowBlur = 8;
      ctx.shadowColor = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  let frame = 0;
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Only spawn when moving AND not on interactive elements
    if(frame % 2 === 0 && moving && !onInteractive && mx > 0) {
      for(let i = 0; i < 2; i++) particles.push(new Particle(mx, my));
    }

    // Cap particles
    while(particles.length > 80) particles.shift();

    for(let i = particles.length - 1; i >= 0; i--) {
      particles[i].update();
      particles[i].draw();
      if(particles[i].life <= 0 || particles[i].size < 0.3) particles.splice(i, 1);
    }

    frame++;
    requestAnimationFrame(animate);
  }
  animate();
})();
