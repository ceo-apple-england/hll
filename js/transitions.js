/* ============================================================
   TRANSITIONS — overlay chuyển cảnh điện ảnh
   Các kiểu: darkness | fog | glitch | curtain | zoom
   ============================================================ */
(function () {
  'use strict';

  const S = window.HNSettings;
  const overlay = () => document.getElementById('transition-overlay');

  function wait(ms) { return new Promise((r) => setTimeout(r, ms)); }

  function reduced() { return S.get('reduceMotion'); }

  async function run(type, applier) {
    const ov = overlay();
    if (!ov) { applier && applier(); return; }
    if (reduced()) {
      applier && applier();
      return;
    }

    ov.className = 'transition-overlay active ' + type;
    ov.innerHTML = '';

    if (type === 'darkness') {
      const ring = document.createElement('div');
      ring.className = 'pulse-ring';
      ov.appendChild(ring);
      requestAnimationFrame(() => {
        ring.style.transition = 'transform 900ms cubic-bezier(0.16,1,0.3,1), opacity 900ms';
        ring.style.transform = 'scale(120)';
        ring.style.opacity = '0';
      });
      await wait(450);
      applier && applier();
      await wait(450);
    } else if (type === 'fog') {
      const fog = document.createElement('div');
      fog.className = 'fog-layer';
      ov.appendChild(fog);
      requestAnimationFrame(() => {
        fog.style.transition = 'opacity 500ms';
        fog.style.opacity = '1';
      });
      await wait(500);
      applier && applier();
      fog.style.opacity = '0';
      await wait(500);
    } else if (type === 'glitch') {
      const bars = document.createElement('div');
      bars.className = 'glitch-bars';
      ov.appendChild(bars);
      bars.style.opacity = '1';
      if (window.HNAudio) window.HNAudio.play('glitch');
      await wait(180);
      applier && applier();
      await wait(200);
    } else if (type === 'curtain') {
      const l = document.createElement('div'); l.className = 'curtain-left';
      const r = document.createElement('div'); r.className = 'curtain-right';
      ov.appendChild(l); ov.appendChild(r);
      requestAnimationFrame(() => {
        l.style.transform = 'scaleX(1)';
        r.style.transform = 'scaleX(1)';
      });
      await wait(550);
      applier && applier();
      await wait(250);
      l.style.transform = 'scaleX(0)';
      r.style.transform = 'scaleX(0)';
      await wait(400);
    } else if (type === 'zoom') {
      applier && applier();
      ov.style.background = 'transparent';
      await wait(20);
    }

    ov.className = 'transition-overlay';
    ov.innerHTML = '';
  }

  window.HNTransitions = { run, wait };
})();