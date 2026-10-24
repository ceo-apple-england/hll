/* ============================================================
   ROUTER — hash-based SPA routing
   Routes: #/home #/explore #/house #/forest #/games #/secrets #/gallery
   ============================================================ */
(function () {
  'use strict';

  const S = window.HNSettings;
  const T = window.HNTransitions;
  const A = window.HNAudio;

  const ROUTES = {
    '/home': { title: 'HALLOWEEN NIGHTMARE — Home', render: renderHome, transition: 'darkness' },
    '/explore': { title: 'EXPLORE — Halloween Nightmare', render: renderExplore, transition: 'fog' },
    '/house': { title: 'HAUNTED HOUSE — Halloween Nightmare', render: renderHouse, transition: 'zoom' },
    '/forest': { title: 'CURSED FOREST — Halloween Nightmare', render: renderForest, transition: 'fog' },
    '/games': { title: 'MIDNIGHT GAMES — Halloween Nightmare', render: renderGames, transition: 'curtain' },
    '/secrets': { title: 'SECRET ARCHIVE — Halloween Nightmare', render: renderSecrets, transition: 'darkness' },
    '/gallery': { title: 'HALLOWEEN GALLERY — Halloween Nightmare', render: renderGallery, transition: 'fog' },
  };

  let currentRoute = null;
  let transitioning = false;
  const app = () => document.getElementById('app');

  function parseHash() {
    const h = location.hash || '#/home';
    let path = h.replace(/^#/, '');
    if (!path.startsWith('/')) path = '/' + path;
    return path;
  }

  function setActiveNav(route) {
    document.querySelectorAll('.nav-list a').forEach((a) => {
      const r = a.getAttribute('data-route');
      a.classList.toggle('active', '/' + r === route);
      if ('/' + r === route) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
  }

  function cleanupPrevious() {
    const prev = app().firstElementChild;
    if (prev && prev._cleanup) {
      try { prev._cleanup(); } catch (e) { console.warn(e); }
    }
    // dọn các reader/lightbox đang mở
    document.querySelectorAll('.reader.open, .lightbox.open').forEach((n) => {
      n.classList.remove('open');
      n.setAttribute('aria-hidden', 'true');
    });
  }

  function renderRoute(route, pushHistory = true) {
    if (transitioning) return;
    const routeDef = ROUTES[route];
    if (!routeDef) {
      location.hash = '#/home';
      return;
    }
    transitioning = true;
    setActiveNav(route);

    const doRender = () => {
      cleanupPrevious();
      const root = document.createElement('section');
      root.className = 'route-root';
      root.dataset.route = route.replace('/', '');
      app().innerHTML = '';
      app().appendChild(root);
      routeDef.render(root);
      document.title = routeDef.title;
      // focus for a11y
      app().focus({ preventScroll: true });
      window.scrollTo({ top: 0, behavior: 'auto' });
      // reveal observer
      observeReveals();
      currentRoute = route;
      transitioning = false;
    };

    if (currentRoute === null) {
      doRender();
    } else {
      T.run(routeDef.transition, doRender);
    }
    if (pushHistory && location.hash !== '#' + route) {
      history.pushState(null, '', '#' + route);
    }
  }

  function observeReveals() {
    const targets = document.querySelectorAll('.reveal:not(.in)');
    if (!targets.length) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
    targets.forEach((t) => io.observe(t));
  }

  /* ============ PAGE RENDERERS ============ */
  function renderHome(root) {
    root.innerHTML = `
      <section class="hero" aria-labelledby="hero-h">
        <div class="hero-left">
          <p class="hero-eyebrow">WHEN THE CLOCK STRIKES MIDNIGHT</p>
          <h1 class="hero-title" id="hero-h">HALLOWEEN<span class="line2">NIGHTMARE</span></h1>
          <p class="hero-lead">Một thị trấn bị bỏ hoang. Ánh trăng đỏ. Những lâu đài cổ, nghĩa trang phủ sương, và những bóng đen chờ đợi giữa rừng. Đêm nay, màn đêm thức giấc — và nó biết tên bạn.</p>
          <div class="hero-cta">
            <a class="btn btn-primary" href="#/explore">EXPLORE THE NIGHT</a>
            <a class="btn btn-ghost" href="#/games">ENTER THE GAME</a>
          </div>
        </div>
        <div class="hero-right" aria-hidden="true">
          <div class="hero-scene" id="hero-scene">
            <div class="moon"></div>
            <div class="castle">
              <span class="castle-window" style="left:14%;top:40%"></span>
              <span class="castle-window" style="left:30%;top:22%"></span>
              <span class="castle-window" style="left:40%;top:6%"></span>
              <span class="castle-window" style="left:60%;top:30%"></span>
              <span class="castle-window" style="left:70%;top:48%"></span>
              <span class="castle-window" style="left:85%;top:52%"></span>
            </div>
            <svg class="raven" viewBox="0 0 40 20"><path d="M2,10 Q10,0 20,8 Q30,0 38,10 Q30,8 20,14 Q10,8 2,10 Z"/></svg>
            <svg class="raven r2" viewBox="0 0 40 20"><path d="M2,10 Q10,0 20,8 Q30,0 38,10 Q30,8 20,14 Q10,8 2,10 Z"/></svg>
            <svg class="raven r3" viewBox="0 0 40 20"><path d="M2,10 Q10,0 20,8 Q30,0 38,10 Q30,8 20,14 Q10,8 2,10 Z"/></svg>
            <div class="fog"></div>
          </div>
        </div>
      </section>

      <section class="explore-section container" aria-labelledby="explore-h">
        <p class="hero-eyebrow" style="text-align:center">CHOOSE YOUR PATH</p>
        <h2 class="section-title" id="explore-h" style="text-align:center">THREE <span class="accent">DOORS</span></h2>
        <div class="explore-grid reveal">
          <button class="explore-card" type="button" data-target="#/house" aria-label="Mở Haunted House">
            <h3>HAUNTED HOUSE</h3>
            <p>Khám phá ngôi nhà ma với những căn phòng bí mật và bức tranh biết nhìn.</p>
            <span class="card-cta">ENTER THE HOUSE →</span>
          </button>
          <button class="explore-card" type="button" data-target="#/forest" aria-label="Mở Cursed Forest">
            <h3>CURSED FOREST</h3>
            <p>Bước vào khu rừng bị nguyền rủa, tìm ba mảnh cổ vật và mở cánh cổng.</p>
            <span class="card-cta">WALK INTO FOG →</span>
          </button>
          <button class="explore-card" type="button" data-target="#/games" aria-label="Mở Midnight Games">
            <h3>MIDNIGHT GAMES</h3>
            <p>Ba trò chơi Halloween thực sự có thể chơi: tìm ma, lật bài, chọn cửa.</p>
            <span class="card-cta">PLAY NOW →</span>
          </button>
        </div>
      </section>
    `;

    // parallax cho hero-scene
    const heroScene = root.querySelector('#hero-scene');
    const moon = heroScene.querySelector('.moon');
    const castle = heroScene.querySelector('.castle');
    const onMove = (e) => {
      if (S.get('reduceMotion')) return;
      const r = heroScene.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      moon.style.transform = `translate(${x * 22}px, ${y * 18}px)`;
      castle.style.transform = `translate(${x * -10}px, ${y * -6}px)`;
    };
    heroScene.addEventListener('mousemove', onMove);
    root._cleanup = () => heroScene.removeEventListener('mousemove', onMove);

    // card → navigate
    root.querySelectorAll('.explore-card').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (A) A.play('whoosh');
        location.hash = btn.dataset.target;
      });
    });
  }

  function renderExplore(root) {
    // "Explore" là 1 hub page liệt kê các vùng
    root.innerHTML = `
      <section class="container page" aria-labelledby="explore-h2">
        <header class="page-head">
          <p class="eyebrow">AREA 01</p>
          <h2 id="explore-h2">EXPLORE THE <span style="color:var(--crimson)">NIGHT</span></h2>
          <p>Bốn vùng đất của thị trấn bị bỏ hoang. Mỗi nơi giữ một mảnh bí mật.</p>
        </header>
        <div class="explore-grid">
          <a class="explore-card" href="#/house"><h3>HAUNTED HOUSE</h3><p>Bốn căn phòng, bốn bí mật. Tìm đủ để mở khóa phần thưởng.</p><span class="card-cta">ENTER →</span></a>
          <a class="explore-card" href="#/forest"><h3>CURSED FOREST</h3><p>Ba mảnh cổ vật giấu trong sương mù. Cẩn thận với những điểm sáng.</p><span class="card-cta">ENTER →</span></a>
          <a class="explore-card" href="#/games"><h3>MIDNIGHT GAMES</h3><p>Ba trò chơi: Find the Ghost, Haunted Memory, Cursed Door.</p><span class="card-cta">ENTER →</span></a>
          <a class="explore-card" href="#/gallery"><h3>GALLERY</h3><p>Những hình ảnh được lưu giữ từ đêm Halloween cuối cùng.</p><span class="card-cta">ENTER →</span></a>
        </div>
      </section>
    `;
  }

  function renderHouse(root) {
    window.HNHouse.mount(root);
  }
  function renderForest(root) {
    window.HNForest.mount(root);
  }
  function renderGames(root) {
    const section = document.createElement('section');
    section.className = 'container page';
    section.innerHTML = `
      <header class="page-head">
        <p class="eyebrow">AREA 04</p>
        <h2>MIDNIGHT <span style="color:var(--crimson)">GAMES</span></h2>
        <p>Ba trò chơi của lễ hội bị bỏ hoang. Chúng không công bằng — nhưng chúng luôn chạy.</p>
      </header>
      <div class="games-grid"></div>
    `;
    root.appendChild(section);
    window.HNGames.mount(section.querySelector('.games-grid'));
  }
  function renderSecrets(root) {
    window.HNSecrets.mount(root);
  }
  function renderGallery(root) {
    window.HNGallery.mount(root);
  }

  /* ============ BOOTSTRAP ============ */
  function start() {
    const route = parseHash();
    renderRoute(route, false);
    window.addEventListener('hashchange', () => {
      const r = parseHash();
      if (r !== currentRoute) renderRoute(r, false);
    });
    // Back/Forward đã được hashchange xử lý, không cần popstate riêng
  }

  window.HNRouter = { start, ROUTES };
})();