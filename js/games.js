/* ============================================================
   MIDNIGHT GAMES — 3 trò chơi với logic thực tế
   ============================================================ */
(function () {
  'use strict';

  const S = window.HNSettings;
  const A = window.HNAudio;

  /* ---------- Utils ---------- */
  const el = (tag, cls, html) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  };
  const rand = (n) => Math.floor(Math.random() * n);
  const isJumpscareDisabled = () => S.get('disableJumpscares');

  /* ============ GAME A — FIND THE GHOST ============ */
  function mountFindGhost(root) {
    const body = root.querySelector('.game-card-body');
    body.innerHTML = '';
    const stats = el('div', 'game-stats');
    const scoreEl = el('span', 'game-stat', 'SCORE <strong>0</strong>');
    const timeEl = el('span', 'game-stat', 'TIME <strong>30</strong>');
    stats.append(scoreEl, timeEl);
    const field = el('div', 'ghost-field');
    const startBtn = el('button', 'btn btn-primary w-full', 'START');
    startBtn.type = 'button';
    body.append(stats, field, startBtn);

    let state = { running: false, score: 0, time: 30, timer: null, ghostTimer: null, missTimer: null, ghostEl: null, locked: false };

    function setScore(v) { state.score = v; scoreEl.querySelector('strong').textContent = v; }
    function setTime(v) { state.time = v; timeEl.querySelector('strong').textContent = v; }

    function spawnGhost() {
      if (!state.running) return;
      if (state.ghostEl) state.ghostEl.remove();
      const g = el('button', 'ghost-target');
      g.type = 'button';
      g.setAttribute('aria-label', 'Con ma');
      const fw = field.clientWidth || 300;
      const fh = field.clientHeight || 200;
      g.style.left = rand(Math.max(1, fw - 50)) + 'px';
      g.style.top = rand(Math.max(1, fh - 60)) + 'px';
      let clicked = false;
      g.addEventListener('click', (e) => {
        e.stopPropagation();
        if (clicked || !state.running) return;
        clicked = true;
        setScore(state.score + 1);
        if (A) A.play('correct');
        g.style.transform = 'scale(1.4)';
        g.style.opacity = '0';
        setTimeout(() => g.remove(), 150);
        state.ghostEl = null;
        // spawn nhanh hơn khi điểm cao
        const delay = Math.max(280, 800 - state.score * 30);
        clearTimeout(state.ghostTimer);
        state.ghostTimer = setTimeout(spawnGhost, delay);
      });
      field.appendChild(g);
      state.ghostEl = g;
      clearTimeout(state.ghostTimer);
      const lifetime = Math.max(700, 1600 - state.score * 40);
      state.ghostTimer = setTimeout(() => {
        if (state.ghostEl === g) {
          g.style.opacity = '0';
          setTimeout(() => g.remove(), 200);
          state.ghostEl = null;
          setTimeout(spawnGhost, 250);
        }
      }, lifetime);
    }

    function start() {
      if (state.running) return;
      state.running = true;
      state.locked = false;
      startBtn.disabled = true;
      startBtn.textContent = 'PLAYING...';
      setScore(0); setTime(30);
      if (A) A.play('click');
      spawnGhost();
      state.missTimer = setInterval(() => {}, 999999);
      state.timer = setInterval(() => {
        setTime(state.time - 1);
        if (state.time <= 0) end();
      }, 1000);
    }

    function end() {
      state.running = false;
      state.locked = true;
      clearInterval(state.timer);
      clearTimeout(state.ghostTimer);
      if (state.ghostEl) { state.ghostEl.remove(); state.ghostEl = null; }
      startBtn.disabled = false;
      startBtn.textContent = 'PLAY AGAIN';
      // save high score
      try {
        const key = 'hn_best_findghost';
        const best = parseInt(localStorage.getItem(key) || '0', 10);
        if (state.score > best) localStorage.setItem(key, String(state.score));
      } catch (e) {}
      // result overlay message
      const msg = el('div', 'game-stats');
      msg.innerHTML = `TIME'S UP — FINAL SCORE <strong>${state.score}</strong>`;
      msg.style.color = 'var(--crimson)';
      const old = body.querySelector('.game-result');
      if (old) old.remove();
      msg.classList.add('game-result');
      body.insertBefore(msg, startBtn);
    }

    startBtn.addEventListener('click', start);
    root._cleanup = () => {
      clearInterval(state.timer);
      clearTimeout(state.ghostTimer);
      clearTimeout(state.missTimer);
    };
  }

  /* ============ GAME B — HAUNTED MEMORY ============ */
  function mountMemory(root) {
    const body = root.querySelector('.game-card-body');
    body.innerHTML = '';
    const stats = el('div', 'game-stats');
    const movesEl = el('span', null, 'MOVES <strong>0</strong>');
    const timeEl = el('span', null, 'TIME <strong>0</strong>');
    const bestEl = el('span', null, 'BEST <strong>—</strong>');
    stats.append(movesEl, timeEl, bestEl);
    const grid = el('div', 'memory-grid');
    const restart = el('button', 'btn btn-primary w-full', 'START');
    restart.type = 'button';
    body.append(stats, grid, restart);

    const SYMBOLS = ['☠', '🕯', '⚰', '🕸', '🌙', '⚱', '🕷', '⚡'];
    let state = null;

    function shuffle(arr) {
      const a = arr.slice();
      for (let i = a.length - 1; i > 0; i--) {
        const j = rand(i + 1);
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    }

    function render() {
      grid.innerHTML = '';
      state.cards.forEach((card, i) => {
        const c = el('button', 'mem-card');
        c.type = 'button';
        c.setAttribute('aria-label', 'Thẻ ' + (i + 1));
        c.dataset.index = i;
        const inner = el('div', 'mem-card-inner');
        const front = el('div', 'mem-face front', '?');
        const back = el('div', 'mem-face back', card.sym);
        inner.append(front, back);
        c.appendChild(inner);
        c.addEventListener('click', () => flip(i));
        grid.appendChild(c);
      });
    }

    function updateStats() {
      movesEl.querySelector('strong').textContent = state.moves;
      timeEl.querySelector('strong').textContent = state.time;
      const best = localStorage.getItem('hn_best_memory_moves');
      bestEl.querySelector('strong').textContent = best ? best : '—';
    }

    function flip(i) {
      if (!state || state.finished) return;
      const card = state.cards[i];
      if (card.matched || card.flipped) return;
      if (state.locked) return;
      card.flipped = true;
      grid.children[i].classList.add('flipped');
      if (A) A.play('click');
      state.picks.push(i);
      if (state.picks.length === 2) {
        state.moves++;
        updateStats();
        state.locked = true;
        const [a, b] = state.picks;
        if (state.cards[a].sym === state.cards[b].sym) {
          state.cards[a].matched = state.cards[b].matched = true;
          setTimeout(() => {
            grid.children[a].classList.add('matched');
            grid.children[b].classList.add('matched');
            if (A) A.play('correct');
            state.picks = [];
            state.locked = false;
            checkWin();
          }, 350);
        } else {
          setTimeout(() => {
            state.cards[a].flipped = false;
            state.cards[b].flipped = false;
            grid.children[a].classList.remove('flipped');
            grid.children[b].classList.remove('flipped');
            if (A) A.play('wrong');
            state.picks = [];
            state.locked = false;
          }, 750);
        }
      }
    }

    function checkWin() {
      if (state.cards.every((c) => c.matched)) {
        state.finished = true;
        clearInterval(state.timer);
        if (A) A.play('relic');
        const best = parseInt(localStorage.getItem('hn_best_memory_moves') || '0', 10);
        if (!best || state.moves < best) {
          localStorage.setItem('hn_best_memory_moves', String(state.moves));
        }
        const msg = el('div', 'game-stats');
        msg.innerHTML = `COMPLETE — <strong>${state.moves} MOVES</strong> / <strong>${state.time}s</strong>`;
        msg.style.color = '#34d399';
        const old = body.querySelector('.game-result');
        if (old) old.remove();
        msg.classList.add('game-result');
        body.insertBefore(msg, restart);
        restart.textContent = 'PLAY AGAIN';
        restart.disabled = false;
      }
    }

    function start() {
      const syms = shuffle(SYMBOLS.concat(SYMBOLS));
      state = {
        cards: syms.map((s) => ({ sym: s, flipped: false, matched: false })),
        picks: [], moves: 0, time: 0, finished: false, locked: false, timer: null,
      };
      render();
      updateStats();
      restart.textContent = 'RESTART';
      restart.disabled = false;
      if (state.timer) clearInterval(state.timer);
      state.timer = setInterval(() => {
        if (state.finished) return;
        state.time++;
        updateStats();
      }, 1000);
      const old = body.querySelector('.game-result');
      if (old) old.remove();
    }

    restart.addEventListener('click', start);
    updateStats();
    root._cleanup = () => { if (state && state.timer) clearInterval(state.timer); };
  }

  /* ============ GAME C — THE CURSED DOOR ============ */
  function mountDoors(root) {
    const body = root.querySelector('.game-card-body');
    body.innerHTML = '';
    const stats = el('div', 'game-stats');
    const playedEl = el('span', null, 'PLAYED <strong>0</strong>');
    const winsEl = el('span', null, 'WINS <strong>0</strong>');
    stats.append(playedEl, winsEl);
    const row = el('div', 'doors-row');
    const msg = el('div', 'game-stats');
    msg.style.minHeight = '1.2em';
    msg.style.color = 'var(--ghost)';
    const again = el('button', 'btn btn-ghost w-full', 'PLAY AGAIN');
    again.type = 'button';
    again.disabled = true;
    body.append(stats, row, msg, again);

    let state = { played: 0, wins: 0, locked: false };

    function update() {
      playedEl.querySelector('strong').textContent = state.played;
      winsEl.querySelector('strong').textContent = state.wins;
    }

    function build() {
      row.innerHTML = '';
      state.locked = false;
      again.disabled = true;
      msg.textContent = 'Choose a door...';
      for (let i = 0; i < 3; i++) {
        const d = el('button', 'door');
        d.type = 'button';
        d.setAttribute('aria-label', 'Cánh cửa ' + (i + 1));
        const inner = el('div', 'door-inner', ['I','II','III'][i]);
        const reveal = el('div', 'door-reveal', '?');
        d.append(inner, reveal);
        d.addEventListener('click', () => open(d, i));
        row.appendChild(d);
      }
    }

    function open(doorEl, idx) {
      if (state.locked) return;
      state.locked = true;
      if (A) A.play('door');
      state.played++;
      const roll = Math.random();
      let result, cls, txt;
      if (roll < 0.4) {
        result = 'win'; cls = 'win'; txt = 'TREASURE +1';
        state.wins++;
      } else if (roll < 0.75) {
        result = 'secret'; cls = ''; txt = 'SECRET SEEN';
      } else {
        result = 'spook'; cls = 'spook'; txt = 'THE VOID STARES';
        if (!isJumpscareDisabled()) {
          // subtle red flash
          document.body.style.transition = 'background-color 120ms';
          document.body.style.backgroundColor = 'rgba(80,0,10,0.35)';
          setTimeout(() => { document.body.style.backgroundColor = ''; }, 200);
        }
      }
      const reveal = doorEl.querySelector('.door-reveal');
      reveal.textContent = txt;
      if (cls) reveal.classList.add(cls);
      doorEl.classList.add('open');
      if (result === 'win') { if (A) A.play('relic'); }
      else if (result === 'spook') { if (A) A.play('wrong'); }
      else { if (A) A.play('correct'); }
      msg.textContent = result === 'win' ? 'You found something valuable.'
        : result === 'secret' ? 'A whisper reveals a secret...'
        : 'A cold dread washes over you.';
      update();
      setTimeout(() => {
        again.disabled = false;
      }, 900);
    }

    again.addEventListener('click', build);
    build();
    update();
    root._cleanup = () => {};
  }

  /* ============ MOUNT ============ */
  window.HNGames = {
    mount(root) {
      root.innerHTML = '';

      const cards = [
        { id: 'ghost', title: 'FIND THE GHOST', tag: 'A / 30s', desc: 'Con ma xuất hiện ngẫu nhiên. Nhấn trúng để ghi điểm. Thời gian càng trôi, ma càng nhanh.', mount: mountFindGhost },
        { id: 'memory', title: 'HAUNTED MEMORY', tag: 'B / PAIRS', desc: 'Lật hai thẻ để tìm cặp hình giống nhau. Hoàn thành với ít lượt nhất.', mount: mountMemory },
        { id: 'doors', title: 'THE CURSED DOOR', tag: 'C / LUCK', desc: 'Ba cánh cửa. Mỗi cánh dẫn tới một kết cục ngẫu nhiên. Chọn và đối mặt.', mount: mountDoors },
      ];

      cards.forEach((c) => {
        const card = el('article', 'game-card');
        card.dataset.game = c.id;
        const head = el('header', 'game-card-head');
        head.appendChild(el('h3', null, c.title));
        head.appendChild(el('span', 'tag', c.tag));
        const body = el('div', 'game-card-body');
        body.appendChild(el('p', 'game-desc', c.desc));
        card.append(head, body);
        root.appendChild(card);
        c.mount(card);
      });
    },
    unmount() {},
  };
})();