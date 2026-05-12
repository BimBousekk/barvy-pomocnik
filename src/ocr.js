import Tesseract from 'tesseract.js';
import { cleanOcrResult } from './ocr-cleanup.js';
import { showStatus, hideStatus, showTextResult, setFrozen } from './ui.js';

export async function runOCR(video, canvas) {
  showStatus('<span class="spinner"></span>Skenuji text…');
  document.getElementById('actionBtn').disabled = true;
  setFrozen(true);

  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.drawImage(video, 0, 0);

  // Crop to center 70% to reduce edge noise
  const cropW = Math.floor(canvas.width * 0.7);
  const cropH = Math.floor(canvas.height * 0.7);
  const cropX = Math.floor((canvas.width - cropW) / 2);
  const cropY = Math.floor((canvas.height - cropH) / 2);
  const imgData = ctx.getImageData(cropX, cropY, cropW, cropH);
  const px = imgData.data;

  // Grayscale + contrast boost for better OCR accuracy
  for (let i = 0; i < px.length; i += 4) {
    const gray = 0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2];
    const boosted = Math.max(0, Math.min(255, (gray - 128) * 1.4 + 128));
    px[i] = px[i + 1] = px[i + 2] = boosted;
  }

  const ocrCanvas = document.createElement('canvas');
  ocrCanvas.width = cropW;
  ocrCanvas.height = cropH;
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
