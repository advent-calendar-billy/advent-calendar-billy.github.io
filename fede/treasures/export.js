// End-of-hunt zip export. Uses JSZip loaded as a global from the CDN <script> tag.

import { listSelfieIds, loadSelfie, listPwdPhotoIds, loadPwdPhoto } from './storage.js';
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
  if (typeof JSZip === 'undefined') throw new Error('JSZip no se cargó');
  const zip = new JSZip();
  const idxByStop = new Map(HUNT.stops.map((s, i) => [s.id, { stop: s, index: i + 1 }]));

  const lines = [
    'Búsqueda de los Tesoros',
    'fotos de Fede',
    '',
    'Paradas:'
  ];
  HUNT.stops.forEach((s, i) => {
    lines.push(`  ${pad2(i + 1)}. ${s.name} (${s.passwordType === 'photo-smile' ? 'foto-pwd' : 'texto-pwd'})`);
  });
  lines.push('');

  // selfies
  const selfieFolder = zip.folder('selfies');
  const selfieIds = await listSelfieIds();
  const seenSelfie = new Set();
  lines.push('Selfies incluidas:');
  for (const id of selfieIds) {
    const rec = await loadSelfie(id);
    if (!rec) continue;
    const meta = idxByStop.get(id);
    const i = meta ? meta.index : 0;
    seenSelfie.add(i);
    const name = meta ? safeFilename(meta.stop.name) : id;
    const ts = new Date(rec.takenAt).toISOString();
    const tag = (rec.faces != null) ? ` · ${rec.faces} cara${rec.faces === 1 ? '' : 's'}` : '';
    lines.push(`  selfies/${pad2(i)}-${name}.jpg — ${ts}${tag}`);
    selfieFolder.file(`${pad2(i)}-${name}.jpg`, rec.blob);
  }
  HUNT.stops.forEach((s, i) => {
    const idx = i + 1;
    if (!seenSelfie.has(idx)) lines.push(`  (sin selfie) ${pad2(idx)}. ${s.name}`);
  });
  lines.push('');

  // pwd photos (photo-smile stops)
  const pwdIds = await listPwdPhotoIds();
  if (pwdIds.length) {
    const pwdFolder = zip.folder('contrasenas-foto');
    lines.push('Fotos-contraseña incluidas:');
    for (const id of pwdIds) {
      const rec = await loadPwdPhoto(id);
      if (!rec) continue;
      const meta = idxByStop.get(id);
      const i = meta ? meta.index : 0;
      const name = meta ? safeFilename(meta.stop.name) : id;
      const ts = new Date(rec.takenAt).toISOString();
      const tag = (rec.happiest != null) ? ` · sonrisa ${(rec.happiest * 100) | 0}%` : '';
      lines.push(`  contrasenas-foto/${pad2(i)}-${name}.jpg — ${ts}${tag}`);
      pwdFolder.file(`${pad2(i)}-${name}.jpg`, rec.blob);
    }
    lines.push('');
  }

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
