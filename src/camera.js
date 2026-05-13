import { nameColor, toHex } from './color.js';
import { checkLighting } from './lighting.js';
import { updateColorPanel, showError } from './ui.js';

const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d', { willReadFrequently: true });

let frozen = false;
let mode = 'color';
let lightCounter = 0;
export let lastRGB = null;

export function setFrozen(f) {
  frozen = f;
  // Pause/play the video element so the user can SEE the freeze.
  if (video.srcObject) {
    if (f) video.pause();
    else video.play().catch(() => {});
  }
}
export function setMode(m) { mode = m; }
export function getVideo() { return video; }
export function getCanvas() { return canvas; }

export async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } },
      audio: false,
    });
    video.srcObject = stream;
    await video.play();
    requestAnimationFrame(loop);
  } catch (e) {
    showError(
      'Nelze přistoupit ke kameře.\n\n' + e.message +
      '\n\nNa iPhonu otevři tuto stránku v Safari přes HTTPS a povol přístup ke kameře.'
    );
  }
}

function loop() {
  if (!frozen && video.videoWidth > 0) {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    if (mode === 'color') {
      const cx = Math.floor(canvas.width / 2);
      const cy = Math.floor(canvas.height / 2);
      const data = ctx.getImageData(cx - 3, cy - 3, 7, 7).data;
      let r = 0, g = 0, b = 0;
      for (let i = 0; i < data.length; i += 4) {
        r += data[i]; g += data[i + 1]; b += data[i + 2];
      }
      const n = data.length / 4;
      const avgR = Math.round(r / n), avgG = Math.round(g / n), avgB = Math.round(b / n);
      lastRGB = [avgR, avgG, avgB];
      updateColorPanel(avgR, avgG, avgB, nameColor(avgR, avgG, avgB), toHex(avgR, avgG, avgB));
    }

    lightCounter++;
    if (lightCounter >= 15) {
      lightCounter = 0;
      checkLighting(ctx, canvas.width, canvas.height);
    }
  }
  requestAnimationFrame(loop);
}
