/* ============================================================
   CURSED FOREST — Canvas scene + 3 relic quest
   ============================================================ */
(function () {
  'use strict';

  const S = window.HNSettings;
  const A = window.HNAudio;
  const KEY = 'hn_forest_relics_v1';

  function loadRelics() {
    try {
      const raw = JSON.parse(localStorage.getItem(KEY) || '[]');
      return Array.isArray(raw) ? raw.filter((x) => ['moon', 'sigil', 'raven'].includes(x)) : [];
    } catch (e) { return []; }
  }
  function saveRelics(r) {
    try { localStorage.setItem(KEY, JSON.stringify(r)); } catch (e) {}
  }

  window.HNForest = {
    mount(root) {
      const relics = loadRelics();
      root.innerHTML = `
        <section class="container page" aria-labelledby="forest-h">
          <header class="page-head">
            <p class="eyebrow">AREA 03</p>
            <h2 id="forest-h">CURSED <span style="color:var(--crimson)">FOREST</span></h2>
            <p>Nhấn vào các điểm sáng để thu thập ba mảnh cổ vật. Sương mù che khuất con đường, nhưng ánh sáng sẽ dẫn lối.</p>
          </header>
          <div class="forest-scene" id="forest-scene" role="img" aria-label="Khu rừng bị nguyền rủa">
            <canvas id="forest-canvas"></canvas>
            <div class="forest-hud">
              <span class="hud-chip" id="forest-progress">RELICS 0 / 3</span>
              <span class="hud-chip warn" id="forest-status">FIND THE LIGHT</span>
            </div>
            <div class="forest-msg" id="forest-msg"></div>
          </div>
          <div class="forest-relics" id="forest-relic-list"></div>
        </section>
      `;

      const scene = root.querySelector('#forest-scene');
      const canvas = root.querySelector('#forest-canvas');
      const ctx = canvas.getContext('2d');
      const msgEl = root.querySelector('#forest-msg');
      const progressEl = root.querySelector('#forest-progress');
      const statusEl = root.querySelector('#forest-status');
      const relicList = root.querySelector('#forest-relic-list');

      const R = {
        moon: { label: 'MOON SHARD', found: relics.includes('moon'), x: 0.22, y: 0.28, color: '#e6e6f0' },
        sigil: { label: 'ANCIENT SIGIL', found: relics.includes('sigil'), x: 0.7, y: 0.6, color: '#FF7518' },
        raven: { label: 'RAVEN FEATHER', found: relics.includes('raven'), x: 0.48, y: 0.78, color: '#D10F2F' },
      };

      let dpr = Math.min(window.devicePixelRatio || 1, 2);
      let W = 0, H = 0;
      let rafId = null;
      let running = true;
      let t = 0;
      const glowSpots = Object.entries(R).map(([k, v]) => ({ key: k, ...v, pulse: Math.random() * Math.PI * 2 }));

      function resize() {
        const r = scene.getBoundingClientRect();
        W = Math.max(1, r.width);
        H = Math.max(1, r.height);
        canvas.width = Math.floor(W * dpr);
        canvas.height = Math.floor(H * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      window.addEventListener('resize', resize);

      function draw() {
        if (!running) return;
        t += 0.016;
        // sky
        const grad = ctx.createLinearGradient(0, 0, 0, H);
        grad.addColorStop(0, '#0a0510');
        grad.addColorStop(0.55, '#050507');
        grad.addColorStop(1, '#0c0508');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);

        // moon
        ctx.save();
        const mx = W * 0.78, my = H * 0.22, mr = Math.min(W, H) * 0.08;
        const mg = ctx.createRadialGradient(mx, my, 0, mx, my, mr * 2.5);
        mg.addColorStop(0, 'rgba(255,43,69,0.9)');
        mg.addColorStop(0.4, 'rgba(139,0,0,0.35)');
        mg.addColorStop(1, 'rgba(139,0,0,0)');
        ctx.fillStyle = mg;
        ctx.beginPath(); ctx.arc(mx, my, mr * 2.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ff2b45';
        ctx.beginPath(); ctx.arc(mx, my, mr, 0, Math.PI * 2); ctx.fill();
        ctx.restore();

        // trees
        drawTree(0.1, 1.05, 0.9, 0.9);
        drawTree(0.3, 1.1, 1.1, 0.8);
        drawTree(0.5, 1.0, 0.85, 1.0);
        drawTree(0.72, 1.08, 1.15, 0.85);
        drawTree(0.92, 1.02, 0.95, 0.95);

        // fog bands
        for (let i = 0; i < 3; i++) {
          const fy = H * (0.55 + i * 0.13);
          ctx.save();
          ctx.globalAlpha = 0.14 - i * 0.03;
          ctx.fillStyle = '#777783';
          ctx.beginPath();
          const wave = Math.sin(t * 0.6 + i) * 20;
          ctx.ellipse(W / 2 + wave, fy, W * 0.7, H * 0.06, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        // fireflies
        for (let i = 0; i < 14; i++) {
          const f = (t * 0.4 + i * 1.7) % 1;
          const x = ((i * 137.5) % 360) / 360 * W;
          const y = H * 0.5 + Math.sin(t + i) * H * 0.15 + (1 - f) * H * 0.2;
          const alpha = 0.4 + 0.4 * Math.sin(t * 2 + i);
          const rg = ctx.createRadialGradient(x, y, 0, x, y, 6);
          rg.addColorStop(0, `rgba(255,117,24,${alpha})`);
          rg.addColorStop(1, 'rgba(255,117,24,0)');
          ctx.fillStyle = rg;
          ctx.beginPath(); ctx.arc(x, y, 6, 0, Math.PI * 2); ctx.fill();
        }

        // relic glows
        glowSpots.forEach((g) => {
          if (g.found) return;
          const x = g.x * W, y = g.y * H;
          const pulse = 0.5 + 0.5 * Math.sin(t * 2 + g.pulse);
          const rr = 22 + pulse * 10;
          const rg = ctx.createRadialGradient(x, y, 0, x, y, rr);
          rg.addColorStop(0, g.color + 'ee');
          rg.addColorStop(0.5, g.color + '66');
          rg.addColorStop(1, g.color + '00');
          ctx.fillStyle = rg;
          ctx.beginPath(); ctx.arc(x, y, rr, 0, Math.PI * 2); ctx.fill();
          // core
          ctx.fillStyle = g.color;
          ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill();
        });

        rafId = requestAnimationFrame(draw);
      }

      function drawTree(xRatio, baseRatio, scale, alpha) {
        const x = W * xRatio, baseY = H * baseRatio;
        const trunkH = H * 0.55 * scale;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#0a0a10';
        ctx.beginPath();
        ctx.moveTo(x - 8, baseY);
        ctx.lineTo(x - 4, baseY - trunkH);
        ctx.lineTo(x + 4, baseY - trunkH);
        ctx.lineTo(x + 8, baseY);
        ctx.closePath();
        ctx.fill();
        // branches
        ctx.strokeStyle = '#0a0a10';
        ctx.lineWidth = 2;
        for (let i = 0; i < 3; i++) {
          const by = baseY - trunkH * (0.4 + i * 0.2);
          ctx.beginPath();
          ctx.moveTo(x, by);
          ctx.lineTo(x - 30 * scale + i * 8, by - 30 * scale);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(x, by);
          ctx.lineTo(x + 30 * scale - i * 8, by - 25 * scale);
          ctx.stroke();
        }
        ctx.restore();
      }

      function renderRelics() {
        relicList.innerHTML = '';
        Object.entries(R).forEach(([k, v]) => {
          const d = document.createElement('div');
          d.className = 'relic' + (v.found ? ' got' : '');
          d.textContent = (v.found ? '✓ ' : '· ') + v.label;
          relicList.appendChild(d);
        });
        const foundCount = Object.values(R).filter((v) => v.found).length;
        progressEl.textContent = `RELICS ${foundCount} / 3`;
        if (foundCount === 3) {
          statusEl.textContent = 'THE GATE OPENS';
          statusEl.className = 'hud-chip done';
        }
      }

      function showMsg(text) {
        msgEl.textContent = text;
        msgEl.classList.add('show');
        clearTimeout(showMsg._t);
        showMsg._t = setTimeout(() => msgEl.classList.remove('show'), 2600);
      }

      function tryPick(px, py) {
        // find nearest un-found relic within radius
        let nearest = null, minD = Infinity;
        Object.entries(R).forEach(([k, v]) => {
          if (v.found) return;
          const dx = px - v.x * W, dy = py - v.y * H;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < minD) { minD = d; nearest = { k, v }; }
        });
        if (nearest && minD < 46) {
          nearest.v.found = true;
          const saved = Object.entries(R).filter(([, v]) => v.found).map(([k]) => k);
          saveRelics(saved);
          if (A) A.play('relic');
          showMsg('BẠN ĐÃ THU THẬP: ' + nearest.v.label);
          renderRelics();
        } else {
          if (A) A.play('click');
          showMsg('Chỉ có sương mù ở đây...');
        }
      }

      scene.addEventListener('click', (e) => {
        const rect = scene.getBoundingClientRect();
        tryPick(e.clientX - rect.left, e.clientY - rect.top);
      });
      // touch
      scene.addEventListener('touchstart', (e) => {
        if (e.touches.length !== 1) return;
        const rect = scene.getBoundingClientRect();
        const tch = e.touches[0];
        tryPick(tch.clientX - rect.left, tch.clientY - rect.top);
      }, { passive: true });

      resize();
      renderRelics();
      draw();

      root._cleanup = () => {
        running = false;
        if (rafId) cancelAnimationFrame(rafId);
        window.removeEventListener('resize', resize);
      };
    },
    unmount() {},
  };
})();