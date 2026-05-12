const MIN_WORD_CONFIDENCE = 60;
const MIN_LINE_CONFIDENCE = 50;

// Czech single-letter words that are valid (not noise)
const VALID_SINGLE = /^[aiouAIOUsvkzSVKZ]$/;

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
    const symbolRatio = (lineText.match(/[^\p{L}\p{N}\s]/gu) || []).length / lineText.length;
    if (symbolRatio > 0.4) continue;
    if (lineText.length < 2) continue;

    cleanedLines.push(lineText);
  }

  return cleanedLines
    .join('\n')
    .split('\n')
    .map(l => l.replace(/^\s*[^\p{L}\p{N}]+/u, '').replace(/\s{2,}/g, ' ').trim())
    .filter(l => l.length >= 2)
    .join('\n');
}
