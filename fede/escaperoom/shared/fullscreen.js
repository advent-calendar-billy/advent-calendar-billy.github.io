/* Injects the discreet fullscreen toggle every player page shares. */
(() => {
  const btn = document.createElement('button');
  btn.className = 'esc-fullscreen';
  btn.type = 'button';
  btn.title = 'Pantalla completa';
  btn.textContent = '⛶'; /* ⛶ */
  btn.addEventListener('click', () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen().catch(() => {});
  });
  window.addEventListener('DOMContentLoaded', () => document.body.appendChild(btn));
})();
