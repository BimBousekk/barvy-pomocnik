import Tesseract from 'tesseract.js';
import { cleanOcrResult } from './ocr-cleanup.js';
import { showStatus, hideStatus, showTextResult, setFrozen } from './ui.js';
import { getSelectionVideoRect } from './selection.js';

export async function runOCR(video, canvas) {
  showStatus('<span class="spinner"></span>Skenuji text…');
  document.getElementById('actionBtn').disabled = true;
  setFrozen(true);

  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.drawImage(video, 0, 0);

  // Get region the user selected (in video source pixels).
  const sel = getSelectionVideoRect(video);
  if (!sel || sel.w < 20 || sel.h < 20) {
    showStatus('Vyber větší oblast pro skenování', 2500);
    document.getElementById('actionBtn').disabled = false;
    return null;
  }

  const imgData = ctx.getImageData(sel.x, sel.y, sel.w, sel.h);
  const px = imgData.data;

  // Mild grayscale + gentle contrast lift.
  // 1.15 keeps diacritics intact (a higher curve was eating "í", "š", etc.).
  for (let i = 0; i < px.length; i += 4) {
    const gray = 0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2];
    const boosted = Math.max(0, Math.min(255, (gray - 128) * 1.15 + 128));
    px[i] = px[i + 1] = px[i + 2] = boosted;
  }

  const ocrCanvas = document.createElement('canvas');
  ocrCanvas.width = sel.w;
  ocrCanvas.height = sel.h;
  ocrCanvas.getContext('2d').putImageData(imgData, 0, 0);

  try {
    const result = await Tesseract.recognize(ocrCanvas, 'ces+eng');
    const cleaned = cleanOcrResult(result.data);
    if (!cleaned) {
      showStatus('Nenalezen žádný text — zkus přiblížit nebo lepší světlo', 2800);
    } else {
      showTextResult(cleaned);
      hideStatus();
    }
    return cleaned;
  } catch (e) {
    showStatus('Chyba OCR: ' + e.message, 3000);
    return null;
  } finally {
    document.getElementById('actionBtn').disabled = false;
  }
}
