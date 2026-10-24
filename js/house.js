/* ============================================================
   HAUNTED HOUSE — khám phá 4 phòng
   ============================================================ */
(function () {
  'use strict';

  const S = window.HNSettings;
  const A = window.HNAudio;
  const KEY = 'hn_house_found_v1';

  const ROOMS = [
    { id: 'living', name: 'Phòng khách', x: 18, y: 40, text: 'Bức tranh chân dung trên tường. Khi nhìn kỹ, đôi mắt dường như... chuyển động. Một giọng nói thì thầm: "Đừng tin vào cái khung."', hint: 'Bức tranh đã thay đổi trong một khoảnh khắc.' },
    { id: 'hallway', name: 'Hành lang', x: 50, y: 30, text: 'Ánh nến tắt dần phía sau bạn. Có tiếng bước chân... nhưng không có ai ở đó. Cuối hành lang, một bóng đen lướt qua.', hint: 'Một bóng đen vừa đi ngang cuối hành lang.' },
    { id: 'bedroom', name: 'Phòng ngủ', x: 78, y: 42, text: 'Chiếc đồng hồ cũ tự di chuyển kim. Tiếng tích tắc vang lên đều đặn. Trên mặt đồng hồ khắc dòng chữ: "MIDNIGHT NEVER ENDS."', hint: 'Đồng hồ đang chạy ngược.' },
    { id: 'basement', name: 'Tầng hầm', x: 40, y: 78, text: 'Một chiếc rương gỗ bị khóa. Bên cạnh là mảnh giấy: "Ba vật phẩm trong khu rừng sẽ mở được ổ khóa này."', hint: 'Chiếc rương cần ba mảnh cổ vật.' },
  ];

  function loadFound() {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); }
    catch (e) { return []; }
  }
  function saveFound(f) {
    try { localStorage.setItem(KEY, JSON.stringify(f)); } catch (e) {}
  }

  function runJumpscare() {
    if (S.get('disableJumpscares') || S.get('reduceMotion')) return;
    const flash = document.createElement('div');
    flash.style.cssText = 'position:fixed;inset:0;background:rgba(139,0,0,0.35);z-index:9400;pointer-events:none;transition:opacity 400ms';
    document.body.appendChild(flash);
    if (A) A.play('glitch');
    setTimeout(() => {
      flash.style.opacity = '0';
      setTimeout(() => flash.remove(), 400);
    }, 80);
  }

  window.HNHouse = {
    mount(root) {
      root.innerHTML = `
        <section class="container page" aria-labelledby="house-h">
          <header class="page-head">
            <p class="eyebrow">AREA 02</p>
            <h2 id="house-h">HAUNTED <span style="color:var(--crimson)">HOUSE</span></h2>
            <p>Khám phá từng căn phòng. Nhấn vào các điểm sáng để mở khóa bí mật. Thu thập tất cả bốn để hoàn thành ngôi nhà.</p>
          </header>
          <div class="house-layout">
            <div class="house-scene" id="house-scene" role="group" aria-label="Sơ đồ ngôi nhà ma">
              <div class="interior-fog"></div>
            </div>
            <div class="house-info" id="house-info">
              <h3>THE HOUSE AWAITS</h3>
              <p>Hãy chọn một điểm sáng để bắt đầu.</p>
              <div class="house-progress" id="house-progress">
                <span>EXPLORED: <span id="house-count">0</span> / 4</span>
                <div class="bar"><i id="house-bar"></i></div>
              </div>
            </div>
          </div>
        </section>
      `;

      const scene = root.querySelector('#house-scene');
      const info = root.querySelector('#house-info');
      const countEl = root.querySelector('#house-count');
      const barEl = root.querySelector('#house-bar');

      let found = loadFound();

      function refresh() {
        countEl.textContent = found.length;
        barEl.style.width = (found.length / ROOMS.length) * 100 + '%';
        if (found.length === ROOMS.length) {
          info.querySelector('h3').textContent = 'THE HOUSE REMEMBERS YOU';
          info.querySelector('p').textContent = 'Bạn đã khám phá hết. Một cánh cửa bí mật mở ra — hãy xem phần SECRETS.';
        }
      }

      ROOMS.forEach((r, i) => {
        const btn = document.createElement('button');
        btn.className = 'house-hotspot' + (found.includes(r.id) ? ' found' : '');
        btn.type = 'button';
        btn.style.left = r.x + '%';
        btn.style.top = r.y + '%';
        btn.setAttribute('aria-label', 'Mở ' + r.name);
        const glow = document.createElement('span');
        glow.className = 'glow';
        const num = document.createElement('span');
        num.className = 'num';
        num.textContent = found.includes(r.id) ? '✓' : String(i + 1);
        glow.appendChild(num);
        const label = document.createElement('span');
        label.textContent = r.name.toUpperCase();
        btn.append(glow, label);
        btn.addEventListener('click', () => visit(r, btn, num));
        scene.appendChild(btn);
      });

      function visit(room, btn, num) {
        const isNew = !found.includes(room.id);
        info.querySelector('h3').textContent = room.name.toUpperCase();
        info.querySelector('p').textContent = room.text;
        if (A) A.play('click');
        if (isNew) {
          found.push(room.id);
          saveFound(found);
          btn.classList.add('found');
          num.textContent = '✓';
          setTimeout(runJumpscare, 320);
          refresh();
        }
      }

      refresh();
    },
    unmount() {},
  };
})();