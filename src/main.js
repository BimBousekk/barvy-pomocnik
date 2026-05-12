import './style.css';
import * as cam from './camera.js';
const { startCamera, setFrozen: camSetFrozen, setMode, getVideo, getCanvas } = cam;
import { setFrozen as uiSetFrozen, showStatus, hideTextResult } from './ui.js';
import { runOCR } from './ocr.js';
import { translateText } from './translate.js';
import { nameColor, toHex } from './color.js';

// Keep UI and camera freeze state in sync
function setFrozen(f) {
  camSetFrozen(f);
  uiSetFrozen(f);
}

// ===== TABS =====
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    const m = tab.dataset.mode;
    document.body.dataset.mode = m;
    setMode(m);
    hideTextResult();
    setFrozen(false);
    document.getElementById('actionBtn').textContent = m === 'color' ? 'Zachytit barvu' : 'Skenovat text';
  });
});

// ===== FREEZE =====
document.getElementById('freezeBtn').addEventListener('click', () => {
  const frozen = document.body.dataset.frozen === 'true';
  setFrozen(!frozen);
});

// ===== SCAN / ACTION BUTTON =====
document.getElementById('actionBtn').addEventListener('click', async () => {
  const mode = document.body.dataset.mode;
  if (mode === 'text') {
    const text = await runOCR(getVideo(), getCanvas());
    if (text) {
      // Store for translate/copy
      document.getElementById('actionBtn').dataset.lastText = text;
    }
  }
});

// ===== TEXT RESULT ACTIONS =====
document.getElementById('copyBtn').addEventListener('click', () => {
  const text = document.getElementById('textContent').textContent;
  if (!text || text === '—') return;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => showStatus('Zkopírováno', 1500));
  } else {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    showStatus('Zkopírováno', 1500);
  }
});

document.getElementById('translateBtn').addEventListener('click', () => {
  const text = document.getElementById('actionBtn').dataset.lastText || '';
  translateText(text);
});

document.getElementById('closeBtn').addEventListener('click', () => {
  hideTextResult();
  setFrozen(false);
});

// ===== COLOR PANEL: tap to copy =====
document.getElementById('colorInfo').addEventListener('click', () => {
  // cam.lastRGB is a live binding to the let-exported variable in camera.js
  const rgb = cam.lastRGB;
  if (!rgb) return;
  const [r, g, b] = rgb;
  const hex = toHex(r, g, b);
  const txt = `${nameColor(r, g, b)} · ${hex} · RGB(${r}, ${g}, ${b})`;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(txt);
    showStatus('Barva zkopírována', 1300);
  }
});

// ===== START =====
startCamera();
