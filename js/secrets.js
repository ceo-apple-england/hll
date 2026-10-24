/* ============================================================
   SECRET ARCHIVE — tài liệu, mở khóa theo tiến trình
   ============================================================ */
(function () {
  'use strict';

  const S = window.HNSettings;
  const A = window.HNAudio;

  const DOCS = [
    {
      id: 'diary',
      title: 'THE LOST DIARY',
      eyebrow: 'DOC 01',
      desc: 'Nhật ký của một người từng sống trong ngôi nhà ma.',
      unlock: () => true,
      body: [
        'Ngày 13 tháng 10. Tôi nghe tiếng gõ cửa lúc nửa đêm. Không có ai bên ngoài, nhưng trên bậc thềm có một phong thư đỏ.',
        'Ngày 21 tháng 10. Những bức tranh trong hành lang đã thay đổi. Người phụ nữ trong khung không còn quay mặt đi nữa. Bà ta nhìn tôi.',
        'Ngày 31 tháng 10. Tôi đã hiểu. Ngôi nhà không bỏ hoang. Nó chỉ đang đợi người đến thay thế. Đừng mở cánh cửa cuối hành lang.',
      ],
    },
    {
      id: 'moon',
      title: 'THE RED MOON',
      eyebrow: 'DOC 02',
      desc: 'Về đêm trăng máu và những gì nó đánh thức.',
      unlock: () => {
        try { return JSON.parse(localStorage.getItem('hn_forest_relics_v1') || '[]').length >= 3; }
        catch (e) { return false; }
      },
      body: [
        'Cứ mỗi 100 năm, trăng chuyển sang màu máu. Trong đêm đó, cái chết không phải là kết thúc — nó là một cánh cửa.',
        'Những ai nhìn thẳng vào trăng đỏ sẽ thấy bóng mình bước ra khỏi cơ thể, đi về phía khu rừng, và không bao giờ quay lại.',
        'Người xưa khắc lên đá: "KHI ĐỒNG HỒ ĐIỂM NỬA ĐÊM, MÀN ĐÊM THỨC GIẤC."',
      ],
    },
    {
      id: 'soul',
      title: 'THE FORGOTTEN SOUL',
      eyebrow: 'DOC 03',
      desc: 'Linh hồn bị lãng quên trong tầng hầm.',
      unlock: () => {
        try { return JSON.parse(localStorage.getItem('hn_house_found_v1') || '[]').length >= 4; }
        catch (e) { return false; }
      },
      body: [
        'Trong tầng hầm, có một chiếc rương gỗ. Nó không khóa bằng chìa — nó khóa bằng ký ức.',
        'Ai mở được rương phải kể lại câu chuyện của người đã khuất. Nếu không, chiếc rương sẽ mở ra một lần nữa, vào đêm Halloween tiếp theo, và lần đó sẽ có thêm một linh hồn mới.',
        'Dưới đáy rương có khắc: "TÔI ĐÃ TỪNG Ở ĐÂY. BẠN SẼ Ở ĐÂY MÃI MÃI."',
      ],
    },
    {
      id: 'midnight',
      title: 'THE LAST MIDNIGHT',
      eyebrow: 'DOC 04',
      desc: 'Điều gì xảy ra sau tiếng chuông cuối cùng.',
      unlock: () => {
        try { return localStorage.getItem('hn_final_unlocked') === '1'; }
        catch (e) { return false; }
      },
      body: [
        'Khi đồng hồ điểm 12 tiếng, mọi thứ dừng lại. Không phải thời gian — mà là chính thực tại.',
        'Trong khoảnh khắc đó, bạn có thể nghe thấy mọi lời thì thầm của những người đã khuất. Họ gọi tên bạn. Họ biết bạn đang ở đâu.',
        'Và nếu bạn đáp lại — dù chỉ một lần — bạn sẽ trở thành một phần của màn đêm mãi mãi.',
      ],
    },
  ];

  function createReader() {
    const wrap = document.createElement('div');
    wrap.className = 'reader';
    wrap.setAttribute('role', 'dialog');
    wrap.setAttribute('aria-modal', 'true');
    wrap.setAttribute('aria-hidden', 'true');
    wrap.innerHTML = `
      <article class="reader-paper">
        <button class="icon-btn reader-close" aria-label="Đóng tài liệu">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 6l12 12M18 6L6 18"/></svg>
        </button>
        <h2 class="reader-title"></h2>
        <div class="reader-body"></div>
      </article>
    `;
    document.body.appendChild(wrap);
    return wrap;
  }

  let reader = null;

  function openReader(doc) {
    if (!reader) reader = createReader();
    reader.querySelector('.reader-title').textContent = doc.title;
    const body = reader.querySelector('.reader-body');
    body.innerHTML = '';
    doc.body.forEach((p) => {
      const el = document.createElement('p');
      el.textContent = p;
      body.appendChild(el);
    });
    reader.classList.add('open');
    reader.setAttribute('aria-hidden', 'false');
    if (A) A.play('whoosh');
    // Typewriter-lite: fade each paragraph in
    const ps = body.querySelectorAll('p');
    ps.forEach((p, i) => {
      p.style.opacity = '0';
      p.style.transform = 'translateY(8px)';
      setTimeout(() => {
        p.style.transition = 'opacity 400ms, transform 400ms';
        p.style.opacity = '1';
        p.style.transform = 'none';
      }, 120 + i * 260);
    });
    // close handlers
    const close = () => {
      reader.classList.remove('open');
      reader.setAttribute('aria-hidden', 'true');
    };
    reader.querySelector('.reader-close').onclick = close;
    reader.onclick = (e) => { if (e.target === reader) close(); };
    const onEsc = (e) => {
      if (e.key === 'Escape' && reader.classList.contains('open')) {
        close();
        window.removeEventListener('keydown', onEsc);
      }
    };
    window.addEventListener('keydown', onEsc);
    // try unlock "final midnight" if all three read
    try {
      const read = JSON.parse(localStorage.getItem('hn_docs_read_v1') || '[]');
      if (!read.includes(doc.id)) {
        read.push(doc.id);
        localStorage.setItem('hn_docs_read_v1', JSON.stringify(read));
        if (read.length >= 3) localStorage.setItem('hn_final_unlocked', '1');
      }
    } catch (e) {}
  }

  window.HNSecrets = {
    mount(root) {
      const hasForest = (() => { try { return JSON.parse(localStorage.getItem('hn_forest_relics_v1') || '[]').length >= 3; } catch (e) { return false; } })();
      const hasHouse = (() => { try { return JSON.parse(localStorage.getItem('hn_house_found_v1') || '[]').length >= 4; } catch (e) { return false; } })();

      // Auto-unlock final after viewing docs already (check)
      try {
        const read = JSON.parse(localStorage.getItem('hn_docs_read_v1') || '[]');
        if (read.length >= 3) localStorage.setItem('hn_final_unlocked', '1');
      } catch (e) {}

      root.innerHTML = `
        <section class="container page" aria-labelledby="secrets-h">
          <header class="page-head">
            <p class="eyebrow">AREA 04</p>
            <h2 id="secrets-h">SECRET <span style="color:var(--crimson)">ARCHIVE</span></h2>
            <p>Những tài liệu bị lãng quên trong thư viện cổ. Mỗi trang giấy là một mảnh của câu chuyện lớn hơn. Một số chỉ mở khi bạn đã khám phá đủ.</p>
          </header>
          <div class="secrets-grid" id="secrets-grid"></div>
        </section>
      `;

      const grid = root.querySelector('#secrets-grid');
      DOCS.forEach((doc) => {
        const unlocked = doc.unlock();
        const card = document.createElement('button');
        card.className = 'secret-doc' + (unlocked ? '' : ' locked');
        card.type = 'button';
        card.setAttribute('aria-label', unlocked ? 'Mở ' + doc.title : doc.title + ' — chưa mở khóa');
        card.innerHTML = `
          <span class="doc-eyebrow">${doc.eyebrow}${unlocked ? ' · UNLOCKED' : ' · LOCKED'}</span>
          <h3>${doc.title}</h3>
          <p>${doc.desc}</p>
          <span class="lock-tag">${unlocked ? 'OPEN DOCUMENT →' : 'EXPLORE MORE TO UNLOCK'}</span>
        `;
        if (unlocked) {
          card.addEventListener('click', () => openReader(doc));
        }
        grid.appendChild(card);
      });

      // Ghi chú tiến trình
      if (!hasHouse && !hasForest) {
        const hint = document.createElement('p');
        hint.style.cssText = 'grid-column:1/-1;color:var(--fog);font-family:var(--font-mono);font-size:0.75rem;letter-spacing:0.1em;text-align:center;padding:var(--sp-4) 0';
        hint.textContent = 'HINT: EXPLORE THE HOUSE & FOREST TO UNLOCK THE REST.';
        grid.appendChild(hint);
      }
    },
    unmount() {},
  };
})();