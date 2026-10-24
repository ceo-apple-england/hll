/* ============================================================
   APP BOOTSTRAP — intro screen, header tools, settings panel
   ============================================================ */
(function () {
  'use strict';

  const S = window.HNSettings;
  const A = window.HNAudio;

  /* ---------- Utility: toast ---------- */
  const toastEl = document.getElementById('toast');
  let toastTimer = null;
  function toast(msg, ms = 2600) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), ms);
  }
  window.HNToast = toast;

  /* ============================================================
     INTRO SCREEN
     ============================================================ */
  const introEl = document.getElementById('intro');
  const introCanvas = document.getElementById('intro-canvas');
  const introTitle = document.getElementById('intro-title');
  const enterBtn = document.getElementById('enter-btn');
  const skipBtn = document.getElementById('skip-intro');
  const appShell = document.getElementById('app-shell');

  let introParticles = null;
  let introStarted = false;

  function typeTitle(text, target) {
    target.innerHTML = '';
    const chars = text.split('');
    chars.forEach((ch, i) => {
      const span = document.createElement('span');
      span.className = 'char';
      span.textContent = ch === ' ' ? '\u00A0' : ch;
      span.style.animationDelay = (0.35 + i * 0.06) + 's';
      target.appendChild(span);
    });
  }

  function startIntro() {
    if (introStarted) return;
    introStarted = true;
    if (window.HNParticles && introCanvas) {
      introParticles = new window.HNParticles.ParticleField(introCanvas, {
        count: 80,
        color: [255, 255, 255],
        minSize: 0.3,
        maxSize: 1.4,
        speed: 0.18,
        drift: 0.35,
        glow: true,
      });
    }
    typeTitle('HALLOWEEN NIGHTMARE', introTitle);
  }

  function enterApp() {
    if (introParticles) { introParticles.destroy(); introParticles = null; }
    introEl.classList.add('hidden');
    appShell.classList.remove('hidden');
    appShell.setAttribute('aria-hidden', 'false');
    // khởi động audio sau user gesture
    try {
      A.startMusic();
      A.setMusicOn(S.get('music'));
      A.setSfxOn(S.get('sfx'));
      A.applyVolumes();
    } catch (e) { console.warn(e); }
    // Router
    if (window.HNRouter) window.HNRouter.start();
    // focus to main
    document.getElementById('app').focus({ preventScroll: true });
  }

  // Wait for the intro to be visible
  window.addEventListener('load', () => {
    setTimeout(startIntro, 300);
  });

  enterBtn.addEventListener('click', () => {
    A.play('whoosh');
    // hiệu ứng vệt sáng
    enterBtn.style.transform = 'scale(0.96)';
    setTimeout(() => { enterBtn.style.transform = ''; }, 200);
    // Cinematic reveal
    const overlay = document.getElementById('transition-overlay');
    if (overlay) {
      overlay.className = 'transition-overlay active darkness';
      const ring = document.createElement('div');
      ring.className = 'pulse-ring';
      overlay.appendChild(ring);
      requestAnimationFrame(() => {
        ring.style.transition = 'transform 1000ms cubic-bezier(0.16,1,0.3,1), opacity 1000ms';
        ring.style.transform = 'scale(200)';
        ring.style.opacity = '0';
      });
      setTimeout(() => {
        overlay.className = 'transition-overlay';
        overlay.innerHTML = '';
        enterApp();
      }, 700);
    } else {
      enterApp();
    }
  });

  skipBtn.addEventListener('click', () => {
    A.play('click');
    enterApp();
  });

  /* ============================================================
     HEADER TOOLS
     ============================================================ */
  const btnSound = document.getElementById('btn-sound');
  const btnSettings = document.getElementById('btn-settings');
  const btnFullscreen = document.getElementById('btn-fullscreen');
  const navToggle = document.getElementById('nav-toggle');
  const navList = document.getElementById('nav-list');

  // Sound toggle
  function refreshSoundBtn() {
    const on = S.get('music') || S.get('sfx');
    btnSound.setAttribute('aria-pressed', String(on));
    btnSound.setAttribute('aria-label', on ? 'Tắt âm thanh' : 'Bật âm thanh');
    const wave = btnSound.querySelector('#sound-wave');
    if (wave) wave.style.opacity = on ? '1' : '0.25';
  }
  refreshSoundBtn();

  btnSound.addEventListener('click', () => {
    const nowOn = !(S.get('music') || S.get('sfx'));
    S.set('music', nowOn);
    S.set('sfx', nowOn);
    A.setMusicOn(nowOn);
    A.setSfxOn(nowOn);
    A.applyVolumes();
    refreshSoundBtn();
    A.play('click');
    toast(nowOn ? 'Âm thanh: BẬT' : 'Âm thanh: TẮT');
  });

  // Fullscreen
  btnFullscreen.addEventListener('click', async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (e) {
      toast('Trình duyệt không hỗ trợ toàn màn hình.');
    }
  });

  // Settings panel
  const settingsPanel = document.getElementById('settings-panel');
  const settingsClose = document.getElementById('settings-close');
  const settingsSave = document.getElementById('settings-save');

  function syncSettingsUI() {
    document.getElementById('s-music').checked = S.get('music');
    document.getElementById('s-sfx').checked = S.get('sfx');
    document.getElementById('s-master').value = S.get('masterVolume');
    document.getElementById('s-master-val').textContent = S.get('masterVolume');
    document.getElementById('s-music-vol').value = S.get('musicVolume');
    document.getElementById('s-music-vol-val').textContent = S.get('musicVolume');
    document.getElementById('s-sfx-vol').value = S.get('sfxVolume');
    document.getElementById('s-sfx-vol-val').textContent = S.get('sfxVolume');
    document.getElementById('s-reduce-motion').checked = S.get('reduceMotion');
    document.getElementById('s-jumpscare').checked = S.get('disableJumpscares');
    document.getElementById('s-particles').checked = S.get('particles');
    document.getElementById('s-ambient').checked = S.get('ambient');
    const q = S.get('quality');
    document.querySelectorAll('input[name="quality"]').forEach((r) => { r.checked = r.value === q; });
  }

  function openSettings() {
    syncSettingsUI();
    settingsPanel.classList.add('open');
    settingsPanel.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function closeSettings() {
    settingsPanel.classList.remove('open');
    settingsPanel.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  btnSettings.addEventListener('click', () => { A.play('click'); openSettings(); });
  settingsClose.addEventListener('click', () => { A.play('click'); closeSettings(); });
  settingsSave.addEventListener('click', () => {
    S.set('music', document.getElementById('s-music').checked);
    S.set('sfx', document.getElementById('s-sfx').checked);
    S.set('masterVolume', +document.getElementById('s-master').value);
    S.set('musicVolume', +document.getElementById('s-music-vol').value);
    S.set('sfxVolume', +document.getElementById('s-sfx-vol').value);
    S.set('reduceMotion', document.getElementById('s-reduce-motion').checked);
    S.set('disableJumpscares', document.getElementById('s-jumpscare').checked);
    S.set('particles', document.getElementById('s-particles').checked);
    S.set('ambient', document.getElementById('s-ambient').checked);
    const q = document.querySelector('input[name="quality"]:checked');
    if (q) S.set('quality', q.value);
    A.setMusicOn(S.get('music'));
    A.setSfxOn(S.get('sfx'));
    A.applyVolumes();
    S.applyBodyClasses();
    refreshSoundBtn();
    A.play('click');
    toast('Đã lưu cài đặt.');
    closeSettings();
  });

  // Live preview cho volume
  ['s-master', 's-music-vol', 's-sfx-vol'].forEach((id) => {
    const inp = document.getElementById(id);
    const out = document.getElementById(id + '-val');
    inp.addEventListener('input', () => {
      out.textContent = inp.value;
      if (id === 's-master') S.set('masterVolume', +inp.value);
      if (id === 's-music-vol') S.set('musicVolume', +inp.value);
      if (id === 's-sfx-vol') S.set('sfxVolume', +inp.value);
      A.applyVolumes();
    });
  });

  // Nav toggle (mobile)
  navToggle.addEventListener('click', () => {
    const open = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!open));
    navList.classList.toggle('open', !open);
  });

  // Close nav when a link is clicked (mobile)
  navList.addEventListener('click', (e) => {
    if (e.target.tagName === 'A' && window.innerWidth <= 900) {
      navList.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });

  // Esc closes panels
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (settingsPanel.classList.contains('open')) closeSettings();
      if (navList.classList.contains('open')) {
        navList.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    }
  });

  /* ============================================================
     AMBIENT EVENTS — random subtle horror
     ============================================================ */
  function startAmbientEvents() {
    if (S.get('reduceMotion')) return;
    if (!S.get('ambient')) return;
    if (S.get('disableJumpscares')) return;

    const doEvent = () => {
      if (!S.get('ambient') || S.get('reduceMotion')) {
        schedule();
        return;
      }
      const kind = Math.random();
      if (kind < 0.4) {
        // shadow figure sweeping across bottom of screen
        const shadow = document.createElement('div');
        shadow.style.cssText = `
          position:fixed;bottom:0;left:-20%;width:120px;height:180px;
          background:radial-gradient(ellipse at 50% 20%, #000 10%, transparent 70%);
          pointer-events:none;z-index:8500;opacity:0.7;
          transition:transform 4s linear, opacity 1s;
        `;
        document.body.appendChild(shadow);
        requestAnimationFrame(() => {
          shadow.style.transform = 'translateX(120vw)';
          shadow.style.opacity = '0';
        });
        setTimeout(() => shadow.remove(), 4500);
      } else if (kind < 0.65) {
        // subtle red flash
        const f = document.createElement('div');
        f.style.cssText = 'position:fixed;inset:0;background:rgba(139,0,0,0.08);pointer-events:none;z-index:8500;opacity:0;transition:opacity 0.4s';
        document.body.appendChild(f);
        requestAnimationFrame(() => { f.style.opacity = '1'; });
        setTimeout(() => { f.style.opacity = '0'; setTimeout(() => f.remove(), 400); }, 300);
      } else if (kind < 0.85) {
        // whisper message
        const msgs = ['...behind you.', 'don\u2019t turn around.', 'the night sees you.', 'midnight is near.'];
        toast(msgs[Math.floor(Math.random() * msgs.length)], 2000);
      } else {
        // crow silhouette
        const crow = document.createElement('div');
        crow.style.cssText = `
          position:fixed;top:${10 + Math.random() * 40}%;right:-40px;
          width:34px;height:16px;background:#050507;
          clip-path:polygon(0% 50%,30% 0%,50% 40%,70% 0%,100% 50%,70% 60%,50% 80%,30% 60%);
          pointer-events:none;z-index:8500;
          transition:transform 3s linear, opacity 1s;
        `;
        document.body.appendChild(crow);
        requestAnimationFrame(() => {
          crow.style.transform = 'translateX(-70vw)';
          crow.style.opacity = '0';
        });
        setTimeout(() => crow.remove(), 3500);
      }
      schedule();
    };
    const schedule = () => {
      const delay = 22000 + Math.random() * 20000;
      setTimeout(doEvent, delay);
    };
    schedule();
  }
  startAmbientEvents();

  /* ============================================================
     LocalStorage / reduced motion sync
     ============================================================ */
  S.onChange((key) => {
    if (key === 'reduceMotion' || key === 'quality') S.applyBodyClasses();
    if (key === 'music' || key === 'sfx') refreshSoundBtn();
  });

  // Footer year
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  // If prefers-reduced-motion, auto-reflect in UI (chỉ khi user chưa từng đổi)
  if (window.matchMedia) {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches && !S.get('reduceMotion')) {
      // respect nhưng không ghi đè user; chỉ áp dụng body class
      document.body.classList.add('reduce-motion');
    }
  }

  // Expose for debugging
  window.HN = { S, A, toast };
})();