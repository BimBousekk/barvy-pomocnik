// Tesseract on camera input often returns confidence 30–60 even for correct words.
// Conservative thresholds tuned to keep real text while still cutting obvious junk.
const MIN_WORD_CONFIDENCE = 30;
const MIN_LINE_CONFIDENCE = 25;

// Czech single-letter words that are valid (not noise)
const VALID_SINGLE = /^[aiouAIOUsvkzSVKZ]$/;

// Treat common punctuation as "not symbols" so price tags like "199,90 Kč" survive.
const JUNK_SYMBOL_RE = /[^\p{L}\p{N}\s.,!?:;\-–—()"„""''/%&+°]/gu;

export function cleanOcrResult(data) {
  const lines = data.lines || [];
  const cleanedLines = [];

  for (const line of lines) {
    if ((line.confidence || 0) < MIN_LINE_CONFIDENCE) continue;

    const goodWords = (line.words || []).filter(w => {
      if ((w.confidence || 0) < MIN_WORD_CONFIDENCE) return false;
      const t = (w.text || '').trim();
      if (!t) return false;
      if (!/[\p{L}\p{N}]/u.test(t)) return false;
      if (t.length === 1 && !VALID_SINGLE.test(t)) return false;
      return true;
    });

    if (goodWords.length === 0) continue;

    const lineText = goodWords.map(w => w.text).join(' ').trim();
    // Only "weird" symbols count — keep legitimate punctuation.
    const junkRatio = (lineText.match(JUNK_SYMBOL_RE) || []).length / lineText.length;
    if (junkRatio > 0.5) continue;
    if (lineText.length < 2) continue;

    cleanedLines.push(lineText);
  }

  const cleaned = cleanedLines
    .join('\n')
    .split('\n')
    .map(l => l.replace(/^\s*[^\p{L}\p{N}]+/u, '').replace(/\s{2,}/g, ' ').trim())
    .filter(l => l.length >= 2)
    .join('\n');

  // Fallback: if our filter ate everything but Tesseract did find something,
  // return the raw text. Better to show messy result than nothing.
  if (!cleaned && data.text && data.text.trim().length >= 2) {
    return data.text.trim();
  }
  return cleaned;
}
