// Persistence: localStorage for small progress state, IndexedDB (via idb-keyval) for photo blobs.
// Two photo namespaces per stop: "selfie" (lock 1) and "pwdphoto" (lock 2 for photo-pwd stops).

import { get, set, del, keys } from 'https://cdn.jsdelivr.net/npm/idb-keyval@6.2.1/+esm';

const PROGRESS_KEY = 'tesoros:v1';
const SELFIE_PREFIX = 'selfie:';
const PWDPHOTO_PREFIX = 'pwdphoto:';

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

const selfieKey = (stopId) => `${SELFIE_PREFIX}${stopId}`;
const pwdPhotoKey = (stopId) => `${PWDPHOTO_PREFIX}${stopId}`;

export async function saveSelfie(stopId, blob, meta = {}) {
  await set(selfieKey(stopId), { blob, takenAt: Date.now(), ...meta });
}
export async function loadSelfie(stopId) {
  return await get(selfieKey(stopId));
}
export async function listSelfieIds() {
  const all = await keys();
  return all
    .filter(k => typeof k === 'string' && k.startsWith(SELFIE_PREFIX))
    .map(k => k.slice(SELFIE_PREFIX.length));
}

export async function savePwdPhoto(stopId, blob, meta = {}) {
  await set(pwdPhotoKey(stopId), { blob, takenAt: Date.now(), ...meta });
}
export async function loadPwdPhoto(stopId) {
  return await get(pwdPhotoKey(stopId));
}
export async function listPwdPhotoIds() {
  const all = await keys();
  return all
    .filter(k => typeof k === 'string' && k.startsWith(PWDPHOTO_PREFIX))
    .map(k => k.slice(PWDPHOTO_PREFIX.length));
}

export async function clearAllPhotos() {
  const all = await keys();
  await Promise.all(
    all
      .filter(k => typeof k === 'string' && (k.startsWith(SELFIE_PREFIX) || k.startsWith(PWDPHOTO_PREFIX)))
      .map(k => del(k))
  );
}
