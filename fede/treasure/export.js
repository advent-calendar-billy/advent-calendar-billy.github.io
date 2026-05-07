// End-of-hunt zip export. Uses JSZip loaded as a global from the CDN <script> tag.

import { listPhotoIds, loadPhoto } from './storage.js';
import { HUNT } from './data.js';

const pad2 = (n) => String(n).padStart(2, '0');

function safeFilename(s) {
  return String(s)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 60) || 'foto';
}

export async function exportZip() {
  if (typeof JSZip === 'undefined') {
    throw new Error('JSZip no se cargó');
  }
  const zip = new JSZip();
  const ids = await listPhotoIds();
  const idToStop = new Map(HUNT.stops.map((s, i) => [s.id, { stop: s, index: i + 1 }]));

  const lines = [
    'Búsqueda de los Tesoros',
    'fotos de Fede',
    '',
    'Paradas:'
  ];
  HUNT.stops.forEach((s, i) => {
    lines.push(`  ${pad2(i + 1)}. ${s.name}`);
  });
  lines.push('', 'Fotos incluidas:');

  const seenIndices = new Set();
  for (const id of ids) {
    const rec = await loadPhoto(id);
    if (!rec) continue;
    const meta = idToStop.get(id);
    const i = meta ? meta.index : 0;
    seenIndices.add(i);
    const name = meta ? safeFilename(meta.stop.name) : id;
    const ts = new Date(rec.takenAt).toISOString();
    lines.push(`  ${pad2(i)}-${name}.jpg — ${ts}`);
    zip.file(`${pad2(i)}-${name}.jpg`, rec.blob);
  }

  HUNT.stops.forEach((s, i) => {
    const idx = i + 1;
    if (!seenIndices.has(idx)) {
      lines.push(`  (sin foto) ${pad2(idx)}. ${s.name}`);
    }
  });

  zip.file('README.txt', lines.join('\n'));

  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'tesoros-fede.zip';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
