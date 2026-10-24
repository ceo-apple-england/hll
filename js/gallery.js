/* ============================================================
   HALLOWEEN GALLERY — Grid + Lightbox
   Dùng ảnh SVG data-URI tự tạo (không phụ thuộc file ngoài).
   ============================================================ */
(function () {
  'use strict';

  const S = window.HNSettings;
  const A = window.HNAudio;

  // SVG generators cho từng chủ đề — đảm bảo luôn có ảnh, không lỗi 404
  function svgURI(inner, w = 800, h = 600) {
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${w} ${h}' width='${w}' height='${h}'>${inner}</svg>`;
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  }

  const ART = [
    { title: 'PUMPKIN LANTERN', tag: 'Pumpkin', url: svgURI(`
      <defs><radialGradient id='g' cx='50%' cy='40%'><stop offset='0%' stop-color='#FF7518'/><stop offset='60%' stop-color='#8B0000'/><stop offset='100%' stop-color='#050507'/></radialGradient></defs>
      <rect width='800' height='600' fill='#050507'/>
      <circle cx='400' cy='320' r='260' fill='url(#g)' opacity='0.35'/>
      <g transform='translate(400,320)'>
        <ellipse cx='0' cy='0' rx='140' ry='120' fill='#FF7518'/>
        <path d='M0,-130 L8,-150 L-8,-150 Z' fill='#2e1a0a'/>
        <path d='M-70,-20 L-20,-40 L-30,20 Z M70,-20 L20,-40 L30,20 Z M0,10 L-30,60 L30,60 Z' fill='#050507'/>
        <ellipse cx='0' cy='0' rx='140' ry='120' fill='none' stroke='#2e1a0a' stroke-width='3'/>
      </g>`), alt: 'Bí ngô ma thuật phát sáng' },
    { title: 'CASTLE UNDER MOON', tag: 'Castle', url: svgURI(`
      <rect width='800' height='600' fill='#050507'/>
      <circle cx='600' cy='150' r='90' fill='#D10F2F' opacity='0.9'/>
      <circle cx='600' cy='150' r='140' fill='#8B0000' opacity='0.25'/>
      <g fill='#101014'>
        <rect x='100' y='320' width='120' height='280'/>
        <rect x='240' y='260' width='90' height='340'/>
        <rect x='350' y='200' width='140' height='400'/>
        <rect x='500' y='300' width='100' height='300'/>
        <rect x='620' y='280' width='80' height='320'/>
      </g>
      <g fill='#FF7518' opacity='0.85'>
        <rect x='380' y='260' width='12' height='20'/><rect x='420' y='300' width='12' height='20'/>
        <rect x='260' y='310' width='10' height='18'/><rect x='520' y='350' width='10' height='18'/>
      </g>`), alt: 'Lâu đài cổ dưới ánh trăng đỏ' },
    { title: 'MISTY FOREST', tag: 'Forest', url: svgURI(`
      <rect width='800' height='600' fill='#0a0a12'/>
      <g stroke='#101014' stroke-width='8' fill='none'>
        <path d='M100,600 Q110,300 130,100'/><path d='M220,600 Q210,350 200,80'/>
        <path d='M400,600 Q420,320 410,60'/><path d='M580,600 Q570,300 590,90'/>
        <path d='M700,600 Q690,350 680,120'/>
      </g>
      <g opacity='0.35' fill='#777783'>
        <ellipse cx='400' cy='420' rx='400' ry='40'/>
        <ellipse cx='300' cy='480' rx='350' ry='35'/>
      </g>`), alt: 'Khu rừng sương mù' },
    { title: 'THE HAUNTED HOUSE', tag: 'House', url: svgURI(`
      <rect width='800' height='600' fill='#050507'/>
      <g fill='#101014' stroke='#1a1a22' stroke-width='2'>
        <rect x='200' y='300' width='400' height='280'/>
        <polygon points='180,300 400,140 620,300'/>
        <rect x='300' y='360' width='60' height='80'/>
        <rect x='440' y='360' width='60' height='80'/>
        <rect x='360' y='460' width='80' height='120'/>
      </g>
      <g fill='#FF7518'>
        <rect x='315' y='380' width='30' height='40'/>
        <rect x='455' y='380' width='30' height='40'/>
      </g>`), alt: 'Ngôi nhà ma' },
    { title: 'THE WANDERING GHOST', tag: 'Ghost', url: svgURI(`
      <rect width='800' height='600' fill='#050507'/>
      <g transform='translate(400,300)' opacity='0.85'>
        <ellipse cx='0' cy='-40' rx='110' ry='130' fill='#e6e6f0' opacity='0.7'/>
        <path d='M-100,20 Q-100,180 -80,220 Q-40,190 0,220 Q40,190 80,220 Q100,180 100,20 Z' fill='#e6e6f0' opacity='0.7'/>
        <circle cx='-30' cy='-50' r='8' fill='#101014'/>
        <circle cx='30' cy='-50' r='8' fill='#101014'/>
      </g>`), alt: 'Bóng ma lang thang' },
    { title: 'HALLOWEEN LANTERN', tag: 'Lantern', url: svgURI(`
      <rect width='800' height='600' fill='#050507'/>
      <circle cx='400' cy='300' r='160' fill='#FF7518' opacity='0.2'/>
      <circle cx='400' cy='300' r='80' fill='#FF7518' opacity='0.6'/>
      <circle cx='400' cy='300' r='30' fill='#fff5d6'/>
      <g stroke='#101014' stroke-width='6' fill='none'>
        <path d='M400,120 V220 M400,380 V480 M220,300 H320 M480,300 H580'/>
      </g>`), alt: 'Đèn lồng Halloween' },
    { title: 'RAVENS OVERHEAD', tag: 'Ravens', url: svgURI(`
      <rect width='800' height='600' fill='#050507'/>
      <circle cx='200' cy='180' r='60' fill='#8B0000' opacity='0.4'/>
      <g fill='#050507' stroke='#2a2a32' stroke-width='1'>
        <path d='M300,200 q20,-15 40,0 q-20,-6 -40,0 z'/>
        <path d='M420,140 q25,-20 50,0 q-25,-8 -50,0 z'/>
        <path d='M520,240 q30,-25 60,0 q-30,-10 -60,0 z'/>
        <path d='M350,320 q22,-18 44,0 q-22,-8 -44,0 z'/>
      </g>`), alt: 'Những con quạ bay' },
    { title: 'OLD GRAVEYARD', tag: 'Graveyard', url: svgURI(`
      <rect width='800' height='600' fill='#050507'/>
      <g fill='#101014' stroke='#1a1a22' stroke-width='2'>
        <path d='M120,600 V400 Q120,360 150,360 Q180,360 180,400 V600 Z'/>
        <path d='M260,600 V430 Q260,400 285,400 Q310,400 310,430 V600 Z'/>
        <path d='M400,600 V380 Q400,340 440,340 Q480,340 480,380 V600 Z'/>
        <path d='M560,600 V420 Q560,390 585,390 Q610,390 610,420 V600 Z'/>
      </g>
      <g fill='#777783' opacity='0.4'>
        <ellipse cx='400' cy='520' rx='400' ry='30'/>
      </g>`), alt: 'Nghĩa trang cổ' },
  ];

  let lbIndex = 0;

  function createLightbox() {
    const wrap = document.createElement('div');
    wrap.className = 'lightbox';
    wrap.setAttribute('role', 'dialog');
    wrap.setAttribute('aria-modal', 'true');
    wrap.setAttribute('aria-hidden', 'true');
    wrap.innerHTML = `
      <button class="lb-close" aria-label="Đóng ảnh">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 6l12 12M18 6L6 18"/></svg>
      </button>
      <button class="lb-prev" aria-label="Ảnh trước">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M15 6l-6 6 6 6"/></svg>
      </button>
      <img alt="" />
      <button class="lb-next" aria-label="Ảnh sau">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 6l6 6-6 6"/></svg>
      </button>
    `;
    document.body.appendChild(wrap);
    return wrap;
  }

  let lightbox = null;

  function openLightbox(index) {
    if (!lightbox) lightbox = createLightbox();
    lbIndex = (index + ART.length) % ART.length;
    const img = lightbox.querySelector('img');
    img.src = ART[lbIndex].url;
    img.alt = ART[lbIndex].alt;
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    if (A) A.play('click');
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
  }

  function bindLightbox() {
    if (!lightbox) return;
    lightbox.querySelector('.lb-close').onclick = closeLightbox;
    lightbox.querySelector('.lb-prev').onclick = () => openLightbox(lbIndex - 1);
    lightbox.querySelector('.lb-next').onclick = () => openLightbox(lbIndex + 1);
    lightbox.onclick = (e) => { if (e.target === lightbox) closeLightbox(); };
    window.addEventListener('keydown', (e) => {
      if (!lightbox || !lightbox.classList.contains('open')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') openLightbox(lbIndex - 1);
      if (e.key === 'ArrowRight') openLightbox(lbIndex + 1);
    });
  }

  window.HNGallery = {
    mount(root) {
      root.innerHTML = `
        <section class="container page" aria-labelledby="gallery-h">
          <header class="page-head">
            <p class="eyebrow">AREA 05</p>
            <h2 id="gallery-h">HALLOWEEN <span style="color:var(--crimson)">GALLERY</span></h2>
            <p>Những hình ảnh được lưu giữ từ thị trấn bị bỏ hoang. Nhấn vào để xem toàn màn hình. Dùng ← → để chuyển ảnh, Esc để đóng.</p>
          </header>
          <div class="gallery-grid" id="gallery-grid"></div>
        </section>
      `;
      const grid = root.querySelector('#gallery-grid');
      ART.forEach((a, i) => {
        const tile = document.createElement('button');
        tile.className = 'gallery-tile';
        tile.type = 'button';
        tile.setAttribute('aria-label', 'Mở ảnh ' + a.title);
        const img = document.createElement('img');
        img.src = a.url;
        img.alt = a.alt;
        img.loading = 'lazy';
        const cap = document.createElement('span');
        cap.className = 'tile-caption';
        cap.textContent = a.title;
        tile.append(img, cap);
        tile.addEventListener('click', () => openLightbox(i));
        grid.appendChild(tile);
      });
      bindLightbox();
    },
    unmount() {},
  };
})();