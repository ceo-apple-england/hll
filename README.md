# HALLOWEEN NIGHTMARE — ENTER THE DARKNESS

Website Halloween SPA cao cấp với phong cách Gothic Horror / Cinematic.

## Công nghệ
- HTML5, CSS3, JavaScript ES6+ thuần (không framework).
- Canvas API (particle, forest scene).
- Web Audio API (ambient synth + SFX).
- Hash routing SPA, History API.
- LocalStorage (settings, tiến trình, kỷ lục).
- Fullscreen API, Intersection Observer.
- Google Fonts (Creepster, Cinzel Decorative, Nosifer, Inter, Montserrat, Space Mono).

## Cấu trúc
- `index.html` — entry duy nhất.
- `css/` — reset, variables, global, animations, components, pages, responsive.
- `js/` — app, router, transitions, particles, audio-manager, settings, games, house, forest, secrets, gallery.
- `assets/audio/` — tùy chọn (xem README.txt).

## Chạy website

### Cách 1 — Máy chủ tĩnh (khuyến nghị)
```bash
# Python 3
cd halloween-nightmare
python3 -m http.server 8080
# → http://localhost:8080