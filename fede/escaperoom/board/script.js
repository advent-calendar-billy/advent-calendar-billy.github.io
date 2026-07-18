/* Cartelera — fully static render of posts.js. */
const board = document.getElementById('board');

POSTS.forEach((post) => {
  const card = document.createElement('article');
  card.className = 'post' + (post.pinned ? ' pinned' : '');

  const title = document.createElement('div');
  title.className = 'pTitle';
  title.textContent = post.title;

  const meta = document.createElement('div');
  meta.className = 'pMeta';
  meta.textContent = [post.author, post.unit && 'Depto ' + post.unit, post.date]
    .filter(Boolean).join(' · ');

  const body = document.createElement('div');
  body.className = 'pBody';
  body.textContent = post.body;

  card.append(title, meta, body);

  if (post.video) {
    const wrap = document.createElement('div');
    wrap.className = 'pVideo';
    const video = document.createElement('video');
    video.controls = true;
    video.preload = 'none';
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

  board.appendChild(card);
});
