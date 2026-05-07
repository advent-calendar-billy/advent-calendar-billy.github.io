// Persistence: localStorage for small progress state, IndexedDB (via idb-keyval) for photo blobs.

import { get, set, del, keys } from 'https://cdn.jsdelivr.net/npm/idb-keyval@6.2.1/+esm';

const PROGRESS_KEY = 'tesoros:v1';
const PHOTO_PREFIX = 'photo:';

export function loadProgress() {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return { solvedIds: [], solvedWithHelp: [] };
    const p = JSON.parse(raw);
    return {
      solvedIds: Array.isArray(p.solvedIds) ? p.solvedIds : [],
      solvedWithHelp: Array.isArray(p.solvedWithHelp) ? p.solvedWithHelp : []
    };
  } catch {
    return { solvedIds: [], solvedWithHelp: [] };
  }
}

export function saveProgress(p) {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(p));
}

export function clearProgress() {
  localStorage.removeItem(PROGRESS_KEY);
}

const photoKey = (stopId) => `${PHOTO_PREFIX}${stopId}`;

export async function savePhoto(stopId, blob) {
  await set(photoKey(stopId), { blob, takenAt: Date.now() });
}

export async function loadPhoto(stopId) {
  return await get(photoKey(stopId));
}

export async function listPhotoIds() {
  const all = await keys();
  return all
    .filter(k => typeof k === 'string' && k.startsWith(PHOTO_PREFIX))
    .map(k => k.slice(PHOTO_PREFIX.length));
}

export async function clearPhotos() {
  const all = await keys();
  await Promise.all(
    all
      .filter(k => typeof k === 'string' && k.startsWith(PHOTO_PREFIX))
      .map(k => del(k))
  );
}
