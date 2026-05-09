// Lazy-loaded face detection for the two-lock submission flow.
// Loads @vladmandic/face-api (a maintained face-api.js fork) + the smallest models we need
// only on the first selfie/photo-pwd attempt. Models cache via the browser's HTTP cache.

const FACEAPI_SRC = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.13/dist/face-api.js';
const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.13/model';

let _ready = null;

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (window.faceapi) return resolve();
    const s = document.createElement('script');
    s.src = src;
    s.async = true;
    s.crossOrigin = 'anonymous';
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('face-api script failed to load'));
    document.head.appendChild(s);
  });
}

export function ensureFaceModels() {
  if (_ready) return _ready;
  _ready = (async () => {
    await loadScript(FACEAPI_SRC);
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
    ]);
  })().catch(err => { _ready = null; throw err; });
  return _ready;
}

function blobToImage(blob) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('image load failed')); };
    img.src = url;
  });
}

export async function detectFaces(blob) {
  await ensureFaceModels();
  const img = await blobToImage(blob);
  const opts = new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.4 });
  return await faceapi.detectAllFaces(img, opts).withFaceExpressions();
}

export function countFaces(detections) {
  return detections.length;
}

export function hasSmile(detections, threshold = 0.65) {
  return detections.some(d => (d.expressions && d.expressions.happy) >= threshold);
}

export function summarize(detections) {
  return {
    faces: detections.length,
    happiest: detections.reduce((max, d) => Math.max(max, d.expressions?.happy ?? 0), 0)
  };
}
