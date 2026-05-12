let lastBrightness = 128;
let warnVisible = false;

const warnBanner = document.getElementById('warnBanner');
const warnMsg = document.getElementById('warnMsg');

export function checkLighting(ctx, canvasW, canvasH) {
  const x0 = Math.floor(canvasW * 0.1);
  const y0 = Math.floor(canvasH * 0.1);
  const w = Math.floor(canvasW * 0.8);
  const h = Math.floor(canvasH * 0.8);
  const data = ctx.getImageData(x0, y0, w, h).data;

  const targetSamples = 3600; // 60x60
  const step = Math.max(1, Math.floor(data.length / 4 / targetSamples));
  let sum = 0, count = 0, darkPixels = 0, brightPixels = 0;

  for (let i = 0; i < data.length; i += 4 * step) {
    const l = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
    sum += l;
    count++;
    if (l < 30) darkPixels++;
    else if (l > 240) brightPixels++;
  }

  const avg = sum / count;
  lastBrightness = lastBrightness * 0.6 + avg * 0.4;
  const darkRatio = darkPixels / count;
  const brightRatio = brightPixels / count;

  let warning = null;
  if (lastBrightness < 45) {
    warning = 'Špatné osvětlení — je moc tma';
  } else if (lastBrightness > 220 && brightRatio > 0.5) {
    warning = 'Přepálený obraz — moc světla, ustup nebo nakloň kameru';
  } else if (darkRatio > 0.6) {
    warning = 'Většina obrazu je ve stínu';
  } else if (brightRatio > 0.35) {
    warning = 'Odlesky — vyhni se přímému světlu';
  }

  if (warning) {
    warnMsg.textContent = warning;
    if (!warnVisible) { warnBanner.classList.add('show'); warnVisible = true; }
  } else if (warnVisible) {
    warnBanner.classList.remove('show');
    warnVisible = false;
  }
}
