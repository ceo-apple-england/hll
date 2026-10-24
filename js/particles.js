/* ============================================================
   PARTICLE SYSTEMS — Canvas-based dust & fireflies
   Tôn trọng quality mode + reduced motion + settings.particles
   ============================================================ */
(function () {
  'use strict';

  const S = window.HNSettings;

  function qualityFactor() {
    const q = S.get('quality');
    if (q === 'low') return 0.35;
    if (q === 'medium') return 0.7;
    return 1;
  }

  function wantsParticles() {
    return S.get('particles') && !S.get('reduceMotion');
  }

  class ParticleField {
    constructor(canvas, opts = {}) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.opts = Object.assign({
        count: 60,
        color: [242, 240, 245],
        minSize: 0.4,
        maxSize: 1.6,
        speed: 0.2,
        drift: 0.3,
        glow: true,
      }, opts);
      this.particles = [];
      this.rafId = null;
      this.running = false;
      this.dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.resize = this.resize.bind(this);
      this.loop = this.loop.bind(this);
      window.addEventListener('resize', this.resize);
      this.resize();
      this._build();
      this.start();
    }

    resize() {
      const r = this.canvas.getBoundingClientRect();
      this.w = Math.max(1, r.width);
      this.h = Math.max(1, r.height);
      this.canvas.width = Math.floor(this.w * this.dpr);
      this.canvas.height = Math.floor(this.h * this.dpr);
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    }

    _build() {
      const qf = qualityFactor();
      const n = Math.max(6, Math.floor(this.opts.count * qf));
      this.particles = [];
      for (let i = 0; i < n; i++) {
        this.particles.push({
          x: Math.random() * this.w,
          y: Math.random() * this.h,
          vx: (Math.random() - 0.5) * this.opts.drift,
          vy: -Math.random() * this.opts.speed - 0.05,
          r: this.opts.minSize + Math.random() * (this.opts.maxSize - this.opts.minSize),
          a: 0.15 + Math.random() * 0.55,
          phase: Math.random() * Math.PI * 2,
        });
      }
    }

    start() {
      if (!wantsParticles()) return;
      this.running = true;
      this.loop();
    }
    stop() {
      this.running = false;
      if (this.rafId) cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    loop() {
      if (!this.running) return;
      const ctx = this.ctx;
      ctx.clearRect(0, 0, this.w, this.h);
      const [cr, cg, cb] = this.opts.color;
      for (const p of this.particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.phase += 0.01;
        if (p.y < -10) { p.y = this.h + 10; p.x = Math.random() * this.w; }
        if (p.x < -10) p.x = this.w + 10;
        if (p.x > this.w + 10) p.x = -10;
        const alpha = p.a * (0.6 + 0.4 * Math.sin(p.phase));
        ctx.beginPath();
        if (this.opts.glow) {
          const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 6);
          grd.addColorStop(0, `rgba(${cr},${cg},${cb},${alpha})`);
          grd.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
          ctx.fillStyle = grd;
          ctx.arc(p.x, p.y, p.r * 6, 0, Math.PI * 2);
        } else {
          ctx.fillStyle = `rgba(${cr},${cg},${cb},${alpha})`;
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        }
        ctx.fill();
      }
      this.rafId = requestAnimationFrame(this.loop);
    }

    destroy() {
      this.stop();
      window.removeEventListener('resize', this.resize);
    }
  }

  window.HNParticles = { ParticleField, qualityFactor, wantsParticles };
})();