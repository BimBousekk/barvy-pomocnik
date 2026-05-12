import { showStatus, hideStatus, showTranslation } from './ui.js';

// Detects Czech by presence of diacritics unique to Czech
function isCzech(text) {
  return /[áčďéěíňóřšťúůýž]/i.test(text);
}

export async function translateText(text) {
  if (!text) return;
  showStatus('<span class="spinner"></span>Překládám…');
  try {
    const langPair = isCzech(text) ? 'cs|en' : 'en|cs';
    const res = await fetch(
      'https://api.mymemory.translated.net/get?q=' +
      encodeURIComponent(text.slice(0, 500)) + '&langpair=' + langPair
    );
    const json = await res.json();
    const translated = json?.responseData?.translatedText || '(překlad se nezdařil)';
    showTranslation(text, translated);
    hideStatus();
  } catch {
    showStatus('Překlad selhal', 2000);
  }
}
