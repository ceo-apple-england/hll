/* Additional responsive tweaks — loaded last */
@media (max-width: 1280px) {
  .container { padding-inline: 1rem; }
}
@media (max-width: 768px) {
  :root { --header-h: 62px; }
  .intro-title { font-size: clamp(2rem, 11vw, 3.5rem); }
  .explore-grid { grid-template-columns: 1fr; }
  .games-grid { grid-template-columns: 1fr; }
  .secrets-grid { grid-template-columns: 1fr; }
  .gallery-grid { grid-template-columns: repeat(2, 1fr); }
  .door { aspect-ratio: 2 / 3; }
  .btn-skip { bottom: 16px; right: 16px; }
}
@media (max-width: 360px) {
  .gallery-grid { grid-template-columns: 1fr; }
  .memory-grid { gap: 4px; }
  .doors-row { gap: 6px; }
}
/* disable hover-dependent effects on touch */
@media (hover: none) {
  .explore-card:hover::before { transform: none; }
  .gallery-tile:hover img { transform: none; }
  .house-hotspot:hover { transform: none; }
}