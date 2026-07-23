/* Cartelera — collapsed text notes; click to expand. Videos are created
   lazily on first expand, so nothing hints which notes carry one. */
const board = document.getElementById('board');

POSTS.forEach((post) => {
  const card = document.createElement('article');
  card.className = 'post' + (post.pinned ? ' pinned' : '');

  const head = document.createElement('div');
  head.className = 'pHead';

  const title = document.createElement('div');
  title.className = 'pTitle';
  title.textContent = post.title;

  const meta = document.createElement('div');
  meta.className = 'pMeta';
  meta.textContent = [post.author, post.unit && 'Depto ' + post.unit, post.date]
    .filter(Boolean).join(' · ');

  head.append(title, meta);

  const body = document.createElement('div');
  body.className = 'pBody';
  body.textContent = post.body;

  card.append(head, body);

  let videoBuilt = false;
  function buildVideo() {
    if (videoBuilt || !post.video) return;
    videoBuilt = true;
    const wrap = document.createElement('div');
    wrap.className = 'pVideo';
    const video = document.createElement('video');
    video.controls = true;
    video.preload = 'metadata';
    video.playsInline = true;
    video.src = '../video/' + post.video;
    video.addEventListener('error', () => {
      const missing = document.createElement('div');
      missing.className = 'noVideo';
      missing.textContent = 'video no disponible (' + post.video + ')';
      wrap.replaceChildren(missing);
    });
    wrap.appendChild(video);
    card.appendChild(wrap);
  }

  head.addEventListener('click', () => {
    const open = card.classList.toggle('expanded');
    if (open) buildVideo();
    else card.querySelectorAll('video').forEach((v) => v.pause());
  });

  board.appendChild(card);
});
